-- App state: stores the full capacity planning document as a single JSONB blob.
CREATE TABLE IF NOT EXISTS app_state (
  id          TEXT        PRIMARY KEY DEFAULT 'default',
  data        JSONB       NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Editor accounts: email + bcrypt password hash.
-- Add users with:
--   INSERT INTO users (email, password_hash)
--   VALUES ('you@example.com', '$2a$10$...');
-- Generate hashes with: node -e "console.log(require('bcryptjs').hashSync('yourpassword', 10))"
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL      PRIMARY KEY,
  email         TEXT        UNIQUE NOT NULL,
  password_hash TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
