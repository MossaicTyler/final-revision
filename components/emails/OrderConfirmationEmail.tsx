import type * as React from "react"

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface ShippingAddress {
  fullName: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

interface OrderConfirmationEmailProps {
  email: string
  orderId: number
  items: OrderItem[]
  total: number
  currency: string
  customerName?: string
  shippingAddress?: ShippingAddress
}

export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({
  email,
  orderId,
  items,
  total,
  currency,
  customerName,
  shippingAddress,
}) => {
  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(total / 100)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const unsubscribeUrl = `${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}`

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order Confirmation #{orderId}</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          backgroundColor: "#f9fafb",
        }}
      >
        <table
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          style={{ backgroundColor: "#f9fafb", padding: "40px 20px" }}
        >
          <tr>
            <td align="center">
              <table
                width={600}
                cellPadding="0"
                cellSpacing="0"
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                }}
              >
                {/* Header */}
                <tr>
                  <td
                    style={{
                      background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
                      padding: "48px 40px",
                      textAlign: "center",
                    }}
                  >
                    <h1
                      style={{
                        margin: 0,
                        color: "#ffffff",
                        fontSize: "32px",
                        fontWeight: 700,
                        letterSpacing: "-0.5px",
                      }}
                    >
                      reknur
                    </h1>
                    <p style={{ margin: "12px 0 0 0", color: "#d1d5db", fontSize: "16px" }}>Curated Excellence</p>
                  </td>
                </tr>

                {/* Success Message */}
                <tr>
                  <td style={{ padding: "48px 40px 32px 40px", textAlign: "center" }}>
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        backgroundColor: "#d1fae5",
                        borderRadius: "50%",
                        margin: "0 auto 24px auto",
                      }}
                    >
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ marginTop: "16px" }}
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <h2 style={{ margin: "0 0 12px 0", color: "#111827", fontSize: "28px", fontWeight: 700 }}>
                      Order Confirmed!
                    </h2>
                    <p style={{ margin: 0, color: "#6b7280", fontSize: "16px", lineHeight: 1.6 }}>
                      Thank you for your purchase{customerName ? `, ${customerName}` : ""}! Your order is being
                      processed and will ship soon.
                    </p>
                  </td>
                </tr>

                {/* Order Number */}
                <tr>
                  <td style={{ padding: "0 40px 32px 40px" }}>
                    <div
                      style={{ backgroundColor: "#f9fafb", borderRadius: "8px", padding: "20px", textAlign: "center" }}
                    >
                      <p style={{ margin: "0 0 8px 0", color: "#6b7280", fontSize: "14px" }}>Order Number</p>
                      <p
                        style={{
                          margin: 0,
                          color: "#111827",
                          fontWeight: 700,
                          fontSize: "24px",
                          fontFamily: '"Courier New", monospace',
                        }}
                      >
                        #{orderId}
                      </p>
                    </div>
                  </td>
                </tr>

                {/* Order Items */}
                <tr>
                  <td style={{ padding: "0 40px 32px 40px" }}>
                    <h3 style={{ margin: "0 0 16px 0", color: "#111827", fontSize: "18px", fontWeight: 700 }}>
                      Order Details
                    </h3>
                    <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderTop: "1px solid #e5e7eb" }}>
                      {items.map((item, index) => {
                        const itemTotal = new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: currency.toUpperCase(),
                        }).format(item.price / 100)

                        const unitPrice = new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: currency.toUpperCase(),
                        }).format(item.price / item.quantity / 100)

                        return (
                          <tr key={index}>
                            <td style={{ padding: "16px 0", borderBottom: "1px solid #e5e7eb" }}>
                              <p style={{ margin: 0, fontWeight: 600, color: "#111827", fontSize: "15px" }}>
                                {item.name}
                              </p>
                              <p style={{ margin: "4px 0 0 0", color: "#6b7280", fontSize: "13px" }}>
                                Qty: {item.quantity} × {unitPrice}
                              </p>
                            </td>
                            <td
                              style={{
                                padding: "16px 0",
                                borderBottom: "1px solid #e5e7eb",
                                textAlign: "right",
                                fontWeight: 600,
                                color: "#111827",
                              }}
                            >
                              {itemTotal}
                            </td>
                          </tr>
                        )
                      })}
                      <tr>
                        <td colSpan={2} style={{ padding: "20px 0 0 0" }}>
                          <div style={{ textAlign: "right", paddingTop: "16px", borderTop: "2px solid #111827" }}>
                            <p style={{ margin: "0 0 8px 0", color: "#6b7280", fontSize: "14px" }}>Total Amount</p>
                            <p style={{ margin: 0, color: "#111827", fontWeight: 700, fontSize: "28px" }}>
                              {formattedTotal}
                            </p>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                {/* Shipping Address */}
                {shippingAddress && (
                  <tr>
                    <td style={{ padding: "32px 40px" }}>
                      <h3 style={{ margin: "0 0 16px 0", color: "#111827", fontSize: "18px", fontWeight: 700 }}>
                        Shipping Address
                      </h3>
                      <div
                        style={{
                          backgroundColor: "#f9fafb",
                          borderRadius: "8px",
                          padding: "20px",
                          borderLeft: "4px solid #111827",
                        }}
                      >
                        <p style={{ margin: 0, color: "#111827", fontWeight: 600, fontSize: "15px" }}>
                          {shippingAddress.fullName}
                        </p>
                        <p style={{ margin: "8px 0 0 0", color: "#6b7280", fontSize: "14px", lineHeight: 1.6 }}>
                          {shippingAddress.addressLine1}
                          <br />
                          {shippingAddress.addressLine2 && (
                            <>
                              {shippingAddress.addressLine2}
                              <br />
                            </>
                          )}
                          {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                          <br />
                          {shippingAddress.country}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* What's Next */}
                <tr>
                  <td style={{ padding: "32px 40px" }}>
                    <div
                      style={{
                        backgroundColor: "#dbeafe",
                        borderRadius: "8px",
                        padding: "24px",
                        borderLeft: "4px solid #2563eb",
                      }}
                    >
                      <h3 style={{ margin: "0 0 12px 0", color: "#1e40af", fontSize: "16px", fontWeight: 700 }}>
                        What happens next?
                      </h3>
                      <ul
                        style={{ margin: 0, paddingLeft: "20px", color: "#1e40af", fontSize: "14px", lineHeight: 1.8 }}
                      >
                        <li>We'll send you a shipping confirmation with tracking once your order ships</li>
                        <li>Track your order anytime from your account dashboard</li>
                        <li>Questions? Contact our support team - we're here to help!</li>
                      </ul>
                    </div>
                  </td>
                </tr>

                {/* CTA Button */}
                <tr>
                  <td style={{ padding: "0 40px 40px 40px", textAlign: "center" }}>
                    <a
                      href={`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/account/orders/${orderId}`}
                      style={{
                        display: "inline-block",
                        backgroundColor: "#111827",
                        color: "#ffffff",
                        textDecoration: "none",
                        padding: "16px 48px",
                        borderRadius: "8px",
                        fontWeight: 600,
                        fontSize: "16px",
                      }}
                    >
                      View Order Details
                    </a>
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td
                    style={{
                      backgroundColor: "#f9fafb",
                      padding: "32px 40px",
                      textAlign: "center",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    <p style={{ margin: "0 0 8px 0", color: "#6b7280", fontSize: "14px" }}>
                      Questions? We're here to help!
                    </p>
                    <p style={{ margin: "0 0 16px 0" }}>
                      <a
                        href="mailto:support@notifiers.reknur.com"
                        style={{ color: "#111827", textDecoration: "none", fontWeight: 500 }}
                      >
                        support@notifiers.reknur.com
                      </a>
                    </p>
                    <p style={{ margin: 0, color: "#9ca3af", fontSize: "12px" }}>
                      © {new Date().getFullYear()} reknur. All rights reserved.
                    </p>
                    <p style={{ margin: "12px 0 0 0", color: "#9ca3af", fontSize: "11px" }}>
                      This email was sent to {email}.{" "}
                      <a href={unsubscribeUrl} style={{ color: "#6b7280", textDecoration: "underline" }}>
                        Manage email preferences
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  )
}
