
import { User } from '../types';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isFromUser: boolean;
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

const STORAGE_KEY = 'abacusx_support_db_v3';
const SIGNAL_EVENT = 'abacusx_support_signal';
const broadcastChannel = new BroadcastChannel('abacusx_support_channel');

// Internal helper to get all tickets from localStorage
const _load = (): Record<string, SupportTicket> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};

// Internal helper to save and broadcast update
const _saveAndSync = (tickets: Record<string, SupportTicket>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  
  // 1. Tell current window (for Same-Tab SPA navigation)
  window.dispatchEvent(new Event(SIGNAL_EVENT));
  
  // 2. Tell other tabs (for Multi-Tab usage)
  broadcastChannel.postMessage('REFRESH');
};

// Listen for signals from other tabs
broadcastChannel.onmessage = () => {
  window.dispatchEvent(new Event(SIGNAL_EVENT));
};

// Listen for native storage events (backup)
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) {
    window.dispatchEvent(new Event(SIGNAL_EVENT));
  }
});

export const supportService = {
  // Get all tickets sorted by latest activity
  getTickets: (): SupportTicket[] => {
    const db = _load();
    return Object.values(db).sort((a, b) => 
      new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime()
    );
  },

  // Get specific ticket for a user
  getTicket: (userId: string): SupportTicket | null => {
    const db = _load();
    return db[userId] || null;
  },

  // Core messaging function
  sendMessage: (userId: string, userName: string, text: string, isFromUser: boolean) => {
    const db = _load();
    
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

    const newMessage: ChatMessage = {
      id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      senderId: isFromUser ? userId : 'admin-01',
      senderName: isFromUser ? userName : 'AbacusX Support',
      text,
      timestamp: new Date().toISOString(),
      isFromUser
    };

    db[userId].messages.push(newMessage);
    db[userId].lastMessage = text;
    db[userId].lastTimestamp = newMessage.timestamp;
    
    // Only increment unread if coming from user and admin is not looking
    if (isFromUser) {
      db[userId].unreadCount += 1;
    }

    _saveAndSync(db);
    return newMessage;
  },

  // Mark a user's messages as read
  markAsRead: (userId: string) => {
    const db = _load();
    if (db[userId]) {
      db[userId].unreadCount = 0;
      _saveAndSync(db);
    }
  },

  // Global Refresh Hook (used by components)
  subscribe: (callback: () => void) => {
    window.addEventListener(SIGNAL_EVENT, callback);
    return () => window.removeEventListener(SIGNAL_EVENT, callback);
  }
};
