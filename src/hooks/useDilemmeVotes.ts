import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface VoteResult {
  choiceAPct: number;
  choiceBPct: number;
  totalVotes: number;
}

export function useDilemmeVotes() {
  const [result, setResult] = useState<VoteResult | null>(null);
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const vote = useCallback(async (cardText: string, choice: "a" | "b") => {
    if (voting || hasVoted) return;
    setVoting(true);

    await supabase.from("dilemme_votes").insert({ card_text: cardText, choice });

    const { data } = await supabase.rpc("get_dilemme_votes", { p_card_text: cardText });
    if (data && data.length > 0) {
      const row = data[0];
      setResult({
        choiceAPct: row.choice_a_pct ?? 50,
        choiceBPct: row.choice_b_pct ?? 50,
        totalVotes: row.total_votes ?? 1,
      });
    }

    setHasVoted(true);
    setVoting(false);
  }, [voting, hasVoted]);

  const reset = useCallback(() => {
    setResult(null);
    setHasVoted(false);
  }, []);

  return { result, voting, hasVoted, vote, reset };
}
