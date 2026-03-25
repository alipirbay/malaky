import { useState, useCallback, useEffect, useRef, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { GAME_MODES } from "@/data/config";
import { fillCardTemplate } from "@/lib/cardUtils";
import { ArrowLeft, Pause, Volume2, VolumeX, ChevronRight, Play, RotateCcw, X, SkipForward, Flag } from "lucide-react";
import { useSounds } from "@/hooks/useSounds";
import { reportCard } from "@/hooks/useCardReport";
import { toast } from "sonner";

const CARD_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  truth: { label: "Vérité", color: "217 91% 60%" },
  dare: { label: "Action", color: "350 96% 72%" },
  group: { label: "Groupe", color: "38 92% 50%" },
  duel: { label: "Duel", color: "280 65% 60%" },
  vote: { label: "Vote", color: "142 71% 45%" },
  timer: { label: "Chrono", color: "25 95% 53%" },
  quiz: { label: "Quiz", color: "262 83% 58%" },
};

function extractDuration(text: string): number {
  const minuteMatch = text.match(/(\d+)\s*(?:minute|minutes)/i);
  if (minuteMatch) return parseInt(minuteMatch[1], 10) * 60;
  if (/une?\s+minute/i.test(text)) return 60;

  const secondMatch = text.match(/(\d+)\s*(?:s|sec|secondes?)/i);
  if (secondMatch) return parseInt(secondMatch[1], 10);

  return 15;
}

// --- Memoized sub-components to reduce rerenders ---

interface CardTextDisplayProps {
  cardText: string;
  cardMeta: { label: string; color: string };
  card: { text: string; card_type: string; answer?: string };
  reported: boolean;
  onReport: () => void;
  showAnswer: boolean;
  onRevealAnswer: () => void;
  selectedMode: string | null;
}

const CardTextDisplay = memo(function CardTextDisplay({
  cardText, cardMeta, card, reported, onReport, showAnswer, onRevealAnswer, selectedMode,
}: CardTextDisplayProps) {
  const isQuizCard = card.card_type === "quiz";
  return (
    <div className="card-game relative flex min-h-[340px] flex-col items-center justify-center overflow-hidden text-center">
      <span
        className="absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold"
        style={{ backgroundColor: `hsl(${cardMeta.color} / 0.15)`, color: `hsl(${cardMeta.color})` }}
      >
        {cardMeta.label}
      </span>

      <p className="mt-4 px-2 text-xl font-bold leading-relaxed text-foreground">{cardText}</p>

      {!reported ? (
        <button
          onClick={onReport}
          className="absolute bottom-3 right-3 rounded-lg p-1.5 text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
          aria-label="Signaler cette carte"
        >
          <Flag size={12} />
        </button>
      ) : (
        <span className="absolute bottom-3 right-3 text-[10px] text-muted-foreground/40">✓ signalé</span>
      )}

      {isQuizCard && (
        <div className="mt-4 w-full px-4">
          {showAnswer ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-primary/10 p-4 text-center"
            >
              <p className="text-sm font-medium text-muted-foreground mb-1">Réponse</p>
              <p className="text-lg font-bold text-primary">{card.answer}</p>
            </motion.div>
          ) : (
            <button
              onClick={onRevealAnswer}
              className="w-full rounded-xl bg-primary/10 px-4 py-3 text-sm font-bold text-primary transition-transform active:scale-95"
            >
              👁️ Révéler la réponse
            </button>
          )}
        </div>
      )}
    </div>
  );
});

interface TimerDisplayProps {
  timeLeft: number;
  totalDuration: number;
  timerDone: boolean;
  timerRunning: boolean;
  isTimerCard: boolean;
  isAutoTimer: boolean;
  onStart: () => void;
  onReset: () => void;
}

