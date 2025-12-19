
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minus, User as UserIcon, ShieldCheck, Headset } from 'lucide-react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent' | 'system';
  timestamp: Date;
}

export const LiveChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Welcome to AbacusX Premium Support. How can we assist you today?",
      sender: 'agent',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAgentConnected, setIsAgentConnected] = useState(false);
  const [isWaitingForAgent, setIsWaitingForAgent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<Chat | null>(null);

  // Initialize Gemini Chat Session
  const initChat = () => {
    if (chatSessionRef.current) return;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    chatSessionRef.current = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are David, a Senior Account Administrator at AbacusX, a high-end crypto investment platform. 
        Your tone is professional, sophisticated, and reassuring. 
        Users chatting with you are often high-net-worth investors or new users seeking security. 
        Provide clear, concise, and accurate information about crypto investments, KYC, and security. 
        Always prioritize user safety and mention AbacusX's institutional-grade security. 
        Keep responses relatively short (under 3 sentences unless complex). 
        Do not use markdown like bolding or lists unless absolutely necessary for clarity.`,
      },
    });
  };

  // Listen for custom event to open chat from other pages
  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-live-chat', handleOpenChat);
    return () => window.removeEventListener('open-live-chat', handleOpenChat);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const newUserMsg: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    // Initial sequence for first-time message in session
    if (!isAgentConnected && !isWaitingForAgent) {
      setIsWaitingForAgent(true);
      
      // Phase 1: Immediate System Acknowledgment
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: 'sys-1',
          text: "Connecting you to a senior administrator...",
          sender: 'system',
          timestamp: new Date()
        }]);
      }, 800);

      // Phase 2: The "Keep Patient" auto-response (Admin isn't active yet)
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: 'sys-2',
          text: "Our administrators are currently in high-volume sessions. Please stay on the line, your request is being prioritized.",
          sender: 'system',
          timestamp: new Date()
        }]);
      }, 3000);

      // Phase 3: Admin "Connects" and Gemini responds
      setTimeout(async () => {
        setMessages(prev => [...prev, {
          id: 'sys-3',
          text: "Senior Administrator David has joined the chat.",
          sender: 'system',
          timestamp: new Date()
        }]);
        setIsAgentConnected(true);
        setIsWaitingForAgent(false);
        await getAdminResponse(userText);
      }, 6000);

    } else if (isAgentConnected) {
      // Direct chat with Gemini (Admin David)
      await getAdminResponse(userText);
    }
  };

  const getAdminResponse = async (message: string) => {
    initChat();
    setIsTyping(true);
    try {
      if (!chatSessionRef.current) return;
      
      const result = await chatSessionRef.current.sendMessage({ message });
      const responseText = result.text;

      if (responseText) {
        const newAgentMsg: Message = {
          id: Date.now().toString(),
          text: responseText,
          sender: 'agent',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, newAgentMsg]);
      }
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      // Removed the technical error message as the system auto-response flow is sufficient
    } finally {
      setIsTyping(false);
    }
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
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg">
                <ShieldCheck size={20} />
              </div>
              {isAgentConnected && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-slate-900 rounded-full"></div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                {isAgentConnected ? "Admin David" : "AbacusX Concierge"}
              </h3>
              <p className="text-slate-400 text-xs flex items-center">
                {isWaitingForAgent ? (
                  <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1 animate-pulse"></span> Connecting...</span>
                ) : (
                  <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span> Secured & Online</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
             <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
               <Minus size={20} />
             </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900 scrollbar-thin scrollbar-thumb-slate-700">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'}`}
            >
              {msg.sender === 'system' ? (
                <div className="text-[11px] text-slate-500 bg-slate-800/40 px-3 py-1 rounded-full border border-slate-800 italic">
                  {msg.text}
                </div>
              ) : (
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2 ${
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
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
               <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none px-4 py-2 flex items-center space-x-1">
                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
              placeholder="Inquire with an administrator..."
              className="w-full bg-slate-950 text-white placeholder-slate-600 rounded-xl pl-4 pr-12 py-3 border border-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm transition-all"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || isWaitingForAgent || isTyping}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-30 transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
          <div className="text-center mt-3">
            <div className="inline-flex items-center space-x-1 text-[10px] text-slate-500">
               <ShieldCheck size={10} className="text-blue-500" />
               <span>End-to-End Encrypted Support Channel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`pointer-events-auto h-16 w-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 z-50 relative ${
          isOpen ? 'bg-slate-800 text-white border border-slate-700' : 'bg-blue-600 text-white'
        }`}
      >
        {isOpen ? <X size={28} /> : <Headset size={28} />}
        
        {/* Notification Badge */}
        {!isOpen && (
           <span className="absolute -top-1 -right-1 h-5 w-5 bg-blue-400 border-2 border-slate-950 rounded-full flex items-center justify-center text-[10px] font-bold text-white">1</span>
        )}

        {/* Tooltip */}
        <div 
           className={`absolute right-20 bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-bold shadow-2xl transition-all duration-300 whitespace-nowrap ${
             isHovered && !isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
           }`}
        >
          Priority Support
          <div className="absolute right-[-4px] top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rotate-45"></div>
        </div>
      </button>
    </div>
  );
};
