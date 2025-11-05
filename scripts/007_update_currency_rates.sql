-- Script to update exchange rates with more recent values
-- This should be run periodically (daily/weekly) or replaced with an API integration

UPDATE currency_rates SET rate = 0.93, updated_at = NOW() WHERE from_currency = 'USD' AND to_currency = 'EUR';
UPDATE currency_rates SET rate = 0.79, updated_at = NOW() WHERE from_currency = 'USD' AND to_currency = 'GBP';
UPDATE currency_rates SET rate = 1.37, updated_at = NOW() WHERE from_currency = 'USD' AND to_currency = 'CAD';
UPDATE currency_rates SET rate = 1.53, updated_at = NOW() WHERE from_currency = 'USD' AND to_currency = 'AUD';
UPDATE currency_rates SET rate = 150.25, updated_at = NOW() WHERE from_currency = 'USD' AND to_currency = 'JPY';

-- Add reverse rates for better flexibility
INSERT INTO currency_rates (from_currency, to_currency, rate, updated_at) VALUES
  ('EUR', 'USD', 1.08, NOW()),
  ('GBP', 'USD', 1.27, NOW()),
  ('CAD', 'USD', 0.73, NOW()),
  ('AUD', 'USD', 0.65, NOW()),
  ('JPY', 'USD', 0.0067, NOW())
ON CONFLICT (from_currency, to_currency) 
DO UPDATE SET rate = EXCLUDED.rate, updated_at = NOW();
