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

/**
 * Dense repeating SVG pattern tiles per vibe.
 * Each tile is ~80x80 and repeats to fill the card.
 * Shapes are outline-only, themed to the vibe.
 */
const vibePatterns: Record<Vibe, string> = {
  // Soft: clouds, stars, butterflies, rainbows
  soft: `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='white' stroke-width='1.2' opacity='0.15'><circle cx='15' cy='15' r='5'/><circle cx='21' cy='15' r='5'/><circle cx='18' cy='11' r='5'/><path d='M55 12l2-4 2 4-2 2z'/><path d='M60 14l1.5-3 1.5 3-1.5 1.5z'/><circle cx='40' cy='45' r='4'/><circle cx='46' cy='45' r='4'/><circle cx='43' cy='41' r='4'/><path d='M12 55l3-5 3 5-3 3z'/><path d='M65 55a5 5 0 0 1 8 0' /><path d='M65 55a5 5 0 0 0 8 0'/><circle cx='35' cy='70' r='3'/><path d='M70 35l2-3 2 3-2 1.5z'/></g></svg>`)}")`,

  // Fun: party, confetti, balloons, smileys
  fun: `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='white' stroke-width='1.2' opacity='0.15'><circle cx='15' cy='15' r='6'/><circle cx='13' cy='13' r='1.5'/><circle cx='17' cy='13' r='1.5'/><path d='M12 17a4 4 0 0 0 6 0'/><path d='M50 10l-3 12 8-2z'/><rect x='55' y='8' width='4' height='4' rx='0.5' transform='rotate(15 57 10)'/><circle cx='35' cy='50' r='5'/><path d='M35 44v-5'/><path d='M65 45l2-4 2 4'/><path d='M62 48l2-4 2 4'/><rect x='8' y='55' width='5' height='5' rx='1' transform='rotate(20 10 57)'/><path d='M40 70l3-6 3 6'/><circle cx='70' cy='70' r='4'/><path d='M68 68r2'/><path d='M72 68r2'/></g></svg>`)}")`,

  // Hot: flames, lips, sparks
  hot: `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='white' stroke-width='1.2' opacity='0.15'><path d='M15 25Q15 15 20 10Q25 15 25 25Q20 30 15 25Z'/><path d='M50 20Q50 12 54 8Q58 12 58 20Q54 24 50 20Z'/><path d='M35 55Q38 48 41 55Q38 60 35 55Z'/><path d='M65 45Q65 37 69 33Q73 37 73 45Q69 49 65 45Z'/><path d='M10 60Q13 55 16 60Q13 64 10 60Z'/><path d='M55 65l2-4 2 4-2 2z'/><path d='M30 15l1.5-3 1.5 3-1.5 1.5z'/><circle cx='70' cy='15' r='3'/><path d='M42 35Q42 28 46 25Q50 28 50 35Q46 38 42 35Z'/></g></svg>`)}")`,

  // Chaos: skulls, lightning, explosions, danger
  chaos: `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='white' stroke-width='1.2' opacity='0.15'><path d='M12 20a7 7 0 1 1 14 0v3l-3 4h-8l-3-4z'/><circle cx='16' cy='18' r='1.5'/><circle cx='22' cy='18' r='1.5'/><path d='M55 8l-3 8 4-2 -2 10 5-8-4 2z'/><path d='M35 50l8 4-4 8-8-4z'/><path d='M65 40l-2 6 3-1-1 7 3-5-3 1z'/><path d='M10 60l5-5 5 5-5 5z'/><circle cx='50' cy='65' r='5'/><circle cx='48' cy='63' r='1.2'/><circle cx='52' cy='63' r='1.2'/><path d='M70 20l3 3-3 3-3-3z'/></g></svg>`)}")`,

  // Couple: hearts, rings, love letters
  couple: `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='white' stroke-width='1.2' opacity='0.15'><path d='M10 18Q13 12 16 18Q13 24 10 18Z'/><path d='M50 15Q54 8 58 15Q54 22 50 15Z'/><path d='M30 50Q33 44 36 50Q33 56 30 50Z'/><path d='M65 55Q67 51 69 55Q67 59 65 55Z'/><circle cx='70' cy='20' r='5'/><circle cx='76' cy='20' r='5'/><path d='M15 60Q18 55 21 60Q18 65 15 60Z'/><path d='M45 70Q47 66 49 70Q47 74 45 70Z'/><circle cx='40' cy='15' r='4'/><circle cx='44' cy='15' r='4'/><path d='M60 40Q62 36 64 40Q62 44 60 40Z'/><path d='M5 40Q7 36 9 40Q7 44 5 40Z'/></g></svg>`)}")`,

  // Apero: glasses, bottles, cheese, olives
  apero: `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='white' stroke-width='1.2' opacity='0.15'><path d='M12 8l-4 14 8 0zM12 22v8M8 30h8'/><circle cx='50' cy='15' r='5'/><path d='M50 20v6M46 26h8'/><path d='M35 50l-3 10 6 0zM35 60v5M32 65h6'/><path d='M65 35h8v-10l-8 3z'/><circle cx='15' cy='55' r='4'/><circle cx='70' cy='60' r='3'/><circle cx='55' cy='55' r='2.5'/><path d='M30 20a4 3 0 1 1 8 0v4h-8z'/><circle cx='65' cy='15' r='2'/></g></svg>`)}")`,

  // Mada: palm trees, lemurs, flowers, vanilla
  mada: `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='white' stroke-width='1.2' opacity='0.15'><path d='M15 35v-20'/><path d='M15 15Q8 10 5 15'/><path d='M15 15Q22 10 25 15'/><path d='M15 18Q10 14 8 18'/><path d='M15 18Q20 14 22 18'/><path d='M55 20a6 4 0 1 1 0 8l-3-4z'/><path d='M55 24h10'/><circle cx='35' cy='55' r='5'/><path d='M30 55l5-5M40 55l-5-5M35 50v-3M35 60v3M30 55h-2M40 55h2'/><path d='M65 50v-15'/><path d='M65 35Q58 30 55 35'/><path d='M65 35Q72 30 75 35'/><circle cx='15' cy='65' r='3'/></g></svg>`)}")`,

  // Confessions: masks, eyes, keys, whispers
  confessions: `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='white' stroke-width='1.2' opacity='0.15'><ellipse cx='15' cy='15' rx='8' ry='5'/><circle cx='12' cy='14' r='2'/><circle cx='18' cy='14' r='2'/><path d='M50 10a8 5 0 1 1 0 10h-4l-2-5z'/><path d='M30 55l2-8 3 0 2 8-3.5 3z'/><circle cx='33.5' cy='50' r='2'/><ellipse cx='65' cy='45' rx='7' ry='4'/><circle cx='62' cy='44' r='1.5'/><circle cx='68' cy='44' r='1.5'/><path d='M10 65l5 0 2 2-2 2-5 0-2-2z'/><circle cx='55' cy='65' r='4'/><path d='M53 64l4 0'/><path d='M55 62v4'/><path d='M70 20l-3 3'/><circle cx='70' cy='20' r='3'/></g></svg>`)}")`,

  // VIP: crowns, diamonds, champagne, stars
  vip: `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='white' stroke-width='1.2' opacity='0.15'><path d='M8 22l4-10 4 6 4-6 4 10z'/><path d='M50 15l2-5 2 3 2-3 2 5z'/><polygon points='35,45 37,51 43,51 38,55 40,61 35,57 30,61 32,55 27,51 33,51'/><path d='M65 35l1.5-4 1.5 2 1.5-2 1.5 4z'/><polygon points='15,60 16.5,64 20.5,64 17.5,67 18.5,71 15,68 11.5,71 12.5,67 9.5,64 13.5,64'/><path d='M55 60l-3 8 6 0z M55 68v4 M52 72h6'/><circle cx='70' cy='15' r='3'/><path d='M40 20l2 4-2 2-2-2z'/></g></svg>`)}")`,

  // After Dark: peaches, eggplants, devil horns, flames
  afterdark: `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='white' stroke-width='1.2' opacity='0.15'><path d='M10 25Q10 15 17 13Q18 18 20 15Q25 18 22 25Q17 30 10 25Z'/><path d='M50 15Q50 8 54 5Q58 8 58 15Q55 18 52 18Q50 17 50 15Z'/><path d='M35 55Q38 48 41 55Q38 60 35 55Z'/><path d='M30 55Q30 45 37 43Q38 48 40 45Q45 48 42 55Q37 60 30 55Z'/><path d='M60 50Q63 43 66 50Q63 55 60 50Z'/><path d='M65 40Q65 32 69 28Q73 32 73 40Q69 44 65 40Z'/><circle cx='15' cy='60' r='5'/><path d='M12 55Q10 50 15 50Q13 55 18 55'/><path d='M55 65l2-4 2 4-2 2z'/><path d='M10 40Q12 36 14 40Q12 44 10 40Z'/></g></svg>`)}")`,
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
              {/* Dense pattern background */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: vibePatterns[vibe.id], backgroundSize: "80px 80px" }}
              />

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
