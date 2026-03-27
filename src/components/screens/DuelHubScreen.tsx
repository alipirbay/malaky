import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuizDuelStore } from "@/store/quizDuelStore";
import { useGameStore } from "@/store/gameStore";
import { DIFFICULTIES } from "@/data/config";
import { ArrowLeft, Zap, Lock as LockIcon, Users, Copy, Share2, Loader2, Trophy, Clock, ChevronRight } from "lucide-react";
import { getNetworkStatus } from "@/lib/networkStatus";
import { formatTimeMs } from "@/lib/quizDuel";
import { toast } from "sonner";
import type { Difficulty } from "@/data/types";

const DuelHubScreen = () => {
  const setGameScreen = useGameStore((s) => s.setScreen);
  const players = useGameStore((s) => s.players);
  const store = useQuizDuelStore();
  const [joinCode, setJoinCode] = useState("");
  const isOnline = getNetworkStatus();

  // Set player name from game store
  useEffect(() => {
    if (players.length > 0 && !store.playerName) {
      store.setPlayerName(players[0].name);
    }
  }, [players, store]);

  useEffect(() => {
    if (store.screen === "hub") {
      store.loadRecentDuels();
    }
  }, [store.screen]);

  // Polling for waiting screen
  useEffect(() => {
    if (store.screen !== "waiting") return;
    const interval = setInterval(() => {
      store.pollForOpponent();
    }, 5000);
    return () => clearInterval(interval);
  }, [store.screen]);

  if (!isOnline) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 gradient-surface safe-top safe-bottom">
        <div className="text-center">
          <span className="text-5xl mb-4 block">📡</span>
          <h2 className="text-xl font-bold text-foreground mb-2">Connexion requise</h2>
          <p className="text-sm text-muted-foreground mb-6">Le Duel Culture G nécessite une connexion internet.</p>
          <button
            onClick={() => setGameScreen("mode")}
            className="rounded-2xl bg-card px-6 py-3 font-semibold text-foreground"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  // --- SUB-SCREENS ---

  if (store.screen === "difficulty") return <DifficultyPicker />;
  if (store.screen === "playing") return <DuelQuizPlaying />;
  if (store.screen === "waiting") return <DuelWaiting />;
  if (store.screen === "result") return <DuelResult />;
  if (store.screen === "join") return <DuelJoin />;

  // --- HUB ---
  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface safe-top safe-bottom">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setGameScreen("mode")} className="rounded-xl bg-card p-2.5 text-foreground" aria-label="Retour">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">⚔️ Duel Culture G</h2>
          <p className="text-sm text-muted-foreground">Défie un ami en quiz asynchrone</p>
        </div>
      </div>

      <div className="space-y-3 mb-8">
        <button
          onClick={() => { store.setScreen("difficulty"); }}
          className="w-full rounded-2xl gradient-primary p-5 text-left glow-primary transition-transform active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <Zap size={24} className="text-primary-foreground" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-primary-foreground">Match rapide</h3>
              <p className="text-sm text-primary-foreground/70">Trouve un adversaire automatiquement</p>
            </div>
            <ChevronRight size={20} className="text-primary-foreground/50" />
          </div>
        </button>

        <button
          onClick={() => {
            store.setScreen("difficulty");
          }}
          className="w-full rounded-2xl bg-card p-5 text-left transition-transform active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <LockIcon size={24} className="text-foreground" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground">Duel privé</h3>
              <p className="text-sm text-muted-foreground">Crée un duel et partage le code</p>
            </div>
            <ChevronRight size={20} className="text-muted-foreground/50" />
          </div>
        </button>

        <button
          onClick={() => store.setScreen("join")}
          className="w-full rounded-2xl bg-card p-5 text-left transition-transform active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <Users size={24} className="text-foreground" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground">Rejoindre avec un code</h3>
              <p className="text-sm text-muted-foreground">Entre le code d'un ami</p>
            </div>
            <ChevronRight size={20} className="text-muted-foreground/50" />
          </div>
        </button>
      </div>

      {/* Recent duels */}
      {store.recentDuels.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-muted-foreground mb-3">Récents</h3>
          <div className="space-y-2">
            {store.recentDuels.slice(0, 5).map((d) => (
              <div key={d.id} className="rounded-xl bg-card p-3 flex items-center gap-3">
                <span className="text-lg">{d.status === "completed" ? "✅" : "⏳"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {d.player1Name} vs {d.player2Name || "..."}
                  </p>
                  <p className="text-xs text-muted-foreground">{d.difficulty} • {d.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Difficulty Picker ---
const DifficultyPicker = () => {
  const store = useQuizDuelStore();
  const [matchType, setMatchType] = useState<"quick" | "private">("quick");

  const handleSelect = async (diff: Difficulty) => {
    store.setDifficulty(diff);
    if (matchType === "quick") {
      await store.createQuickMatch();
    } else {
      await store.createPrivateMatch();
    }
  };

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface safe-top safe-bottom">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => store.setScreen("hub")} className="rounded-xl bg-card p-2.5 text-foreground">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-foreground">Choisis la difficulté</h2>
      </div>

      {/* Match type toggle */}
      <div className="flex gap-2 mb-6">
        {(["quick", "private"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setMatchType(t)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
              matchType === t ? "gradient-primary text-primary-foreground" : "bg-card text-muted-foreground"
            }`}
          >
            {t === "quick" ? "⚡ Rapide" : "🔒 Privé"}
          </button>
        ))}
      </div>

      {store.isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">
              {matchType === "quick" ? "Recherche d'adversaire..." : "Création du duel..."}
            </p>
          </div>
        </div>
      )}

      {store.error && (
        <div className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{store.error}</div>
      )}

      <div className="flex-1 space-y-3">
        {DIFFICULTIES.map((d, i) => (
          <motion.button
            key={d.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => handleSelect(d.id)}
            disabled={store.isLoading}
            className="w-full rounded-2xl bg-card p-5 text-left transition-transform active:scale-[0.97] disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{d.emoji}</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">{d.name}</h3>
                <p className="text-sm text-muted-foreground">{d.description}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// --- Quiz Playing ---
const DuelQuizPlaying = () => {
  const store = useQuizDuelStore();
  const { questions, currentQuestionIndex, score } = store;
  const question = questions[currentQuestionIndex];
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Auto-advance after showing result
  useEffect(() => {
    if (!showResult) return;
    const timeout = setTimeout(() => {
      setShowResult(false);
      setSelectedOption(null);
      if (currentQuestionIndex >= questions.length) {
        store.finishDuel();
      }
    }, 800);
    return () => clearTimeout(timeout);
  }, [showResult, currentQuestionIndex, questions.length, store]);

  if (!question) {
    // All questions answered
    useEffect(() => { store.finishDuel(); }, []);
    return (
      <div className="flex min-h-screen items-center justify-center gradient-surface">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const handleAnswer = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    setShowResult(true);
    store.answerQuestion(idx);
  };

  const isCorrect = selectedOption !== null && question.options[selectedOption] === question.correctAnswer;
  const progress = ((currentQuestionIndex) / questions.length) * 100;

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface safe-top safe-bottom">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-muted-foreground">
            Question {currentQuestionIndex + 1}/{questions.length}
          </span>
          <span className="text-sm font-bold text-primary">{score} pts</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted">
          <motion.div
            className="h-1.5 rounded-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="flex-1 flex flex-col"
        >
          <div className="card-game mb-6 flex-1 flex items-center justify-center">
            <p className="text-xl font-bold text-foreground text-center leading-relaxed">
              {question.question}
            </p>
          </div>

          <div className="space-y-3">
            {question.options.map((opt, idx) => {
              let optionClass = "bg-card text-foreground";
              if (showResult && selectedOption === idx) {
                optionClass = isCorrect
                  ? "bg-green-500/20 text-green-400 border-green-500/50"
                  : "bg-destructive/20 text-destructive border-destructive/50";
              }
              if (showResult && opt === question.correctAnswer && selectedOption !== idx) {
                optionClass = "bg-green-500/10 text-green-400/70";
              }

              return (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleAnswer(idx)}
                  disabled={selectedOption !== null}
                  className={`w-full rounded-2xl border border-border p-4 text-left font-semibold transition-all ${optionClass} disabled:opacity-90`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {showResult && opt === question.correctAnswer && (
                      <span className="text-green-400">✓</span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// --- Waiting Screen ---
const DuelWaiting = () => {
  const store = useQuizDuelStore();
  const match = store.currentMatch;
  const hasPlayed = store.myAttempt !== null;
  const inviteCode = match?.inviteCode;

  const handleCopy = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      toast.success("Code copié !");
    }
  };

  const handleShare = () => {
    if (inviteCode && navigator.share) {
      navigator.share({
        title: "Duel Malaky",
        text: `Rejoins mon duel Culture G sur Malaky ! Code : ${inviteCode}`,
      }).catch(() => {});
    }
  };

  const handleStartPlaying = () => {
    if (!hasPlayed && match) {
      store.setScreen("playing");
      useQuizDuelStore.setState({
        currentQuestionIndex: 0,
        score: 0,
        startTimeMs: Date.now(),
        questions: store.questions.length > 0
          ? store.questions
          : (() => {
              const { generateDuelQuestions } = require("@/lib/quizDuel");
              return generateDuelQuestions(match.difficulty, match.seed);
            })(),
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 gradient-surface safe-top safe-bottom">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-sm w-full"
      >
        <div className="text-6xl mb-6">⏳</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {hasPlayed ? "En attente de l'adversaire" : "Duel créé !"}
        </h2>
        <p className="text-sm text-muted-foreground mb-8">
          {hasPlayed
            ? "Tu seras notifié quand ton adversaire aura joué."
            : "Partage le code ou joue ta manche."}
        </p>

        {inviteCode && (
          <div className="mb-6">
            <p className="text-xs text-muted-foreground mb-2">Code d'invitation</p>
            <div className="flex items-center justify-center gap-3">
              <span className="rounded-2xl bg-card px-8 py-4 text-3xl font-black tracking-[0.3em] text-primary">
                {inviteCode}
              </span>
            </div>
            <div className="flex items-center justify-center gap-3 mt-4">
              <button onClick={handleCopy} className="flex items-center gap-2 rounded-xl bg-card px-4 py-2.5 text-sm font-medium text-foreground">
                <Copy size={16} /> Copier
              </button>
              {navigator.share && (
                <button onClick={handleShare} className="flex items-center gap-2 rounded-xl bg-card px-4 py-2.5 text-sm font-medium text-foreground">
                  <Share2 size={16} /> Partager
                </button>
              )}
            </div>
          </div>
        )}

        {!hasPlayed && (
          <button
            onClick={handleStartPlaying}
            className="w-full rounded-2xl gradient-primary px-6 py-4 text-lg font-bold text-primary-foreground glow-primary transition-transform active:scale-95 mb-4"
          >
            Jouer ma manche
          </button>
        )}

        {hasPlayed && (
          <div className="mb-6">
            <div className="animate-pulse flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 size={16} className="animate-spin" />
              Vérification toutes les 5s...
            </div>
          </div>
        )}

        <button
          onClick={() => store.reset()}
          className="text-sm text-muted-foreground underline underline-offset-2"
        >
          Retour au hub
        </button>
      </motion.div>
    </div>
  );
};

// --- Result Screen ---
const DuelResult = () => {
  const store = useQuizDuelStore();
  const { myAttempt, opponentAttempt, duelResult } = store;

  if (!myAttempt || !opponentAttempt) return null;

  const resultConfig = {
    win: { emoji: "🏆", text: "Victoire !", color: "text-green-400" },
    lose: { emoji: "😔", text: "Défaite", color: "text-destructive" },
    draw: { emoji: "🤝", text: "Égalité", color: "text-accent" },
  };

  const config = resultConfig[duelResult || "draw"];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 gradient-surface safe-top safe-bottom">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="text-center max-w-sm w-full"
      >
        <div className="text-7xl mb-4">{config.emoji}</div>
        <h2 className={`text-3xl font-black mb-8 ${config.color}`}>{config.text}</h2>

        {/* Score comparison */}
        <div className="flex items-stretch gap-4 mb-8">
          <div className="flex-1 rounded-2xl bg-card p-5 text-center">
            <p className="text-sm text-muted-foreground mb-1">Toi</p>
            <p className="text-2xl font-black text-primary">{myAttempt.score}/10</p>
            <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
              <Clock size={12} />
              {formatTimeMs(myAttempt.timeMs)}
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-2xl font-black text-muted-foreground">VS</span>
          </div>
          <div className="flex-1 rounded-2xl bg-card p-5 text-center">
            <p className="text-sm text-muted-foreground mb-1">{opponentAttempt.playerName}</p>
            <p className="text-2xl font-black text-coral">{opponentAttempt.score}/10</p>
            <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
              <Clock size={12} />
              {formatTimeMs(opponentAttempt.timeMs)}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => store.reset()}
            className="w-full rounded-2xl gradient-primary px-6 py-4 text-lg font-bold text-primary-foreground glow-primary transition-transform active:scale-95"
          >
            Nouveau duel
          </button>
          <button
            onClick={() => {
              store.reset();
              useGameStore.getState().setScreen("home");
            }}
            className="w-full rounded-2xl bg-card px-6 py-3 font-semibold text-foreground"
          >
            Retour à l'accueil
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Join Screen ---
const DuelJoin = () => {
  const store = useQuizDuelStore();
  const [code, setCode] = useState("");

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface safe-top safe-bottom">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => store.setScreen("hub")} className="rounded-xl bg-card p-2.5 text-foreground">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-foreground">Rejoindre un duel</h2>
      </div>

      {store.error && (
        <div className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{store.error}</div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-sm text-muted-foreground mb-6">Entre le code d'invitation</p>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Ex: ABC123"
          maxLength={6}
          className="w-48 rounded-2xl bg-card px-6 py-4 text-center text-2xl font-black tracking-[0.3em] text-foreground placeholder:text-muted-foreground/30 border border-border focus:border-primary focus:outline-none mb-6"
        />
        <button
          onClick={() => store.joinWithCode(code)}
          disabled={code.length < 6 || store.isLoading}
          className="w-full max-w-xs rounded-2xl gradient-primary px-6 py-4 text-lg font-bold text-primary-foreground glow-primary disabled:opacity-30 transition-transform active:scale-95"
        >
          {store.isLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Rejoindre"}
        </button>
      </div>
    </div>
  );
};

export default DuelHubScreen;
