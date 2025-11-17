"use server"

import { sql } from "@/lib/db"
import {
  hashPassword,
  verifyPassword,
  createSession,
  setSessionCookie,
  clearSessionCookie,
  generateVerificationToken,
} from "@/lib/auth"
import { redirect } from 'next/navigation'
import { sendVerificationEmail } from "@/lib/email"
import { cookies } from "next/headers"

export async function signUp(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) {
    return { error: "All fields are required" }
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { error: "Please enter a valid email address" }
  }

  try {
    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUser.length > 0) {
      return { error: "Email already registered" }
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    const verificationToken = generateVerificationToken()
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    console.log("[v0] Creating user with verification token:", verificationToken.substring(0, 20) + "...")

    // Create user
    const result = await sql`
      INSERT INTO users (email, name, password_hash, email_verified, verification_token, verification_token_expires, created_at, updated_at)
      VALUES (${email}, ${name}, ${passwordHash}, false, ${verificationToken}, ${tokenExpires.toISOString()}, NOW(), NOW())
      RETURNING id, email, name, email_verified
    `

    const user = result[0]

    console.log("[v0] User created successfully. Sending verification email to:", email)
    const emailResult = await sendVerificationEmail(email, verificationToken)

    if (!emailResult.success) {
      console.error("[v0] Failed to send verification email:", emailResult.error)
      // Still return success but with a warning message
      return {
        success: true,
        requiresVerification: true,
        message:
          "Account created! However, we couldn't send the verification email. Please contact support or try resending it.",
        emailWarning: true,
      }
    }

    console.log("[v0] Verification email sent successfully")

    return {
      success: true,
      requiresVerification: true,
      message: "Account created! Please check your email to verify your account.",
    }
  } catch (error) {
    console.error("[v0] Sign up error:", error)
    return { error: "Failed to create account" }
  }
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  try {
    const result = await sql`
      SELECT id, email, name, password_hash, email_verified, oauth_provider
      FROM users 
      WHERE email = ${email}
    `

    if (result.length === 0) {
      return { error: "Invalid email or password" }
    }

    const user = result[0]

    if (user.oauth_provider) {
      return {
        error: `This account uses ${user.oauth_provider} sign-in. Please use the ${user.oauth_provider} button.`,
      }
    }

    const isValid = await verifyPassword(password, user.password_hash)

    if (!isValid) {
      return { error: "Invalid email or password" }
    }

    if (!user.email_verified) {
      return {
        error: "Please verify your email address before signing in. Check your inbox for the verification link.",
        requiresVerification: true,
      }
    }

    await mergeGuestCartToUser(user.id)

    // Create session
    const token = await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.email_verified,
    })

    await setSessionCookie(token)

    return { success: true }
  } catch (error) {
    console.error("[v0] Sign in error:", error)
    return { error: "Failed to sign in" }
  }
}

export async function resendVerificationEmail(email: string) {
  try {
    const result = await sql`
      SELECT id, email, email_verified, verification_token
      FROM users
      WHERE email = ${email}
    `

    if (result.length === 0) {
      return { error: "Email not found" }
    }

    const user = result[0]

    if (user.email_verified) {
      return { error: "Email already verified" }
    }

    // Check rate limiting
    const now = new Date()
    const windowStart = new Date(now.getTime() - 24 * 60 * 60 * 1000) // 24 hours ago

    const attempts = await sql`
      SELECT attempt_count, last_attempt_at, window_start_at
      FROM email_verification_attempts
      WHERE email = ${email}
      AND window_start_at > ${windowStart.toISOString()}
      ORDER BY window_start_at DESC
      LIMIT 1
    `

    if (attempts.length > 0) {
      const { attempt_count, last_attempt_at } = attempts[0]
      const lastAttempt = new Date(last_attempt_at)
      const timeSinceLastAttempt = now.getTime() - lastAttempt.getTime()
      const minutesSinceLastAttempt = Math.floor(timeSinceLastAttempt / 1000 / 60)

      if (attempt_count >= 3) {
        return {
          error: "Too many verification emails sent. Please try again in 24 hours or contact support.",
        }
      }

      // Update attempt count
      await sql`
        UPDATE email_verification_attempts
        SET attempt_count = ${attempt_count + 1},
            last_attempt_at = NOW(),
            updated_at = NOW()
        WHERE email = ${email}
        AND window_start_at > ${windowStart.toISOString()}
      `
    } else {
      // Create new attempt record
      await sql`
        INSERT INTO email_verification_attempts (email, attempt_count, last_attempt_at, window_start_at)
        VALUES (${email}, 1, NOW(), NOW())
      `
    }

    // Generate new token
    const verificationToken = generateVerificationToken()
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    console.log("[v0] Generating new verification token for:", email)

    await sql`
      UPDATE users
      SET verification_token = ${verificationToken},
          verification_token_expires = ${tokenExpires.toISOString()},
          updated_at = NOW()
      WHERE id = ${user.id}
    `

    console.log("[v0] Resending verification email to:", email)
    const emailResult = await sendVerificationEmail(email, verificationToken)

    if (!emailResult.success) {
      console.error("[v0] Failed to resend verification email:", emailResult.error)
      return { error: `Failed to send email: ${emailResult.error}` }
    }

    console.log("[v0] Verification email resent successfully")

    return { success: true, message: "Verification email sent! Please check your inbox." }
  } catch (error) {
    console.error("[v0] Resend verification error:", error)
    return { error: "Failed to resend verification email" }
  }
}

