/**
 * Returns a color string based on gain or loss:
 * - Green (`#00ff00`) for profit
 * - Red (`#ff4444`) for loss
 * - Gray for no change
 *
 * @param gainLoss - The numeric gain or loss value
 * @returns A hex or named color string
 */
export default function getGainLossColor(gainLoss: number): string {
  if (gainLoss > 0) return '#00ff00' // profit
  if (gainLoss < 0) return '#ff4444' // loss
  return 'gray' // neutral
}
