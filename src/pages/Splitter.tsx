import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Send, Trash2, Users, ArrowRight, RotateCcw, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSplitter, ParsedExpense } from '@/hooks/useSplitter';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export default function Splitter() {
  const { entries, ledger, settlements, isLoading, addExpense, clearAll, removeEntry } = useSplitter();
  const [input, setInput] = useState('');
  const [lastParsed, setLastParsed] = useState<ParsedExpense | null>(null);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    try {
      const result = await addExpense(input.trim());
      if ('clarification_needed' in result && result.clarification_needed) {
        toast.warning(result.clarification_needed);
        return;
      }
      setLastParsed(result as ParsedExpense);
      setInput('');
      toast.success('Expense added!');
    } catch (e: any) {
      toast.error(e.message || 'Failed to parse expense');
    }
  };

  return (
    <>
      <Helmet><title>Splitter | Pocket Pal</title></Helmet>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Named Splitter</h1>
          <p className="text-muted-foreground mt-1">Describe group expenses in plain English and we'll split them smartly.</p>
        </div>

        {/* Input */}
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <Textarea
                placeholder='e.g. "Rahul paid ₹1200 for dinner for Rahul, Priya, and Amit" or "Sneha paid 800 for movie tickets for everyone except Rohan"'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[100px] resize-none text-base"
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
              />
              <div className="flex gap-2">
                <Button onClick={handleSubmit} disabled={isLoading || !input.trim()} className="gap-2">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Split Expense
                </Button>
                {entries.length > 0 && (
                  <Button variant="outline" onClick={clearAll} className="gap-2 text-destructive hover:text-destructive">
                    <RotateCcw className="h-4 w-4" /> Clear All
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Last Parsed Result */}
        <AnimatePresence>
          {lastParsed && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Card className="border-accent">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" /> Last Parsed Expense
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Paid by:</span> <span className="font-semibold">{lastParsed.paid_by}</span></div>
                    <div><span className="text-muted-foreground">Amount:</span> <span className="font-semibold">{formatCurrency(lastParsed.amount)}</span></div>
                    <div><span className="text-muted-foreground">Participants:</span> <span className="font-semibold">{lastParsed.participants.join(', ')}</span></div>
                    <div><span className="text-muted-foreground">Per person:</span> <span className="font-semibold">{formatCurrency(lastParsed.split_per_person)}</span></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Running Ledger */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Running Ledger
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(ledger).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No expenses yet. Add one above!</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(ledger)
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, balance]) => (
                      <motion.div key={name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                        <span className="font-medium text-foreground">{name}</span>
                        <Badge variant={balance >= 0 ? 'default' : 'destructive'}
                          className={cn(balance >= 0 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20')}>
                          {balance >= 0 ? '+' : ''}{formatCurrency(Math.abs(balance))}
                          {balance >= 0 ? ' (receives)' : ' (owes)'}
                        </Badge>
                      </motion.div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Simplified Settlements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-primary" /> Simplified Settlements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {settlements.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">All settled up! 🎉</p>
              ) : (
                <div className="space-y-2">
                  {settlements.map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-accent/30">
                      <span className="font-medium text-foreground">{s.from}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium text-foreground">{s.to}</span>
                      <Badge className="ml-auto bg-primary/10 text-primary border-primary/20">{formatCurrency(s.amount)}</Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Expense History */}
        {entries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Expense History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {entries.map((entry, i) => (
                  <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-start justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/20 transition-colors group">
                    <div className="space-y-1 flex-1">
                      <p className="font-medium text-foreground">{entry.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {entry.paid_by} paid {formatCurrency(entry.amount)} · Split among {entry.participants.join(', ')} · {formatCurrency(entry.split_per_person)}/person
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {entry.transactions.map((tx, j) => (
                          <Badge key={j} variant="outline" className="text-xs">
                            {tx.from} → {tx.to}: {formatCurrency(tx.amount)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive"
                      onClick={() => { removeEntry(entry.id); toast.success('Entry removed'); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
