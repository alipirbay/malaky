import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHeadsUpStore } from "@/store/headsUpStore";
import { useGameStore } from "@/store/gameStore";
import { useDeviceTilt } from "@/hooks/useDeviceTilt";
import { GAME_LIMITS } from "@/data/constants";
import { Check, X, Pause, Play, ArrowLeft, Layers, Home } from "lucide-react";
import { useSounds } from "@/hooks/useSounds";

const TiltUpPlaying = () => {
  const store = useHeadsUpStore();
  const setGameScreen = useGameStore((s) => s.setScreen);
  const { playClick, playBuzzer, vibrate } = useSounds();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [flash, setFlash] = useState<"found" | "pass" | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const landscapeLockedRef = useRef(false);

  // Lock orientation to landscape
  useEffect(() => {
    const lockOrientation = async () => {
      try {
        const so = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
        if (so?.lock) {
          await so.lock("landscape-primary");
          landscapeLockedRef.current = true;
          setIsLandscape(true);
        }
      } catch {
        // Lock not supported — use CSS fallback
      }
    };
    lockOrientation();

    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight || landscapeLockedRef.current);
    };
    checkOrientation();
    window.addEventListener("resize", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      if (landscapeLockedRef.current) {
        try {
          screen.orientation?.unlock();
        } catch { /* ignore */ }
        landscapeLockedRef.current = false;
      }
    };
  }, []);

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
  }, [store, store.roundRunning]);

  // Buzzer on time up
  useEffect(() => {
    if (store.roundTimeLeft === 0 && store.roundComplete) {
      playBuzzer();
    }
  }, [store.roundTimeLeft, store.roundComplete, playBuzzer]);

  // Device tilt — primary interaction
  const { tiltSupported, permissionGranted, requestPermission } = useDeviceTilt({
    enabled: store.roundRunning && !showMenu,
    onFound: handleFound,
    onPass: handlePass,
  });

  useEffect(() => {
    if (tiltSupported && !permissionGranted) {
      requestPermission();
    }
  }, [tiltSupported, permissionGranted, requestPermission]);

  const currentPlayer = store.players[store.currentPlayerIndex];
  const roundSeconds = GAME_LIMITS.HEADS_UP_ROUND_SECONDS;
  const timerPct = (store.roundTimeLeft / roundSeconds) * 100;
  const tiltActive = tiltSupported && permissionGranted;
  const needsCssRotation = !landscapeLockedRef.current && !isLandscape;

  const handleQuit = useCallback((target: "categories" | "mode" | "home") => {
    store.resetGame();
    if (target === "categories") {
      store.setScreen("categories");
    } else if (target === "mode") {
      setGameScreen("mode");
    } else {
      setGameScreen("home");
    }
    setShowMenu(false);
  }, [store, setGameScreen]);

  const containerStyle: React.CSSProperties = needsCssRotation
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vh",
        height: "100vw",
        transform: "rotate(90deg)",
        transformOrigin: "top left",
        marginLeft: "100vw",
        zIndex: 9999,
      }
    : { position: "fixed", inset: 0, zIndex: 9999 };

  return (
    <div style={containerStyle} className="flex flex-col items-center justify-center bg-background overflow-hidden">
      {/* Flash overlay */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 z-40 ${flash === "found" ? "bg-emerald-500" : "bg-destructive"}`}
          />
        )}
      </AnimatePresence>

      {/* Timer bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-muted">
        <motion.div
          className={`h-full ${store.roundTimeLeft <= 10 ? "bg-destructive" : "bg-primary"}`}
          animate={{ width: `${timerPct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Header */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              backgroundColor: currentPlayer ? `hsl(${currentPlayer.color} / 0.2)` : undefined,
              color: currentPlayer ? `hsl(${currentPlayer.color})` : undefined,
            }}
          >
            {currentPlayer?.name[0]?.toUpperCase()}
          </div>
          <span className="font-semibold text-foreground text-xs">{currentPlayer?.name}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xl font-black tabular-nums ${store.roundTimeLeft <= 10 ? "text-destructive animate-pulse" : "text-foreground"}`}>
            {store.roundTimeLeft}s
          </span>
          <span className="text-xs text-muted-foreground">✓{store.found.length}</span>
          <button onClick={() => setShowMenu(true)} className="rounded-lg bg-card/80 p-1.5 text-muted-foreground" aria-label="Menu">
            <Pause size={14} />
          </button>
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
          className="text-center px-12"
        >
          <h1 className="text-6xl md:text-7xl font-black text-foreground leading-tight tracking-tight">
            {store.currentWord}
          </h1>
        </motion.div>
      </AnimatePresence>

      {/* Bottom area */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
        {tiltActive ? (
          <p className="w-full text-center text-[10px] text-muted-foreground/50">
            ↕ Incline pour jouer
          </p>
        ) : (
          <div className="w-full flex items-center gap-3">
            <button
              onClick={handlePass}
              disabled={store.passesLeft <= 0 || !!flash}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-destructive/20 py-3 text-base font-bold text-destructive disabled:opacity-30 transition-transform active:scale-95"
              aria-label="Passer"
            >
              <X size={20} /> Passer ({store.passesLeft})
            </button>
            <button
              onClick={handleFound}
              disabled={!!flash}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/20 py-3 text-base font-bold text-emerald-400 transition-transform active:scale-95"
              aria-label="Trouvé"
            >
              <Check size={20} /> Trouvé !
            </button>
          </div>
        )}
      </div>

      {/* Pause menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 px-6 backdrop-blur-sm"
            onClick={() => setShowMenu(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-xs rounded-3xl bg-card p-5 shadow-2xl space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-foreground text-center">Pause</h3>
              <button onClick={() => setShowMenu(false)} className="w-full rounded-2xl gradient-primary px-4 py-3 font-semibold text-primary-foreground flex items-center justify-center gap-2">
                <Play size={18} /> Reprendre
              </button>
              <button onClick={() => handleQuit("categories")} className="w-full rounded-2xl bg-muted px-4 py-3 font-semibold text-foreground flex items-center justify-center gap-2">
                <Layers size={18} /> Catégories
              </button>
              <button onClick={() => handleQuit("mode")} className="w-full rounded-2xl bg-muted px-4 py-3 font-semibold text-foreground flex items-center justify-center gap-2">
                <ArrowLeft size={18} /> Modes
              </button>
              <button onClick={() => handleQuit("home")} className="w-full rounded-2xl bg-muted px-4 py-3 font-semibold text-destructive flex items-center justify-center gap-2">
                <Home size={18} /> Accueil
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TiltUpPlaying;
