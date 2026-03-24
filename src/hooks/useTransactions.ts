import { useState, useCallback } from 'react';
import { Transaction, TransactionType } from '@/types/finance';
import { toast } from 'sonner';

// Mock data for demo purposes
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 85000,
    category: 'salary',
    description: 'Monthly Salary',
    paymentMethod: 'bank_transfer',
    date: new Date().toISOString(),
    tags: [],
    isRecurring: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'expense',
    amount: 25000,
    category: 'housing',
    description: 'Rent Payment',
    paymentMethod: 'bank_transfer',
    date: new Date().toISOString(),
    tags: [],
    isRecurring: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    type: 'expense',
    amount: 3500,
    category: 'food',
    description: 'Groceries',
    paymentMethod: 'upi',
    date: new Date(Date.now() - 86400000).toISOString(),
    tags: [],
    isRecurring: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    type: 'expense',
    amount: 1200,
    category: 'transport',
    description: 'Uber rides',
    paymentMethod: 'upi',
    date: new Date(Date.now() - 172800000).toISOString(),
    tags: [],
    isRecurring: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    type: 'expense',
    amount: 5000,
    category: 'shopping',
    description: 'New clothes',
    paymentMethod: 'card',
    date: new Date(Date.now() - 259200000).toISOString(),
    tags: [],
    isRecurring: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    type: 'income',
    amount: 15000,
    category: 'freelance',
    description: 'Freelance project',
    paymentMethod: 'bank_transfer',
    date: new Date(Date.now() - 604800000).toISOString(),
    tags: [],
    isRecurring: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '7',
    type: 'expense',
    amount: 2500,
    category: 'utilities',
    description: 'Electricity bill',
    paymentMethod: 'upi',
    date: new Date(Date.now() - 432000000).toISOString(),
    tags: [],
    isRecurring: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '8',
    type: 'expense',
    amount: 800,
    category: 'entertainment',
    description: 'Movie tickets',
    paymentMethod: 'upi',
    date: new Date(Date.now() - 518400000).toISOString(),
    tags: [],
    isRecurring: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const STORAGE_KEY = 'financeiq_transactions';

const loadTransactions = (): Transaction[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);
  const [isLoading] = useState(false);

  const persistAndSet = useCallback((updater: (prev: Transaction[]) => Transaction[]) => {
    setTransactions(prev => {
      const next = updater(prev);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    persistAndSet((prev) => [newTransaction, ...prev]);
    toast.success('Transaction added');
  }, [persistAndSet]);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    persistAndSet((prev) =>
      prev.map((tx) =>
        tx.id === id
          ? { ...tx, ...updates, updatedAt: new Date().toISOString() }
          : tx
      )
    );
    toast.success('Transaction updated');
  }, [persistAndSet]);

  const deleteTransaction = useCallback((id: string) => {
    persistAndSet((prev) => prev.filter((tx) => tx.id !== id));
    toast.success('Transaction deleted');
  }, [persistAndSet]);

  // Computed values
  const getTotalIncome = useCallback(() => 
    transactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0),
    [transactions]
  );

  const getTotalExpense = useCallback(() => 
    transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0),
    [transactions]
  );

  const getBalance = useCallback(() => getTotalIncome() - getTotalExpense(), [getTotalIncome, getTotalExpense]);

  const getTransactionsByType = useCallback((type: TransactionType) => 
    transactions.filter(tx => tx.type === type),
    [transactions]
  );

  const getCategoryTotals = useCallback((type: TransactionType) => {
    return getTransactionsByType(type).reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [getTransactionsByType]);

  const getMonthlyData = useCallback(() => {
    const monthlyMap = new Map<string, { income: number; expense: number }>();
    
    transactions.forEach(tx => {
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
  }, [transactions]);

  return {
    transactions,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTotalIncome,
    getTotalExpense,
    getBalance,
    getTransactionsByType,
    getCategoryTotals,
    getMonthlyData,
  };
};
