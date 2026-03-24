import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Download, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionList } from '@/components/dashboard/TransactionList';
import { AddTransactionModal } from '@/components/dashboard/AddTransactionModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Helmet } from 'react-helmet-async';
import { TransactionType, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/finance';
import { cn } from '@/lib/utils';

export default function Transactions() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });

  const { transactions, isLoading, deleteTransaction } = useTransactions();

  const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesDescription = tx.description?.toLowerCase().includes(query);
        const matchesCategory = tx.category.toLowerCase().includes(query);
        if (!matchesDescription && !matchesCategory) return false;
      }

      // Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

      // Category filter
      if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;

      // Date filter
      if (dateRange.from && dateRange.to) {
        const txDate = new Date(tx.date);
        if (txDate < dateRange.from || txDate > dateRange.to) return false;
      }

      return true;
    });
  }, [transactions, searchQuery, typeFilter, categoryFilter, dateRange]);

  const totalFiltered = filteredTransactions.length;
  const totalIncome = filteredTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = filteredTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Payment Method'];
    const rows = filteredTransactions.map((tx) => [
      format(new Date(tx.date), 'yyyy-MM-dd'),
      tx.type,
      tx.category,
      tx.description || '',
      tx.amount.toString(),
      tx.paymentMethod || '',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Transactions | Pocket Pal</title>
        <meta name="description" content="View and manage all your financial transactions" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
            <p className="text-muted-foreground mt-1">
              {totalFiltered} transactions found
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportToCSV} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)} className="btn-primary gap-2">
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="glass-card p-4 flex items-center justify-between">
            <span className="text-muted-foreground">Filtered Income</span>
            <span className="font-mono font-semibold text-income">{formatCurrency(totalIncome)}</span>
          </div>
          <div className="glass-card p-4 flex items-center justify-between">
            <span className="text-muted-foreground">Filtered Expense</span>
            <span className="font-mono font-semibold text-expense">{formatCurrency(totalExpense)}</span>
          </div>
          <div className="glass-card p-4 flex items-center justify-between">
            <span className="text-muted-foreground">Net</span>
            <span className={cn(
              'font-mono font-semibold',
              totalIncome - totalExpense >= 0 ? 'text-income' : 'text-expense'
            )}>
              {formatCurrency(totalIncome - totalExpense)}
            </span>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 input-glass"
              />
            </div>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as 'all' | TransactionType)}>
              <SelectTrigger className="input-glass">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="input-glass">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border max-h-60">
                <SelectItem value="all">All Categories</SelectItem>
                {allCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Range */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal input-glass">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from && dateRange.to ? (
                    <>
                      {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d')}
                    </>
                  ) : (
                    'Select dates'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover border-border" align="end">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                  numberOfMonths={2}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </motion.div>

        {/* Transaction List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <TransactionList
            transactions={filteredTransactions}
            onDelete={deleteTransaction}
          />
        </motion.div>

        <AddTransactionModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
      </div>
    </>
  );
}
