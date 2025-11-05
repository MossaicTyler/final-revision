import "server-only"

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || "your-encryption-key-change-in-production"

interface EncryptedAddress {
  fullName: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
}

export async function encryptSensitiveData(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyMaterial = encoder.encode(ENCRYPTION_KEY)

  // Derive a proper 32-byte key using SHA-256
  const hashBuffer = await crypto.subtle.digest("SHA-256", keyMaterial)

  // Create a key from the hashed key material
  const key = await crypto.subtle.importKey(
    "raw",
    hashBuffer, // This is always 32 bytes (256 bits)
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  )

  // Generate a random IV
  const iv = crypto.getRandomValues(new Uint8Array(12))

  // Encrypt the data
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(data))

  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encrypted), iv.length)

  // Return as base64
  return Buffer.from(combined).toString("base64")
}

export const encrypt = encryptSensitiveData

export async function decryptSensitiveData(encryptedData: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyMaterial = encoder.encode(ENCRYPTION_KEY)

  // Derive a proper 32-byte key using SHA-256
  const hashBuffer = await crypto.subtle.digest("SHA-256", keyMaterial)

  // Create a key from the hashed key material
  const key = await crypto.subtle.importKey(
    "raw",
    hashBuffer, // This is always 32 bytes (256 bits)
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  )

  // Decode from base64
  const combined = Buffer.from(encryptedData, "base64")

  // Extract IV and encrypted data
  const iv = combined.slice(0, 12)
  const encrypted = combined.slice(12)

  // Decrypt the data
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encrypted)

  return new TextDecoder().decode(decrypted)
}

export const decrypt = decryptSensitiveData

export async function encryptAddress(address: EncryptedAddress): Promise<string> {
  return encryptSensitiveData(JSON.stringify(address))
}

export async function decryptAddress(encryptedData: string): Promise<EncryptedAddress> {
  const decrypted = await decryptSensitiveData(encryptedData)
  return JSON.parse(decrypted)
}

// Hash sensitive data for comparison without decryption
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}
