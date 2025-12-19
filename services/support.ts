
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
  };
  timestamp: string;
  isFromUser: boolean;
  isAi?: boolean; // Flag to identify AI first-responses
}

export interface SupportTicket {
  userId: string;
  userName: string;
  lastMessage: string;
  lastTimestamp: string;
  status: 'OPEN' | 'CLOSED';
  messages: ChatMessage[];
  unreadCount: number;
  isAiEnabled: boolean; // Can be toggled by human admin
}

// Simulated persistent state for the session
let tickets: Record<string, SupportTicket> = {};

export const supportService = {
  getTickets: (): SupportTicket[] => Object.values(tickets).sort((a, b) => 
    new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime()
  ),

  getTicket: (userId: string): SupportTicket | null => tickets[userId] || null,

  sendMessage: (userId: string, userName: string, text: string, isFromUser: boolean, options?: { attachment?: any, isAi?: boolean }) => {
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
      id: Math.random().toString(36).substr(2, 9),
      senderId: isFromUser ? userId : (options?.isAi ? 'ai-admin' : 'human-admin'),
      senderName: isFromUser ? userName : (options?.isAi ? 'Admin David (AI)' : 'Admin (Verified)'),
      text,
      attachment: options?.attachment,
      timestamp: new Date().toISOString(),
      isFromUser,
      isAi: options?.isAi
    };

    tickets[userId].messages.push(newMessage);
    tickets[userId].lastMessage = text || (options?.attachment ? `File: ${options.attachment.name}` : '');
    tickets[userId].lastTimestamp = newMessage.timestamp;
    
    if (isFromUser) {
      tickets[userId].unreadCount += 1;
    }

    // Broadcast update to all components (Admin Dashboard and User Widget)
    window.dispatchEvent(new CustomEvent('support_update', { 
      detail: { userId, message: newMessage } 
    }));
    
    return newMessage;
  },

  toggleAi: (userId: string, enabled: boolean) => {
    if (tickets[userId]) {
      tickets[userId].isAiEnabled = enabled;
      window.dispatchEvent(new CustomEvent('support_update', { detail: { userId } }));
    }
  },

  markAsRead: (userId: string) => {
    if (tickets[userId]) {
      tickets[userId].unreadCount = 0;
      window.dispatchEvent(new CustomEvent('support_update', { detail: { userId } }));
    }
  },

  closeTicket: (userId: string) => {
    if (tickets[userId]) {
      tickets[userId].status = 'CLOSED';
      window.dispatchEvent(new CustomEvent('support_update', { detail: { userId } }));
    }
  }
};
