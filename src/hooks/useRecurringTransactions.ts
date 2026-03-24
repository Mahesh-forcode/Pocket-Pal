import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string | null;
  payment_method: string | null;
  frequency: RecurrenceFrequency;
  next_run_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Mock data for demo purposes
const MOCK_RECURRING: RecurringTransaction[] = [
  {
    id: '1',
    user_id: 'demo',
    type: 'expense',
    amount: 499,
    category: 'subscriptions',
    description: 'Netflix subscription',
    payment_method: 'card',
    frequency: 'monthly',
    next_run_date: new Date(Date.now() + 604800000).toISOString().split('T')[0],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'demo',
    type: 'expense',
    amount: 999,
    category: 'subscriptions',
    description: 'Spotify Premium',
    payment_method: 'card',
    frequency: 'monthly',
    next_run_date: new Date(Date.now() + 1209600000).toISOString().split('T')[0],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: 'demo',
    type: 'income',
    amount: 85000,
    category: 'salary',
    description: 'Monthly salary',
    payment_method: 'bank_transfer',
    frequency: 'monthly',
    next_run_date: new Date(Date.now() + 2592000000).toISOString().split('T')[0],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const STORAGE_KEY = 'financeiq_recurring';
const loadRecurring = (): RecurringTransaction[] => {
  try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : MOCK_RECURRING; } catch { return MOCK_RECURRING; }
};

export function useRecurringTransactions() {
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>(loadRecurring);

  const persistAndSet = useCallback((updater: (prev: RecurringTransaction[]) => RecurringTransaction[]) => {
    setRecurringTransactions(prev => { const next = updater(prev); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); return next; });
  }, []);
  const [isLoading] = useState(false);

  const addRecurring = {
    mutate: useCallback((recurring: Omit<RecurringTransaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const newRecurring: RecurringTransaction = {
        ...recurring,
        id: crypto.randomUUID(),
        user_id: 'demo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      persistAndSet((prev) => [...prev, newRecurring]);
      toast.success('Recurring transaction created');
    }, []),
  };

  const updateRecurring = {
    mutate: useCallback(({ id, ...updates }: Partial<RecurringTransaction> & { id: string }) => {
      persistAndSet((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, ...updates, updated_at: new Date().toISOString() }
            : r
        )
      );
      toast.success('Recurring transaction updated');
    }, []),
  };

  const deleteRecurring = {
    mutate: useCallback((id: string) => {
      persistAndSet((prev) => prev.filter((r) => r.id !== id));
      toast.success('Recurring transaction deleted');
    }, []),
  };

  const toggleActive = {
    mutate: useCallback(({ id, is_active }: { id: string; is_active: boolean }) => {
      persistAndSet((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, is_active, updated_at: new Date().toISOString() }
            : r
        )
      );
      toast.success(is_active ? 'Recurring transaction activated' : 'Recurring transaction paused');
    }, []),
  };

  return {
    recurringTransactions,
    isLoading,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    toggleActive,
  };
}
