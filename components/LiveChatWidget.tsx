
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Minus, ShieldCheck, Headset, Paperclip, FileText, File, Image as ImageIcon } from 'lucide-react';
import { supportService, ChatMessage } from '../services/support';
import { User } from '../types';
import { GoogleGenAI, Chat } from "@google/genai";

export const LiveChatWidget: React.FC<{ user: User | null }> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatSessionRef = useRef<Chat | null>(null);

  const userId = user?.id || 'anonymous_guest';
  const userName = user?.fullName || 'Guest User';

  // Initialize Gemini Chat Session for "Admin David" persona
  const initAi = () => {
    if (chatSessionRef.current) return;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    chatSessionRef.current = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are David, a Senior Account Administrator at AbacusX. 
        Tone: Professional, elite, reassuring. 
        Context: You are the first responder for high-net-worth investors. 
        Task: Acknowledge the user's inquiry, provide basic platform info (security, KYC), 
        and let them know a human admin is also monitoring the channel. 
        Keep it brief (max 2 sentences).`,
      },
    });
  };

  useEffect(() => {
    const handleUpdate = (e: any) => {
      const ticket = supportService.getTicket(userId);
      if (ticket) setMessages([...ticket.messages]);
    };

    handleUpdate(null);
    window.addEventListener('support_update', handleUpdate);
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-live-chat', handleOpen);
    return () => {
      window.removeEventListener('support_update', handleUpdate);
      window.removeEventListener('open-live-chat', handleOpen);
    };
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const text = inputValue;
    setInputValue('');
    
    // 1. Send user message to central service
    supportService.sendMessage(userId, userName, text, true);

    // 2. If AI is enabled for this ticket, get automated response
    const ticket = supportService.getTicket(userId);
    if (ticket?.isAiEnabled) {
      setIsTyping(true);
      try {
        initAi();
        const result = await chatSessionRef.current!.sendMessage({ message: text });
        const aiText = result.text || "I've received your request. An administrator will be with you shortly.";
        
        // Simulate thinking delay
        setTimeout(() => {
          supportService.sendMessage(userId, userName, aiText, false, { isAi: true });
          setIsTyping(false);
        }, 1500);
      } catch (err) {
        setIsTyping(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    supportService.sendMessage(userId, userName, `Uploaded file: ${file.name}`, true, { 
      attachment: { name: file.name, type: file.type, size: file.size } 
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      <div 
        className={`pointer-events-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col transition-all duration-300 origin-bottom-right overflow-hidden ${
          isOpen ? 'scale-100 opacity-100 mb-4' : 'scale-0 opacity-0 mb-0 h-0'
        }`}
        style={{ maxHeight: '600px', height: '500px' }}
      >
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">AbacusX Support</h3>
              <p className="text-slate-400 text-xs flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span> Secured & Online
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
             <Minus size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900 scrollbar-thin">
          {messages.length === 0 && (
             <div className="text-center py-10 px-6">
                <p className="text-sm text-slate-400">Welcome to AbacusX Premium Support. How can we assist with your portfolio today?</p>
             </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isFromUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.isFromUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
              }`}>
                {msg.isAi && <span className="text-[9px] uppercase font-bold text-blue-400 block mb-1">System Concierge</span>}
                {msg.text}
                <div className="text-[10px] mt-1 opacity-50 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
               <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none px-4 py-2 text-slate-400 text-[10px] animate-pulse">
                 David is typing...
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Message Support..."
                className="w-full bg-slate-950 text-white placeholder-slate-600 rounded-xl pl-4 pr-10 py-3 border border-slate-700 focus:border-blue-500 text-sm"
              />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-blue-400">
                <Paperclip size={18} />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            </div>
            <button type="submit" disabled={!inputValue.trim()} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-30">
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      <button onClick={() => setIsOpen(!isOpen)} className={`pointer-events-auto h-16 w-16 rounded-full shadow-2xl flex items-center justify-center transition-all ${isOpen ? 'bg-slate-800' : 'bg-blue-600'}`}>
        <Headset size={28} className="text-white" />
      </button>
    </div>
  );
};
