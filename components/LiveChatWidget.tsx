
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Minus, ShieldCheck, Headset, Mic, MicOff, Wifi, Sparkles, AlertCircle } from 'lucide-react';
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
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  const userId = user?.id || 'anonymous_guest';
  const userName = user?.fullName || 'Guest User';

  // --- Sync Logic ---
  useEffect(() => {
    const syncChat = () => {
      const ticket = supportService.getTicket(userId);
      if (ticket) {
        setMessages([...ticket.messages]);
      }
    };
    
    // Initial load
    syncChat();

    // Listen for updates
    window.addEventListener('support_sync_update', syncChat);
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-live-chat', handleOpen);
    
    return () => {
      window.removeEventListener('support_sync_update', syncChat);
      window.removeEventListener('open-live-chat', handleOpen);
      stopVoice();
    };
  }, [userId]);

  // --- Auto Scroll ---
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, streamingText, errorMessage]);

  // --- Voice Logic ---
  const startVoice = async () => {
    if (isConnecting) return;
    setErrorMessage(null);
    setIsConnecting(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("API Key not configured");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // 1. Initialize Audio Contexts (Must happen after user gesture)
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      }
      if (!outAudioContextRef.current || outAudioContextRef.current.state === 'closed') {
        outAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      // Resume contexts if suspended (browser policy)
      if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
      if (outAudioContextRef.current.state === 'suspended') await outAudioContextRef.current.resume();

      const outputNode = outAudioContextRef.current.createGain();
      outputNode.connect(outAudioContextRef.current.destination);

      // 2. Get Microphone Access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 3. Connect to Gemini Live API
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsVoiceActive(true);
            
            // Setup input stream
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
              
              // Only send if session is valid
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const serverContent = message.serverContent;
            const modelTurn = serverContent?.modelTurn;
            const parts = modelTurn?.parts;
            const base64Audio = parts?.[0]?.inlineData?.data;
            
            if (base64Audio && outAudioContextRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outAudioContextRef.current.currentTime);
              
              const buffer = await decodeAudioData(decode(base64Audio), outAudioContextRef.current, 24000, 1);
              const source = outAudioContextRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(outputNode);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            // Handle Interruptions
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            setIsVoiceActive(false);
            setIsConnecting(false);
          },
          onerror: (e) => {
            console.error("Live API Error", e);
            setIsVoiceActive(false);
            setIsConnecting(false);
            setErrorMessage("Connection lost. Please try again.");
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: `You are David, a senior financial support agent at AbacusX. You are helpful, professional, and concise. Current User: ${userName}.`,
          outputAudioTranscription: {},
        }
      });

      sessionRef.current = await sessionPromise;

    } catch (err: any) {
      console.error("Failed to start Live API", err);
      setIsConnecting(false);
      setIsVoiceActive(false);
      setErrorMessage(err.message === "API Key not configured" ? "Voice Service Unavailable" : "Failed to access microphone or connect.");
    }
  };

  const stopVoice = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    // Clean up audio contexts
    if (audioContextRef.current?.state !== 'closed') audioContextRef.current?.close();
    if (outAudioContextRef.current?.state !== 'closed') outAudioContextRef.current?.close();
    
    // Reset refs
    audioContextRef.current = null;
    outAudioContextRef.current = null;
    
    setIsVoiceActive(false);
    setIsConnecting(false);
  };

  // --- Text Logic ---
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = inputValue.trim();
    if (!text) return;
    
    // 1. Persist User Message
    supportService.sendMessage(userId, userName, text, true);
    setInputValue('');
    setIsAiThinking(true);
    setStreamingText('');
    setErrorMessage(null);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        // Mock delay for realism when no key is present
        await new Promise(resolve => setTimeout(resolve, 1500));
        throw new Error("API_KEY_MISSING");
      }

      const ai = new GoogleGenAI({ apiKey });
      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: text, 
        config: {
          systemInstruction: `You are David, AbacusX Senior Financial Concierge. Answer briefly and professionally. User: ${userName}.`,
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
      setStreamingText(''); // Clear stream as it's now in history
      
    } catch (err: any) {
      console.error("Chat Error", err);
      let replyMessage = 'I am currently experiencing high traffic. Please try again later.';
      
      if (err.message === "API_KEY_MISSING") {
         replyMessage = "Service Notice: AI capabilities are currently unavailable (API Key not configured).";
      }
      
      supportService.sendMessage(userId, 'System', replyMessage, false, { isAi: true });
    } finally {
      setIsAiThinking(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none font-sans">
      <div 
        className={`pointer-events-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col transition-all duration-300 origin-bottom-right overflow-hidden ${
          isOpen ? 'scale-100 opacity-100 mb-4' : 'scale-0 opacity-0 mb-0 h-0'
        }`}
        style={{ height: '520px' }}
      >
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-xl relative transition-colors ${isVoiceActive ? 'bg-red-600' : 'bg-blue-600'}`}>
              {isConnecting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isVoiceActive ? (
                <Mic size={20} />
              ) : (
                <ShieldCheck size={20} />
              )}
              {isVoiceActive && <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></div>}
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">AbacusX Live</h3>
              <div className="flex items-center text-[8px] text-green-400 font-black uppercase tracking-widest">
                <Wifi size={10} className="mr-1" /> {isVoiceActive ? 'Voice Encrypted' : 'Concierge Online'}
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
            <Minus size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950 scrollbar-hide">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isFromUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                msg.isFromUser 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
              }`}>
                {msg.isAi && <span className="text-[8px] uppercase font-black text-blue-400 block mb-1">Live Concierge</span>}
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}

          {/* Streaming Text */}
          {streamingText && (
            <div className="flex justify-start">
               <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm bg-slate-800 text-slate-200 rounded-bl-none border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                  <span className="text-[8px] uppercase font-black text-blue-400 flex items-center mb-1">
                    <Sparkles size={10} className="mr-1 animate-pulse" /> Live Streaming
                  </span>
                  <p className="whitespace-pre-wrap leading-relaxed">{streamingText}</p>
               </div>
            </div>
          )}

          {/* Thinking Indicator */}
          {isAiThinking && !streamingText && (
            <div className="flex justify-start">
               <div className="bg-slate-800 border border-slate-700 rounded-2xl p-3 flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
               </div>
            </div>
          )}
          
          {/* Error Message */}
          {errorMessage && (
            <div className="flex justify-center">
              <div className="bg-red-900/20 border border-red-500/50 text-red-200 text-xs px-3 py-2 rounded-lg flex items-center">
                <AlertCircle size={14} className="mr-2" />
                {errorMessage}
              </div>
            </div>
          )}

          {/* Voice Active Animation */}
          {isVoiceActive && (
            <div className="flex flex-col items-center justify-center py-6 space-y-3 bg-slate-900/50 rounded-xl border border-blue-500/20">
               <div className="flex items-center space-x-1 h-8">
                  {[...Array(8)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1 bg-blue-500 rounded-full animate-pulse" 
                      style={{ 
                        height: `${Math.random() * 100}%`, 
                        minHeight: '4px',
                        animationDuration: `${0.3 + Math.random() * 0.5}s` 
                      }}
                    ></div>
                  ))}
               </div>
               <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest animate-pulse">Listening...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-800 border-t border-slate-700">
          <div className="flex items-center space-x-2">
            <button 
              onClick={isVoiceActive ? stopVoice : startVoice}
              disabled={isConnecting}
              title={isVoiceActive ? "End Voice Session" : "Start Voice Concierge"}
              className={`p-3 rounded-xl transition-all shadow-lg flex items-center justify-center active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isVoiceActive ? 'bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-500/20' : 'bg-slate-900 hover:bg-slate-700 text-blue-400 border border-slate-700'}`}
            >
              {isVoiceActive ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <form onSubmit={handleSendMessage} className="flex-1 flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isVoiceActive || isAiThinking}
                placeholder={isVoiceActive ? "Listening (Voice Mode)..." : "Ask AbacusX..."}
                className="flex-1 bg-slate-950 text-white rounded-xl px-4 py-3 border border-slate-700 focus:border-blue-500 text-sm outline-none disabled:opacity-50 transition-all placeholder:text-slate-600"
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

      {/* Floating Toggle Button */}
      <button onClick={() => setIsOpen(!isOpen)} className={`pointer-events-auto h-16 w-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 relative hover:scale-110 active:scale-90 z-[100] ${isOpen ? 'bg-slate-800' : 'bg-blue-600 shadow-blue-500/40'}`}>
        {isOpen ? <X size={28} className="text-white" /> : <Headset size={28} className="text-white" />}
        {!isOpen && messages.length > 0 && messages[messages.length-1].isAi && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-slate-950 text-[10px] font-bold text-white flex items-center justify-center">1</div>
        )}
      </button>
    </div>
  );
};
    