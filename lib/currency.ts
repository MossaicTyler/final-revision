export const SUPPORTED_CURRENCIES = {
  GBP: { symbol: "£", name: "British Pound", locale: "en-GB" },
} as const

export type Currency = keyof typeof SUPPORTED_CURRENCIES

export function detectUserCurrency(): Currency {
  return "GBP"
}

export function formatPrice(priceInCents: number, currency: Currency = "GBP"): string {
  const currencyInfo = SUPPORTED_CURRENCIES[currency]
  return new Intl.NumberFormat(currencyInfo.locale, {
    style: "currency",
    currency: currency,
  }).format(priceInCents / 100)
}

export function convertPrice(priceInCents: number): number {
  return priceInCents
}
