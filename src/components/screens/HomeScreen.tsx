import { lazy, Suspense, useMemo } from "react";
import { motion } from "framer-motion";
import malakyLogo from "@/assets/malaky-logo.webp";
import { useGameStore } from "@/store/gameStore";
import { useProfileStore, getXpProgress } from "@/store/profileStore";
import { getNetworkStatus, onNetworkChange } from "@/lib/networkStatus";
import { ShoppingBag, Settings, Zap } from "lucide-react";
import { useState, useEffect } from "react";

const DailyDilemme = lazy(() => import("@/components/DailyDilemme"));

const LAUNCH_DATE_MS = new Date('2026-03-24').getTime();

const HomeScreen = () => {
  const setScreen = useGameStore((s) => s.setScreen);
  const [isOnline, setIsOnline] = useState(getNetworkStatus());
  const avatar = useProfileStore((s) => s.avatar);
  const avatarUrl = useProfileStore((s) => s.avatarUrl);
  const xp = useProfileStore((s) => s.xp);
  const xpData = getXpProgress(xp);

  useEffect(() => onNetworkChange(setIsOnline), []);

  const isNew = useMemo(
    () => (Date.now() - LAUNCH_DATE_MS) < 30 * 24 * 60 * 60 * 1000,
    []
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-between px-6 py-10 gradient-surface safe-top safe-bottom">
      <div className="flex-1" />

      {/* Center content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center"
      >
        <img src={malakyLogo} alt="Malaky" className="w-80 max-w-[85vw] mx-auto drop-shadow-2xl" />
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2"
          >
            <span className="h-2 w-2 rounded-full bg-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Mode hors-ligne</span>
          </motion.div>
        )}
      </motion.div>

      {/* Daily Dilemme */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="mt-8 w-full max-w-sm"
      >
        <Suspense fallback={
          <div className="w-full rounded-3xl bg-card p-5 animate-pulse">
            <div className="h-5 w-32 bg-muted rounded mb-3" />
            <div className="h-4 w-full bg-muted rounded mb-2" />
            <div className="h-12 w-full bg-muted rounded mb-2" />
            <div className="h-12 w-full bg-muted rounded" />
          </div>
        }>
          <DailyDilemme />
        </Suspense>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="mt-6 w-full max-w-sm space-y-3"
      >
        <div className="flex gap-3">
          {/* Avatar / Profile button */}
          <button
            onClick={() => setScreen("profile")}
            className="group relative flex-shrink-0 overflow-hidden rounded-2xl bg-card w-[68px] py-5 transition-transform active:scale-95"
          >
            <div className="relative z-10 flex flex-col items-center gap-1">
              {avatarUrl ? (
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              ) : (
                <span className="text-2xl">{avatar}</span>
              )}
              <span className="text-[10px] font-bold text-muted-foreground">Profil</span>
              <span className="absolute -top-1 -right-0 rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-bold text-primary-foreground">
                {xpData.level}
              </span>
            </div>
          </button>

          <button
            onClick={() => setScreen("players")}
            className="group relative flex-[2] overflow-hidden rounded-2xl gradient-primary px-5 py-5 text-lg font-bold text-primary-foreground glow-primary transition-transform active:scale-95"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Zap size={20} /> Jouer
            </span>
            <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>

          <button
            onClick={() => setScreen("packs")}
            className="group relative flex-1 overflow-hidden rounded-2xl gradient-mango px-4 py-5 transition-transform active:scale-95"
          >
            <div className="relative z-10 flex flex-col items-center gap-1">
              <ShoppingBag size={20} className="text-mango-foreground" />
              <span className="text-xs font-bold text-mango-foreground">Packs</span>
              {isNew && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold text-mango-foreground">
                  NEW
                </span>
              )}
            </div>
            <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        </div>

        <button
          onClick={() => setScreen("settings")}
          className="w-full rounded-2xl bg-card px-4 py-4 text-sm font-semibold text-foreground transition-all hover:bg-secondary active:scale-95 flex items-center justify-center gap-2"
        >
          <Settings size={16} className="text-muted-foreground" /> Paramètres
        </button>
      </motion.div>

      {/* Bottom stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 flex flex-col items-center gap-3"
      >
        <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
          <span>{GAME_MODES.length} Modes</span>
          <span>•</span>
          <span>{STORE_PACKS.length} Packs</span>
          <span>•</span>
          <span>7500+ Cartes</span>
        </div>
        <p className="text-xs font-medium text-muted-foreground/40 tracking-widest uppercase">
          Ose tout. Assume rien.
        </p>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/30">
          <button
            onClick={() => window.open("/privacy.html", "_blank")}
            className="underline underline-offset-2"
          >
            Confidentialité
          </button>
          <span>·</span>
          <button
            onClick={() => window.open("/support.html", "_blank")}
            className="underline underline-offset-2"
          >
            Support
          </button>
          <span>·</span>
          <span>© 2026 APli</span>
        </div>
      </motion.div>

      <div className="flex-1" />
    </div>
  );
};

export default HomeScreen;
