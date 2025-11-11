"use server"

import { stripe } from "@/lib/stripe"
import { PRODUCTS } from "@/lib/products"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { sendOrderConfirmationEmail } from "@/lib/email"
import { encryptCustomerData, logSecurityEvent, checkRateLimit, generateOrderReference } from "@/lib/security"
import { isProductInStock, getProductStock } from "@/lib/inventory"

export async function startCheckoutSession(productId: string) {
  const user = await getCurrentUser()
  const identifier = user?.id || "guest"

  // Rate limiting
  const rateCheck = await checkRateLimit(identifier, "checkout", 10, 5)
  if (!rateCheck.allowed) {
    await logSecurityEvent("rate_limit_exceeded", "checkout", "failure", {
      userId: user?.id,
      metadata: { productId },
    })
    throw new Error("Too many checkout attempts. Please try again later.")
  }

  const product = PRODUCTS.find((p) => p.id === productId)
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const returnUrl = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`

  const productImage = product.images?.[0]
  const absoluteImageUrl = productImage
    ? productImage.startsWith("http")
      ? productImage
      : `${returnUrl}${productImage}`
    : undefined

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    line_items: [
      {
        price_data: {
          currency: "gbp",
          product_data: {
            name: product.name,
            description: product.description,
            images: absoluteImageUrl ? [absoluteImageUrl] : undefined,
          },
          unit_amount: product.priceInCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    customer_email: user?.email,
    billing_address_collection: "required",
    shipping_address_collection: {
      allowed_countries: [
        "GB",
        "US",
        "CA",
        "AU",
        "NZ",
        "IE",
        "FR",
        "DE",
        "IT",
        "ES",
        "NL",
        "BE",
        "AT",
        "PT",
        "SE",
        "DK",
        "NO",
        "FI",
      ],
    },
    phone_number_collection: {
      enabled: true,
    },
    allow_promotion_codes: true,
    return_url: `${returnUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    metadata: {
      user_id: user?.id || "",
      product_id: productId,
      checkout_type: "buy_now",
    },
  })

  await logSecurityEvent("checkout_started", "buy_now", "success", {
    userId: user?.id,
    metadata: { productId, sessionId: session.id },
  })

  return session.client_secret
}

export async function startCartCheckoutSession(
  items: Array<{ productId: string; quantity: number }>,
  guestInfo?: { email: string; name: string },
) {
  const user = await getCurrentUser()
  const identifier = user?.id || guestInfo?.email || "guest"

  // Rate limiting
  const rateCheck = await checkRateLimit(identifier, "checkout", 10, 5)
  if (!rateCheck.allowed) {
    await logSecurityEvent("rate_limit_exceeded", "checkout", "failure", {
      userId: user?.id,
      metadata: { itemCount: items.length },
    })
    throw new Error("Too many checkout attempts. Please try again later.")
  }

  for (const item of items) {
    const inStock = await isProductInStock(item.productId, item.quantity)
    if (!inStock) {
      const product = PRODUCTS.find((p) => p.id === item.productId)
      const remainingStock = await getProductStock(item.productId)
      throw new Error(`${product?.name || "Product"} is out of stock. Only ${remainingStock} remaining in stock.`)
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const returnUrl = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`

  const lineItems = items.map((item) => {
    const product = PRODUCTS.find((p) => p.id === item.productId)
    if (!product) {
      throw new Error(`Product with id "${item.productId}" not found`)
    }

    const productImage = product.images?.[0]
    const absoluteImageUrl = productImage
      ? productImage.startsWith("http")
        ? productImage
        : `${returnUrl}${productImage}`
      : undefined

    return {
      price_data: {
        currency: "gbp",
        product_data: {
          name: product.name,
          description: product.description,
          images: absoluteImageUrl ? [absoluteImageUrl] : undefined,
        },
        unit_amount: product.priceInCents,
      },
      quantity: item.quantity,
    }
  })

  const customerEmail = user?.email || guestInfo?.email
  const customerName = user?.name || guestInfo?.name

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    line_items: lineItems,
    mode: "payment",
    customer_email: customerEmail,
    billing_address_collection: "required",
    shipping_address_collection: {
      allowed_countries: [
        "GB",
        "US",
        "CA",
        "AU",
        "NZ",
        "IE",
        "FR",
        "DE",
        "IT",
        "ES",
        "NL",
        "BE",
        "AT",
        "PT",
        "SE",
        "DK",
        "NO",
        "FI",
      ],
    },
    phone_number_collection: {
      enabled: true,
    },
    allow_promotion_codes: true,
    return_url: `${returnUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    metadata: {
      user_id: user?.id || "",
      items: JSON.stringify(items),
      checkout_type: "cart",
      guest_email: guestInfo?.email || "",
      guest_name: guestInfo?.name || "",
    },
  })

  await logSecurityEvent("checkout_started", "cart", "success", {
    userId: user?.id,
    metadata: { itemCount: items.length, sessionId: session.id },
  })

  return session.client_secret
}

export async function getCheckoutSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return session
  } catch (error) {
    console.error("[v0] Error retrieving checkout session:", error)
    return null
  }
}

