export interface Region {
  code: string
  name: string
  currency: string
  currencySymbol: string
  locale: string
  flag: string
  countryCode: string
}

export const REGIONS: Region[] = [
  { code: "GB", name: "United Kingdom", currency: "GBP", currencySymbol: "£", locale: "en-GB", flag: "🇬🇧", countryCode: "GB" },
  { code: "US", name: "United States", currency: "USD", currencySymbol: "$", locale: "en-US", flag: "🇺🇸", countryCode: "US" },
  { code: "EU", name: "European Union", currency: "EUR", currencySymbol: "€", locale: "en-EU", flag: "🇪🇺", countryCode: "FR" }, // EU defaults to France
  { code: "AU", name: "Australia", currency: "AUD", currencySymbol: "$", locale: "en-AU", flag: "🇦🇺", countryCode: "AU" },
  { code: "JP", name: "Japan", currency: "JPY", currencySymbol: "¥", locale: "ja-JP", flag: "🇯🇵", countryCode: "JP" },
  { code: "SG", name: "Singapore", currency: "SGD", currencySymbol: "$", locale: "en-SG", flag: "🇸🇬", countryCode: "SG" },
  { code: "CA", name: "Canada", currency: "CAD", currencySymbol: "$", locale: "en-CA", flag: "🇨🇦", countryCode: "CA" },
  { code: "DE", name: "Germany", currency: "EUR", currencySymbol: "€", locale: "de-DE", flag: "🇩🇪", countryCode: "DE" },
  { code: "FR", name: "France", currency: "EUR", currencySymbol: "€", locale: "fr-FR", flag: "🇫🇷", countryCode: "FR" },
]

export function getRegionByCode(code: string): Region | undefined {
  return REGIONS.find((r) => r.code === code)
}

export function detectUserRegion(): string {
  if (typeof window === "undefined") return "GB"

  // Try to detect from browser language
  const language = navigator.language
  if (language.startsWith("en-US")) return "US"
  if (language.startsWith("en-AU")) return "AU"
  if (language.startsWith("en-CA")) return "CA"
  if (language.startsWith("en-SG")) return "SG"
  if (language.startsWith("ja")) return "JP"
  if (language.startsWith("de")) return "DE"
  if (language.startsWith("fr")) return "FR"

  // Default to GB
  return "GB"
}

export function formatPrice(priceInCents: number, regionCode: string): string {
  const region = getRegionByCode(regionCode)
  if (!region) return `£${(priceInCents / 100).toFixed(2)}`

  return new Intl.NumberFormat(region.locale, {
    style: "currency",
    currency: region.currency,
  }).format(priceInCents / 100)
}

export function getRegionalPrice(product: { priceInCents: number; regionalPricing?: Record<string, { price: number }> }, regionCode: string): number {
  // If the product has regional pricing for this region, use it
  if (product.regionalPricing && product.regionalPricing[regionCode]) {
    return product.regionalPricing[regionCode].price
  }
  
  // Otherwise, return the default price
  return product.priceInCents
}

export function getAllowedShippingCountries(regionCode: string): string[] {
  const region = getRegionByCode(regionCode)
  if (!region) return ["GB"] // Default fallback
  
  // For specific regions that should lock shipping to their country
  const restrictedRegions = ["JP", "SG", "CA", "US", "FR", "DE"]
  
  if (restrictedRegions.includes(regionCode)) {
    return [region.countryCode]
  }
  
  // For other regions, allow multiple countries (GB, AU, EU regions)
  if (regionCode === "GB") {
    return ["GB", "IE"]
  }
  
  if (regionCode === "AU") {
    return ["AU", "NZ"]
  }
  
  if (regionCode === "EU") {
    // EU region allows shipping to all EU countries
    return ["FR", "DE", "IT", "ES", "NL", "BE", "AT", "PT", "SE", "DK", "NO", "FI", "IE"]
  }
  
  // Default to the region's country code
  return [region.countryCode]
}
