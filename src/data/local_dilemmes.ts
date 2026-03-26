/**
 * Pool de dilemmes locaux — Actualité & opinions malgaches.
 * 
 * Rotation quotidienne déterministe basée sur le jour de l'année.
 * Ces dilemmes sont conçus pour être CLIVANTS et ENGAGEANTS :
 * politique, économie, société, culture, sport.
 * 
 * Mis à jour régulièrement. Le serveur AI peut aussi en générer.
 */

export interface LocalDilemme {
  question: string;
  option_a: string;
  option_b: string;
  topic: string;
}

export const LOCAL_DILEMMES: LocalDilemme[] = [
  // ═══════════════════════════════════════
  // 🏛️ POLITIQUE
  // ═══════════════════════════════════════
  {
    question: "Êtes-vous satisfait de la gouvernance actuelle de Madagascar ?",
    option_a: "Oui, ça avance",
    option_b: "Non, c'est pire",
    topic: "politique",
  },
  {
    question: "Faut-il limiter le mandat présidentiel à un seul mandat de 7 ans ?",
    option_a: "Oui, un seul mandat",
    option_b: "Non, garder 2 mandats",
    topic: "politique",
  },
  {
    question: "La décentralisation à Madagascar, ça marche vraiment ?",
    option_a: "Oui, ça progresse",
    option_b: "Non, Tana décide tout",
    topic: "politique",
  },
  {
    question: "Faut-il élire les chefs de région au suffrage universel ?",
    option_a: "Oui, plus démocratique",
    option_b: "Non, risque de division",
    topic: "politique",
  },
  {
    question: "Les députés malgaches font-ils correctement leur travail ?",
    option_a: "Oui, ils représentent",
    option_b: "Non, ils s'enrichissent",
    topic: "politique",
  },
  {
    question: "Madagascar devrait-elle se rapprocher davantage de la Chine ou de la France ?",
    option_a: "La Chine",
    option_b: "La France",
    topic: "politique",
  },
  {
    question: "Faut-il interdire les partis politiques basés sur l'ethnie ?",
    option_a: "Oui, pour l'unité",
    option_b: "Non, liberté politique",
    topic: "politique",
  },
  {
    question: "Le Sénat malgache est-il utile ?",
    option_a: "Oui, il est nécessaire",
    option_b: "Non, à supprimer",
    topic: "politique",
  },
  {
    question: "Madagascar devrait-elle rejoindre les BRICS ?",
    option_a: "Oui, diversifier",
    option_b: "Non, rester neutre",
    topic: "politique",
  },
  {
    question: "La HCC (Haute Cour Constitutionnelle) est-elle vraiment indépendante ?",
    option_a: "Oui, elle est neutre",
    option_b: "Non, elle est politique",
    topic: "politique",
  },

  // ═══════════════════════════════════════
  // 💰 ÉCONOMIE
  // ═══════════════════════════════════════
  {
    question: "Pour ou contre le changement de l'Ariary en nouvelle monnaie ?",
    option_a: "Pour, il faut changer",
    option_b: "Contre, ça sert à rien",
    topic: "économie",
  },
  {
    question: "L'Ariary va-t-il continuer à perdre de la valeur ?",
    option_a: "Oui, c'est inévitable",
    option_b: "Non, ça va se stabiliser",
    topic: "économie",
  },
  {
    question: "Faut-il nationaliser les mines de Madagascar ?",
    option_a: "Oui, nos richesses",
    option_b: "Non, besoin d'investisseurs",
    topic: "économie",
  },
  {
    question: "Le prix du riz devrait-il être fixé par l'État ?",
    option_a: "Oui, c'est vital",
    option_b: "Non, marché libre",
    topic: "économie",
  },
  {
    question: "Madagascar pourrait-elle devenir un hub tech en Afrique ?",
    option_a: "Oui, on a le potentiel",
    option_b: "Non, trop de retard",
    topic: "économie",
  },
  {
    question: "Les zones franches profitent-elles vraiment aux Malgaches ?",
    option_a: "Oui, ça crée des emplois",
    option_b: "Non, c'est de l'exploitation",
    topic: "économie",
  },
  {
    question: "Faut-il augmenter le SMIG à 300 000 Ar ?",
    option_a: "Oui, c'est trop bas",
    option_b: "Non, les entreprises ferment",
    topic: "économie",
  },
  {
    question: "L'inflation à Madagascar est-elle contrôlable ?",
    option_a: "Oui, avec bonne gestion",
    option_b: "Non, c'est structurel",
    topic: "économie",
  },
  {
    question: "Faut-il taxer davantage les produits importés ?",
    option_a: "Oui, protéger le local",
    option_b: "Non, ça augmente les prix",
    topic: "économie",
  },
  {
    question: "La vanille malgache nous enrichit-elle vraiment ?",
    option_a: "Oui, fierté nationale",
    option_b: "Non, que les exportateurs",
    topic: "économie",
  },

  // ═══════════════════════════════════════
  // 🤝 SOCIÉTÉ
  // ═══════════════════════════════════════
  {
    question: "Voyez-vous un avenir positif pour Madagascar ?",
    option_a: "Oui, je suis optimiste",
    option_b: "Non, c'est mal parti",
    topic: "société",
  },
  {
    question: "Les jeunes Malgaches ont-ils raison de vouloir partir à l'étranger ?",
    option_a: "Oui, zéro opportunité ici",
    option_b: "Non, il faut rester bâtir",
    topic: "société",
  },
  {
    question: "Le système éducatif malgache prépare-t-il bien les jeunes ?",
    option_a: "Oui, il est correct",
    option_b: "Non, il est obsolète",
    topic: "société",
  },
  {
    question: "Le Fihavanana est-il encore une réalité à Madagascar ?",
    option_a: "Oui, c'est notre force",
    option_b: "Non, chacun pour soi",
    topic: "société",
  },
  {
    question: "Faut-il rendre le malgache langue unique d'enseignement ?",
    option_a: "Oui, fierté nationale",
    option_b: "Non, garder le français",
    topic: "société",
  },
  {
    question: "Les réseaux sociaux font-ils plus de bien ou de mal à Madagascar ?",
    option_a: "Plus de bien",
    option_b: "Plus de mal",
    topic: "société",
  },
  {
    question: "L'insécurité à Madagascar s'améliore-t-elle ?",
    option_a: "Oui, ça s'améliore",
    option_b: "Non, c'est pire",
    topic: "société",
  },
  {
    question: "Le dahalo est-il un problème culturel ou économique ?",
    option_a: "Culturel",
    option_b: "Économique",
    topic: "société",
  },
  {
    question: "Les Malgaches sont-ils trop dépendants de l'aide internationale ?",
    option_a: "Oui, trop dépendants",
    option_b: "Non, on en a besoin",
    topic: "société",
  },
  {
    question: "TikTok influence-t-il trop la jeunesse malgache ?",
    option_a: "Oui, c'est toxique",
    option_b: "Non, c'est juste fun",
    topic: "société",
  },
  {
    question: "Le mariage avant 18 ans devrait-il être plus sévèrement puni ?",
    option_a: "Oui, tolérance zéro",
    option_b: "Non, c'est culturel",
    topic: "société",
  },
  {
    question: "Les coupures de Jirama sont-elles acceptables en 2026 ?",
    option_a: "Non, inacceptable",
    option_b: "Normal, on s'y fait",
    topic: "société",
  },
  {
    question: "Tana est-elle une ville vivable ?",
    option_a: "Oui, malgré les défauts",
    option_b: "Non, c'est invivable",
    topic: "société",
  },
  {
    question: "Les embouteillages de Tana vont-ils un jour se résoudre ?",
    option_a: "Oui, avec des projets",
    option_b: "Non, c'est foutu",
    topic: "société",
  },
  {
    question: "Le famadihana devrait-il être modernisé ou préservé tel quel ?",
    option_a: "Modernisé",
    option_b: "Préservé intact",
    topic: "société",
  },

  // ═══════════════════════════════════════
  // ⚽ SPORT
  // ═══════════════════════════════════════
  {
    question: "Les Barea peuvent-ils se qualifier pour la prochaine CAN ?",
    option_a: "Oui, on y croit !",
    option_b: "Non, soyons réalistes",
    topic: "sport",
  },
  {
    question: "Le football malgache a-t-il progressé depuis 2019 ?",
    option_a: "Oui, nette progression",
    option_b: "Non, on stagne",
    topic: "sport",
  },
  {
    question: "Faut-il investir plus dans le sport scolaire à Madagascar ?",
    option_a: "Oui, priorité absolue",
    option_b: "Non, l'éducation d'abord",
    topic: "sport",
  },

  // ═══════════════════════════════════════
  // 💻 TECH
  // ═══════════════════════════════════════
  {
    question: "Internet à Madagascar est-il trop cher ?",
    option_a: "Oui, beaucoup trop",
    option_b: "Non, c'est raisonnable",
    topic: "technologie",
  },
  {
    question: "Telma, Orange ou Airtel : qui a le meilleur réseau ?",
    option_a: "Telma",
    option_b: "Orange / Airtel",
    topic: "technologie",
  },
  {
    question: "L'IA va-t-elle supprimer des emplois à Madagascar ?",
    option_a: "Oui, beaucoup",
    option_b: "Non, pas chez nous",
    topic: "technologie",
  },
  {
    question: "Faut-il enseigner le code informatique dès le primaire ?",
    option_a: "Oui, c'est l'avenir",
    option_b: "Non, d'autres priorités",
    topic: "technologie",
  },

  // ═══════════════════════════════════════
  // 🌍 ENVIRONNEMENT
  // ═══════════════════════════════════════
  {
    question: "La déforestation à Madagascar peut-elle être stoppée ?",
    option_a: "Oui, si on agit",
    option_b: "Non, c'est trop tard",
    topic: "environnement",
  },
  {
    question: "Faut-il interdire totalement le charbon de bois ?",
    option_a: "Oui, pour les forêts",
    option_b: "Non, les gens cuisinent avec",
    topic: "environnement",
  },
  {
    question: "Le tourisme sauve-t-il ou détruit-il l'environnement malgache ?",
    option_a: "Il sauve (revenus)",
    option_b: "Il détruit (pollution)",
    topic: "environnement",
  },

  // ═══════════════════════════════════════
  // 🎭 CULTURE
  // ═══════════════════════════════════════
  {
    question: "La culture gasy se perd-elle chez les jeunes ?",
    option_a: "Oui, gravement",
    option_b: "Non, elle évolue",
    topic: "culture",
  },
  {
    question: "Le cinéma malgache peut-il rivaliser avec Nollywood ?",
    option_a: "Oui, on a le talent",
    option_b: "Non, pas les moyens",
    topic: "culture",
  },
  {
    question: "La musique trap/drill gasy : évolution ou déclin culturel ?",
    option_a: "Évolution positive",
    option_b: "Déclin culturel",
    topic: "culture",
  },
  {
    question: "Faut-il plus de contenus en malgache sur Internet ?",
    option_a: "Oui, absolument",
    option_b: "Le français suffit",
    topic: "culture",
  },
  {
    question: "Les fady ont-ils encore leur place en 2026 ?",
    option_a: "Oui, c'est notre identité",
    option_b: "Non, c'est dépassé",
    topic: "culture",
  },
];

/**
 * Sélectionne le dilemme du jour basé sur la date.
 * Déterministe : même date = même dilemme.
 */
export function getLocalDilemmeForDate(dateStr: string): LocalDilemme {
  // Hash simple de la date string pour un index déterministe
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % LOCAL_DILEMMES.length;
  return LOCAL_DILEMMES[index];
}
