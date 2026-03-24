import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  variant: 'income' | 'expense' | 'balance';
  delay?: number;
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  variant,
  delay = 0,
}: StatCardProps) {
  const variants = {
    income: 'stat-card-income',
    expense: 'stat-card-expense',
    balance: 'stat-card-balance',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={cn('stat-card group cursor-default', variants[variant])}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium opacity-90">{title}</span>
          <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        
        <div className="space-y-1">
          <h3 className="text-3xl font-bold tracking-tight font-mono">{value}</h3>
          {change && (
            <p
              className={cn(
                'text-sm font-medium',
                changeType === 'positive' && 'text-green-200',
                changeType === 'negative' && 'text-red-200',
                changeType === 'neutral' && 'opacity-80'
              )}
            >
              {change}
            </p>
          )}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
    </motion.div>
  );
}