export async function createOrderFromSession(sessionId: string) {
  try {
    console.log("[v0] Creating order from session (success page):", sessionId)

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "payment_intent"],
    })

    console.log("[v0] Session retrieved:", {
      id: session.id,
      payment_status: session.payment_status,
      customer_email: session.customer_email,
    })

    if (session.payment_status !== "paid") {
      console.log("[v0] Payment not completed, status:", session.payment_status)
      return { error: "Payment not completed" }
    }

    const paymentIntentId =
      typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || null

    console.log("[v0] Payment intent ID:", paymentIntentId)

    // Check if order already exists (webhook may have already created it)
    const existingOrder = await sql`
      SELECT id FROM orders 
      WHERE stripe_payment_intent_id = ${paymentIntentId}
    `

    if (existingOrder.length > 0) {
      console.log("[v0] Order already exists (created by webhook):", existingOrder[0].id)
      await clearCartAfterPurchase(session)
      return { success: true, orderId: existingOrder[0].id }
    }

    console.log("[v0] Order doesn't exist yet, creating from success page")

    const user = await getCurrentUser()
    const userId = user?.id || session.metadata?.user_id || null
    const guestEmail = !userId ? session.customer_email : null

    console.log("[v0] User info:", { userId, guestEmail, userEmail: user?.email })

    // Encrypt customer data
    const customerData = {
      name: session.shipping_details?.name || session.customer_details?.name || "Customer",
      email: session.customer_email || user?.email || "",
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

    console.log("[v0] Customer data prepared:", {
      name: customerData.name,
      email: customerData.email,
      hasPhone: !!customerData.phone,
    })

    const encryptedData = await encryptCustomerData(customerData)
    const orderReference = await generateOrderReference()

    console.log("[v0] Encrypted data and order reference generated")

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
    console.log("[v0] Order created from success page:", orderId)

    // Parse items from metadata
    const checkoutType = session.metadata?.checkout_type || "cart"
    let items = []

    if (checkoutType === "buy_now") {
      items = [{ productId: session.metadata?.product_id, quantity: 1 }]
    } else {
      items = JSON.parse(session.metadata?.items || "[]")
    }

    console.log("[v0] Processing order items:", { checkoutType, itemCount: items.length })

    const orderItems = []

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

    console.log("[v0] Order items created:", orderItems.length)

    // Add tracking event
    await sql`
      INSERT INTO order_tracking_events (order_id, status, description, event_time)
      VALUES (${orderId}, 'Order Placed', 'Your order has been received and is being processed', NOW())
    `

    console.log("[v0] Tracking event added")

    const customerEmail = user?.email || guestEmail
    const customerName = customerData.name
    const isGuest = !userId

    if (customerEmail) {
      console.log("[v0] Attempting to send confirmation email to:", customerEmail)

      // Send email but don't await - let it happen in background
      sendOrderConfirmationEmail(customerEmail, orderId, {
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
        isGuest,
      })
        .then((result) => {
          console.log("[v0] Email send completed:", result)
        })
        .catch((error) => {
          console.error("[v0] Email send failed (non-blocking):", error)
        })
    } else {
      console.log("[v0] No customer email available, skipping email")
    }

    await clearCartAfterPurchase(session)

    // Log security event
    await logSecurityEvent("order_created", "purchase", "success", {
      userId: userId || undefined,
      resourceType: "order",
      resourceId: orderId.toString(),
      metadata: { orderReference, total: session.amount_total, checkoutType, source: "success_page" },
    })

    console.log("[v0] Order creation completed successfully:", orderId)

    return { success: true, orderId }
  } catch (error) {
    console.error("[v0] Error creating order - Full error:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))

    await logSecurityEvent("order_creation_failed", "purchase", "failure", {
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      metadata: { source: "success_page" },
    })

    return { error: `Failed to create order: ${error instanceof Error ? error.message : "Unknown error"}` }
  }
}

async function clearCartAfterPurchase(session: any) {
  try {
    const checkoutType = session.metadata?.checkout_type || "cart"
    if (checkoutType !== "cart") {
      return // Only clear cart for cart checkouts, not buy now
    }

    const userId = session.metadata?.user_id
    if (userId) {
      await sql`DELETE FROM cart_items WHERE user_id = ${userId}`
      console.log("[v0] Cart cleared for user:", userId)
    }
    // Note: For guests, cart is stored in localStorage and cleared by the client
  } catch (error) {
    console.error("[v0] Error clearing cart:", error)
    // Don't throw - cart clearing is non-critical
  }
}
