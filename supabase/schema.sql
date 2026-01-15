-- ===========================================
-- We Walk Neary - Database Schema
-- ===========================================

-- 작성자 테이블
CREATE TABLE IF NOT EXISTS authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  instagram TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 포스트 테이블
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES authors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 포스트 이미지 테이블
CREATE TABLE IF NOT EXISTS post_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 댓글 테이블
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authors_read" ON authors FOR SELECT USING (true);
CREATE POLICY "authors_insert" ON authors FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authors_update" ON authors FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authors_delete" ON authors FOR DELETE USING (auth.role() = 'authenticated');

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts_read" ON posts FOR SELECT USING (true);
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "posts_update" ON posts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "posts_delete" ON posts FOR DELETE USING (auth.role() = 'authenticated');

ALTER TABLE post_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "post_images_read" ON post_images FOR SELECT USING (true);
CREATE POLICY "post_images_insert" ON post_images FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "post_images_update" ON post_images FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "post_images_delete" ON post_images FOR DELETE USING (auth.role() = 'authenticated');

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments_read" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (true);
