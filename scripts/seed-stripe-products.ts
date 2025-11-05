import Stripe from "stripe"
import { PRODUCTS } from "../lib/products"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

async function seedProducts() {
  console.log("[v0] Starting Stripe product seeding...")

  for (const product of PRODUCTS) {
    try {
      // Check if product already exists
      const existingProducts = await stripe.products.search({
        query: `metadata['product_id']:'${product.id}'`,
      })

      if (existingProducts.data.length > 0) {
        console.log(`[v0] Product ${product.name} already exists, skipping...`)
        continue
      }

      // Create product in Stripe
      const stripeProduct = await stripe.products.create({
        name: product.name,
        description: product.description,
        metadata: {
          product_id: product.id,
          category: product.category,
        },
        images: product.images?.map((img) => `${process.env.NEXT_PUBLIC_BASE_URL}${img}`) || [],
      })

      // Create price for the product
      await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: product.priceInCents,
        currency: "usd",
      })

      console.log(`[v0] Created product: ${product.name}`)
    } catch (error) {
      console.error(`[v0] Error creating product ${product.name}:`, error)
    }
  }

  console.log("[v0] Stripe product seeding completed!")
}

seedProducts()
