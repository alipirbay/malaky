-- Table for dilemme votes
CREATE TABLE public.dilemme_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_text TEXT NOT NULL,
  choice TEXT NOT NULL CHECK (choice IN ('a', 'b')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.dilemme_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read votes" ON public.dilemme_votes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert votes" ON public.dilemme_votes FOR INSERT WITH CHECK (true);
CREATE INDEX idx_dilemme_votes_card_text ON public.dilemme_votes(card_text);

-- Table for active sessions tracking
CREATE TABLE public.active_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read sessions" ON public.active_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert sessions" ON public.active_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update sessions" ON public.active_sessions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete sessions" ON public.active_sessions FOR DELETE USING (true);
CREATE INDEX idx_active_sessions_last_seen ON public.active_sessions(last_seen);

-- Function to get active user count
CREATE OR REPLACE FUNCTION public.get_active_users_count()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer FROM public.active_sessions WHERE last_seen > now() - interval '5 minutes';
$$;

-- Function to get vote percentages for a dilemme card
CREATE OR REPLACE FUNCTION public.get_dilemme_votes(p_card_text TEXT)
RETURNS TABLE(choice_a_pct integer, choice_b_pct integer, total_votes integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(ROUND(SUM(CASE WHEN choice = 'a' THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*), 0) * 100), 50)::integer as choice_a_pct,
    COALESCE(ROUND(SUM(CASE WHEN choice = 'b' THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*), 0) * 100), 50)::integer as choice_b_pct,
    COUNT(*)::integer as total_votes
  FROM public.dilemme_votes
  WHERE card_text = p_card_text;
$$;