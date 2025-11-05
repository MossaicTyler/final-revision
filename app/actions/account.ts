"use server"

import { sql } from "@/lib/db"
import { getCurrentUser, hashPassword, verifyPassword, clearSessionCookie } from "@/lib/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  const name = formData.get("name") as string
  const email = formData.get("email") as string

  if (!name || !email) {
    return { error: "Name and email are required" }
  }

  try {
    // Check if email is already taken by another user
    if (email !== user.email) {
      const existing = await sql`
        SELECT id FROM neon_auth.users_sync 
        WHERE email = ${email} AND id != ${user.id}
      `

      if (existing.length > 0) {
        return { error: "Email already in use" }
      }
    }

    await sql`
      UPDATE neon_auth.users_sync 
      SET name = ${name}, email = ${email}, updated_at = NOW()
      WHERE id = ${user.id}
    `

    revalidatePath("/account/settings")
    return { success: true }
  } catch (error) {
    console.error("[v0] Update profile error:", error)
    return { error: "Failed to update profile" }
  }
}

export async function changePassword(formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All fields are required" }
  }

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match" }
  }

  if (newPassword.length < 8) {
    return { error: "Password must be at least 8 characters" }
  }

  try {
    const userResult = await sql`
      SELECT password_hash FROM neon_auth.users_sync 
      WHERE id = ${user.id}
    `

    if (userResult.length === 0) {
      return { error: "User not found" }
    }

    const storedPasswordHash = userResult[0].password_hash

    const isValid = await verifyPassword(currentPassword, storedPasswordHash)

    if (!isValid) {
      return { error: "Current password is incorrect" }
    }

    // Update password
    const newPasswordHash = await hashPassword(newPassword)
    await sql`
      UPDATE neon_auth.users_sync 
      SET password_hash = ${newPasswordHash}, updated_at = NOW()
      WHERE id = ${user.id}
    `

    return { success: true }
  } catch (error) {
    console.error("[v0] Change password error:", error)
    return { error: "Failed to change password" }
  }
}

export async function getUserAddresses() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  try {
    const addresses = await sql`
      SELECT * FROM addresses 
      WHERE user_id = ${user.id}
      ORDER BY is_default DESC, created_at DESC
    `

    return addresses
  } catch (error) {
    console.error("[v0] Get addresses error:", error)
    return []
  }
}

export async function addAddress(formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  const type = formData.get("type") as string
  const fullName = formData.get("fullName") as string
  const addressLine1 = formData.get("addressLine1") as string
  const addressLine2 = formData.get("addressLine2") as string
  const city = formData.get("city") as string
  const state = formData.get("state") as string
  const postalCode = formData.get("postalCode") as string
  const country = formData.get("country") as string
  const phone = formData.get("phone") as string
  const isDefault = formData.get("isDefault") === "true"

  if (!type || !fullName || !addressLine1 || !city || !state || !postalCode || !country) {
    return { error: "Please fill in all required fields" }
  }

  try {
    // If setting as default, unset other defaults
    if (isDefault) {
      await sql`
        UPDATE addresses 
        SET is_default = false 
        WHERE user_id = ${user.id} AND type = ${type}
      `
    }

    await sql`
      INSERT INTO addresses (
        user_id, type, full_name, address_line1, address_line2,
        city, state, postal_code, country, phone, is_default,
        created_at, updated_at
      )
      VALUES (
        ${user.id}, ${type}, ${fullName}, ${addressLine1}, ${addressLine2 || null},
        ${city}, ${state}, ${postalCode}, ${country}, ${phone || null}, ${isDefault},
        NOW(), NOW()
      )
    `

    revalidatePath("/account/settings")
    return { success: true }
  } catch (error) {
    console.error("[v0] Add address error:", error)
    return { error: "Failed to add address" }
  }
}

export async function updateAddress(addressId: number, formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  const type = formData.get("type") as string
  const fullName = formData.get("fullName") as string
  const addressLine1 = formData.get("addressLine1") as string
  const addressLine2 = formData.get("addressLine2") as string
  const city = formData.get("city") as string
  const state = formData.get("state") as string
  const postalCode = formData.get("postalCode") as string
  const country = formData.get("country") as string
  const phone = formData.get("phone") as string
  const isDefault = formData.get("isDefault") === "true"

  if (!type || !fullName || !addressLine1 || !city || !state || !postalCode || !country) {
    return { error: "Please fill in all required fields" }
  }

  try {
    // If setting as default, unset other defaults
    if (isDefault) {
      await sql`
        UPDATE addresses 
        SET is_default = false 
        WHERE user_id = ${user.id} AND type = ${type} AND id != ${addressId}
      `
    }

    await sql`
      UPDATE addresses 
      SET 
        type = ${type},
        full_name = ${fullName},
        address_line1 = ${addressLine1},
        address_line2 = ${addressLine2 || null},
        city = ${city},
        state = ${state},
        postal_code = ${postalCode},
        country = ${country},
        phone = ${phone || null},
        is_default = ${isDefault},
        updated_at = NOW()
      WHERE id = ${addressId} AND user_id = ${user.id}
    `

    revalidatePath("/account/settings")
    return { success: true }
  } catch (error) {
    console.error("[v0] Update address error:", error)
    return { error: "Failed to update address" }
  }
}

