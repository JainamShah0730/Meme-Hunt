CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE memes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    tags TEXT[],
    embedding vector(384)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON memes 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 50)