const TimerDisplay = memo(function TimerDisplay({
  timeLeft, totalDuration, timerDone, timerRunning, isTimerCard, isAutoTimer, onStart, onReset,
}: TimerDisplayProps) {
  const timerProgress = totalDuration > 0 ? timeLeft / totalDuration : 0;
  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="42" fill="none" stroke="hsl(var(--muted) / 0.3)" strokeWidth="6" />
          <circle
            cx="48" cy="48" r="42" fill="none"
            stroke={timerDone ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
            strokeWidth="6" strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 42}
            strokeDashoffset={2 * Math.PI * 42 * (1 - timerProgress)}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <span className={`text-2xl font-black ${timerDone ? "text-destructive" : "text-foreground"}`}>
          {timeLeft}s
        </span>
      </div>

      <div className="flex items-center gap-2">
        {isTimerCard && !timerRunning && !timerDone && (
          <button
            onClick={onStart}
            className="gradient-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-primary-foreground transition-transform active:scale-95"
          >
            <Play size={16} /> GO
          </button>
        )}
        {timerRunning && (
          <span className="animate-pulse text-sm font-bold text-primary">
            ⏱️ {isAutoTimer ? "Réponds vite !" : "Chrono en cours..."}
          </span>
        )}
        {timerDone && (
          <div className="flex items-center gap-2">
            <motion.span
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-sm font-bold text-destructive"
            >
              Temps écoulé
            </motion.span>
            <button
              onClick={onReset}
              className="rounded-lg bg-secondary p-2 text-muted-foreground transition-transform active:scale-95"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

// --- Main component ---

const GameScreen = () => {
  // Targeted selectors to avoid unnecessary rerenders
  const players = useGameStore((s) => s.players);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const currentCardIndex = useGameStore((s) => s.currentCardIndex);
  const deck = useGameStore((s) => s.deck);
  const selectedMode = useGameStore((s) => s.selectedMode);
  const selectedVibe = useGameStore((s) => s.selectedVibe);
  const nextCard = useGameStore((s) => s.nextCard);
  const setScreen = useGameStore((s) => s.setScreen);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const passesRemaining = useGameStore((s) => s.passesRemaining);
  const stats = useGameStore((s) => s.stats);
  const quickChallengeDuration = useGameStore((s) => s.quickChallengeDuration);

  const { playClick, playBuzzer, playWhoosh, startTickLoop, stopTickLoop, vibrate } = useSounds();

  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState(1);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [reported, setReported] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentPlayer = players[currentPlayerIndex];
  const card = deck[currentCardIndex];

  const mode = useMemo(
    () => GAME_MODES.find((item) => item.id === selectedMode),
    [selectedMode]
  );

  // Stable card text: deterministic player2 via cardIndex
  const cardText = useMemo(() => {
    if (!card || !currentPlayer) return "";
    return fillCardTemplate(card.text, currentPlayer.name, players.map((p) => p.name), currentCardIndex);
  }, [card, currentPlayer, players, currentCardIndex]);

  const isQuizCard = card?.card_type === "quiz";
  const isTimerCard = card?.card_type === "timer";
  const isQuickChallengeMode = selectedMode === "quick_challenge";
  const isAutoTimer = isQuickChallengeMode && !isTimerCard && card != null;
  const AUTO_DURATION = isAutoTimer ? quickChallengeDuration : 15;
  const totalDuration = isTimerCard ? extractDuration(cardText) : AUTO_DURATION;
  const showTimer = isTimerCard || isAutoTimer;
  const cardMeta = card
    ? CARD_TYPE_LABELS[card.card_type] || { label: card.card_type, color: "210 40% 98%" }
    : { label: "", color: "210 40% 98%" };
  const isCultureG = selectedMode === "culture_generale";
  const progressPct = deck.length > 0 ? ((currentCardIndex + 1) / deck.length) * 100 : 0;

  useEffect(() => {
    setTimerRunning(false);
    setTimerDone(false);
    setTimeLeft(totalDuration);
    setShowAnswer(false);
    setReported(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isAutoTimer) {
      setTimerRunning(true);
    }
  }, [currentCardIndex, totalDuration, isAutoTimer]);

  useEffect(() => {
    if (!timerRunning) {
      stopTickLoop();
      return;
    }

    startTickLoop(1000);

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          setTimerDone(true);
          stopTickLoop();
          playBuzzer();
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      stopTickLoop();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerRunning, startTickLoop, stopTickLoop, playBuzzer]);

  const startTimer = useCallback(() => {
    setTimeLeft(totalDuration);
    setTimerDone(false);
    setTimerRunning(true);
    playClick();
  }, [totalDuration, playClick]);

  const resetTimer = useCallback(() => {
    setTimerRunning(false);
    setTimerDone(false);
    setTimeLeft(totalDuration);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [totalDuration]);

  const handleNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection(1);
    playWhoosh();
    vibrate(30);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    stopTickLoop();

    setTimeout(() => {
      nextCard("done");
      setIsAnimating(false);
    }, 350);
  }, [isAnimating, nextCard, playWhoosh, vibrate, stopTickLoop]);

  const handleQuizAnswer = useCallback((wasCorrect: boolean) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection(1);
    playWhoosh();
    vibrate(wasCorrect ? 30 : 20);

    setTimeout(() => {
      nextCard("done", wasCorrect);
      setIsAnimating(false);
    }, 350);
  }, [isAnimating, nextCard, playWhoosh, vibrate]);

  const handleAction = useCallback((action: "refuse" | "skip") => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection(1);
    vibrate(20);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    stopTickLoop();

    setTimeout(() => {
      nextCard(action);
      setIsAnimating(false);
    }, 350);
  }, [isAnimating, nextCard, vibrate, stopTickLoop]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 80 && diff > 0) {
      if (isQuizCard && !showAnswer) {
        setTouchStart(null);
        return;
      }
      handleNext();
    }
    setTouchStart(null);
  };

  const handleReport = useCallback(async () => {
    if (!card) return;
    const ok = await reportCard(card.text, selectedMode, selectedVibe ?? null);
    if (ok) {
      setReported(true);
      toast("Signalement envoyé. Merci ! 🙏", { duration: 2000 });
    }
  }, [card, selectedMode, selectedVibe]);

  const currentPasses = passesRemaining[currentPlayer?.name] ?? 0;

  if (!card || !currentPlayer) {
    return (
      <div className="gradient-surface flex min-h-screen items-center justify-center safe-top safe-bottom">
        <div className="text-center space-y-4">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-lg font-medium text-muted-foreground">Chargement des cartes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-surface flex min-h-screen flex-col safe-top">
      <div className="flex items-center justify-between px-6 pb-2 pt-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowPauseMenu(true)} className="rounded-lg bg-card p-2 text-muted-foreground" aria-label="Mettre en pause">
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
              style={{ backgroundColor: `hsl(${currentPlayer.color} / 0.2)`, color: `hsl(${currentPlayer.color})` }}
            >
              {currentPlayer.name[0].toUpperCase()}
            </div>
            <span className="font-bold text-foreground">{currentPlayer.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCultureG && (
            <span className="text-xs font-bold text-accent">{stats.quizScore ?? 0} pts</span>
          )}
          <span className="text-xs text-muted-foreground">
            {currentCardIndex + 1}/{deck.length}
          </span>
          <button onClick={toggleSound} className="rounded-lg bg-card p-2 text-muted-foreground" aria-label={soundEnabled ? "Couper le son" : "Activer le son"}>
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button onClick={() => setShowPauseMenu(true)} className="rounded-lg bg-card p-2 text-muted-foreground" aria-label="Menu pause">
            <Pause size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 px-6 pb-2">
        <span className="text-sm text-muted-foreground">
          {mode?.emoji} {mode?.name}
        </span>
      </div>

      {/* Progress bar */}
      <div className="px-6 pb-4">
        <div className="h-1 w-full rounded-full bg-muted">
          <div
            className="h-1 rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentCardIndex}
            custom={direction}
            initial={{ opacity: 0, y: 60, scale: 0.92, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: -40, scale: 0.95, filter: "blur(4px)" }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-sm"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <CardTextDisplay
              cardText={cardText}
              cardMeta={cardMeta}
              card={card}
              reported={reported}
              onReport={handleReport}
              showAnswer={showAnswer}
              onRevealAnswer={() => setShowAnswer(true)}
              selectedMode={selectedMode}
            />

            {showTimer && (
              <TimerDisplay
                timeLeft={timeLeft}
                totalDuration={totalDuration}
                timerDone={timerDone}
                timerRunning={timerRunning}
                isTimerCard={isTimerCard}
                isAutoTimer={isAutoTimer}
                onStart={startTimer}
                onReset={resetTimer}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-6 pb-8 pt-4 space-y-3">
        {isQuizCard && showAnswer ? (
          <div className="flex gap-3">
            <button
              onClick={() => handleQuizAnswer(false)}
              disabled={isAnimating}
              className="flex-1 rounded-2xl bg-destructive/10 py-4 text-sm font-bold text-destructive transition-transform active:scale-95 disabled:opacity-50"
            >
              ✗ Faux
            </button>
            <button
              onClick={() => handleQuizAnswer(true)}
              disabled={isAnimating}
              className="flex-1 rounded-2xl bg-primary/20 py-4 text-sm font-bold text-primary transition-transform active:scale-95 disabled:opacity-50"
            >
              ✓ Correct
            </button>
          </div>
        ) : isQuizCard && !showAnswer ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Révèle la réponse d'abord</p>
          </div>
        ) : (
          <>
            <div className="flex gap-3">
              <button
                onClick={() => handleAction("refuse")}
                disabled={isAnimating}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-destructive/10 py-3 text-sm font-bold text-destructive transition-transform active:scale-95 disabled:opacity-50"
              >
                <X size={16} /> Refuser
              </button>
              {currentPasses > 0 && (
                <button
                  onClick={() => handleAction("skip")}
                  disabled={isAnimating}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-secondary py-3 text-sm font-bold text-muted-foreground transition-transform active:scale-95 disabled:opacity-50"
                >
                  <SkipForward size={16} /> Passer ({currentPasses})
                </button>
              )}
            </div>
            <button
              onClick={handleNext}
              disabled={isAnimating}
              className="gradient-primary flex w-full items-center justify-center gap-2 rounded-2xl py-5 text-base font-bold text-primary-foreground transition-transform active:scale-95 disabled:opacity-50"
            >
              SUIVANT <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      <AnimatePresence>
        {showPauseMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-6 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="w-full max-w-sm rounded-3xl bg-card p-5 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-foreground">Partie en pause</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Tu peux reprendre, changer d'ambiance ou revenir à l'accueil.
              </p>
              <div className="mt-5 space-y-3">
                <button
                  onClick={() => setShowPauseMenu(false)}
                  className="gradient-primary w-full rounded-2xl px-4 py-3 font-semibold text-primary-foreground transition-transform active:scale-95"
                >
                  Reprendre
                </button>
                <button
                  onClick={() => {
                    setShowPauseMenu(false);
                    useGameStore.getState().startGame();
                  }}
                  className="w-full rounded-2xl bg-secondary px-4 py-3 font-semibold text-foreground transition-transform active:scale-95"
                >
                  Rejouer ce mode
                </button>
                <button
                  onClick={() => setScreen("vibe")}
                  className="w-full rounded-2xl bg-secondary px-4 py-3 font-semibold text-foreground transition-transform active:scale-95"
                >
                  Changer d'ambiance
                </button>
                <button
                  onClick={() => setScreen("home")}
                  className="w-full rounded-2xl bg-card px-4 py-3 font-semibold text-muted-foreground transition-transform active:scale-95"
                >
                  Quitter vers l'accueil
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameScreen;
