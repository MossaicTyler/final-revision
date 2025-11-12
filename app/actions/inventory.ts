"use server"

import { sql } from "@/lib/db"
import { PRODUCTS, getProductById } from "@/lib/products"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth"

export interface InventoryItem {
  productId: string
  productName: string
  category: string
  maxStock: number
  currentStock: number
  soldQuantity: number
  priceInCents: number
  originalPriceInCents?: number
  onSale: boolean
}

/**
 * Get complete inventory overview for all products
 */
export async function getInventoryOverview(): Promise<{ inventory: InventoryItem[]; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { inventory: [], error: "Unauthorized" }
    }

    // Check if user is admin
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || []
    if (!adminEmails.includes(user.email)) {
      return { inventory: [], error: "Unauthorized - Admin access required" }
    }

    const soldQuantitiesResult = await sql`
      SELECT 
        oi.product_id,
        COALESCE(SUM(oi.quantity), 0) as total_sold
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status IN ('processing', 'shipped', 'delivered')
      GROUP BY oi.product_id
    `

    // Create a map of product_id -> sold quantity
    const soldQuantitiesMap: Record<string, number> = {}
    soldQuantitiesResult.forEach((row: any) => {
      soldQuantitiesMap[row.product_id] = Number(row.total_sold || 0)
    })

    // Build inventory with pre-fetched sold quantities
    const inventory: InventoryItem[] = PRODUCTS.map((product) => {
      const soldQuantity = soldQuantitiesMap[product.id] || 0
      const maxStock = product.maxStock || 100
      const currentStock = Math.max(0, maxStock - soldQuantity)

      return {
        productId: product.id,
        productName: product.name,
        category: product.category,
        maxStock,
        currentStock,
        soldQuantity,
        priceInCents: product.priceInCents,
        originalPriceInCents: product.originalPriceInCents,
        onSale: product.onSale || false,
      }
    })

    return { inventory }
  } catch (error) {
    console.error("[v0] Get inventory overview error:", error)
    return { inventory: [], error: "Failed to load inventory" }
  }
}

/**
 * Update the maximum stock for a product
 * NOTE: This updates the in-memory PRODUCTS array
 */
export async function updateProductStock(
  productId: string,
  newMaxStock: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Check if user is admin
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || []
    if (!adminEmails.includes(user.email)) {
      return { success: false, error: "Unauthorized - Admin access required" }
    }

    // Validate input
    if (newMaxStock < 0) {
      return { success: false, error: "Stock cannot be negative" }
    }

    if (newMaxStock > 10000) {
      return { success: false, error: "Stock cannot exceed 10,000 units" }
    }

    // Find the product
    const product = getProductById(productId)
    if (!product) {
      return { success: false, error: "Product not found" }
    }

    // Update the product's maxStock in the PRODUCTS array
    const productIndex = PRODUCTS.findIndex((p) => p.id === productId)
    if (productIndex !== -1) {
      PRODUCTS[productIndex].maxStock = newMaxStock
    }

    // Revalidate paths to update the UI
    revalidatePath("/admin/inventory")
    revalidatePath("/")
    revalidatePath("/shop")

    return { success: true }
  } catch (error) {
    console.error("[v0] Update product stock error:", error)
    return { success: false, error: "Failed to update stock" }
  }
}

/**
 * Bulk update stock for multiple products
 */
export async function bulkUpdateStock(
  updates: Array<{ productId: string; maxStock: number }>,
): Promise<{ success: boolean; error?: string; updated: number }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Unauthorized", updated: 0 }
    }

    // Check if user is admin
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || []
    if (!adminEmails.includes(user.email)) {
      return { success: false, error: "Unauthorized - Admin access required", updated: 0 }
    }

    let updated = 0

    for (const update of updates) {
      const result = await updateProductStock(update.productId, update.maxStock)
      if (result.success) {
        updated++
      }
    }

    return { success: true, updated }
  } catch (error) {
    console.error("[v0] Bulk update stock error:", error)
    return { success: false, error: "Failed to bulk update stock", updated: 0 }
  }
}

