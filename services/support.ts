
import { GoogleGenAI } from "@google/genai";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isFromUser: boolean;
  isAI?: boolean;
}

export interface SupportTicket {
  userId: string;
  userName: string;
  lastMessage: string;
  lastTimestamp: string;
  status: 'OPEN' | 'CLOSED';
  messages: ChatMessage[];
  unreadCount: number; 
  userUnreadCount: number;
}

const STORAGE_KEY = 'abacusx_support_v9';
const SYNC_CHANNEL = 'abacusx_sync_v9';
const UPDATE_EVENT = 'abacusx_support_update';
const MESSAGE_EVENT = 'abacusx_new_message';
const TYPING_EVENT = 'abacusx_typing_update';

const bc = new BroadcastChannel(SYNC_CHANNEL);

const getLedger = (): Record<string, SupportTicket> => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
};

const saveLedger = (db: Record<string, SupportTicket>, lastMessage?: ChatMessage) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  
  // Dispatch local events
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
  
  if (lastMessage) {
    const payload = { message: lastMessage, userId: lastMessage.isFromUser ? lastMessage.senderId : 'admin' };
    window.dispatchEvent(new CustomEvent(MESSAGE_EVENT, { detail: payload }));
    bc.postMessage({ type: 'NEW_MESSAGE', ...payload });
  } else {
    bc.postMessage({ type: 'REFRESH' });
  }
};

export const supportService = {
  getTickets: (): SupportTicket[] => {
    const db = getLedger();
    return Object.values(db).sort((a, b) => 
      new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime()
    );
  },

  getTicket: (userId: string): SupportTicket | null => {
    const db = getLedger();
    return db[userId] || null;
  },

  setTyping: (userId: string, isTyping: boolean) => {
    const detail = { userId, isTyping };
    bc.postMessage({ type: 'TYPING', ...detail });
    window.dispatchEvent(new CustomEvent(TYPING_EVENT, { detail }));
  },

  sendMessage: (userId: string, userName: string, text: string, isFromUser: boolean, isAI: boolean = false) => {
    const db = getLedger();
    
    if (!db[userId]) {
      db[userId] = {
        userId, userName, lastMessage: '', lastTimestamp: '',
        status: 'OPEN', messages: [], unreadCount: 0, userUnreadCount: 0
      };
    }

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      senderId: isFromUser ? userId : (isAI ? 'ai_support' : 'admin_support'),
      senderName: isFromUser ? userName : (isAI ? 'AbacusX AI' : 'AbacusX Support'),
      text,
      timestamp: new Date().toISOString(),
      isFromUser,
      isAI
    };

    db[userId].messages.push(newMessage);
    db[userId].lastMessage = text;
    db[userId].lastTimestamp = newMessage.timestamp;
    
    if (isFromUser) db[userId].unreadCount += 1;
    else db[userId].userUnreadCount += 1;

    saveLedger(db, newMessage);
    return newMessage;
  },

  getAIResponse: async (userId: string, userName: string, userMessage: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const ticket = supportService.getTicket(userId);
    const historyText = ticket?.messages.slice(-6).map(m => `${m.senderName}: ${m.text}`).join('\n') || 'None';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `The user ${userName} said: "${userMessage}". Respond as a helpful crypto support agent.`,
        config: {
          systemInstruction: `You are the AbacusX AI Support Specialist. 
          AbacusX is a premium crypto investment platform. 
          Your goals: 
          1. Be professional and concise. 
          2. Assist with wallet, investment, or KYC questions. 
          3. If the user seems frustrated, tell them a human specialist is monitoring this channel.
          Context History: ${historyText}`,
          temperature: 0.7,
        }
      });
      
      const aiText = response.text || "I've logged your request. A specialist will be with you shortly.";
      supportService.sendMessage(userId, userName, aiText, false, true);
    } catch (e) {
      console.error("Gemini Error:", e);
      // More helpful fallback for dev/demo purposes
      supportService.sendMessage(userId, userName, "Our AI specialist is currently updating. Please stand by for a human representative.", false, true);
    }
  },

  markAsRead: (userId: string, isAdmin: boolean) => {
    const db = getLedger();
    if (db[userId]) {
      if (isAdmin) db[userId].unreadCount = 0;
      else db[userId].userUnreadCount = 0;
      saveLedger(db);
    }
  },

  subscribeToAll: (callback: () => void) => {
    window.addEventListener(UPDATE_EVENT, callback);
    const bcHandler = (e: any) => { if (e.data.type === 'REFRESH') callback(); };
    bc.addEventListener('message', bcHandler);
    return () => {
      window.removeEventListener(UPDATE_EVENT, callback);
      bc.removeEventListener('message', bcHandler);
    };
  },

  subscribeToMessages: (callback: (payload: { message: ChatMessage, userId: string }) => void) => {
    const handler = (e: any) => callback(e.detail);
    window.addEventListener(MESSAGE_EVENT, handler);
    const bcHandler = (e: any) => { 
      if (e.data.type === 'NEW_MESSAGE') callback({ message: e.data.message, userId: e.data.userId }); 
    };
    bc.addEventListener('message', bcHandler);
    return () => {
      window.removeEventListener(MESSAGE_EVENT, handler);
      bc.removeEventListener('message', bcHandler);
    };
  },

  subscribeToTyping: (callback: (userId: string, isTyping: boolean) => void) => {
    const handler = (e: any) => callback(e.detail.userId, e.detail.isTyping);
    window.addEventListener(TYPING_EVENT, handler);
    const bcHandler = (e: any) => { if (e.data.type === 'TYPING') callback(e.data.userId, e.data.isTyping); };
    bc.addEventListener('message', bcHandler);
    return () => {
      window.removeEventListener(TYPING_EVENT, handler);
      bc.removeEventListener('message', bcHandler);
    };
  }
};
