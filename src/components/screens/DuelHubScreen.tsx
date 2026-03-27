import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuizDuelStore } from "@/store/quizDuelStore";
import { useGameStore } from "@/store/gameStore";
import { DIFFICULTIES } from "@/data/config";
import { ArrowLeft, Zap, Lock as LockIcon, Users, Copy, Share2, Loader2, Clock, ChevronRight, X } from "lucide-react";
import { getNetworkStatus } from "@/lib/networkStatus";
import { formatTimeMs } from "@/lib/quizDuel";
import { toast } from "sonner";
import type { Difficulty } from "@/data/types";

const DuelHubScreen = () => {
  const setGameScreen = useGameStore((s) => s.setScreen);
  const players = useGameStore((s) => s.players);
  const store = useQuizDuelStore();
  const isOnline = getNetworkStatus();

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

  useEffect(() => {
    if (store.screen !== "waiting") return;
    const interval = setInterval(() => { store.pollForOpponent(); }, 5000);
    return () => clearInterval(interval);
  }, [store.screen]);

  if (!isOnline) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 gradient-surface safe-top safe-bottom">
        <div className="text-center">
          <span className="text-5xl mb-4 block">📡</span>
          <h2 className="text-xl font-bold text-foreground mb-2">Connexion requise</h2>
          <p className="text-sm text-muted-foreground mb-6">Le Duel Culture G nécessite une connexion internet.</p>
          <button onClick={() => setGameScreen("mode")} className="rounded-2xl bg-card px-6 py-3 font-semibold text-foreground">Retour</button>
        </div>
      </div>
    );
  }

  if (store.screen === "difficulty") return <DifficultyPicker />;
  if (store.screen === "matchmaking") return <MatchmakingScreen />;
  if (store.screen === "playing") return <DuelQuizPlaying />;
  if (store.screen === "waiting") return <DuelWaiting />;
  if (store.screen === "result") return <DuelResultView />;
  if (store.screen === "join") return <DuelJoin />;

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
          onClick={() => { store.setMatchType("quick"); store.setScreen("difficulty"); }}
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
          onClick={() => { store.setMatchType("private"); store.setScreen("difficulty"); }}
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
                  <p className="text-xs text-muted-foreground">{d.difficulty} • {d.status === "completed" ? "terminé" : d.status === "open" ? "en attente" : "en cours"}</p>
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

  const handleSelect = (diff: Difficulty) => {
    store.setDifficulty(diff);
    store.setScreen("matchmaking");
    if (store.matchType === "quick") {
      store.createQuickMatch();
    } else {
      store.createPrivateMatch();
    }
  };

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface safe-top safe-bottom">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => store.setScreen("hub")} className="rounded-xl bg-card p-2.5 text-foreground">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">Choisis la difficulté</h2>
          <p className="text-sm text-muted-foreground">
            {store.matchType === "quick" ? "⚡ Match rapide" : "🔒 Duel privé"}
          </p>
        </div>
      </div>

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
            className="w-full rounded-2xl bg-card p-5 text-left transition-transform active:scale-[0.97]"
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

// --- Matchmaking Animation Screen ---
const FAKE_NAMES = ["Rivo", "Haja", "Fara", "Nomena", "Tiana", "Lova", "Ando", "Nirina", "Toky", "Vahatra", "Mamy", "Soa", "Harena", "Zo", "Dina"];

