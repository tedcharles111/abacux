
import { User, UserRole, KYCStatus, Transaction, InvestmentPlan, ActiveInvestment, AdminDisplayAmount } from '../types';

const USERS_STORAGE_KEY = 'abacusx_prod_v1';
const LOGS_STORAGE_KEY = 'abacusx_logs_v1';
export const DB_UPDATE_EVENT = 'abacusx_db_updated';
export const SYSTEM_LOG_EVENT = 'abacusx_system_log';

const syncChannel = new BroadcastChannel('abacusx_sync_channel');
const GENESIS_ADMIN_EMAIL = 'admin@abacusx.financial';

const INITIAL_USERS: User[] = [];

const getStoredLogs = (): any[] => {
  const stored = localStorage.getItem(LOGS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveLog = (log: any) => {
  const logs = getStoredLogs();
  const updatedLogs = [log, ...logs].slice(0, 100); // Keep last 100 logs
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(updatedLogs));
};

const logSystemEvent = (message: string, type: 'INFO' | 'SUCCESS' | 'WARNING' = 'INFO') => {
  const log = { message, type, timestamp: new Date().toISOString() };
  saveLog(log);
  
  const event = new CustomEvent(SYSTEM_LOG_EVENT, { detail: log });
  window.dispatchEvent(event);
  syncChannel.postMessage({ type: 'LOG', detail: log });
};

const getStoredUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
    return [...INITIAL_USERS];
  }
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : INITIAL_USERS;
  } catch (e) {
    return INITIAL_USERS;
  }
};

const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  window.dispatchEvent(new CustomEvent(DB_UPDATE_EVENT));
  syncChannel.postMessage({ type: 'DB_UPDATED' });
};

syncChannel.onmessage = (event) => {
  if (event.data.type === 'DB_UPDATED') {
    window.dispatchEvent(new CustomEvent(DB_UPDATE_EVENT));
  } else if (event.data.type === 'LOG') {
    window.dispatchEvent(new CustomEvent(SYSTEM_LOG_EVENT, { detail: event.data.detail }));
  }
};

let currentPrices = { btc: 64230.12, eth: 3450.45, sol: 145.20 };
setInterval(() => {
  currentPrices.btc += (Math.random() - 0.5) * 20;
  currentPrices.eth += (Math.random() - 0.5) * 5;
  window.dispatchEvent(new CustomEvent('market_price_update', { detail: currentPrices }));
}, 3000);

export const api = {
  getCurrentPrices: () => currentPrices,

  getSystemLogs: async () => getStoredLogs(),

  login: async (email: string, password: string): Promise<User> => {
    const users = getStoredUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('Invalid credentials');
    logSystemEvent(`Session established: ${user.fullName}`, 'SUCCESS');
    return user;
  },

  register: async (fullName: string, email: string, password: string): Promise<User> => {
    const users = getStoredUsers();
    const normalizedEmail = email.toLowerCase();
    
    if (users.find(u => u.email.toLowerCase() === normalizedEmail)) {
      throw new Error('Node collision: User exists');
    }
    
    const isGenesisAdmin = normalizedEmail === GENESIS_ADMIN_EMAIL;
    const assignedRole = isGenesisAdmin ? UserRole.ADMIN : UserRole.USER;
    
    const newUser: User = {
      id: `u${Date.now()}`,
      email: normalizedEmail,
      fullName,
      role: assignedRole,
      kycStatus: isGenesisAdmin ? KYCStatus.VERIFIED : KYCStatus.UNVERIFIED,
      balance: { btc: 0, eth: 0, usdt: 0, usd: 0 },
      twoFactorEnabled: false,
      joinedAt: new Date().toISOString()
    };
    
    saveUsers([...users, newUser]);
    logSystemEvent(`Node provisioned: ${fullName} (${assignedRole})`, 'INFO');
    return newUser;
  },

  getUsers: async (): Promise<User[]> => getStoredUsers(),

  getUser: async (id: string): Promise<User | undefined> => {
    return getStoredUsers().find(u => u.id === id);
  },

  updateUserDisplayAmount: async (userId: string, data: AdminDisplayAmount) => {
    const users = getStoredUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].adminDisplayAdjustment = data;
      saveUsers(users);
      logSystemEvent(`Ledger Override: UID ${userId} -> ${data.amount} ${data.currency}`, 'WARNING');
      return users[index];
    }
    return undefined;
  },

  getPlans: async (): Promise<InvestmentPlan[]> => [
    { id: 'p1', name: 'Stable Saver', apr: 5.5, durationDays: 30, minDeposit: 100, riskLevel: 'LOW', description: 'Low risk stablecoin yield farming.' },
    { id: 'p2', name: 'Growth Alpha', apr: 12.0, durationDays: 90, minDeposit: 500, riskLevel: 'MEDIUM', description: 'Balanced crypto basket rebalancing.' },
  ],

  submitKYC: async (userId: string, formData: any) => {
    const users = getStoredUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].kycStatus = KYCStatus.PENDING;
      saveUsers(users);
      logSystemEvent(`KYC Package transmitted: UID ${userId}`, 'INFO');
      return true;
    }
    return false;
  }
};
