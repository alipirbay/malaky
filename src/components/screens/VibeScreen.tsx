import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { VIBES } from "@/data/cards";
import { ArrowLeft, Lock } from "lucide-react";
import type { Vibe } from "@/data/cards";

const vibeStyles: Record<Vibe, string> = {
  soft: "vibe-soft",
  fun: "vibe-fun",
  hot: "vibe-hot",
  chaos: "vibe-chaos",
  couple: "vibe-couple",
  apero: "vibe-apero",
  mada: "vibe-mada",
  confessions: "vibe-confessions",
  vip: "vibe-vip",
  afterdark: "vibe-afterdark",
};

/* SVG outline shapes per vibe — subtle, outlined, like the Tia reference */
const vibeShapes: Record<Vibe, React.ReactNode> = {
  soft: (
    <svg viewBox="0 0 200 60" className="absolute right-0 top-0 h-full w-2/3 opacity-[0.10]" preserveAspectRatio="xMaxYMid slice">
      <circle cx="160" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="140" cy="40" r="5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M120 8 Q125 2 130 8 Q125 16 120 8Z" fill="none" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M175 35 L178 28 L181 35Z" fill="none" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="105" cy="28" r="3" fill="none" stroke="currentColor" strokeWidth="1"/>
      <path d="M150 25 l3-6 3 6-6 0z" fill="none" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),
  fun: (
    <svg viewBox="0 0 200 60" className="absolute right-0 top-0 h-full w-2/3 opacity-[0.10]" preserveAspectRatio="xMaxYMid slice">
      <path d="M155 10 l4-8 4 8-4 4z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="130" cy="42" r="6" fill="none" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M170 38 a5 5 0 1 1 10 0 a5 5 0 1 1-10 0" fill="none" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M110 15 l6 0 0 6-6 0z" fill="none" stroke="currentColor" strokeWidth="1.2" transform="rotate(20 113 18)"/>
      <path d="M185 15 l-3-6 3-2 3 2z" fill="none" stroke="currentColor" strokeWidth="1"/>
      <circle cx="145" cy="28" r="3" fill="none" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),
  hot: (
    <svg viewBox="0 0 200 60" className="absolute right-0 top-0 h-full w-2/3 opacity-[0.12]" preserveAspectRatio="xMaxYMid slice">
      <path d="M155 45 Q155 35 160 30 Q165 35 165 45 Q160 50 155 45Z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M130 12 Q130 5 134 2 Q138 5 138 12 Q134 16 130 12Z" fill="none" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M175 18 Q177 12 180 15 Q183 12 185 18 Q180 24 175 18Z" fill="none" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="115" cy="35" r="4" fill="none" stroke="currentColor" strokeWidth="1"/>
      <path d="M190 40 l3-5 3 5z" fill="none" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),
  chaos: (
    <svg viewBox="0 0 200 60" className="absolute right-0 top-0 h-full w-2/3 opacity-[0.10]" preserveAspectRatio="xMaxYMid slice">
      <path d="M155 10 l8 4-4 8-8-4z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M130 40 l10 0-5-10z" fill="none" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M175 30 l5-5 5 5-5 5z" fill="none" stroke="currentColor" strokeWidth="1.2"/>
      <line x1="110" y1="20" x2="120" y2="15" stroke="currentColor" strokeWidth="1.2"/>
      <line x1="115" y1="12" x2="115" y2="24" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="188" cy="45" r="4" fill="none" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),
  couple: (
    <svg viewBox="0 0 200 60" className="absolute right-0 top-0 h-full w-2/3 opacity-[0.12]" preserveAspectRatio="xMaxYMid slice">
      <path d="M150 20 Q153 14 156 20 Q153 26 150 20Z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M170 40 Q174 32 178 40 Q174 48 170 40Z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M125 38 Q128 33 131 38 Q128 43 125 38Z" fill="none" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M185 12 Q187 8 189 12 Q187 16 185 12Z" fill="none" stroke="currentColor" strokeWidth="1"/>
      <circle cx="140" cy="10" r="3" fill="none" stroke="currentColor" strokeWidth="1"/>
      <path d="M110 22 Q112 18 114 22 Q112 26 110 22Z" fill="none" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),
  apero: (
    <svg viewBox="0 0 200 60" className="absolute right-0 top-0 h-full w-2/3 opacity-[0.10]" preserveAspectRatio="xMaxYMid slice">
      <path d="M155 8 l-5 18 10 0z M155 26 l0 10 M150 36 l10 0" fill="none" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="130" cy="40" r="5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M175 35 l0-15 8 0 0 8-8 7z" fill="none" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="115" cy="18" r="3" fill="none" stroke="currentColor" strokeWidth="1"/>
      <circle cx="185" cy="14" r="2" fill="none" stroke="currentColor" strokeWidth="1"/>
      <circle cx="190" cy="48" r="3.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),
  mada: (
    <svg viewBox="0 0 200 60" className="absolute right-0 top-0 h-full w-2/3 opacity-[0.10]" preserveAspectRatio="xMaxYMid slice">
      <path d="M155 45 Q150 30 155 15 Q158 25 162 15 Q167 30 162 45z" fill="none" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="130" cy="15" r="5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M175 20 Q180 15 185 20 Q185 28 180 32 Q175 28 175 20Z" fill="none" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M115 38 l4-8 4 8z" fill="none" stroke="currentColor" strokeWidth="1"/>
      <circle cx="190" cy="45" r="3" fill="none" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),
  confessions: (
    <svg viewBox="0 0 200 60" className="absolute right-0 top-0 h-full w-2/3 opacity-[0.10]" preserveAspectRatio="xMaxYMid slice">
      <circle cx="155" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M151 18 a3 3 0 0 1 3-3 M155 18 a3 3 0 0 1 3 3" fill="none" stroke="currentColor" strokeWidth="1"/>
      <path d="M130 42 Q130 35 138 35 Q138 42 145 42 L130 50Z" fill="none" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="175" cy="38" r="5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M185 10 l0 8" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M181 14 l8 0" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="115" cy="25" r="3" fill="none" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),
  vip: (
    <svg viewBox="0 0 200 60" className="absolute right-0 top-0 h-full w-2/3 opacity-[0.12]" preserveAspectRatio="xMaxYMid slice">
      <path d="M150 25 l5-12 5 8 5-8 5 12z" fill="none" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M130 40 l3-6 3 2 3-2 3 6z" fill="none" stroke="currentColor" strokeWidth="1.2"/>
      <polygon points="180,10 182,16 188,16 183,20 185,26 180,22 175,26 177,20 172,16 178,16" fill="none" stroke="currentColor" strokeWidth="1"/>
      <circle cx="115" cy="18" r="4" fill="none" stroke="currentColor" strokeWidth="1"/>
      <path d="M188 42 l2-4 2 4z" fill="none" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),
  afterdark: (
    <svg viewBox="0 0 200 60" className="absolute right-0 top-0 h-full w-2/3 opacity-[0.10]" preserveAspectRatio="xMaxYMid slice">
      <path d="M155 45 Q150 35 155 25 Q158 32 160 25 Q165 35 160 45z" fill="none" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M130 15 Q133 8 136 15 Q133 20 130 15Z" fill="none" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="175" cy="35" r="6" fill="none" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M185 12 Q190 5 195 12 Q190 18 185 12Z" fill="none" stroke="currentColor" strokeWidth="1"/>
      <path d="M115 40 a8 8 0 0 1 12-6" fill="none" stroke="currentColor" strokeWidth="1"/>
      <circle cx="142" cy="42" r="3" fill="none" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),
};

const VibeScreen = () => {
  const { setVibe, setScreen, unlockedVibes } = useGameStore();

  const handleSelect = (vibe: Vibe, free: boolean) => {
    if (!free && !unlockedVibes[vibe]) {
      setScreen("packs");
      return;
    }
    setVibe(vibe);
    setTimeout(() => {
      useGameStore.getState().startGame();
    }, 0);
  };

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => setScreen("mode")} className="rounded-xl bg-card p-2.5 text-foreground">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">Choisis l'ambiance</h2>
          <p className="text-sm text-muted-foreground">Soft et Fun inclus. Les autres dans Packs.</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 pb-4 overflow-y-auto">
        {VIBES.map((vibe, i) => {
          const isUnlocked = vibe.free || unlockedVibes[vibe.id];

          return (
            <motion.button
              key={vibe.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleSelect(vibe.id, vibe.free)}
              className={`relative w-full rounded-2xl border-0 p-4 text-left overflow-hidden transition-transform active:scale-[0.97] ${vibeStyles[vibe.id]} ${
                isUnlocked ? "" : "opacity-80"
              }`}
            >
              {/* Decorative outlined shapes */}
              <div className="absolute inset-0 pointer-events-none select-none text-white/80">
                {vibeShapes[vibe.id]}
              </div>

              <div className="relative flex items-center gap-3">
                <span className="text-3xl">{vibe.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-foreground">{vibe.name}</h3>
                    {!isUnlocked && <Lock size={14} className="text-foreground/70" />}
                  </div>
                  <p className="text-xs text-foreground/70 truncate">{vibe.description}</p>
                </div>
                <span className="shrink-0 rounded-full bg-card/70 px-3 py-1 text-xs font-bold text-foreground">
                  {isUnlocked ? (vibe.free ? "Gratuit" : "✓") : vibe.priceLabel}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default VibeScreen;