export async function updateProductPrice(
  productId: string,
  newPriceInCents: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || []
    if (!adminEmails.includes(user.email)) {
      return { success: false, error: "Unauthorized - Admin access required" }
    }

    if (newPriceInCents < 0) {
      return { success: false, error: "Price cannot be negative" }
    }

    if (newPriceInCents > 1000000) {
      return { success: false, error: "Price cannot exceed £10,000" }
    }

    const productIndex = PRODUCTS.findIndex((p) => p.id === productId)
    if (productIndex === -1) {
      return { success: false, error: "Product not found" }
    }

    PRODUCTS[productIndex].priceInCents = newPriceInCents

    revalidatePath("/admin/inventory")
    revalidatePath("/")
    revalidatePath("/shop")

    return { success: true }
  } catch (error) {
    console.error("[v0] Update product price error:", error)
    return { success: false, error: "Failed to update price" }
  }
}

export async function toggleProductSale(
  productId: string,
  onSale: boolean,
  originalPriceInCents?: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || []
    if (!adminEmails.includes(user.email)) {
      return { success: false, error: "Unauthorized - Admin access required" }
    }

    const productIndex = PRODUCTS.findIndex((p) => p.id === productId)
    if (productIndex === -1) {
      return { success: false, error: "Product not found" }
    }

    PRODUCTS[productIndex].onSale = onSale
    if (onSale && originalPriceInCents) {
      PRODUCTS[productIndex].originalPriceInCents = originalPriceInCents
    } else if (!onSale) {
      PRODUCTS[productIndex].originalPriceInCents = undefined
    }

    revalidatePath("/admin/inventory")
    revalidatePath("/")
    revalidatePath("/shop")

    return { success: true }
  } catch (error) {
    console.error("[v0] Toggle product sale error:", error)
    return { success: false, error: "Failed to toggle sale status" }
  }
}

export async function updateProduct(
  productId: string,
  updates: {
    priceInCents?: number
    maxStock?: number
    onSale?: boolean
    originalPriceInCents?: number
  },
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || []
    if (!adminEmails.includes(user.email)) {
      return { success: false, error: "Unauthorized - Admin access required" }
    }

    const productIndex = PRODUCTS.findIndex((p) => p.id === productId)
    if (productIndex === -1) {
      return { success: false, error: "Product not found" }
    }

    // Validate and apply updates
    if (updates.priceInCents !== undefined) {
      if (updates.priceInCents < 0 || updates.priceInCents > 1000000) {
        return { success: false, error: "Invalid price" }
      }
      PRODUCTS[productIndex].priceInCents = updates.priceInCents
    }

    if (updates.maxStock !== undefined) {
      if (updates.maxStock < 0 || updates.maxStock > 10000) {
        return { success: false, error: "Invalid stock quantity" }
      }
      PRODUCTS[productIndex].maxStock = updates.maxStock
    }

    if (updates.onSale !== undefined) {
      PRODUCTS[productIndex].onSale = updates.onSale
      if (updates.onSale && updates.originalPriceInCents) {
        PRODUCTS[productIndex].originalPriceInCents = updates.originalPriceInCents
      } else if (!updates.onSale) {
        PRODUCTS[productIndex].originalPriceInCents = undefined
      }
    }

    revalidatePath("/admin/inventory")
    revalidatePath("/")
    revalidatePath("/shop")

    return { success: true }
  } catch (error) {
    console.error("[v0] Update product error:", error)
    return { success: false, error: "Failed to update product" }
  }
}

