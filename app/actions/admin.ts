"use server"

import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// Simple admin check - in production, use proper role-based auth
async function isAdmin() {
  const user = await getCurrentUser()
  // For now, check if email contains "admin" - replace with proper role check
  return user && user.email.includes("admin")
}

export async function getAllOrders(filters?: {
  status?: string
  search?: string
  dateFrom?: string
  dateTo?: string
}) {
  if (!(await isAdmin())) {
    return { error: "Unauthorized" }
  }

  try {
    let query = sql`
      SELECT 
        o.*,
        COUNT(oi.id) as item_count,
        COALESCE(u.email, o.guest_email) as customer_email
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `

    if (filters?.status && filters.status !== "all") {
      query = sql`${query} AND o.status = ${filters.status}`
    }

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`
      query = sql`${query} AND (
        o.id::text LIKE ${searchTerm} OR
        o.tracking_number LIKE ${searchTerm} OR
        COALESCE(u.email, o.guest_email) LIKE ${searchTerm}
      )`
    }

    if (filters?.dateFrom) {
      query = sql`${query} AND o.created_at >= ${filters.dateFrom}`
    }

    if (filters?.dateTo) {
      query = sql`${query} AND o.created_at <= ${filters.dateTo}`
    }

    query = sql`${query}
      GROUP BY o.id, u.email
      ORDER BY o.created_at DESC
      LIMIT 100
    `

    const orders = await query

    return { orders }
  } catch (error) {
    console.error("[v0] Get all orders error:", error)
    return { error: "Failed to fetch orders" }
  }
}

export async function getAdminOrderById(orderId: number) {
  if (!(await isAdmin())) {
    return { error: "Unauthorized" }
  }

  try {
    const result = await sql`
      SELECT 
        o.*,
        json_agg(
          json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'product_name', oi.product_name,
            'product_image', oi.product_image,
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) as items,
        COALESCE(u.email, o.guest_email) as customer_email,
        u.name as customer_name
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ${orderId}
      GROUP BY o.id, u.email, u.name
    `

    if (result.length === 0) {
      return { error: "Order not found" }
    }

    const events = await sql`
      SELECT * FROM order_tracking_events
      WHERE order_id = ${orderId}
      ORDER BY event_time DESC
    `

    return { order: { ...result[0], tracking_events: events } }
  } catch (error) {
    console.error("[v0] Get admin order error:", error)
    return { error: "Failed to fetch order" }
  }
}

export async function updateOrderTracking(
  orderId: number,
  data: {
    tracking_number?: string
    carrier?: string
    estimated_delivery?: string
    status?: string
    notes?: string
  },
) {
  if (!(await isAdmin())) {
    return { error: "Unauthorized" }
  }

  try {
    console.log("[v0] Updating order tracking:", { orderId, data })

    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (data.tracking_number !== undefined) {
      updates.push(`tracking_number = $${paramIndex++}`)
      values.push(data.tracking_number)
    }
    if (data.carrier !== undefined) {
      updates.push(`carrier = $${paramIndex++}`)
      values.push(data.carrier)
    }
    if (data.estimated_delivery !== undefined) {
      updates.push(`estimated_delivery = $${paramIndex++}`)
      values.push(data.estimated_delivery)
    }
    if (data.notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`)
      values.push(data.notes)
    }

    // Always update the updated_at timestamp
    updates.push(`updated_at = NOW()`)

    // Handle status separately to track history
    if (data.status) {
      const currentOrder = await sql`SELECT status FROM orders WHERE id = ${orderId}`
      if (currentOrder.length > 0) {
        const oldStatus = currentOrder[0].status

        updates.push(`status = $${paramIndex++}`)
        values.push(data.status)

        // Add to status history
        await sql`
          INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, notes)
          VALUES (${orderId}, ${oldStatus}, ${data.status}, 'admin', ${data.notes || null})
        `

        // Update shipped_at or delivered_at timestamps
        if (data.status === "shipped" && oldStatus !== "shipped") {
          updates.push(`shipped_at = NOW()`)
        } else if (data.status === "delivered" && oldStatus !== "delivered") {
          updates.push(`delivered_at = NOW()`)
        }
      }
    }

    if (updates.length > 0) {
      values.push(orderId)
      const query = `UPDATE orders SET ${updates.join(", ")} WHERE id = $${paramIndex}`
      await sql.query(query, values)
    }

    // Add tracking event if tracking number was added/updated
    if (data.tracking_number && data.status === "shipped") {
      await sql`
        INSERT INTO order_tracking_events (order_id, status, description, event_time)
        VALUES (
          ${orderId},
          'Shipped',
          ${`Package shipped via ${data.carrier || "carrier"}. Tracking: ${data.tracking_number}`},
          NOW()
        )
      `
    }

    revalidatePath("/admin/orders")
    revalidatePath(`/admin/orders/${orderId}`)

    console.log("[v0] Order tracking updated successfully")
    return { success: true }
  } catch (error) {
    console.error("[v0] Update order tracking error:", error)
    return { error: "Failed to update tracking information" }
  }
}

export async function bulkUploadTracking(csvData: string) {
  if (!(await isAdmin())) {
    return { error: "Unauthorized" }
  }

  try {
    const lines = csvData.trim().split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim())
      const row: any = {}

      headers.forEach((header, index) => {
        row[header] = values[index]
      })

      const orderId = Number.parseInt(row.order_id || row.orderid || row.id)

      if (!orderId) {
        results.failed++
        results.errors.push(`Line ${i + 1}: Missing order ID`)
        continue
      }

      const result = await updateOrderTracking(orderId, {
        tracking_number: row.tracking_number || row.tracking,
        carrier: row.carrier,
        estimated_delivery: row.estimated_delivery || row.delivery_date,
        status: row.status || "shipped",
      })

      if (result.error) {
        results.failed++
        results.errors.push(`Order ${orderId}: ${result.error}`)
      } else {
        results.success++
      }
    }

    revalidatePath("/admin/orders")
    return { success: true, results }
  } catch (error) {
    console.error("[v0] Bulk upload error:", error)
    return { error: "Failed to process CSV file" }
  }
}

export async function getOrderStats() {
  if (!(await isAdmin())) {
    return { error: "Unauthorized" }
  }

  try {
    const stats = await sql`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'processing') as processing,
        COUNT(*) FILTER (WHERE status = 'shipped') as shipped,
        COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
        COUNT(*) FILTER (WHERE tracking_number IS NULL AND status IN ('processing', 'shipped')) as needs_tracking,
        SUM(total_amount) as total_revenue
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `

    return { stats: stats[0] }
  } catch (error) {
    console.error("[v0] Get order stats error:", error)
    return { error: "Failed to fetch stats" }
  }
}
