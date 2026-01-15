-- Add avatar_url column to authors table
ALTER TABLE authors ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Comment for documentation
COMMENT ON COLUMN authors.avatar_url IS 'URL to author profile image';
