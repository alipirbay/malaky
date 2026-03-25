/**
 * Card text personalization utilities.
 * All placeholder replacement should go through this module.
 */

/**
 * Replaces {player} and {player2} placeholders in a card template.
 * - {player}  → currentPlayer (the active player for this card)
 * - {player2} → a random other player, or currentPlayer as fallback
 *
 * IMPORTANT: This must be called at RENDER TIME, not at deck-build time,
 * to ensure each card shows the correct current player based on rotation.
 */
export function fillCardTemplate(
  template: string,
  currentPlayer: string,
  allPlayers: string[]
): string {
  if (!template) return "";

  const otherPlayers = allPlayers.filter((p) => p !== currentPlayer);
  const player2 =
    otherPlayers.length > 0
      ? otherPlayers[Math.floor(Math.random() * otherPlayers.length)]
      : currentPlayer;

  let result = template.split("{player}").join(currentPlayer);
  result = result.split("{player2}").join(player2);
  return result;
}
