import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const getEmailHeaders = () => ({
  "List-Unsubscribe": "{{{RESEND_UNSUBSCRIBE_URL}}}",
  "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  "X-Entity-Ref-ID": `reknur-${Date.now()}`,
  "X-Mailer": "reknur",
  "X-Priority": "3",
  "Importance": "Normal",
})

const createPreheader = (text: string) => `
  <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0" data-skip-in-text="true">
    ${text}
    <div>
       ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿
    </div>
  </div>
`

export async function sendVerificationEmail(email: string, token: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.reknur.com"
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`

    console.log("[v0] Sending verification email with URL:", verificationUrl.substring(0, 60) + "...")

    const fromEmail = process.env.RESEND_FROM_EMAIL || "verify@notifiers.reknur.com"
    const from = `reknur <${fromEmail}>`

    const plainText = `Welcome to reknur!\n\nThank you for creating your account. To get started, please confirm your email address by clicking the link below:\n\n${verificationUrl}\n\nThis confirmation link is valid for 24 hours.\n\nIf you did not create an account with reknur, please disregard this message.\n\nBest regards,\nThe reknur Team\n\n---\nreknur - Curated Excellence\n${baseUrl}`

    const { data, error } = await resend.emails.send({
      from: from,
      to: email,
      subject: "Confirm your reknur account",
      headers: getEmailHeaders(),
      text: plainText,
      html: `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html dir="ltr" lang="en">
          <head>
            <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
            <meta name="x-apple-disable-message-reformatting" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Confirm your reknur account</title>
          </head>
          ${createPreheader("Confirm your email address for reknur")}
          <body style="background-color:rgb(255,255,255);margin:0;padding:0">
            <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center" style="background-color:rgb(255,255,255)">
              <tbody>
                <tr>
                  <td style='background-color:rgb(255,255,255);font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"'>
                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;margin-right:auto;margin-left:auto;width:100%;padding:0rem">
                      <tbody>
                        <tr style="width:100%">
                          <td>
                            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="padding:2rem;text-align:center">
                              <tbody>
                                <tr>
                                  <td>
                                    <p style="font-size:1.875rem;line-height:1.2;margin-right:0rem;margin-left:0rem;margin-top:1rem;margin-bottom:0.5rem;padding:0rem;text-align:center;font-weight:600;color:rgb(26,26,26);font-family:'Playfair Display',serif">
                                      reknur
                                    </p>
                                    <p style="font-size:0.75rem;line-height:1.3333333333333333;font-weight:400;text-transform:uppercase;letter-spacing:0.1em;margin-top:0px;margin-bottom:2rem;color:rgb(115,115,115)">
                                      Curated Excellence
                                    </p>
                                    <h1 style="margin-bottom:1rem;margin-top:1rem;font-weight:500;font-size:1.875rem;line-height:1.2;color:rgb(26,26,26)">
                                      Welcome to reknur
                                    </h1>
                                    <p style="font-size:1rem;line-height:1.75rem;margin-bottom:2rem;margin-top:1rem;color:rgb(102,102,102)">
                                      Thank you for creating your account. To get started, please confirm your email address by clicking the button below.
                                    </p>
                                    <a href="${verificationUrl}" style="color:rgb(255,255,255);text-decoration-line:none;display:inline-block;align-items:center;border-radius:0.375rem;background-color:rgb(26,26,26);padding-right:2.5rem;padding-left:2.5rem;padding-bottom:0.875rem;padding-top:0.875rem;text-align:center;font-weight:600;font-size:1rem;line-height:1.5" target="_blank">
                                      Confirm Email Address
                                    </a>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="padding:1.5rem 2rem;text-align:center;border-top:1px solid rgb(238,238,238)">
                              <tbody>
                                <tr>
                                  <td>
                                    <p style="font-size:0.875rem;line-height:1.4285714285714286;color:rgb(102,102,102);margin-top:0px;margin-bottom:1rem">
                                      This confirmation link is valid for 24 hours.
                                    </p>
                                    <p style="font-size:0.875rem;line-height:1.4285714285714286;color:rgb(153,153,153);margin-top:0px;margin-bottom:0.5rem">
                                      If you did not create an account with reknur, please disregard this message.
                                    </p>
                                    <p style="font-size:0.75rem;line-height:1.3333333333333333;color:rgb(156,163,175);margin-top:1rem;margin-bottom:0px">
                                      reknur - ${baseUrl}
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error("[v0] Resend API error:", error)
      return { success: false, error: error.message }
    }

    console.log("[v0] Email sent successfully via Resend, message ID:", data?.id)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error("[v0] Email sending exception:", error)
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
        <td style="padding:0.75rem 0;border-bottom:1px solid rgb(238,238,238)">
          <p style="margin:0;font-size:0.875rem;line-height:1.4285714285714286;color:rgb(26,26,26);font-weight:500">${item.name}</p>
          <p style="margin:0.25rem 0 0 0;font-size:0.875rem;line-height:1.4285714285714286;color:rgb(102,102,102)">Quantity: ${item.quantity}</p>
        </td>
        <td style="padding:0.75rem 0;border-bottom:1px solid rgb(238,238,238);text-align:right">
          <p style="margin:0;font-size:0.875rem;line-height:1.4285714285714286;color:rgb(26,26,26);font-weight:500">${formatPrice(item.price, orderDetails.currency)}</p>
        </td>
      </tr>
    `,
      )
      .join("")

    const plainText = `Order Confirmation #${orderId}\n\nHi ${orderDetails.customerName},\n\nThank you for your order!\n\nOrder Summary:\n${orderDetails.items.map((item) => `${item.name} (Qty: ${item.quantity}) - ${formatPrice(item.price, orderDetails.currency)}`).join("\n")}\n\nTotal: ${formatPrice(orderDetails.total, orderDetails.currency)}`

    const { data, error } = await resend.emails.send({
      from: from,
      to: email,
      subject: `Order Confirmation #${orderId}`,
      headers: getEmailHeaders(),
      text: plainText,
      html: `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html dir="ltr" lang="en">
          <head>
            <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
            <meta name="x-apple-disable-message-reformatting" />
          </head>
          ${createPreheader(`Your order #${orderId} has been confirmed`)}
          <body style="background-color:rgb(255,255,255)">
            <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center">
              <tbody>
                <tr>
                  <td style='background-color:rgb(255,255,255);font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"'>
                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;margin-right:auto;margin-left:auto;width:100%;padding:0rem">
                      <tbody>
                        <tr style="width:100%">
                          <td>
                            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="padding:2rem;text-align:center">
                              <tbody>
                                <tr>
                                  <td>
                                    <p style="font-size:1.875rem;line-height:1.2;margin-right:0rem;margin-left:0rem;margin-top:1rem;margin-bottom:0.5rem;padding:0rem;text-align:center;font-weight:600;color:rgb(26,26,26);font-family:'Playfair Display',serif">
                                      reknur
                                    </p>
                                    <p style="font-size:0.75rem;line-height:1.3333333333333333;font-weight:400;text-transform:uppercase;letter-spacing:0.1em;margin-top:0px;margin-bottom:0.5rem;color:rgb(115,115,115)">
                                      Curated Excellence
                                    </p>
                                    <h1 style="margin-bottom:0.5rem;margin-top:1.5rem;font-weight:500;font-size:1.875rem;line-height:1.2;color:rgb(26,26,26)">
                                      Order Confirmed!
                                    </h1>
                                    <p style="font-size:1rem;line-height:1.5;margin-top:0.5rem;margin-bottom:1.5rem;color:rgb(102,102,102)">
                                      Order #${orderId}
                                    </p>
                                    <p style="font-size:1rem;line-height:1.75rem;margin-bottom:2rem;margin-top:0rem;color:rgb(26,26,26)">
                                      Hi ${orderDetails.customerName},
                                    </p>
                                    <p style="font-size:1rem;line-height:1.75rem;margin-bottom:2rem;margin-top:0rem;color:rgb(102,102,102)">
                                      Thank you for your order! We've received your payment and are preparing your items for shipment.
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            
                            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:1.5rem;margin-top:0rem;border-radius:0.75rem;background-color:rgba(228,197,160,0.1);background-image:radial-gradient(circle at bottom right,rgb(228,197,160) 0%,transparent 60%);padding:2rem;text-align:center">
                              <tbody>
                                <tr>
                                  <td>
                                    <h2 style="margin:0rem 0rem 1.5rem 0rem;font-weight:500;font-size:1.25rem;line-height:1.4;color:rgb(156,123,74);text-transform:uppercase;letter-spacing:0.05em;font-size:0.875rem">
                                      Order Summary
                                    </h2>
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                      ${itemsHtml}
                                      <tr>
                                        <td style="padding:1.25rem 0 0 0">
                                          <p style="margin:0;font-size:1.125rem;line-height:1.5555555555555556;color:rgb(26,26,26);font-weight:600">Total</p>
                                        </td>
                                        <td style="padding:1.25rem 0 0 0;text-align:right">
                                          <p style="margin:0;font-size:1.5rem;line-height:1.3333333333333333;color:rgb(26,26,26);font-weight:700">${formatPrice(orderDetails.total, orderDetails.currency)}</p>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>

                            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="padding-bottom:2rem;text-align:center">
                              <tbody>
                                <tr>
                                  <td>
                                    <a href="${orderUrl}" style="color:rgb(255,255,255);text-decoration-line:none;display:inline-flex;align-items:center;border-radius:0.375rem;background-color:rgb(26,26,26);padding-right:2.5rem;padding-left:2.5rem;padding-bottom:0.875rem;padding-top:0.875rem;text-align:center;font-weight:600;font-size:1rem;line-height:1.5" target="_blank">
                                      ${orderDetails.isGuest ? "Track Your Order" : "View Order Details"}
                                    </a>
                                  </td>
                                </tr>
                              </tbody>
                            </table>

                            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="padding:1.5rem 2rem;text-align:center;border-top:1px solid rgb(238,238,238)">
                              <tbody>
                                <tr>
                                  <td>
                                    <p style="font-size:0.875rem;line-height:1.4285714285714286;color:rgb(153,153,153);margin-top:0px;margin-bottom:0px">
                                      We'll send you a shipping confirmation email with tracking information once your order ships.
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
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
    notes?: string
  },
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const orderUrl = `${baseUrl}/account/orders/${orderId}`
    const fromEmail = process.env.RESEND_FROM_EMAIL || "orders@notifiers.reknur.com"
    const from = `reknur <${fromEmail}>`

    const statusMessages: Record<string, { title: string; message: string; color: string; bgColor: string }> = {
      processing: {
        title: "Order is Being Processed",
        message: "We're preparing your order for shipment.",
        color: "rgb(251,122,0)",
        bgColor: "rgba(251,122,0,0.1)",
      },
      delayed: {
        title: "Order Delayed",
        message: "We're experiencing a delay with your order. We apologize for the inconvenience.",
        color: "rgb(234,88,12)",
        bgColor: "rgba(234,88,12,0.1)",
      },
      shipped: {
        title: "Order Has Shipped!",
        message: "Your order is on its way!",
        color: "rgb(16,185,129)",
        bgColor: "rgba(16,185,129,0.1)",
      },
      delivered: {
        title: "Order Delivered",
        message: "Your order has been delivered.",
        color: "rgb(34,197,94)",
        bgColor: "rgba(34,197,94,0.1)",
      },
    }

    const statusInfo = statusMessages[orderDetails.newStatus] || {
      title: "Order Status Updated",
      message: `Your order status has been updated to: ${orderDetails.newStatus}`,
      color: "rgb(75,85,99)",
      bgColor: "rgba(75,85,99,0.1)",
    }

    const trackingHtml = orderDetails.trackingNumber ? `
      <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:2rem 0;padding:1.5rem;background-color:rgb(249,249,249);border-radius:0.5rem">
        <tbody>
          <tr>
            <td>
              <p style="margin:0 0 0.5rem 0;font-size:0.875rem;line-height:1.4285714285714286;color:rgb(102,102,102);text-transform:uppercase;letter-spacing:0.05em">Tracking Number</p>
              <p style="margin:0;font-size:1.125rem;line-height:1.5555555555555556;color:rgb(26,26,26);font-weight:600;font-family:monospace">${orderDetails.trackingNumber}</p>
              ${orderDetails.carrier ? `<p style="margin:0.5rem 0 0 0;font-size:0.875rem;line-height:1.4285714285714286;color:rgb(102,102,102)">Carrier: ${orderDetails.carrier}</p>` : ""}
              ${orderDetails.estimatedDelivery ? `<p style="margin:0.25rem 0 0 0;font-size:0.875rem;line-height:1.4285714285714286;color:rgb(102,102,102)">Estimated Delivery: ${new Date(orderDetails.estimatedDelivery).toLocaleDateString()}</p>` : ""}
            </td>
          </tr>
        </tbody>
      </table>
    ` : ""

    const notesHtml = orderDetails.notes ? `
      <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:1.5rem 0;padding:1.5rem;background-color:rgb(254,252,232);border-left:4px solid rgb(234,179,8);border-radius:0.5rem">
        <tbody>
          <tr>
            <td>
              <p style="margin:0 0 0.5rem 0;font-size:0.875rem;line-height:1.4285714285714286;color:rgb(113,63,18);text-transform:uppercase;letter-spacing:0.05em;font-weight:600">Additional Information</p>
              <p style="margin:0;font-size:0.875rem;line-height:1.75;color:rgb(113,63,18)">${orderDetails.notes}</p>
            </td>
          </tr>
        </tbody>
      </table>
    ` : ""

    const plainText = `${statusInfo.title} - Order #${orderId}\n\nHi ${orderDetails.customerName},\n\n${statusInfo.message}${orderDetails.notes ? `\n\nAdditional Information:\n${orderDetails.notes}` : ""}`

    const { data, error } = await resend.emails.send({
      from: from,
      to: email,
      subject: `Order #${orderId} - ${statusInfo.title}`,
      headers: getEmailHeaders(),
      text: plainText,
      html: `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html dir="ltr" lang="en">
          <head>
            <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
            <meta name="x-apple-disable-message-reformatting" />
          </head>
          ${createPreheader(statusInfo.title)}
          <body style="background-color:rgb(255,255,255)">
            <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center">
              <tbody>
                <tr>
                  <td style='background-color:rgb(255,255,255);font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"'>
                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;margin-right:auto;margin-left:auto;width:100%;padding:0rem">
                      <tbody>
                        <tr style="width:100%">
                          <td>
                            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="padding:2rem;text-align:center">
                              <tbody>
                                <tr>
                                  <td>
                                    <p style="font-size:1.875rem;line-height:1.2;margin-right:0rem;margin-left:0rem;margin-top:1rem;margin-bottom:0.5rem;padding:0rem;text-align:center;font-weight:600;color:rgb(26,26,26);font-family:'Playfair Display',serif">
                                      reknur
                                    </p>
                                    <p style="font-size:0.75rem;line-height:1.3333333333333333;font-weight:400;text-transform:uppercase;letter-spacing:0.1em;margin-top:0px;margin-bottom:2rem;color:rgb(115,115,115)">
                                      Curated Excellence
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>

                            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:1.5rem;margin-top:0rem;border-radius:0.75rem;background-color:${statusInfo.bgColor};background-image:radial-gradient(circle at bottom right,${statusInfo.color} 0%,transparent 60%);padding:2rem;text-align:center">
                              <tbody>
                                <tr>
                                  <td>
                                    <h1 style="margin:0rem;font-weight:500;font-size:1.875rem;line-height:1.2;color:rgb(26,26,26)">
                                      ${statusInfo.title}
                                    </h1>
                                    <p style="font-size:1rem;line-height:1.5;margin-bottom:1rem;margin-top:1rem;color:rgb(102,102,102)">
                                      Order #${orderId}
                                    </p>
                                    <p style="font-size:1.125rem;line-height:1.5555555555555556;margin-bottom:2rem;margin-top:1rem;font-weight:500;color:rgb(26,26,26)">
                                      Hi ${orderDetails.customerName},
                                    </p>
                                    <p style="font-size:1rem;line-height:1.75rem;color:rgb(102,102,102);margin-top:0px;margin-bottom:0rem">
                                      ${statusInfo.message}
                                    </p>
                                    ${trackingHtml}
                                    ${notesHtml}
                                    <a href="${orderUrl}" style="color:rgb(255,255,255);text-decoration-line:none;display:inline-flex;align-items:center;border-radius:0.375rem;background-color:rgb(26,26,26);padding-right:2.5rem;padding-left:2.5rem;padding-bottom:0.875rem;padding-top:0.875rem;text-align:center;font-weight:600;font-size:1rem;line-height:1.5" target="_blank">
                                      View Order Details
                                    </a>
                                  </td>
                                </tr>
                              </tbody>
                            </table>

                            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="padding:1.5rem 2rem;text-align:center;border-top:1px solid rgb(238,238,238)">
                              <tbody>
                                <tr>
                                  <td>
                                    <p style="font-size:0.875rem;line-height:1.4285714285714286;color:rgb(153,153,153);margin-top:0px;margin-bottom:0px">
                                      Thank you for shopping with reknur. We appreciate your business.
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
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

export async function sendShippingNotificationEmail(
  email: string,
  orderId: string | number,
  shippingDetails: {
    customerName: string
    status: "shipped" | "delivered"
    trackingNumber?: string
    carrier?: string
    estimatedDelivery?: string
    notes?: string
  },
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const trackingUrl = shippingDetails.trackingNumber 
      ? `${baseUrl}/account/orders/${orderId}` 
      : `${baseUrl}/account/orders/${orderId}`
    const fromEmail = process.env.RESEND_FROM_EMAIL || "shipping@notifiers.reknur.com"
    const from = `reknur Shipping <${fromEmail}>`

    const isDelivered = shippingDetails.status === "delivered"
    const title = isDelivered ? "Your Order Has Been Delivered!" : "Your Order Has Shipped!"
    const message = isDelivered 
      ? "Your package has been successfully delivered. We hope you enjoy your purchase!" 
      : "Your order is on its way and will arrive soon."

    const trackingHtml = shippingDetails.trackingNumber ? `
      <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:2rem 0;padding:2rem;background: linear-gradient(135deg, rgb(249,249,249) 0%, rgb(243,244,246) 100%);border-radius:0.75rem;border:1px solid rgb(229,231,235)">
        <tbody>
          <tr>
            <td style="text-align:center">
              <p style="margin:0 0 1rem 0;font-size:0.75rem;line-height:1.3333333333333333;color:rgb(107,114,128);text-transform:uppercase;letter-spacing:0.1em;font-weight:600">Tracking Information</p>
              <p style="margin:0 0 0.5rem 0;font-size:1.5rem;line-height:1.3333333333333333;color:rgb(26,26,26);font-weight:700;font-family:monospace">${shippingDetails.trackingNumber}</p>
              ${shippingDetails.carrier ? `<p style="margin:0;font-size:1rem;line-height:1.5;color:rgb(75,85,99);font-weight:500">via ${shippingDetails.carrier}</p>` : ""}
              ${shippingDetails.estimatedDelivery && !isDelivered ? `
                <p style="margin:1rem 0 0 0;padding-top:1rem;border-top:1px solid rgb(229,231,235);font-size:0.875rem;line-height:1.4285714285714286;color:rgb(107,114,128)">
                  Estimated Delivery: <strong style="color:rgb(26,26,26)">${new Date(shippingDetails.estimatedDelivery).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                </p>
              ` : ""}
            </td>
          </tr>
        </tbody>
      </table>
    ` : ""

    const notesHtml = shippingDetails.notes ? `
      <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:1.5rem 0;padding:1.5rem;background-color:rgb(239,246,255);border-left:4px solid rgb(59,130,246);border-radius:0.5rem">
        <tbody>
          <tr>
            <td>
              <p style="margin:0 0 0.5rem 0;font-size:0.875rem;line-height:1.4285714285714286;color:rgb(30,64,175);text-transform:uppercase;letter-spacing:0.05em;font-weight:600">Shipping Note</p>
              <p style="margin:0;font-size:0.875rem;line-height:1.75;color:rgb(30,58,138)">${shippingDetails.notes}</p>
            </td>
          </tr>
        </tbody>
      </table>
    ` : ""

    const plainText = `${title} - Order #${orderId}\n\nHi ${shippingDetails.customerName},\n\n${message}${shippingDetails.trackingNumber ? `\n\nTracking Number: ${shippingDetails.trackingNumber}${shippingDetails.carrier ? `\nCarrier: ${shippingDetails.carrier}` : ""}` : ""}${shippingDetails.notes ? `\n\nShipping Note:\n${shippingDetails.notes}` : ""}`

    const { data, error } = await resend.emails.send({
      from: from,
      to: email,
      subject: `${title} - Order #${orderId}`,
      headers: getEmailHeaders(),
      text: plainText,
      html: `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html dir="ltr" lang="en">
          <head>
            <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
            <meta name="x-apple-disable-message-reformatting" />
          </head>
          ${createPreheader(title)}
          <body style="background-color:rgb(255,255,255)">
            <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center">
              <tbody>
                <tr>
                  <td style='background-color:rgb(255,255,255);font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"'>
                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;margin-right:auto;margin-left:auto;width:100%;padding:0rem">
                      <tbody>
                        <tr style="width:100%">
                          <td>
                            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="padding:2rem;text-align:center">
                              <tbody>
                                <tr>
                                  <td>
                                    <p style="font-size:1.875rem;line-height:1.2;margin-right:0rem;margin-left:0rem;margin-top:1rem;margin-bottom:0.5rem;padding:0rem;text-align:center;font-weight:600;color:rgb(26,26,26);font-family:'Playfair Display',serif">
                                      reknur
                                    </p>
                                    <p style="font-size:0.75rem;line-height:1.3333333333333333;font-weight:400;text-transform:uppercase;letter-spacing:0.1em;margin-top:0px;margin-bottom:2rem;color:rgb(115,115,115)">
                                      Curated Excellence
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>

                            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:1.5rem;margin-top:0rem;border-radius:0.75rem;background-color:${isDelivered ? "rgba(34,197,94,0.1)" : "rgba(16,185,129,0.1)"};background-image:radial-gradient(circle at bottom right,${isDelivered ? "rgb(34,197,94)" : "rgb(16,185,129)"} 0%,transparent 60%);padding:2.5rem 2rem;text-align:center">
                              <tbody>
                                <tr>
                                  <td>
                                    <div style="width:64px;height:64px;margin:0 auto 1.5rem auto;background-color:${isDelivered ? "rgb(34,197,94)" : "rgb(16,185,129)"};border-radius:50%;display:flex;align-items:center;justify-content:center">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        ${isDelivered ? '<polyline points="20 6 9 17 4 12"></polyline>' : '<rect x="1" y="3" width="15" height="13"></rect><path d="M16 8h5l3 3v5h-2"></path><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>'}
                                      </svg>
                                    </div>
                                    <h1 style="margin:0rem 0rem 0.5rem 0rem;font-weight:600;font-size:2.25rem;line-height:1.1111111111111112;color:rgb(26,26,26)">
                                      ${title}
                                    </h1>
                                    <p style="font-size:1rem;line-height:1.5;margin-bottom:0.5rem;margin-top:0.5rem;color:rgb(107,114,128)">
                                      Order #${orderId}
                                    </p>
                                    <p style="font-size:1.125rem;line-height:1.75;margin-bottom:0rem;margin-top:2rem;font-weight:500;color:rgb(26,26,26)">
                                      Hi ${shippingDetails.customerName},
                                    </p>
                                    <p style="font-size:1.125rem;line-height:1.75;color:rgb(75,85,99);margin-top:1rem;margin-bottom:0rem">
                                      ${message}
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>

                            ${trackingHtml}
                            ${notesHtml}

                            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="padding-bottom:2rem;text-align:center">
                              <tbody>
                                <tr>
                                  <td>
                                    <a href="${trackingUrl}" style="color:rgb(255,255,255);text-decoration-line:none;display:inline-flex;align-items:center;border-radius:0.5rem;background-color:rgb(26,26,26);padding-right:2.5rem;padding-left:2.5rem;padding-bottom:1rem;padding-top:1rem;text-align:center;font-weight:600;font-size:1rem;line-height:1.5" target="_blank">
                                      ${isDelivered ? "View Order Details" : "Track Your Package"}
                                    </a>
                                  </td>
                                </tr>
                              </tbody>
                            </table>

                            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="padding:2rem;text-align:center;border-top:1px solid rgb(229,231,235)">
                              <tbody>
                                <tr>
                                  <td>
                                    <p style="font-size:0.875rem;line-height:1.4285714285714286;color:rgb(107,114,128);margin-top:0px;margin-bottom:0.5rem">
                                      ${isDelivered ? "We hope you love your purchase! If you have any questions or concerns, please don't hesitate to contact us." : "Questions about your shipment? Contact our customer service team anytime."}
                                    </p>
                                    <p style="font-size:0.75rem;line-height:1.3333333333333333;color:rgb(156,163,175);margin-top:1rem;margin-bottom:0px">
                                      Thank you for shopping with reknur
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
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
    const fromEmail = process.env.RESEND_FROM_EMAIL || "reset@notifiers.reknur.com"
    const from = `reknur <${fromEmail}>`

    const plainText = `Reset Your Password\n\nWe received a request to reset your password. Visit this link:\n\n${resetUrl}\n\nThis link will expire in 1 hour.`

    const { data, error } = await resend.emails.send({
      from: from,
      to: email,
      subject: "Reset your password",
      headers: getEmailHeaders(),
      text: plainText,
      html: `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html dir="ltr" lang="en">
          <head>
            <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
            <meta name="x-apple-disable-message-reformatting" />
          </head>
          ${createPreheader("Reset your password for reknur")}
          <body style="background-color:rgb(255,255,255)">
            <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center">
              <tbody>
                <tr>
                  <td style='background-color:rgb(255,255,255);font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"'>
                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;margin-right:auto;margin-left:auto;width:100%;padding:0rem">
                      <tbody>
                        <tr style="width:100%">
                          <td>
                            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="padding:2rem;text-align:center">
                              <tbody>
                                <tr>
                                  <td>
                                    <p style="font-size:1.875rem;line-height:1.2;margin-right:0rem;margin-left:0rem;margin-top:1rem;margin-bottom:0.5rem;padding:0rem;text-align:center;font-weight:600;color:rgb(26,26,26);font-family:'Playfair Display',serif">
                                      reknur
                                    </p>
                                    <p style="font-size:0.75rem;line-height:1.3333333333333333;font-weight:400;text-transform:uppercase;letter-spacing:0.1em;margin-top:0px;margin-bottom:2rem;color:rgb(115,115,115)">
                                      Curated Excellence
                                    </p>
                                    <h1 style="margin-bottom:1rem;margin-top:1rem;font-weight:500;font-size:1.875rem;line-height:1.2;color:rgb(26,26,26)">
                                      Reset Your Password
                                    </h1>
                                    <p style="font-size:1rem;line-height:1.75rem;margin-bottom:2rem;margin-top:1rem;color:rgb(102,102,102)">
                                      We received a request to reset your password. Click the button below to create a new password.
                                    </p>
                                    <a href="${resetUrl}" style="color:rgb(255,255,255);text-decoration-line:none;display:inline-flex;align-items:center;border-radius:0.375rem;background-color:rgb(26,26,26);padding-right:2.5rem;padding-left:2.5rem;padding-bottom:0.875rem;padding-top:0.875rem;text-align:center;font-weight:600;font-size:1rem;line-height:1.5" target="_blank">
                                      Reset Password
                                    </a>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="padding:1.5rem 2rem;text-align:center;border-top:1px solid rgb(238,238,238)">
                              <tbody>
                                <tr>
                                  <td>
                                    <p style="font-size:0.875rem;line-height:1.4285714285714286;color:rgb(153,153,153);margin-top:0px;margin-bottom:0px">
                                      This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
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
