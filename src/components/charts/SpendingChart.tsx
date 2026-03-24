import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { CATEGORY_COLORS, EXPENSE_CATEGORIES } from '@/types/finance';

interface SpendingChartProps {
  data: Record<string, number>;
}

export function SpendingChart({ data }: SpendingChartProps) {
  const chartData = Object.entries(data)
    .map(([category, value]) => ({
      name: EXPENSE_CATEGORIES.find((c) => c.value === category)?.name || category,
      value: Math.round(value),
      color: CATEGORY_COLORS[category] || '#6b7280',
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="glass-card p-3 border border-border">
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            ₹{data.value.toLocaleString('en-IN')} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No expense data available
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="h-80"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            animationBegin={0}
            animationDuration={1000}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="transparent"
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            formatter={(value: string) => (
              <span className="text-sm text-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
