
-- Payment transactions table
CREATE TABLE public.payment_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  order_id TEXT NOT NULL,
  reference TEXT NOT NULL,
  panier TEXT,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'MGA' CHECK (currency IN ('MGA', 'EUR')),
  payment_mode TEXT NOT NULL CHECK (payment_mode IN ('mobile_money', 'international')),
  vpi_transaction_id TEXT,
  vpi_reference TEXT,
  payment_url TEXT,
  status TEXT NOT NULL DEFAULT 'INITIATED' CHECK (status IN ('INITIATED', 'PENDING', 'SUCCESS', 'FAILED')),
  initiator TEXT,
  reference_mm TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read their own transactions"
ON public.payment_transactions FOR SELECT
TO public
USING (true);

CREATE POLICY "Service can insert transactions"
ON public.payment_transactions FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Service can update transactions"
ON public.payment_transactions FOR UPDATE
TO public
USING (true);
