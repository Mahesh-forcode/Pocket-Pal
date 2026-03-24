import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTransactions } from '@/hooks/useTransactions';
import {
  TransactionType,
  PaymentMethod,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
} from '@/types/finance';
import { useToast } from '@/hooks/use-toast';

interface AddTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTransactionModal({ open, onOpenChange }: AddTransactionModalProps) {
  const { addTransaction } = useTransactions();
  const { toast } = useToast();
  
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [date, setDate] = useState<Date>(new Date());
  const [isRecurring, setIsRecurring] = useState(false);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category || !description) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    addTransaction({
      type,
      amount: parseFloat(amount),
      category,
      description,
      paymentMethod,
      date: date.toISOString(),
      tags: [],
      isRecurring,
    });

    toast({
      title: 'Transaction added',
      description: `${type === 'income' ? 'Income' : 'Expense'} of ₹${parseFloat(amount).toLocaleString('en-IN')} recorded`,
    });

    // Reset form
    setAmount('');
    setCategory('');
    setDescription('');
    setPaymentMethod('upi');
    setDate(new Date());
    setIsRecurring(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add Transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-xl">
            {(['income', 'expense'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t);
                  setCategory('');
                }}
                className={cn(
                  'flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200',
                  type === t
                    ? t === 'income'
                      ? 'bg-income text-income-foreground shadow-md'
                      : 'bg-expense text-expense-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">
                ₹
              </span>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 text-2xl font-mono h-14 input-glass"
              />
            </div>
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="input-glass">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                <SelectTrigger className="input-glass">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-glass"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal input-glass',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Recurring Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsRecurring(!isRecurring)}
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors duration-200',
                isRecurring ? 'bg-primary' : 'bg-muted'
              )}
            >
              <motion.div
                layout
                className={cn(
                  'absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm',
                  isRecurring ? 'left-6' : 'left-1'
                )}
              />
            </button>
            <Label className="cursor-pointer" onClick={() => setIsRecurring(!isRecurring)}>
              Recurring transaction
            </Label>
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full btn-primary h-12 text-base font-medium">
            <Plus className="h-5 w-5 mr-2" />
            Add Transaction
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
