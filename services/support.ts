
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
  unreadCount: number; // For Admin
  userUnreadCount: number; // For User
}

const STORAGE_KEY = 'abacusx_support_v6';
const SYNC_CHANNEL = 'abacusx_sync_v6';

// Event names
const UPDATE_EVENT = 'abacusx_support_update';

// BroadcastChannel for cross-tab sync
const bc = new BroadcastChannel(SYNC_CHANNEL);
bc.onmessage = (event) => {
  if (event.data === 'REFRESH') {
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
  }
};

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
  // Notify current tab
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
  // Notify other tabs
  bc.postMessage('REFRESH');
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
        unreadCount: 0,
        userUnreadCount: 0
      };
    }

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      senderId: isFromUser ? userId : 'admin_support',
      senderName: isFromUser ? userName : 'AbacusX Support',
      text,
      timestamp: new Date().toISOString(),
      isFromUser
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

  markAsRead: (userId: string, isAdmin: boolean) => {
    const db = getLedger();
    if (db[userId]) {
      if (isAdmin) {
        db[userId].unreadCount = 0;
      } else {
        db[userId].userUnreadCount = 0;
      }
      saveLedger(db);
    }
  },

  subscribe: (callback: () => void) => {
    window.addEventListener(UPDATE_EVENT, callback);
    // Storage event for changes from other windows/tabs (legacy support alongside BC)
    const storageHandler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) callback();
    };
    window.addEventListener('storage', storageHandler);
    
    return () => {
      window.removeEventListener(UPDATE_EVENT, callback);
      window.removeEventListener('storage', storageHandler);
    };
  }
};
