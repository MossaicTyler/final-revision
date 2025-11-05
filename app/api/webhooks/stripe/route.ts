import { stripe } from "@/lib/stripe"
import { sql } from "@/lib/db"
import { PRODUCTS } from "@/lib/products"
import { sendOrderConfirmationEmail } from "@/lib/email"
import { encryptCustomerData, logSecurityEvent, generateOrderReference } from "@/lib/security"
import { headers } from "next/headers"

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    console.error("[v0] No Stripe signature found")
    return new Response("No signature", { status: 400 })
  }

  let event

  try {
    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.warn("[v0] STRIPE_WEBHOOK_SECRET not configured - webhook verification skipped")
      // In development, parse the event without verification
      event = JSON.parse(body)
    } else {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    }

    console.log("[v0] Webhook event received:", { type: event.type, id: event.id })

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object

      console.log("[v0] Processing checkout.session.completed:", {
        sessionId: session.id,
        paymentStatus: session.payment_status,
        customerId: session.customer,
      })

      // Only create order if payment is complete
      if (session.payment_status === "paid") {
        await createOrderFromWebhook(session)
      } else {
        console.log("[v0] Payment not completed, skipping order creation")
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Webhook handler failed",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

async function createOrderFromWebhook(session: any) {
  try {
    console.log("[v0] Creating order from webhook for session:", session.id)

    // Check if order already exists (idempotency)
    const paymentIntentId =
      typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || null

    if (!paymentIntentId) {
      console.error("[v0] No payment intent ID found")
      return
    }

    const existingOrder = await sql`
      SELECT id FROM orders 
      WHERE stripe_payment_intent_id = ${paymentIntentId}
    `

    if (existingOrder.length > 0) {
      console.log("[v0] Order already exists:", existingOrder[0].id)
      return { success: true, orderId: existingOrder[0].id }
    }

    // Extract user and guest info
    const userId = session.metadata?.user_id || null
    const guestEmail = !userId ? session.customer_email : null

    // Prepare customer data for encryption
    const customerData = {
      name: session.shipping_details?.name || session.customer_details?.name || "Customer",
      email: session.customer_email || "",
      phone: session.customer_details?.phone || undefined,
      address: {
        line1: session.shipping_details?.address?.line1 || "",
        line2: session.shipping_details?.address?.line2 || undefined,
        city: session.shipping_details?.address?.city || "",
        state: session.shipping_details?.address?.state || "",
        postal_code: session.shipping_details?.address?.postal_code || "",
        country: session.shipping_details?.address?.country || "GB",
      },
    }

    const encryptedData = await encryptCustomerData(customerData)
    const orderReference = await generateOrderReference()

    // Create order with encrypted data
    const orderResult = await sql`
      INSERT INTO orders (
        user_id, 
        guest_email, 
        stripe_payment_intent_id, 
        status, 
        total_amount, 
        currency,
        shipping_name_encrypted,
        shipping_address_encrypted,
        shipping_phone_encrypted,
        customer_email_encrypted,
        created_at,
        updated_at
      )
      VALUES (
        ${userId},
        ${guestEmail},
        ${paymentIntentId},
        'processing',
        ${session.amount_total},
        ${session.currency},
        ${encryptedData.nameEncrypted},
        ${encryptedData.addressEncrypted},
        ${encryptedData.phoneEncrypted},
        ${encryptedData.emailEncrypted},
        NOW(),
        NOW()
      )
      RETURNING id
    `

    const orderId = orderResult[0].id
    console.log("[v0] Order created:", orderId)

    // Parse items from metadata
    const checkoutType = session.metadata?.checkout_type || "cart"
    let items = []

    if (checkoutType === "buy_now") {
      items = [{ productId: session.metadata?.product_id, quantity: 1 }]
    } else {
      items = JSON.parse(session.metadata?.items || "[]")
    }

    const orderItems = []

    // Create order items
    for (const item of items) {
      const product = PRODUCTS.find((p) => p.id === item.productId)
      if (product) {
        await sql`
          INSERT INTO order_items (
            order_id,
            product_id,
            product_name,
            product_image,
            quantity,
            price,
            created_at
          )
          VALUES (
            ${orderId},
            ${product.id},
            ${product.name},
            ${product.images?.[0] || null},
            ${item.quantity},
            ${product.priceInCents},
            NOW()
          )
        `

        orderItems.push({
          name: product.name,
          quantity: item.quantity,
          price: product.priceInCents * item.quantity,
        })
      }
    }

    // Add tracking event
    await sql`
      INSERT INTO order_tracking_events (order_id, status, description, event_time)
      VALUES (${orderId}, 'Order Placed', 'Your order has been received and is being processed', NOW())
    `

    console.log("[v0] Order items created, sending confirmation email")

    // Send confirmation email
    const customerEmail = customerData.email
    const customerName = customerData.name

    if (customerEmail) {
      const emailResult = await sendOrderConfirmationEmail(customerEmail, orderId, {
        items: orderItems,
        total: session.amount_total || 0,
        currency: session.currency || "gbp",
        customerName,
        shippingAddress: {
          fullName: customerData.name,
          addressLine1: customerData.address.line1,
          addressLine2: customerData.address.line2 || "",
          city: customerData.address.city,
          state: customerData.address.state,
          postalCode: customerData.address.postal_code,
          country: customerData.address.country,
        },
      })

      console.log("[v0] Email send result:", emailResult)
    }

    // Clear cart if cart checkout
    if (checkoutType === "cart" && userId) {
      await sql`DELETE FROM cart_items WHERE user_id = ${userId}`
      console.log("[v0] Cart cleared for user:", userId)
    }

    // Log security event
    await logSecurityEvent("order_created", "purchase", "success", {
      userId: userId || undefined,
      resourceType: "order",
      resourceId: orderId.toString(),
      metadata: { orderReference, total: session.amount_total, checkoutType, source: "webhook" },
    })

    console.log("[v0] Order creation complete:", orderId)

    return { success: true, orderId }
  } catch (error) {
    console.error("[v0] Error creating order from webhook:", error)
    await logSecurityEvent("order_creation_failed", "purchase", "failure", {
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      metadata: { source: "webhook" },
    })
    throw error
  }
}
