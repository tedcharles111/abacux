
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { MessageCircle, X, Mic, Send, Headset, ShieldCheck, Lock, Terminal } from 'lucide-react';
import { Button } from './ui';
import { api } from '../services/api';
import { UserRole, User } from '../types';

interface LiveChatWidgetProps {
  currentUser: User | null;
}

export const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState('');
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  const queryNodeStatus: FunctionDeclaration = {
    name: 'queryNodeStatus',
    parameters: {
      type: Type.OBJECT,
      description: 'Check if a user is registered on the AbacusX network and their current KYC status. PRIVILEGED ACCESS ONLY.',
      properties: {
        email: { type: Type.STRING, description: 'The email address of the node to query.' }
      },
      required: ['email']
    }
  };

  const getSystemTelemetry: FunctionDeclaration = {
    name: 'getSystemTelemetry',
    parameters: {
      type: Type.OBJECT,
      description: 'Retrieve the most recent audit logs from the kernel. PRIVILEGED ACCESS ONLY.',
      properties: {
        count: { type: Type.INTEGER, description: 'Number of recent logs to retrieve.' }
      }
    }
  };

  const startLiveSession = async () => {
    if (!process.env.API_KEY) {
      console.error("Missing API Key for Live Support");
      return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            const source = audioContextRef.current!.createMediaStreamSource(streamRef.current!);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.toolCall?.functionCalls) {
              for (const fc of msg.toolCall.functionCalls) {
                // SECURITY CHECK: All tools require Admin role
                if (currentUser?.role !== UserRole.ADMIN) {
                  sessionPromise.then(s => s.sendToolResponse({
                    functionResponses: { 
                      id: fc.id, 
                      name: fc.name, 
                      response: { result: 'ERROR: ACCESS_DENIED. This operation requires Institutional Security Clearance.' } 
                    }
                  }));
                  continue;
                }

                if (fc.name === 'queryNodeStatus') {
                  const users = await api.getUsers();
                  const args = fc.args as { email?: string };
                  const found = users.find(u => u.email.toLowerCase() === (args?.email || '').toLowerCase());
                  const result = found ? `SUCCESS: Node ${found.fullName} found. KYC: ${found.kycStatus}.` : 'FAILURE: Node not found.';
                  sessionPromise.then(s => s.sendToolResponse({
                    functionResponses: { id: fc.id, name: fc.name, response: { result } }
                  }));
                } else if (fc.name === 'getSystemTelemetry') {
                  const logs = await api.getSystemLogs();
                  const args = fc.args as { count?: number };
                  const result = JSON.stringify(logs.slice(0, args?.count || 5));
                  sessionPromise.then(s => s.sendToolResponse({
                    functionResponses: { id: fc.id, name: fc.name, response: { result } }
                  }));
                }
              }
            }

            if (msg.serverContent?.outputTranscription?.text) {
              setTranscription(prev => prev + msg.serverContent!.outputTranscription!.text);
            }
            if (msg.serverContent?.turnComplete) {
              setTranscription('');
            }
            const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
            }
          },
          onclose: () => setIsActive(false)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          tools: [{ functionDeclarations: [queryNodeStatus, getSystemTelemetry] }],
          systemInstruction: `You are the AbacusX AI Support Terminal. 
          Your role is to assist Institutional Admins with node management and system telemetry.
          USER ROLE: ${currentUser?.role || 'UNAUTHENTICATED'}.
          If an ADMIN asks about system health or recent events, use getSystemTelemetry.
          If a user asks about nodes, use queryNodeStatus.
          ALWAYS refuse sensitive data if the user is not an ADMIN.`,
          outputAudioTranscription: {}
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) { console.error(err); }
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setIsActive(false);
  };

  function decode(base64: string) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sr: number, ch: number) {
    const data16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(ch, data16.length / ch, sr);
    for (let c = 0; c < ch; c++) {
      const cd = buffer.getChannelData(c);
      for (let i = 0; i < buffer.length; i++) cd[i] = data16[i * ch + c] / 32768.0;
    }
    return buffer;
  }
  function encode(bytes: Uint8Array) {
    let b = '';
    for (let i = 0; i < bytes.byteLength; i++) b += String.fromCharCode(bytes[i]);
    return btoa(b);
  }
  function createBlob(data: Float32Array) {
    const i16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) i16[i] = data[i] * 32768;
    return { data: encode(new Uint8Array(i16.buffer)), mimeType: 'audio/pcm;rate=16000' };
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {isOpen ? (
        <div className="w-80 md:w-96 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <Terminal size={18} className="text-blue-500" />
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Admin Support Node</h4>
            </div>
            <button onClick={() => { stopSession(); setIsOpen(false); }} className="text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="h-96 p-4 overflow-y-auto space-y-4 bg-slate-950 font-mono text-[11px] leading-relaxed">
            <div className="text-blue-500 opacity-50 flex items-center">
              <ShieldCheck size={12} className="mr-2" /> SESSION ENCRYPTED (AES-256)
            </div>
            {isActive && <div className="text-green-500 animate-pulse uppercase font-black text-[9px]">Live Voice Active</div>}
            {transcription && <div className="text-slate-300 italic p-3 border-l-2 border-blue-500 bg-blue-500/5">"{transcription}"</div>}
          </div>
          <div className="p-4 bg-slate-900 border-t border-slate-700">
            {isActive ? (
              <Button variant="danger" className="w-full text-[10px] font-black uppercase py-4" onClick={stopSession}>De-authorize Terminal</Button>
            ) : (
              <Button className="w-full text-[10px] font-black uppercase py-4" onClick={startLiveSession}>
                <Mic size={14} className="mr-2" /> Connect Voice Terminal
              </Button>
            )}
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl border-4 border-slate-900 hover:scale-110 transition-transform">
          <Headset size={28} />
          {isActive && <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></span>}
        </button>
      )}
    </div>
  );
};
