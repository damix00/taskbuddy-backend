-- Tags and categories for posts

CREATE TABLE IF NOT EXISTS post_categories (
    category_id BIGSERIAL PRIMARY KEY,
    translations JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS post_tags (
    tag_id BIGSERIAL PRIMARY KEY,
    category_id BIGSERIAL NOT NULL,
    translations JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (category_id) REFERENCES post_categories(category_id)
);
