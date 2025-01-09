CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    language VARCHAR(10),
    currentlevel VARCHAR(10)
);

CREATE TABLE user_dictionary (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    word VARCHAR(255),
    translation VARCHAR(255),
    added_at TIMESTAMP WITHOUT TIME ZONE
);