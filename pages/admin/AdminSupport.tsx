
import React, { useState, useEffect, useRef } from 'react';
import { supportService, SupportTicket } from '../../services/support';
import { Button } from '../../components/ui';
import { Send, Search, User as UserIcon, MessageSquare, Wifi, RefreshCw, AlertCircle } from 'lucide-react';

export const AdminSupport: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [lastSync, setLastSync] = useState(new Date());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const refresh = () => {
    const data = supportService.getTickets();
    setTickets(data);
    setLastSync(new Date());
  };

  useEffect(() => {
    refresh();
    const unsubscribe = supportService.subscribe(refresh);
    const interval = setInterval(refresh, 1000); // 1-second pulse for total reliability

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedUserId, tickets]);

  const selectedTicket = selectedUserId ? tickets.find(t => t.userId === selectedUserId) : null;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !replyText.trim()) return;

    supportService.sendMessage(selectedUserId, 'Priority Agent', replyText, false);
    setReplyText('');
    refresh();
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl relative">
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-950/60">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <MessageSquare size={20} className="mr-2 text-blue-500" /> Support
            </h2>
            <div className="flex items-center space-x-1 px-2 py-1 bg-green-500/10 rounded-full text-[9px] font-black text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span>LIVE FEED</span>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text" 
              placeholder="Search active users..." 
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:border-blue-500 outline-none"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-10 text-center opacity-20">
              <Wifi size={48} className="mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">Listening for signals...</p>
            </div>
          ) : (
            tickets.map(ticket => (
              <button
                key={ticket.userId}
                onClick={() => {
                  setSelectedUserId(ticket.userId);
                  supportService.markAsRead(ticket.userId);
                  refresh();
                }}
                className={`w-full p-6 flex items-start space-x-4 transition-all border-b border-slate-800/50 text-left relative ${
                  selectedUserId === ticket.userId ? 'bg-blue-600/10 border-r-4 border-blue-500' : 'hover:bg-slate-800/30'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-blue-400 font-bold border border-slate-800 shadow-inner shrink-0">
                  {ticket.userName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-white truncate">{ticket.userName}</span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {new Date(ticket.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate leading-relaxed">
                    {ticket.lastMessage}
                  </p>
                </div>
                {ticket.unreadCount > 0 && (
                  <div className="absolute top-6 right-6 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold animate-pulse shadow-lg shadow-blue-500/50">
                    {ticket.unreadCount}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 text-[9px] text-slate-500 flex justify-between font-mono tracking-widest">
          <span>LATENCY: 12ms</span>
          <span className="text-green-500">STABLE</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-950/20 relative">
        {selectedTicket ? (
          <>
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white border border-blue-400/30 shadow-2xl">
                  <UserIcon size={24} />
                </div>
                <div>
                  <h3 className="text-white font-black text-lg tracking-tight">{selectedTicket.userName}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#10b981]"></span>
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Session ID: {selectedTicket.userId}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-6 scrollbar-hide bg-slate-950/10">
              {selectedTicket.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isFromUser ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[75%] rounded-[1.5rem] p-5 shadow-2xl transition-all ${
                    msg.isSystem
                      ? 'bg-red-950/20 border border-red-500/20 text-red-500 italic text-xs w-full text-center py-2'
                      : msg.isFromUser 
                        ? 'bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-none' 
                        : 'bg-blue-600 text-white border border-blue-400/20 rounded-br-none shadow-blue-600/20'
                  }`}>
                    {!msg.isFromUser && !msg.isSystem && (
                      <div className="text-[8px] uppercase font-black text-blue-200 mb-2 tracking-widest opacity-60">
                        Authorized Agent
                      </div>
                    )}
                    <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">{msg.text}</p>
                    {!msg.isSystem && (
                      <div className="text-[9px] mt-3 opacity-30 text-right font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-8 bg-slate-900/50 border-t border-slate-800 backdrop-blur-xl">
              <form onSubmit={handleSendReply} className="flex items-center space-x-4">
                <input 
                  type="text" 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Secure reply to ${selectedTicket.userName}...`}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-6 py-4.5 text-sm text-white focus:border-blue-500 outline-none shadow-inner transition-all"
                />
                <button 
                  type="submit" 
                  disabled={!replyText.trim()}
                  className="px-8 py-4.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black flex items-center shadow-2xl shadow-blue-600/30 active:scale-95 disabled:opacity-50 transition-all uppercase tracking-widest text-xs"
                >
                  <Send size={16} className="mr-3" /> Dispatch
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
             <div className="w-32 h-32 bg-slate-900 rounded-[2.5rem] flex items-center justify-center border border-slate-800 mb-8 shadow-2xl">
                <MessageSquare size={54} className="text-slate-800" />
             </div>
             <h2 className="text-2xl font-black text-slate-400 mb-4 uppercase tracking-tighter">Support Terminal Idle</h2>
             <p className="text-slate-600 max-w-xs text-sm font-medium leading-relaxed">Select a communication thread from the inbox to initiate an encrypted administrative session.</p>
          </div>
        )}
      </div>
    </div>
  );
};
