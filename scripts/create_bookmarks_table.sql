-- Create bookmarks table for authenticated users
-- Changed user_id from UUID to TEXT to match users table schema
CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT DEFAULT gen_random_uuid()::TEXT PRIMARY KEY,
  -- Removed REFERENCES users(id) foreign key constraint to fix deployment error
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_product_id ON bookmarks(product_id);
