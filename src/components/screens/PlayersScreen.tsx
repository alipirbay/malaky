import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { useProfileStore } from "@/store/profileStore";
import { GAME_LIMITS } from "@/data/constants";
import { ArrowLeft, Shuffle, Plus, X } from "lucide-react";
import { useSounds } from "@/hooks/useSounds";

const PlayersScreen = () => {
  const players = useGameStore((s) => s.players);
  const addPlayer = useGameStore((s) => s.addPlayer);
  const removePlayer = useGameStore((s) => s.removePlayer);
  const shufflePlayers = useGameStore((s) => s.shufflePlayers);
  const setScreen = useGameStore((s) => s.setScreen);
  const [name, setName] = useState("");
  const { vibrate } = useSounds();
  const profileUsername = useProfileStore((s) => s.username);

  useEffect(() => {
    if (profileUsername && players.length === 0) {
      addPlayer(profileUsername);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = () => {
    const trimmed = name.trim();
    if (trimmed && players.length < GAME_LIMITS.MAX_PLAYERS) {
      addPlayer(trimmed);
      setName("");
      vibrate(10);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
  };

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface safe-top safe-bottom">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => { setScreen("home"); vibrate(10); }}
          className="rounded-xl bg-card p-2.5 text-foreground"
          aria-label="Retour à l'accueil"
        >
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
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Prénom… (ex: Rivo, Haja, Fara)"
          maxLength={20}
          className="flex-1 rounded-xl bg-card px-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 border border-border focus:border-primary focus:outline-none transition-colors"
        />
        <button
          onClick={handleAdd}
          disabled={!name.trim() || players.length >= GAME_LIMITS.MAX_PLAYERS}
          className="rounded-xl gradient-primary p-3.5 text-primary-foreground disabled:opacity-30 transition-transform active:scale-95"
          aria-label="Ajouter le joueur"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Players list */}
      <div className="flex-1 space-y-2 mb-6 overflow-y-auto" role="list">
        <AnimatePresence>
          {players.map((player, i) => (
            <motion.div
              key={`${player.name}-${i}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              role="listitem"
              className="flex items-center gap-3 rounded-xl bg-card px-4 py-3"
            >
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: `hsl(${player.color} / 0.2)`, color: `hsl(${player.color})` }}
              >
                {player.name[0].toUpperCase()}
              </div>
              <span className="flex-1 font-medium text-foreground">{player.name}</span>
              <button
                onClick={() => removePlayer(i)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                aria-label={`Retirer ${player.name}`}
              >
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

        {players.length === 1 && (
          <p className="text-center text-sm text-muted-foreground/70 animate-pulse">
            Encore 1 joueur pour les modes party, ou continue pour un duel solo !
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {players.length >= GAME_LIMITS.MIN_PLAYERS && (
          <button
            onClick={() => { shufflePlayers(); vibrate(10); }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-card px-4 py-3 text-sm font-medium text-muted-foreground"
            aria-label="Mélanger l'ordre des joueurs"
          >
            <Shuffle size={16} /> Mélanger l'ordre
          </button>
        )}
        <button
          onClick={() => { setScreen("mode"); vibrate(10); }}
          disabled={players.length < 1}
          className="w-full rounded-2xl gradient-primary px-6 py-4 text-lg font-bold text-primary-foreground disabled:opacity-30 glow-primary transition-transform active:scale-95"
        >
          Continuer ({players.length}/{GAME_LIMITS.MAX_PLAYERS})
        </button>
      </div>
    </div>
  );
};

export default PlayersScreen;
