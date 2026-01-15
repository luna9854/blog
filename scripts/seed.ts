/**
 * We Walk Neary - 데이터 시딩 스크립트
 *
 * 실행 방법:
 * 1. Supabase에서 schema.sql 실행
 * 2. Storage에서 "post-images" 버킷 생성 (Public)
 * 3. `npx tsx scripts/seed.ts` 실행
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://sbujzohpifxbucvmhpfs.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_SERVICE_KEY) {
  console.error("SUPABASE_SERVICE_ROLE_KEY 환경변수를 설정해주세요.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// We Walk Neary 사이트 데이터 (플레이스홀더 이미지 사용)
const seedData = {
  authors: [
    {
      name: "Baesongjun",
      instagram: "@baes0ngjun",
      bio: "밥만 먹는사람",
    },
    {
      name: "Jae",
      instagram: "@jae040507",
      bio: null,
    },
  ],
  posts: [
    {
      author: "Baesongjun",
      title: "Untitled",
      content: "자수 작업",
      date: "2025-11-16",
      // 플레이스홀더 이미지 사용 (picsum.photos)
      images: [
        "https://picsum.photos/seed/bsj1/800/600",
      ],
    },
    {
      author: "Baesongjun",
      title: "Im not dying",
      content: null,
      date: "2025-12-08",
      images: [
        "https://picsum.photos/seed/bsj2/800/600",
      ],
    },
    {
      author: "Baesongjun",
      title: "Pocket Design",
      content: "주머니 자수 디자인",
      date: "2025-07-22",
      images: [
        "https://picsum.photos/seed/bsj3/800/600",
        "https://picsum.photos/seed/bsj3b/800/600",
      ],
    },
    {
      author: "Jae",
      title: "Fish wallet",
      content: "물고기 모양 지갑",
      date: "2025-06-22",
      images: [
        "https://picsum.photos/seed/jae1/800/600",
      ],
    },
    {
      author: "Jae",
      title: "Boro work jacket and pants",
      content: "보로 워크 재킷과 팬츠",
      date: "2025-05-15",
      images: [
        "https://picsum.photos/seed/jae2/800/600",
        "https://picsum.photos/seed/jae2b/800/600",
      ],
    },
    {
      author: "Jae",
      title: "Tailored jacket",
      content: "테일러드 재킷",
      date: "2025-12-19",
      images: [
        "https://picsum.photos/seed/jae3/800/600",
      ],
    },
    {
      author: "Jae",
      title: "Aztect Military",
      content: "아즈텍 밀리터리 스타일",
      date: "2024-11-19",
      images: [
        "https://picsum.photos/seed/jae4/800/600",
        "https://picsum.photos/seed/jae4b/800/600",
      ],
    },
  ],
};

// 이미지 다운로드 함수
async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    if (!response.ok) {
      console.error(`    ⚠️ 이미지 다운로드 실패: ${response.status}`);
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error(`    ⚠️ 이미지 다운로드 에러:`, error);
    return null;
  }
}

// Storage에 이미지 업로드 함수
async function uploadToStorage(
  buffer: Buffer,
  postId: string,
  index: number
): Promise<{ url: string; path: string } | null> {
  const fileName = `posts/${postId}/${index}.jpg`;

  const { error } = await supabase.storage
    .from("post-images")
    .upload(fileName, buffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) {
    console.error(`    ⚠️ Storage 업로드 실패:`, error.message);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from("post-images")
    .getPublicUrl(fileName);

  return {
    url: urlData.publicUrl,
    path: fileName,
  };
}

async function seed() {
  console.log("🌱 시딩 시작...\n");

  // 1. 기존 데이터 삭제
  console.log("🗑️ 기존 데이터 삭제 중...");
  await supabase.from("post_images").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("comments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("posts").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("authors").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  console.log("  ✅ 기존 데이터 삭제 완료\n");

  // 2. 작성자 생성
  console.log("👤 작성자 생성 중...");
  const authorMap: Record<string, string> = {};

  for (const author of seedData.authors) {
    const { data, error } = await supabase
      .from("authors")
      .insert(author)
      .select()
      .single();

    if (error) {
      console.error(`  ❌ ${author.name} 생성 실패:`, error.message);
      continue;
    }

    authorMap[author.name] = data.id;
    console.log(`  ✅ ${author.name} 생성 완료 (ID: ${data.id})`);
  }

  // 3. 포스트 및 이미지 생성
  console.log("\n📝 포스트 생성 중...");

  for (const post of seedData.posts) {
    const authorId = authorMap[post.author];
    if (!authorId) {
      console.error(`  ❌ 작성자 "${post.author}" 를 찾을 수 없습니다.`);
      continue;
    }

    // 포스트 생성
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .insert({
        author_id: authorId,
        title: post.title,
        content: post.content,
        created_at: new Date(post.date).toISOString(),
      })
      .select()
      .single();

    if (postError) {
      console.error(`  ❌ "${post.title}" 포스트 생성 실패:`, postError.message);
      continue;
    }

    console.log(`  ✅ "${post.title}" 포스트 생성 완료`);

    // 이미지 다운로드 → Storage 업로드 → DB 저장
    if (post.images.length > 0) {
      console.log(`    📷 ${post.images.length}개 이미지 처리 중...`);

      for (let i = 0; i < post.images.length; i++) {
        const imageUrl = post.images[i];

        // 1. 이미지 다운로드
        console.log(`      [${i + 1}/${post.images.length}] 다운로드 중...`);
        const buffer = await downloadImage(imageUrl);
        if (!buffer) continue;

        // 2. Storage에 업로드
        console.log(`      [${i + 1}/${post.images.length}] 업로드 중...`);
        const uploaded = await uploadToStorage(buffer, postData.id, i);
        if (!uploaded) continue;

        // 3. DB에 저장
        const { error: imageError } = await supabase
          .from("post_images")
          .insert({
            post_id: postData.id,
            url: uploaded.url,
            storage_path: uploaded.path,
            order_index: i,
          });

        if (imageError) {
          console.error(`      ⚠️ DB 저장 실패:`, imageError.message);
        } else {
          console.log(`      ✅ 이미지 ${i + 1} 완료`);
        }
      }
    }
  }

  console.log("\n✨ 시딩 완료!");
}

seed().catch(console.error);
