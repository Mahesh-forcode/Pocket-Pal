import { useState, useCallback } from 'react';

export interface ParsedExpense {
  paid_by: string;
  amount: number;
  participants: string[];
  excluded?: string[];
  split_method: string;
  description: string;
  clarification_needed?: string;
  split_per_person: number;
}

export interface ExpenseEntry extends ParsedExpense {
  id: string;
  timestamp: string;
  transactions: { from: string; to: string; amount: number }[];
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

const STORAGE_KEY = 'financeiq_splitter';

const loadEntries = (): ExpenseEntry[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

const computeLedger = (entries: ExpenseEntry[]): Record<string, number> => {
  const ledger: Record<string, number> = {};
  entries.forEach(entry => {
    entry.transactions.forEach(tx => {
      ledger[tx.from] = (ledger[tx.from] || 0) - tx.amount;
      ledger[tx.to] = (ledger[tx.to] || 0) + tx.amount;
    });
  });
  return ledger;
};

const simplifySettlements = (ledger: Record<string, number>): Settlement[] => {
  const debtors: { name: string; amount: number }[] = [];
  const creditors: { name: string; amount: number }[] = [];

  Object.entries(ledger).forEach(([name, balance]) => {
    const rounded = Math.round(balance * 100) / 100;
    if (rounded < -0.01) debtors.push({ name, amount: -rounded });
    else if (rounded > 0.01) creditors.push({ name, amount: rounded });
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].amount, creditors[j].amount);
    if (amount > 0.01) {
      settlements.push({ from: debtors[i].name, to: creditors[j].name, amount: Math.round(amount * 100) / 100 });
    }
    debtors[i].amount -= amount;
    creditors[j].amount -= amount;
    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  return settlements;
};

export const useSplitter = () => {
  const [entries, setEntries] = useState<ExpenseEntry[]>(loadEntries);
  const [isLoading, setIsLoading] = useState(false);

  const persist = (next: ExpenseEntry[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setEntries(next);
  };

  const addExpense = useCallback(async (description: string): Promise<ParsedExpense | { clarification_needed: string }> => {
    setIsLoading(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-expense`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ description }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Failed to parse expense');
      }

      const parsed = await resp.json();

      if (parsed.clarification_needed) {
        return { clarification_needed: parsed.clarification_needed };
      }

      const splitPerPerson = Math.round((parsed.amount / parsed.participants.length) * 100) / 100;
      const transactions: { from: string; to: string; amount: number }[] = [];

      parsed.participants.forEach((person: string) => {
        if (person.toLowerCase() !== parsed.paid_by.toLowerCase()) {
          transactions.push({ from: person, to: parsed.paid_by, amount: splitPerPerson });
        }
      });

      const entry: ExpenseEntry = {
        ...parsed,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        split_per_person: splitPerPerson,
        transactions,
      };

      const next = [entry, ...entries];
      persist(next);
      return { ...parsed, split_per_person: splitPerPerson };
    } finally {
      setIsLoading(false);
    }
  }, [entries]);

  const clearAll = useCallback(() => {
    persist([]);
  }, []);

  const removeEntry = useCallback((id: string) => {
    persist(entries.filter(e => e.id !== id));
  }, [entries]);

  const ledger = computeLedger(entries);
  const settlements = simplifySettlements(ledger);

  return { entries, ledger, settlements, isLoading, addExpense, clearAll, removeEntry };
};
