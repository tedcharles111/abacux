
import React, { useState, useEffect, useRef } from 'react';
import { supportService, SupportTicket } from '../../services/support';
import { Button } from '../../components/ui';
import { Send, Search, User as UserIcon, MessageSquare, Wifi, RefreshCw, Clock } from 'lucide-react';

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
    // Initial load
    refresh();

    // 1. Reactive Subscription (Instant updates)
    const unsubscribe = supportService.subscribe(refresh);

    // 2. Aggressive Polling Fallback (Every 1 second)
    // Ensures messages are received even if signals are missed
    const interval = setInterval(refresh, 1000);

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

    supportService.sendMessage(selectedUserId, 'Support Agent', replyText, false);
    setReplyText('');
    refresh();
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-950/40">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <MessageSquare size={20} className="mr-2 text-blue-500" /> Support
            </h2>
            <div className="flex items-center space-x-1 px-2 py-1 bg-green-500/10 rounded text-[10px] font-black text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span>LIVE</span>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text" 
              placeholder="Filter users..." 
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center opacity-30">
              <Wifi size={40} className="mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest">Awaiting Messages</p>
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
                className={`w-full p-5 flex items-start space-x-4 transition-all border-b border-slate-800/50 text-left relative ${
                  selectedUserId === ticket.userId ? 'bg-blue-600/10 border-r-4 border-blue-500' : 'hover:bg-slate-800/50'
                }`}
              >
                <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 font-bold border border-slate-700 shadow-lg">
                  {ticket.userName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-white truncate">{ticket.userName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(ticket.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate font-medium">
                    {ticket.lastMessage}
                  </p>
                </div>
                {ticket.unreadCount > 0 && (
                  <div className="absolute top-5 right-5 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold animate-bounce shadow-lg shadow-red-500/40">
                    {ticket.unreadCount}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
        <div className="p-3 bg-slate-900 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between font-mono">
          <span>SYNC: {lastSync.toLocaleTimeString()}</span>
          <span className="text-green-500">READY</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-950/20 relative">
        {selectedTicket ? (
          <>
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/40 backdrop-blur-xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white border border-blue-400 shadow-xl">
                  <UserIcon size={24} />
                </div>
                <div>
                  <h3 className="text-white font-extrabold text-lg">{selectedTicket.userName}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Thread - {selectedTicket.userId}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
              {selectedTicket.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isFromUser ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[75%] rounded-3xl p-6 shadow-2xl transition-all ${
                    msg.isFromUser 
                      ? 'bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-none' 
                      : 'bg-blue-600 text-white border border-blue-400/30 rounded-br-none shadow-blue-500/10'
                  }`}>
                    {!msg.isFromUser && (
                      <div className="text-[9px] uppercase font-black text-blue-200 mb-2 tracking-widest">
                        Official Administrator
                      </div>
                    )}
                    <p className="text-[15px] leading-relaxed font-medium whitespace-pre-wrap">{msg.text}</p>
                    <div className="text-[10px] mt-4 opacity-40 text-right font-mono italic">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-8 bg-slate-900 border-t border-slate-800">
              <form onSubmit={handleSendReply} className="flex items-center space-x-4">
                <input 
                  type="text" 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Type a direct message to ${selectedTicket.userName}...`}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-6 py-5 text-sm text-white focus:border-blue-500 outline-none shadow-inner transition-all"
                />
                <button 
                  type="submit" 
                  disabled={!replyText.trim()}
                  className="px-8 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold flex items-center shadow-2xl shadow-blue-600/30 active:scale-95 disabled:opacity-50 transition-all uppercase tracking-widest text-sm"
                >
                  <Send size={18} className="mr-3" /> Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
             <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800 mb-6 shadow-2xl">
                <MessageSquare size={40} className="text-slate-700" />
             </div>
             <h2 className="text-2xl font-bold text-slate-400 mb-2 uppercase tracking-tighter">Support Terminal</h2>
             <p className="text-slate-600 max-w-xs text-sm">Select a user conversation from the inbox to begin a secure chat session.</p>
          </div>
        )}
      </div>
    </div>
  );
};
