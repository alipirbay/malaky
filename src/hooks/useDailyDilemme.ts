import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getMadagascarDateString, getMsUntilMadagascarMidnight } from "@/lib/dateUtils";

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

  const getVoteKey = (id: string) => `dilemme-voted-${id}`;

  const fetchVotes = useCallback(async (dilemmeId: string) => {
    const { data } = await supabase.rpc("get_daily_dilemme_votes", { p_dilemme_id: dilemmeId });
    if (data && data.length > 0) {
      const row = data[0];
      setVoteResult({
        choiceAPct: row.choice_a_pct ?? 50,
        choiceBPct: row.choice_b_pct ?? 50,
        totalVotes: row.total_votes ?? 1,
      });
    }
  }, []);

  const fetchDilemme = useCallback(async () => {
    setLoading(true);
    try {
      const today = getMadagascarDateString();
      const { data: existing } = await supabase
        .from("daily_dilemmes")
        .select("*")
        .eq("active_date", today)
        .maybeSingle();

      if (existing) {
        const d = existing as DailyDilemme;
        setDilemme(d);
        const voted = localStorage.getItem(getVoteKey(d.id));
        if (voted) {
          setHasVoted(true);
          await fetchVotes(d.id);
        }
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("generate-daily-dilemme");
      if (error) throw error;
      if (data?.dilemme) {
        const d = data.dilemme as DailyDilemme;
        setDilemme(d);
        const voted = localStorage.getItem(getVoteKey(d.id));
        if (voted) {
          setHasVoted(true);
          await fetchVotes(d.id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch dilemme:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchVotes]);

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

  return { dilemme, loading, voteResult, hasVoted, voting, vote, getTimeUntilNext: getMsUntilMadagascarMidnight };
}