export async function updateProductFull(
  originalProductId: string,
  updates: {
    id?: string
    name?: string
    description?: string
    category?: string
    details?: string
    priceInCents?: number
    maxStock?: number
    onSale?: boolean
    originalPriceInCents?: number
  },
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || []
    if (!adminEmails.includes(user.email)) {
      return { success: false, error: "Unauthorized - Admin access required" }
    }

    const productIndex = PRODUCTS.findIndex((p) => p.id === originalProductId)
    if (productIndex === -1) {
      return { success: false, error: "Product not found" }
    }

    // Check if new ID already exists (if changing ID)
    if (updates.id && updates.id !== originalProductId) {
      const existingProduct = PRODUCTS.find((p) => p.id === updates.id)
      if (existingProduct) {
        return { success: false, error: "Product ID already exists" }
      }
    }

    // Validate and apply updates
    if (updates.id !== undefined) {
      if (!/^[a-z0-9-]+$/.test(updates.id)) {
        return { success: false, error: "Product ID must contain only lowercase letters, numbers, and hyphens" }
      }
      PRODUCTS[productIndex].id = updates.id
    }

    if (updates.name !== undefined) {
      if (updates.name.trim().length === 0) {
        return { success: false, error: "Product name cannot be empty" }
      }
      PRODUCTS[productIndex].name = updates.name.trim()
    }

    if (updates.description !== undefined) {
      PRODUCTS[productIndex].description = updates.description.trim()
    }

    if (updates.category !== undefined) {
      if (updates.category.trim().length === 0) {
        return { success: false, error: "Category cannot be empty" }
      }
      PRODUCTS[productIndex].category = updates.category.trim()
    }

    if (updates.details !== undefined) {
      PRODUCTS[productIndex].details = updates.details.trim()
    }

    if (updates.priceInCents !== undefined) {
      if (updates.priceInCents < 0 || updates.priceInCents > 1000000) {
        return { success: false, error: "Invalid price" }
      }
      PRODUCTS[productIndex].priceInCents = updates.priceInCents
    }

    if (updates.maxStock !== undefined) {
      if (updates.maxStock < 0 || updates.maxStock > 10000) {
        return { success: false, error: "Invalid stock quantity" }
      }
      PRODUCTS[productIndex].maxStock = updates.maxStock
    }

    if (updates.onSale !== undefined) {
      PRODUCTS[productIndex].onSale = updates.onSale
      if (updates.onSale && updates.originalPriceInCents) {
        PRODUCTS[productIndex].originalPriceInCents = updates.originalPriceInCents
      } else if (!updates.onSale) {
        PRODUCTS[productIndex].originalPriceInCents = undefined
      }
    }

    revalidatePath("/admin/inventory")
    revalidatePath("/")
    revalidatePath("/shop")

    return { success: true }
  } catch (error) {
    console.error("[v0] Update product full error:", error)
    return { success: false, error: "Failed to update product" }
  }
}

export async function adjustCurrentStock(
  productId: string,
  adjustment: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || []
    if (!adminEmails.includes(user.email)) {
      return { success: false, error: "Unauthorized - Admin access required" }
    }

    const product = getProductById(productId)
    if (!product) {
      return { success: false, error: "Product not found" }
    }

    // Get current sold quantity
    const soldResult = await sql`
      SELECT COALESCE(SUM(oi.quantity), 0) as total_sold
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.product_id = ${productId}
        AND o.status IN ('processing', 'shipped', 'delivered')
    `

    const currentSold = Number(soldResult[0]?.total_sold || 0)
    const maxStock = product.maxStock || 100
    const currentStock = maxStock - currentSold

    // Calculate new stock after adjustment
    const newStock = currentStock + adjustment

    if (newStock < 0) {
      return { success: false, error: "Cannot reduce stock below 0" }
    }

    if (newStock > maxStock) {
      return { success: false, error: "Cannot increase stock above maximum" }
    }

    // Adjust max stock to achieve desired current stock
    const newMaxStock = currentSold + newStock

    const productIndex = PRODUCTS.findIndex((p) => p.id === productId)
    if (productIndex !== -1) {
      PRODUCTS[productIndex].maxStock = newMaxStock
    }

    revalidatePath("/admin/inventory")
    revalidatePath("/")
    revalidatePath("/shop")

    return { success: true }
  } catch (error) {
    console.error("[v0] Adjust current stock error:", error)
    return { success: false, error: "Failed to adjust stock" }
  }
}
