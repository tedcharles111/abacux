
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supportService, SupportTicket } from '../../services/support';
import { Button } from '../../components/ui';
import { Send, Search, User as UserIcon, MessageSquare, Wifi, RefreshCw } from 'lucide-react';

export const AdminSupport: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>(supportService.getTickets());
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [pulse, setPulse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sync = () => {
    const data = supportService.getTickets();
    setTickets(data);
    setPulse(true);
    setTimeout(() => setPulse(false), 300);
  };

  useEffect(() => {
    const unsubscribe = supportService.subscribe(sync);
    sync();
    return () => unsubscribe();
  }, []);

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
    if (selectedUserId) {
      supportService.setTyping('admin', val.length > 0);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl relative">
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-950/60">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <MessageSquare size={20} className="mr-2 text-blue-500" /> Inbox
            </h2>
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-[9px] font-black transition-colors ${pulse ? 'bg-green-500 text-black' : 'bg-green-500/10 text-green-400'}`}>
              <RefreshCw size={10} className={pulse ? 'animate-spin' : ''} />
              <span>LIVE</span>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:border-blue-500 outline-none"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-10 text-center opacity-20">
              <Wifi size={48} className="mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Connections</p>
            </div>
          ) : (
            tickets.map(ticket => (
              <button
                key={ticket.userId}
                onClick={() => {
                  setSelectedUserId(ticket.userId);
                  if (ticket.unreadCount > 0) {
                    supportService.markAsRead(ticket.userId, true);
                  }
                }}
                className={`w-full p-6 flex items-start space-x-4 transition-all border-b border-slate-800/50 text-left relative ${
                  selectedUserId === ticket.userId ? 'bg-blue-600/10 border-r-4 border-blue-500' : 'hover:bg-slate-800/30'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-blue-400 font-bold border border-slate-800 shrink-0">
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
                    {ticket.lastMessage || 'New session...'}
                  </p>
                </div>
                {ticket.unreadCount > 0 && (
                  <div className="absolute top-6 right-6 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold animate-pulse">
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
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white border border-blue-400/30 shadow-2xl">
                  <UserIcon size={24} />
                </div>
                <div>
                  <h3 className="text-white font-black text-lg">{currentTicket.userName}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Connected Gateway / {currentTicket.userId}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-6 scrollbar-hide">
              {currentTicket.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isFromUser ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[75%] rounded-[1.5rem] p-5 shadow-2xl transition-all ${
                    msg.isFromUser 
                      ? 'bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-none' 
                      : (msg.isAI ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-100 rounded-br-none' : 'bg-blue-600 text-white border border-blue-400/20 rounded-br-none')
                  }`}>
                    {!msg.isFromUser && (
                      <div className="text-[8px] uppercase font-black mb-2 tracking-widest opacity-60">
                        {msg.isAI ? 'Automated Response' : 'Admin Transmission'}
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

            <div className="p-8 bg-slate-900/50 border-t border-slate-800">
              <form onSubmit={handleSendReply} className="flex items-center space-x-4">
                <input 
                  type="text" 
                  value={replyText}
                  onChange={(e) => onInputChange(e.target.value)}
                  placeholder={`Type response to ${currentTicket.userName}...`}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-6 py-4 text-sm text-white focus:border-blue-500 outline-none transition-all"
                />
                <button 
                  type="submit" 
                  disabled={!replyText.trim()}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black flex items-center shadow-xl active:scale-95 disabled:opacity-50 transition-all uppercase tracking-widest text-xs"
                >
                  <Send size={16} className="mr-3" /> Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
             <div className="w-32 h-32 bg-slate-900 rounded-[2.5rem] flex items-center justify-center border border-slate-800 mb-8 shadow-2xl opacity-50">
                <MessageSquare size={54} className="text-slate-800" />
             </div>
             <h2 className="text-2xl font-black text-slate-400 mb-4 uppercase">Select a Channel</h2>
             <p className="text-slate-600 max-w-xs text-sm">Waiting for incoming secure support requests from the user network.</p>
          </div>
        )}
      </div>
    </div>
  );
};
