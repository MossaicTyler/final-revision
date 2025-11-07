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
}

// This is the source of truth for all products.
// All UI to display products should pull from this array.
// IDs passed to the checkout session should be the same as IDs from this array.
export const PRODUCTS: Product[] = [
  {
    id: "artisan-leather-journal",
    name: "Artisan Leather Journal",
    description: "Hand-stitched Italian leather journal with premium paper",
    priceInCents: 18900, // £189.00
    category: "Stationery",
    details:
      "Crafted from full-grain Italian leather with 200 pages of acid-free paper. Each journal is hand-stitched by master craftsmen.",
    images: [
      "/luxury-leather-journal-artisan.jpg",
      "/luxury-leather-journal-detail-stitching.jpg",
      "/luxury-leather-journal-open-pages.jpg",
      "/luxury-leather-journal-texture-closeup.jpg",
    ],
  },
  {
    id: "ceramic-tea-set",
    name: "Handmade Ceramic Tea Set",
    description: "Exclusive 5-piece ceramic tea set by renowned potter",
    priceInCents: 27900, // £279.00 (was £349.00)
    originalPriceInCents: 34900,
    onSale: true,
    category: "Home",
    details: "Each piece is individually thrown and glazed by hand. Includes teapot, four cups, and presentation box.",
    images: ["/luxury-ceramic-tea-set-handmade.jpg"],
  },
  {
    id: "brass-desk-lamp",
    name: "Heritage Brass Desk Lamp",
    description: "Vintage-inspired solid brass lamp with Edison bulb",
    priceInCents: 42900, // £429.00
    category: "Lighting",
    details:
      "Solid brass construction with hand-applied patina finish. Includes vintage-style Edison bulb and dimmer switch.",
    images: ["/vintage-brass-desk-lamp-luxury.jpg"],
  },
  {
    id: "wool-throw-blanket",
    name: "Merino Wool Throw",
    description: "Pure merino wool throw blanket, hand-woven",
    priceInCents: 19900, // £199.00 (was £289.00)
    originalPriceInCents: 28900,
    onSale: true,
    category: "Textiles",
    details: "Woven from 100% merino wool sourced from sustainable farms. Natural dyes create unique color variations.",
    images: ["/luxury-merino-wool-throw-blanket.jpg"],
  },
  {
    id: "fountain-pen",
    name: "Limited Edition Fountain Pen",
    description: "Handcrafted fountain pen with 18k gold nib",
    priceInCents: 89900, // £899.00
    category: "Stationery",
    details: "Precision-engineered with ebonite body and 18k gold nib. Limited to 500 pieces worldwide.",
    images: ["/luxury-fountain-pen-gold-nib.jpg"],
  },
  {
    id: "wooden-cutting-board",
    name: "Walnut Cutting Board",
    description: "End-grain walnut cutting board with brass handles",
    priceInCents: 17900, // £179.00 (was £249.00)
    originalPriceInCents: 24900,
    onSale: true,
    category: "Kitchen",
    details: "Crafted from sustainably harvested black walnut. End-grain construction protects knife edges.",
    images: ["/luxury-walnut-cutting-board-brass.jpg"],
  },
  {
    id: "silk-scarf",
    name: "Hand-Painted Silk Scarf",
    description: "Luxurious silk scarf with hand-painted botanical design",
    priceInCents: 19900, // £199.00
    category: "Textiles",
    details: "100% mulberry silk with hand-painted design. Each scarf is unique with slight variations in pattern.",
    images: ["/luxury-hand-painted-silk-scarf-botanical.jpg"],
  },
  {
    id: "porcelain-vase",
    name: "Artisan Porcelain Vase",
    description: "Hand-thrown porcelain vase with celadon glaze",
    priceInCents: 32900, // £329.00
    category: "Home",
    details: "Traditional celadon glaze technique passed down through generations. Each piece is one-of-a-kind.",
    images: ["/luxury-artisan-porcelain-vase-celadon-glaze.jpg"],
  },
  {
    id: "leather-briefcase",
    name: "Executive Leather Briefcase",
    description: "Full-grain leather briefcase with brass hardware",
    priceInCents: 39900, // £399.00 (was £549.00)
    originalPriceInCents: 54900,
    onSale: true,
    category: "Accessories",
    details: "Handcrafted from vegetable-tanned leather. Features multiple compartments and laptop sleeve.",
    images: ["/luxury-executive-leather-briefcase-brass-hardware.jpg"],
  },
  {
    id: "crystal-decanter",
    name: "Lead Crystal Decanter",
    description: "Hand-cut lead crystal decanter with stopper",
    priceInCents: 39900, // £399.00
    category: "Home",
    details: "Traditional hand-cutting techniques create intricate patterns. 24% lead crystal for exceptional clarity.",
    images: ["/luxury-hand-cut-lead-crystal-decanter.jpg"],
  },
  {
    id: "cashmere-sweater",
    name: "Pure Cashmere Sweater",
    description: "Luxurious cashmere sweater from Scottish mills",
    priceInCents: 42900, // £429.00
    category: "Textiles",
    details: "Knitted from Grade A Mongolian cashmere. Timeless design that improves with age.",
    images: ["/luxury-pure-cashmere-sweater-scottish.jpg"],
  },
  {
    id: "marble-bookends",
    name: "Carrara Marble Bookends",
    description: "Hand-carved Carrara marble bookends with brass inlay",
    priceInCents: 27900, // £279.00
    category: "Home",
    details: "Carved from authentic Carrara marble. Brass geometric inlay adds modern elegance.",
    images: ["/luxury-carrara-marble-bookends-brass-inlay.jpg"],
  },
  {
    id: "leather-watch-box",
    name: "Leather Watch Box",
    description: "Handcrafted leather watch storage for 6 timepieces",
    priceInCents: 34900, // £349.00
    category: "Accessories",
    details: "Premium leather exterior with velvet-lined compartments. Includes lock and key.",
    images: ["/luxury-leather-watch-box-storage-case.jpg"],
  },
  {
    id: "copper-cookware-set",
    name: "Copper Cookware Set",
    description: "Professional copper cookware set with tin lining",
    priceInCents: 89900, // £899.00
    category: "Kitchen",
    details: "Hand-hammered copper with traditional tin lining. Includes 5 essential pieces.",
    images: ["/luxury-copper-cookware-set-professional.jpg"],
  },
  {
    id: "reading-lamp",
    name: "Architect's Reading Lamp",
    description: "Adjustable brass reading lamp with marble base",
    priceInCents: 37900, // £379.00
    category: "Lighting",
    details: "Solid brass construction with weighted marble base. Fully adjustable arm and shade.",
    images: ["/luxury-brass-reading-lamp-marble-base-architect.jpg"],
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
