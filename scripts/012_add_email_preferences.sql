-- Create email preferences table for unsubscribe functionality
CREATE TABLE IF NOT EXISTS email_preferences (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  marketing_emails BOOLEAN DEFAULT true,
  order_updates BOOLEAN DEFAULT true,
  unsubscribed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email_preferences_email ON email_preferences(email);
CREATE INDEX idx_email_preferences_user_id ON email_preferences(user_id);
