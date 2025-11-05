-- Add multi-currency support to products and orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_currency TEXT DEFAULT 'usd';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10, 6) DEFAULT 1.0;

-- Add country code to addresses for better regional support
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'US';

-- Create a table for currency exchange rates (can be updated periodically)
CREATE TABLE IF NOT EXISTS currency_rates (
  id SERIAL PRIMARY KEY,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate DECIMAL(10, 6) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_currency, to_currency)
);

-- Insert some common exchange rates (these should be updated regularly via API)
INSERT INTO currency_rates (from_currency, to_currency, rate) VALUES
  ('USD', 'USD', 1.0),
  ('USD', 'EUR', 0.92),
  ('USD', 'GBP', 0.79),
  ('USD', 'CAD', 1.36),
  ('USD', 'AUD', 1.52),
  ('USD', 'JPY', 149.50)
ON CONFLICT (from_currency, to_currency) DO NOTHING;

-- Create index for faster currency lookups
CREATE INDEX IF NOT EXISTS idx_currency_rates_lookup ON currency_rates(from_currency, to_currency);
