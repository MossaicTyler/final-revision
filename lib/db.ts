import { neon } from "@neondatabase/serverless"

if (!process.env.NEON_DATABASE_URL) {
  throw new Error("NEON_DATABASE_URL environment variable is not set")
}

export const sql = neon(process.env.NEON_DATABASE_URL)

// Types for our database models
export interface User {
  id: string
  email: string
  name: string | null
  password_hash: string | null
  created_at: Date
  updated_at: Date
}

export interface Address {
  id: number
  user_id: string
  type: "shipping" | "billing"
  full_name: string
  address_line1: string
  address_line2: string | null
  city: string
  state: string
  postal_code: string
  country: string
  phone: string | null
  is_default: boolean
  created_at: Date
  updated_at: Date
}

export interface Order {
  id: number
  user_id: string | null
  guest_email: string | null
  stripe_payment_intent_id: string | null
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  total_amount: number
  currency: string
  shipping_address_id: number | null
  billing_address_id: number | null
  created_at: Date
  updated_at: Date
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: string
  product_name: string
  product_image: string | null
  quantity: number
  price: number
  created_at: Date
}

export interface CartItem {
  id: number
  user_id: string | null
  session_id: string | null
  product_id: string
  quantity: number
  created_at: Date
  updated_at: Date
}
