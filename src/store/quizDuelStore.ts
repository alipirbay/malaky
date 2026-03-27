import { create } from "zustand";
import type { Difficulty } from "@/data/types";
import { supabase } from "@/integrations/supabase/client";
import {
  generateDuelQuestions, generateInviteCode, getDeviceId,
  type DuelQuestion, type DuelAttempt, computeDuelResult, type DuelResult,
} from "@/lib/quizDuel";
import type { Json } from "@/integrations/supabase/types";
import type { Tables } from "@/integrations/supabase/types";

type DuelScreen = "hub" | "difficulty" | "matchmaking" | "playing" | "waiting" | "result" | "join";

type QuizDuelRow = Tables<"quiz_duel_matches">;

interface DuelMatch {
  id: string;
  inviteCode: string | null;
  difficulty: Difficulty;
  seed: string;
  isPublic: boolean;
  player1Name: string;
  player1DeviceId: string;
  player1Attempt: DuelAttempt | null;
  player2Name: string | null;
  player2DeviceId: string | null;
  player2Attempt: DuelAttempt | null;
  createdAt: string;
  status: "open" | "playing" | "completed" | "expired";
  expiresAt: string | null;
}

interface QuizDuelState {
  screen: DuelScreen;
  currentMatch: DuelMatch | null;
  questions: DuelQuestion[];
  currentQuestionIndex: number;
  score: number;
  startTimeMs: number;
  playerName: string;
  selectedDifficulty: Difficulty;
  isLoading: boolean;
  error: string | null;
  myAttempt: DuelAttempt | null;
  opponentAttempt: DuelAttempt | null;
  duelResult: DuelResult | null;
  recentDuels: DuelMatch[];
  matchType: "quick" | "private";

  setScreen: (s: DuelScreen) => void;
  setDifficulty: (d: Difficulty) => void;
  setPlayerName: (n: string) => void;
  setMatchType: (t: "quick" | "private") => void;
  createQuickMatch: () => Promise<void>;
  createPrivateMatch: () => Promise<void>;
  joinWithCode: (code: string) => Promise<void>;
  answerQuestion: (optionIndex: number) => void;
  finishDuel: () => Promise<void>;
  pollForOpponent: () => Promise<boolean>;
  loadRecentDuels: () => Promise<void>;
  reset: () => void;
}

function mapRowToMatch(row: QuizDuelRow): DuelMatch {
  return {
    id: row.id,
    inviteCode: row.invite_code ?? null,
    difficulty: row.difficulty as Difficulty,
    seed: row.seed,
    isPublic: row.is_public,
    player1Name: row.player1_name,
    player1DeviceId: row.player1_device_id,
    player1Attempt: row.player1_attempt as unknown as DuelAttempt | null,
    player2Name: row.player2_name ?? null,
    player2DeviceId: row.player2_device_id ?? null,
    player2Attempt: row.player2_attempt as unknown as DuelAttempt | null,
    createdAt: row.created_at,
    status: row.status as DuelMatch["status"],
    expiresAt: row.expires_at ?? null,
  };
}

/**
 * Extract questions from a DB row's stored questions JSON.
 * This is the SOURCE OF TRUTH — both players use DB-stored questions.
 */
function questionsFromRow(row: QuizDuelRow): DuelQuestion[] {
  const raw = row.questions as unknown;
  if (!Array.isArray(raw) || raw.length === 0) return [];
  // Validate shape
  const first = raw[0] as Record<string, unknown>;
  if (first && typeof first.question === "string" && Array.isArray(first.options)) {
    return raw as DuelQuestion[];
  }
  return [];
}

