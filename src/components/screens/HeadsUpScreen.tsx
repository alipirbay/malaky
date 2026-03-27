import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHeadsUpStore } from "@/store/headsUpStore";
import { useGameStore } from "@/store/gameStore";
import { useDeviceTilt } from "@/hooks/useDeviceTilt";
import { HEADS_UP_CATEGORIES } from "@/data/heads_up_categories";
import { ArrowLeft, Check, X, Trophy, RotateCcw, ChevronRight, Smartphone, Zap } from "lucide-react";
import { useSounds } from "@/hooks/useSounds";

const HeadsUpScreen = () => {
  const store = useHeadsUpStore();
  const setGameScreen = useGameStore((s) => s.setScreen);
  const players = useGameStore((s) => s.players);

  // Init players on mount
  useEffect(() => {
    if (players.length >= 2) {
      store.initGame(players);
    }
  }, []);

  if (store.screen === "categories") return <CategoryPicker />;
  if (store.screen === "instructions") return <Instructions />;
  if (store.screen === "playing") return <GuessRushPlaying />;
  if (store.screen === "round_result") return <RoundResultScreen />;
  if (store.screen === "final_result") return <FinalResultScreen />;

  return null;
};

// --- Category Picker ---
const CategoryPicker = () => {
  const store = useHeadsUpStore();
  const setGameScreen = useGameStore((s) => s.setScreen);

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface safe-top safe-bottom">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setGameScreen("mode")} className="rounded-xl bg-card p-2.5 text-foreground" aria-label="Retour">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">⚡ Guess Rush</h2>
          <p className="text-sm text-muted-foreground">Choisis une catégorie</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {HEADS_UP_CATEGORIES.map((cat, i) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => store.selectCategory(cat.id)}
            className="w-full rounded-2xl bg-card p-5 text-left transition-transform active:scale-[0.97]"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{cat.emoji}</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">{cat.name}</h3>
                <p className="text-sm text-muted-foreground">{cat.description}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground">{cat.words.length} mots</span>
                <ChevronRight size={16} className="text-muted-foreground/50 ml-1 inline" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// --- Instructions ---
const Instructions = () => {
  const store = useHeadsUpStore();
  const setGameScreen = useGameStore((s) => s.setScreen);
  const { playConfirm, vibrate } = useSounds();
  const currentPlayer = store.players[store.currentPlayerIndex];

  const handleStart = useCallback(() => {
    playConfirm();
    vibrate(50);
    store.startRound();
  }, [store, playConfirm, vibrate]);

  const handleBack = useCallback(() => {
    store.setScreen("categories");
  }, [store]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 gradient-surface safe-top safe-bottom">
      {/* Back button */}
      <div className="absolute top-6 left-6 safe-top">
        <button onClick={handleBack} className="rounded-xl bg-card p-2.5 text-foreground" aria-label="Retour">
          <ArrowLeft size={20} />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-sm w-full"
      >
        <div className="text-6xl mb-6">⚡</div>

        <div
          className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2"
          style={{
            backgroundColor: currentPlayer ? `hsl(${currentPlayer.color} / 0.15)` : undefined,
            color: currentPlayer ? `hsl(${currentPlayer.color})` : undefined,
          }}
        >
          <span className="text-lg font-bold">{currentPlayer?.name}</span>
          <span className="text-sm">à toi !</span>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-4">Comment jouer</h2>
        <div className="space-y-3 text-left mb-8">
          <div className="flex items-start gap-3 rounded-xl bg-card p-3">
            <span className="text-xl">1️⃣</span>
            <p className="text-sm text-foreground">Place le téléphone sur ton front, écran face aux autres</p>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-card p-3">
            <span className="text-xl">2️⃣</span>
            <p className="text-sm text-foreground">Les autres te font deviner le mot affiché</p>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-card p-3">
            <span className="text-xl">3️⃣</span>
            <p className="text-sm text-foreground">
              <strong>Trouvé ?</strong> Incline vers le bas ou appuie ✓{" "}
              <strong>Passer ?</strong> Incline vers le haut ou appuie ✗
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          Catégorie : <strong>{store.selectedCategory?.emoji} {store.selectedCategory?.name}</strong>
        </p>

        <button
          onClick={handleStart}
          className="w-full rounded-2xl gradient-primary px-6 py-4 text-lg font-bold text-primary-foreground glow-primary transition-transform active:scale-95"
        >
          C'est parti ! 🚀
        </button>
      </motion.div>
    </div>
  );
};

// --- Playing ---
const GuessRushPlaying = () => {
  const store = useHeadsUpStore();
  const setGameScreen = useGameStore((s) => s.setScreen);
  const { playClick, playBuzzer, vibrate } = useSounds();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [flash, setFlash] = useState<"found" | "pass" | null>(null);

  const handleFound = useCallback(() => {
    if (flash) return;
    setFlash("found");
    playClick();
    vibrate(50);
    setTimeout(() => {
      store.markFound();
      setFlash(null);
    }, 400);
  }, [store, playClick, vibrate, flash]);

  const handlePass = useCallback(() => {
    if (flash || store.passesLeft <= 0) return;
    setFlash("pass");
    vibrate([30, 30]);
    setTimeout(() => {
      store.markPassed();
      setFlash(null);
    }, 400);
  }, [store, vibrate, flash]);

  // Timer
  useEffect(() => {
    if (!store.roundRunning) return;
    timerRef.current = setInterval(() => {
      store.tickTimer();
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [store.roundRunning]);

  // Buzzer when time runs out
  useEffect(() => {
    if (store.roundTimeLeft === 0 && store.roundComplete) {
      playBuzzer();
    }
  }, [store.roundTimeLeft, store.roundComplete, playBuzzer]);

  // Device tilt
  const { tiltSupported, permissionGranted, requestPermission } = useDeviceTilt({
    enabled: store.roundRunning,
    onFound: handleFound,
    onPass: handlePass,
  });

  // Request permission on first interaction if needed
  useEffect(() => {
    if (tiltSupported && !permissionGranted) {
      requestPermission();
    }
  }, [tiltSupported, permissionGranted, requestPermission]);

  const currentPlayer = store.players[store.currentPlayerIndex];
  const timerPct = (store.roundTimeLeft / 60) * 100;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gradient-surface safe-top safe-bottom overflow-hidden">
      {/* Flash overlay */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 z-40 ${flash === "found" ? "bg-green-500" : "bg-destructive"}`}
          />
        )}
      </AnimatePresence>

      {/* Timer bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-muted safe-top">
        <motion.div
          className={`h-2 ${store.roundTimeLeft <= 10 ? "bg-destructive" : "bg-primary"}`}
          animate={{ width: `${timerPct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Header info */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between safe-top">
        <div className="flex items-center gap-2">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{
              backgroundColor: currentPlayer ? `hsl(${currentPlayer.color} / 0.2)` : undefined,
              color: currentPlayer ? `hsl(${currentPlayer.color})` : undefined,
            }}
          >
            {currentPlayer?.name[0]?.toUpperCase()}
          </div>
          <span className="font-bold text-foreground text-sm">{currentPlayer?.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-2xl font-black ${store.roundTimeLeft <= 10 ? "text-destructive animate-pulse" : "text-foreground"}`}>
            {store.roundTimeLeft}s
          </span>
          <span className="text-sm text-muted-foreground">
            ✓{store.found.length}
          </span>
        </div>
      </div>

      {/* Word display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={store.currentWord}
          initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.25 }}
          className="text-center px-8"
        >
          <h1 className="text-5xl font-black text-foreground leading-tight">
            {store.currentWord}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {store.selectedCategory?.emoji} {store.selectedCategory?.name}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Action buttons (fallback) */}
      <div className="absolute bottom-12 left-6 right-6 flex items-center gap-4 safe-bottom">
        <button
          onClick={handlePass}
          disabled={store.passesLeft <= 0 || !!flash}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-destructive/20 py-5 text-lg font-bold text-destructive disabled:opacity-30 transition-transform active:scale-95"
        >
          <X size={24} /> Passer ({store.passesLeft})
        </button>
        <button
          onClick={handleFound}
          disabled={!!flash}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-green-500/20 py-5 text-lg font-bold text-green-400 transition-transform active:scale-95"
        >
          <Check size={24} /> Trouvé !
        </button>
      </div>

      {/* Tilt hint */}
      {tiltSupported && permissionGranted && (
        <div className="absolute bottom-4 left-0 right-0 text-center safe-bottom">
          <p className="text-[10px] text-muted-foreground/40">
            <Smartphone size={10} className="inline mr-1" />
            Tilt avant = trouvé · Tilt arrière = passer
          </p>
        </div>
      )}
    </div>
  );
};

// --- Round Result ---
const RoundResultScreen = () => {
  const store = useHeadsUpStore();
  const lastResult = store.roundResults[store.roundResults.length - 1];
  const isLastPlayer = store.currentPlayerIndex >= store.players.length - 1;

  if (!lastResult) return null;

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface safe-top safe-bottom">
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm w-full"
        >
          <div className="text-5xl mb-4">⚡</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{lastResult.playerName}</h2>
          <p className="text-4xl font-black text-primary mb-6">{lastResult.score} mots trouvés !</p>

          {lastResult.found.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-bold text-green-400 mb-2">✓ Trouvés</p>
              <div className="flex flex-wrap justify-center gap-2">
                {lastResult.found.map((w, i) => (
                  <span key={i} className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">{w}</span>
                ))}
              </div>
            </div>
          )}

          {lastResult.passed.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-bold text-muted-foreground mb-2">✗ Passés</p>
              <div className="flex flex-wrap justify-center gap-2">
                {lastResult.passed.map((w, i) => (
                  <span key={i} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{w}</span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <button
        onClick={() => store.nextPlayer()}
        className="w-full rounded-2xl gradient-primary px-6 py-4 text-lg font-bold text-primary-foreground glow-primary transition-transform active:scale-95"
      >
        {isLastPlayer ? "Voir les résultats 🏆" : `Au tour de ${store.players[store.currentPlayerIndex + 1]?.name} ➡️`}
      </button>
    </div>
  );
};

// --- Final Result ---
const FinalResultScreen = () => {
  const store = useHeadsUpStore();
  const setGameScreen = useGameStore((s) => s.setScreen);

  const sortedPlayers = [...store.players].sort(
    (a, b) => (store.scores[b.name] || 0) - (store.scores[a.name] || 0)
  );

  const winner = sortedPlayers[0];

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface safe-top safe-bottom">
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-center max-w-sm w-full"
        >
          <div className="text-7xl mb-4">🏆</div>
          <h2 className="text-3xl font-black text-foreground mb-2">{winner?.name} gagne !</h2>
          <p className="text-lg text-muted-foreground mb-8">
            avec {store.scores[winner?.name || ""] || 0} mots trouvés
          </p>

          <div className="space-y-3 mb-8">
            {sortedPlayers.map((player, idx) => (
              <motion.div
                key={player.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex items-center gap-3 rounded-2xl p-4 ${idx === 0 ? "gradient-mango" : "bg-card"}`}
              >
                <span className="text-2xl font-black w-8">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}`}</span>
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: `hsl(${player.color} / 0.2)`, color: `hsl(${player.color})` }}
                >
                  {player.name[0].toUpperCase()}
                </div>
                <span className="flex-1 font-bold text-foreground">{player.name}</span>
                <span className={`text-xl font-black ${idx === 0 ? "text-accent-foreground" : "text-primary"}`}>
                  {store.scores[player.name] || 0}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => {
            store.resetGame();
            store.setScreen("categories");
          }}
          className="w-full rounded-2xl gradient-primary px-6 py-4 text-lg font-bold text-primary-foreground glow-primary transition-transform active:scale-95"
        >
          <RotateCcw size={20} className="inline mr-2" /> Rejouer
        </button>
        <button
          onClick={() => {
            store.resetGame();
            setGameScreen("home");
          }}
          className="w-full rounded-2xl bg-card px-6 py-3 font-semibold text-foreground transition-transform active:scale-95"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
};

export default HeadsUpScreen;
