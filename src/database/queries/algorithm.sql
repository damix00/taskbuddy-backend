-- For the algorithm to work, we need to keep track of the scroll sessions of each user.
-- This is to not shot duplicate posts in the same session.
-- New session is created each time the app is opened, refreshed of the filters are changed.
CREATE TABLE IF NOT EXISTS scroll_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    ip_address VARCHAR(512) NOT NULL,
    lat FLOAT, -- Location of the user, if available, for better recommendations
    lon FLOAT,
    filters TEXT, -- JSON string of the filters
    created_at TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
);

CREATE TABLE IF NOT EXISTS session_posts (
    id BIGSERIAL PRIMARY KEY,
    scroll_session_id BIGINT NOT NULL,
    post_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    FOREIGN KEY (scroll_session_id) REFERENCES scroll_sessions(id),
    FOREIGN KEY (post_id) REFERENCES posts(id)
);

CREATE TABLE IF NOT EXISTS user_interests (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    weight FLOAT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
