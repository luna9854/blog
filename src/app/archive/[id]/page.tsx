import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

import type { Comment } from "@/entities/comment";
import type { PostFull } from "@/entities/post";

import { CommentForm } from "@/features/comment-create";
import { env } from "@/lib/env";
import { createServerClient } from "@/lib/supabase/server";
import { CommentSection } from "@/widgets/CommentSection";
import { PostDetail } from "@/widgets/PostDetail";

// ISR: 60초마다 재검증
export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

// 빌드 시 기존 포스트들을 정적 생성 (cookies 없이)
export async function generateStaticParams() {
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const { data: posts } = (await supabase.from("posts").select("id")) as {
    data: { id: string }[] | null;
  };

  return (posts ?? []).map((post) => ({
    id: post.id,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: post } = (await supabase
    .from("posts")
    .select("title, content")
    .eq("id", id)
    .single()) as { data: { title: string; content: string | null } | null };

  if (!post) {
    return { title: "Not Found" };
  }

  return {
    description: post.content?.slice(0, 160) ?? "",
    title: post.title,
  };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: post } = (await supabase
    .from("posts")
    .select(
      `
      *,
      author:authors(*),
      images:post_images(*)
    `
    )
    .eq("id", id)
    .single()) as { data: PostFull | null };

  if (!post) {
    notFound();
  }

  // 이미지 정렬
  if (post.images) {
    post.images.sort((a, b) => a.order_index - b.order_index);
  }

  const { data: comments } = (await supabase
    .from("comments")
    .select("*")
    .eq("post_id", id)
    .order("created_at", { ascending: true })) as { data: Comment[] | null };

  return (
    <div className="container mx-auto px-4 py-8">
      <PostDetail post={post} />

      <div className="mx-auto max-w-3xl">
        <CommentSection comments={comments ?? []} postId={id}>
          <CommentForm postId={id} />
        </CommentSection>
      </div>
    </div>
  );
}
