
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Minus, ShieldCheck, Headset, Wifi, User } from 'lucide-react';
import { supportService, ChatMessage } from '../services/support';
import { User as UserType } from '../types';

export const LiveChatWidget: React.FC<{ user: UserType | null }> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

    // Listen for updates from Admin or other tabs
    window.addEventListener('support_sync_update', syncChat);
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-live-chat', handleOpen);
    
    return () => {
      window.removeEventListener('support_sync_update', syncChat);
      window.removeEventListener('open-live-chat', handleOpen);
    };
  }, [userId]);

  // --- Auto Scroll ---
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // --- Send Message Logic ---
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = inputValue.trim();
    if (!text) return;
    
    // Persist User Message to the shared support ledger
    // This makes it visible to admins in the Admin Console
    supportService.sendMessage(userId, userName, text, true);
    setInputValue('');
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
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-xl bg-blue-600">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">AbacusX Support</h3>
              <div className="flex items-center text-[8px] text-green-400 font-black uppercase tracking-widest">
                <Wifi size={10} className="mr-1 animate-pulse" /> Direct Agent Connection
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
            <Minus size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950 scrollbar-hide">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-40 px-6">
              <Headset size={40} className="text-slate-500" />
              <p className="text-xs text-slate-400">Welcome to Priority Support. Type a message below to connect with a live financial agent.</p>
            </div>
          )}
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isFromUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                msg.isFromUser 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
              }`}>
                {!msg.isFromUser && (
                  <span className="text-[8px] uppercase font-black text-blue-400 block mb-1">
                    {msg.senderName}
                  </span>
                )}
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                <span className="text-[8px] opacity-40 mt-1 block text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-800 border-t border-slate-700">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Message support..."
              className="flex-1 bg-slate-950 text-white rounded-xl px-4 py-3 border border-slate-700 focus:border-blue-500 text-sm outline-none transition-all placeholder:text-slate-600"
            />
            <button 
              type="submit" 
              disabled={!inputValue.trim()}
              className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 shadow-lg active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center"
            >
              <Send size={18} />
            </button>
          </form>
          <p className="text-[9px] text-slate-500 mt-3 text-center uppercase tracking-tighter">
            End-to-End Encrypted Session
          </p>
        </div>
      </div>

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`pointer-events-auto h-16 w-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 relative hover:scale-110 active:scale-90 z-[100] ${
          isOpen ? 'bg-slate-800' : 'bg-blue-600 shadow-blue-500/40'
        }`}
      >
        {isOpen ? <X size={28} className="text-white" /> : <Headset size={28} className="text-white" />}
        {!isOpen && messages.length > 0 && !messages[messages.length-1].isFromUser && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-slate-950 text-[10px] font-bold text-white flex items-center justify-center animate-bounce">
            !
          </div>
        )}
      </button>
    </div>
  );
};
