import ratesData from '../../data/rates.json'

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD'

const rates = ratesData.rates as Record<CurrencyCode, number>

// all rates are relative to USD (USD BASE), so we go through USD as the middle step
export function convertCurrency(amount: number, from: CurrencyCode, to: CurrencyCode): number {
  if (from === to) return amount
  const fromRate = rates[from]
  const toRate = rates[to]
  if (!fromRate || !toRate) return 0
  return (amount * fromRate) / toRate
}

// shorthand for converting to USD used in stats when summing across currencies
export function toUSD(amount: number, from: CurrencyCode): number {
  return convertCurrency(amount, from, 'USD')
}

// formats a number as a display string
export function formatCurrency(amount: number, currency: CurrencyCode): string {
  return `${currency} $${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
