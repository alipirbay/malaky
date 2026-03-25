CREATE TABLE IF NOT EXISTS public.card_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_text TEXT NOT NULL,
  mode TEXT,
  vibe TEXT,
  reason TEXT NOT NULL DEFAULT 'inappropriate',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.card_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can report" ON public.card_reports FOR INSERT TO public WITH CHECK (true);