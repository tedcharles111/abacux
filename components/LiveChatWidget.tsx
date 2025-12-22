
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Send, Minus, Headset, Wifi, ShieldCheck, Bell, Activity, Zap, Cpu } from 'lucide-react';
import { supportService, ChatMessage } from '../services/support';
import { User as UserType } from '../types';

export const LiveChatWidget: React.FC<{ user: UserType | null }> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [ticketState, setTicketState] = useState(supportService.getTicket(user?.id || 'guest_user'));
  const [inputValue, setInputValue] = useState('');
  const [isSupportTyping, setIsSupportTyping] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [packetsSent, setPacketsSent] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = user?.id || 'guest_user';
  const userName = user?.fullName || 'Guest User';

  const refresh = () => {
    setTicketState(supportService.getTicket(userId));
  };

  useEffect(() => {
    const unsubAll = supportService.subscribeToAll(refresh);
    
    const unsubMessages = supportService.subscribeToMessages(({ message, userId: targetId }) => {
      if (targetId === userId || !message.isFromUser) {
        refresh();
        if (!message.isFromUser && !isOpen) {
          try { new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3').play(); } catch(e){}
        }
      }
    });

    const unsubTyping = supportService.subscribeToTyping((tid, isTyping) => {
      if (tid === 'admin' || tid === 'ai_support') {
        setIsSupportTyping(isTyping);
        if (tid === 'ai_support') setIsAiThinking(isTyping);
      }
    });
    
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-live-chat', handleOpen);
    
    refresh();
    return () => {
      unsubAll(); unsubMessages(); unsubTyping();
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
    setPacketsSent(p => p + 1);

    // AI thinking state signal
    supportService.setTyping('ai_support', true);
    
    // Short wait to make it feel like real-time "thinking"
    setTimeout(() => {
      supportService.getAIResponse(userId, userName, userMsg).finally(() => {
        supportService.setTyping('ai_support', false);
      });
    }, 1800);
  };

  const messages = useMemo(() => ticketState?.messages || [], [ticketState]);
  const hasUnread = (ticketState?.userUnreadCount || 0) > 0;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none">
      <div 
        className={`pointer-events-auto bg-slate-900 border border-slate-700 rounded-[2.5rem] shadow-2xl w-80 sm:w-96 flex flex-col transition-all duration-500 origin-bottom-right overflow-hidden ${
          isOpen ? 'scale-100 opacity-100 mb-6' : 'scale-0 opacity-0 mb-0 h-0'
        }`}
        style={{ height: '560px' }}
      >
        {/* Connection Diagnostics Header */}
        <div className="bg-slate-800/80 border-b border-slate-700/50 p-6 flex justify-between items-center shadow-lg relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500/10">
             <div className="h-full bg-blue-400 animate-[pulse_2s_infinite] w-full"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)] relative border border-blue-400/20">
              <Headset size={24} />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-800 animate-pulse"></div>
            </div>
            <div>
              <h3 className="font-black text-white text-sm tracking-tight">AbacusX Terminal</h3>
              <div className="flex items-center text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5 space-x-3">
                <span className="text-green-400 flex items-center"><Zap size={8} className="mr-1 fill-green-400" /> ACTIVE_LINK</span>
                <span>PACKETS: {packetsSent}</span>
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors bg-slate-900/50 p-2.5 rounded-2xl border border-slate-700/30">
            <Minus size={20} />
          </button>
        </div>

        {/* Dynamic Message Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-950 scrollbar-hide">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-5 opacity-20 p-12">
              <div className="w-20 h-20 rounded-[2rem] bg-slate-900 flex items-center justify-center border border-slate-800 shadow-inner">
                <Activity size={40} className="text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Encrypted Uplink Active</p>
                <p className="text-xs text-slate-500 leading-relaxed italic">Direct line to global specialist nodes is open. Transmit a signal to begin.</p>
              </div>
            </div>
          )}
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isFromUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              <div className={`max-w-[85%] rounded-[1.8rem] px-5 py-4 text-sm shadow-xl relative transition-all ${
                msg.isFromUser 
                  ? 'bg-blue-600 text-white rounded-br-none border border-blue-400/20' 
                  : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
              }`}>
                {!msg.isFromUser && (
                  <div className="flex items-center space-x-2 mb-2">
                     <span className="text-[8px] uppercase font-black text-blue-400 tracking-widest">
                       {msg.isAI ? 'Neural Proxy' : 'Specialist Terminal'}
                     </span>
                     {msg.isAI && <Cpu size={8} className="text-blue-500" />}
                  </div>
                )}
                <p className="leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
                <div className="flex justify-between items-center mt-3 opacity-30">
                   <span className="text-[8px] font-mono">
                     {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                   </span>
                   {msg.isFromUser && <ShieldCheck size={10} className="text-white" />}
                </div>
              </div>
            </div>
          ))}

          {isSupportTyping && (
            <div className="flex justify-start animate-in fade-in slide-in-from-left-4 duration-300">
               <div className="bg-slate-900/50 border border-slate-800/50 rounded-[1.5rem] rounded-bl-none px-5 py-4 flex items-center space-x-3">
                  <div className="flex space-x-1.5">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                  </div>
                  <span className="text-[9px] uppercase font-black text-slate-500 tracking-widest">
                    {isAiThinking ? 'AI_PROCESSING_REQUEST' : 'SPECIALIST_SYNCHRONIZING'}
                  </span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Secure Transmission Form */}
        <div className="p-6 bg-slate-900 border-t border-slate-800/50">
          <form onSubmit={handleSend} className="flex items-center space-x-3">
            <div className="flex-1 relative group">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Transmit encrypted message..."
                className="w-full bg-slate-950 text-white rounded-[1.5rem] pl-6 pr-14 py-4 border border-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 text-sm outline-none transition-all placeholder:text-slate-700"
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] text-slate-800 font-mono font-black border border-slate-800/50 rounded-md px-1.5 py-0.5">
                SIG_L1
              </div>
            </div>
            <button 
              type="submit" 
              disabled={!inputValue.trim()}
              className="h-14 w-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-500 shadow-2xl shadow-blue-600/20 active:scale-90 disabled:opacity-20 transition-all border border-blue-400/20"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>

      {/* Launcher Button with Unread Pulse */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`pointer-events-auto h-20 w-20 rounded-[2rem] shadow-2xl flex items-center justify-center transition-all duration-500 relative hover:scale-110 active:scale-95 z-[100] border-4 ${
          isOpen ? 'bg-slate-800 border-slate-700' : 'bg-blue-600 border-blue-500 shadow-blue-500/40'
        }`}
      >
        {isOpen ? <X size={32} className="text-white" /> : <Headset size={32} className="text-white" />}
        {!isOpen && hasUnread && (
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 border-4 border-slate-950 rounded-2xl flex items-center justify-center animate-bounce shadow-lg shadow-red-500/50">
            <span className="text-[10px] font-black text-white">{ticketState?.userUnreadCount}</span>
          </div>
        )}
      </button>

      <style>{`
        @keyframes sig-pulse {
          0% { opacity: 0.2; transform: scaleX(0.5); }
          50% { opacity: 1; transform: scaleX(1); }
          100% { opacity: 0.2; transform: scaleX(0.5); }
        }
      `}</style>
    </div>
  );
};
