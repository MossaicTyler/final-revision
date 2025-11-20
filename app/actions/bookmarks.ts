"use server"

import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function toggleBookmark(productId: string) {
  try {
    const session = await getSession()

    if (!session?.userId) {
      return { error: "You must be signed in to save products" }
    }

    // Check if bookmark exists
    const existingBookmark = await sql`
      SELECT id FROM bookmarks
      WHERE user_id = ${session.userId} AND product_id = ${productId}
    `

    if (existingBookmark.length > 0) {
      // Remove bookmark
      await sql`
        DELETE FROM bookmarks
        WHERE user_id = ${session.userId} AND product_id = ${productId}
      `
      return { success: true, bookmarked: false }
    } else {
      // Add bookmark
      await sql`
        INSERT INTO bookmarks (user_id, product_id)
        VALUES (${session.userId}, ${productId})
      `
      return { success: true, bookmarked: true }
    }
  } catch (error) {
    console.error("Failed to toggle bookmark:", error)
    return { error: "Failed to save product" }
  }
}

export async function getBookmarkedProducts() {
  try {
    const session = await getSession()

    if (!session?.userId) {
      return { products: [] }
    }

    const bookmarks = await sql`
      SELECT product_id, created_at 
      FROM bookmarks
      WHERE user_id = ${session.userId}
      ORDER BY created_at DESC
    `

    return { products: bookmarks.map((b) => b.product_id) }
  } catch (error) {
    console.error("Failed to get bookmarked products:", error)
    return { products: [] }
  }
}

export async function isProductBookmarked(productId: string) {
  try {
    const session = await getSession()

    if (!session?.userId) {
      return { bookmarked: false }
    }

    const result = await sql`
      SELECT id FROM bookmarks
      WHERE user_id = ${session.userId} AND product_id = ${productId}
    `

    return { bookmarked: result.length > 0 }
  } catch (error) {
    console.error("Failed to check bookmark status:", error)
    return { bookmarked: false }
  }
}
