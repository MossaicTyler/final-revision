import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { createSession, setSessionCookie } from "@/lib/auth"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get("token")

  console.log("[v0] ===== VERIFICATION ROUTE HANDLER START =====")
  console.log("[v0] Token received:", token ? token.substring(0, 20) + "..." : "NONE")

  if (!token) {
    console.log("[v0] No token provided, redirecting to error page")
    return NextResponse.redirect(new URL("/auth/verify-email?error=no-token", request.url))
  }

  try {
    console.log("[v0] Querying database for token")
    const result = await sql`
      SELECT id, email, name, verification_token, verification_token_expires, email_verified
      FROM users
      WHERE verification_token = ${token}
    `

    console.log("[v0] Database query completed. Rows found:", result.length)

    if (result.length === 0) {
      console.log("[v0] No user found with this token")
      return NextResponse.redirect(new URL("/auth/verify-email?error=invalid-token", request.url))
    }

    const user = result[0]

    console.log("[v0] User found:", {
      userId: user.id,
      email: user.email,
      emailVerified: user.email_verified,
    })

    // If already verified, create session and redirect to success
    if (user.email_verified) {
      console.log("[v0] User already verified, creating session")
      
      try {
        await mergeGuestCartToUser(user.id)

        const sessionToken = await createSession({
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: true,
        })

        await setSessionCookie(sessionToken)
        console.log("[v0] Session created for already-verified user")
        
        return NextResponse.redirect(new URL("/auth/verify-email?success=already-verified", request.url))
      } catch (sessionError) {
        console.error("[v0] Session creation failed for verified user:", sessionError)
        return NextResponse.redirect(new URL("/auth/verify-email?error=session-failed", request.url))
      }
    }

    // Check token expiration
    const expiresAt = new Date(user.verification_token_expires)
    const now = new Date()

    console.log("[v0] Token expiration check:", {
      expiresAt: expiresAt.toISOString(),
      now: now.toISOString(),
      expired: expiresAt < now,
    })

    if (expiresAt < now) {
      console.log("[v0] Token expired")
      return NextResponse.redirect(new URL("/auth/verify-email?error=expired", request.url))
    }

    // Mark email as verified
    console.log("[v0] Marking email as verified")
    await sql`
      UPDATE users
      SET email_verified = true,
          verification_token = NULL,
          verification_token_expires = NULL,
          updated_at = NOW()
      WHERE id = ${user.id}
    `

    console.log("[v0] Email verified successfully, creating session")

    // Merge guest cart if exists
    await mergeGuestCartToUser(user.id)

    // Create session
    const sessionToken = await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: true,
    })

    await setSessionCookie(sessionToken)
    console.log("[v0] Session created successfully")
    console.log("[v0] ===== VERIFICATION ROUTE HANDLER END (success) =====")

    return NextResponse.redirect(new URL("/auth/verify-email?success=true", request.url))
  } catch (error) {
    console.error("[v0] ===== VERIFICATION ROUTE HANDLER ERROR =====")
    console.error("[v0] Error:", error)
    console.error("[v0] ===== ERROR END =====")
    
    return NextResponse.redirect(new URL("/auth/verify-email?error=unexpected", request.url))
  }
}

// Helper function to merge guest cart into user cart
async function mergeGuestCartToUser(userId: string) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session_id")?.value

    if (!sessionId) {
      console.log("[v0] No guest session to merge")
      return
    }

    const guestCartItems = await sql`
      SELECT product_id, quantity FROM cart_items 
      WHERE session_id = ${sessionId}
    `

    if (guestCartItems.length === 0) {
      console.log("[v0] No guest cart items to merge")
      return
    }

    console.log("[v0] Merging guest cart:", { sessionId, itemCount: guestCartItems.length })

    for (const guestItem of guestCartItems) {
      const existingUserItem = await sql`
        SELECT id, quantity FROM cart_items 
        WHERE user_id = ${userId} AND product_id = ${guestItem.product_id}
      `

      if (existingUserItem.length > 0) {
        const newQuantity = existingUserItem[0].quantity + guestItem.quantity
        await sql`
          UPDATE cart_items 
          SET quantity = ${newQuantity}, updated_at = NOW()
          WHERE id = ${existingUserItem[0].id}
        `
      } else {
        await sql`
          UPDATE cart_items 
          SET user_id = ${userId}, session_id = NULL, updated_at = NOW()
          WHERE session_id = ${sessionId} AND product_id = ${guestItem.product_id}
        `
      }
    }

    await sql`
      DELETE FROM cart_items WHERE session_id = ${sessionId}
    `

    console.log("[v0] Guest cart merge completed")
  } catch (error) {
    console.error("[v0] Error merging guest cart:", error)
  }
}
