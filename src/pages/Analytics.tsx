import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, PiggyBank, AlertTriangle, ArrowUpRight, Loader2 } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { SpendingChart } from '@/components/charts/SpendingChart';
import { MonthlyChart } from '@/components/charts/MonthlyChart';
import { EXPENSE_CATEGORIES, CATEGORY_COLORS } from '@/types/finance';
import { Helmet } from 'react-helmet-async';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function Analytics() {
  const {
    isLoading,
    getTotalIncome,
    getTotalExpense,
    getCategoryTotals,
    getMonthlyData,
  } = useTransactions();

  const totalIncome = getTotalIncome();
  const totalExpense = getTotalExpense();
  const expenseByCategory = getCategoryTotals('expense');
  const monthlyData = getMonthlyData();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  const burnRate = totalExpense / (monthlyData.length || 1);

  // Category breakdown data for bar chart
  const categoryData = Object.entries(expenseByCategory)
    .map(([category, amount]) => ({
      category: EXPENSE_CATEGORIES.find((c) => c.value === category)?.name.split(' ')[0] || category,
      fullName: EXPENSE_CATEGORIES.find((c) => c.value === category)?.name || category,
      amount,
      color: CATEGORY_COLORS[category] || '#6b7280',
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 7);

  // Insights
  const topExpenseCategory = categoryData[0];
  const avgMonthlyExpense = totalExpense / Math.max(monthlyData.length, 1);
  const avgMonthlyIncome = totalIncome / Math.max(monthlyData.length, 1);
  const projectedYearlySavings = (avgMonthlyIncome - avgMonthlyExpense) * 12;

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { fullName: string; amount: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card p-3 border border-border">
          <p className="font-medium text-foreground">{data.fullName}</p>
          <p className="text-sm text-muted-foreground font-mono">
            {formatCurrency(data.amount)}
          </p>
        </div>
      );
    }
    return null;
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
        <title>Analytics | Pocket Pal</title>
        <meta name="description" content="Deep insights into your spending patterns and financial health" />
      </Helmet>

      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Deep insights into your financial health
          </p>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Savings Rate',
              value: `${savingsRate.toFixed(1)}%`,
              icon: PiggyBank,
              color: savingsRate >= 20 ? 'text-income' : 'text-warning',
              bg: savingsRate >= 20 ? 'bg-income/10' : 'bg-warning/10',
            },
            {
              label: 'Monthly Burn Rate',
              value: formatCurrency(burnRate),
              icon: TrendingDown,
              color: 'text-expense',
              bg: 'bg-expense/10',
            },
            {
              label: 'Projected Yearly Savings',
              value: formatCurrency(Math.max(0, projectedYearlySavings)),
              icon: TrendingUp,
              color: projectedYearlySavings >= 0 ? 'text-income' : 'text-expense',
              bg: projectedYearlySavings >= 0 ? 'bg-income/10' : 'bg-expense/10',
            },
            {
              label: 'Top Expense',
              value: topExpenseCategory?.fullName || 'N/A',
              icon: AlertTriangle,
              color: 'text-warning',
              bg: 'bg-warning/10',
            },
          ].map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={cn('p-2 rounded-lg', metric.bg)}>
                  <metric.icon className={cn('h-5 w-5', metric.color)} />
                </div>
                <span className="text-sm text-muted-foreground">{metric.label}</span>
              </div>
              <p className={cn('text-xl font-semibold font-mono', metric.color)}>
                {metric.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-6">Monthly Income vs Expense</h2>
            <MonthlyChart data={monthlyData} />
          </motion.div>

          {/* Spending by Category Pie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-6">Spending Distribution</h2>
            <SpendingChart data={expenseByCategory} />
          </motion.div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-6">Top Expense Categories</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent))' }} />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]} animationDuration={1000}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Insights Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="glass-card p-6 border-l-4 border-income">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-income" />
              Savings Insight
            </h3>
            <p className="text-muted-foreground">
              {savingsRate >= 20
                ? `Great job! You're saving ${savingsRate.toFixed(1)}% of your income. Keep up the good work!`
                : savingsRate >= 10
                ? `You're saving ${savingsRate.toFixed(1)}% of your income. Try to aim for 20% for better financial health.`
                : `Your savings rate is ${savingsRate.toFixed(1)}%. Consider reviewing your expenses to increase savings.`}
            </p>
          </div>

          <div className="glass-card p-6 border-l-4 border-warning">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Spending Alert
            </h3>
            <p className="text-muted-foreground">
              {topExpenseCategory
                ? `Your highest expense category is ${topExpenseCategory.fullName} at ${formatCurrency(topExpenseCategory.amount)}. Consider if there's room to optimize.`
                : 'Start tracking your expenses to get personalized insights.'}
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
