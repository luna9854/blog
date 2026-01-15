/**
 * 기존 포스트의 이미지를 마크다운 본문에 추가하는 마이그레이션 스크립트
 *
 * 실행: npx tsx scripts/migrate-images-to-content.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateImagesToContent() {
  console.log("🚀 이미지 마이그레이션 시작...\n");

  // 모든 포스트와 이미지 가져오기
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select(`
      id,
      title,
      content,
      images:post_images(url, order_index)
    `)
    .order("created_at", { ascending: true });

  if (postsError) {
    console.error("❌ 포스트 조회 실패:", postsError);
    return;
  }

  if (!posts || posts.length === 0) {
    console.log("📭 마이그레이션할 포스트가 없습니다.");
    return;
  }

  console.log(`📝 총 ${posts.length}개 포스트 발견\n`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const post of posts) {
    const images = (post.images as { url: string; order_index: number }[]) || [];

    // 이미지가 없으면 스킵
    if (images.length === 0) {
      console.log(`⏭️  [${post.title}] - 이미지 없음, 스킵`);
      skippedCount++;
      continue;
    }

    // 이미 마크다운 이미지가 포함되어 있는지 확인
    const currentContent = post.content || "";
    if (currentContent.includes("![") && currentContent.includes("](http")) {
      console.log(`⏭️  [${post.title}] - 이미 이미지 포함됨, 스킵`);
      skippedCount++;
      continue;
    }

    // 이미지를 order_index로 정렬
    const sortedImages = [...images].sort((a, b) => a.order_index - b.order_index);

    // 마크다운 이미지 문법으로 변환
    const imageMarkdown = sortedImages
      .map((img, idx) => `![이미지 ${idx + 1}](${img.url})`)
      .join("\n\n");

    // 기존 콘텐츠 뒤에 이미지 추가
    const newContent = currentContent
      ? `${currentContent}\n\n---\n\n${imageMarkdown}`
      : imageMarkdown;

    // 업데이트
    const { error: updateError } = await supabase
      .from("posts")
      .update({ content: newContent })
      .eq("id", post.id);

    if (updateError) {
      console.error(`❌ [${post.title}] 업데이트 실패:`, updateError);
    } else {
      console.log(`✅ [${post.title}] - ${images.length}개 이미지 추가됨`);
      updatedCount++;
    }
  }

  console.log(`\n🎉 마이그레이션 완료!`);
  console.log(`   - 업데이트: ${updatedCount}개`);
  console.log(`   - 스킵: ${skippedCount}개`);
}

migrateImagesToContent().catch(console.error);
