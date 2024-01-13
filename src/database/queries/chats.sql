-- Socket.io adapter
CREATE TABLE IF NOT EXISTS socket_io_attachments (
    id          bigserial UNIQUE,
    created_at  timestamptz DEFAULT NOW(),
    payload     bytea
);

CREATE TABLE IF NOT EXISTS channels (
    id BIGSERIAL PRIMARY KEY, -- This is the channel id, private
    uuid VARCHAR(1024) NOT NULL UNIQUE, -- Channel UUID, public
    created_by_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- User who created the channel
    recipient_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- User who is the recipient of the channel
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE, -- Post that the channel is related to
    status INT NOT NULL DEFAULT 0, -- 0 = pending, 1 = accepted, 2 = rejected, 3 = completed, 4 = cancelled
    negotiated_price FLOAT NOT NULL, -- Price that the user has negotiated
    negotiated_date TIMESTAMP NOT NULL, -- Date that the user has negotiated
    sharing_location BOOLEAN NOT NULL DEFAULT FALSE, -- Whether the post creator is sharing the location of the post
    last_message_time TIMESTAMP NOT NULL DEFAULT timezone('utc', now()), -- Last time a message was sent in the channel, used for sorting
    created_at TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY, -- This is the message id, private
    uuid VARCHAR(1024) NOT NULL UNIQUE, -- Message UUID, public
    channel_id BIGINT NOT NULL REFERENCES channels(id) ON DELETE CASCADE, -- Channel that the message is related to
    sender_id BIGINT REFERENCES users(id) ON DELETE CASCADE, -- User who sent the message
    system_message BOOLEAN NOT NULL DEFAULT FALSE, -- For example, "User has taken a screenshot" or "Message has not been delivered"
    message TEXT NOT NULL, -- Message content
    seen BOOLEAN NOT NULL DEFAULT FALSE, -- Whether the recipient has seen the message
    seen_at TIMESTAMP, -- When the recipient has seen the message
    edited BOOLEAN NOT NULL DEFAULT FALSE, -- Whether the message has been edited
    edited_at TIMESTAMP, -- When the message has been edited
    created_at TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS message_attachments (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    attachment_type INT NOT NULL, -- 0 = image, 1 = video, 2 = audio, 3 = document
    attachment_url VARCHAR(1024) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP NOT NULL DEFAULT timezone('utc', now())
);

-- This is for when a user creates a request message, for example request to negotiate or to confirm a deal
-- Sender will send the message to the recipient, and the recipient will have the option to accept or reject
CREATE TABLE IF NOT EXISTS request_messages (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    status INT NOT NULL DEFAULT 0, -- 0 = pending, 1 = accepted, 2 = rejected
    request_type INT NOT NULL, -- 0 = location, 1 = price, 2 = date, 3 = phone number
    data TEXT, -- Data that the sender is requesting
    created_at TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP NOT NULL DEFAULT timezone('utc', now())
);
