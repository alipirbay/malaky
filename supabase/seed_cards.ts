// Run ONCE: deno run --allow-net --allow-env supabase/seed_cards.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  truthPrompts, dareActions, neverBase, likelyBase,
  ratherA, ratherB, challengeActions, madaCardsMg,
} from "../src/data/card_content.ts";
import { cultureQuestions } from "../src/data/culture_questions.ts";

interface SeedRecord {
  mode: string;
  vibe: string;
  card_type: string;
  template: string;
  lang: string;
  source: string;
  answer?: string;
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const vibes = ["soft","fun","hot","chaos","couple","apero","mada","confessions","vip","afterdark"] as const;
const records: SeedRecord[] = [];

// truth_dare — vérités
vibes.forEach(vibe => {
  (truthPrompts[vibe] ?? []).forEach(p => {
    records.push({ mode: "truth_dare", vibe, card_type: "truth", template: `{player}, ${p}`, lang: "fr", source: "human" });
  });
});

// truth_dare — actions
vibes.forEach(vibe => {
  (dareActions[vibe] ?? []).forEach(p => {
    records.push({ mode: "truth_dare", vibe, card_type: "dare", template: `{player}, ${p}`, lang: "fr", source: "human" });
  });
});

// never_have_i_ever
vibes.forEach(vibe => {
  (neverBase[vibe] ?? []).forEach(p => {
    records.push({ mode: "never_have_i_ever", vibe, card_type: "vote", template: `Je n'ai jamais ${p}`, lang: "fr", source: "human" });
  });
});

// most_likely
vibes.forEach(vibe => {
  (likelyBase[vibe] ?? []).forEach(p => {
    records.push({ mode: "most_likely", vibe, card_type: "vote", template: `Entre {player} et {player2}, qui est le plus susceptible de ${p}`, lang: "fr", source: "human" });
  });
});

// would_you_rather — pair A/B
vibes.forEach(vibe => {
  const aList = ratherA[vibe] ?? [];
  const bList = ratherB[vibe] ?? [];
  const len = Math.min(aList.length, bList.length);
  for (let i = 0; i < len; i++) {
    records.push({ mode: "would_you_rather", vibe, card_type: "truth", template: `{player}, tu préfères ${aList[i]} ou ${bList[i]} ?`, lang: "fr", source: "human" });
  }
});

// quick_challenge
vibes.forEach(vibe => {
  (challengeActions[vibe] ?? []).forEach(p => {
    records.push({ mode: "quick_challenge", vibe, card_type: "timer", template: `{player}, ${p}`, lang: "fr", source: "human" });
  });
});

// culture_generale
(["facile","intermediaire","difficile","expert"] as const).forEach(diff => {
  (cultureQuestions[diff] ?? []).forEach(({ q, a }) => {
    records.push({ mode: "culture_generale", vibe: diff, card_type: "quiz", template: q, answer: a, lang: "fr", source: "human" });
  });
});


// mada bilingual
madaCardsMg.forEach(p => {
  records.push({ mode: "truth_dare", vibe: "mada", card_type: "truth", template: `{player}, ${p}`, lang: "mg", source: "human" });
});

// Insert in batches of 100
const BATCH = 100;
let inserted = 0;
for (let i = 0; i < records.length; i += BATCH) {
  const { error } = await supabase.from("cards").insert(records.slice(i, i + BATCH));
  if (error) console.error("Batch error:", error);
  else inserted += Math.min(BATCH, records.length - i);
}
console.log(`Seeded ${inserted}/${records.length} cards`);
