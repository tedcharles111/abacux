
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Minus, ShieldCheck, Headset, Paperclip, FileText, File, Image as ImageIcon } from 'lucide-react';
import { supportService, ChatMessage } from '../services/support';
import { User } from '../types';

interface FileAttachment {
  name: string;
  type: string;
  size: number;
}

export const LiveChatWidget: React.FC<{ user: User | null }> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userId = user?.id || 'anonymous_guest';
  const userName = user?.fullName || 'Guest User';

  // Sync messages with support service
  useEffect(() => {
    const handleUpdate = () => {
      const ticket = supportService.getTicket(userId);
      if (ticket) {
        setMessages([...ticket.messages]);
      }
    };

    handleUpdate(); // Initial load
    window.addEventListener('support_update', handleUpdate);
    return () => window.removeEventListener('support_update', handleUpdate);
  }, [userId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const text = inputValue;
    setInputValue('');
    supportService.sendMessage(userId, userName, text, true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const attachment: FileAttachment = {
      name: file.name,
      type: file.type,
      size: file.size
    };

    supportService.sendMessage(userId, userName, `Uploaded file: ${file.name}`, true, attachment);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon size={20} className="text-blue-400" />;
    if (type.includes('pdf')) return <FileText size={20} className="text-red-400" />;
    return <File size={20} className="text-slate-400" />;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      <div 
        className={`pointer-events-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col transition-all duration-300 origin-bottom-right overflow-hidden ${
          isOpen ? 'scale-100 opacity-100 mb-4' : 'scale-0 opacity-0 mb-0 h-0'
        }`}
        style={{ maxHeight: '600px', height: '500px' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg">
                <ShieldCheck size={20} />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-slate-900 rounded-full"></div>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">AbacusX Concierge</h3>
              <p className="text-slate-400 text-xs flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span> Secured & Online
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
             <Minus size={20} />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900 scrollbar-thin scrollbar-thumb-slate-700">
          {messages.length === 0 && (
             <div className="text-center py-10">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Headset className="text-blue-500" size={24} />
                </div>
                <p className="text-sm text-slate-400">Our administrators are online and ready to help. Send a message to start.</p>
             </div>
          )}
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.isFromUser ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2 ${
                  msg.isFromUser 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                }`}
              >
                {msg.attachment ? (
                  <div className="flex items-center space-x-3 bg-slate-900/40 p-2 rounded-lg border border-white/10 mb-2">
                    <div className="bg-slate-950 p-2 rounded-md">
                      {getFileIcon(msg.attachment.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{msg.attachment.name}</p>
                      <p className="text-[10px] opacity-70 uppercase">{formatFileSize(msg.attachment.size)}</p>
                    </div>
                  </div>
                ) : null}
                {msg.text}
                <div className={`text-[10px] mt-1 opacity-50 ${msg.isFromUser ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Message Support..."
                className="w-full bg-slate-950 text-white placeholder-slate-600 rounded-xl pl-4 pr-10 py-3 border border-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm transition-all"
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-blue-400 transition-colors"
              >
                <Paperclip size={18} />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            </div>
            <button 
              type="submit"
              disabled={!inputValue.trim()}
              className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-30 transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`pointer-events-auto h-16 w-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 z-50 relative ${
          isOpen ? 'bg-slate-800 text-white border border-slate-700' : 'bg-blue-600 text-white'
        }`}
      >
        {isOpen ? <X size={28} /> : <Headset size={28} />}
      </button>
    </div>
  );
};
