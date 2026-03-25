import { supabase } from "@/integrations/supabase/client";

export async function reportCard(cardText: string, mode: string | null, vibe: string | null): Promise<boolean> {
  try {
    const { error } = await supabase.from("card_reports").insert({
      card_text: cardText,
      mode: mode ?? "unknown",
      vibe: vibe ?? "unknown",
      reason: "inappropriate",
    });
    return !error;
  } catch (err) {
    console.error("Failed to report card:", err);
    return false;
  }
}
