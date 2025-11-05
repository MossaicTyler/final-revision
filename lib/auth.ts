import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { sql } from "./db"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")

export interface SessionUser {
  id: string
  email: string
  name: string | null
  emailVerified: boolean
}

export async function encryptData(data: string): Promise<string> {
  const encoder = new TextEncoder()

  // Derive a proper 32-byte key using SHA-256
  const keyString = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || "your-encryption-key-change-in-production"
  const keyMaterial = encoder.encode(keyString)
  const hashBuffer = await crypto.subtle.digest("SHA-256", keyMaterial)

  const key = await crypto.subtle.importKey(
    "raw",
    hashBuffer, // This is always 32 bytes (256 bits)
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  )

  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(data))

  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encrypted), iv.length)

  return Buffer.from(combined).toString("base64")
}

export async function decryptData(encryptedData: string): Promise<string> {
  const encoder = new TextEncoder()

  // Derive a proper 32-byte key using SHA-256
  const keyString = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || "your-encryption-key-change-in-production"
  const keyMaterial = encoder.encode(keyString)
  const hashBuffer = await crypto.subtle.digest("SHA-256", keyMaterial)

  const key = await crypto.subtle.importKey(
    "raw",
    hashBuffer, // This is always 32 bytes (256 bits)
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  )

  const combined = Buffer.from(encryptedData, "base64")
  const iv = combined.slice(0, 12)
  const encrypted = combined.slice(12)

  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encrypted)

  return new TextDecoder().decode(decrypted)
}

// Hash password using Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

// Verify password against hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

export function generateVerificationToken(): string {
  return crypto.randomUUID() + "-" + Date.now().toString(36)
}

// Create JWT session token
export async function createSession(user: SessionUser): Promise<string> {
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET)

  return token
}

// Verify JWT session token
export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload.user as SessionUser
  } catch {
    return null
  }
}

// Get current user from session
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value

  if (!token) return null

  return verifySession(token)
}

export async function getCurrentUserWithDetails() {
  const user = await getCurrentUser()
  if (!user) return null

  const result = await sql`
    SELECT id, email, name, email_verified, oauth_provider, created_at
    FROM users
    WHERE id = ${user.id}
  `

  return result[0] || null
}

// Set session cookie
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

// Clear session cookie
export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}

// Get guest session ID (read-only - does not create session)
export async function getGuestSessionId(): Promise<string | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("guest_session")?.value
  return sessionId || null
}

// Ensure guest session exists (creates if needed - use in Server Actions only)
export async function ensureGuestSession(): Promise<string> {
  const cookieStore = await cookies()
  let sessionId = cookieStore.get("guest_session")?.value

  if (!sessionId) {
    sessionId = crypto.randomUUID()
    cookieStore.set("guest_session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    })
  }

  return sessionId
}
