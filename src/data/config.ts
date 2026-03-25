import type { GameMode, Vibe, Difficulty } from "./types";

export const GAME_MODES = [
  {
    id: "truth_dare" as GameMode,
    name: "Action ou Vérité",
    subtitle: "Avoue ou ose",
    emoji: "🔥",
    badge: "Hilarant",
    color: "coral" as const,
  },
  {
    id: "never_have_i_ever" as GameMode,
    name: "Je n'ai jamais",
    subtitle: "Qui l'a déjà fait ?",
    emoji: "🙈",
    badge: "Confessionnel",
    color: "primary" as const,
  },
  {
    id: "most_likely" as GameMode,
    name: "Qui est le plus…",
    subtitle: "Vote et débat",
    emoji: "👆",
    badge: "Social",
    color: "mango" as const,
  },
  {
    id: "would_you_rather" as GameMode,
    name: "Tu préfères ?",
    subtitle: "Choix impossibles",
    emoji: "🤔",
    badge: "Intense",
    color: "primary" as const,
  },
  {
    id: "quick_challenge" as GameMode,
    name: "Défis express",
    subtitle: "Chrono, pas de pitié",
    emoji: "⚡",
    badge: "Rapide",
    color: "mango" as const,
  },
  {
    id: "culture_generale" as GameMode,
    name: "Culture Générale",
    subtitle: "Teste tes connaissances",
    emoji: "🧠",
    badge: "Quiz",
    color: "primary" as const,
  },
  {
    id: "tsimoa" as GameMode,
    name: "Mode Tsimoa",
    subtitle: "Fin d'année, zéro retenue",
    emoji: "🎊",
    badge: "Saisonnier",
    color: "mango" as const,
  },
];

export const VIBES = [
  { id: "soft" as Vibe, name: "Soft", emoji: "😇", description: "Famille, tout public", tag: "famille", free: true, priceLabel: "Gratuit" },
  { id: "fun" as Vibe, name: "Fun", emoji: "😏", description: "Entre amis, léger et drôle", tag: "amis", free: true, priceLabel: "Gratuit" },
  { id: "hot" as Vibe, name: "Hot", emoji: "🔥", description: "Soirée, plus osé", tag: "soirée", free: false, priceLabel: "9 900 Ar" },
  { id: "chaos" as Vibe, name: "Chaos", emoji: "💀", description: "Dangereux, zéro filtre", tag: "dangereux", free: false, priceLabel: "7 900 Ar" },
  { id: "couple" as Vibe, name: "Couple", emoji: "💕", description: "Romantique et intime", tag: "couple", free: false, priceLabel: "7 900 Ar" },
  { id: "apero" as Vibe, name: "Apéro", emoji: "🍻", description: "Before, fête, désinhibé", tag: "fête", free: false, priceLabel: "5 900 Ar" },
  { id: "mada" as Vibe, name: "Mada", emoji: "🇲🇬", description: "100% gasy, pour vrais Malgaches", tag: "malgache", free: false, priceLabel: "7 900 Ar" },
  { id: "confessions" as Vibe, name: "Confessions", emoji: "🎭", description: "Secrets profonds, vérités", tag: "secrets", free: false, priceLabel: "7 900 Ar" },
  { id: "vip" as Vibe, name: "VIP", emoji: "👑", description: "Premium, ego, provocant", tag: "premium", free: false, priceLabel: "9 900 Ar" },
  { id: "afterdark" as Vibe, name: "After Dark", emoji: "🔞", description: "18+, sans aucun filtre", tag: "18+", free: false, priceLabel: "12 900 Ar" },
];

export const DIFFICULTIES = [
  { id: "facile" as Difficulty, name: "Facile", emoji: "🟢", description: "Questions accessibles pour tous", free: true, priceLabel: "Gratuit" },
  { id: "intermediaire" as Difficulty, name: "Intermédiaire", emoji: "🟡", description: "Un cran au-dessus, il faut réfléchir", free: true, priceLabel: "Gratuit" },
  { id: "difficile" as Difficulty, name: "Difficile", emoji: "🟠", description: "Pour les vrais connaisseurs", free: false, priceLabel: "5 900 Ar" },
  { id: "expert" as Difficulty, name: "Expert", emoji: "🔴", description: "Seuls les érudits survivent", free: false, priceLabel: "7 900 Ar" },
];

export const STORE_PACKS = [
  { id: "hot", vibe: "hot" as Vibe, name: "Pack Hot 🔥", emoji: "🔥", description: "Soirée osée et séduction", price: "9 900 Ar", priceValue: 9900, cardCount: 900, free: false },
  { id: "chaos", vibe: "chaos" as Vibe, name: "Pack Chaos 💀", emoji: "💀", description: "Dangereux, zéro filtre", price: "7 900 Ar", priceValue: 7900, cardCount: 900, free: false },
  { id: "couple", vibe: "couple" as Vibe, name: "Pack Couple 💕", emoji: "💕", description: "Pour les couples, romantique et intime", price: "7 900 Ar", priceValue: 7900, cardCount: 900, free: false },
  { id: "apero", vibe: "apero" as Vibe, name: "Pack Apéro 🍻", emoji: "🍻", description: "Before, fête et délire", price: "5 900 Ar", priceValue: 5900, cardCount: 900, free: false },
  { id: "mada", vibe: "mada" as Vibe, name: "Pack Mada 🇲🇬", emoji: "🇲🇬", description: "100% culture malgache, authentique", price: "7 900 Ar", priceValue: 7900, cardCount: 900, free: false },
  { id: "confessions", vibe: "confessions" as Vibe, name: "Pack Confessions 🎭", emoji: "🎭", description: "Secrets profonds et vérités cachées", price: "7 900 Ar", priceValue: 7900, cardCount: 900, free: false },
  { id: "vip", vibe: "vip" as Vibe, name: "Pack VIP 👑", emoji: "👑", description: "Questions premium, ego et pouvoir", price: "9 900 Ar", priceValue: 9900, cardCount: 900, free: false },
  { id: "afterdark", vibe: "afterdark" as Vibe, name: "Pack After Dark 🔞", emoji: "🔞", description: "18+, le plus osé, sans aucun filtre", price: "12 900 Ar", priceValue: 12900, cardCount: 900, free: false },
  { id: "difficile", vibe: "difficile" as Vibe, name: "Culture G Difficile 🟠", emoji: "🟠", description: "Questions pour connaisseurs", price: "5 900 Ar", priceValue: 5900, cardCount: 160, free: false },
  { id: "expert", vibe: "expert" as Vibe, name: "Culture G Expert 🔴", emoji: "🔴", description: "Le niveau ultime de culture générale", price: "7 900 Ar", priceValue: 7900, cardCount: 160, free: false },
  { id: "bundle_all", vibe: null, name: "Mega Bundle 💎", emoji: "💎", description: "TOUS les packs au meilleur prix", price: "34 900 Ar", priceValue: 34900, cardCount: 7200, free: false },
] as const;
