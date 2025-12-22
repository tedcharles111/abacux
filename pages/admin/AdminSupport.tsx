
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supportService, SupportTicket, ChatMessage } from '../../services/support';
import { Button } from '../../components/ui';
import { Send, Search, User as UserIcon, MessageSquare, Wifi, RefreshCw, Bell, Radio, X, Terminal, Cpu, Activity } from 'lucide-react';

export const AdminSupport: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>(supportService.getTickets());
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [notification, setNotification] = useState<{name: string, text: string} | null>(null);
  const [systemLogs, setSystemLogs] = useState<string[]>(["[READY] Awaiting incoming signals..."]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setSystemLogs(prev => [`[${timestamp}] ${msg}`, ...prev].slice(0, 15));
  };

  const syncState = () => {
    const allTickets = supportService.getTickets();
    setTickets(allTickets);
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 400);

    // If we have a user selected, refresh their messages specifically
    if (selectedUserId) {
      const current = supportService.getTicket(selectedUserId);
      if (current) {
        setActiveMessages(current.messages);
      }
    }
  };

  useEffect(() => {
    // 1. Listen for global refreshes
    const unsubAll = supportService.subscribeToAll(syncState);
    
    // 2. Listen for DIRECT message signals for zero-latency injection
    const unsubMessages = supportService.subscribeToMessages(({ message, userId }) => {
      addLog(`SIGNAL_RCV: ${userId.substring(0, 6)} - "${message.text.substring(0, 15)}..."`);
      
      // Update the ticket list automatically
      setTickets(supportService.getTickets());

      // If the message is for the CURRENTLY OPENED chat
      if (userId === selectedUserId) {
        setActiveMessages(prev => {
          if (prev.find(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }

      // Show toast if from a user not currently being viewed
      if (userId !== selectedUserId && message.isFromUser) {
        const sender = supportService.getTicket(userId);
        setNotification({ name: sender?.userName || 'Anonymous Node', text: message.text });
        setTimeout(() => setNotification(null), 6000);
        try { new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3').play(); } catch(e){}
      }
    });
    
    syncState();
    return () => {
      unsubAll();
      unsubMessages();
    };
  }, [selectedUserId]);

  useEffect(() => {
    if (selectedUserId) {
      const ticket = supportService.getTicket(selectedUserId);
      setActiveMessages(ticket?.messages || []);
      supportService.markAsRead(selectedUserId, true);
      addLog(`UPLINK_ESTABLISHED: ${selectedUserId}`);
    }
  }, [selectedUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !replyText.trim()) return;

    const msg = supportService.sendMessage(selectedUserId, 'Admin Console', replyText.trim(), false);
    // Locally inject to UI immediately
    setActiveMessages(prev => [...prev, msg]);
    setReplyText('');
    addLog(`SIGNAL_SENT: Response transmitted to user.`);
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex bg-slate-950 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl relative">
      
      {/* Dynamic Signal Toast */}
      {notification && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[100] bg-blue-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 animate-in slide-in-from-top-12 border border-blue-400/20 backdrop-blur-md">
           <div className="bg-white/20 p-2.5 rounded-xl animate-pulse">
             <Bell size={20} />
           </div>
           <div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">High Priority Packet</p>
             <p className="text-sm font-bold truncate max-w-[200px]">{notification.name}: {notification.text}</p>
           </div>
           <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-50 transition-opacity">
             <X size={18} />
           </button>
        </div>
      )}

      {/* Sidebar: Node Monitoring */}
      <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-900/30">
        <div className="p-8 border-b border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-white flex items-center tracking-tighter uppercase">
              <Radio size={22} className="mr-3 text-blue-500 animate-pulse" /> Nodes
            </h2>
            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-[9px] font-black tracking-widest transition-all ${isRefreshing ? 'bg-green-500 text-black scale-105' : 'bg-slate-800 text-slate-500'}`}>
              <RefreshCw size={10} className={isRefreshing ? 'animate-spin' : ''} />
              <span>{isRefreshing ? 'SYNCING' : 'IDLE'}</span>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
            <input 
              type="text" 
              placeholder="Search active frequencies..." 
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-xs text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-800"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-12 text-center opacity-10">
              <Activity size={64} className="mb-6" />
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
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 shadow-lg ${
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
                  <p className={`text-[11px] truncate leading-relaxed ${ticket.unreadCount > 0 ? 'text-blue-400 font-bold' : 'text-slate-600'}`}>
                    {ticket.lastMessage || 'Waiting for initial handshake...'}
                  </p>
                </div>
                {ticket.unreadCount > 0 && (
                  <div className="absolute top-1/2 -translate-y-1/2 right-6 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                )}
              </button>
            ))
          )}
        </div>

        {/* LOG TERMINAL */}
        <div className="p-4 bg-black/60 border-t border-slate-800 font-mono text-[9px] text-blue-500/80 uppercase overflow-hidden h-40">
           <div className="flex items-center mb-2 text-blue-400/50">
             <Terminal size={10} className="mr-2" /> MONITOR_STREAM_V10.0
           </div>
           {systemLogs.map((log, i) => (
             <div key={i} className="truncate opacity-70 mb-0.5">{log}</div>
           ))}
        </div>
      </div>

      {/* Main Signal Core */}
      <div className="flex-1 flex flex-col bg-slate-950 relative">
        {selectedUserId ? (
          <>
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/10 backdrop-blur-3xl z-10">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-2xl border border-blue-400/20">
                  <UserIcon size={32} />
                </div>
                <div>
                  <h3 className="text-white font-black text-xl tracking-tight uppercase">Node: {supportService.getTicket(selectedUserId)?.userName}</h3>
                  <div className="flex items-center space-x-3 mt-1">
                    <div className="flex items-center">
                       <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                       <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Active Packet Stream</span>
                    </div>
                    <span className="text-slate-800">|</span>
                    <span className="text-[10px] text-slate-600 font-mono uppercase">ID: {selectedUserId}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-12 space-y-8 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] scrollbar-hide">
              {activeMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isFromUser ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-6 duration-300`}>
                  <div className={`max-w-[75%] rounded-3xl p-6 shadow-2xl transition-all border ${
                    msg.isFromUser 
                      ? 'bg-slate-900 text-slate-200 border-slate-800 rounded-bl-none' 
                      : (msg.isAI ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-100 rounded-br-none backdrop-blur-sm' : 'bg-blue-600 text-white border-blue-400/30 rounded-br-none shadow-blue-600/20 shadow-xl')
                  }`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[9px] uppercase font-black tracking-widest opacity-40">
                        {msg.isFromUser ? 'External Packet' : (msg.isAI ? 'AI Processor' : 'Admin Overlay')}
                      </span>
                      <span className="text-[9px] font-mono opacity-30">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-10 bg-slate-900/60 backdrop-blur-xl border-t border-slate-800">
              <form onSubmit={handleSendReply} className="flex items-center space-x-6">
                <input 
                  type="text" 
                  autoFocus
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Respond to node signal...`}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-8 py-5 text-sm text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:text-slate-800"
                />
                <button 
                  type="submit" 
                  disabled={!replyText.trim()}
                  className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black flex items-center shadow-2xl shadow-blue-600/30 active:scale-95 disabled:opacity-30 transition-all uppercase tracking-widest text-xs border border-blue-400/20"
                >
                  <Send size={18} className="mr-3" /> Transmit
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-950">
             <div className="w-64 h-64 bg-slate-900 rounded-[4rem] flex items-center justify-center border border-slate-800 mb-12 shadow-inner animate-pulse">
                <Radio size={80} className="text-slate-800" />
             </div>
             <h2 className="text-4xl font-black text-slate-500 mb-6 uppercase tracking-[0.2em]">Signal Hunt</h2>
             <p className="text-slate-600 max-w-sm text-sm leading-relaxed font-black uppercase tracking-widest opacity-40">Monitoring global bandwidth for peer-to-peer support requests.</p>
          </div>
        )}
      </div>
    </div>
  );
};
