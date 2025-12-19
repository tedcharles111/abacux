
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Minus, ShieldCheck, Headset, Paperclip, FileText, Wifi } from 'lucide-react';
import { supportService, ChatMessage } from '../services/support';
import { User } from '../types';
import { GoogleGenAI, Chat } from "@google/genai";

export const LiveChatWidget: React.FC<{ user: User | null }> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSynced, setIsSynced] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatSessionRef = useRef<Chat | null>(null);

  const userId = user?.id || 'anonymous_guest';
  const userName = user?.fullName || 'Guest User';

  const initAi = () => {
    if (chatSessionRef.current) return;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    chatSessionRef.current = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are David, AbacusX Senior Concierge. 
        Tone: Elite, security-focused, extremely helpful.
        Greet the user and let them know a Human Admin has also been paged to this session.`,
      },
    });
  };

  useEffect(() => {
    const syncChat = () => {
      setIsSynced(false);
      const ticket = supportService.getTicket(userId);
      if (ticket) setMessages([...ticket.messages]);
      setTimeout(() => setIsSynced(true), 200);
    };

    syncChat();
    window.addEventListener('support_sync_update', syncChat);
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-live-chat', handleOpen);
    
    return () => {
      window.removeEventListener('support_sync_update', syncChat);
      window.removeEventListener('open-live-chat', handleOpen);
    };
  }, [userId]);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const text = inputValue;
    setInputValue('');
    
    // 1. Instantly dispatch message to the Live Gateway
    supportService.sendMessage(userId, userName, text, true);

    // 2. AI First-Responder logic (silences if admin is present)
    const ticket = supportService.getTicket(userId);
    if (ticket?.isAiEnabled) {
      setIsTyping(true);
      try {
        initAi();
        const result = await chatSessionRef.current!.sendMessage({ message: text });
        supportService.sendMessage(userId, userName, result.text || "One moment while I process your request.", false, { isAi: true });
        setIsTyping(false);
      } catch (err) {
        setIsTyping(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    supportService.sendMessage(userId, userName, `Uploaded: ${file.name}`, true, { 
      attachment: { name: file.name, type: file.type, size: file.size, mimeType: file.type } 
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      <div 
        className={`pointer-events-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col transition-all duration-300 origin-bottom-right overflow-hidden ${
          isOpen ? 'scale-100 opacity-100 mb-4' : 'scale-0 opacity-0 mb-0 h-0'
        }`}
        style={{ maxHeight: '600px', height: '520px' }}
      >
        <div className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-xl relative">
              <ShieldCheck size={20} />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full"></div>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">AbacusX Support</h3>
              <div className={`flex items-center px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest ${isSynced ? 'text-green-400' : 'text-blue-400'}`}>
                <Wifi size={10} className="mr-1" /> ENCRYPTED {isSynced ? 'CONNECTED' : 'SYNCING'}
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
            <Minus size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900 scrollbar-thin">
          {messages.length === 0 && (
            <div className="text-center py-10 px-6">
               <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                  <Headset className="text-blue-500" size={24} />
               </div>
               <p className="text-xs text-slate-400 font-medium">Priority Support line established. An administrator is monitoring this session. How can we help?</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isFromUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-xl ${
                msg.isFromUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
              }`}>
                {msg.isAi && <span className="text-[8px] uppercase font-black text-blue-400 block mb-1">Concierge Dispatch</span>}
                {!msg.isAi && !msg.isFromUser && <span className="text-[8px] uppercase font-black text-indigo-400 block mb-1">Senior Administrator</span>}
                
                {msg.attachment && (
                  <div className="flex items-center space-x-3 bg-slate-950/50 p-3 rounded-xl border border-white/5 mb-2">
                    <FileText size={18} className="text-blue-400" />
                    <span className="text-[10px] font-bold truncate flex-1">{msg.attachment.name}</span>
                  </div>
                )}
                
                <p className="leading-relaxed">{msg.text}</p>
                <p className="text-[8px] mt-2 opacity-30 text-right font-mono italic">{new Date(msg.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
          {isTyping && <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest ml-2 animate-pulse">Staff is typing...</div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-slate-800 border-t border-slate-700">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Secure message..."
                className="w-full bg-slate-950 text-white rounded-xl pl-4 pr-10 py-3 border border-slate-700 focus:border-blue-500 text-sm outline-none shadow-inner"
              />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-blue-400">
                <Paperclip size={18} />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            </div>
            <button type="submit" className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all shadow-lg active:scale-95">
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      <button onClick={() => setIsOpen(!isOpen)} className={`pointer-events-auto h-16 w-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 relative ${isOpen ? 'bg-slate-800 scale-90' : 'bg-blue-600 hover:bg-blue-500'}`}>
        <div className="absolute inset-0 bg-blue-400/10 rounded-full animate-ping opacity-20"></div>
        {isOpen ? <X size={28} className="text-white" /> : <Headset size={28} className="text-white" />}
      </button>
    </div>
  );
};
