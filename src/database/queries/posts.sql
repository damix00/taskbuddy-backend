CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY, -- ID of post
    uuid VARCHAR(1024) NOT NULL UNIQUE, -- UUID of post
    user_id BIGSERIAL NOT NULL, -- User who posted
    title VARCHAR(256) NOT NULL, -- Title of job
    title_vector vector NOT NULL, -- Vector representation of title for similarity search
    description TEXT NOT NULL, -- Description of job
    job_type INTEGER NOT NULL, -- 0 - one-time, 1 - part-time, 2 - full-time
    price FLOAT NOT NULL, -- Price of job
    removals_id BIGSERIAL NOT NULL,
    post_location_id BIGSERIAL NOT NULL,
    interactions_id BIGSERIAL NOT NULL,
    start_date TIMESTAMP NOT NULL, -- Start date of job
    end_date TIMESTAMP NOT NULL, -- End date of job
    status INTEGER NOT NULL, -- 0 - open, 1 - closed, 2 - reserved, 3 - completed, 4 - cancelled, 5 - expired
    reserved_by BIGSERIAL, -- User who reserved the post
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reserved_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (removals_id) REFERENCES post_removals(id) ON DELETE CASCADE,
    FOREIGN KEY (post_location_id) REFERENCES post_location(id) ON DELETE CASCADE,
    FOREIGN KEY (interactions_id) REFERENCES post_interactions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post_media (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGSERIAL NOT NULL,
    media TEXT NOT NULL,
    type TEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post_interactions (
    id BIGSERIAL PRIMARY KEY,
    likes BIGINT NOT NULL DEFAULT 0, -- Number of likes
    comments BIGINT NOT NULL DEFAULT 0, -- Number of comments
    shares BIGINT NOT NULL DEFAULT 0, -- Number of times post has been shared
    bookmarks BIGINT NOT NULL DEFAULT 0, -- Number of times post has been bookmarked
    impressions BIGINT NOT NULL DEFAULT 0 -- Number of times post has been seen
);

CREATE TABLE IF NOT EXISTS post_comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGSERIAL NOT NULL,
    user_id BIGSERIAL NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    likes BIGINT NOT NULL DEFAULT 0,
    reply_count BIGINT NOT NULL DEFAULT 0,
    is_reply BOOLEAN NOT NULL DEFAULT FALSE,
    reply_to BIGSERIAL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reply_to) REFERENCES post_comments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post_removals (
    id BIGSERIAL PRIMARY KEY,
    removed BOOLEAN NOT NULL DEFAULT FALSE, -- Removed by admin
    removal_reason TEXT, -- Reason for removal, set by admin
    flagged BOOLEAN NOT NULL DEFAULT FALSE, -- Flagged for review by algorithm
    flagged_reason TEXT, -- Reason for flagging (sexual, violent, etc.)
    shadow_banned BOOLEAN NOT NULL DEFAULT FALSE -- Doesn't show up in feed, but still exists, user doesn't know
);

CREATE TABLE IF NOT EXISTS post_location (
    id BIGSERIAL PRIMARY KEY,
    remote BOOLEAN NOT NULL DEFAULT FALSE, -- Is the job remote?
    lat FLOAT, -- Location of post
    lon FLOAT, -- Location of post
    suggestion_radius FLOAT, -- Radius of suggestion
    location_name TEXT -- Name of location, if applicable
);

CREATE TABLE IF NOT EXISTS post_tags ( -- Many to many relationship
    post_id INTEGER,
    tag_id INTEGER,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (tag_id) REFERENCES post_tags(tag_id)
);

-- Actions on posts

CREATE TABLE IF NOT EXISTS view_history ( -- Scrolling history for user
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS post_interaction_logs ( -- Likes on posts
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    interaction_type INTEGER NOT NULL, -- 0 - like, 1 - comment, 2 - share, 3 - bookmark
    interaction_ip TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS comment_interaction_logs ( -- Likes on comments
    user_id INTEGER NOT NULL,
    comment_id INTEGER NOT NULL,
    interaction_type INTEGER NOT NULL, -- 0 - like, 1 - reply
    interaction_ip TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES post_comments(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
