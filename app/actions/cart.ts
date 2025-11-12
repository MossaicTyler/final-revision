"use server"

import { sql } from "@/lib/db"
import { getCurrentUser, ensureGuestSession } from "@/lib/auth"
import { isProductInStock } from "@/lib/inventory"

export async function addToCart(productId: string, quantity = 1) {
  try {
    const inStock = await isProductInStock(productId, quantity)
    if (!inStock) {
      return { error: "Product is out of stock" }
    }

    const user = await getCurrentUser()
    const userId = user?.id
    const sessionId = !userId ? await ensureGuestSession() : null

    if (!userId && !sessionId) {
      return { error: "Session not found" }
    }

    // Check if item already exists in cart
    const existing = userId
      ? await sql`
          SELECT id, quantity FROM cart_items 
          WHERE user_id = ${userId} AND product_id = ${productId}
        `
      : await sql`
          SELECT id, quantity FROM cart_items 
          WHERE session_id = ${sessionId} AND product_id = ${productId}
        `

    if (existing.length > 0) {
      const newQuantity = existing[0].quantity + quantity
      const hasStock = await isProductInStock(productId, newQuantity)
      if (!hasStock) {
        return { error: "Not enough stock available" }
      }

      // Update quantity
      await sql`
        UPDATE cart_items 
        SET quantity = ${newQuantity}, updated_at = NOW()
        WHERE id = ${existing[0].id}
      `
      console.log("[v0] Updated cart item quantity:", { productId, newQuantity })
    } else {
      // Insert new item
      if (userId) {
        await sql`
          INSERT INTO cart_items (user_id, product_id, quantity, created_at, updated_at)
          VALUES (${userId}, ${productId}, ${quantity}, NOW(), NOW())
        `
      } else {
        await sql`
          INSERT INTO cart_items (session_id, product_id, quantity, created_at, updated_at)
          VALUES (${sessionId}, ${productId}, ${quantity}, NOW(), NOW())
        `
      }
      console.log("[v0] Added new item to cart:", { productId, quantity })
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Add to cart error:", error)
    return { error: "Failed to add item to cart" }
  }
}

export async function removeFromCart(cartItemId: number) {
  try {
    await sql`DELETE FROM cart_items WHERE id = ${cartItemId}`
    console.log("[v0] Removed item from cart:", { cartItemId })
    return { success: true }
  } catch (error) {
    console.error("[v0] Remove from cart error:", error)
    return { error: "Failed to remove item" }
  }
}

export async function updateCartQuantity(cartItemId: number, quantity: number) {
  try {
    if (quantity <= 0) {
      return removeFromCart(cartItemId)
    }

    const cartItem = await sql`
      SELECT product_id FROM cart_items WHERE id = ${cartItemId}
    `

    if (cartItem.length === 0) {
      return { error: "Cart item not found" }
    }

    const productId = cartItem[0].product_id
    const hasStock = await isProductInStock(productId, quantity)
    if (!hasStock) {
      return { error: "Not enough stock available" }
    }

    await sql`
      UPDATE cart_items 
      SET quantity = ${quantity}, updated_at = NOW()
      WHERE id = ${cartItemId}
    `
    console.log("[v0] Updated cart quantity:", { cartItemId, quantity })
    return { success: true }
  } catch (error) {
    console.error("[v0] Update cart quantity error:", error)
    return { error: "Failed to update quantity" }
  }
}

export async function getCart() {
  try {
    const user = await getCurrentUser()
    const userId = user?.id
    const sessionId = !userId ? await ensureGuestSession() : null

    const items = userId
      ? await sql`SELECT * FROM cart_items WHERE user_id = ${userId} ORDER BY created_at DESC`
      : await sql`SELECT * FROM cart_items WHERE session_id = ${sessionId} ORDER BY created_at DESC`

    const { PRODUCTS } = await import("@/lib/products")
    const validProductIds = new Set(PRODUCTS.map((p) => p.id))

    const validItems = []
    const invalidItemIds = []
    const outOfStockItemIds = []

    for (const item of items) {
      if (!validProductIds.has(item.product_id)) {
        invalidItemIds.push(item.id)
        continue
      }

      const hasStock = await isProductInStock(item.product_id, item.quantity)
      if (!hasStock) {
        outOfStockItemIds.push(item.id)
        continue
      }

      validItems.push(item)
    }

    const itemsToRemove = [...invalidItemIds, ...outOfStockItemIds]
    if (itemsToRemove.length > 0) {
      await sql`DELETE FROM cart_items WHERE id = ANY(${itemsToRemove})`
      console.log("[v0] Removed invalid/out-of-stock products from cart:", {
        invalid: invalidItemIds.length,
        outOfStock: outOfStockItemIds.length,
      })
    }

    console.log("[v0] Retrieved cart items:", { count: validItems.length })
    return validItems
  } catch (error) {
    console.error("[v0] Get cart error:", error)
    return []
  }
}

export async function getCartItemCount() {
  try {
    const user = await getCurrentUser()
    const userId = user?.id
    const sessionId = !userId ? await ensureGuestSession() : null

    const result = userId
      ? await sql`SELECT COALESCE(SUM(quantity), 0) as count FROM cart_items WHERE user_id = ${userId}`
      : await sql`SELECT COALESCE(SUM(quantity), 0) as count FROM cart_items WHERE session_id = ${sessionId}`

    const count = Number(result[0]?.count || 0)
    console.log("[v0] Cart item count:", { count })
    return count
  } catch (error) {
    console.error("[v0] Get cart count error:", error)
    return 0
  }
}

export async function clearCart() {
  try {
    const user = await getCurrentUser()
    const userId = user?.id
    const sessionId = !userId ? await ensureGuestSession() : null

    if (userId) {
      await sql`DELETE FROM cart_items WHERE user_id = ${userId}`
      console.log("[v0] Cleared cart for user:", userId)
    } else if (sessionId) {
      await sql`DELETE FROM cart_items WHERE session_id = ${sessionId}`
      console.log("[v0] Cleared cart for guest session:", sessionId)
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Clear cart error:", error)
    return { error: "Failed to clear cart" }
  }
}
