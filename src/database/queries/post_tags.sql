-- Tags and categories for posts

CREATE TABLE IF NOT EXISTS post_categories (
    category_id BIGSERIAL PRIMARY KEY,
    translations JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS post_tags (
    tag_id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL,
    translations JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    FOREIGN KEY (category_id) REFERENCES post_categories(category_id)
);
