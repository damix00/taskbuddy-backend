CREATE TABLE IF NOT EXISTS ratings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id), -- The user rating
    rating_for_id BIGINT NOT NULL REFERENCES users(id), -- The user being rated
    post_id BIGINT NOT NULL REFERENCES posts(id),
    post_title TEXT NOT NULL, -- In case the post is deleted
    rating FLOAT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP NOT NULL DEFAULT timezone('utc', now())
)