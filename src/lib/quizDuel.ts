/**
 * Quiz Duel utilities: deterministic QCM generation with smart distractors, seeded shuffle, scoring.
 */
import type { Difficulty } from "@/data/types";
import { cultureQuestions, type QuizEntry } from "@/data/culture_questions";

export interface DuelQuestion {
  question: string;
  correctAnswer: string;
  options: string[]; // 4 options, shuffled deterministically
}

/**
 * Seeded pseudo-random number generator (mulberry32).
 */
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function hashSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash;
}

// ──────────────────────────────────────────────────────────
// Answer-type classification for smart distractors
// ──────────────────────────────────────────────────────────

type AnswerType = "year" | "number" | "person" | "country" | "city" | "animal" | "instrument" | "body" | "monument" | "element" | "movie" | "music" | "food" | "concept" | "general";

function classifyAnswer(answer: string, question: string): AnswerType {
  const a = answer.toLowerCase();
  const q = question.toLowerCase();
  
  // Year detection (e.g. "1789", "1960")
  if (/^\d{3,4}$/.test(a.trim())) return "year";
  if (/^(environ\s+)?\d/.test(a) && /année|siècle|date|quand/i.test(q)) return "year";
  
  // Number detection
  if (/^\d+(\s*(%))?$/.test(a.trim()) || /^(environ\s+)?\d/.test(a) && /combien/i.test(q)) return "number";
  
  // Country
  if (/pays|nation|état|continent/i.test(q) || /^(la |le |l'|les )?(france|japon|brésil|inde|chine|algérie|turquie|russie|canada|italie|jamaïque|argentine|mauritanie|eswatini|éthiopie|vatican|monaco)/i.test(a)) return "country";
  
  // City
  if (/capitale|ville/i.test(q) || /^(antananarivo|tokyo|canberra|thimphou|paris|rome|berlin|washington)/i.test(a)) return "city";
  
  // Person
  if (/qui a|quel.*compositeur|quel.*acteur|quel.*réalisateur|quel.*scientifique|quel.*philosophe|quel.*roi|quel.*reine|quel.*président|quel.*musicien|quel.*artiste|quel.*chanteur|quel.*rappeur|quel.*explorateur/i.test(q)) return "person";
  if (/^(louis|napoléon|einstein|beethoven|mozart|mandela|gandhi|christophe|alexander|watson|darwin|victor|charlie|tom|brad|steven|alfred|akira|orson|daniel|christopher|quentin|bong)/i.test(a)) return "person";
  
  // Animal
  if (/animal|espèce|prédateur|primate|lémurien|caméléon|insecte|oiseau/i.test(q)) return "animal";
  
  // Instrument
  if (/instrument|valiha|piano|guitare|trompette|flûte/i.test(q) || /instrument/i.test(q)) return "instrument";
  
  // Body / organ
  if (/organe|corps|os|squelette|chromosome/i.test(q)) return "body";
  
  // Food
  if (/plat|cuisine|nourriture|boisson|romazava/i.test(q) || /plat|cuisine/i.test(q)) return "food";
  
  // Monument / place
  if (/monument|bâtiment|palais|forêt|parc|allée|fosse|lac|canal|détroit|chaîne/i.test(q)) return "monument";
  
  // Chemical element
  if (/élément|chimique|symbole|gaz|métal/i.test(q)) return "element";
  
  // Movie
  if (/film|cinéma|oscar|réalis/i.test(q)) return "movie";
  
  // Music
  if (/album|chanson|genre musical|musique|compositeur|opéra/i.test(q)) return "music";
  
  return "general";
}

// Pools of plausible distractors by type
const DISTRACTOR_POOLS: Record<AnswerType, string[]> = {
  year: ["1789", "1815", "1848", "1914", "1918", "1939", "1945", "1947", "1957", "1960", "1969", "1990", "1791", "1648", "1206", "1337", "1453", "1513", "1885", "1922", "1953", "2001"],
  number: ["4", "6", "8", "12", "18", "23", "27", "46", "50", "100", "206", "300 000", "80%", "90%"],
  person: [
    "Napoléon Bonaparte", "Louis XIV", "Victor Hugo", "Albert Einstein", "Isaac Newton",
    "Marie Curie", "Christophe Colomb", "Léonard de Vinci", "Charles Darwin", "Galilée",
    "Mozart", "Beethoven", "Shakespeare", "Voltaire", "Socrate", "Platon", "Aristote",
    "Gandhi", "Mandela", "Martin Luther King", "Jules César", "Alexandre le Grand",
    "Cléopâtre", "Gengis Khan", "Marco Polo", "Machiavel", "Victor Schœlcher",
    "Tom Hanks", "Brad Pitt", "Steven Spielberg", "Alfred Hitchcock", "Stanley Kubrick",
    "Andrianampoinimerina", "Ranavalona III", "Philibert Tsiranana", "Rajery", "Poopy",
  ],
  country: [
    "La France", "Le Japon", "Le Brésil", "L'Inde", "La Chine", "L'Algérie", "Le Maroc",
    "L'Égypte", "L'Italie", "L'Allemagne", "La Russie", "Le Canada", "L'Argentine",
    "L'Australie", "Le Mexique", "La Turquie", "L'Afrique du Sud", "Le Kenya",
    "L'URSS", "Les États-Unis", "Le Royaume-Uni", "L'Espagne", "Le Portugal",
    "Madagascar", "La Jamaïque", "La Mauritanie", "L'Éthiopie", "Monaco",
  ],
  city: [
    "Paris", "Tokyo", "New York", "Londres", "Berlin", "Rome", "Pékin", "Moscou",
    "Le Caire", "Buenos Aires", "Sydney", "Canberra", "Antananarivo", "Nairobi",
    "Thimphou", "Brasilia", "Ottawa", "Washington", "Madrid", "Lisbonne",
  ],
  animal: [
    "Le lémurien", "Le caméléon", "L'éléphant", "Le lion", "Le fossa", "L'aye-aye",
    "Le requin", "La baleine", "Le dauphin", "Le gorille", "Le panda", "Le tigre",
    "L'aigle", "Le crocodile", "La tortue", "L'hippopotame", "Le guépard",
  ],
  instrument: [
    "La valiha", "Le piano", "La guitare", "Le violon", "La contrebasse", "La flûte",
    "La trompette", "Le saxophone", "La harpe", "Le tambour", "L'orgue", "Le banjo",
  ],
  body: [
    "Le cœur", "Le foie", "Le cerveau", "Les poumons", "Le pancréas", "Les reins",
    "L'estomac", "La peau", "Le proton", "Le neutron", "L'électron",
  ],
  food: [
    "Le romazava", "Le ravitoto", "Le koba ravina", "Le vary amin'anana", "Les sambosa",
    "Le couscous", "La paella", "Le sushi", "Le curry", "Le tiramisu",
  ],
  monument: [
    "Les Tsingy de Bemaraha", "L'allée des Baobabs", "Le Rova", "Isalo", "Le Taj Mahal",
    "La Tour Eiffel", "Le Colisée", "La Grande Muraille", "Le canal de Suez",
    "Le canal de Panama", "Le lac Baïkal", "La fosse des Mariannes", "La mer Morte",
  ],
  element: [
    "L'hydrogène", "L'oxygène", "Le carbone", "Le fer", "L'or", "L'argent",
    "Le mercure", "Le cuivre", "Le bismuth", "L'uranium", "Le plomb", "Le sodium",
  ],
  movie: [
    "Titanic", "Avatar", "Star Wars", "Jurassic Park", "Le Parrain", "Pulp Fiction",
    "Inception", "Interstellar", "Parasite", "Toy Story", "Le Roi Lion", "Forrest Gump",
    "Fight Club", "Matrix", "Le Voyage de Chihiro", "Citizen Kane", "Tabataba",
  ],
  music: [
    "Le rock", "Le jazz", "Le reggae", "La samba", "Le tango", "Le salegy", "Le tsapiky",
    "Le hip-hop", "La pop", "Le blues", "Le classique", "Le funk", "Le R&B",
  ],
  concept: [
    "Le fihavanana", "Le famadihana", "Le kabary", "Les fady", "Le betsabetsa",
  ],
  general: [],
};

/**
 * Generate smart distractors that match the answer type.
 */
function generateSmartDistractors(
  correctAnswer: string,
  question: string,
  allEntries: QuizEntry[],
  rng: () => number,
  count: number = 3
): string[] {
  const answerType = classifyAnswer(correctAnswer, question);
  const result: string[] = [];
  const seen = new Set<string>([correctAnswer.toLowerCase()]);
  
  // 1. First try: same answer type from same pool
  const typePool = DISTRACTOR_POOLS[answerType];
  if (typePool.length > 0) {
    const shuffledPool = seededShuffle(typePool, rng);
    for (const candidate of shuffledPool) {
      if (result.length >= count) break;
      if (!seen.has(candidate.toLowerCase())) {
        seen.add(candidate.toLowerCase());
        result.push(candidate);
      }
    }
  }
  
  // 2. Second try: answers from questions with the same classified type
  if (result.length < count) {
    const sameTypeAnswers = allEntries
      .filter(e => e.a !== correctAnswer && classifyAnswer(e.a, e.q) === answerType)
      .map(e => e.a);
    const shuffledSameType = seededShuffle(sameTypeAnswers, rng);
    for (const candidate of shuffledSameType) {
      if (result.length >= count) break;
      if (!seen.has(candidate.toLowerCase())) {
        seen.add(candidate.toLowerCase());
        result.push(candidate);
      }
    }
  }
  
  // 3. Fallback: any other answers from the pool
  if (result.length < count) {
    const allAnswers = allEntries.map(e => e.a);
    const shuffledAll = seededShuffle(allAnswers, rng);
    for (const candidate of shuffledAll) {
      if (result.length >= count) break;
      if (!seen.has(candidate.toLowerCase())) {
        seen.add(candidate.toLowerCase());
        result.push(candidate);
      }
    }
  }
  
  return result;
}

/**
 * Generate a set of duel questions deterministically from a seed.
 */
export function generateDuelQuestions(
  difficulty: Difficulty,
  seed: string,
  count: number = 10
): DuelQuestion[] {
  const allEntries = cultureQuestions[difficulty] || cultureQuestions.facile;
  const rng = mulberry32(hashSeed(seed));
  const shuffledEntries = seededShuffle(allEntries, rng);
  const selected = shuffledEntries.slice(0, Math.min(count, shuffledEntries.length));

  return selected.map((entry) => {
    const distractors = generateSmartDistractors(entry.a, entry.q, allEntries, rng);
    const options = seededShuffle([entry.a, ...distractors], rng);
    return {
      question: entry.q,
      correctAnswer: entry.a,
      options,
    };
  });
}

/**
 * Generate a short, readable invite code.
 */
export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Get or create a persistent device ID.
 */
export function getDeviceId(): string {
  const KEY = "malaky-device-id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

/**
 * Scoring: compare two attempts.
 */
export interface DuelAttempt {
  score: number;
  timeMs: number;
  playerName: string;
}

export type DuelResult = "win" | "lose" | "draw";

export function computeDuelResult(
  myAttempt: DuelAttempt,
  opponentAttempt: DuelAttempt
): DuelResult {
  if (myAttempt.score > opponentAttempt.score) return "win";
  if (myAttempt.score < opponentAttempt.score) return "lose";
  // Tie-break by time (lower is better)
  if (myAttempt.timeMs < opponentAttempt.timeMs) return "win";
  if (myAttempt.timeMs > opponentAttempt.timeMs) return "lose";
  return "draw";
}

export function formatTimeMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}
