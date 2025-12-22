
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Send, Minus, Headset, Wifi, ShieldCheck, Bell, Activity } from 'lucide-react';
import { supportService, ChatMessage } from '../services/support';
import { User as UserType } from '../types';

export const LiveChatWidget: React.FC<{ user: UserType | null }> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [ticketState, setTicketState] = useState(supportService.getTicket(user?.id || 'guest_user'));
  const [inputValue, setInputValue] = useState('');
  const [isSupportTyping, setIsSupportTyping] = useState(false);
  const [ping, setPing] = useState(24);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = user?.id || 'guest_user';
  const userName = user?.fullName || 'Guest User';

  const refresh = () => {
    setTicketState(supportService.getTicket(userId));
  };

  useEffect(() => {
    // 1. Listen for general updates
    const unsubAll = supportService.subscribeToAll(refresh);
    
    // 2. Listen for DIRECT message signals for zero-latency appearance
    const unsubMessages = supportService.subscribeToMessages(({ message, userId: targetId }) => {
      if (targetId === userId || !message.isFromUser) {
        refresh();
        // If message is from support, play small alert
        if (!message.isFromUser && !isOpen) {
          try { new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3').play(); } catch(e){}
        }
      }
    });

    // 3. Listen for typing signals
    const unsubTyping = supportService.subscribeToTyping((tid, isTyping) => {
      if (tid === 'admin' || tid === 'ai_support') setIsSupportTyping(isTyping);
    });
    
    // Simulate changing ping for aesthetic
    const pingInt = setInterval(() => setPing(Math.floor(20 + Math.random() * 10)), 5000);
    
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-live-chat', handleOpen);
    
    refresh();
    return () => {
      unsubAll(); unsubMessages(); unsubTyping();
      clearInterval(pingInt);
      window.removeEventListener('open-live-chat', handleOpen);
    };
  }, [userId, isOpen]);

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

    // AI logic
    supportService.setTyping('ai_support', true);
    setTimeout(() => {
      supportService.getAIResponse(userId, userName, userMsg).finally(() => {
        supportService.setTyping('ai_support', false);
      });
    }, 1200);
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
        <div className="bg-slate-800 border-b border-slate-700 p-5 flex justify-between items-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500/20">
             <div className="h-full bg-blue-500 animate-[loading_2s_infinite]" style={{ width: '30%' }}></div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white bg-blue-600 shadow-lg relative">
              <Headset size={20} />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800 animate-pulse"></div>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">AbacusX Support</h3>
              <div className="flex items-center text-[9px] text-slate-400 font-bold uppercase tracking-widest space-x-2">
                <span className="flex items-center text-green-400"><Wifi size={10} className="mr-1" /> ONLINE</span>
                <span className="opacity-40">•</span>
                <span>{ping}ms Latency</span>
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors bg-slate-700/30 p-2 rounded-xl">
            <Minus size={18} />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950 scrollbar-hide">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-30 p-10">
              <div className="w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center border border-slate-800">
                <Activity size={32} className="text-blue-500" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Direct Uplink Established</p>
              <p className="text-xs text-slate-500 normal-case leading-relaxed">System is clear. You are connected to a high-priority support node.</p>
            </div>
          )}
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isFromUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm relative transition-all ${
                msg.isFromUser 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
              }`}>
                {!msg.isFromUser && (
                  <span className="text-[8px] uppercase font-black text-blue-400 block mb-1 tracking-widest">
                    {msg.isAI ? 'Neural Proxy' : 'Human Specialist'}
                  </span>
                )}
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <div className="flex justify-between items-center mt-1.5 opacity-40">
                   <span className="text-[8px] font-mono">
                     {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                   {msg.isFromUser && <ShieldCheck size={10} className="text-blue-200" />}
                </div>
              </div>
            </div>
          ))}

          {isSupportTyping && (
            <div className="flex justify-start animate-in fade-in duration-300">
               <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none px-4 py-3 flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-[9px] uppercase font-black text-blue-400 tracking-tighter">Analyzing Response...</span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-5 bg-slate-900 border-t border-slate-700">
          <form onSubmit={handleSend} className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Secure transmission..."
                className="w-full bg-slate-950 text-white rounded-2xl pl-5 pr-12 py-4 border border-slate-700 focus:border-blue-500 text-sm outline-none transition-all placeholder:text-slate-600"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-700 font-mono hidden sm:block">
                UTF-8
              </div>
            </div>
            <button 
              type="submit" 
              disabled={!inputValue.trim()}
              className="h-12 w-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-500 shadow-xl active:scale-90 disabled:opacity-50 transition-all border border-blue-400/20"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* Launcher Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`pointer-events-auto h-16 w-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 relative hover:scale-110 active:scale-90 z-[100] border-4 ${
          isOpen ? 'bg-slate-800 border-slate-700' : 'bg-blue-600 border-blue-500 shadow-blue-500/30'
        }`}
      >
        {isOpen ? <X size={28} className="text-white" /> : <Headset size={28} className="text-white" />}
        {!isOpen && hasUnread && (
          <div className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 border-4 border-slate-900 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-red-500/40">
            <span className="text-[10px] font-black text-white">{ticketState?.userUnreadCount}</span>
          </div>
        )}
      </button>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};
