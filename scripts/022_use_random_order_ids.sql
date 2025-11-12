-- Change order IDs to use random values to mitigate fraud
-- This creates a new sequence that generates random-looking IDs

-- Create a function to generate random order IDs
CREATE OR REPLACE FUNCTION generate_random_order_id() RETURNS INTEGER AS $$
DECLARE
  new_id INTEGER;
  done BOOLEAN;
BEGIN
  done := FALSE;
  WHILE NOT done LOOP
    -- Generate a random 8-digit number (10000000 to 99999999)
    new_id := floor(random() * 90000000 + 10000000)::INTEGER;
    
    -- Check if this ID already exists
    done := NOT EXISTS(SELECT 1 FROM orders WHERE id = new_id);
  END LOOP;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Drop the existing serial sequence
ALTER TABLE orders ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS orders_id_seq CASCADE;

-- Set the default to use our random function
ALTER TABLE orders ALTER COLUMN id SET DEFAULT generate_random_order_id();

-- Update existing orders to have random IDs (optional - comment out if you want to keep existing IDs)
-- DO $$
-- DECLARE
--   old_order RECORD;
--   new_random_id INTEGER;
-- BEGIN
--   FOR old_order IN SELECT id FROM orders ORDER BY id LOOP
--     new_random_id := generate_random_order_id();
--     
--     -- Update foreign key references first
--     UPDATE order_items SET order_id = new_random_id WHERE order_id = old_order.id;
--     UPDATE order_tracking_events SET order_id = new_random_id WHERE order_id = old_order.id;
--     UPDATE order_status_history SET order_id = new_random_id WHERE order_id = old_order.id;
--     
--     -- Update the order itself
--     UPDATE orders SET id = new_random_id WHERE id = old_order.id;
--   END LOOP;
-- END $$;

-- Add comment to table
COMMENT ON COLUMN orders.id IS 'Random 8-digit order ID for security';
