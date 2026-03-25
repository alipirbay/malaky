import { supabase } from "@/integrations/supabase/client";

export async function reportCard(cardText: string, mode: string | null, vibe: string | null): Promise<boolean> {
  try {
    const { error } = await supabase.from("card_reports" as any).insert({
      card_text: cardText,
      mode: mode ?? "unknown",
      vibe: vibe ?? "unknown",
      reason: "inappropriate",
    });
    return !error;
  } catch {
    return false;
  }
}
