CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY, -- ID of review
    uuid VARCHAR(1024) NOT NULL UNIQUE, -- UUID of post
    user_id BIGINT NOT NULL, -- User who posted
    post_id BIGINT NOT NULL, -- Post being reviewed
    rating INTEGER NOT NULL, -- Rating of job
    review_title VARCHAR(256) NOT NULL, -- Title of job
    review_description TEXT, -- Description of job
    flagged BOOLEAN NOT NULL DEFAULT FALSE, -- Flagged for review by algorithm
    review_type INTEGER NOT NULL, -- 0 - as a worker, 1 - as a poster
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
)