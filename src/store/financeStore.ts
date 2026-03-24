import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction, Budget, TransactionType } from '@/types/finance';

interface FinanceState {
  transactions: Transaction[];
  budgets: Budget[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id' | 'spent'>) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  getTotalIncome: () => number;
  getTotalExpense: () => number;
  getBalance: () => number;
  getTransactionsByType: (type: TransactionType) => Transaction[];
  getTransactionsByCategory: (category: string) => Transaction[];
  getTransactionsByDateRange: (startDate: string, endDate: string) => Transaction[];
  getCategoryTotals: (type: TransactionType) => Record<string, number>;
  getMonthlyData: () => { month: string; income: number; expense: number }[];
}

// Generate sample data for demo
const generateSampleTransactions = (): Transaction[] => {
  const now = new Date();
  const transactions: Transaction[] = [];
  
  const incomeCategories = ['salary', 'freelance', 'investments', 'side_income'];
  const expenseCategories = ['food', 'transport', 'shopping', 'housing', 'utilities', 'entertainment', 'subscriptions'];
  
  // Generate 3 months of data
  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    const month = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    
    // Monthly salary
    transactions.push({
      id: `income-${monthOffset}-salary`,
      type: 'income',
      amount: 75000 + Math.random() * 10000,
      category: 'salary',
      description: 'Monthly Salary',
      date: new Date(month.getFullYear(), month.getMonth(), 1).toISOString(),
      paymentMethod: 'bank_transfer',
      tags: ['recurring'],
      isRecurring: true,
      createdAt: month.toISOString(),
      updatedAt: month.toISOString(),
    });
    
    // Random income
    if (Math.random() > 0.5) {
      transactions.push({
        id: `income-${monthOffset}-extra`,
        type: 'income',
        amount: 5000 + Math.random() * 15000,
        category: incomeCategories[Math.floor(Math.random() * incomeCategories.length)],
        description: 'Extra Income',
        date: new Date(month.getFullYear(), month.getMonth(), 10 + Math.floor(Math.random() * 10)).toISOString(),
        paymentMethod: 'upi',
        tags: [],
        isRecurring: false,
        createdAt: month.toISOString(),
        updatedAt: month.toISOString(),
      });
    }
    
    // Random expenses throughout the month
    const numExpenses = 15 + Math.floor(Math.random() * 10);
    for (let i = 0; i < numExpenses; i++) {
      const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
      const amounts: Record<string, [number, number]> = {
        food: [100, 2000],
        transport: [50, 500],
        shopping: [500, 5000],
        housing: [15000, 25000],
        utilities: [500, 3000],
        entertainment: [200, 2000],
        subscriptions: [100, 1000],
      };
      const [min, max] = amounts[category] || [100, 1000];
      
      transactions.push({
        id: `expense-${monthOffset}-${i}`,
        type: 'expense',
        amount: min + Math.random() * (max - min),
        category,
        description: `${category.charAt(0).toUpperCase() + category.slice(1)} expense`,
        date: new Date(month.getFullYear(), month.getMonth(), 1 + Math.floor(Math.random() * 28)).toISOString(),
        paymentMethod: ['cash', 'card', 'upi'][Math.floor(Math.random() * 3)] as any,
        tags: [],
        isRecurring: category === 'housing' || category === 'subscriptions',
        createdAt: month.toISOString(),
        updatedAt: month.toISOString(),
      });
    }
  }
  
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: generateSampleTransactions(),
      budgets: [
        { id: '1', category: 'food', limit: 8000, spent: 0, period: 'monthly' },
        { id: '2', category: 'transport', limit: 3000, spent: 0, period: 'monthly' },
        { id: '3', category: 'shopping', limit: 10000, spent: 0, period: 'monthly' },
        { id: '4', category: 'entertainment', limit: 5000, spent: 0, period: 'monthly' },
      ],
      
      addTransaction: (transaction) => {
        const now = new Date().toISOString();
        const newTransaction: Transaction = {
          ...transaction,
          id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));
      },
      
      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, ...updates, updatedAt: new Date().toISOString() } : tx
          ),
        }));
      },
      
      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.id !== id),
        }));
      },
      
      addBudget: (budget) => {
        const newBudget: Budget = {
          ...budget,
          id: `budget-${Date.now()}`,
          spent: 0,
        };
        set((state) => ({
          budgets: [...state.budgets, newBudget],
        }));
      },
      
      updateBudget: (id, updates) => {
        set((state) => ({
          budgets: state.budgets.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        }));
      },
      
      deleteBudget: (id) => {
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        }));
      },
      
      getTotalIncome: () => {
        return get().transactions
          .filter((tx) => tx.type === 'income')
          .reduce((sum, tx) => sum + tx.amount, 0);
      },
      
      getTotalExpense: () => {
        return get().transactions
          .filter((tx) => tx.type === 'expense')
          .reduce((sum, tx) => sum + tx.amount, 0);
      },
      
      getBalance: () => {
        return get().getTotalIncome() - get().getTotalExpense();
      },
      
      getTransactionsByType: (type) => {
        return get().transactions.filter((tx) => tx.type === type);
      },
      
      getTransactionsByCategory: (category) => {
        return get().transactions.filter((tx) => tx.category === category);
      },
      
      getTransactionsByDateRange: (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return get().transactions.filter((tx) => {
          const date = new Date(tx.date);
          return date >= start && date <= end;
        });
      },
      
      getCategoryTotals: (type) => {
        const transactions = get().getTransactionsByType(type);
        return transactions.reduce((acc, tx) => {
          acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
          return acc;
        }, {} as Record<string, number>);
      },
      
      getMonthlyData: () => {
        const transactions = get().transactions;
        const monthlyMap = new Map<string, { income: number; expense: number }>();
        
        transactions.forEach((tx) => {
          const date = new Date(tx.date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!monthlyMap.has(monthKey)) {
            monthlyMap.set(monthKey, { income: 0, expense: 0 });
          }
          
          const data = monthlyMap.get(monthKey)!;
          if (tx.type === 'income') {
            data.income += tx.amount;
          } else {
            data.expense += tx.amount;
          }
        });
        
        return Array.from(monthlyMap.entries())
          .map(([month, data]) => ({ month, ...data }))
          .sort((a, b) => a.month.localeCompare(b.month));
      },
    }),
    {
      name: 'finance-storage',
    }
  )
);
