
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Headset } from 'lucide-react';
import { Button } from './ui';
import { User, ChatMessage } from '../types';
import { api, CHAT_UPDATE_EVENT } from '../services/api';

interface LiveChatWidgetProps {
  user: User;
}

export const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      const fetchMessages = async () => {
        const history = await api.getChatMessages();
        setMessages(history);
      };
      fetchMessages();
    }
  }, [isOpen]);

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const handleChatUpdate = async () => {
      const history = await api.getChatMessages();
      setMessages(history);
    };

    window.addEventListener(CHAT_UPDATE_EVENT, handleChatUpdate);
    return () => window.removeEventListener(CHAT_UPDATE_EVENT, handleChatUpdate);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    await api.sendChatMessage(user, newMessage);
    setNewMessage('');
    const history = await api.getChatMessages();
    setMessages(history);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {isOpen ? (
        <div className="w-80 md:w-96 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 flex flex-col h-[60vh]">
          <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <Headset size={20} className="text-blue-500" />
              <h4 className="text-xs font-black text-white uppercase">Live Support Chat</h4>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-950">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender.id === user.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender.id === user.id ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-300 rounded-bl-none'}`}>
                  <p className="text-xs font-bold mb-1">{msg.sender.fullName}</p>
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-[10px] text-right mt-2 opacity-50">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-slate-900 border-t border-slate-700 flex-shrink-0">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
              <Button type="submit" size="icon" className="flex-shrink-0" aria-label="Send Message">
                <Send size={16} />
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <button aria-label="Open Live Chat" onClick={() => setIsOpen(true)} className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl border-4 border-slate-900 hover:scale-110 transition-transform">
          <MessageCircle size={28} />
        </button>
      )}
    </div>
  );
};
