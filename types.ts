export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPPORT = 'SUPPORT',
  COMPLIANCE = 'COMPLIANCE'
}

export enum KYCStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export interface AdminDisplayAmount {
  amount: number;
  currency: string;
  type: 'cosmetic' | 'ledger_adjustment';
  reason: string;
  visible: boolean;
  timestamp: string;
  adminName: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  kycStatus: KYCStatus;
  balance: {
    btc: number;
    eth: number;
    usdt: number;
    usd: number;
  };
  adminDisplayAdjustment?: AdminDisplayAmount; 
  twoFactorEnabled: boolean;
  joinedAt: string;
}

export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'INVESTMENT' | 'RETURN' | 'ADJUSTMENT';
  asset: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  date: string;
  hash?: string;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  apr: number;
  durationDays: number;
  minDeposit: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
}

export interface ActiveInvestment {
  id: string;
  planId: string;
  planName: string;
  amount: number;
  startDate: string;
  endDate: string;
  accruedInterest: number;
  status: 'ACTIVE' | 'COMPLETED';
}

export interface ChatMessage {
  id: string;
  sender: User;
  text: string;
  timestamp: string;
}