import type { GameMode, Vibe } from "./types";

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
    id: "dilemme" as GameMode,
    name: "Dilemme",
    subtitle: "Deux choix, zéro échappatoire",
    emoji: "⚖️",
    badge: "Impossible",
    color: "coral" as const,
  },
];

export const VIBES = [
  { id: "soft" as Vibe, name: "Soft", emoji: "😇", description: "Famille, tout public", tag: "famille", free: true, priceLabel: "Gratuit" },
  { id: "fun" as Vibe, name: "Fun", emoji: "😏", description: "Entre amis, léger et drôle", tag: "amis", free: true, priceLabel: "Gratuit" },
  { id: "hot" as Vibe, name: "Hot", emoji: "🔥", description: "Soirée, plus osé", tag: "soirée", free: false, priceLabel: "9 900 Ar" },
  { id: "chaos" as Vibe, name: "Chaos", emoji: "💀", description: "Dangereux, zéro filtre", tag: "dangereux", free: false, priceLabel: "7 900 Ar" },
  { id: "couple" as Vibe, name: "Couple", emoji: "💕", description: "Romantique et intime", tag: "couple", free: false, priceLabel: "6 900 Ar" },
  { id: "apero" as Vibe, name: "Apéro", emoji: "🍻", description: "Before, fête, désinhibé", tag: "fête", free: false, priceLabel: "5 900 Ar" },
  { id: "mada" as Vibe, name: "Mada", emoji: "🇲🇬", description: "100% culture malgache", tag: "malgache", free: false, priceLabel: "4 900 Ar" },
  { id: "confessions" as Vibe, name: "Confessions", emoji: "🎭", description: "Secrets profonds, vérités", tag: "secrets", free: false, priceLabel: "7 900 Ar" },
  { id: "vip" as Vibe, name: "VIP", emoji: "👑", description: "Premium, ego, provocant", tag: "premium", free: false, priceLabel: "9 900 Ar" },
  { id: "afterdark" as Vibe, name: "After Dark", emoji: "🔞", description: "18+, sans aucun filtre", tag: "18+", free: false, priceLabel: "12 900 Ar" },
];

export const STORE_PACKS = [
  { id: "hot", vibe: "hot" as Vibe, name: "Pack Hot 🔥", emoji: "🔥", description: "Soirée osée et séduction", price: "9 900 Ar", priceValue: 9900, cardCount: 900, free: false },
  { id: "chaos", vibe: "chaos" as Vibe, name: "Pack Chaos 💀", emoji: "💀", description: "Dangereux, zéro filtre", price: "7 900 Ar", priceValue: 7900, cardCount: 900, free: false },
  { id: "couple", vibe: "couple" as Vibe, name: "Pack Couple 💕", emoji: "💕", description: "Pour les couples, romantique et intime", price: "6 900 Ar", priceValue: 6900, cardCount: 900, free: false },
  { id: "apero", vibe: "apero" as Vibe, name: "Pack Apéro 🍻", emoji: "🍻", description: "Before, fête et délire", price: "5 900 Ar", priceValue: 5900, cardCount: 900, free: false },
  { id: "mada", vibe: "mada" as Vibe, name: "Pack Mada 🇲🇬", emoji: "🇲🇬", description: "Culture malgache, taxi-be, mofo gasy", price: "4 900 Ar", priceValue: 4900, cardCount: 900, free: false },
  { id: "confessions", vibe: "confessions" as Vibe, name: "Pack Confessions 🎭", emoji: "🎭", description: "Secrets profonds et vérités cachées", price: "7 900 Ar", priceValue: 7900, cardCount: 900, free: false },
  { id: "vip", vibe: "vip" as Vibe, name: "Pack VIP 👑", emoji: "👑", description: "Questions premium, ego et pouvoir", price: "9 900 Ar", priceValue: 9900, cardCount: 900, free: false },
  { id: "afterdark", vibe: "afterdark" as Vibe, name: "Pack After Dark 🔞", emoji: "🔞", description: "18+, le plus osé, sans aucun filtre", price: "12 900 Ar", priceValue: 12900, cardCount: 900, free: false },
  { id: "bundle_hot_chaos", vibe: null, name: "Bundle Hot + Chaos 🎁", emoji: "🎁", description: "Les deux classiques payants", price: "15 000 Ar", priceValue: 15000, cardCount: 1800, free: false },
  { id: "bundle_all", vibe: null, name: "Mega Bundle 💎", emoji: "💎", description: "TOUS les packs au meilleur prix", price: "49 900 Ar", priceValue: 49900, cardCount: 7200, free: false },
] as const;
