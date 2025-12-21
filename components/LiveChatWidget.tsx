
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Minus, ShieldCheck, Headset, Wifi, AlertCircle } from 'lucide-react';
import { supportService, ChatMessage } from '../services/support';
import { User as UserType } from '../types';

export const LiveChatWidget: React.FC<{ user: UserType | null }> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = user?.id || 'guest_user';
  const userName = user?.fullName || 'Guest User';

  const refresh = () => {
    const ticket = supportService.getTicket(userId);
    if (ticket) {
      setMessages([...ticket.messages]);
    }
  };

  useEffect(() => {
    refresh();
    const unsubscribe = supportService.subscribe(refresh);
    
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-live-chat', handleOpen);
    
    // Aggressive fallback sync
    const interval = setInterval(refresh, 1000);

    return () => {
      unsubscribe();
      window.removeEventListener('open-live-chat', handleOpen);
      clearInterval(interval);
    };
  }, [userId]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    supportService.sendMessage(userId, userName, inputValue.trim(), true);
    setInputValue('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none font-sans">
      <div 
        className={`pointer-events-auto bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-80 sm:w-96 flex flex-col transition-all duration-300 origin-bottom-right overflow-hidden ${
          isOpen ? 'scale-100 opacity-100 mb-4' : 'scale-0 opacity-0 mb-0 h-0'
        }`}
        style={{ height: '560px' }}
      >
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 p-5 flex justify-between items-center shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white bg-blue-600 shadow-blue-500/20 shadow-lg">
              <Headset size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Priority Terminal</h3>
              <div className="flex items-center text-[9px] text-green-400 font-black uppercase tracking-widest">
                <Wifi size={10} className="mr-1 animate-pulse" /> Live Support Ready
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
            <Minus size={20} />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950/50 backdrop-blur-sm scrollbar-hide">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-30 p-10">
              <ShieldCheck size={48} className="text-slate-500" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Secure Peer-to-Peer Tunnel Established</p>
            </div>
          )}
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isFromUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm transition-all ${
                msg.isSystem
                  ? 'bg-red-500/10 border border-red-500/20 text-red-400 italic text-[11px] w-full text-center'
                  : msg.isFromUser 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
              }`}>
                {!msg.isFromUser && !msg.isSystem && (
                  <span className="text-[8px] uppercase font-black text-blue-400 block mb-1 tracking-widest">
                    {msg.senderName}
                  </span>
                )}
                {msg.isSystem && <AlertCircle size={10} className="inline mr-1 mb-0.5" />}
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                {!msg.isSystem && (
                  <span className="text-[8px] opacity-40 mt-1 block text-right font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-5 bg-slate-900 border-t border-slate-700">
          <form onSubmit={handleSend} className="flex items-center space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Send a message..."
              className="flex-1 bg-slate-950 text-white rounded-2xl px-5 py-3.5 border border-slate-700 focus:border-blue-500 text-sm outline-none transition-all"
            />
            <button 
              type="submit" 
              disabled={!inputValue.trim()}
              className="p-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 shadow-xl active:scale-95 disabled:opacity-50 transition-all"
            >
              <Send size={18} />
            </button>
          </form>
          <p className="text-[9px] text-slate-500 mt-4 text-center uppercase tracking-widest font-bold">
            Encryption: 256-Bit SSL Active
          </p>
        </div>
      </div>

      {/* Launcher Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`pointer-events-auto h-16 w-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 relative hover:scale-110 active:scale-90 z-[100] ${
          isOpen ? 'bg-slate-800' : 'bg-blue-600 shadow-blue-500/40'
        }`}
      >
        {isOpen ? <X size={28} className="text-white" /> : <MessageSquare size={28} className="text-white" />}
        {!isOpen && messages.length > 0 && !messages[messages.length-1].isFromUser && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 rounded-full border-2 border-slate-950 text-[10px] font-black text-white flex items-center justify-center animate-bounce shadow-xl">
            !
          </div>
        )}
      </button>
    </div>
  );
};

import { MessageSquare } from 'lucide-react';