export const useQuizDuelStore = create<QuizDuelState>()((set, get) => ({
  screen: "hub",
  currentMatch: null,
  questions: [],
  currentQuestionIndex: 0,
  score: 0,
  startTimeMs: 0,
  playerName: "",
  selectedDifficulty: "facile",
  isLoading: false,
  error: null,
  myAttempt: null,
  opponentAttempt: null,
  duelResult: null,
  recentDuels: [],
  matchType: "quick",

  setScreen: (s) => set({ screen: s, error: null }),
  setDifficulty: (d) => set({ selectedDifficulty: d }),
  setPlayerName: (n) => set({ playerName: n }),
  setMatchType: (t) => set({ matchType: t }),

  createQuickMatch: async () => {
    const { selectedDifficulty, playerName } = get();
    if (!playerName.trim()) {
      set({ error: "Choisis un pseudo avant de lancer un duel.", screen: "hub" });
      return;
    }
    const deviceId = getDeviceId();
    set({ isLoading: true, error: null });

    try {
      await supabase.rpc("expire_old_duels");

      const { data: openMatch } = await supabase
        .from("quiz_duel_matches")
        .select("*")
        .eq("difficulty", selectedDifficulty)
        .eq("is_public", true)
        .eq("status", "open")
        .neq("player1_device_id", deviceId)
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      if (openMatch) {
        await joinExistingMatch(openMatch, playerName, deviceId, set);
      } else {
        await createNewMatch(true, selectedDifficulty, playerName, deviceId, set);
      }
    } catch {
      try {
        await createNewMatch(true, selectedDifficulty, playerName, deviceId, set);
      } catch {
        set({ error: "Erreur réseau. Réessaie.", isLoading: false, screen: "hub" });
      }
    }
  },

  createPrivateMatch: async () => {
    const { selectedDifficulty, playerName } = get();
    if (!playerName.trim()) {
      set({ error: "Choisis un pseudo avant de lancer un duel.", screen: "hub" });
      return;
    }
    const deviceId = getDeviceId();
    set({ isLoading: true, error: null });
    try {
      await createNewMatch(false, selectedDifficulty, playerName, deviceId, set);
    } catch {
      set({ error: "Erreur réseau. Réessaie.", isLoading: false, screen: "hub" });
    }
  },

  joinWithCode: async (code: string) => {
    const { playerName } = get();
    if (!playerName.trim()) {
      set({ error: "Choisis un pseudo avant de rejoindre.", isLoading: false });
      return;
    }
    const deviceId = getDeviceId();
    set({ isLoading: true, error: null });

    try {
      const { data: match, error } = await supabase
        .from("quiz_duel_matches")
        .select("*")
        .eq("invite_code", code.toUpperCase().trim())
        .eq("status", "open")
        .single();

      if (error || !match) {
        set({ error: "Code invalide ou duel expiré.", isLoading: false });
        return;
      }
      if (match.player1_device_id === deviceId) {
        set({ error: "Tu ne peux pas rejoindre ton propre duel.", isLoading: false });
        return;
      }
      if (match.expires_at && new Date(match.expires_at) < new Date()) {
        set({ error: "Ce duel a expiré.", isLoading: false });
        return;
      }
      await joinExistingMatch(match, playerName, deviceId, set);
    } catch {
      set({ error: "Erreur réseau. Réessaie.", isLoading: false });
    }
  },

  answerQuestion: (optionIndex: number) => {
    const { questions, currentQuestionIndex, score } = get();
    const q = questions[currentQuestionIndex];
    if (!q) return;
    const isCorrect = optionIndex >= 0 && q.options[optionIndex] === q.correctAnswer;
    set({
      score: isCorrect ? score + 1 : score,
      currentQuestionIndex: currentQuestionIndex + 1,
    });
  },

  finishDuel: async () => {
    const { currentMatch, score, startTimeMs, playerName, myAttempt: existingAttempt } = get();
    if (!currentMatch) return;
    // Prevent double submit
    if (existingAttempt) return;

    const deviceId = getDeviceId();
    const timeMs = Date.now() - startTimeMs;
    const attempt: DuelAttempt = { score, timeMs, playerName };

    set({ isLoading: true });

    const isPlayer1 = currentMatch.player1DeviceId === deviceId;
    const updateField = isPlayer1 ? "player1_attempt" : "player2_attempt";

    try {
      // Only update if this player's attempt is still null (prevent overwrite)
      const conditionField = isPlayer1 ? "player1_attempt" : "player2_attempt";
      const { data: updateResult } = await supabase
        .from("quiz_duel_matches")
        .update({
          [updateField]: attempt as unknown as Json,
          status: "playing",
        })
        .eq("id", currentMatch.id)
        .is(conditionField, null)
        .select()
        .single();

      if (!updateResult) {
        set({ error: "Résultat déjà soumis.", isLoading: false, screen: "hub" });
        return;
      }

      const { data: fresh } = await supabase
        .from("quiz_duel_matches")
        .select("*")
        .eq("id", currentMatch.id)
        .single();

      if (fresh) {
        const opponentAttempt = isPlayer1
          ? (fresh.player2_attempt as unknown as DuelAttempt | null)
          : (fresh.player1_attempt as unknown as DuelAttempt | null);

        if (opponentAttempt) {
          await supabase
            .from("quiz_duel_matches")
            .update({ status: "completed" })
            .eq("id", currentMatch.id);

          set({
            myAttempt: attempt,
            opponentAttempt,
            duelResult: computeDuelResult(attempt, opponentAttempt),
            screen: "result",
            isLoading: false,
          });
        } else {
          set({
            myAttempt: attempt,
            screen: "waiting",
            isLoading: false,
          });
        }
      }
    } catch {
      set({ error: "Erreur lors de la sauvegarde.", isLoading: false });
    }
  },

  pollForOpponent: async () => {
    const { currentMatch, myAttempt } = get();
    if (!currentMatch || !myAttempt) return false;
    const deviceId = getDeviceId();
    const isPlayer1 = currentMatch.player1DeviceId === deviceId;

    try {
      const { data: fresh } = await supabase
        .from("quiz_duel_matches")
        .select("*")
        .eq("id", currentMatch.id)
        .single();

      if (!fresh) return false;

      if (fresh.expires_at && new Date(fresh.expires_at) < new Date()) {
        set({ error: "Ce duel a expiré.", screen: "hub" });
        return false;
      }

      const opponentAttempt = isPlayer1
        ? (fresh.player2_attempt as unknown as DuelAttempt | null)
        : (fresh.player1_attempt as unknown as DuelAttempt | null);

      if (opponentAttempt) {
        await supabase
          .from("quiz_duel_matches")
          .update({ status: "completed" })
          .eq("id", currentMatch.id);

        set({
          opponentAttempt,
          duelResult: computeDuelResult(myAttempt, opponentAttempt),
          screen: "result",
        });
        return true;
      }
    } catch {
      // Silent fail for polling
    }
    return false;
  },

  loadRecentDuels: async () => {
    const deviceId = getDeviceId();
    try {
      await supabase.rpc("expire_old_duels");

      const { data } = await supabase
        .from("quiz_duel_matches")
        .select("*")
        .or(`player1_device_id.eq.${deviceId},player2_device_id.eq.${deviceId}`)
        .order("created_at", { ascending: false })
        .limit(10);

      if (data) {
        set({ recentDuels: data.map(mapRowToMatch) });
      }
    } catch {
      // Silent
    }
  },

  reset: () =>
    set({
      screen: "hub",
      currentMatch: null,
      questions: [],
      currentQuestionIndex: 0,
      score: 0,
      startTimeMs: 0,
      myAttempt: null,
      opponentAttempt: null,
      duelResult: null,
      error: null,
      isLoading: false,
    }),
}));

