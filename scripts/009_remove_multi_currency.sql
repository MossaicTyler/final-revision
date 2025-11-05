-- Remove multi-currency support tables and columns
DROP TABLE IF EXISTS currency_rates;

-- Update orders table to remove multi-currency fields
ALTER TABLE orders DROP COLUMN IF EXISTS customer_currency;
ALTER TABLE orders DROP COLUMN IF EXISTS exchange_rate;

-- Set all existing orders to GBP
UPDATE orders SET currency = 'gbp' WHERE currency != 'gbp';
