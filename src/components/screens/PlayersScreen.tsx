import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { ArrowLeft, Shuffle, Plus, X } from "lucide-react";

const PlayersScreen = () => {
  const { players, addPlayer, removePlayer, shufflePlayers, setScreen } = useGameStore();
  const [name, setName] = useState("");

  const handleAdd = () => {
    const trimmed = name.trim();
    if (trimmed && players.length < 12) {
      addPlayer(trimmed);
      setName("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
  };

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setScreen("home")} className="rounded-xl bg-card p-2.5 text-foreground">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">Qui joue ?</h2>
          <p className="text-sm text-muted-foreground">Ajoute les prénoms. On s'occupe du reste.</p>
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-2 mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Prénom… (ex: Rivo, Haja, Fara)"
          maxLength={20}
          className="flex-1 rounded-xl bg-card px-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 border border-border focus:border-primary focus:outline-none transition-colors"
        />
        <button
          onClick={handleAdd}
          disabled={!name.trim() || players.length >= 12}
          className="rounded-xl gradient-primary p-3.5 text-primary-foreground disabled:opacity-30 transition-transform active:scale-95"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Players list */}
      <div className="flex-1 space-y-2 mb-6 overflow-y-auto">
        <AnimatePresence>
          {players.map((player, i) => (
            <motion.div
              key={`${player.name}-${i}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-3 rounded-xl bg-card px-4 py-3"
            >
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: `hsl(${player.color} / 0.2)`, color: `hsl(${player.color})` }}
              >
                {player.name[0].toUpperCase()}
              </div>
              <span className="flex-1 font-medium text-foreground">{player.name}</span>
              <button onClick={() => removePlayer(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {players.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground/50 text-sm mb-2">
              Mettez vos prénoms et c'est parti !
            </p>
            <p className="text-muted-foreground/30 text-xs italic">
              Ny fialam-boly tsara dia mialoha ny namana.
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {players.length >= 2 && (
          <button
            onClick={shufflePlayers}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-card px-4 py-3 text-sm font-medium text-muted-foreground"
          >
            <Shuffle size={16} /> Mélanger l'ordre
          </button>
        )}
        <button
          onClick={() => setScreen("mode")}
          disabled={players.length < 2}
          className="w-full rounded-2xl gradient-primary px-6 py-4 text-lg font-bold text-primary-foreground disabled:opacity-30 glow-primary transition-transform active:scale-95"
        >
          Continuer ({players.length}/12)
        </button>
      </div>
    </div>
  );
};

export default PlayersScreen;
