CREATE TABLE IF NOT EXISTS profiles (
    id BIGSERIAL PRIMARY KEY, -- unique id for each user
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- user id
    created_at TIMESTAMP NOT NULL DEFAULT timezone('utc', now()), -- created whenever a row is created
    updated_at TIMESTAMP NOT NULL DEFAULT timezone('utc', now()), -- updated whenever a row is updated
    profile_picture TEXT, -- URL to profile picture
    bio TEXT NOT NULL, -- User specified biography
    rating_employer DECIMAL NOT NULL DEFAULT 0, -- Rating as an employer
    rating_employee DECIMAL NOT NULL DEFAULT 0, -- Rating as an employee
    rating_count_employer INTEGER NOT NULL DEFAULT 0, -- Number of ratings as an employer
    rating_count_employee INTEGER NOT NULL DEFAULT 0, -- Number of ratings as an employee
    rating_sum_employer FLOAT NOT NULL DEFAULT 0, -- Sum of ratings as an employer
    rating_sum_employee FLOAT NOT NULL DEFAULT 0, -- Sum of ratings as an employee
    cancelled_employer INTEGER NOT NULL DEFAULT 0, -- Number of tasks cancelled as an employer
    cancelled_employee INTEGER NOT NULL DEFAULT 0, -- Number of tasks cancelled as an employee
    completed_employer INTEGER NOT NULL DEFAULT 0, -- Number of tasks completed as an employer
    completed_employee INTEGER NOT NULL DEFAULT 0, -- Number of tasks completed as an employee
    followers BIGINT NOT NULL DEFAULT 0, -- Number of users following the user
    following BIGINT NOT NULL DEFAULT 0, -- Number of users the user is following
    post_count BIGINT NOT NULL DEFAULT 0, -- Number of posts the user has made
    location_text TEXT, -- User specified location (town name)
    location_lat DECIMAL, -- Latitude of user location - user specified
    location_lon DECIMAL, -- Longitude of user location - user specified
    is_private BOOLEAN NOT NULL DEFAULT FALSE, -- Is the user's profile private
    deleted BOOLEAN NOT NULL DEFAULT FALSE -- soft delete user and later remove from database
);

CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);