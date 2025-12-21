
import { User } from '../types';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isFromUser: boolean;
  isSystem?: boolean;
}

export interface SupportTicket {
  userId: string;
  userName: string;
  lastMessage: string;
  lastTimestamp: string;
  status: 'OPEN' | 'CLOSED';
  messages: ChatMessage[];
  unreadCount: number;
}

const STORAGE_KEY = 'abacusx_support_v4_stable';
const SYNC_EVENT = 'abacusx_support_sync_trigger';

// Helper to get fresh data
const getDB = (): Record<string, SupportTicket> => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
};

// Helper to save and alert all components
const saveDB = (db: Record<string, SupportTicket>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  // Alert same tab
  window.dispatchEvent(new CustomEvent(SYNC_EVENT));
  // Storage event automatically alerts other tabs
};

// Listen for cross-tab updates
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) {
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
  }
});

export const supportService = {
  getTickets: (): SupportTicket[] => {
    const db = getDB();
    return Object.values(db).sort((a, b) => 
      new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime()
    );
  },

  getTicket: (userId: string): SupportTicket | null => {
    const db = getDB();
    return db[userId] || null;
  },

  sendMessage: (userId: string, userName: string, text: string, isFromUser: boolean) => {
    const db = getDB();
    
    if (!db[userId]) {
      db[userId] = {
        userId,
        userName,
        lastMessage: '',
        lastTimestamp: '',
        status: 'OPEN',
        messages: [],
        unreadCount: 0
      };
    }

    const timestamp = new Date().toISOString();

    // 1. Add the actual message
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      senderId: isFromUser ? userId : 'admin-01',
      senderName: isFromUser ? userName : 'AbacusX Support',
      text,
      timestamp,
      isFromUser
    };
    db[userId].messages.push(newMessage);

    // 2. If it's a user message, add the mandatory AI Unavailable Notice
    if (isFromUser) {
      const noticeMessage: ChatMessage = {
        id: `sys_${Date.now()}`,
        senderId: 'system',
        senderName: 'System',
        text: 'Live Concierge Service Notice: AI capabilities are currently unavailable (API Key not configured).',
        timestamp: new Date(Date.now() + 10).toISOString(),
        isFromUser: false,
        isSystem: true
      };
      db[userId].messages.push(noticeMessage);
      db[userId].unreadCount += 1;
    }

    db[userId].lastMessage = text;
    db[userId].lastTimestamp = timestamp;
    
    saveDB(db);
    return newMessage;
  },

  markAsRead: (userId: string) => {
    const db = getDB();
    if (db[userId]) {
      db[userId].unreadCount = 0;
      saveDB(db);
    }
  },

  subscribe: (callback: () => void) => {
    window.addEventListener(SYNC_EVENT, callback);
    return () => window.removeEventListener(SYNC_EVENT, callback);
  }
};
