export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'cash' | 'card' | 'upi' | 'bank_transfer' | 'other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
  paymentMethod: PaymentMethod;
  tags: string[];
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: 'monthly' | 'weekly' | 'yearly';
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
  topCategories: { category: string; amount: number; percentage: number }[];
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  savings: number;
}

export const EXPENSE_CATEGORIES = [
  { name: '🍔 Food & Dining', value: 'food' },
  { name: '🚗 Transportation', value: 'transport' },
  { name: '🛍️ Shopping', value: 'shopping' },
  { name: '🏠 Housing & Rent', value: 'housing' },
  { name: '💡 Utilities', value: 'utilities' },
  { name: '🎬 Entertainment', value: 'entertainment' },
  { name: '🏥 Healthcare', value: 'healthcare' },
  { name: '📚 Education', value: 'education' },
  { name: '✈️ Travel', value: 'travel' },
  { name: '💳 Subscriptions', value: 'subscriptions' },
  { name: '📦 Other', value: 'other' },
] as const;

export const INCOME_CATEGORIES = [
  { name: '💼 Salary', value: 'salary' },
  { name: '💰 Freelance', value: 'freelance' },
  { name: '📈 Investments', value: 'investments' },
  { name: '🎁 Gifts', value: 'gifts' },
  { name: '💵 Side Income', value: 'side_income' },
  { name: '🏦 Interest', value: 'interest' },
  { name: '📦 Other', value: 'other' },
] as const;

export const PAYMENT_METHODS = [
  { name: '💵 Cash', value: 'cash' },
  { name: '💳 Card', value: 'card' },
  { name: '📱 UPI', value: 'upi' },
  { name: '🏦 Bank Transfer', value: 'bank_transfer' },
  { name: '📦 Other', value: 'other' },
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  food: '#10b981',
  transport: '#3b82f6',
  shopping: '#f59e0b',
  housing: '#6366f1',
  utilities: '#8b5cf6',
  entertainment: '#ec4899',
  healthcare: '#ef4444',
  education: '#14b8a6',
  travel: '#06b6d4',
  subscriptions: '#f97316',
  other: '#6b7280',
  salary: '#10b981',
  freelance: '#3b82f6',
  investments: '#8b5cf6',
  gifts: '#ec4899',
  side_income: '#f59e0b',
  interest: '#6366f1',
};