export async function verifyEmail(token: string) {
  try {
    console.log("[v0] Attempting to verify email with token:", token.substring(0, 20) + "...")

    const result = await sql`
      SELECT id, email, name, verification_token, verification_token_expires, email_verified
      FROM users
      WHERE verification_token = ${token}
    `

    console.log("[v0] Database query result:", result.length > 0 ? "User found" : "No user found")

    if (result.length === 0) {
      console.log("[v0] No user found with this verification token")
      return { error: "Invalid or expired verification link" }
    }

    const user = result[0]

    console.log("[v0] User found:", {
      email: user.email,
      emailVerified: user.email_verified,
      tokenExpires: user.verification_token_expires,
    })

    if (user.email_verified) {
      console.log("[v0] User email already verified")
      return { error: "Email already verified. You can sign in now." }
    }

    // Check if token expired
    const expiresAt = new Date(user.verification_token_expires)
    const now = new Date()

    console.log("[v0] Token expiration check:", {
      expiresAt: expiresAt.toISOString(),
      now: now.toISOString(),
      expired: expiresAt < now,
    })

    if (expiresAt < now) {
      console.log("[v0] Verification token has expired")
      return { error: "Verification link has expired. Please request a new one." }
    }

    console.log("[v0] Marking email as verified for user:", user.email)

    await sql`
      UPDATE users
      SET email_verified = true,
          verification_token = NULL,
          verification_token_expires = NULL,
          updated_at = NOW()
      WHERE id = ${user.id}
    `

    console.log("[v0] Email verified successfully. Creating session...")

    await mergeGuestCartToUser(user.id)

    const sessionToken = await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: true,
    })

    await setSessionCookie(sessionToken)

    console.log("[v0] Session created successfully - user is now logged in")

    return { success: true }
  } catch (error) {
    console.error("[v0] Email verification error:", error)
    return { error: "Failed to verify email. Please try again or contact support." }
  }
}

export async function signInWithGoogle(googleUser: { id: string; email: string; name: string; picture?: string }) {
  try {
    // Check if user exists with this Google ID
    const result = await sql`
      SELECT id, email, name, email_verified
      FROM users
      WHERE oauth_provider = 'google' AND oauth_provider_id = ${googleUser.id}
    `

    let user

    if (result.length === 0) {
      // Check if email already exists with different provider
      const existingEmail = await sql`
        SELECT id, oauth_provider FROM users WHERE email = ${googleUser.email}
      `

      if (existingEmail.length > 0 && !existingEmail[0].oauth_provider) {
        return {
          error: "An account with this email already exists. Please sign in with your password.",
        }
      }

      // Create new user
      const newUser = await sql`
        INSERT INTO users (
          email, 
          name, 
          email_verified, 
          oauth_provider, 
          oauth_provider_id,
          created_at,
          updated_at
        )
        VALUES (
          ${googleUser.email},
          ${googleUser.name},
          true,
          'google',
          ${googleUser.id},
          NOW(),
          NOW()
        )
        RETURNING id, email, name, email_verified
      `

      user = newUser[0]
    } else {
      user = result[0]
    }

    // Create session
    const token = await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: true,
    })

    await setSessionCookie(token)

    return { success: true }
  } catch (error) {
    console.error("[v0] Google sign in error:", error)
    return { error: "Failed to sign in with Google" }
  }
}

