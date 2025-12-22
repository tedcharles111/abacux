
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

const STORAGE_KEY = 'abacusx_support_v8';
const SYNC_CHANNEL = 'abacusx_sync_v8';
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
  
  // BROADCAST 1: General Refresh
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
  bc.postMessage({ type: 'REFRESH' });

  // BROADCAST 2: Specific Message Payload (Direct Pipe)
  if (lastMessage) {
    const detail = { message: lastMessage, userId: lastMessage.isFromUser ? lastMessage.senderId : 'admin' };
    window.dispatchEvent(new CustomEvent(MESSAGE_EVENT, { detail }));
    bc.postMessage({ type: 'NEW_MESSAGE', ...detail });
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
    const history = ticket?.messages.slice(-5).map(m => `${m.senderName}: ${m.text}`).join('\n') || '';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are the AbacusX AI Agent. User: ${userName}. Message: "${userMessage}". History: ${history}. Be concise and professional.`,
      });
      const aiText = response.text || "A specialist is connecting now.";
      supportService.sendMessage(userId, userName, aiText, false, true);
    } catch (e) {
      supportService.sendMessage(userId, userName, "Connection busy. Please wait.", false, true);
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

  // HIGH-SPEED SUBSCRIPTIONS
  subscribeToAll: (callback: () => void) => {
    window.addEventListener(UPDATE_EVENT, callback);
    bc.addEventListener('message', (e) => { if (e.data.type === 'REFRESH') callback(); });
    return () => window.removeEventListener(UPDATE_EVENT, callback);
  },

  subscribeToMessages: (callback: (payload: { message: ChatMessage, userId: string }) => void) => {
    const handler = (e: any) => callback(e.detail);
    window.addEventListener(MESSAGE_EVENT, handler);
    const bcHandler = (e: any) => { if (e.data.type === 'NEW_MESSAGE') callback({ message: e.data.message, userId: e.data.userId }); };
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
