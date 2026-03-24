import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { fillPlayerNames, GAME_MODES } from "@/data/cards";
import { useDilemmeVotes } from "@/hooks/useDilemmeVotes";
import { ArrowLeft, Pause, Volume2 } from "lucide-react";

const CARD_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  truth: { label: "Vérité", color: "217 91% 60%" },
  dare: { label: "Action", color: "350 96% 72%" },
  group: { label: "Groupe", color: "38 92% 50%" },
  duel: { label: "Duel", color: "280 65% 60%" },
  vote: { label: "Vote", color: "142 71% 45%" },
  timer: { label: "Chrono", color: "25 95% 53%" },
  dilemme: { label: "Dilemme", color: "280 65% 60%" },
};

const SWIPE_THRESHOLD = 100;

const GameScreen = () => {
  const {
    players, currentPlayerIndex, currentCardIndex, deck,
    selectedMode, passesRemaining, nextCard, setScreen,
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
  const isDilemme = card?.card_type === "dilemme";

  const { result: voteResult, hasVoted, vote, reset: resetVote } = useDilemmeVotes();

  // Reset vote state on card change
  useEffect(() => { resetVote(); }, [currentCardIndex, resetVote]);

  // Parse dilemme options from card text
  const parseDilemme = (text: string) => {
    // Format: "{player}, tu préfères : A OU B ?"
    const match = text.match(/:\s*(.+?)\s+OU\s+(.+?)\s*\??$/i)
      || text.match(/:\s*(.+?)\s+OU\s+(.+?)$/i);
    if (match) return { a: match[1].trim(), b: match[2].trim() };
    return null;
  };

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

  const handleDragEnd = useCallback((_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (isDilemme) return; // No swipe for dilemme cards
    const { offset, velocity } = info;
    if (offset.x > SWIPE_THRESHOLD || velocity.x > 500) {
      triggerAction("done", "right");
    } else if (offset.x < -SWIPE_THRESHOLD || velocity.x < -500) {
      triggerAction("refuse", "left");
    }
  }, [triggerAction, isDilemme]);

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
  const dilemmeOptions = isDilemme ? parseDilemme(cardText) : null;

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
            drag={isAnimating || isDilemme ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.9}
            onDragEnd={handleDragEnd}
            style={{ x: isDilemme ? undefined : dragX, rotate: isDilemme ? undefined : rotate }}
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={exitDirection ? exitVariants[exitDirection] : { opacity: 0, scale: 0.9, y: -30 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full max-w-sm"
          >
            <div className="card-game relative flex min-h-[340px] flex-col items-center justify-center overflow-hidden text-center">
              {/* Type badge */}
              <span
                className="absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold"
                style={{ backgroundColor: `hsl(${cardMeta.color} / 0.15)`, color: `hsl(${cardMeta.color})` }}
              >
                {cardMeta.label}
              </span>

              {/* Swipe overlays (non-dilemme only) */}
              {!isDilemme && (
                <>
                  <motion.div
                    className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-3xl"
                    style={{ opacity: doneOpacity, backgroundColor: "hsl(142 71% 45% / 0.2)" }}
                  >
                    <span className="text-2xl font-black" style={{ color: "hsl(142 71% 45%)" }}>Fait ✅</span>
                  </motion.div>
                  <motion.div
                    className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-3xl"
                    style={{ opacity: refuseOpacity, backgroundColor: "hsl(350 96% 72% / 0.2)" }}
                  >
                    <span className="text-2xl font-black" style={{ color: "hsl(350 96% 72%)" }}>Refuse ❌</span>
                  </motion.div>
                </>
              )}

              {/* Dilemme UI */}
              {isDilemme && dilemmeOptions ? (
                <div className="flex w-full flex-col gap-4 px-2">
                  <p className="text-lg font-bold text-foreground mb-2">⚖️ Dilemme</p>

                  {!hasVoted ? (
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => vote(card.text, "a")}
                        className="w-full rounded-2xl bg-primary/20 px-4 py-4 text-sm font-bold text-primary transition-all hover:bg-primary/30 active:scale-95"
                      >
                        {dilemmeOptions.a}
                      </button>
                      <p className="text-xs text-muted-foreground font-semibold">OU</p>
                      <button
                        onClick={() => vote(card.text, "b")}
                        className="w-full rounded-2xl bg-coral/20 px-4 py-4 text-sm font-bold text-coral transition-all hover:bg-coral/30 active:scale-95"
                        style={{ color: "hsl(var(--coral))" }}
                      >
                        {dilemmeOptions.b}
                      </button>
                    </div>
                  ) : voteResult ? (
                    <div className="flex flex-col gap-3">
                      {/* Animated vote bar */}
                      <div className="relative h-14 w-full overflow-hidden rounded-2xl bg-card">
                        <motion.div
                          initial={{ width: "50%" }}
                          animate={{ width: `${voteResult.choiceAPct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="absolute inset-y-0 left-0 flex items-center justify-start px-3"
                          style={{ backgroundColor: "hsl(var(--primary) / 0.3)" }}
                        >
                          <span className="text-xs font-bold text-primary truncate">{voteResult.choiceAPct}%</span>
                        </motion.div>
                        <motion.div
                          initial={{ width: "50%" }}
                          animate={{ width: `${voteResult.choiceBPct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="absolute inset-y-0 right-0 flex items-center justify-end px-3"
                          style={{ backgroundColor: "hsl(var(--coral) / 0.3)" }}
                        >
                          <span className="text-xs font-bold truncate" style={{ color: "hsl(var(--coral))" }}>{voteResult.choiceBPct}%</span>
                        </motion.div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-primary truncate max-w-[45%]">{dilemmeOptions.a}</span>
                        <span className="font-semibold truncate max-w-[45%]" style={{ color: "hsl(var(--coral))" }}>{dilemmeOptions.b}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{voteResult.totalVotes} vote{voteResult.totalVotes > 1 ? "s" : ""} à Madagascar 🇲🇬</p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="mt-4 px-2 text-xl font-bold leading-relaxed text-foreground">{cardText}</p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Swipe hint on first card (non-dilemme) */}
        {currentCardIndex === 0 && !isDilemme && (
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
        {isDilemme ? (
          <button
            onClick={() => triggerAction("done", "right")}
            disabled={isAnimating || !hasVoted}
            className="w-full rounded-xl gradient-primary py-4 text-sm font-bold text-primary-foreground transition-transform active:scale-95 disabled:opacity-50"
          >
            Suivant →
          </button>
        ) : (
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
        )}
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
                <button onClick={() => setScreen("vibe")} className="w-full rounded-2xl bg-secondary px-4 py-3 font-semibold text-foreground transition-transform active:scale-95">Changer d'ambiance</button>
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