export async function deleteAddress(addressId: number) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  try {
    await sql`
      DELETE FROM addresses 
      WHERE id = ${addressId} AND user_id = ${user.id}
    `

    revalidatePath("/account/settings")
    return { success: true }
  } catch (error) {
    console.error("[v0] Delete address error:", error)
    return { error: "Failed to delete address" }
  }
}

export async function deleteAccount(formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  const password = formData.get("password") as string
  const confirmation = formData.get("confirmation") as string

  if (!password) {
    return { error: "Password is required to delete your account" }
  }

  if (confirmation !== "DELETE") {
    return { error: 'Please type "DELETE" to confirm account deletion' }
  }

  try {
    // Get user details
    const userResult = await sql`
      SELECT password_hash, oauth_provider FROM users WHERE id = ${user.id}
    `

    if (userResult.length === 0) {
      return { error: "User not found" }
    }

    const userData = userResult[0]

    // Verify password for non-OAuth users
    if (!userData.oauth_provider) {
      const isValid = await verifyPassword(password, userData.password_hash)
      if (!isValid) {
        return { error: "Incorrect password" }
      }
    }

    // Anonymize orders instead of deleting (for record keeping)
    await sql`
      UPDATE orders
      SET user_id = NULL,
          guest_email = ${user.email},
          notes = COALESCE(notes || ' ', '') || '[Account deleted]'
      WHERE user_id = ${user.id}
    `

    // Delete user (cascade will handle addresses, cart, etc.)
    await sql`
      DELETE FROM users WHERE id = ${user.id}
    `

    // Clear session
    await clearSessionCookie()

    return { success: true }
  } catch (error) {
    console.error("[v0] Delete account error:", error)
    return { error: "Failed to delete account" }
  }
}

export async function updateOrderShippingAddress(orderId: number, formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  const fullName = formData.get("fullName") as string
  const addressLine1 = formData.get("addressLine1") as string
  const addressLine2 = formData.get("addressLine2") as string
  const city = formData.get("city") as string
  const state = formData.get("state") as string
  const postalCode = formData.get("postalCode") as string
  const country = formData.get("country") as string
  const phone = formData.get("phone") as string

  if (!fullName || !addressLine1 || !city || !state || !postalCode || !country) {
    return { error: "Please fill in all required fields" }
  }

  try {
    console.log("[v0] Updating shipping address for order:", orderId, "user:", user.id)

    // Verify order belongs to user and can be updated
    const orderResult = await sql`
      SELECT id, status FROM orders
      WHERE id = ${orderId} AND user_id = ${user.id}
    `

    console.log("[v0] Order query result:", orderResult)

    if (orderResult.length === 0) {
      return { error: "Order not found" }
    }

    const order = orderResult[0]

    // Only allow updates for pending and processing orders
    if (!["pending", "processing"].includes(order.status)) {
      return { error: "Cannot update shipping address for orders that have already shipped" }
    }

    await sql`
      UPDATE orders
      SET shipping_name_encrypted = ${fullName},
          shipping_address_encrypted = ${JSON.stringify({
            line1: addressLine1,
            line2: addressLine2 || null,
            city,
            state,
            postalCode,
            country,
            phone: phone || null,
          })},
          updated_at = NOW()
      WHERE id = ${orderId}
    `

    console.log("[v0] Shipping address updated successfully")

    revalidatePath(`/account/orders/${orderId}`)
    revalidatePath("/account/orders")

    return { success: true }
  } catch (error) {
    console.error("[v0] Update order shipping error:", error)
    return { error: "Failed to update shipping address" }
  }
}

export async function getEmailPreferences() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  try {
    const result = await sql`
      SELECT marketing_emails, order_updates
      FROM email_preferences
      WHERE email = ${user.email}
    `

    if (result.length === 0) {
      return { marketing_emails: true, order_updates: true }
    }

    return result[0]
  } catch (error) {
    console.error("[v0] Get email preferences error:", error)
    return { marketing_emails: true, order_updates: true }
  }
}

export async function updateEmailPreferences(formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  const marketingEmails = formData.get("marketingEmails") === "true"
  const orderUpdates = formData.get("orderUpdates") === "true"

  try {
    await sql`
      INSERT INTO email_preferences (email, user_id, marketing_emails, order_updates, updated_at)
      VALUES (${user.email}, ${user.id}, ${marketingEmails}, ${orderUpdates}, NOW())
      ON CONFLICT (email)
      DO UPDATE SET
        marketing_emails = ${marketingEmails},
        order_updates = ${orderUpdates},
        updated_at = NOW()
    `

    revalidatePath("/account/settings")
    return { success: true }
  } catch (error) {
    console.error("[v0] Update email preferences error:", error)
    return { error: "Failed to update email preferences" }
  }
}
