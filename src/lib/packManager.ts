import type { GameCard, Vibe } from "@/data/types";
import { GAME_LIMITS } from "@/data/constants";

const PACK_STORAGE_PREFIX = "malaky-pack-";
const PACK_META_KEY = "malaky-packs-meta";

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
  try {
    return localStorage.getItem(`${PACK_STORAGE_PREFIX}${vibe}`) !== null;
  } catch {
    return false;
  }
}

/**
 * Télécharge un pack depuis la DB et le stocke localement.
 * Appelé UNE SEULE FOIS après l'achat. Ensuite c'est offline forever.
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

    localStorage.setItem(`${PACK_STORAGE_PREFIX}${vibe}`, JSON.stringify(data));

    // Update metadata
    const meta: PackMeta[] = JSON.parse(localStorage.getItem(PACK_META_KEY) || "[]");
    const existing = meta.findIndex(m => m.vibe === vibe);
    const newMeta: PackMeta = {
      vibe,
      downloadedAt: new Date().toISOString(),
      cardCount: data.length,
      version: 1,
    };
    if (existing >= 0) meta[existing] = newMeta;
    else meta.push(newMeta);
    localStorage.setItem(PACK_META_KEY, JSON.stringify(meta));

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
  try {
    const raw = localStorage.getItem(`${PACK_STORAGE_PREFIX}${vibe}`);
    if (!raw) return [];
    return JSON.parse(raw).map((c: any, i: number) => ({
      id: c.id ?? `pack-${vibe}-${i}`,
      mode: c.mode,
      vibe: c.vibe ?? vibe,
      lang: (c.lang ?? "fr") as "fr" | "mg",
      card_type: c.card_type,
      text: c.template,
      answer: c.answer ?? undefined,
      requires_prop: "none" as const,
      player_min: 2,
      player_max: GAME_LIMITS.MAX_PLAYERS,
    }));
  } catch {
    return [];
  }
}

/**
 * Taille totale des packs téléchargés.
 */
export function getPacksStorageSize(): string {
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(PACK_STORAGE_PREFIX)) {
        total += (localStorage.getItem(key) || "").length;
      }
    }
  } catch {
    return "0 B";
  }
  if (total < 1024) return `${total} B`;
  if (total < 1024 * 1024) return `${(total / 1024).toFixed(1)} KB`;
  return `${(total / (1024 * 1024)).toFixed(1)} MB`;
}
