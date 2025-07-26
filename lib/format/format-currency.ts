/**
 * Formats a number as USD currency with two decimal places.
 *
 * @param amount - The numeric amount to format
 * @returns A string formatted as USD currency (e.g., "$1,234.56")
 */
export default function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
