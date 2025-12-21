
import React, { useState, useEffect, useRef } from 'react';
import { supportService, SupportTicket } from '../../services/support';
import { Button } from '../../components/ui';
import { Send, Search, User as UserIcon, MessageSquare, Wifi, ShieldCheck, RefreshCw } from 'lucide-react';

export const AdminSupport: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isLive, setIsLive] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const syncData = () => {
    const updatedTickets = supportService.getTickets();
    setTickets(updatedTickets);
  };

  useEffect(() => {
    syncData();
    // Listen for both custom sync events and cross-tab storage changes
    window.addEventListener('support_sync_update', syncData);
    
    // Fallback polling for maximum reliability in production scenarios
    const interval = setInterval(syncData, 3000);
    
    return () => {
        window.removeEventListener('support_sync_update', syncData);
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

    supportService.sendMessage(selectedUserId, 'Admin', replyText, false);
    setReplyText('');
    syncData();
  };

  return (
    <div className="h-[calc(100vh-14rem)] flex bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
      {/* Sidebar / Ticket List */}
      <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-950/40">
        <div className="p-6 border-b border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <MessageSquare size={20} className="mr-2 text-blue-500" /> Inbox
            </h2>
            <button 
              onClick={syncData}
              className={`flex items-center space-x-1.5 px-2 py-1 rounded text-[10px] font-bold transition-colors ${isLive ? 'text-green-400 bg-green-400/10' : 'text-slate-500 bg-slate-500/10'}`}
            >
              <RefreshCw size={12} className={isLive ? 'animate-spin-slow' : ''} />
              <span>SYNCED</span>
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:border-blue-500 outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {tickets.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-xs italic flex flex-col items-center">
              <Wifi size={24} className="mb-2 opacity-20" />
              Waiting for incoming user connections...
            </div>
          ) : (
            tickets.map(ticket => (
              <button
                key={ticket.userId}
                onClick={() => {
                  setSelectedUserId(ticket.userId);
                  supportService.markAsRead(ticket.userId);
                  syncData();
                }}
                className={`w-full p-4 flex items-start space-x-3 transition-all border-b border-slate-800/50 text-left ${
                  selectedUserId === ticket.userId ? 'bg-blue-600/10 border-r-4 border-blue-500' : 'hover:bg-slate-800/50'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold shrink-0 border border-slate-700">
                  {ticket.userName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-sm font-bold text-white truncate">{ticket.userName}</span>
                    <span className="text-[9px] text-slate-500">
                      {new Date(ticket.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate leading-relaxed">
                    {ticket.lastMessage}
                  </p>
                </div>
                {ticket.unreadCount > 0 && (
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-[0_0_10px_rgba(37,99,235,0.5)]">
                    {ticket.unreadCount}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-950/20">
        {selectedTicket ? (
          <>
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/80 backdrop-blur-md">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white border border-blue-400 shadow-xl">
                  <UserIcon size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold">{selectedTicket.userName}</h3>
                  <p className="text-[10px] text-green-400 flex items-center uppercase tracking-widest font-black">
                    <span className="w-2 h-2 rounded-full bg-green-400 mr-2 shadow-[0_0_8px_#10b981] animate-pulse"></span> Encrypted Line
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
              {selectedTicket.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isFromUser ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[70%] rounded-2xl p-5 shadow-2xl border transition-all ${
                    msg.isFromUser 
                      ? 'bg-slate-800 text-slate-200 border-slate-700 rounded-bl-none' 
                      : 'bg-blue-600 text-white border-blue-500/50 rounded-br-none'
                  }`}>
                    {!msg.isFromUser && (
                      <div className="text-[9px] uppercase font-black opacity-50 mb-2 tracking-[0.1em]">
                        Priority Administrator
                      </div>
                    )}
                    <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">{msg.text}</p>
                    <div className="text-[10px] mt-3 opacity-40 text-right font-mono italic">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-6 bg-slate-900/80 border-t border-slate-800 backdrop-blur-md">
              <form onSubmit={handleSendReply} className="flex items-center space-x-4">
                <input 
                  type="text" 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${selectedTicket.userName}...`}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4 text-sm text-white focus:border-blue-600 outline-none shadow-inner"
                />
                <button 
                  type="submit" 
                  disabled={!replyText.trim()}
                  className="px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold flex items-center shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50 transition-all"
                >
                  <Send size={20} className="mr-2" /> DISPATCH
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-700 space-y-6 p-12 text-center">
             <div className="w-32 h-32 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800 shadow-2xl">
                <ShieldCheck size={54} className="opacity-10" />
             </div>
             <div>
                <p className="text-xl font-black text-slate-400 uppercase tracking-widest">Gateway Ready</p>
                <p className="text-sm text-slate-600 mt-2 max-w-xs mx-auto">Select a customer thread from the left to start a real-time intervention.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
