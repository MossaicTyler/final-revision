"use server"

import { sql } from "@/lib/db"
import { getProductMaxStock } from "@/lib/products"

/**
 * Get the current stock level for a product
 * Returns remaining quantity available (maxStock - sold quantity)
 */
export async function getProductStock(productId: string): Promise<number> {
  try {
    const maxStock = getProductMaxStock(productId)

    // Count total sold from completed orders
    const result = await sql`
      SELECT COALESCE(SUM(oi.quantity), 0) as total_sold
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.product_id = ${productId}
        AND o.status IN ('processing', 'shipped', 'delivered')
    `

    const totalSold = Number(result[0]?.total_sold || 0)
    const remainingStock = Math.max(0, maxStock - totalSold)

    return remainingStock
  } catch (error) {
    console.error("[v0] Get product stock error:", error)
    // Return max stock on error to allow purchases
    return getProductMaxStock(productId)
  }
}

/**
 * Check if a product is in stock for the requested quantity
 */
export async function isProductInStock(productId: string, requestedQuantity = 1): Promise<boolean> {
  const stock = await getProductStock(productId)
  return stock >= requestedQuantity
}

/**
 * Get stock levels for multiple products at once
 */
export async function getMultipleProductsStock(productIds: string[]): Promise<Record<string, number>> {
  try {
    const stockLevels: Record<string, number> = {}

    // Get all stock levels in parallel
    const stockPromises = productIds.map(async (id) => {
      const stock = await getProductStock(id)
      return { id, stock }
    })

    const results = await Promise.all(stockPromises)
    results.forEach(({ id, stock }) => {
      stockLevels[id] = stock
    })

    return stockLevels
  } catch (error) {
    console.error("[v0] Get multiple products stock error:", error)
    return {}
  }
}
