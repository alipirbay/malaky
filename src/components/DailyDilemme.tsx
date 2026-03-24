import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDailyDilemme } from "@/hooks/useDailyDilemme";
import { Scale, Clock, TrendingUp, Sparkles } from "lucide-react";
import { useSounds } from "@/hooks/useSounds";

const formatCountdown = (ms: number) => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const TOPIC_LABELS: Record<string, { emoji: string; label: string }> = {
  politique: { emoji: "🏛️", label: "Politique" },
  économie: { emoji: "💰", label: "Économie" },
  société: { emoji: "🤝", label: "Société" },
  culture: { emoji: "🎭", label: "Culture" },
  sport: { emoji: "⚽", label: "Sport" },
  technologie: { emoji: "💻", label: "Tech" },
  environnement: { emoji: "🌍", label: "Environnement" },
  general: { emoji: "⚖️", label: "Général" },
};

const DailyDilemme = () => {
  const { dilemme, loading, voteResult, hasVoted, voting, vote, getTimeUntilNext } = useDailyDilemme();
  const [countdown, setCountdown] = useState("");
  const { playConfirm, vibrate } = useSounds();

  const handleVote = (choice: "a" | "b") => {
    vote(choice);
    playConfirm();
    vibrate(50);
  };

  useEffect(() => {
    const tick = () => setCountdown(formatCountdown(getTimeUntilNext()));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [getTimeUntilNext]);

  if (loading) {
    return (
      <div className="w-full rounded-3xl bg-card p-5 animate-pulse">
        <div className="h-5 w-32 bg-muted rounded mb-3" />
        <div className="h-4 w-full bg-muted rounded mb-2" />
        <div className="h-12 w-full bg-muted rounded mb-2" />
        <div className="h-12 w-full bg-muted rounded" />
      </div>
    );
  }

  if (!dilemme) return null;

  const topicInfo = TOPIC_LABELS[dilemme.topic] || TOPIC_LABELS.general;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full overflow-hidden rounded-3xl relative"
      style={{
        background: "linear-gradient(135deg, hsl(280 65% 15%), hsl(217 33% 12%), hsl(350 50% 15%))",
      }}
    >
      {/* Glow effect */}
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-30" 
        style={{ background: "radial-gradient(circle, hsl(280 65% 60%), transparent)" }} />
      <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, hsl(350 96% 72%), transparent)" }} />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl" 
              style={{ background: "linear-gradient(135deg, hsl(280 65% 60%), hsl(350 96% 72%))" }}>
              <Scale size={16} className="text-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground tracking-tight">DILEMME DU JOUR</h3>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-medium text-muted-foreground">{topicInfo.emoji} {topicInfo.label}</span>
                <span className="text-muted-foreground/40">•</span>
                <Sparkles size={10} className="text-muted-foreground/60" />
                <span className="text-[10px] text-muted-foreground/60">IA</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-foreground/5 px-3 py-1.5">
            <Clock size={11} className="text-muted-foreground" />
            <span className="text-[10px] font-bold text-muted-foreground font-mono">{countdown}</span>
          </div>
        </div>

        {/* Question */}
        <p className="text-base font-bold text-foreground leading-snug mb-4">
          {dilemme.question}
        </p>

        <AnimatePresence mode="wait">
          {!hasVoted ? (
            <motion.div
              key="options"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col gap-2.5"
            >
              <button
                onClick={() => handleVote("a")}
                disabled={voting}
                className="w-full rounded-2xl px-4 py-4 text-left text-sm font-bold transition-all active:scale-[0.97] disabled:opacity-50"
                style={{
                  background: "hsl(217 91% 60% / 0.15)",
                  color: "hsl(217 91% 70%)",
                  border: "1px solid hsl(217 91% 60% / 0.2)",
                }}
              >
                <span className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black"
                    style={{ background: "hsl(217 91% 60% / 0.3)" }}>A</span>
                  {dilemme.option_a}
                </span>
              </button>

              <div className="flex items-center gap-2 px-2">
                <div className="h-px flex-1" style={{ background: "hsl(var(--foreground) / 0.1)" }} />
                <span className="text-[10px] font-bold text-muted-foreground/50">OU</span>
                <div className="h-px flex-1" style={{ background: "hsl(var(--foreground) / 0.1)" }} />
              </div>

              <button
                onClick={() => handleVote("b")}
                disabled={voting}
                className="w-full rounded-2xl px-4 py-4 text-left text-sm font-bold transition-all active:scale-[0.97] disabled:opacity-50"
                style={{
                  background: "hsl(350 96% 72% / 0.15)",
                  color: "hsl(350 96% 80%)",
                  border: "1px solid hsl(350 96% 72% / 0.2)",
                }}
              >
                <span className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black"
                    style={{ background: "hsl(350 96% 72% / 0.3)" }}>B</span>
                  {dilemme.option_b}
                </span>
              </button>
            </motion.div>
          ) : voteResult ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {/* Vote bar */}
              <div className="relative h-16 w-full overflow-hidden rounded-2xl" style={{ background: "hsl(var(--foreground) / 0.05)" }}>
                <motion.div
                  initial={{ width: "50%" }}
                  animate={{ width: `${voteResult.choiceAPct}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  className="absolute inset-y-0 left-0 flex items-center px-3"
                  style={{ background: "hsl(217 91% 60% / 0.25)" }}
                >
                  <div className="flex flex-col">
                    <span className="text-lg font-black" style={{ color: "hsl(217 91% 70%)" }}>{voteResult.choiceAPct}%</span>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ width: "50%" }}
                  animate={{ width: `${voteResult.choiceBPct}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  className="absolute inset-y-0 right-0 flex items-center justify-end px-3"
                  style={{ background: "hsl(350 96% 72% / 0.25)" }}
                >
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-black" style={{ color: "hsl(350 96% 80%)" }}>{voteResult.choiceBPct}%</span>
                  </div>
                </motion.div>
              </div>

              {/* Labels */}
              <div className="flex justify-between text-xs px-1">
                <span className="font-bold truncate max-w-[45%]" style={{ color: "hsl(217 91% 70%)" }}>{dilemme.option_a}</span>
                <span className="font-bold truncate max-w-[45%] text-right" style={{ color: "hsl(350 96% 80%)" }}>{dilemme.option_b}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={12} className="text-muted-foreground/60" />
                  <span className="text-[10px] text-muted-foreground/60">
                    {voteResult.totalVotes.toLocaleString()} vote{voteResult.totalVotes > 1 ? "s" : ""} 🇲🇬
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground/40">Prochain dans {countdown}</span>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DailyDilemme;
