import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getMadagascarDateString, getMsUntilMadagascarMidnight } from "@/lib/dateUtils";
import { getLocalDilemmeForDate } from "@/data/local_dilemmes";

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

import { storageGet, storageSet, storageRemove } from "@/lib/storage";

const FETCH_TIMEOUT_MS = 3000;

function getCachedDilemme(today: string): DailyDilemme | null {
  const cached = storageGet<DailyDilemme | null>("dilemme-cache", null);
  if (cached && cached.active_date === today) return cached;
  return null;
}

function cacheDilemme(d: DailyDilemme): void {
  storageSet("dilemme-cache", d);
}

function buildLocalDilemme(today: string): DailyDilemme {
  const local = getLocalDilemmeForDate(today);
  return {
    id: `local-${today}`,
    question: local.question,
    option_a: local.option_a,
    option_b: local.option_b,
    topic: local.topic,
    active_date: today,
  };
}

export function useDailyDilemme() {
  const today = getMadagascarDateString();
  const initialDilemme = getCachedDilemme(today) || buildLocalDilemme(today);

  const [dilemme, setDilemme] = useState<DailyDilemme>(initialDilemme);
  const [loading, setLoading] = useState(false);
  const [voteResult, setVoteResult] = useState<VoteResult | null>(null);
  const [hasVoted, setHasVoted] = useState(() => {
    return storageGet<string | null>(`dilemme-voted-${initialDilemme.id}`, null) !== null;
  });
  const [voting, setVoting] = useState(false);
  const fetchedRef = useRef(false);

  const getVoteKey = (id: string) => `dilemme-voted-${id}`;

  const fetchVotes = useCallback(async (dilemmeId: string) => {
    if (dilemmeId.startsWith("local-")) return;
    try {
      const { data } = await supabase.rpc("get_daily_dilemme_votes", { p_dilemme_id: dilemmeId });
      if (data && data.length > 0) {
        const row = data[0];
        setVoteResult({
          choiceAPct: row.choice_a_pct ?? 50,
          choiceBPct: row.choice_b_pct ?? 50,
          totalVotes: row.total_votes ?? 1,
        });
      }
    } catch { /* silent */ }
  }, []);

  // Background fetch — non-blocking, UI already has content
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    (async () => {
      try {
        const { data: existing } = await supabase
          .from("daily_dilemmes")
          .select("*")
          .eq("active_date", today)
          .maybeSingle();

        if (controller.signal.aborted) return;

        if (existing) {
          const d = existing as DailyDilemme;
          setDilemme(d);
          cacheDilemme(d);
          const voted = localStorage.getItem(getVoteKey(d.id));
          if (voted) {
            setHasVoted(true);
            fetchVotes(d.id);
          }
          return;
        }

        const { data, error } = await supabase.functions.invoke("generate-daily-dilemme");
        if (controller.signal.aborted) return;

        if (!error && data?.dilemme) {
          const d = data.dilemme as DailyDilemme;
          setDilemme(d);
          cacheDilemme(d);
          const voted = localStorage.getItem(getVoteKey(d.id));
          if (voted) {
            setHasVoted(true);
            fetchVotes(d.id);
          }
        }
      } catch {
        // Server unreachable — local dilemme already showing
      } finally {
        clearTimeout(timeoutId);
      }
    })();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [today, fetchVotes]);

  const vote = async (choice: "a" | "b") => {
    if (!dilemme || voting || hasVoted) return;
    setVoting(true);

    try {
      // Offline / local dilemme fallback
      if (dilemme.id.startsWith("local-")) {
        localStorage.setItem(getVoteKey(dilemme.id), choice);
        setHasVoted(true);
        const aPct = choice === "a"
          ? 52 + Math.floor(Math.random() * 13)
          : 35 + Math.floor(Math.random() * 13);
        setVoteResult({
          choiceAPct: aPct,
          choiceBPct: 100 - aPct,
          totalVotes: 50 + Math.floor(Math.random() * 200),
        });
        return;
      }

      // Server vote
      let fingerprint: string | null = null;
      try {
        const sid = sessionStorage.getItem("malaky-session-id") ?? crypto.randomUUID();
        fingerprint = sid;
      } catch { /* ignore */ }

      const { error } = await supabase.from("dilemme_votes").insert({
        card_text: dilemme.question,
        choice,
        dilemme_id: dilemme.id,
        voter_fingerprint: fingerprint,
      });

      if (error) {
        console.warn("[vote] Insert failed:", error.message);
      }

      localStorage.setItem(getVoteKey(dilemme.id), choice);
      setHasVoted(true);
      await fetchVotes(dilemme.id);
    } catch (e) {
      console.warn("[vote] Error:", e);
      // Still mark as voted locally to avoid stuck state
      localStorage.setItem(getVoteKey(dilemme.id), choice);
      setHasVoted(true);
    } finally {
      setVoting(false);
    }
  };

  return {
    dilemme,
    loading,
    voteResult,
    hasVoted,
    voting,
    vote,
    getTimeUntilNext: getMsUntilMadagascarMidnight,
  };
}