export async function signOut() {
  await clearSessionCookie()
  redirect("/")
}

export async function requestPasswordReset(email: string) {
  try {
    const result = await sql`
      SELECT id, email, name
      FROM users
      WHERE email = ${email}
    `

    if (result.length === 0) {
      // Return generic message for security
      return {
        success: true,
        message: "If an account exists with this email, you will receive a password reset link shortly.",
      }
    }

    const user = result[0]

    // Generate reset token
    const resetToken = generateVerificationToken()
    const tokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour

    await sql`
      UPDATE users
      SET password_reset_token = ${resetToken},
          password_reset_token_expires = ${tokenExpires.toISOString()},
          updated_at = NOW()
      WHERE id = ${user.id}
    `

    // Send password reset email
    const { sendPasswordResetEmail } = await import("@/lib/email")
    const emailResult = await sendPasswordResetEmail(email, resetToken)

    if (!emailResult.success) {
      console.error("[v0] Failed to send password reset email:", emailResult.error)
      return {
        success: true,
        message: "If an account exists with this email, you will receive a password reset link shortly.",
      }
    }

    return {
      success: true,
      message: "If an account exists with this email, you will receive a password reset link shortly.",
    }
  } catch (error) {
    console.error("[v0] Password reset request error:", error)
    return {
      success: true,
      message: "If an account exists with this email, you will receive a password reset link shortly.",
    }
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    if (!newPassword || newPassword.length < 8) {
      return { error: "Password must be at least 8 characters" }
    }

    const result = await sql`
      SELECT id, email, password_reset_token, password_reset_token_expires
      FROM users
      WHERE password_reset_token = ${token}
    `

    if (result.length === 0) {
      return { error: "Invalid or expired password reset link" }
    }

    const user = result[0]

    // Check if token expired
    const expiresAt = new Date(user.password_reset_token_expires)
    const now = new Date()

    if (expiresAt < now) {
      return { error: "Password reset link has expired. Please request a new one." }
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword)

    await sql`
      UPDATE users
      SET password_hash = ${passwordHash},
          password_reset_token = NULL,
          password_reset_token_expires = NULL,
          updated_at = NOW()
      WHERE id = ${user.id}
    `

    return { success: true, message: "Password reset successfully. You can now sign in with your new password." }
  } catch (error) {
    console.error("[v0] Password reset error:", error)
    return { error: "Failed to reset password" }
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

    // Get guest cart items
    const guestCartItems = await sql`
      SELECT product_id, quantity FROM cart_items 
      WHERE session_id = ${sessionId}
    `

    if (guestCartItems.length === 0) {
      console.log("[v0] No guest cart items to merge")
      return
    }

    console.log("[v0] Merging guest cart:", { sessionId, itemCount: guestCartItems.length })

    // For each guest cart item, merge with user cart
    for (const guestItem of guestCartItems) {
      // Check if user already has this product
      const existingUserItem = await sql`
        SELECT id, quantity FROM cart_items 
        WHERE user_id = ${userId} AND product_id = ${guestItem.product_id}
      `

      if (existingUserItem.length > 0) {
        // Update quantity
        const newQuantity = existingUserItem[0].quantity + guestItem.quantity
        await sql`
          UPDATE cart_items 
          SET quantity = ${newQuantity}, updated_at = NOW()
          WHERE id = ${existingUserItem[0].id}
        `
        console.log("[v0] Merged cart item quantities:", {
          productId: guestItem.product_id,
          newQuantity,
        })
      } else {
        // Move guest item to user cart
        await sql`
          UPDATE cart_items 
          SET user_id = ${userId}, session_id = NULL, updated_at = NOW()
          WHERE session_id = ${sessionId} AND product_id = ${guestItem.product_id}
        `
        console.log("[v0] Moved guest cart item to user:", {
          productId: guestItem.product_id,
        })
      }
    }

    // Delete any remaining guest cart items
    await sql`
      DELETE FROM cart_items WHERE session_id = ${sessionId}
    `

    console.log("[v0] Guest cart merge completed successfully")
  } catch (error) {
    console.error("[v0] Error merging guest cart:", error)
    // Don't throw - cart merging shouldn't block auth
  }
}
