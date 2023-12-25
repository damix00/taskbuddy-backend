-- For the algorithm to work, we need to keep track of the scroll sessions of each user.
-- This is to not shot duplicate posts in the same session.
-- New session is created each time the app is opened.
CREATE TABLE IF NOT EXISTS scroll_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    ip_address VARCHAR(512) NOT NULL,
    lat FLOAT NOT NULL,
    lon FLOAT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
);

CREATE TABLE IF NOT EXISTS session_posts (
    id BIGSERIAL PRIMARY KEY,
    scroll_session_id BIGINT NOT NULL,
    post_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (scroll_session_id) REFERENCES scroll_sessions(id),
    FOREIGN KEY (post_id) REFERENCES posts(id)
);
