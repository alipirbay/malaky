import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { fillPlayerNames, GAME_MODES } from "@/data/cards";
import { ArrowLeft, Pause, Volume2, VolumeX, ChevronRight, Play, RotateCcw } from "lucide-react";
import { useSounds } from "@/hooks/useSounds";

const CARD_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  truth: { label: "Vérité", color: "217 91% 60%" },
  dare: { label: "Action", color: "350 96% 72%" },
  group: { label: "Groupe", color: "38 92% 50%" },
  duel: { label: "Duel", color: "280 65% 60%" },
  vote: { label: "Vote", color: "142 71% 45%" },
  timer: { label: "Chrono", color: "25 95% 53%" },
};

function extractDuration(text: string): number {
  const minuteMatch = text.match(/(\d+)\s*(?:minute|minutes)/i);
  if (minuteMatch) return parseInt(minuteMatch[1], 10) * 60;
  if (/une?\s+minute/i.test(text)) return 60;

  const secondMatch = text.match(/(\d+)\s*(?:s|sec|secondes?)/i);
  if (secondMatch) return parseInt(secondMatch[1], 10);

  return 15;
}

const GameScreen = () => {
  const {
    players,
    currentPlayerIndex,
    currentCardIndex,
    deck,
    selectedMode,
    nextCard,
    setScreen,
  } = useGameStore();

  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState(1);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentPlayer = players[currentPlayerIndex];
  const card = deck[currentCardIndex];
  const mode = GAME_MODES.find((item) => item.id === selectedMode);

  const cardText = card
    ? fillPlayerNames(card.text, currentPlayer?.name ?? "", players.map((p) => p.name))
    : "";
  const isTimerCard = card?.card_type === "timer"; // manual GO button
  const isQuickChallengeMode = selectedMode === "quick_challenge";
  // Auto-timer: non-action cards in défis express get a 15s auto countdown
  const isAutoTimer = isQuickChallengeMode && !isTimerCard && card != null;
  const AUTO_DURATION = 15;
  const totalDuration = isTimerCard ? extractDuration(cardText) : AUTO_DURATION;
  const showTimer = isTimerCard || isAutoTimer;
  const cardMeta = card
    ? CARD_TYPE_LABELS[card.card_type] || { label: card.card_type, color: "210 40% 98%" }
    : { label: "", color: "210 40% 98%" };
  const timerProgress = totalDuration > 0 ? timeLeft / totalDuration : 0;

  useEffect(() => {
    setTimerRunning(false);
    setTimerDone(false);
    setTimeLeft(totalDuration);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Auto-start for non-action cards in quick_challenge
    if (isAutoTimer) {
      setTimerRunning(true);
    }
  }, [currentCardIndex, totalDuration, isAutoTimer]);

  useEffect(() => {
    if (!timerRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          setTimerDone(true);
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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerRunning]);

  const startTimer = useCallback(() => {
    setTimeLeft(totalDuration);
    setTimerDone(false);
    setTimerRunning(true);
  }, [totalDuration]);

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

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setTimeout(() => {
      nextCard("done");
      setIsAnimating(false);
    }, 350);
  }, [isAnimating, nextCard]);

  if (!card || !currentPlayer) {
    return (
      <div className="gradient-surface flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-xl font-bold text-foreground">Pas assez de cartes pour cette config 😅</p>
          <button
            onClick={() => setScreen("vibe")}
            className="gradient-primary rounded-xl px-6 py-3 font-semibold text-primary-foreground"
          >
            Changer les paramètres
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-surface flex min-h-screen flex-col">
      <div className="flex items-center justify-between px-6 pb-2 pt-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowPauseMenu(true)} className="rounded-lg bg-card p-2 text-muted-foreground">
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
          <span className="text-xs text-muted-foreground">
            {currentCardIndex + 1}/{deck.length}
          </span>
          <button className="rounded-lg bg-card p-2 text-muted-foreground">
            <Volume2 size={16} />
          </button>
          <button onClick={() => setShowPauseMenu(true)} className="rounded-lg bg-card p-2 text-muted-foreground">
            <Pause size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 px-6 pb-4">
        <span className="text-sm text-muted-foreground">
          {mode?.emoji} {mode?.name}
        </span>
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
          >
            <div className="card-game relative flex min-h-[340px] flex-col items-center justify-center overflow-hidden text-center">
              <span
                className="absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold"
                style={{ backgroundColor: `hsl(${cardMeta.color} / 0.15)`, color: `hsl(${cardMeta.color})` }}
              >
                {cardMeta.label}
              </span>

              <p className="mt-4 px-2 text-xl font-bold leading-relaxed text-foreground">{cardText}</p>

              {showTimer && (
                <div className="mt-6 flex flex-col items-center gap-3">
                  <div className="relative flex h-24 w-24 items-center justify-center">
                    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 96 96">
                      <circle cx="48" cy="48" r="42" fill="none" stroke="hsl(var(--muted) / 0.3)" strokeWidth="6" />
                      <circle
                        cx="48"
                        cy="48"
                        r="42"
                        fill="none"
                        stroke={timerDone ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                        strokeWidth="6"
                        strokeLinecap="round"
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
                    {/* Manual GO button only for timer (action) cards */}
                    {isTimerCard && !timerRunning && !timerDone && (
                      <button
                        onClick={startTimer}
                        className="gradient-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-primary-foreground transition-transform active:scale-95"
                      >
                        <Play size={16} /> GO
                      </button>
                    )}

                    {timerRunning && <span className="animate-pulse text-sm font-bold text-primary">⏱️ {isAutoTimer ? "Réponds vite !" : "Chrono en cours..."}</span>}

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
                          onClick={resetTimer}
                          className="rounded-lg bg-secondary p-2 text-muted-foreground transition-transform active:scale-95"
                        >
                          <RotateCcw size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-6 pb-8 pt-4">
        <button
          onClick={handleNext}
          disabled={isAnimating}
          className="gradient-primary flex w-full items-center justify-center gap-2 rounded-2xl py-5 text-base font-bold text-primary-foreground transition-transform active:scale-95 disabled:opacity-50"
        >
          NEXT <ChevronRight size={20} />
        </button>
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
