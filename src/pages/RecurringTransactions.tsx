import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Plus, Calendar, Repeat, Pause, Play, Trash2, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useRecurringTransactions, RecurringTransaction, RecurrenceFrequency } from '@/hooks/useRecurringTransactions';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '@/types/finance';
import { cn } from '@/lib/utils';

const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

export default function RecurringTransactions() {
  const { recurringTransactions, isLoading, addRecurring, updateRecurring, deleteRecurring, toggleActive } = useRecurringTransactions();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeCount = recurringTransactions.filter(r => r.is_active).length;
  const monthlyTotal = recurringTransactions
    .filter(r => r.is_active)
    .reduce((sum, r) => {
      const multiplier = r.type === 'expense' ? -1 : 1;
      let monthlyAmount = r.amount;
      if (r.frequency === 'daily') monthlyAmount *= 30;
      if (r.frequency === 'weekly') monthlyAmount *= 4;
      if (r.frequency === 'yearly') monthlyAmount /= 12;
      return sum + (monthlyAmount * multiplier);
    }, 0);

  return (
    <>
      <Helmet>
        <title>Recurring Transactions | Pocket Pal</title>
      </Helmet>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Recurring Transactions</h1>
            <p className="text-muted-foreground">Manage your scheduled bills, subscriptions, and income</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Recurring
              </Button>
            </DialogTrigger>
            <RecurringFormDialog
              onSubmit={(data) => {
                addRecurring.mutate(data);
                setIsAddOpen(false);
              }}
              onClose={() => setIsAddOpen(false)}
            />
          </Dialog>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-3"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Recurring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Recurring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recurringTransactions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Est. Monthly Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold", monthlyTotal >= 0 ? "text-green-500" : "text-red-500")}>
                {formatCurrency(Math.abs(monthlyTotal))}
                <span className="text-sm font-normal ml-1">{monthlyTotal >= 0 ? 'income' : 'expense'}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {recurringTransactions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Repeat className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No recurring transactions</h3>
                <p className="text-muted-foreground text-center mt-1">
                  Add recurring bills, subscriptions, or income to automate your tracking
                </p>
              </CardContent>
            </Card>
          ) : (
            recurringTransactions.map((recurring) => (
              <Card key={recurring.id} className={cn(!recurring.is_active && "opacity-60")}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      recurring.type === 'income' ? "bg-green-500/10" : "bg-red-500/10"
                    )}>
                      <Repeat className={cn(
                        "h-5 w-5",
                        recurring.type === 'income' ? "text-green-500" : "text-red-500"
                      )} />
                    </div>
                    <div>
                      <div className="font-medium">{recurring.description || recurring.category}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {FREQUENCY_LABELS[recurring.frequency]}
                        </Badge>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Next: {format(new Date(recurring.next_run_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "text-lg font-semibold",
                      recurring.type === 'income' ? "text-green-500" : "text-red-500"
                    )}>
                      {recurring.type === 'income' ? '+' : '-'}{formatCurrency(recurring.amount)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={recurring.is_active}
                        onCheckedChange={(checked) => toggleActive.mutate({ id: recurring.id, is_active: checked })}
                      />
                      <Dialog open={editingId === recurring.id} onOpenChange={(open) => setEditingId(open ? recurring.id : null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <RecurringFormDialog
                          initialData={recurring}
                          onSubmit={(data) => {
                            updateRecurring.mutate({ id: recurring.id, ...data });
                            setEditingId(null);
                          }}
                          onClose={() => setEditingId(null)}
                        />
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteRecurring.mutate(recurring.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </motion.div>
      </div>
    </>
  );
}

interface RecurringFormDialogProps {
  initialData?: RecurringTransaction;
  onSubmit: (data: Omit<RecurringTransaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  onClose: () => void;
}

function RecurringFormDialog({ initialData, onSubmit, onClose }: RecurringFormDialogProps) {
  const [type, setType] = useState<'income' | 'expense'>(initialData?.type || 'expense');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [paymentMethod, setPaymentMethod] = useState(initialData?.payment_method || '');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>(initialData?.frequency || 'monthly');
  const [nextRunDate, setNextRunDate] = useState<Date>(
    initialData?.next_run_date ? new Date(initialData.next_run_date) : new Date()
  );
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSubmit = () => {
    if (!amount || !category) return;
    
    onSubmit({
      type,
      amount: parseFloat(amount),
      category,
      description: description || null,
      payment_method: paymentMethod || null,
      frequency,
      next_run_date: nextRunDate.toISOString().split('T')[0],
      is_active: isActive,
    });
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{initialData ? 'Edit' : 'Add'} Recurring Transaction</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={type === 'expense' ? 'default' : 'outline'}
            onClick={() => { setType('expense'); setCategory(''); }}
          >
            Expense
          </Button>
          <Button
            type="button"
            variant={type === 'income' ? 'default' : 'outline'}
            onClick={() => { setType('income'); setCategory(''); }}
          >
            Income
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Amount</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Input
            placeholder="e.g., Netflix subscription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Payment Method</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  {method.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Frequency</Label>
          <Select value={frequency} onValueChange={(v) => setFrequency(v as RecurrenceFrequency)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Next Run Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <Calendar className="mr-2 h-4 w-4" />
                {format(nextRunDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={nextRunDate}
                onSelect={(date) => date && setNextRunDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center justify-between">
          <Label>Active</Label>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>

        <Button onClick={handleSubmit} className="w-full">
          {initialData ? 'Update' : 'Create'} Recurring Transaction
        </Button>
      </div>
    </DialogContent>
  );
}
