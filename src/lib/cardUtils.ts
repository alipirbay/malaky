/**
 * Card text personalization utilities.
 * All placeholder replacement should go through this module.
 *
 * IMPORTANT: {player2} selection must be DETERMINISTIC for a given
 * (cardIndex, currentPlayer) pair so the text doesn't flicker on rerenders.
 */

/**
 * Extracts the "semantic core" of a card text for anti-duplicate comparison.
 * Strips player placeholders, common prefixes, and normalizes.
 */
export function getCardContentHash(text: string): string {
  const normalized = text
    // Remove player placeholders
    .replace(/\{player\d?\}/gi, "")
    .replace(/\{player\}/gi, "")
    .replace(/\{player2\}/gi, "")
    // Remove common prefixes that don't change meaning
    .replace(/^(Je n'ai jamais |Levez la main si vous avez déjà |Qui ici a déjà |As-tu déjà )/i, "")
    .replace(/^(Qui est le plus susceptible de |Entre .+ et .+, qui est le plus susceptible de )/i, "")
    .replace(/^(Selon .+, qui ici pourrait |.+, d'après toi qui va |.+, devine qui dans le groupe va )/i, "")
    .replace(/^(Tu préfères |.+, tu préfères )/i, "")
    // Normalize
    .replace(/[.,!?;:\s]+$/g, "")
    .replace(/^[,\s]+/, "")
    .trim()
    .toLowerCase();

  return normalized;
}

/**
 * Simple deterministic hash for seeding player2 selection.
 * Uses card index to ensure different cards pick different player2.
 */
function stableIndex(cardIndex: number, poolSize: number): number {
  if (poolSize <= 0) return 0;
  // Mix bits a little to spread selection
  const h = ((cardIndex + 1) * 2654435761) >>> 0;
  return h % poolSize;
}

/**
 * Replaces {player} and {player2} placeholders in a card template.
 * - {player}  → currentPlayer (the active player for this card)
 * - {player2} → a deterministic other player based on cardIndex, or currentPlayer as fallback
 *
 * The cardIndex parameter ensures that player2 is STABLE across rerenders
 * for the same card, while still varying across different cards.
 */
export function fillCardTemplate(
  template: string,
  currentPlayer: string,
  allPlayers: string[],
  cardIndex = 0
): string {
  if (!template) return "";

  const otherPlayers = allPlayers.filter((p) => p !== currentPlayer);
  const player2 =
    otherPlayers.length > 0
      ? otherPlayers[stableIndex(cardIndex, otherPlayers.length)]
      : currentPlayer;

  let result = template.split("{player}").join(currentPlayer);
  result = result.split("{player2}").join(player2);
  return result;
}
