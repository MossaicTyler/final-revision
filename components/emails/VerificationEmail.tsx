import type * as React from "react"

interface VerificationEmailProps {
  email: string
  verificationUrl: string
}

export const VerificationEmail: React.FC<VerificationEmailProps> = ({ email, verificationUrl }) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const unsubscribeUrl = `${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}`

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verify Your Email</title>
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

                {/* Main Content */}
                <tr>
                  <td style={{ padding: "48px 40px 32px 40px", textAlign: "center" }}>
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        backgroundColor: "#dbeafe",
                        borderRadius: "50%",
                        margin: "0 auto 24px auto",
                      }}
                    >
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ marginTop: "16px" }}
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </div>
                    <h2 style={{ margin: "0 0 12px 0", color: "#111827", fontSize: "28px", fontWeight: 700 }}>
                      Verify Your Email Address
                    </h2>
                    <p style={{ margin: 0, color: "#6b7280", fontSize: "16px", lineHeight: 1.6 }}>
                      Welcome to reknur! Please verify your email address to complete your account setup and start
                      shopping.
                    </p>
                  </td>
                </tr>

                {/* Email Display */}
                <tr>
                  <td style={{ padding: "0 40px 32px 40px" }}>
                    <div
                      style={{ backgroundColor: "#f9fafb", borderRadius: "8px", padding: "20px", textAlign: "center" }}
                    >
                      <p style={{ margin: "0 0 8px 0", color: "#6b7280", fontSize: "14px" }}>Verifying email for:</p>
                      <p style={{ margin: 0, color: "#111827", fontWeight: 600, fontSize: "16px" }}>{email}</p>
                    </div>
                  </td>
                </tr>

                {/* CTA Button */}
                <tr>
                  <td style={{ padding: "0 40px 32px 40px", textAlign: "center" }}>
                    <a
                      href={verificationUrl}
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
                      Verify Email Address
                    </a>
                  </td>
                </tr>

                {/* Alternative Link */}
                <tr>
                  <td style={{ padding: "0 40px 40px 40px" }}>
                    <div
                      style={{
                        backgroundColor: "#fef3c7",
                        borderRadius: "8px",
                        padding: "20px",
                        borderLeft: "4px solid #f59e0b",
                      }}
                    >
                      <p style={{ margin: "0 0 12px 0", color: "#92400e", fontSize: "14px", fontWeight: 600 }}>
                        Button not working?
                      </p>
                      <p style={{ margin: 0, color: "#92400e", fontSize: "13px", lineHeight: 1.6 }}>
                        Copy and paste this link into your browser:
                      </p>
                      <p style={{ margin: "8px 0 0 0", color: "#2563eb", fontSize: "12px", wordBreak: "break-all" }}>
                        {verificationUrl}
                      </p>
                    </div>
                  </td>
                </tr>

                {/* Security Notice */}
                <tr>
                  <td style={{ padding: "0 40px 40px 40px" }}>
                    <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "24px" }}>
                      <p
                        style={{ margin: 0, color: "#6b7280", fontSize: "13px", lineHeight: 1.6, textAlign: "center" }}
                      >
                        This verification link will expire in 24 hours. If you didn't create an account with reknur, you
                        can safely ignore this email.
                      </p>
                    </div>
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
                        Unsubscribe
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
