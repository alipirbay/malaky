
CREATE TABLE public.daily_dilemmes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  topic text NOT NULL DEFAULT 'general',
  active_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(active_date)
);

ALTER TABLE public.daily_dilemmes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read daily dilemmes" ON public.daily_dilemmes FOR SELECT TO public USING (true);
CREATE POLICY "Service role can insert dilemmes" ON public.daily_dilemmes FOR INSERT TO public WITH CHECK (true);

ALTER TABLE public.dilemme_votes ADD COLUMN dilemme_id uuid REFERENCES public.daily_dilemmes(id) ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION public.get_daily_dilemme_votes(p_dilemme_id uuid)
RETURNS TABLE(choice_a_pct integer, choice_b_pct integer, total_votes integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT 
    COALESCE(ROUND(SUM(CASE WHEN choice = 'a' THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*), 0) * 100), 50)::integer as choice_a_pct,
    COALESCE(ROUND(SUM(CASE WHEN choice = 'b' THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*), 0) * 100), 50)::integer as choice_b_pct,
    COUNT(*)::integer as total_votes
  FROM public.dilemme_votes
  WHERE dilemme_id = p_dilemme_id;
$$;
