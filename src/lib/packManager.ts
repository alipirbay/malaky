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

interface RawPackCard {
  id?: string;
  mode?: string;
  vibe?: string;
  card_type?: string;
  template?: string;
  answer?: string;
  lang?: string;
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
    let meta: PackMeta[] = [];
    try {
      meta = JSON.parse(localStorage.getItem(PACK_META_KEY) || "[]");
      if (!Array.isArray(meta)) meta = [];
    } catch { meta = []; }

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
    const parsed: RawPackCard[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
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
