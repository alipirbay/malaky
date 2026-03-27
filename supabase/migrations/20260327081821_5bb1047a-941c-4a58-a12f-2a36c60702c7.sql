ALTER TABLE public.quiz_duel_matches ADD COLUMN IF NOT EXISTS expires_at timestamptz DEFAULT (now() + interval '48 hours');

CREATE OR REPLACE FUNCTION public.expire_old_duels()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.quiz_duel_matches 
  SET status = 'expired' 
  WHERE status IN ('open', 'playing') 
    AND expires_at < now();
$$;