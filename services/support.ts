
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

const STORAGE_KEY = 'abacusx_support_v7';
const SYNC_CHANNEL = 'abacusx_sync_v7';
const UPDATE_EVENT = 'abacusx_support_update';
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

const saveLedger = (db: Record<string, SupportTicket>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
  bc.postMessage({ type: 'REFRESH' });
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
    bc.postMessage({ type: 'TYPING', userId, isTyping });
    window.dispatchEvent(new CustomEvent(TYPING_EVENT, { detail: { userId, isTyping } }));
  },

  sendMessage: (userId: string, userName: string, text: string, isFromUser: boolean, isAI: boolean = false) => {
    const db = getLedger();
    
    if (!db[userId]) {
      db[userId] = {
        userId,
        userName,
        lastMessage: '',
        lastTimestamp: '',
        status: 'OPEN',
        messages: [],
        unreadCount: 0,
        userUnreadCount: 0
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
    
    if (isFromUser) {
      db[userId].unreadCount += 1;
    } else {
      db[userId].userUnreadCount += 1;
    }

    saveLedger(db);
    return newMessage;
  },

  // Get automated response from Gemini
  getAIResponse: async (userId: string, userName: string, userMessage: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const ticket = supportService.getTicket(userId);
    const history = ticket?.messages.slice(-5).map(m => 
      `${m.senderName}: ${m.text}`
    ).join('\n') || '';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are the AbacusX Customer Support AI. You are helping ${userName}. 
        AbacusX is a secure crypto platform. 
        Current User Context: ${userName} is asking: "${userMessage}".
        Previous History: ${history}
        
        Keep your response helpful, concise (under 3 sentences), and professional. 
        If asked about technical issues, tell them a human specialist is being notified.`,
      });

      const aiText = response.text || "I'm having trouble connecting to my knowledge base, but a specialist will be with you shortly.";
      supportService.sendMessage(userId, userName, aiText, false, true);
    } catch (e) {
      console.error("AI Response failed", e);
      supportService.sendMessage(userId, userName, "Our support systems are high load. Please wait for a human agent.", false, true);
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

  subscribe: (callback: () => void) => {
    const handler = () => callback();
    window.addEventListener(UPDATE_EVENT, handler);
    bc.onmessage = (e) => {
      if (e.data.type === 'REFRESH') handler();
    };
    return () => window.removeEventListener(UPDATE_EVENT, handler);
  },

  subscribeToTyping: (callback: (userId: string, isTyping: boolean) => void) => {
    const handler = (e: any) => callback(e.detail.userId, e.detail.isTyping);
    window.addEventListener(TYPING_EVENT, handler);
    const bcHandler = (e: any) => {
      if (e.data.type === 'TYPING') callback(e.data.userId, e.data.isTyping);
    };
    bc.addEventListener('message', bcHandler);
    
    return () => {
      window.removeEventListener(TYPING_EVENT, handler);
      bc.removeEventListener('message', bcHandler);
    };
  }
};
