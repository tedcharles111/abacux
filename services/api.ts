
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
    id: 'u2',
    email: 'newbie@abacusx.com',
    fullName: 'Sarah Smith',
    role: UserRole.USER,
    kycStatus: KYCStatus.PENDING,
    balance: { btc: 0, eth: 0, usdt: 0, usd: 0 },
    twoFactorEnabled: false,
    joinedAt: '2024-03-10T14:30:00Z',
  },
  {
    id: 'u3',
    email: 'whale@crypto.com',
    fullName: 'Michael Saylor (Fake)',
    role: UserRole.USER,
    kycStatus: KYCStatus.VERIFIED,
    balance: { btc: 150, eth: 500, usdt: 1000000, usd: 50000 },
    twoFactorEnabled: true,
    joinedAt: '2023-05-20T08:00:00Z',
  },
  {
    id: 'u4',
    email: 'investor@fund.com',
    fullName: 'Jane Doe',
    role: UserRole.USER,
    kycStatus: KYCStatus.UNVERIFIED,
    balance: { btc: 0.001, eth: 0.05, usdt: 100, usd: 0 },
    twoFactorEnabled: false,
    joinedAt: '2024-03-15T16:45:00Z',
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

const MOCK_PLANS: InvestmentPlan[] = [
  { id: 'p1', name: 'Stable Saver', apr: 5.5, durationDays: 30, minDeposit: 100, riskLevel: 'LOW', description: 'Low risk stablecoin yield farming.' },
  { id: 'p2', name: 'Growth Alpha', apr: 12.0, durationDays: 90, minDeposit: 500, riskLevel: 'MEDIUM', description: 'Balanced crypto basket rebalancing.' },
  { id: 'p3', name: 'Degen Yield', apr: 25.0, durationDays: 180, minDeposit: 1000, riskLevel: 'HIGH', description: 'High risk DeFi liquidity provision.' },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tx1', type: 'DEPOSIT', asset: 'BTC', amount: 0.05, status: 'COMPLETED', date: '2024-02-01', hash: '8f7d...9a2b' },
  { id: 'tx2', type: 'INVESTMENT', asset: 'USDT', amount: 1000, status: 'COMPLETED', date: '2024-02-05' },
  { id: 'tx3', type: 'RETURN', asset: 'USDT', amount: 12.50, status: 'COMPLETED', date: '2024-03-05' },
];

const MOCK_ACTIVE_INVESTMENTS: ActiveInvestment[] = [
  { id: 'inv1', planId: 'p1', planName: 'Stable Saver', amount: 1000, startDate: '2024-02-05', endDate: '2024-03-06', accruedInterest: 4.58, status: 'ACTIVE' },
];

// Service Layer
export const api = {
  login: async (email: string, password: string): Promise<User> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    const users = getStoredUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('Invalid credentials');
    return user;
  },

  register: async (fullName: string, email: string, password: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const users = getStoredUsers();
    
    // Check if exists
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
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
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

  getPlans: async () => MOCK_PLANS,
  getTransactions: async (userId: string) => MOCK_TRANSACTIONS,
  getActiveInvestments: async (userId: string) => MOCK_ACTIVE_INVESTMENTS,
  
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
