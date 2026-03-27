
CREATE TABLE public.quiz_duel_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  seed TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'facile',
  is_public BOOLEAN NOT NULL DEFAULT false,
  invite_code TEXT,
  player1_name TEXT NOT NULL,
  player1_device_id TEXT NOT NULL,
  player1_attempt JSONB,
  player2_name TEXT,
  player2_device_id TEXT,
  player2_attempt JSONB,
  status TEXT NOT NULL DEFAULT 'open',
  questions JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE INDEX idx_quiz_duel_status_difficulty ON public.quiz_duel_matches (status, difficulty, is_public);
CREATE UNIQUE INDEX idx_quiz_duel_invite_code ON public.quiz_duel_matches (invite_code) WHERE invite_code IS NOT NULL;

ALTER TABLE public.quiz_duel_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read quiz duels" ON public.quiz_duel_matches FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert quiz duels" ON public.quiz_duel_matches FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update quiz duels" ON public.quiz_duel_matches FOR UPDATE TO public USING (true);
