import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { getUnlockedAchievements, ACHIEVEMENTS } from "@/lib/achievements";
import { ArrowLeft, Trophy, Calendar, Users, Zap } from "lucide-react";
import { useMemo } from "react";

const HistoryScreen = () => {
  const setScreen = useGameStore((s) => s.setScreen);
  const { sessions, getBestSession } = usePlayerStats();
  const bestSession = getBestSession();

  const unlockedIds = useMemo(() => new Set(getUnlockedAchievements()), []);
  const totalCards = useMemo(
    () => sessions.reduce((sum, s) => sum + s.cardsPlayed, 0),
    [sessions]
  );

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface safe-top safe-bottom">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => setScreen("settings")}
          className="rounded-xl bg-card p-2.5 text-foreground"
          aria-label="Retour"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">Historique</h2>
          <p className="text-sm text-muted-foreground">
            {sessions.length} partie{sessions.length > 1 ? "s" : ""} jouée
            {sessions.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Stats globales */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card-game text-center">
            <p className="text-2xl font-black text-primary">{sessions.length}</p>
            <p className="text-[10px] text-muted-foreground">parties</p>
          </div>
          <div className="card-game text-center">
            <p className="text-2xl font-black text-foreground">{totalCards}</p>
            <p className="text-[10px] text-muted-foreground">cartes jouées</p>
          </div>
          <div className="card-game text-center">
            <p className="text-2xl font-black text-accent">{bestSession?.score ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">record</p>
          </div>
        </div>
      )}

      {/* Badges */}
      <div className="mb-6">
        <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider mb-2 px-1">
          Badges
        </p>
        <div className="flex flex-wrap gap-2">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = unlockedIds.has(a.id);
            return (
              <div
                key={a.id}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs ${
                  unlocked
                    ? "bg-primary/10 text-foreground"
                    : "bg-muted/30 text-muted-foreground/40"
                }`}
                title={a.description}
              >
                <span>{a.emoji}</span>
                <span className="font-medium">{a.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Liste des sessions */}
      <div className="flex-1 space-y-2 overflow-y-auto pb-4">
        {sessions.length === 0 ? (
          <div className="card-game text-center py-8">
            <p className="text-4xl mb-2">🎮</p>
            <p className="text-sm text-muted-foreground">
              Aucune partie jouée pour l'instant
            </p>
          </div>
        ) : (
          sessions.map((session, i) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="card-game"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-sm">
                  {session.id === bestSession?.id && (
                    <Trophy size={12} className="text-primary" />
                  )}
                  <span className="font-bold text-foreground">{session.mode}</span>
                  <span className="text-muted-foreground">· {session.vibe}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap size={12} className="text-primary" />
                  <span className="text-sm font-bold text-primary">
                    {session.score} pts
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users size={10} />
                  {session.players.slice(0, 3).join(", ")}
                  {session.players.length > 3 ? "…" : ""}
                </span>
                <span>{session.cardsPlayed} cartes</span>
                <span>{session.refusals} refus</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Calendar size={10} className="text-muted-foreground/50" />
                <span className="text-[10px] text-muted-foreground/50">
                  {new Date(session.date).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryScreen;
