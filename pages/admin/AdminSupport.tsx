
import React, { useState, useEffect, useRef } from 'react';
import { supportService, SupportTicket } from '../../services/support';
import { Card, Button, Input, Badge } from '../../components/ui';
import { Send, Search, User as UserIcon, CheckCircle, Clock, Paperclip, MoreVertical } from 'lucide-react';

export const AdminSupport: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadTickets = () => {
    setTickets(supportService.getTickets());
  };

  useEffect(() => {
    loadTickets();
    const handleUpdate = () => loadTickets();
    window.addEventListener('support_update', handleUpdate);
    return () => window.removeEventListener('support_update', handleUpdate);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedUserId, tickets]);

  const selectedTicket = selectedUserId ? tickets.find(t => t.userId === selectedUserId) : null;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !replyText.trim()) return;

    supportService.sendMessage(selectedUserId, 'Admin', replyText, false);
    setReplyText('');
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    supportService.markAsRead(userId);
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Sidebar - Ticket List */}
      <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-900/50">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white mb-4">Support Inbox</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {tickets.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No active support requests.</div>
          ) : (
            tickets.map(ticket => (
              <button
                key={ticket.userId}
                onClick={() => handleSelectUser(ticket.userId)}
                className={`w-full p-4 flex items-start space-x-3 transition-colors border-b border-slate-800/50 text-left ${
                  selectedUserId === ticket.userId ? 'bg-blue-600/10 border-r-4 border-r-blue-500' : 'hover:bg-slate-800'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold shrink-0">
                  {ticket.userName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-white truncate">{ticket.userName}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(ticket.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{ticket.lastMessage}</p>
                </div>
                {ticket.unreadCount > 0 && (
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                    {ticket.unreadCount}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-950/30">
        {selectedTicket ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <UserIcon size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold">{selectedTicket.userName}</h3>
                  <p className="text-xs text-green-400 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5"></span>
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => supportService.closeTicket(selectedTicket.userId)}>
                  Close Ticket
                </Button>
                <button className="p-2 text-slate-400 hover:text-white"><MoreVertical size={20} /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedTicket.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isFromUser ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${
                    msg.isFromUser 
                      ? 'bg-slate-800 text-slate-200 rounded-bl-none' 
                      : 'bg-blue-600 text-white rounded-br-none'
                  }`}>
                    {msg.attachment && (
                      <div className="mb-3 p-3 bg-black/20 rounded-lg flex items-center space-x-3 border border-white/10">
                        <Paperclip size={16} />
                        <span className="text-xs font-bold truncate">{msg.attachment.name}</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <div className={`text-[10px] mt-2 opacity-60 ${msg.isFromUser ? 'text-left' : 'text-right'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-slate-900 border-t border-slate-800">
              <form onSubmit={handleSendReply} className="flex items-center space-x-3">
                <button type="button" className="text-slate-500 hover:text-blue-400 transition-colors">
                  <Paperclip size={20} />
                </button>
                <input 
                  type="text" 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response to the user..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-600 transition-all"
                />
                <Button type="submit" disabled={!replyText.trim()}>
                  <Send size={18} className="mr-2" />
                  Send
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4">
            <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center">
              <MessageCircle size={40} className="text-slate-800" />
            </div>
            <p className="text-lg">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

import { MessageCircle } from 'lucide-react';
