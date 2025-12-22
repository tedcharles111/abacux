
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { MessageCircle, X, Mic, MicOff, Send, Loader2, Headset } from 'lucide-react';
// Import Button component from local ui library
import { Button } from './ui';

export const LiveChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'agent', text: string}[]>([]);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  const startLiveSession = async () => {
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
            setIsListening(true);
            
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
            if (msg.serverContent?.outputTranscription) {
              setTranscription(prev => prev + msg.serverContent!.outputTranscription!.text);
            }
            
            if (msg.serverContent?.turnComplete) {
              setChatHistory(prev => [...prev, { role: 'agent', text: 'Support Agent Response Received' }]);
              setTranscription('');
            }

            const base64Audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
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
          onerror: (e) => console.error("Live Chat Error", e),
          onclose: () => setIsActive(false)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "You are the AbacusX AI Support Agent. You help users with crypto investments, KYC, and technical platform issues. Be professional and institutional.",
          outputAudioTranscription: {}
        }
      });
      
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Mic access failed", err);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsActive(false);
    setIsListening(false);
  };

  // Helper functions for audio
  function decode(base64: string) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  }

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  }

  function encode(bytes: Uint8Array) {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  function createBlob(data: Float32Array) {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
    return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {isOpen ? (
        <div className="w-80 md:w-96 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                <Headset size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight">AbacusX Live Support</h4>
                <p className="text-[10px] text-blue-100 font-bold uppercase tracking-widest flex items-center">
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? 'bg-green-400 animate-pulse' : 'bg-slate-400'}`}></span>
                  {isActive ? 'Live Connection' : 'Ready'}
                </p>
              </div>
            </div>
            <button onClick={() => { stopSession(); setIsOpen(false); }} className="text-white/80 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="h-96 p-4 overflow-y-auto space-y-4 bg-slate-950 flex flex-col">
            <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50 text-xs text-slate-400 leading-relaxed italic">
              "Welcome to AbacusX Live Terminal. Press 'Initiate Link' to speak with an AI specialist."
            </div>
            
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {transcription && (
               <div className="flex justify-start">
                  <div className="max-w-[80%] p-3 rounded-2xl text-xs font-medium bg-slate-800/50 text-slate-400 border border-slate-700/50 italic animate-pulse">
                    {transcription}
                  </div>
               </div>
            )}
          </div>

          <div className="p-4 bg-slate-900 border-t border-slate-800">
            {isActive ? (
               <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                     <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center animate-pulse">
                        <Mic size={16} />
                     </div>
                     <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Listening...</span>
                  </div>
                  {/* Fixed missing Button component usage by adding import */}
                  <Button variant="danger" size="sm" onClick={stopSession} className="rounded-xl">Terminate Link</Button>
               </div>
            ) : (
               /* Fixed missing Button component usage by adding import */
               <Button onClick={startLiveSession} className="w-full py-3 rounded-2xl font-black uppercase tracking-widest text-[10px]">
                  Initiate Support Link
               </Button>
            )}
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all border-4 border-slate-900 group"
        >
          <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 border-2 border-slate-900 rounded-full animate-bounce"></span>
        </button>
      )}
    </div>
  );
};
