
import { User } from '../types';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text?: string;
  attachment?: {
    name: string;
    type: string;
    size: number;
    mimeType: string;
  };
  timestamp: string;
  isFromUser: boolean;
  isAi?: boolean;
}

export interface SupportTicket {
  userId: string;
  userName: string;
  lastMessage: string;
  lastTimestamp: string;
  status: 'OPEN' | 'CLOSED';
  messages: ChatMessage[];
  unreadCount: number;
  isAiEnabled: boolean;
}

const STORAGE_KEY = 'abacusx_support_v2';
const CHANNEL_NAME = 'abacusx_live_sync_v2';

// The Live Sync Gateway
const broadcastChannel = new BroadcastChannel(CHANNEL_NAME);

const getStoredTickets = (): Record<string, SupportTicket> => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Failed to parse tickets", e);
    return {};
  }
};

const saveTickets = (tickets: Record<string, SupportTicket>, sourceId: string) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  // Broadcast the update signal to all other open tabs immediately
  broadcastChannel.postMessage({ type: 'LIVE_SIGNAL', userId: sourceId });
};

export const supportService = {
  getTickets: (): SupportTicket[] => {
    const tickets = getStoredTickets();
    return Object.values(tickets).sort((a, b) => 
      new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime()
    );
  },

  getTicket: (userId: string): SupportTicket | null => {
    return getStoredTickets()[userId] || null;
  },

  sendMessage: (userId: string, userName: string, text: string, isFromUser: boolean, options?: { attachment?: any, isAi?: boolean }) => {
    const tickets = getStoredTickets();
    
    if (!tickets[userId]) {
      tickets[userId] = {
        userId,
        userName,
        lastMessage: '',
        lastTimestamp: '',
        status: 'OPEN',
        messages: [],
        unreadCount: 0,
        isAiEnabled: true
      };
    }

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      senderId: isFromUser ? userId : (options?.isAi ? 'ai-concierge' : 'human-admin'),
      senderName: isFromUser ? userName : (options?.isAi ? 'David (AI)' : 'Senior Support'),
      text,
      attachment: options?.attachment,
      timestamp: new Date().toISOString(),
      isFromUser,
      isAi: options?.isAi
    };

    tickets[userId].messages.push(newMessage);
    tickets[userId].lastMessage = text || (options?.attachment ? `Doc: ${options.attachment.name}` : '');
    tickets[userId].lastTimestamp = newMessage.timestamp;
    
    if (isFromUser) {
      tickets[userId].unreadCount += 1;
    }

    saveTickets(tickets, userId);
    
    // Trigger local update for the current tab
    window.dispatchEvent(new CustomEvent('support_sync_update', { detail: { userId } }));
    
    return newMessage;
  },

  toggleAi: (userId: string, enabled: boolean) => {
    const tickets = getStoredTickets();
    if (tickets[userId]) {
      tickets[userId].isAiEnabled = enabled;
      saveTickets(tickets, userId);
      window.dispatchEvent(new CustomEvent('support_sync_update', { detail: { userId } }));
    }
  },

  markAsRead: (userId: string) => {
    const tickets = getStoredTickets();
    if (tickets[userId]) {
      tickets[userId].unreadCount = 0;
      saveTickets(tickets, userId);
      window.dispatchEvent(new CustomEvent('support_sync_update', { detail: { userId } }));
    }
  },

  closeTicket: (userId: string) => {
    const tickets = getStoredTickets();
    if (tickets[userId]) {
      tickets[userId].status = 'CLOSED';
      saveTickets(tickets, userId);
      window.dispatchEvent(new CustomEvent('support_sync_update', { detail: { userId } }));
    }
  }
};

// Listen for broadcasted signals from other tabs/windows
broadcastChannel.onmessage = (event) => {
  if (event.data.type === 'LIVE_SIGNAL') {
    window.dispatchEvent(new CustomEvent('support_sync_update', { detail: { userId: event.data.userId } }));
  }
};
