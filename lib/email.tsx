import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`

    const fromEmail = process.env.RESEND_FROM_EMAIL || "auth@notifiers.reknur.com"

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Verify your email address",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                      <td style="padding: 40px 40px 20px 40px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #1a1a1a;">Verify Your Email Address</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 40px 30px 40px; text-align: center;">
                        <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #666666;">
                          Thank you for signing up! Please click the button below to verify your email address and activate your account.
                        </p>
                        <a href="${verificationUrl}" style="display: inline-block; padding: 14px 32px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500; margin: 20px 0;">
                          Verify Email Address
                        </a>
                        <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 20px; color: #999999;">
                          Or copy and paste this link into your browser:
                        </p>
                        <p style="margin: 10px 0 0 0; font-size: 14px; line-height: 20px; color: #666666; word-break: break-all;">
                          ${verificationUrl}
                        </p>
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
                  <!-- Added unsubscribe footer -->
                  <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                    <tr>
                      <td style="text-align: center; padding: 10px;">
                        <p style="margin: 0; font-size: 12px; color: #999999;">
                          <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color: #999999; text-decoration: underline;">Unsubscribe</a>
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
  },
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const orderUrl = `${baseUrl}/account/orders/${orderId}`
    const fromEmail = process.env.RESEND_FROM_EMAIL || "orders@notifiers.reknur.com"

    // Format currency
    const formatPrice = (amount: number, currency: string) => {
      const formatted = (amount / 100).toFixed(2)
      const symbol = currency.toUpperCase() === "GBP" ? "£" : currency.toUpperCase() === "USD" ? "$" : "€"
      return `${symbol}${formatted}`
    }

    // Generate items HTML
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

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Order Confirmation #${orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Confirmation</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 2px solid #000000;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #1a1a1a;">Order Confirmed!</h1>
                        <p style="margin: 10px 0 0 0; font-size: 16px; color: #666666;">Order #${orderId}</p>
                      </td>
                    </tr>
                    
                    <!-- Thank you message -->
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

                    <!-- Order Items -->
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

                    <!-- Shipping Address -->
                    <tr>
                      <td style="padding: 0 40px 30px 40px;">
                        <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">Shipping Address</h2>
                        <p style="margin: 0; font-size: 14px; line-height: 20px; color: #666666;">
                          ${orderDetails.shippingAddress.fullName}<br>
                          ${orderDetails.shippingAddress.addressLine1}<br>
                          ${orderDetails.shippingAddress.addressLine2 ? `${orderDetails.shippingAddress.addressLine2}<br>` : ""}
                          ${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} ${orderDetails.shippingAddress.postalCode}<br>
                          ${orderDetails.shippingAddress.country}
                        </p>
                      </td>
                    </tr>

                    <!-- CTA Button -->
                    <tr>
                      <td style="padding: 0 40px 30px 40px; text-align: center;">
                        <a href="${orderUrl}" style="display: inline-block; padding: 14px 32px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">
                          View Order Details
                        </a>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding: 20px 40px 40px 40px; text-align: center; border-top: 1px solid #eeeeee;">
                        <p style="margin: 0; font-size: 14px; line-height: 20px; color: #999999;">
                          You'll receive a shipping confirmation email with tracking information once your order ships.
                        </p>
                        <p style="margin: 12px 0 0 0; font-size: 14px; line-height: 20px; color: #999999;">
                          Questions? Contact us at support@reknur.com
                        </p>
                      </td>
                    </tr>
                  </table>
                  <!-- Added unsubscribe footer -->
                  <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                    <tr>
                      <td style="text-align: center; padding: 10px;">
                        <p style="margin: 0; font-size: 12px; color: #999999;">
                          <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color: #999999; text-decoration: underline;">Unsubscribe</a>
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

    // Status-specific messaging
    const statusMessages: Record<string, { title: string; message: string; color: string }> = {
      processing: {
        title: "Order is Being Processed",
        message: "We're preparing your order for shipment. You'll receive another email once it ships.",
        color: "#0066cc",
      },
      shipped: {
        title: "Order Has Shipped!",
        message: "Your order is on its way! Track your package using the information below.",
        color: "#00aa00",
      },
      delivered: {
        title: "Order Delivered",
        message: "Your order has been delivered. We hope you enjoy your purchase!",
        color: "#00aa00",
      },
      cancelled: {
        title: "Order Cancelled",
        message: "Your order has been cancelled. If you have any questions, please contact our support team.",
        color: "#cc0000",
      },
    }

    const statusInfo = statusMessages[orderDetails.newStatus] || {
      title: "Order Status Updated",
      message: `Your order status has been updated to: ${orderDetails.newStatus}`,
      color: "#666666",
    }

    // Tracking information HTML (only for shipped status)
    const trackingHtml =
      orderDetails.newStatus === "shipped" && orderDetails.trackingNumber
        ? `
      <tr>
        <td style="padding: 0 40px 30px 40px;">
          <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">Tracking Information</h2>
          <p style="margin: 0; font-size: 14px; line-height: 20px; color: #666666;">
            <strong>Tracking Number:</strong> ${orderDetails.trackingNumber}<br>
            ${orderDetails.carrier ? `<strong>Carrier:</strong> ${orderDetails.carrier}<br>` : ""}
            ${orderDetails.estimatedDelivery ? `<strong>Estimated Delivery:</strong> ${new Date(orderDetails.estimatedDelivery).toLocaleDateString()}<br>` : ""}
          </p>
        </td>
      </tr>
    `
        : ""

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Order #${orderId} - ${statusInfo.title}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Status Update</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 2px solid ${statusInfo.color};">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #1a1a1a;">${statusInfo.title}</h1>
                        <p style="margin: 10px 0 0 0; font-size: 16px; color: #666666;">Order #${orderId}</p>
                      </td>
                    </tr>
                    
                    <!-- Message -->
                    <tr>
                      <td style="padding: 30px 40px;">
                        <p style="margin: 0; font-size: 16px; line-height: 24px; color: #1a1a1a;">
                          Hi ${orderDetails.customerName},
                        </p>
                        <p style="margin: 16px 0 0 0; font-size: 16px; line-height: 24px; color: #666666;">
                          ${statusInfo.message}
                        </p>
                      </td>
                    </tr>

                    ${trackingHtml}

                    <!-- CTA Button -->
                    <tr>
                      <td style="padding: 0 40px 30px 40px; text-align: center;">
                        <a href="${orderUrl}" style="display: inline-block; padding: 14px 32px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">
                          View Order Details
                        </a>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding: 20px 40px 40px 40px; text-align: center; border-top: 1px solid #eeeeee;">
                        <p style="margin: 0; font-size: 14px; line-height: 20px; color: #999999;">
                          Questions? Contact us at support@reknur.com
                        </p>
                      </td>
                    </tr>
                  </table>
                  <!-- Added unsubscribe footer -->
                  <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                    <tr>
                      <td style="text-align: center; padding: 10px;">
                        <p style="margin: 0; font-size: 12px; color: #999999;">
                          <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color: #999999; text-decoration: underline;">Unsubscribe</a>
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

export async function sendPasswordResetEmail(email: string, token: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`

    const fromEmail = process.env.RESEND_FROM_EMAIL || "auth@notifiers.reknur.com"

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Reset your password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                      <td style="padding: 40px 40px 20px 40px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #1a1a1a;">Reset Your Password</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 40px 30px 40px; text-align: center;">
                        <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #666666;">
                          We received a request to reset your password. Click the button below to set a new password.
                        </p>
                        <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500; margin: 20px 0;">
                          Reset Password
                        </a>
                        <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 20px; color: #999999;">
                          Or copy and paste this link into your browser:
                        </p>
                        <p style="margin: 10px 0 0 0; font-size: 14px; line-height: 20px; color: #666666; word-break: break-all;">
                          ${resetUrl}
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 40px 40px 40px; text-align: center; border-top: 1px solid #eeeeee;">
                        <p style="margin: 0; font-size: 14px; line-height: 20px; color: #999999;">
                          This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>
                  </table>
                  <!-- Added unsubscribe footer -->
                  <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                    <tr>
                      <td style="text-align: center; padding: 10px;">
                        <p style="margin: 0; font-size: 12px; color: #999999;">
                          <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color: #999999; text-decoration: underline;">Unsubscribe</a>
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
