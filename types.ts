
export enum UserRole {
  MASTER = 'MASTER',
  ADMIN = 'ADMIN',
  PROFESSIONAL = 'PROFESSIONAL',
  CLIENT = 'CLIENT'
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING'
}

export enum SubscriptionPlan {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export interface Company {
  id: string;
  name: string;
  category: string;
  plan: SubscriptionPlan;
  status: AccountStatus;
  createdAt: string;
  ownerEmail: string;
  revenue: number;
  professionalsCount: number;
}

export interface SystemMetric {
  label: string;
  value: number | string;
  change: number;
  icon: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
}
