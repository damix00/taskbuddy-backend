CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  uuid VARCHAR(1024) NOT NULL UNIQUE,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  phone_number VARCHAR(255) NOT NULL UNIQUE,
  phone_number_verified BOOLEAN NOT NULL DEFAULT FALSE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL, -- bcrypt hash of the user's password
  created_at TIMESTAMP NOT NULL DEFAULT NOW(), -- created whenever a row is created
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(), -- updated whenever a row is updated
  last_login TIMESTAMP NOT NULL DEFAULT NOW(), -- last time the user logged in
  role VARCHAR(255) NOT NULL DEFAULT 'user', -- is the user an admin (for admin dashboard)
  token_version BIGINT DEFAULT 1, -- increment to invalidate all tokens for a user
  auth_provider VARCHAR(255) NOT NULL DEFAULT 'taskbuddy', -- google, apple, etc.
  deleted BOOLEAN NOT NULL DEFAULT FALSE, -- soft delete user and later remove from database
  has_premium BOOLEAN NOT NULL DEFAULT FALSE, -- does the user have a premium subscription
  verified BOOLEAN NOT NULL DEFAULT FALSE, -- is the user verified (famous people)
  limited_access TEXT[] -- limited access, for example disabled login and listing
);

CREATE TABLE IF NOT EXISTS logins (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(512) NOT NULL,
  user_agent VARCHAR(1024) NOT NULL
);

-- Creates indexes on the users table for faster queries
CREATE INDEX idx_users_uuid ON users (uuid);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_username ON users (username);

-- Creates indexes on the logins table for faster queries
CREATE INDEX idx_logins_user_id ON logins (user_id);

-- Creates a function that updates the updated_at column
-- whenever a row in the users table is updated.

CREATE FUNCTION update_users_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at_trigger
BEFORE UPDATE ON USERS
FOR EACH ROW
EXECUTE FUNCTION update_users_updated_at_column();