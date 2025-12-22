
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Send, Minus, Headset, Wifi, ShieldCheck, Activity, Zap, Cpu, Radio } from 'lucide-react';
import { supportService, ChatMessage } from '../services/support';
import { User as UserType } from '../types';

export const LiveChatWidget: React.FC<{ user: UserType | null }> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [ticketState, setTicketState] = useState(supportService.getTicket(user?.id || 'guest_user'));
  const [inputValue, setInputValue] = useState('');
  const [isSupportTyping, setIsSupportTyping] = useState(false);
  const [lastTxStatus, setLastTxStatus] = useState<string>('READY');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = user?.id || 'guest_user';
  const userName = user?.fullName || 'Guest User';

  const refresh = () => {
    setTicketState(supportService.getTicket(userId));
  };

  useEffect(() => {
    // Local tab refresh
    const unsubAll = supportService.subscribeToAll(refresh);
    
    // Direct message injection (Zero latency)
    const unsubMessages = supportService.subscribeToMessages(({ message, userId: targetId }) => {
      if (targetId === userId || !message.isFromUser) {
        refresh();
        if (!message.isFromUser && !isOpen) {
          try { new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3').play(); } catch(e){}
        }
      }
    });

    const unsubTyping = supportService.subscribeToTyping((tid, isTyping) => {
      if (tid === 'admin' || tid === 'ai_support') setIsSupportTyping(isTyping);
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
    setLastTxStatus('TRANSMITTING...');
    
    supportService.sendMessage(userId, userName, userMsg, true);
    setInputValue('');
    
    setTimeout(() => setLastTxStatus('PACKET_ACK'), 600);
    setTimeout(() => setLastTxStatus('READY'), 2000);

    // AI Logic
    supportService.setTyping('ai_support', true);
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
        className={`pointer-events-auto bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl w-80 sm:w-96 flex flex-col transition-all duration-500 origin-bottom-right overflow-hidden ${
          isOpen ? 'scale-100 opacity-100 mb-6' : 'scale-0 opacity-0 mb-0 h-0'
        }`}
        style={{ height: '560px' }}
      >
        {/* Terminal Header */}
        <div className="bg-slate-800/60 p-6 flex justify-between items-center shadow-xl border-b border-slate-700/50 backdrop-blur-xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)] relative">
              <Headset size={24} />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
            </div>
            <div>
              <h3 className="font-black text-white text-xs tracking-widest uppercase">Support Terminal</h3>
              <div className="flex items-center text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-0.5">
                <span className="text-blue-400 flex items-center mr-3"><Wifi size={10} className="mr-1" /> UPLINK_OK</span>
                <span>TX: {lastTxStatus}</span>
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors bg-slate-900/50 p-2.5 rounded-2xl">
            <Minus size={20} />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950 scrollbar-hide">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-20 p-12">
              <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
                <Radio size={40} className="text-blue-500 animate-pulse" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Secure Peer-To-Peer Channel Ready</p>
            </div>
          )}
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isFromUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
              <div className={`max-w-[85%] rounded-[1.8rem] px-5 py-4 text-sm shadow-xl relative transition-all ${
                msg.isFromUser 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
              }`}>
                {!msg.isFromUser && (
                  <span className="text-[8px] uppercase font-black text-blue-400 block mb-2 tracking-widest">
                    {msg.isAI ? 'Neural Agent' : 'Specialist Console'}
                  </span>
                )}
                <p className="leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
                <div className="flex justify-between items-center mt-3 opacity-20">
                   <span className="text-[8px] font-mono">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                   {msg.isFromUser && <ShieldCheck size={10} />}
                </div>
              </div>
            </div>
          ))}

          {isSupportTyping && (
            <div className="flex justify-start animate-in fade-in duration-300">
               <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl px-5 py-4 flex items-center space-x-3">
                  <div className="flex space-x-1.5">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-[8px] uppercase font-black text-slate-600 tracking-widest">Signal Processing...</span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Secure TX Form */}
        <div className="p-6 bg-slate-900 border-t border-slate-800/50">
          <form onSubmit={handleSend} className="flex items-center space-x-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Transmit signal..."
              className="flex-1 bg-slate-950 text-white rounded-2xl px-6 py-4 border border-slate-800 focus:border-blue-500 text-sm outline-none transition-all placeholder:text-slate-800"
            />
            <button 
              type="submit" 
              disabled={!inputValue.trim()}
              className="h-14 w-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-500 shadow-2xl active:scale-90 disabled:opacity-20 transition-all border border-blue-400/20"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>

      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`pointer-events-auto h-20 w-20 rounded-[2rem] shadow-2xl flex items-center justify-center transition-all duration-500 relative hover:scale-110 active:scale-95 z-[100] border-4 ${
          isOpen ? 'bg-slate-800 border-slate-700' : 'bg-blue-600 border-blue-500 shadow-blue-500/40'
        }`}
      >
        {isOpen ? <X size={32} className="text-white" /> : <Headset size={32} className="text-white" />}
        {!isOpen && hasUnread && (
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 border-4 border-slate-950 rounded-2xl flex items-center justify-center animate-bounce">
            <span className="text-[10px] font-black text-white">{ticketState?.userUnreadCount}</span>
          </div>
        )}
      </button>
    </div>
  );
};
