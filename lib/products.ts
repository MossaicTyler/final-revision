export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  images?: string[]
  category: string
  details?: string
  originalPriceInCents?: number // Original price before discount
  onSale?: boolean // Whether product is on sale
  maxStock?: number // Maximum available quantity (defaults to 100)
  regionalPricing?: Record<
    string,
    {
      price: number // Manual price in local currency (in cents)
      originalPrice?: number // Manual original price (in cents)
      name?: string // Localized name
      description?: string // Localized description
      details?: string // Localized details
    }
  >
}

// This is the source of truth for all products.
// All UI to display products should pull from this array.
// IDs passed to the checkout session should be the same as IDs from this array.
export const PRODUCTS: Product[] = [
  {
    id: "mochi-pig",
    name: "Mochi the Running Pig",
    description: "Mochi the Running Pig animated by momentum",
    priceInCents: 2500, // £25.00
    category: "Running Boars",
    details: "Not a toy, but a totem of tenderness, designed to elevate the everyday.",
    images: ["/mochi.jpg", "/mochi-2.jpg"],
    maxStock: 50,
    regionalPricing: {
      US: { price: 3200 },
      DE: { price: 2900, name: "Mochi das Laufschwein", description: "Mochi das Laufschwein animiert durch Schwung" },
      AU: { price: 4800 },
      JP: { price: 4500 },
      SG: { price: 4200 },
      CA: { price: 4300 },
      EU: { price: 2900 },
      FR: { price: 2900 },
    },
  },
  {
    id: "speckles-the-spotted-pig",
    name: "Speckles the Spotted Pig",
    description: "Speckles the Spotted Pig animated by momentum!",
    priceInCents: 2500, // £25.00 (was £31.00)
    originalPriceInCents: 3100,
    onSale: true,
    category: "Running Boars",
    details:
      'Meet the Spotted Trotter, the pinnacle of plush artistry from our acclaimed "Running Series." This is not merely a toy; it is a sculptural piece, a tactile comfort, and a whimsical narrative captured in the most exquisite materials.',
    images: ["/speckles-the-spotted-pig.jpg", "/speckles-the-spotted-pig-2.jpg"],
    maxStock: 30,
    regionalPricing: {
      US: { price: 3200 , originalPrice: 3800 },
      DE: { price: 2900 , originalPrice: 3500 },
      AU: { price: 4800 , originalPrice: 5400 },
      JP: { price: 4500 , originalPrice: 5100 },
      SG: { price: 4200 , originalPrice: 4800 },
      CA: { price: 4300 , originalPrice: 4900 },
      EU: { price: 2900 , originalPrice: 3500 },
      FR: { price: 2900 , originalPrice: 3500 },
    },
  },
  {
    id: "gullin-the-walnut-boar",
    name: "Gullin the Walnut Boar",
    description: "Gullin the Walnut Boar animated by momentum!",
    priceInCents: 2600, // £26.00 (was £35.00)
    originalPriceInCents: 3500,
    onSale: true,
    category: "Running Boars",
    details:
      "Gullin settles into your arms with a grounding, comforting presence, perfect for alleviating anxiety or as a sleep companion.",
    images: ["/gullin-the-walnut-boar.jpg"],
    maxStock: 25,
    regionalPricing: {
      US: { price: 3300, originalPrice: 4450 },
      EU: { price: 3000, originalPrice: 4050 },
      AU: { price: 4900, originalPrice: 6600 },
      JP: { price: 4700, originalPrice: 6300 },
      SG: { price: 4400, originalPrice: 5900 },
      CA: { price: 4450, originalPrice: 6000 },
      DE: { price: 3000, originalPrice: 4050 },
      FR: { price: 3000, originalPrice: 4050 },
    },
  },
  {
    id: "bartholomew-the-barley-boar",
    name: "Bartholomew the Barley Boar",
    description: "Bartholomew the Barley Boar animated by momentum!",
    priceInCents: 2600, // £26.00 (was £35.00)
    originalPriceInCents: 3500,
    onSale: true,
    category: "Running Boars",
    details: 'Bartho can be captured in a graceful, dynamic "trot," his pose is one of gentle momentum and quiet joy.',
    images: ["/bartholomew-the-barley-boar.jpg"],
    maxStock: 25,
    regionalPricing: {
      US: { price: 3300, originalPrice: 4450 },
      EU: { price: 3000, originalPrice: 4050 },
      AU: { price: 4900, originalPrice: 6600 },
      JP: { price: 4700, originalPrice: 6300 },
      SG: { price: 4400, originalPrice: 5900 },
      CA: { price: 4450, originalPrice: 6000 },
      DE: { price: 3000, originalPrice: 4050 },
      FR: { price: 3000, originalPrice: 4050 },
    },
  },
  {
    id: "sunny-charm",
    name: "Sunny Charm",
    description: "Not merely a plush, but a portable sunbeam",
    priceInCents: 1500, // £15.00
    category: "Charms",
    details: "A treasured token designed to dispel grey skies and bring a touch of handmade warmth to every moment.",
    images: ["/sunny-charm.jpg"],
    maxStock: 100,
    regionalPricing: {
      US: { price: 1900 },
      EU: { price: 1750 },
      AU: { price: 2850 },
      JP: { price: 2700 },
      SG: { price: 2550 },
      CA: { price: 2600 },
      DE: { price: 1750 },
      FR: { price: 1750 },
    },
  },
  {
    id: "sunniette-red-bow-charm",
    name: "Sunniette Charm (Red Bow)",
    description: "Not merely a plush, but a portable sunbeam",
    priceInCents: 1500, // £15.00
    category: "Charms",
    details: "A treasured token designed to dispel grey skies and bring a touch of handmade warmth to every moment.",
    images: ["/sunniette-red-bow-charm.jpg"],
    maxStock: 100,
    regionalPricing: {
      US: { price: 1900 },
      EU: { price: 1750 },
      AU: { price: 2850 },
      JP: { price: 2700 },
      SG: { price: 2550 },
      CA: { price: 2600 },
      DE: { price: 1750 },
      FR: { price: 1750 },
    },
  },
  {
    id: "sunniette-pink-bow-charm",
    name: "Sunniette Charm (Pink Bow)",
    description: "Not merely a plush, but a portable sunbeam",
    priceInCents: 1800, // £18.00
    category: "Charms",
    details: "A treasured token designed to dispel grey skies and bring a touch of handmade warmth to every moment.",
    images: ["/sunniette-pink-bow-charm.jpg"],
    maxStock: 100,
    regionalPricing: {
      US: { price: 2300 },
      EU: { price: 2100 },
      AU: { price: 3400 },
      JP: { price: 3250 },
      SG: { price: 3050 },
      CA: { price: 3100 },
      DE: { price: 2100 },
      FR: { price: 2100 },
    },
  },
  {
    id: "sunniette-brown-bow-charm",
    name: "Sunniette Charm (Brown Bow)",
    description: "Not merely a plush, but a portable sunbeam",
    priceInCents: 1500, // £15.00
    category: "Charms",
    details: "A treasured token designed to dispel grey skies and bring a touch of handmade warmth to every moment.",
    images: ["/sunniette-brown-bow-charm.jpg"],
    maxStock: 100,
    regionalPricing: {
      US: { price: 1900 },
      EU: { price: 1750 },
      AU: { price: 2850 },
      JP: { price: 2700 },
      SG: { price: 2550 },
      CA: { price: 2600 },
      DE: { price: 1750 },
      FR: { price: 1750 },
    },
  },
  {
    id: "sunniette-blue-bow-charm",
    name: "Sunniette Charm (Blue Bow)",
    description: "Not merely a plush, but a portable sunbeam",
    priceInCents: 1500, // £15.00
    category: "Charms",
    details: "A treasured token designed to dispel grey skies and bring a touch of handmade warmth to every moment.",
    images: ["/sunniette-blue-bow-charm.jpg"],
    maxStock: 100,
    regionalPricing: {
      US: { price: 1900 },
      EU: { price: 1750 },
      AU: { price: 2850 },
      JP: { price: 2700 },
      SG: { price: 2550 },
      CA: { price: 2600 },
      DE: { price: 1750 },
      FR: { price: 1750 },
    },
  },
  {
    id: "sunniette-black-bow-charm",
    name: "Sunniette Charm (Black Bow)",
    description: "Not merely a plush, but a portable sunbeam",
    priceInCents: 1500, // £15.00
    category: "Charms",
    details: "A treasured token designed to dispel grey skies and bring a touch of handmade warmth to every moment.",
    images: ["/sunniette-black-bow-charm.jpg"],
    maxStock: 100,
    regionalPricing: {
      US: { price: 1900 },
      EU: { price: 1750 },
      AU: { price: 2850 },
      JP: { price: 2700 },
      SG: { price: 2550 },
      CA: { price: 2600 },
      DE: { price: 1750 },
      FR: { price: 1750 },
    },
  },
  {
    id: "sunny-swimming-charm",
    name: "Sunny Charm (Swimming Goggles)",
    description: "Not merely a plush, but a portable sunbeam",
    priceInCents: 1800, // £18.00
    category: "Charms",
    details: "A treasured token designed to dispel grey skies and bring a touch of handmade warmth to every moment.",
    images: ["/sunny-swimming-charm.jpg"],
    maxStock: 100,
    regionalPricing: {
      US: { price: 2300 },
      EU: { price: 2100 },
      AU: { price: 3400 },
      JP: { price: 3250 },
      SG: { price: 3050 },
      CA: { price: 3100 },
      DE: { price: 2100 },
      FR: { price: 2100 },
    },
  },
  {
    id: "sunny-football-charm",
    name: "Sunny Charm (Football)",
    description: "Not merely a plush, but a portable sunbeam",
    priceInCents: 1800, // £18.00
    category: "Charms",
    details: "A treasured token designed to dispel grey skies and bring a touch of handmade warmth to every moment.",
    images: ["/sunny-football-charm.jpg"],
    maxStock: 100,
    regionalPricing: {
      US: { price: 2300 },
      EU: { price: 2100 },
      AU: { price: 3400 },
      JP: { price: 3250 },
      SG: { price: 3050 },
      CA: { price: 3100 },
      DE: { price: 2100 },
      FR: { price: 2100 },
    },
  },
  {
    id: "sunny-basketball-charm",
    name: "Sunny Charm (Basketball)",
    description: "Not merely a plush, but a portable sunbeam",
    priceInCents: 1800, // £18.00
    category: "Charms",
    details: "A treasured token designed to dispel grey skies and bring a touch of handmade warmth to every moment.",
    images: ["/sunny-basketball-charm.jpg"],
    maxStock: 100,
    regionalPricing: {
      US: { price: 2300 },
      EU: { price: 2100 },
      AU: { price: 3400 },
      JP: { price: 3250 },
      SG: { price: 3050 },
      CA: { price: 3100 },
      DE: { price: 2100 },
      FR: { price: 2100 },
    },
  },
  {
    id: "sunny-table-tennis-charm",
    name: "Sunny Charm (Table Tennis)",
    description: "Not merely a plush, but a portable sunbeam",
    priceInCents: 1800, // £18.00
    category: "Charms",
    details: "A treasured token designed to dispel grey skies and bring a touch of handmade warmth to every moment.",
    images: ["/sunny-table-tennis-charm.jpg"],
    maxStock: 100,
    regionalPricing: {
      US: { price: 2300 },
      EU: { price: 2100 },
      AU: { price: 3400 },
      JP: { price: 3250 },
      SG: { price: 3050 },
      CA: { price: 3100 },
      DE: { price: 2100 },
      FR: { price: 2100 },
    },
  },
]

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id)
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "Sale") {
    return PRODUCTS.filter((p) => p.onSale)
  }
  return PRODUCTS.filter((p) => p.category === category)
}

export function getAllCategories(): string[] {
  const categories = Array.from(new Set(PRODUCTS.map((p) => p.category)))
  const hasSaleItems = PRODUCTS.some((p) => p.onSale)
  if (hasSaleItems) {
    return ["Sale", ...categories]
  }
  return categories
}

export function getProductWithPrice(id: string, priceInCents?: number): Product | undefined {
  const product = PRODUCTS.find((p) => p.id === id)
  if (!product) return undefined

  if (priceInCents !== undefined) {
    return { ...product, priceInCents }
  }

  return product
}

export function getProductMaxStock(productId: string): number {
  const product = PRODUCTS.find((p) => p.id === productId)
  return product?.maxStock ?? 100 // Default to 100 if not specified
}