// --- Helpers ---

async function createNewMatch(
  isPublic: boolean,
  difficulty: Difficulty,
  playerName: string,
  deviceId: string,
  set: (partial: Partial<QuizDuelState>) => void
) {
  const seed = crypto.randomUUID();
  const inviteCode = isPublic ? null : generateInviteCode();
  const questions = generateDuelQuestions(difficulty, seed);

  const { data, error } = await supabase
    .from("quiz_duel_matches")
    .insert({
      seed,
      difficulty,
      is_public: isPublic,
      invite_code: inviteCode,
      player1_name: playerName,
      player1_device_id: deviceId,
      status: "open",
      questions: questions as unknown as Json,
    })
    .select()
    .single();

  if (error || !data) {
    set({ error: "Impossible de créer le duel.", isLoading: false, screen: "hub" });
    return;
  }

  const match = mapRowToMatch(data);

  if (isPublic) {
    set({
      currentMatch: match,
      questions,
      currentQuestionIndex: 0,
      score: 0,
      startTimeMs: Date.now(),
      screen: "playing",
      isLoading: false,
    });
  } else {
    set({
      currentMatch: match,
      questions,
      screen: "waiting",
      isLoading: false,
    });
  }
}

async function joinExistingMatch(
  matchRow: QuizDuelRow,
  playerName: string,
  deviceId: string,
  set: (partial: Partial<QuizDuelState>) => void
) {
  const matchId = matchRow.id;

  // Check for double join
  if (matchRow.player2_device_id) {
    set({ error: "Ce duel a déjà un adversaire.", isLoading: false, screen: "hub" });
    return;
  }

  // Atomic join: only succeeds if status is still "open"
  const { data: updatedRow, error: updateError } = await supabase
    .from("quiz_duel_matches")
    .update({
      player2_name: playerName,
      player2_device_id: deviceId,
      status: "playing",
    })
    .eq("id", matchId)
    .eq("status", "open")
    .is("player2_device_id", null)
    .select()
    .single();

  if (updateError || !updatedRow) {
    set({ error: "Ce duel n'est plus disponible.", isLoading: false, screen: "hub" });
    return;
  }

  // SOURCE OF TRUTH: use questions from DB, not regenerated from seed
  const questions = questionsFromRow(updatedRow);
  if (questions.length === 0) {
    // Fallback: regenerate from seed (shouldn't happen normally)
    const fallbackQuestions = generateDuelQuestions(
      updatedRow.difficulty as Difficulty,
      updatedRow.seed,
    );
    set({
      currentMatch: mapRowToMatch(updatedRow),
      questions: fallbackQuestions,
      currentQuestionIndex: 0,
      score: 0,
      startTimeMs: Date.now(),
      screen: "playing",
      isLoading: false,
    });
    return;
  }

  set({
    currentMatch: mapRowToMatch(updatedRow),
    questions,
    currentQuestionIndex: 0,
    score: 0,
    startTimeMs: Date.now(),
    screen: "playing",
    isLoading: false,
  });
}
