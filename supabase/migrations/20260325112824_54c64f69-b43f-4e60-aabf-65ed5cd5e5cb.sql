
-- Table principale des cartes
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mode TEXT NOT NULL,
  vibe TEXT NOT NULL,
  card_type TEXT NOT NULL,
  template TEXT NOT NULL,
  answer TEXT,
  lang TEXT NOT NULL DEFAULT 'fr',
  source TEXT NOT NULL DEFAULT 'human',
  quality_score FLOAT NOT NULL DEFAULT 1.0,
  play_count INTEGER NOT NULL DEFAULT 0,
  report_count INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read active cards" ON public.cards
  FOR SELECT TO public USING (active = true);

CREATE POLICY "Service can insert" ON public.cards
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service can update" ON public.cards
  FOR UPDATE TO service_role USING (true);

CREATE INDEX IF NOT EXISTS idx_cards_mode_vibe 
  ON public.cards(mode, vibe) WHERE active = true;

-- Function to increment play count
CREATE OR REPLACE FUNCTION public.increment_play_count(card_ids UUID[])
RETURNS void AS $$
  UPDATE public.cards 
  SET play_count = play_count + 1 
  WHERE id = ANY(card_ids);
$$ LANGUAGE sql SECURITY DEFINER;
