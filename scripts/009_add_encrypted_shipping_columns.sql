-- Add encrypted shipping and customer data columns to orders table
-- These columns store encrypted customer information for security

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_name_encrypted TEXT,
ADD COLUMN IF NOT EXISTS shipping_address_encrypted TEXT,
ADD COLUMN IF NOT EXISTS shipping_phone_encrypted TEXT,
ADD COLUMN IF NOT EXISTS customer_email_encrypted TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent ON orders(stripe_payment_intent_id);