const MatchmakingScreen = () => {
  const store = useQuizDuelStore();
  const setGameScreen = useGameStore((s) => s.setScreen);
  const [displayName, setDisplayName] = useState(FAKE_NAMES[0]);
  const [dotCount, setDotCount] = useState(1);
  const nameIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let idx = 0;
    nameIntervalRef.current = setInterval(() => {
      idx = (idx + 1) % FAKE_NAMES.length;
      setDisplayName(FAKE_NAMES[idx]);
    }, 600);
    return () => { if (nameIntervalRef.current) clearInterval(nameIntervalRef.current); };
  }, []);

  useEffect(() => {
    const int = setInterval(() => setDotCount(d => (d % 3) + 1), 500);
    return () => clearInterval(int);
  }, []);

  useEffect(() => {
    if (store.screen !== "matchmaking") return;
  }, [store.screen]);

  if (store.screen !== "matchmaking") return null;

  const handleCancel = () => {
    store.reset();
    setGameScreen("mode");
  };

  const isQuickMatch = store.matchType === "quick";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 gradient-surface safe-top safe-bottom">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-sm w-full"
      >
        <div className="relative mx-auto mb-8 h-32 w-32">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-primary/30"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-4 border-primary/50"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          />
          <div className="absolute inset-4 flex items-center justify-center rounded-full bg-card">
            <span className="text-4xl">⚔️</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-2">
          {isQuickMatch ? "Recherche d'adversaire" : "Création du duel"}
          {".".repeat(dotCount)}
        </h2>

        {isQuickMatch && (
          <motion.div
            key={displayName}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6"
          >
            <p className="text-lg font-semibold text-primary">{displayName}</p>
            <p className="text-xs text-muted-foreground">Adversaire potentiel</p>
          </motion.div>
        )}

        {store.error && (
          <div className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{store.error}</div>
        )}

        <Loader2 className="animate-spin text-primary mx-auto mb-6" size={28} />

        <button
          onClick={handleCancel}
          className="flex items-center gap-2 mx-auto rounded-xl bg-card px-5 py-2.5 text-sm font-medium text-muted-foreground transition-transform active:scale-95"
        >
          <X size={16} /> Annuler
        </button>
      </motion.div>
    </div>
  );
};

