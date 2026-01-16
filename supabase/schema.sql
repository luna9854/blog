-- ===========================================
-- Photo Archive - Database Schema
-- ===========================================
--
-- 이 파일을 Supabase SQL Editor에서 실행하세요.
--
-- 중요: 실행 후 site_settings 테이블에서 admin_key 값을
-- 안전한 비밀번호로 변경하세요!
-- ===========================================

-- 작성자 테이블
CREATE TABLE IF NOT EXISTS authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  instagram TEXT,
  bio TEXT,
  avatar_url TEXT,
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
  blur_data_url TEXT,
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

-- YouTube 영상 테이블
CREATE TABLE IF NOT EXISTS youtube_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id TEXT NOT NULL,
  title TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 사이트 설정 테이블 (관리자 인증 등)
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- RLS 정책 (Row Level Security)
-- ===========================================

-- Authors
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authors_read" ON authors FOR SELECT USING (true);
CREATE POLICY "authors_insert" ON authors FOR INSERT WITH CHECK (true);
CREATE POLICY "authors_update" ON authors FOR UPDATE USING (true);
CREATE POLICY "authors_delete" ON authors FOR DELETE USING (true);

-- Posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts_read" ON posts FOR SELECT USING (true);
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "posts_update" ON posts FOR UPDATE USING (true);
CREATE POLICY "posts_delete" ON posts FOR DELETE USING (true);

-- Post Images
ALTER TABLE post_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "post_images_read" ON post_images FOR SELECT USING (true);
CREATE POLICY "post_images_insert" ON post_images FOR INSERT WITH CHECK (true);
CREATE POLICY "post_images_update" ON post_images FOR UPDATE USING (true);
CREATE POLICY "post_images_delete" ON post_images FOR DELETE USING (true);

-- Comments (누구나 작성 가능)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments_read" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (true);

-- YouTube Videos
ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "youtube_videos_read" ON youtube_videos FOR SELECT USING (true);
CREATE POLICY "youtube_videos_insert" ON youtube_videos FOR INSERT WITH CHECK (true);
CREATE POLICY "youtube_videos_update" ON youtube_videos FOR UPDATE USING (true);
CREATE POLICY "youtube_videos_delete" ON youtube_videos FOR DELETE USING (true);

-- Site Settings (읽기만 공개)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_settings_read" ON site_settings FOR SELECT USING (true);

-- ===========================================
-- 초기 데이터
-- ===========================================

-- 관리자 키 (반드시 변경하세요!)
INSERT INTO site_settings (key, value) VALUES ('admin_key', 'change_me_to_secure_key')
ON CONFLICT (key) DO NOTHING;
