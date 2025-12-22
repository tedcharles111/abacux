
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Send, Minus, Headset, Wifi, ShieldCheck, Bell, Loader2 } from 'lucide-react';
import { supportService, ChatMessage } from '../services/support';
import { User as UserType } from '../types';

export const LiveChatWidget: React.FC<{ user: UserType | null }> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [ticketState, setTicketState] = useState(supportService.getTicket(user?.id || 'guest_user'));
  const [inputValue, setInputValue] = useState('');
  const [isSupportTyping, setIsSupportTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = user?.id || 'guest_user';
  const userName = user?.fullName || 'Guest User';

  const refresh = () => {
    const currentTicket = supportService.getTicket(userId);
    setTicketState(currentTicket);
  };

  useEffect(() => {
    refresh();
    const unsubUpdate = supportService.subscribe(refresh);
    const unsubTyping = supportService.subscribeToTyping((tid, isTyping) => {
      if (tid === 'admin' || tid === 'ai_support') {
        setIsSupportTyping(isTyping);
      }
    });
    
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-live-chat', handleOpen);
    
    return () => {
      unsubUpdate();
      unsubTyping();
      window.removeEventListener('open-live-chat', handleOpen);
    };
  }, [userId]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      if (ticketState && ticketState.userUnreadCount > 0) {
        supportService.markAsRead(userId, false);
      }
    }
  }, [ticketState?.messages, isOpen, isSupportTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const userMsg = inputValue.trim();
    supportService.sendMessage(userId, userName, userMsg, true);
    setInputValue('');

    // Simulate AI response if no admin is active
    // We signal typing first
    supportService.setTyping('ai_support', true);
    
    // Trigger AI response after a short delay to feel natural
    setTimeout(() => {
      supportService.getAIResponse(userId, userName, userMsg).finally(() => {
        supportService.setTyping('ai_support', false);
      });
    }, 1500);
  };

  const messages = useMemo(() => ticketState?.messages || [], [ticketState]);
  const hasUnread = (ticketState?.userUnreadCount || 0) > 0;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none">
      <div 
        className={`pointer-events-auto bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-80 sm:w-96 flex flex-col transition-all duration-300 origin-bottom-right overflow-hidden ${
          isOpen ? 'scale-100 opacity-100 mb-4' : 'scale-0 opacity-0 mb-0 h-0'
        }`}
        style={{ height: '540px' }}
      >
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 p-5 flex justify-between items-center shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white bg-blue-600 shadow-lg">
              <Headset size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">AbacusX Support</h3>
              <div className="flex items-center text-[9px] text-green-400 font-bold uppercase tracking-widest">
                <Wifi size={10} className="mr-1 animate-pulse" /> Live Connection
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
            <Minus size={20} />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950 scrollbar-hide">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-30 p-10">
              <ShieldCheck size={48} className="text-slate-500" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Secure Protocol Active</p>
              <p className="text-xs text-slate-500 normal-case">How can we assist you today?</p>
            </div>
          )}
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isFromUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm transition-all ${
                msg.isFromUser 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
              }`}>
                {!msg.isFromUser && (
                  <span className="text-[8px] uppercase font-black text-blue-400 block mb-1 tracking-widest">
                    {msg.isAI ? 'AbacusX AI' : 'AbacusX Specialist'}
                  </span>
                )}
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <span className="text-[8px] opacity-40 mt-1 block text-right font-mono">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {isSupportTyping && (
            <div className="flex justify-start animate-in fade-in duration-300">
               <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none px-4 py-3 flex items-center space-x-2">
                  <span className="text-[8px] uppercase font-black text-blue-400 tracking-widest">Specialist is typing</span>
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-5 bg-slate-900 border-t border-slate-700">
          <form onSubmit={handleSend} className="flex items-center space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything..."
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
        </div>
      </div>

      {/* Launcher Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`pointer-events-auto h-16 w-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 relative hover:scale-110 active:scale-90 z-[100] ${
          isOpen ? 'bg-slate-800' : 'bg-blue-600'
        }`}
      >
        {isOpen ? <X size={28} className="text-white" /> : <Headset size={28} className="text-white" />}
        {!isOpen && hasUnread && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 border-2 border-slate-900 rounded-full flex items-center justify-center animate-bounce">
            <Bell size={12} className="text-white fill-white" />
          </div>
        )}
      </button>
    </div>
  );
};
