import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Trash2, ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';
import { Transaction, CATEGORY_COLORS, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/finance';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  limit?: number;
}

export function TransactionList({ transactions, onDelete, limit }: TransactionListProps) {
  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

  const getCategoryLabel = (category: string, type: string) => {
    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    return categories.find((c) => c.value === category)?.name || category;
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (displayTransactions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <ArrowUpRight className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">No transactions yet</h3>
        <p className="text-sm text-muted-foreground">
          Start tracking your finances by adding your first transaction
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      {displayTransactions.map((transaction, index) => (
        <motion.div
          key={transaction.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="transaction-item group"
        >
          {/* Icon */}
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl text-lg flex-shrink-0',
              transaction.type === 'income'
                ? 'bg-income/10 text-income'
                : 'bg-expense/10 text-expense'
            )}
          >
            {transaction.type === 'income' ? (
              <ArrowUpRight className="h-5 w-5" />
            ) : (
              <ArrowDownRight className="h-5 w-5" />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{transaction.description}</p>
            <p className="text-sm text-muted-foreground">
              {getCategoryLabel(transaction.category, transaction.type)} •{' '}
              {format(new Date(transaction.date), 'MMM d, yyyy')}
            </p>
          </div>

          {/* Amount */}
          <div
            className={cn(
              'font-mono font-semibold text-right',
              transaction.type === 'income' ? 'amount-income' : 'amount-expense'
            )}
          >
            {transaction.type === 'income' ? '+' : '-'}
            {formatAmount(transaction.amount)}
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => onDelete(transaction.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      ))}
    </div>
  );
}
