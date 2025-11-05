"use server"

import { sql } from "./db"
import { headers } from "next/headers"
import { encryptData, decryptData } from "./auth"

export interface EncryptedCustomerData {
  name: string
  email: string
  phone?: string
  address: {
    line1: string
    line2?: string
    city: string
    state: string
    postal_code: string
    country: string
  }
}

export async function encryptCustomerData(data: EncryptedCustomerData): Promise<{
  nameEncrypted: string
  emailEncrypted: string
  phoneEncrypted: string | null
  addressEncrypted: string
}> {
  const nameEncrypted = await encryptData(data.name)
  const emailEncrypted = await encryptData(data.email)
  const phoneEncrypted = data.phone ? await encryptData(data.phone) : null
  const addressEncrypted = await encryptData(JSON.stringify(data.address))

  return {
    nameEncrypted,
    emailEncrypted,
    phoneEncrypted,
    addressEncrypted,
  }
}

export async function decryptCustomerData(encrypted: {
  nameEncrypted: string
  emailEncrypted: string
  phoneEncrypted: string | null
  addressEncrypted: string
}): Promise<EncryptedCustomerData> {
  const name = await decryptData(encrypted.nameEncrypted)
  const email = await decryptData(encrypted.emailEncrypted)
  const phone = encrypted.phoneEncrypted ? await decryptData(encrypted.phoneEncrypted) : undefined
  const address = JSON.parse(await decryptData(encrypted.addressEncrypted))

  return {
    name,
    email,
    phone,
    address,
  }
}

// Security audit logging
export async function logSecurityEvent(
  eventType: string,
  action: string,
  status: "success" | "failure",
  options?: {
    userId?: string
    resourceType?: string
    resourceId?: string
    errorMessage?: string
    metadata?: Record<string, unknown>
  },
) {
  try {
    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    await sql`
      INSERT INTO security_audit_log (
        event_type, user_id, ip_address, user_agent, 
        resource_type, resource_id, action, status, 
        error_message, metadata
      )
      VALUES (
        ${eventType}, 
        ${options?.userId || null}, 
        ${ipAddress}, 
        ${userAgent},
        ${options?.resourceType || null}, 
        ${options?.resourceId || null}, 
        ${action}, 
        ${status},
        ${options?.errorMessage || null}, 
        ${options?.metadata ? JSON.stringify(options.metadata) : null}
      )
    `
  } catch (error) {
    console.error("[v0] Security audit log error:", error)
  }
}

// Rate limiting
export async function checkRateLimit(
  identifier: string,
  action: string,
  maxRequests: number,
  windowMinutes: number,
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000)

    // Clean up old entries
    await sql`
      DELETE FROM rate_limits 
      WHERE window_start < ${windowStart}
    `

    // Get current count
    const result = await sql`
      SELECT COALESCE(SUM(count), 0) as total
      FROM rate_limits
      WHERE identifier = ${identifier} 
      AND action = ${action}
      AND window_start >= ${windowStart}
    `

    const currentCount = Number(result[0]?.total || 0)

    if (currentCount >= maxRequests) {
      await logSecurityEvent("rate_limit", action, "failure", {
        metadata: { identifier, currentCount, maxRequests },
      })
      return { allowed: false, remaining: 0 }
    }

    // Increment counter
    await sql`
      INSERT INTO rate_limits (identifier, action, count, window_start)
      VALUES (${identifier}, ${action}, 1, NOW())
      ON CONFLICT (identifier, action, window_start)
      DO UPDATE SET count = rate_limits.count + 1
    `

    return { allowed: true, remaining: maxRequests - currentCount - 1 }
  } catch (error) {
    console.error("[v0] Rate limit check error:", error)
    return { allowed: true, remaining: maxRequests }
  }
}

// Input sanitization
export async function sanitizeInput(input: string): Promise<string> {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .slice(0, 1000) // Limit length
}

// Validate email format
export async function isValidEmail(email: string): Promise<boolean> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

// Validate phone format
export async function isValidPhone(phone: string): Promise<boolean> {
  const phoneRegex = /^\+?[\d\s\-()]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10
}

// Generate secure order reference
export async function generateOrderReference(): Promise<string> {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD-${timestamp}-${random}`
}
