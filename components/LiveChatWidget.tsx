import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minus, User as UserIcon } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

export const LiveChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! Welcome to AbacusX Support. I'm Agent Sarah. How can I help you with your crypto journey today?",
      sender: 'agent',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen for custom event to open chat from other pages (like Support.tsx)
  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-live-chat', handleOpenChat);
    return () => window.removeEventListener('open-live-chat', handleOpenChat);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    // Mock AI Response Logic
    setTimeout(() => {
      const lowerInput = newUserMsg.text.toLowerCase();
      let responseText = "I'm connecting you with a specialist who can help with that specific inquiry. Please hold on a moment...";

      if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        responseText = "Hi there! What can I do for you?";
      } else if (lowerInput.includes('kyc') || lowerInput.includes('verify')) {
        responseText = "Identity verification (KYC) typically takes 1-2 hours. You can upload your documents in the Settings > Identity section.";
      } else if (lowerInput.includes('withdraw') || lowerInput.includes('money')) {
        responseText = "Withdrawals are processed instantly for amounts under $10,000. For larger amounts, we require a manual security check which takes up to 24 hours.";
      } else if (lowerInput.includes('deposit') || lowerInput.includes('fund')) {
        responseText = "You can deposit funds using bank transfer, credit card, or directly via crypto wallet addresses found in your Wallet page.";
      } else if (lowerInput.includes('password') || lowerInput.includes('login')) {
        responseText = "If you're having trouble logging in, please use the 'Forgot Password' link on the login page or I can escalate this to security.";
      }

      const newAgentMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'agent',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newAgentMsg]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000); // Random delay between 1.5s and 2.5s
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      <div 
        className={`pointer-events-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col transition-all duration-300 origin-bottom-right overflow-hidden ${
          isOpen ? 'scale-100 opacity-100 mb-4' : 'scale-0 opacity-0 mb-0 h-0'
        }`}
        style={{ maxHeight: '600px', height: '500px' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                AS
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-blue-600 rounded-full"></div>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Agent Sarah</h3>
              <p className="text-blue-100 text-xs flex items-center">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-200 mr-1 animate-pulse"></span>
                Online
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
             <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
               <Minus size={20} />
             </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900 scrollbar-thin scrollbar-thumb-slate-700">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                }`}
              >
                {msg.text}
                <div className={`text-[10px] mt-1 opacity-50 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
               <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none px-4 py-3 flex items-center space-x-1">
                 <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                 <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
          <form onSubmit={handleSendMessage} className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-slate-950 text-white placeholder-slate-500 rounded-full pl-4 pr-12 py-3 border border-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm transition-all"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
            >
              <Send size={16} />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-slate-600">Powered by AbacusX AI • Encryption Enabled</span>
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`pointer-events-auto h-16 w-16 rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center transition-all duration-300 transform hover:scale-110 z-50 relative ${
          isOpen ? 'bg-slate-700 text-white rotate-90' : 'bg-blue-600 text-white rotate-0'
        }`}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
        
        {/* Notification Badge */}
        {!isOpen && (
           <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 border-2 border-slate-900 rounded-full"></span>
        )}

        {/* Tooltip */}
        <div 
           className={`absolute right-20 bg-white text-slate-900 px-3 py-1 rounded-lg text-sm font-bold shadow-lg transition-all duration-300 whitespace-nowrap ${
             isHovered && !isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
           }`}
        >
          Chat with Support
          <div className="absolute right-[-4px] top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rotate-45"></div>
        </div>
      </button>
    </div>
  );
};
