import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  ArrowRight,
  Calendar,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useTransactions } from '@/hooks/useTransactions';
import { StatCard } from '@/components/dashboard/StatCard';
import { TransactionList } from '@/components/dashboard/TransactionList';
import { AddTransactionModal } from '@/components/dashboard/AddTransactionModal';
import { SpendingChart } from '@/components/charts/SpendingChart';
import { MonthlyChart } from '@/components/charts/MonthlyChart';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const {
    transactions,
    isLoading,
    getTotalIncome,
    getTotalExpense,
    getBalance,
    getCategoryTotals,
    getMonthlyData,
    deleteTransaction,
  } = useTransactions();

  const userName = user?.fullName?.split(' ')[0] || 'there';

  const totalIncome = getTotalIncome();
  const totalExpense = getTotalExpense();
  const balance = getBalance();
  const expenseByCategory = getCategoryTotals('expense');
  const monthlyData = getMonthlyData();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : '0';

  // Get current month transactions
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const currentMonthTransactions = transactions.filter((tx) => {
    const date = new Date(tx.date);
    return date >= monthStart && date <= monthEnd;
  });

  const currentMonthExpense = currentMonthTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const currentMonthIncome = currentMonthTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

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
        <title>Dashboard | Pocket Pal- Smart Personal Finance</title>
        <meta name="description" content="Track your income, expenses, and savings with FinanceIQ's intelligent dashboard." />
      </Helmet>

      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {userName}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              {format(now, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary h-12 px-6 text-base font-medium"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Transaction
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Income"
            value={formatCurrency(totalIncome)}
            change={`+${formatCurrency(currentMonthIncome)} this month`}
            changeType="positive"
            icon={TrendingUp}
            variant="income"
            delay={0.1}
          />
          <StatCard
            title="Total Expenses"
            value={formatCurrency(totalExpense)}
            change={`-${formatCurrency(currentMonthExpense)} this month`}
            changeType="negative"
            icon={TrendingDown}
            variant="expense"
            delay={0.2}
          />
          <StatCard
            title="Net Balance"
            value={formatCurrency(balance)}
            change={`${savingsRate}% savings rate`}
            changeType={parseFloat(savingsRate) >= 20 ? 'positive' : 'neutral'}
            icon={Wallet}
            variant="balance"
            delay={0.3}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Spending by Category</h2>
              <Link to="/analytics">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  View all
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            <SpendingChart data={expenseByCategory} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Monthly Overview</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Last 3 months
              </div>
            </div>
            <MonthlyChart data={monthlyData} />
          </motion.div>
        </div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
            <Link to="/transactions">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <TransactionList
            transactions={transactions}
            onDelete={deleteTransaction}
            limit={5}
          />
        </motion.div>

        {/* Add Transaction Modal */}
        <AddTransactionModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
      </div>
    </>
  );
}
