CREATE TABLE IF NOT EXISTS channels (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(1024) NOT NULL UNIQUE,
    created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    status INT NOT NULL DEFAULT 0, -- 0 = pending, 1 = accepted, 2 = rejected
    negotiated_price FLOAT NOT NULL,
    sharing_location BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(1024) NOT NULL UNIQUE,
    channel_id BIGINT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    sender BIGINT REFERENCES users(id) ON DELETE CASCADE,
    system_message BOOLEAN NOT NULL DEFAULT FALSE, -- For example, "User has taken a screenshot" or "You are now sharing your location"
    message TEXT NOT NULL,
    seen BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- This is for when a user creates a request message, for example request to negotiate
-- Sender will send the message to the recipient, and the recipient will have the option to accept or reject
CREATE TABLE IF NOT EXISTS message_requests (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(1024) NOT NULL UNIQUE,
    channel_id BIGINT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    sender BIGINT REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    seen BOOLEAN NOT NULL DEFAULT FALSE,
    status INT NOT NULL DEFAULT 0, -- 0 = pending, 1 = accepted, 2 = rejected
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);
