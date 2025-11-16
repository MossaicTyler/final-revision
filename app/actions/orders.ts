"use server"

import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from 'next/navigation'
import { sendOrderStatusUpdateEmail } from "@/lib/email"
import { decryptData } from "@/lib/auth"

export async function getUserOrders() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  try {
    const orders = await sql`
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
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ${user.id}
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `

    return orders
  } catch (error) {
    console.error("[v0] Get user orders error:", error)
    return []
  }
}

export async function getOrderById(orderId: number) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
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
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ${orderId} AND o.user_id = ${user.id}
      GROUP BY o.id
    `

    if (result.length === 0) {
      return null
    }

    return result[0]
  } catch (error) {
    console.error("[v0] Get order by id error:", error)
    return null
  }
}

export async function getOrderTracking(orderId: number) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  try {
    const order = await sql`
      SELECT tracking_number, carrier, estimated_delivery, status, shipped_at, delivered_at
      FROM orders
      WHERE id = ${orderId} AND user_id = ${user.id}
    `

    if (order.length === 0) {
      return null
    }

    const events = await sql`
      SELECT status, location, description, event_time
      FROM order_tracking_events
      WHERE order_id = ${orderId}
      ORDER BY event_time DESC
    `

    return {
      ...order[0],
      events,
    }
  } catch (error) {
    console.error("[v0] Get order tracking error:", error)
    return null
  }
}

export async function addTrackingEvent(orderId: number, status: string, location?: string, description?: string) {
  try {
    await sql`
      INSERT INTO order_tracking_events (order_id, status, location, description, event_time)
      VALUES (${orderId}, ${status}, ${location || null}, ${description || null}, NOW())
    `

    return { success: true }
  } catch (error) {
    console.error("[v0] Add tracking event error:", error)
    return { error: "Failed to add tracking event" }
  }
}

export async function updateOrderStatus(orderId: number, newStatus: string, notes?: string) {
  const user = await getCurrentUser()

  if (!user) {
    return { error: "Unauthorized" }
  }

  try {
    const currentOrder = await sql`
      SELECT o.status, o.customer_email_encrypted, o.shipping_name_encrypted, o.tracking_number, o.carrier, o.estimated_delivery
      FROM orders o
      WHERE o.id = ${orderId}
    `

    if (currentOrder.length === 0) {
      return { error: "Order not found" }
    }

    const oldStatus = currentOrder[0].status
    const customerEmail = currentOrder[0].customer_email_encrypted
      ? await decryptData(currentOrder[0].customer_email_encrypted)
      : null
    const customerName = currentOrder[0].shipping_name_encrypted
      ? await decryptData(currentOrder[0].shipping_name_encrypted)
      : null
    const trackingNumber = currentOrder[0].tracking_number
    const carrier = currentOrder[0].carrier
    const estimatedDelivery = currentOrder[0].estimated_delivery

    await sql`
      UPDATE orders
      SET status = ${newStatus}, updated_at = NOW()
      WHERE id = ${orderId}
    `

    await sql`
      INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, notes)
      VALUES (${orderId}, ${oldStatus}, ${newStatus}, ${user.id}, ${notes || null})
    `

    if (newStatus === "shipped") {
      await sql`
        UPDATE orders
        SET shipped_at = NOW()
        WHERE id = ${orderId}
      `
    } else if (newStatus === "delivered") {
      await sql`
        UPDATE orders
        SET delivered_at = NOW()
        WHERE id = ${orderId}
      `
    }

    if (customerEmail && oldStatus !== newStatus) {
      console.log("[v0] Sending order status update email for order:", orderId)
      const emailResult = await sendOrderStatusUpdateEmail(customerEmail, orderId, {
        customerName: customerName || "Customer",
        oldStatus,
        newStatus,
        trackingNumber: trackingNumber || undefined,
        carrier: carrier || undefined,
        estimatedDelivery: estimatedDelivery || undefined,
      })

      if (!emailResult.success) {
        console.error("[v0] Failed to send order status update email:", emailResult.error)
      } else {
        console.log("[v0] Order status update email sent successfully")
      }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Update order status error:", error)
    return { error: "Failed to update order status" }
  }
}

export async function getGuestOrder(orderId: number, email: string) {
  try {
    const orders = await sql`
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
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ${orderId}
      GROUP BY o.id
    `

    if (orders.length === 0) {
      console.log("[v0] Order not found:", orderId)
      return null
    }

    const order = orders[0]
    const normalizedEmail = email.toLowerCase().trim()

    let emailMatches = false

    // Check encrypted customer email (for both guests and registered users)
    if (order.customer_email_encrypted) {
      try {
        const decryptedEmail = await decryptData(order.customer_email_encrypted)
        if (decryptedEmail.toLowerCase().trim() === normalizedEmail) {
          emailMatches = true
          console.log("[v0] Email matched via customer_email_encrypted")
        }
      } catch (decryptError) {
        console.error("[v0] Error decrypting customer_email_encrypted:", decryptError)
      }
    }

    // Check plain guest email
    if (!emailMatches && order.guest_email) {
      if (order.guest_email.toLowerCase().trim() === normalizedEmail) {
        emailMatches = true
        console.log("[v0] Email matched via guest_email")
      }
    }

    if (!emailMatches) {
      console.log("[v0] Email mismatch for order:", orderId, "provided:", normalizedEmail)
      return null
    }

    return order
  } catch (error) {
    console.error("[v0] Get guest order error:", error)
    return null
  }
}

export async function getGuestOrderTracking(orderId: number, email: string) {
  try {
    const order = await sql`
      SELECT tracking_number, carrier, estimated_delivery, status, shipped_at, delivered_at, customer_email_encrypted, guest_email
      FROM orders
      WHERE id = ${orderId}
    `

    if (order.length === 0) {
      console.log("[v0] Order not found for tracking:", orderId)
      return null
    }

    const orderData = order[0]
    const normalizedEmail = email.toLowerCase().trim()

    let emailMatches = false
    
    // Check encrypted customer email (for both guests and registered users)
    if (orderData.customer_email_encrypted) {
      try {
        const decryptedEmail = await decryptData(orderData.customer_email_encrypted)
        if (decryptedEmail.toLowerCase().trim() === normalizedEmail) {
          emailMatches = true
          console.log("[v0] Tracking email matched via customer_email_encrypted")
        }
      } catch (decryptError) {
        console.error("[v0] Error decrypting customer_email_encrypted for tracking:", decryptError)
      }
    }

    // Check plain guest email
    if (!emailMatches && orderData.guest_email) {
      if (orderData.guest_email.toLowerCase().trim() === normalizedEmail) {
        emailMatches = true
        console.log("[v0] Tracking email matched via guest_email")
      }
    }

    if (!emailMatches) {
      console.log("[v0] Email mismatch for tracking - order:", orderId, "provided:", normalizedEmail)
      return null
    }

    const events = await sql`
      SELECT status, location, description, event_time
      FROM order_tracking_events
      WHERE order_id = ${orderId}
      ORDER BY event_time DESC
    `

    return {
      tracking_number: orderData.tracking_number,
      carrier: orderData.carrier,
      estimated_delivery: orderData.estimated_delivery,
      status: orderData.status,
      shipped_at: orderData.shipped_at,
      delivered_at: orderData.delivered_at,
      events,
    }
  } catch (error) {
    console.error("[v0] Get guest order tracking error:", error)
    return null
  }
}
