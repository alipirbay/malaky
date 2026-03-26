import type { GameCard, Vibe, StoredCard } from "@/data/types";
import { GAME_LIMITS } from "@/data/constants";
import { storageGet, storageSet, storageKeys } from "@/lib/storage";

const PACK_KEY_PREFIX = "pack-";
const PACK_META_KEY = "packs-meta";

interface PackMeta {
  vibe: Vibe;
  downloadedAt: string;
  cardCount: number;
  version: number;
}

/**
 * Vérifie si un pack est téléchargé localement.
 */
export function isPackDownloaded(vibe: Vibe): boolean {
  return storageGet<StoredCard[] | null>(`${PACK_KEY_PREFIX}${vibe}`, null) !== null;
}

/**
 * Télécharge un pack depuis la DB et le stocke localement.
 */
export async function downloadPack(vibe: Vibe): Promise<boolean> {
  try {
    const { supabase } = await import("@/integrations/supabase/client");

    const { data, error } = await supabase
      .from("cards")
      .select("id, mode, vibe, card_type, template, answer, lang")
      .eq("vibe", vibe)
      .eq("active", true)
      .limit(1000);

    if (error || !data?.length) return false;

    storageSet(`${PACK_KEY_PREFIX}${vibe}`, data);

    // Update metadata
    const meta = storageGet<PackMeta[]>(PACK_META_KEY, []);
    const existing = meta.findIndex(m => m.vibe === vibe);
    const newMeta: PackMeta = {
      vibe,
      downloadedAt: new Date().toISOString(),
      cardCount: data.length,
      version: 1,
    };
    if (existing >= 0) meta[existing] = newMeta;
    else meta.push(newMeta);
    storageSet(PACK_META_KEY, meta);

    return true;
  } catch (e) {
    console.warn("[downloadPack] Failed:", e);
    return false;
  }
}

/**
 * Récupérer les cartes d'un pack téléchargé.
 */
export function getDownloadedPackCards(vibe: Vibe): GameCard[] {
  const parsed = storageGet<StoredCard[]>(`${PACK_KEY_PREFIX}${vibe}`, []);
  return parsed.map((c, i) => ({
    id: c.id ?? `pack-${vibe}-${i}`,
    mode: (c.mode ?? "truth_dare") as GameCard["mode"],
    vibe: (c.vibe ?? vibe) as Vibe,
    lang: (c.lang ?? "fr") as "fr" | "mg",
    card_type: (c.card_type ?? "truth") as GameCard["card_type"],
    text: c.template ?? "",
    answer: c.answer ?? undefined,
    requires_prop: "none" as const,
    player_min: 2,
    player_max: GAME_LIMITS.MAX_PLAYERS,
  }));
}

/**
 * Taille totale des packs téléchargés.
 */
export function getPacksStorageSize(): string {
  let total = 0;
  try {
    const keys = storageKeys(PACK_KEY_PREFIX);
    for (const key of keys) {
      const raw = localStorage.getItem(`malaky-${key}`);
      if (raw) total += raw.length;
    }
  } catch {
    return "0 B";
  }
  if (total < 1024) return `${total} B`;
  if (total < 1024 * 1024) return `${(total / 1024).toFixed(1)} KB`;
  return `${(total / (1024 * 1024)).toFixed(1)} MB`;
}
