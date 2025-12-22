
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supportService, SupportTicket, ChatMessage } from '../../services/support';
import { Button } from '../../components/ui';
// Added 'X' to the lucide-react imports to fix the missing name error.
import { Send, Search, User as UserIcon, MessageSquare, Wifi, RefreshCw, Bell, Radio, X } from 'lucide-react';

export const AdminSupport: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>(supportService.getTickets());
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [notification, setNotification] = useState<{name: string, text: string} | null>(null);
  const [pulse, setPulse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sync = () => {
    setTickets(supportService.getTickets());
    setPulse(true);
    setTimeout(() => setPulse(false), 300);
  };

  useEffect(() => {
    // 1. Listen for general data refreshes
    const unsubAll = supportService.subscribeToAll(sync);
    
    // 2. Listen for DIRECT message signals for instant injection
    const unsubMessages = supportService.subscribeToMessages(({ message, userId }) => {
      // If we're looking at this user, the tickets state update will handle the list,
      // but let's trigger a sync immediately for the UI
      sync();

      // Show toast if not the selected user
      if (userId !== selectedUserId && message.isFromUser) {
        const senderTicket = supportService.getTicket(userId);
        setNotification({ name: senderTicket?.userName || 'User', text: message.text });
        setTimeout(() => setNotification(null), 5000);
        // Play notification sound
        try { new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3').play(); } catch(e){}
      }
    });
    
    sync();
    return () => {
      unsubAll();
      unsubMessages();
    };
  }, [selectedUserId]);

  const currentTicket = useMemo(() => {
    return selectedUserId ? tickets.find(t => t.userId === selectedUserId) : null;
  }, [tickets, selectedUserId]);

  useEffect(() => {
    if (currentTicket) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      if (currentTicket.unreadCount > 0) {
        supportService.markAsRead(currentTicket.userId, true);
      }
    }
  }, [currentTicket?.messages?.length, selectedUserId]);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !replyText.trim()) return;
    supportService.sendMessage(selectedUserId, 'Systems Support', replyText.trim(), false);
    setReplyText('');
    supportService.setTyping('admin', false);
  };

  const onInputChange = (val: string) => {
    setReplyText(val);
    if (selectedUserId) supportService.setTyping('admin', val.length > 0);
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl relative">
      
      {/* Toast Notification */}
      {notification && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 animate-in slide-in-from-top-10 duration-300">
           <div className="bg-white/20 p-2 rounded-xl">
             <Bell size={20} className="animate-ring" />
           </div>
           <div>
             <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Incoming Signal</p>
             <p className="text-sm font-bold truncate max-w-[200px]">{notification.name}: {notification.text}</p>
           </div>
           <button onClick={() => setNotification(null)} className="hover:opacity-50 transition-opacity">
             <X size={16} />
           </button>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-950/60">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Radio size={20} className="mr-2 text-blue-500" /> Command Center
            </h2>
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-[9px] font-black transition-all ${pulse ? 'bg-blue-500 text-white scale-110' : 'bg-slate-800 text-slate-500'}`}>
              <RefreshCw size={10} className={pulse ? 'animate-spin' : ''} />
              <span>SYNCED</span>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text" 
              placeholder="Search user signals..." 
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:border-blue-500 outline-none"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-10 text-center opacity-20">
              <Wifi size={48} className="mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Active Waves</p>
            </div>
          ) : (
            tickets.map(ticket => (
              <button
                key={ticket.userId}
                onClick={() => {
                  setSelectedUserId(ticket.userId);
                  if (ticket.unreadCount > 0) supportService.markAsRead(ticket.userId, true);
                }}
                className={`w-full p-6 flex items-start space-x-4 transition-all border-b border-slate-800/50 text-left relative ${
                  selectedUserId === ticket.userId ? 'bg-blue-600/15 border-r-4 border-blue-500' : 'hover:bg-slate-800/30'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-blue-400 font-bold border border-slate-800 shrink-0 shadow-lg">
                  {ticket.userName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-white truncate">{ticket.userName}</span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {new Date(ticket.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-[11px] truncate leading-relaxed ${ticket.unreadCount > 0 ? 'text-blue-400 font-bold' : 'text-slate-400'}`}>
                    {ticket.lastMessage || 'Channel established.'}
                  </p>
                </div>
                {ticket.unreadCount > 0 && (
                  <div className="absolute top-6 right-6 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold animate-bounce shadow-lg shadow-red-500/50">
                    {ticket.unreadCount}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-950/20 relative">
        {currentTicket ? (
          <>
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-3xl z-10">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white border border-blue-400/30 shadow-2xl">
                  <UserIcon size={24} />
                </div>
                <div>
                  <h3 className="text-white font-black text-lg">{currentTicket.userName}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Active Link / {currentTicket.userId}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                 <div className="bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2 text-center">
                    <p className="text-[8px] text-slate-500 font-black uppercase mb-0.5">Packet Loss</p>
                    <p className="text-[10px] text-green-400 font-bold">0.00%</p>
                 </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-6 scrollbar-hide bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed opacity-90">
              {currentTicket.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isFromUser ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
                  <div className={`max-w-[75%] rounded-[1.5rem] p-5 shadow-2xl transition-all ${
                    msg.isFromUser 
                      ? 'bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-none' 
                      : (msg.isAI ? 'bg-indigo-600/30 border border-indigo-500/30 text-indigo-100 rounded-br-none backdrop-blur-sm' : 'bg-blue-600 text-white border border-blue-400/20 rounded-br-none shadow-blue-500/20 shadow-xl')
                  }`}>
                    {!msg.isFromUser && (
                      <div className="text-[8px] uppercase font-black mb-2 tracking-widest opacity-60">
                        {msg.isAI ? 'Neural Proxy Response' : 'Manual Intervention'}
                      </div>
                    )}
                    <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">{msg.text}</p>
                    <div className="text-[9px] mt-3 opacity-30 text-right font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-8 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800">
              <form onSubmit={handleSendReply} className="flex items-center space-x-4">
                <input 
                  type="text" 
                  autoFocus
                  value={replyText}
                  onChange={(e) => onInputChange(e.target.value)}
                  placeholder={`Send encrypted packet to ${currentTicket.userName}...`}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-6 py-4 text-sm text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                />
                <button 
                  type="submit" 
                  disabled={!replyText.trim()}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black flex items-center shadow-2xl active:scale-95 disabled:opacity-50 transition-all uppercase tracking-widest text-xs border border-blue-400/20"
                >
                  <Send size={16} className="mr-3" /> Transmit
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-950/40">
             <div className="w-40 h-40 bg-slate-900/50 rounded-[3rem] flex items-center justify-center border border-slate-800 mb-8 shadow-inner animate-pulse">
                <Radio size={64} className="text-slate-800" />
             </div>
             <h2 className="text-3xl font-black text-slate-500 mb-4 uppercase tracking-[0.2em]">Intercepting Waves...</h2>
             <p className="text-slate-600 max-w-sm text-sm leading-relaxed font-medium">Listening for direct peer-to-peer support requests from the global user network.</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes ring {
          0% { transform: rotate(0); }
          10% { transform: rotate(15deg); }
          20% { transform: rotate(-15deg); }
          30% { transform: rotate(10deg); }
          40% { transform: rotate(-10deg); }
          50% { transform: rotate(0); }
          100% { transform: rotate(0); }
        }
        .animate-ring {
          animation: ring 2s infinite;
        }
      `}</style>
    </div>
  );
};
