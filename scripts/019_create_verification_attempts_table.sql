-- Create table to track email verification resend attempts
-- This table is needed for rate limiting verification email resends
CREATE TABLE IF NOT EXISTS email_verification_attempts (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  attempt_count INTEGER DEFAULT 1,
  last_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  window_start_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast lookups by email
CREATE INDEX IF NOT EXISTS idx_verification_attempts_email ON email_verification_attempts(email);

-- Create index for cleanup queries (remove old records)
CREATE INDEX IF NOT EXISTS idx_verification_attempts_window ON email_verification_attempts(window_start_at);

-- Verify table was created
SELECT 'email_verification_attempts table created successfully' AS status;
