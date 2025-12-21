
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

const STORAGE_KEY = 'abacusx_support_ledger_v5';
const SYNC_CHANNEL = 'abacusx_support_sync_v5';

// Native browser broadcast for instant multi-tab sync
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
  // Signal ALL listeners (Current tab and other tabs)
  bc.postMessage('REFRESH');
  window.dispatchEvent(new Event('storage_sync'));
};

// Listen for signals from other tabs
bc.onmessage = () => {
  window.dispatchEvent(new Event('storage_sync'));
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

  sendMessage: (userId: string, userName: string, text: string, isFromUser: boolean) => {
    const db = getLedger();
    
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
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      senderId: isFromUser ? userId : 'admin',
      senderName: isFromUser ? userName : 'AbacusX Support',
      text,
      timestamp: new Date().toISOString(),
      isFromUser
    };

    db[userId].messages.push(newMessage);
    db[userId].lastMessage = text;
    db[userId].lastTimestamp = newMessage.timestamp;
    
    // Increment unread for admin if sent by user
    if (isFromUser) {
      db[userId].unreadCount += 1;
    }

    saveLedger(db);
    return newMessage;
  },

  markAsRead: (userId: string) => {
    const db = getLedger();
    if (db[userId]) {
      db[userId].unreadCount = 0;
      saveLedger(db);
    }
  },

  subscribe: (callback: () => void) => {
    window.addEventListener('storage_sync', callback);
    // Also listen to raw storage events
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) callback();
    });
    return () => {
      window.removeEventListener('storage_sync', callback);
      window.removeEventListener('storage', callback);
    };
  }
};
