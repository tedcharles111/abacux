
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Minus, ShieldCheck, Headset, Mic, MicOff, Wifi, Volume2, Sparkles } from 'lucide-react';
import { supportService, ChatMessage } from '../services/support';
import { User } from '../types';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, GenerateContentResponse } from '@google/genai';

// Helper for Base64 (Manual implementation as per guidelines)
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const LiveChatWidget: React.FC<{ user: User | null }> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  const userId = user?.id || 'anonymous_guest';
  const userName = user?.fullName || 'Guest User';

  useEffect(() => {
    const syncChat = () => {
      const ticket = supportService.getTicket(userId);
      if (ticket) setMessages([...ticket.messages]);
    };
    syncChat();
    window.addEventListener('support_sync_update', syncChat);
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-live-chat', handleOpen);
    return () => {
      window.removeEventListener('support_sync_update', syncChat);
      window.removeEventListener('open-live-chat', handleOpen);
      stopVoice();
    };
  }, [userId]);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, streamingText]);

  const startVoice = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      // Initialize Audio Contexts
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      }
      if (!outAudioContextRef.current) {
        outAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      await audioContextRef.current.resume();
      await outAudioContextRef.current.resume();

      const outputNode = outAudioContextRef.current.createGain();
      outputNode.connect(outAudioContextRef.current.destination);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsVoiceActive(true);
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outAudioContextRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outAudioContextRef.current.currentTime);
              const buffer = await decodeAudioData(decode(base64Audio), outAudioContextRef.current, 24000, 1);
              const source = outAudioContextRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(outputNode);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.outputTranscription) {
               const text = message.serverContent.outputTranscription.text;
               if (message.serverContent?.turnComplete) {
                 supportService.sendMessage(userId, 'Concierge', text, false, { isAi: true });
               }
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => setIsVoiceActive(false),
          onerror: (e) => {
            console.error("Live Error", e);
            setIsVoiceActive(false);
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'You are David, AbacusX Senior Financial Concierge. Provide real-time assistance. You are currently in Voice Mode. Speak clearly and concisely. AbacusX is a premier crypto platform.',
          outputAudioTranscription: {},
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to start Live API", err);
      setIsVoiceActive(false);
    }
  };

  const stopVoice = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsVoiceActive(false);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = inputValue.trim();
    if (!text) return;
    
    // 1. Persist User Message
    supportService.sendMessage(userId, userName, text, true);
    setInputValue('');
    setIsAiThinking(true);
    setStreamingText('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: text,
        config: {
          systemInstruction: 'You are David, AbacusX Senior Financial Concierge. You are helping a user in Text Mode. Be helpful, professional, and precise about cryptocurrency. User name: ' + userName,
        },
      });

      let fullAiResponse = '';
      for await (const chunk of responseStream) {
        const chunkText = (chunk as GenerateContentResponse).text || '';
        fullAiResponse += chunkText;
        setStreamingText(fullAiResponse);
      }

      // 2. Persist Full AI Message
      supportService.sendMessage(userId, 'Concierge', fullAiResponse, false, { isAi: true });
      setStreamingText('');
    } catch (err) {
      console.error("Chat Error", err);
      supportService.sendMessage(userId, 'System', 'I encountered an error connecting to our real-time core. Please try again.', false, { isAi: true });
    } finally {
      setIsAiThinking(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      <div 
        className={`pointer-events-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col transition-all duration-300 origin-bottom-right overflow-hidden ${
          isOpen ? 'scale-100 opacity-100 mb-4' : 'scale-0 opacity-0 mb-0 h-0'
        }`}
        style={{ height: '520px' }}
      >
        <div className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-xl relative transition-colors ${isVoiceActive ? 'bg-red-600' : 'bg-blue-600'}`}>
              {isVoiceActive ? <Mic size={20} /> : <ShieldCheck size={20} />}
              {isVoiceActive && <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></div>}
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">AbacusX Live</h3>
              <div className="flex items-center text-[8px] text-green-400 font-black uppercase tracking-widest">
                <Wifi size={10} className="mr-1" /> {isVoiceActive ? 'Voice Sync Active' : 'Text Gateway Active'}
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
            <Minus size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900 scrollbar-hide">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isFromUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                msg.isFromUser 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
              }`}>
                {msg.isAi && <span className="text-[8px] uppercase font-black text-blue-400 block mb-1">Live Concierge</span>}
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}

          {/* Real-time Streaming Response */}
          {streamingText && (
            <div className="flex justify-start">
               <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm bg-slate-800 text-slate-200 rounded-bl-none border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                  <span className="text-[8px] uppercase font-black text-blue-400 flex items-center mb-1">
                    <Sparkles size={10} className="mr-1 animate-pulse" /> Live Streaming
                  </span>
                  <p className="whitespace-pre-wrap">{streamingText}</p>
               </div>
            </div>
          )}

          {isAiThinking && !streamingText && (
            <div className="flex justify-start">
               <div className="bg-slate-800 border border-slate-700 rounded-2xl p-3 flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
               </div>
            </div>
          )}

          {isVoiceActive && (
            <div className="flex flex-col items-center justify-center py-6 space-y-3">
               <div className="flex items-center space-x-1 h-12">
                  {[...Array(8)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1.5 bg-blue-500 rounded-full animate-pulse" 
                      style={{ 
                        height: `${Math.random() * 100}%`, 
                        minHeight: '4px',
                        animationDuration: `${0.5 + Math.random()}s` 
                      }}
                    ></div>
                  ))}
               </div>
               <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest animate-pulse">Voice Bridge Established</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-slate-800 border-t border-slate-700">
          <div className="flex items-center space-x-2">
            <button 
              onClick={isVoiceActive ? stopVoice : startVoice}
              title={isVoiceActive ? "End Voice Session" : "Start Voice Concierge"}
              className={`p-3 rounded-xl transition-all shadow-lg flex items-center justify-center active:scale-95 ${isVoiceActive ? 'bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-500/20' : 'bg-slate-900 hover:bg-slate-700 text-blue-400 border border-slate-700'}`}
            >
              {isVoiceActive ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <form onSubmit={handleSendMessage} className="flex-1 flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isVoiceActive || isAiThinking}
                placeholder={isVoiceActive ? "Speak to David..." : "Message concierge..."}
                className="flex-1 bg-slate-950 text-white rounded-xl px-4 py-3 border border-slate-700 focus:border-blue-500 text-sm outline-none disabled:opacity-50 transition-all"
              />
              <button 
                type="submit" 
                disabled={!inputValue.trim() || isAiThinking || isVoiceActive}
                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 shadow-lg active:scale-95 disabled:opacity-50 transition-all"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>

      <button onClick={() => setIsOpen(!isOpen)} className={`pointer-events-auto h-16 w-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 relative hover:scale-110 active:scale-90 ${isOpen ? 'bg-slate-800' : 'bg-blue-600 shadow-blue-500/40'}`}>
        {isOpen ? <X size={28} className="text-white" /> : <Headset size={28} className="text-white" />}
        {!isOpen && <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-slate-950 text-[10px] font-bold text-white flex items-center justify-center">1</div>}
      </button>
    </div>
  );
};
