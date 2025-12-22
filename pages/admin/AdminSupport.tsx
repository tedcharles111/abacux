
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supportService, SupportTicket, ChatMessage } from '../../services/support';
import { Button } from '../../components/ui';
import { Send, Search, User as UserIcon, MessageSquare, Wifi, RefreshCw, Bell, Radio, X, Terminal, Cpu } from 'lucide-react';

export const AdminSupport: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>(supportService.getTickets());
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [notification, setNotification] = useState<{name: string, text: string} | null>(null);
  const [stream, setStream] = useState<string[]>(["[SYS] Uplink established", "[SYS] Monitoring secure channels..."]);
  const [pulse, setPulse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => setStream(prev => [msg, ...prev].slice(0, 10));

  const syncList = () => {
    setTickets(supportService.getTickets());
    setPulse(true);
    setTimeout(() => setPulse(false), 300);
  };

  useEffect(() => {
    // General ticket list sync
    const unsubAll = supportService.subscribeToAll(syncList);
    
    // INSTANT message injection logic
    const unsubMessages = supportService.subscribeToMessages(({ message, userId }) => {
      addLog(`[MSG] Incoming from ${userId.substring(0, 6)}...`);
      syncList();

      // If the message is for the user the admin is currently viewing
      if (userId === selectedUserId || (selectedUserId && !message.isFromUser && message.senderId !== 'admin_support')) {
        // Force the active messages to update by adding the new one if not already there
        setActiveMessages(prev => {
          if (prev.find(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }

      // Notification for background users
      if (userId !== selectedUserId && message.isFromUser) {
        const sender = supportService.getTicket(userId);
        setNotification({ name: sender?.userName || 'User', text: message.text });
        setTimeout(() => setNotification(null), 6000);
        try { new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3').play(); } catch(e){}
      }
    });
    
    syncList();
    return () => {
      unsubAll();
      unsubMessages();
    };
  }, [selectedUserId]);

  // Update messages when switching users
  useEffect(() => {
    if (selectedUserId) {
      const ticket = supportService.getTicket(selectedUserId);
      setActiveMessages(ticket?.messages || []);
      supportService.markAsRead(selectedUserId, true);
      addLog(`[SYS] Focused user: ${selectedUserId}`);
    } else {
      setActiveMessages([]);
    }
  }, [selectedUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !replyText.trim()) return;

    const msg = supportService.sendMessage(selectedUserId, 'Systems Support', replyText.trim(), false);
    // Locally append to ensure zero-latency feel even before broadcast returns
    setActiveMessages(prev => [...prev, msg]);
    setReplyText('');
    supportService.setTyping('admin', false);
    addLog(`[SYS] Response transmitted.`);
  };

  const onInputChange = (val: string) => {
    setReplyText(val);
    if (selectedUserId) supportService.setTyping('admin', val.length > 0);
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-slate-950 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
      
      {/* Toast Notification */}
      {notification && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[100] bg-blue-600 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center space-x-5 animate-in slide-in-from-top-12 duration-500 border border-blue-400/30">
           <div className="bg-white/20 p-3 rounded-2xl animate-pulse">
             <Bell size={24} />
           </div>
           <div className="flex-1 min-w-0">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Direct Signal Intercepted</p>
             <p className="text-sm font-bold truncate">{notification.name}: {notification.text}</p>
           </div>
           <button onClick={() => setNotification(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
             <X size={20} />
           </button>
        </div>
      )}

      {/* Sidebar - Terminal Look */}
      <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-900/40">
        <div className="p-8 border-b border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-white flex items-center uppercase tracking-tighter">
              <Radio size={22} className="mr-3 text-blue-500 animate-pulse" /> Nodes
            </h2>
            <div className={`px-3 py-1 rounded-full text-[9px] font-black transition-all duration-500 ${pulse ? 'bg-green-500 text-black' : 'bg-slate-800 text-slate-500'}`}>
              {pulse ? 'DATA_SYNC' : 'IDLE'}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
            <input 
              type="text" 
              placeholder="Filter active signals..." 
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-xs text-white focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide py-4">
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-12 text-center opacity-10">
              <Wifi size={64} className="mb-6" />
              <p className="text-xs font-black uppercase tracking-[0.4em]">Zero Signals</p>
            </div>
          ) : (
            tickets.map(ticket => (
              <button
                key={ticket.userId}
                onClick={() => setSelectedUserId(ticket.userId)}
                className={`w-full p-6 flex items-start space-x-4 transition-all border-b border-slate-800/30 text-left relative ${
                  selectedUserId === ticket.userId ? 'bg-blue-600/10 border-r-4 border-blue-500' : 'hover:bg-slate-800/40'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 shadow-lg transition-colors ${
                  selectedUserId === ticket.userId ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'
                }`}>
                  {ticket.userName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-black text-white truncate">{ticket.userName}</span>
                    <span className="text-[9px] text-slate-600 font-mono">
                      {new Date(ticket.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-[11px] truncate leading-relaxed ${ticket.unreadCount > 0 ? 'text-blue-400 font-bold' : 'text-slate-500'}`}>
                    {ticket.lastMessage || 'Waiting for first packet...'}
                  </p>
                </div>
                {ticket.unreadCount > 0 && (
                  <div className="absolute top-1/2 -translate-y-1/2 right-6 w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping"></div>
                )}
              </button>
            ))
          )}
        </div>

        {/* RAW DATA STREAM FOOTER */}
        <div className="p-4 bg-black/40 border-t border-slate-800 font-mono text-[9px] text-blue-500/50 uppercase overflow-hidden h-32">
           <div className="flex items-center mb-2 text-blue-400/80">
             <Terminal size={10} className="mr-2" /> RAW_PACKET_STREAM
           </div>
           {stream.map((line, i) => (
             <div key={i} className="truncate">{line}</div>
           ))}
        </div>
      </div>

      {/* Main Chat Core */}
      <div className="flex-1 flex flex-col bg-slate-950 relative">
        {selectedUserId ? (
          <>
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/20 backdrop-blur-3xl z-10">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-2xl border border-blue-400/30">
                  <UserIcon size={28} />
                </div>
                <div>
                  <h3 className="text-white font-black text-xl tracking-tight">{supportService.getTicket(selectedUserId)?.userName}</h3>
                  <div className="flex items-center space-x-3 mt-1">
                    <div className="flex items-center">
                       <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2 shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
                       <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Live Connection Established</span>
                    </div>
                    <span className="text-slate-800">|</span>
                    <span className="text-[10px] text-slate-600 font-mono">{selectedUserId}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                 <div className="bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3 flex flex-col items-center">
                    <span className="text-[8px] text-slate-500 font-black uppercase mb-1">Signal</span>
                    <div className="flex items-end space-x-0.5 h-3">
                       <div className="w-1 bg-green-500 h-1"></div>
                       <div className="w-1 bg-green-500 h-2"></div>
                       <div className="w-1 bg-green-500 h-3"></div>
                       <div className="w-1 bg-green-500 h-2.5"></div>
                    </div>
                 </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-12 space-y-8 scrollbar-hide bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')]">
              {activeMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isFromUser ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-6 duration-500`}>
                  <div className={`max-w-[70%] rounded-[2rem] p-6 shadow-2xl transition-all relative ${
                    msg.isFromUser 
                      ? 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none' 
                      : (msg.isAI ? 'bg-indigo-600/10 border border-indigo-500/30 text-indigo-100 rounded-br-none backdrop-blur-sm' : 'bg-blue-600 text-white border border-blue-400/30 rounded-br-none shadow-blue-600/20 shadow-xl')
                  }`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[9px] uppercase font-black tracking-widest opacity-40">
                        {msg.isFromUser ? 'User Signal' : (msg.isAI ? 'Neural Response' : 'Admin Overlay')}
                      </span>
                      <span className="text-[9px] font-mono opacity-30">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">{msg.text}</p>
                    {msg.isFromUser && (
                      <div className="absolute -left-2 -bottom-2 bg-slate-800 border border-slate-700 p-2 rounded-xl text-blue-500 shadow-xl">
                        <Cpu size={14} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-10 bg-slate-900/80 backdrop-blur-2xl border-t border-slate-800">
              <form onSubmit={handleSendReply} className="flex items-center space-x-6">
                <div className="flex-1 relative group">
                  <input 
                    type="text" 
                    autoFocus
                    value={replyText}
                    onChange={(e) => onInputChange(e.target.value)}
                    placeholder={`Transmit response to user node...`}
                    className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-5 text-sm text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:text-slate-700"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center space-x-2 text-[10px] text-slate-800 font-mono">
                     <span>ENCRYPTED_AES256</span>
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={!replyText.trim()}
                  className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-black flex items-center shadow-2xl shadow-blue-600/30 active:scale-95 disabled:opacity-30 transition-all uppercase tracking-widest text-xs border border-blue-400/20"
                >
                  <Send size={18} className="mr-3" /> Transmit
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-950">
             <div className="w-56 h-56 bg-slate-900 rounded-[4rem] flex items-center justify-center border border-slate-800 mb-12 shadow-inner group overflow-hidden relative">
                <div className="absolute inset-0 bg-blue-600/5 animate-pulse"></div>
                <Radio size={80} className="text-slate-800 group-hover:text-blue-500 transition-colors relative z-10" />
             </div>
             <h2 className="text-4xl font-black text-slate-400 mb-6 uppercase tracking-[0.3em]">Monitoring Network</h2>
             <p className="text-slate-600 max-w-sm text-sm leading-relaxed font-bold uppercase tracking-widest opacity-50">Awaiting encrypted peer-to-peer support requests from active trading nodes.</p>
          </div>
        )}
      </div>
    </div>
  );
};