// --- Quiz Playing (rich feedback) ---
const DuelQuizPlaying = () => {
  const store = useQuizDuelStore();
  const setGameScreen = useGameStore((s) => s.setScreen);
  const { questions, currentQuestionIndex, score } = store;
  const question = questions[currentQuestionIndex];
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [questionTimer, setQuestionTimer] = useState(15);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Timer per question
  useEffect(() => {
    if (showFeedback) return;
    setQuestionTimer(15);
    timerRef.current = setInterval(() => {
      setQuestionTimer(prev => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, showFeedback]);

  const handleTimeUp = useCallback(() => {
    if (selectedOption !== null) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedOption(-1);
    setShowFeedback(true);
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    feedbackTimeoutRef.current = setTimeout(() => {
      store.answerQuestion(-1);
      setShowFeedback(false);
      setSelectedOption(null);
    }, 2000);
  }, [selectedOption, store]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, []);

  // Finish duel when all questions answered
  useEffect(() => {
    if (currentQuestionIndex >= questions.length && questions.length > 0) {
      store.finishDuel();
    }
  }, [currentQuestionIndex, questions.length, store]);

  if (!question) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-surface">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const handleAnswer = (idx: number) => {
    if (selectedOption !== null) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedOption(idx);
    setShowFeedback(true);

    const isCorrect = question.options[idx] === question.correctAnswer;
    if (navigator.vibrate) {
      navigator.vibrate(isCorrect ? [50] : [100, 50, 100]);
    }

    feedbackTimeoutRef.current = setTimeout(() => {
      store.answerQuestion(idx);
      setShowFeedback(false);
      setSelectedOption(null);
    }, 2000);
  };

  const handleQuit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    store.reset();
    setGameScreen("mode");
  };

  const isCorrect = selectedOption !== null && selectedOption >= 0 && question.options[selectedOption] === question.correctAnswer;
  const progress = (currentQuestionIndex / questions.length) * 100;

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface safe-top safe-bottom">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowQuitConfirm(true)} className="rounded-lg bg-card p-2 text-muted-foreground" aria-label="Quitter">
              <ArrowLeft size={16} />
            </button>
            <span className="text-sm font-bold text-muted-foreground">
              Question {currentQuestionIndex + 1}/{questions.length}
            </span>
          </div>
          <span className="text-sm font-bold text-primary">{score} pts</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted">
          <motion.div className="h-1.5 rounded-full bg-primary" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
        </div>
      </div>

      {/* Timer countdown bar */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className={`h-2 rounded-full ${questionTimer <= 5 ? "bg-destructive" : "bg-primary"}`}
            animate={{ width: `${(questionTimer / 15) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className={`text-sm font-bold min-w-[2rem] text-right ${questionTimer <= 5 ? "text-destructive animate-pulse" : "text-muted-foreground"}`}>
          {questionTimer}s
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="flex-1 flex flex-col"
        >
          {/* Question card */}
          <div className="card-game mb-6 flex-1 flex items-center justify-center min-h-[180px]">
            <p className="text-xl font-bold text-foreground text-center leading-relaxed px-2">{question.question}</p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((opt, idx) => {
              const isThisOption = selectedOption === idx;
              const isCorrectAnswer = opt === question.correctAnswer;

              let optionClass = "bg-card text-foreground border-border";
              let iconSlot: React.ReactNode = null;

              if (showFeedback) {
                if (isCorrectAnswer) {
                  optionClass = "bg-green-500/20 text-green-400 border-green-500/50 scale-[1.02]";
                  iconSlot = <span className="text-green-400 font-bold text-lg">✓</span>;
                } else if (isThisOption && !isCorrectAnswer) {
                  optionClass = "bg-destructive/20 text-destructive border-destructive/50";
                  iconSlot = <span className="text-destructive font-bold text-lg">✗</span>;
                } else {
                  optionClass = "bg-card/50 text-muted-foreground/50 border-border/50";
                }
              }

              return (
                <motion.button
                  key={idx}
                  whileTap={!showFeedback ? { scale: 0.97 } : undefined}
                  onClick={() => handleAnswer(idx)}
                  disabled={selectedOption !== null}
                  className={`w-full rounded-2xl border p-4 text-left font-semibold transition-all duration-300 ${optionClass} disabled:cursor-default`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                      showFeedback && isCorrectAnswer ? "bg-green-500/30 text-green-400" :
                      showFeedback && isThisOption && !isCorrectAnswer ? "bg-destructive/30 text-destructive" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {iconSlot}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Emoji overlay */}
          <AnimatePresence>
            {showFeedback && selectedOption !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
              >
                <span className="text-8xl drop-shadow-2xl">
                  {selectedOption < 0 ? "⏰" : isCorrect ? "✅" : "❌"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Score popup +1 */}
          <AnimatePresence>
            {showFeedback && isCorrect && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: -20 }}
                exit={{ opacity: 0 }}
                className="fixed top-24 right-8 z-40 pointer-events-none"
              >
                <span className="text-2xl font-black text-primary">+1</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Quit confirmation */}
      <AnimatePresence>
        {showQuitConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-6 backdrop-blur-sm"
            onClick={() => setShowQuitConfirm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl bg-card p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-foreground">Quitter le duel ?</h3>
              <p className="mt-1 text-sm text-muted-foreground">Ta progression sera perdue.</p>
              <div className="mt-5 space-y-3">
                <button onClick={() => setShowQuitConfirm(false)}
                  className="gradient-primary w-full rounded-2xl px-4 py-3 font-semibold text-primary-foreground">Continuer</button>
                <button onClick={handleQuit}
                  className="w-full rounded-2xl bg-card px-4 py-3 font-semibold text-destructive">Quitter</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Waiting Screen ---
const DuelWaiting = () => {
  const store = useQuizDuelStore();
  const setGameScreen = useGameStore((s) => s.setScreen);
  const match = store.currentMatch;
  const hasPlayed = store.myAttempt !== null;
  const inviteCode = match?.inviteCode;

  const handleCopy = useCallback(() => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      toast.success("Code copié !");
    }
  }, [inviteCode]);

  const handleShare = useCallback(() => {
    if (inviteCode && navigator.share) {
      navigator.share({ title: "Duel Malaky", text: `Rejoins mon duel Culture G sur Malaky ! Code : ${inviteCode}` }).catch(() => {});
    }
  }, [inviteCode]);

  const handleStartPlaying = useCallback(async () => {
    if (!hasPlayed && match) {
      let questions = store.questions;
      if (questions.length === 0) {
        const { generateDuelQuestions } = await import("@/lib/quizDuel");
        questions = generateDuelQuestions(match.difficulty, match.seed);
      }
      useQuizDuelStore.setState({
        currentQuestionIndex: 0,
        score: 0,
        startTimeMs: Date.now(),
        questions,
        screen: "playing",
      });
    }
  }, [hasPlayed, match, store.questions]);

  const handleBack = useCallback(() => {
    store.reset();
    setGameScreen("mode");
  }, [store, setGameScreen]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 gradient-surface safe-top safe-bottom">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm w-full">
        <div className="text-6xl mb-6">⏳</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {hasPlayed ? "En attente de l'adversaire" : "Duel créé !"}
        </h2>
        <p className="text-sm text-muted-foreground mb-8">
          {hasPlayed ? "Tu seras notifié quand ton adversaire aura joué." : "Partage le code ou joue ta manche."}
        </p>

        {inviteCode && (
          <div className="mb-6">
            <p className="text-xs text-muted-foreground mb-2">Code d'invitation</p>
            <div className="flex items-center justify-center gap-3">
              <span className="rounded-2xl bg-card px-8 py-4 text-3xl font-black tracking-[0.3em] text-primary">{inviteCode}</span>
            </div>
            <div className="flex items-center justify-center gap-3 mt-4">
              <button onClick={handleCopy} className="flex items-center gap-2 rounded-xl bg-card px-4 py-2.5 text-sm font-medium text-foreground">
                <Copy size={16} /> Copier
              </button>
              {typeof navigator !== "undefined" && "share" in navigator && (
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
          <div className="mb-6 flex items-center justify-center gap-2 text-sm text-muted-foreground animate-pulse">
            <Loader2 size={16} className="animate-spin" />
            Vérification toutes les 5s...
          </div>
        )}

        <button onClick={handleBack} className="flex items-center gap-2 mx-auto text-sm text-muted-foreground underline underline-offset-2">
          <ArrowLeft size={14} /> Retour
        </button>
      </motion.div>
    </div>
  );
};

// --- Result Screen ---
const DuelResultView = () => {
  const store = useQuizDuelStore();
  const setGameScreen = useGameStore((s) => s.setScreen);
  const { myAttempt, opponentAttempt, duelResult, questions } = store;

  if (!myAttempt || !opponentAttempt) return null;

  const totalQ = questions.length || 10;
  const resultConfig = {
    win: { emoji: "🏆", text: "Victoire !", color: "text-primary" },
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

        <div className="flex items-stretch gap-4 mb-6">
          <div className="flex-1 rounded-2xl bg-card p-5 text-center">
            <p className="text-sm text-muted-foreground mb-1">Toi</p>
            <p className="text-2xl font-black text-primary">{myAttempt.score}/{totalQ}</p>
            <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
              <Clock size={12} />{formatTimeMs(myAttempt.timeMs)}
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-2xl font-black text-muted-foreground">VS</span>
          </div>
          <div className="flex-1 rounded-2xl bg-card p-5 text-center">
            <p className="text-sm text-muted-foreground mb-1">{opponentAttempt.playerName}</p>
            <p className="text-2xl font-black text-coral">{opponentAttempt.score}/{totalQ}</p>
            <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
              <Clock size={12} />{formatTimeMs(opponentAttempt.timeMs)}
            </div>
          </div>
        </div>

        {/* Score progress bars */}
        <div className="rounded-2xl bg-card p-4 mb-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Toi</span>
                <span>{myAttempt.score}/{totalQ}</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${(myAttempt.score / totalQ) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{opponentAttempt.playerName}</span>
                <span>{opponentAttempt.score}/{totalQ}</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-destructive"
                  initial={{ width: 0 }}
                  animate={{ width: `${(opponentAttempt.score / totalQ) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Time comparison */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-2xl bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">Ton temps</p>
            <p className="text-lg font-bold text-foreground">{formatTimeMs(myAttempt.timeMs)}</p>
          </div>
          <div className="rounded-2xl bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">Temps adverse</p>
            <p className="text-lg font-bold text-foreground">{formatTimeMs(opponentAttempt.timeMs)}</p>
          </div>
        </div>

        <div className="space-y-3">
          <button onClick={() => store.reset()} className="w-full rounded-2xl gradient-primary px-6 py-4 text-lg font-bold text-primary-foreground glow-primary transition-transform active:scale-95">
            Nouveau duel
          </button>
          <button
            onClick={() => { store.reset(); setGameScreen("home"); }}
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

  const handleBack = () => {
    store.setScreen("hub");
  };

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface safe-top safe-bottom">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={handleBack} className="rounded-xl bg-card p-2.5 text-foreground">
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
          placeholder="ABC123"
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
