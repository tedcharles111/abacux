
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

// Simulated database
let tickets: Record<string, SupportTicket> = {};

export const supportService = {
  getTickets: (): SupportTicket[] => Object.values(tickets).sort((a, b) => 
    new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime()
  ),

  getTicket: (userId: string): SupportTicket | null => tickets[userId] || null,

  sendMessage: (userId: string, userName: string, text: string, isFromUser: boolean, attachment?: any) => {
    if (!tickets[userId]) {
      tickets[userId] = {
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
      id: Math.random().toString(36).substr(2, 9),
      senderId: isFromUser ? userId : 'admin',
      senderName: isFromUser ? userName : 'Admin David',
      text,
      attachment,
      timestamp: new Date().toISOString(),
      isFromUser
    };

    tickets[userId].messages.push(newMessage);
    tickets[userId].lastMessage = text || (attachment ? `File: ${attachment.name}` : '');
    tickets[userId].lastTimestamp = newMessage.timestamp;
    
    if (!isFromUser) {
      // Logic for user side unread can go here if needed
    } else {
      tickets[userId].unreadCount += 1;
    }

    // Trigger local storage / event bus simulation
    window.dispatchEvent(new CustomEvent('support_update', { detail: { userId } }));
    return newMessage;
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
