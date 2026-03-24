import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, Trash2, Loader2 } from 'lucide-react';
import { useBudgets } from '@/hooks/useBudgets';
import { useTransactions } from '@/hooks/useTransactions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Helmet } from 'react-helmet-async';
import { EXPENSE_CATEGORIES, CATEGORY_COLORS } from '@/types/finance';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function Budgets() {
  const { budgets, isLoading, addBudget, deleteBudget } = useBudgets();
  const { getCategoryTotals } = useTransactions();
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newLimit, setNewLimit] = useState('');

  const categoryTotals = getCategoryTotals('expense');

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  const handleAddBudget = () => {
    if (!newCategory || !newLimit) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    addBudget({
      category: newCategory,
      limit: parseFloat(newLimit),
      period: 'monthly',
    });

    setNewCategory('');
    setNewLimit('');
    setIsAddOpen(false);
  };

  const usedCategories = budgets.map((b) => b.category);
  const availableCategories = EXPENSE_CATEGORIES.filter(
    (c) => !usedCategories.includes(c.value)
  );

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
        <title>Budgets | Pocket Pal</title>
        <meta name="description" content="Set and track spending budgets by category" />
      </Helmet>

      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Budgets</h1>
            <p className="text-muted-foreground mt-1">
              Set spending limits and track your progress
            </p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary gap-2">
                <Plus className="h-4 w-4" />
                Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Create Budget</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={newCategory} onValueChange={setNewCategory}>
                    <SelectTrigger className="input-glass">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {availableCategories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Monthly Limit (₹)</Label>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={newLimit}
                    onChange={(e) => setNewLimit(e.target.value)}
                    className="input-glass"
                  />
                </div>
                <Button onClick={handleAddBudget} className="w-full btn-primary">
                  Create Budget
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Budget Cards */}
        {budgets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-12 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No budgets yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first budget to start tracking spending limits
            </p>
            <Button onClick={() => setIsAddOpen(true)} className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget, index) => {
              const spent = categoryTotals[budget.category] || 0;
              const percentage = Math.min((spent / budget.limit) * 100, 100);
              const isOverBudget = spent > budget.limit;
              const categoryInfo = EXPENSE_CATEGORIES.find((c) => c.value === budget.category);
              const color = CATEGORY_COLORS[budget.category] || '#6b7280';

              return (
                <motion.div
                  key={budget.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'glass-card p-6 relative overflow-hidden',
                    isOverBudget && 'border-expense/50'
                  )}
                >
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-medium text-foreground">
                        {categoryInfo?.name || budget.category}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteBudget(budget.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Progress */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className={cn(
                        'font-mono font-semibold',
                        isOverBudget ? 'text-expense' : 'text-foreground'
                      )}>
                        {formatCurrency(spent)}
                      </span>
                      <span className="text-muted-foreground">
                        of {formatCurrency(budget.limit)}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={cn(
                          'h-full rounded-full',
                          isOverBudget ? 'bg-expense' : percentage > 80 ? 'bg-warning' : 'bg-income'
                        )}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{percentage.toFixed(0)}% used</span>
                      <span>
                        {isOverBudget
                          ? `Over by ${formatCurrency(spent - budget.limit)}`
                          : `${formatCurrency(budget.limit - spent)} remaining`}
                      </span>
                    </div>
                  </div>

                  {/* Over budget warning */}
                  {isOverBudget && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute top-0 right-0 bg-expense text-expense-foreground text-xs px-2 py-1 rounded-bl-lg"
                    >
                      Over Budget!
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
