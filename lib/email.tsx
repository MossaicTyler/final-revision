import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const getEmailHeaders = () => ({
  "List-Unsubscribe": "{{{RESEND_UNSUBSCRIBE_URL}}}",
  "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  "X-Entity-Ref-ID": `reknur-${Date.now()}`,
})

const createPreheader = (text: string) => `
  <div style="display: none; max-height: 0px; overflow: hidden;">
    ${text}
  </div>
`

export async function sendVerificationEmail(email: string, token: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`

    const fromEmail = process.env.RESEND_FROM_EMAIL || "orders@notifiers.reknur.com"
    const from = `reknur <${fromEmail}>`

    const plainText = `Verify Your Email Address\n\nThank you for signing up! Please visit the link below to verify your email address and activate your account:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.`

    const { data, error } = await resend.emails.send({
      from: from,
      to: email,
      subject: "Verify your email address",
      headers: getEmailHeaders(),
      text: plainText,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            ${createPreheader("Verify your email address for reknur")}
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                      <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 2px solid #1a1a1a;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #1a1a1a; font-family: 'Playfair Display', serif;">reknur</h1>
                        <p style="margin: 10px 0 0 0; font-size: 14px; color: #666666;">Curated Excellence</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px 40px 30px 40px;">
                        <h2 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">Verify Your Email Address</h2>
                        <p style="margin: 0; font-size: 16px; line-height: 24px; color: #666666;">
                          Thank you for signing up! Please click the button below to verify your email address and activate your account.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 40px 40px 40px; text-align: center;">
                        <a href="${verificationUrl}" style="display: inline-block; padding: 14px 32px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">
                          Verify Email Address
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 40px 40px 40px; text-align: center; border-top: 1px solid #eeeeee;">
                        <p style="margin: 0; font-size: 14px; line-height: 20px; color: #999999;">
                          This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function sendOrderConfirmationEmail(
  email: string,
  orderId: string | number,
  orderDetails: {
    items: Array<{ name: string; quantity: number; price: number }>
    total: number
    currency: string
    customerName: string
    shippingAddress: {
      fullName: string
      addressLine1: string
      addressLine2?: string
      city: string
      state: string
      postalCode: string
      country: string
    }
    isGuest?: boolean
  },
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const orderUrl = orderDetails.isGuest
      ? `${baseUrl}/track-order/${orderId}?email=${encodeURIComponent(email)}`
      : `${baseUrl}/account/orders/${orderId}`
    const fromEmail = process.env.RESEND_FROM_EMAIL || "orders@notifiers.reknur.com"
    const from = `reknur <${fromEmail}>`

    const formatPrice = (amount: number, currency: string) => {
      const formatted = (amount / 100).toFixed(2)
      const symbol = currency.toUpperCase() === "GBP" ? "£" : currency.toUpperCase() === "USD" ? "$" : "€"
      return `${symbol}${formatted}`
    }

    const itemsHtml = orderDetails.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
          <p style="margin: 0; font-size: 14px; color: #1a1a1a; font-weight: 500;">${item.name}</p>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: #666666;">Quantity: ${item.quantity}</p>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; text-align: right;">
          <p style="margin: 0; font-size: 14px; color: #1a1a1a; font-weight: 500;">${formatPrice(item.price, orderDetails.currency)}</p>
        </td>
      </tr>
    `,
      )
      .join("")

    const guestTrackingHtml = orderDetails.isGuest
      ? `
      <tr>
        <td style="padding: 0 40px 30px 40px; background-color: #f8f9fa; border-radius: 6px;">
          <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">Track Your Order</h2>
          <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 20px; color: #666666;">
            Track your order anytime using the button below:
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${orderUrl}" style="display: inline-block; padding: 12px 24px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
              Track Order #${orderId}
            </a>
          </div>
        </td>
      </tr>
      <tr><td style="height: 20px;"></td></tr>
    `
      : ""

    const plainText = `Order Confirmation #${orderId}\n\nHi ${orderDetails.customerName},\n\nThank you for your order!\n\nOrder Summary:\n${orderDetails.items.map((item) => `${item.name} (Qty: ${item.quantity}) - ${formatPrice(item.price, orderDetails.currency)}`).join("\n")}\n\nTotal: ${formatPrice(orderDetails.total, orderDetails.currency)}`

    const { data, error } = await resend.emails.send({
      from: from,
      to: email,
      subject: `Order Confirmation #${orderId}`,
      headers: getEmailHeaders(),
      text: plainText,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Confirmation</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            ${createPreheader(`Your order #${orderId} has been confirmed`)}
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;">
                    <tr>
                      <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 2px solid #1a1a1a;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #1a1a1a;">Order Confirmed!</h1>
                        <p style="margin: 10px 0 0 0; font-size: 16px; color: #666666;">Order #${orderId}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 30px 40px;">
                        <p style="margin: 0; font-size: 16px; line-height: 24px; color: #1a1a1a;">
                          Hi ${orderDetails.customerName},
                        </p>
                        <p style="margin: 16px 0 0 0; font-size: 16px; line-height: 24px; color: #666666;">
                          Thank you for your order! We've received your payment and are preparing your items for shipment.
                        </p>
                      </td>
                    </tr>

                    ${guestTrackingHtml}

                    <tr>
                      <td style="padding: 0 40px 30px 40px;">
                        <h2 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">Order Summary</h2>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          ${itemsHtml}
                          <tr>
                            <td style="padding: 20px 0 0 0;">
                              <p style="margin: 0; font-size: 16px; color: #1a1a1a; font-weight: 600;">Total</p>
                            </td>
                            <td style="padding: 20px 0 0 0; text-align: right;">
                              <p style="margin: 0; font-size: 18px; color: #1a1a1a; font-weight: 600;">${formatPrice(orderDetails.total, orderDetails.currency)}</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 0 40px 30px 40px; text-align: center;">
                        <a href="${orderUrl}" style="display: inline-block; padding: 14px 32px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">
                          ${orderDetails.isGuest ? "Track Your Order" : "View Order Details"}
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function sendOrderStatusUpdateEmail(
  email: string,
  orderId: string | number,
  orderDetails: {
    customerName: string
    oldStatus: string
    newStatus: string
    trackingNumber?: string
    carrier?: string
    estimatedDelivery?: string
  },
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const orderUrl = `${baseUrl}/account/orders/${orderId}`
    const fromEmail = process.env.RESEND_FROM_EMAIL || "orders@notifiers.reknur.com"
    const from = `reknur <${fromEmail}>`

    const statusMessages: Record<string, { title: string; message: string }> = {
      processing: {
        title: "Order is Being Processed",
        message: "We're preparing your order for shipment.",
      },
      shipped: {
        title: "Order Has Shipped!",
        message: "Your order is on its way!",
      },
      delivered: {
        title: "Order Delivered",
        message: "Your order has been delivered.",
      },
    }

    const statusInfo = statusMessages[orderDetails.newStatus] || {
      title: "Order Status Updated",
      message: `Your order status has been updated to: ${orderDetails.newStatus}`,
    }

    const plainText = `${statusInfo.title} - Order #${orderId}\n\nHi ${orderDetails.customerName},\n\n${statusInfo.message}`

    const { data, error } = await resend.emails.send({
      from: from,
      to: email,
      subject: `Order #${orderId} - ${statusInfo.title}`,
      headers: getEmailHeaders(),
      text: plainText,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
            ${createPreheader(statusInfo.title)}
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;">
                    <tr>
                      <td style="padding: 40px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px; color: #1a1a1a;">${statusInfo.title}</h1>
                        <p style="margin: 16px 0 0 0; font-size: 16px; color: #666666;">Order #${orderId}</p>
                        <p style="margin: 20px 0; font-size: 16px; color: #666666;">${statusInfo.message}</p>
                        <a href="${orderUrl}" style="display: inline-block; padding: 14px 32px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px;">
                          View Order Details
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`
    const fromEmail = process.env.RESEND_FROM_EMAIL || "orders@notifiers.reknur.com"
    const from = `reknur <${fromEmail}>`

    const plainText = `Reset Your Password\n\nWe received a request to reset your password. Visit this link:\n\n${resetUrl}\n\nThis link will expire in 1 hour.`

    const { data, error } = await resend.emails.send({
      from: from,
      to: email,
      subject: "Reset your password",
      headers: getEmailHeaders(),
      text: plainText,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
            ${createPreheader("Reset your password for reknur")}
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;">
                    <tr>
                      <td style="padding: 40px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px; color: #1a1a1a;">Reset Your Password</h1>
                        <p style="margin: 20px 0; font-size: 16px; color: #666666;">Click the button below to reset your password.</p>
                        <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px;">
                          Reset Password
                        </a>
                        <p style="margin: 20px 0 0 0; font-size: 14px; color: #999999;">This link will expire in 1 hour.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
