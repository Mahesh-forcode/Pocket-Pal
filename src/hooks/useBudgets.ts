import { useState, useCallback } from 'react';
import { Budget } from '@/types/finance';
import { toast } from 'sonner';

// Mock data for demo purposes
const MOCK_BUDGETS: Budget[] = [
  { id: '1', category: 'food', limit: 8000, spent: 0, period: 'monthly' },
  { id: '2', category: 'transport', limit: 5000, spent: 0, period: 'monthly' },
  { id: '3', category: 'entertainment', limit: 3000, spent: 0, period: 'monthly' },
];

const STORAGE_KEY = 'financeiq_budgets';
const loadBudgets = (): Budget[] => {
  try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : MOCK_BUDGETS; } catch { return MOCK_BUDGETS; }
};

export const useBudgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>(loadBudgets);

  const persistAndSet = useCallback((updater: (prev: Budget[]) => Budget[]) => {
    setBudgets(prev => { const next = updater(prev); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); return next; });
  }, []);
  const [isLoading] = useState(false);

  const addBudget = useCallback((budget: Omit<Budget, 'id' | 'spent'>) => {
    // Check for duplicate category
    const exists = budgets.some((b) => b.category === budget.category);
    if (exists) {
      toast.error('Budget for this category already exists');
      return;
    }

    const newBudget: Budget = {
      ...budget,
      id: crypto.randomUUID(),
      spent: 0,
    };
    persistAndSet((prev) => [...prev, newBudget]);
    toast.success('Budget created');
  }, [budgets]);

  const updateBudget = useCallback((id: string, updates: Partial<Budget>) => {
    persistAndSet((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
    toast.success('Budget updated');
  }, []);

  const deleteBudget = useCallback((id: string) => {
    persistAndSet((prev) => prev.filter((b) => b.id !== id));
    toast.success('Budget deleted');
  }, []);

  return {
    budgets,
    isLoading,
    addBudget,
    updateBudget,
    deleteBudget,
  };
};
