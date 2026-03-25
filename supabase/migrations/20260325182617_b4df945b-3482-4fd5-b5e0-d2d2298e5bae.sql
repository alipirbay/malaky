-- Add voter fingerprint to dilemme_votes for basic spam prevention
ALTER TABLE public.dilemme_votes
  ADD COLUMN IF NOT EXISTS voter_fingerprint TEXT;

-- Prevent same fingerprint from voting twice on same dilemme  
CREATE UNIQUE INDEX IF NOT EXISTS idx_dilemme_votes_dedup
  ON public.dilemme_votes (dilemme_id, voter_fingerprint);
