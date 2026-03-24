import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DailyDilemme {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  topic: string;
  active_date: string;
}

interface VoteResult {
  choiceAPct: number;
  choiceBPct: number;
  totalVotes: number;
}

export function useDailyDilemme() {
  const [dilemme, setDilemme] = useState<DailyDilemme | null>(null);
  const [loading, setLoading] = useState(true);
  const [voteResult, setVoteResult] = useState<VoteResult | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);

  // Check localStorage for today's vote
  const getVoteKey = (id: string) => `dilemme-voted-${id}`;

  const fetchDilemme = useCallback(async () => {
    setLoading(true);
    try {
      // First try to get from DB
      const today = new Date().toISOString().split("T")[0];
      const { data: existing } = await supabase
        .from("daily_dilemmes")
        .select("*")
        .eq("active_date", today)
        .maybeSingle();

      if (existing) {
        setDilemme(existing as DailyDilemme);
        const voted = localStorage.getItem(getVoteKey(existing.id));
        if (voted) {
          setHasVoted(true);
          await fetchVotes(existing.id);
        }
        setLoading(false);
        return;
      }

      // Generate via edge function
      const { data, error } = await supabase.functions.invoke("generate-daily-dilemme");
      if (error) throw error;
      if (data?.dilemme) {
        setDilemme(data.dilemme);
        const voted = localStorage.getItem(getVoteKey(data.dilemme.id));
        if (voted) {
          setHasVoted(true);
          await fetchVotes(data.dilemme.id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch dilemme:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVotes = async (dilemmeId: string) => {
    const { data } = await supabase.rpc("get_daily_dilemme_votes", { p_dilemme_id: dilemmeId });
    if (data && data.length > 0) {
      const row = data[0];
      setVoteResult({
        choiceAPct: row.choice_a_pct ?? 50,
        choiceBPct: row.choice_b_pct ?? 50,
        totalVotes: row.total_votes ?? 1,
      });
    }
  };

  const vote = async (choice: "a" | "b") => {
    if (!dilemme || voting || hasVoted) return;
    setVoting(true);

    await supabase.from("dilemme_votes").insert({
      card_text: dilemme.question,
      choice,
      dilemme_id: dilemme.id,
    });

    localStorage.setItem(getVoteKey(dilemme.id), choice);
    setHasVoted(true);
    await fetchVotes(dilemme.id);
    setVoting(false);
  };

  useEffect(() => {
    fetchDilemme();
  }, [fetchDilemme]);

  // Calculate time until next dilemme (midnight)
  const getTimeUntilNext = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime() - now.getTime();
  };

  return { dilemme, loading, voteResult, hasVoted, voting, vote, getTimeUntilNext };
}
