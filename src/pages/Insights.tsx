import { motion } from 'framer-motion';
import { Sparkles, Lightbulb, TrendingUp, AlertCircle, Target, Zap, Loader2 } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { EXPENSE_CATEGORIES } from '@/types/finance';
import { Helmet } from 'react-helmet-async';
import { cn } from '@/lib/utils';

export default function Insights() {
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

  // Calculate insights
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  const avgMonthlyExpense = totalExpense / Math.max(monthlyData.length, 1);
  const avgMonthlyIncome = totalIncome / Math.max(monthlyData.length, 1);

  // Find spending patterns
  const sortedCategories = Object.entries(expenseByCategory)
    .sort(([, a], [, b]) => b - a);
  const topCategory = sortedCategories[0];
  const topCategoryName = topCategory
    ? EXPENSE_CATEGORIES.find((c) => c.value === topCategory[0])?.name || topCategory[0]
    : null;

  // Calculate month-over-month changes
  const lastTwoMonths = monthlyData.slice(-2);
  const expenseChange = lastTwoMonths.length === 2
    ? ((lastTwoMonths[1].expense - lastTwoMonths[0].expense) / lastTwoMonths[0].expense) * 100
    : 0;

  // Generate AI-style insights
  const insights = [
    {
      type: 'summary',
      icon: Sparkles,
      title: 'Monthly Summary',
      color: 'bg-primary/10 text-primary border-primary/20',
      content: `You've earned ${formatCurrency(avgMonthlyIncome)} on average per month and spent ${formatCurrency(avgMonthlyExpense)}. ${
        savingsRate >= 20
          ? 'Your savings rate is excellent!'
          : savingsRate >= 10
          ? 'Consider optimizing your spending to increase savings.'
          : 'Focus on reducing expenses to build your savings.'
      }`,
    },
    {
      type: 'spending',
      icon: AlertCircle,
      title: 'Top Spending Area',
      color: 'bg-warning/10 text-warning border-warning/20',
      content: topCategoryName
        ? `${topCategoryName} is your biggest expense at ${formatCurrency(topCategory[1])}. ${
            topCategory[0] === 'housing'
              ? 'Housing costs are typically fixed, but consider if there are any utilities you can optimize.'
              : topCategory[0] === 'food'
              ? 'Try meal planning and cooking at home more often to reduce food expenses.'
              : topCategory[0] === 'shopping'
              ? 'Consider implementing a 24-hour rule before making non-essential purchases.'
              : 'Look for opportunities to reduce spending in this category.'
          }`
        : 'Start tracking your expenses to see where your money goes.',
    },
    {
      type: 'trend',
      icon: TrendingUp,
      title: 'Spending Trend',
      color: expenseChange > 0 ? 'bg-expense/10 text-expense border-expense/20' : 'bg-income/10 text-income border-income/20',
      content: lastTwoMonths.length === 2
        ? `Your spending ${expenseChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(expenseChange).toFixed(1)}% compared to last month. ${
            expenseChange > 10
              ? 'Consider reviewing your recent purchases to understand this increase.'
              : expenseChange < -10
              ? 'Great job on reducing your expenses!'
              : 'Your spending is relatively stable.'
          }`
        : 'Keep tracking to see your spending trends over time.',
    },
    {
      type: 'tip',
      icon: Lightbulb,
      title: 'Savings Tip',
      color: 'bg-income/10 text-income border-income/20',
      content: savingsRate < 20
        ? `To reach a 20% savings rate, you'd need to save an additional ${formatCurrency(avgMonthlyIncome * 0.2 - (avgMonthlyIncome - avgMonthlyExpense))} per month. Start by identifying one expense you can reduce.`
        : `You're already saving ${savingsRate.toFixed(1)}% of your income! Consider investing your surplus to grow your wealth over time.`,
    },
    {
      type: 'goal',
      icon: Target,
      title: 'Emergency Fund',
      color: 'bg-secondary text-secondary-foreground border-border',
      content: `Based on your average monthly expenses of ${formatCurrency(avgMonthlyExpense)}, aim to build an emergency fund of ${formatCurrency(avgMonthlyExpense * 6)} (6 months of expenses). ${
        (totalIncome - totalExpense) > 0
          ? `At your current savings rate, this would take approximately ${Math.ceil((avgMonthlyExpense * 6) / (avgMonthlyIncome - avgMonthlyExpense))} months.`
          : 'Start by reducing expenses to build this safety net.'
      }`,
    },
    {
      type: 'quick-win',
      icon: Zap,
      title: 'Quick Win',
      color: 'bg-accent text-accent-foreground border-border',
      content: sortedCategories.length > 3
        ? `Your ${EXPENSE_CATEGORIES.find((c) => c.value === sortedCategories[2][0])?.name || sortedCategories[2][0]} spending is ${formatCurrency(sortedCategories[2][1])}. Reducing this by just 10% would save you ${formatCurrency(sortedCategories[2][1] * 0.1)} per period.`
        : 'Keep tracking your expenses to unlock personalized quick wins!',
    },
  ];

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
        <title>AI Insights | Pocket Pal</title>
        <meta name="description" content="Personalized financial insights and recommendations" />
      </Helmet>

      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">AI Insights</h1>
              <p className="text-muted-foreground">
                Personalized recommendations for your finances
              </p>
            </div>
          </div>
        </motion.div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'glass-card p-6 border-l-4',
                insight.color
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn('p-3 rounded-xl', insight.color.split(' ')[0])}>
                  <insight.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">{insight.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{insight.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-8 text-center"
        >
          <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Want More Personalized Insights?
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Keep adding transactions to unlock more detailed analysis and personalized recommendations tailored to your spending habits.
          </p>
        </motion.div>
      </div>
    </>
  );
}
