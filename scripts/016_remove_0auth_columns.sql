-- Remove OAuth-related columns and indexes from users table
DROP INDEX IF EXISTS idx_users_oauth;
DROP INDEX IF EXISTS idx_users_oauth_unique;

ALTER TABLE users DROP COLUMN IF EXISTS oauth_provider;
ALTER TABLE users DROP COLUMN IF EXISTS oauth_provider_id;
