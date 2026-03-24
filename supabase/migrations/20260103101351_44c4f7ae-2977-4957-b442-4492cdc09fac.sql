-- Create enum for recurrence frequency
CREATE TYPE public.recurrence_frequency AS ENUM ('daily', 'weekly', 'monthly', 'yearly');

-- Create recurring transactions table
CREATE TABLE public.recurring_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  payment_method TEXT,
  frequency recurrence_frequency NOT NULL DEFAULT 'monthly',
  next_run_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own recurring transactions"
ON public.recurring_transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recurring transactions"
ON public.recurring_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring transactions"
ON public.recurring_transactions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring transactions"
ON public.recurring_transactions
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_recurring_transactions_updated_at
BEFORE UPDATE ON public.recurring_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER TABLE public.recurring_transactions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.recurring_transactions;