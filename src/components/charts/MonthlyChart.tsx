import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { format, parse } from 'date-fns';

interface MonthlyChartProps {
  data: { month: string; income: number; expense: number }[];
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    monthLabel: format(parse(d.month, 'yyyy-MM', new Date()), 'MMM'),
    savings: d.income - d.expense,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-4 border border-border min-w-[180px]">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span style={{ color: entry.color }}>{entry.name}</span>
              <span className="font-mono ml-4">
                ₹{entry.value.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No monthly data available
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="h-80"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(160, 70%, 45%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(160, 70%, 45%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="monthLabel"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value: string) => (
              <span className="text-sm text-foreground">{value}</span>
            )}
          />
          <Area
            type="monotone"
            dataKey="income"
            name="Income"
            stroke="hsl(160, 70%, 45%)"
            strokeWidth={2}
            fill="url(#incomeGradient)"
            animationDuration={1000}
          />
          <Area
            type="monotone"
            dataKey="expense"
            name="Expense"
            stroke="hsl(0, 72%, 55%)"
            strokeWidth={2}
            fill="url(#expenseGradient)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
