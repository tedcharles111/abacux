
import { User, UserRole, KYCStatus, Transaction, InvestmentPlan, ActiveInvestment, AdminDisplayAmount } from '../types';

const USERS_STORAGE_KEY = 'abacusx_users_db';

const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    email: 'user@abacusx.com',
    fullName: 'Alex Trader',
    role: UserRole.USER,
    kycStatus: KYCStatus.VERIFIED,
    balance: { btc: 0.05, eth: 1.2, usdt: 1540.00, usd: 50.00 },
    twoFactorEnabled: true,
    joinedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'a1',
    email: 'admin@abacusx.com',
    fullName: 'Sys Admin',
    role: UserRole.ADMIN,
    kycStatus: KYCStatus.VERIFIED,
    balance: { btc: 0, eth: 0, usdt: 0, usd: 0 },
    twoFactorEnabled: true,
    joinedAt: '2023-11-01T09:00:00Z',
  }
];

const getStoredUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  return JSON.parse(stored);
};

const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

// Real-time market state
let currentPrices = {
  btc: 64230.12,
  eth: 3450.45,
  sol: 145.20
};

// Update prices periodically to simulate a live market
setInterval(() => {
  currentPrices.btc += (Math.random() - 0.5) * 20;
  currentPrices.eth += (Math.random() - 0.5) * 5;
  currentPrices.sol += (Math.random() - 0.5) * 0.5;
  window.dispatchEvent(new CustomEvent('market_price_update', { detail: currentPrices }));
}, 3000);

export const api = {
  getCurrentPrices: () => currentPrices,

  login: async (email: string, password: string): Promise<User> => {
    const users = getStoredUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('Invalid credentials');
    return user;
  },

  register: async (fullName: string, email: string, password: string): Promise<User> => {
    const users = getStoredUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('User already exists');
    }
    const newUser: User = {
      id: `u${Date.now()}`,
      email: email.toLowerCase(),
      fullName,
      role: UserRole.USER,
      kycStatus: KYCStatus.UNVERIFIED,
      balance: { btc: 0, eth: 0, usdt: 0, usd: 0 },
      twoFactorEnabled: false,
      joinedAt: new Date().toISOString()
    };
    users.push(newUser);
    saveUsers(users);
    return newUser;
  },

  getUsers: async (): Promise<User[]> => {
    return getStoredUsers();
  },

  getUser: async (id: string): Promise<User | undefined> => {
    const users = getStoredUsers();
    return users.find(u => u.id === id);
  },

  updateUserDisplayAmount: async (userId: string, data: AdminDisplayAmount) => {
    const users = getStoredUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].adminDisplayAdjustment = data;
      saveUsers(users);
      return users[index];
    }
    return undefined;
  },

  getPlans: async () => [
    { id: 'p1', name: 'Stable Saver', apr: 5.5, durationDays: 30, minDeposit: 100, riskLevel: 'LOW', description: 'Low risk stablecoin yield farming.' },
    { id: 'p2', name: 'Growth Alpha', apr: 12.0, durationDays: 90, minDeposit: 500, riskLevel: 'MEDIUM', description: 'Balanced crypto basket rebalancing.' },
  ],
  
  getTransactions: async (userId: string) => [],
  getActiveInvestments: async (userId: string) => [],
  
  submitKYC: async (userId: string, formData: any) => {
    const users = getStoredUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].kycStatus = KYCStatus.PENDING;
      saveUsers(users);
      return true;
    }
    return false;
  }
};
