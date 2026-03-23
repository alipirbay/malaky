import { useState, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { fillPlayerNames, GAME_MODES } from "@/data/cards";
import { ArrowLeft, Pause, Volume2 } from "lucide-react";

const CARD_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  truth: { label: "Vérité", color: "217 91% 60%" },
  dare: { label: "Action", color: "350 96% 72%" },
  group: { label: "Groupe", color: "38 92% 50%" },
  duel: { label: "Duel", color: "280 65% 60%" },
  vote: { label: "Vote", color: "142 71% 45%" },
  timer: { label: "Chrono", color: "25 95% 53%" },
};

const SWIPE_THRESHOLD = 100;

const GameScreen = () => {
  const {
    players,
    currentPlayerIndex,
    currentCardIndex,
    deck,
    selectedMode,
    passesRemaining,
    nextCard,
    setScreen,
  } = useGameStore();

  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | "up" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const dragX = useMotionValue(0);
  const rotate = useTransform(dragX, [-200, 0, 200], [-12, 0, 12]);
  const doneOpacity = useTransform(dragX, [0, SWIPE_THRESHOLD], [0, 1]);
  const refuseOpacity = useTransform(dragX, [-SWIPE_THRESHOLD, 0], [1, 0]);

  const currentPlayer = players[currentPlayerIndex];
  const card = deck[currentCardIndex];
  const mode = GAME_MODES.find((item) => item.id === selectedMode);

  if (!card || !currentPlayer) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-surface">
        <div className="text-center">
          <p className="mb-4 text-xl font-bold text-foreground">Pas assez de cartes pour cette config 😅</p>
          <button onClick={() => setScreen("vibe")} className="rounded-xl gradient-primary px-6 py-3 font-semibold text-primary-foreground">
            Changer les paramètres
          </button>
        </div>
      </div>
    );
  }

  const cardText = fillPlayerNames(card.text, currentPlayer.name, players.map((p) => p.name));
  const cardMeta = CARD_TYPE_LABELS[card.card_type] || { label: card.card_type, color: "210 40% 98%" };
  const passes = passesRemaining[currentPlayer.name] || 0;

  const triggerAction = useCallback((action: "done" | "refuse" | "skip", dir: "left" | "right" | "up") => {
    if (isAnimating) return;
    setIsAnimating(true);
    setExitDirection(dir);
    setTimeout(() => {
      nextCard(action);
      setExitDirection(null);
      setIsAnimating(false);
      dragX.set(0);
    }, 250);
  }, [isAnimating, nextCard, dragX]);

  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const { offset, velocity } = info;
    if (offset.x > SWIPE_THRESHOLD || velocity.x > 500) {
      triggerAction("done", "right");
    } else if (offset.x < -SWIPE_THRESHOLD || velocity.x < -500) {
      triggerAction("refuse", "left");
    }
  };

  const exitVariants = {
    left: { x: -400, opacity: 0, rotate: -20, transition: { duration: 0.25 } },
    right: { x: 400, opacity: 0, rotate: 20, transition: { duration: 0.25 } },
    up: { y: -200, opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  };

  return (
    <div className="flex min-h-screen flex-col gradient-surface">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pb-2 pt-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("vibe")} className="rounded-lg bg-card p-2 text-muted-foreground">
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
          <span className="text-xs text-muted-foreground">{currentCardIndex + 1}/{deck.length}</span>
          <button className="rounded-lg bg-card p-2 text-muted-foreground"><Volume2 size={16} /></button>
          <button onClick={() => setShowPauseMenu(true)} className="rounded-lg bg-card p-2 text-muted-foreground"><Pause size={16} /></button>
        </div>
      </div>

      <div className="flex items-center gap-2 px-6 pb-4">
        <span className="text-sm text-muted-foreground">{mode?.emoji} {mode?.name}</span>
      </div>

      {/* Card area */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCardIndex}
            drag={isAnimating ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.9}
            onDragEnd={handleDragEnd}
            style={{ x: dragX, rotate }}
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={exitDirection ? exitVariants[exitDirection] : { opacity: 0, scale: 0.9, y: -30 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full max-w-sm cursor-grab active:cursor-grabbing"
          >
            <div className="card-game relative flex min-h-[300px] flex-col items-center justify-center overflow-hidden text-center">
              {/* Type badge */}
              <span
                className="absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold"
                style={{ backgroundColor: `hsl(${cardMeta.color} / 0.15)`, color: `hsl(${cardMeta.color})` }}
              >
                {cardMeta.label}
              </span>

              {/* Swipe overlays */}
              <motion.div
                className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-3xl bg-green-500/20"
                style={{ opacity: doneOpacity }}
              >
                <span className="text-2xl font-black text-green-400">Fait ✅</span>
              </motion.div>
              <motion.div
                className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-3xl bg-red-500/20"
                style={{ opacity: refuseOpacity }}
              >
                <span className="text-2xl font-black text-red-400">Refuse ❌</span>
              </motion.div>

              <p className="mt-4 px-2 text-xl font-bold leading-relaxed text-foreground">{cardText}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Swipe hint on first card */}
        {currentCardIndex === 0 && (
          <motion.p
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 2, duration: 1 }}
            className="mt-4 text-xs text-muted-foreground"
          >
            ← Swipe pour jouer →
          </motion.p>
        )}
      </div>

      {/* Buttons */}
      <div className="space-y-3 px-6 pb-8 pt-4">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => triggerAction("done", "right")}
            disabled={isAnimating}
            className="rounded-xl gradient-primary py-4 text-sm font-bold text-primary-foreground transition-transform active:scale-95 disabled:opacity-50"
          >
            ✅ Fait
          </button>
          <button
            onClick={() => triggerAction("refuse", "left")}
            disabled={isAnimating}
            className="rounded-xl gradient-coral py-4 text-sm font-bold text-foreground transition-transform active:scale-95 disabled:opacity-50"
          >
            ❌ Refuse
          </button>
          <button
            onClick={() => triggerAction("skip", "up")}
            disabled={isAnimating || passes <= 0}
            className="rounded-xl bg-card py-4 text-sm font-bold text-muted-foreground transition-transform active:scale-95 disabled:opacity-30"
          >
            ⏭ Pass ({passes})
          </button>
        </div>
      </div>

      {/* Pause menu */}
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
              <p className="mt-1 text-sm text-muted-foreground">Tu peux reprendre, changer d'ambiance ou revenir à l'accueil.</p>
              <div className="mt-5 space-y-3">
                <button onClick={() => setShowPauseMenu(false)} className="w-full rounded-2xl gradient-primary px-4 py-3 font-semibold text-primary-foreground transition-transform active:scale-95">Reprendre</button>
                <button onClick={() => setScreen("vibe")} className="w-full rounded-2xl bg-secondary px-4 py-3 font-semibold text-foreground transition-transform active:scale-95">Revenir aux ambiances</button>
                <button onClick={() => setScreen("home")} className="w-full rounded-2xl bg-card px-4 py-3 font-semibold text-muted-foreground transition-transform active:scale-95">Quitter vers l'accueil</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameScreen;
