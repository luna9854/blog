import type { Metadata } from "next";

import type { Author } from "@/entities/author";
import type { PostImage, PostWithAuthor } from "@/entities/post";

import { SrOnlyHeading } from "@/components/ui/sr-only-heading";
import { createServerClient } from "@/lib/supabase/server";
import { AuthorSection } from "@/widgets/AuthorSection";

// ISR: 60초마다 재검증
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Archive",
  description: "작가별로 분류된 사진 아카이브를 만나보세요",
  openGraph: {
    title: "Archive",
    description: "작가별로 분류된 사진 아카이브를 만나보세요",
    type: "website",
  },
};

type PostWithImages = PostWithAuthor & { images: PostImage[] };

export default async function ArchivePage() {
  const supabase = await createServerClient();

  // 작성자 목록과 포스트를 병렬로 가져오기
  const [authorsResult, postsResult] = await Promise.all([
    supabase
      .from("authors")
      .select("*")
      .order("created_at", { ascending: true }),
    supabase
      .from("posts")
      .select(
        `
        *,
        author:authors(*),
        images:post_images(*)
      `
      )
      .order("created_at", { ascending: false }),
  ]);

  const authors = authorsResult.data as Author[] | null;
  const posts = postsResult.data as PostWithImages[] | null;

  // 작성자별로 포스트 그룹화
  const authorSections = (authors ?? []).map((author) => ({
    author,
    posts: (posts ?? []).filter((post) => post.author_id === author.id),
  }));

  // 각 포스트의 첫 번째 이미지를 썸네일로
  const thumbnails: Record<string, string> = {};
  (posts ?? []).forEach((post) => {
    const sortedImages = [...(post.images ?? [])].sort(
      (a, b) => a.order_index - b.order_index
    );
    if (sortedImages[0]) {
      thumbnails[post.id] = sortedImages[0].url;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1450px] mx-auto p-4 sm:p-8">
        <SrOnlyHeading>Archive - 사진 아카이브</SrOnlyHeading>
        {authorSections.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground font-mono">
            아직 포스트가 없습니다.
          </p>
        ) : (
          <div className="space-y-12">
            {authorSections.map(({ author, posts }) => (
              <AuthorSection
                key={author.id}
                author={author}
                posts={posts}
                thumbnails={thumbnails}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
