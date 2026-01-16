import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { Comment } from "@/entities/comment";
import type { PostFull } from "@/entities/post";

import { CommentForm } from "@/features/comment-create";
import { env } from "@/lib/env";
import { createServerClient } from "@/lib/supabase/server";
import { CommentSection } from "@/widgets/CommentSection";
import { PostDetail } from "@/widgets/PostDetail";

// ISR: 1시간마다 재검증
export const revalidate = 3600;

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  // 빌드 시에도 동작하도록 cookies 없이 직접 클라이언트 사용
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: post } = (await supabase
    .from("posts")
    .select(
      `
      title,
      content,
      created_at,
      updated_at,
      author:authors(name),
      images:post_images(url, order_index)
    `
    )
    .eq("id", id)
    .single()) as {
    data: {
      title: string;
      content: string | null;
      created_at: string;
      updated_at: string | null;
      author: { name: string };
      images: { url: string; order_index: number }[];
    } | null;
  };

  if (!post) {
    return {
      title: "Not Found",
      description: "요청하신 포스트를 찾을 수 없습니다.",
    };
  }

  const sortedImages = [...(post.images ?? [])].sort(
    (a, b) => a.order_index - b.order_index
  );
  const thumbnail = sortedImages[0]?.url;
  const description =
    post.content?.slice(0, 160).replace(/\n/g, " ").trim() ||
    `${post.author.name}의 포스트`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wewalkneary.com";

  return {
    title: post.title,
    description,
    alternates: {
      canonical: `${siteUrl}/archive/${id}`,
    },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      url: `${siteUrl}/archive/${id}`,
      publishedTime: post.created_at,
      modifiedTime: post.updated_at ?? post.created_at,
      authors: [post.author.name],
      images: thumbnail
        ? [
            {
              url: thumbnail,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: thumbnail ? [thumbnail] : [],
    },
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

  // JSON-LD 구조화 데이터
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.content?.slice(0, 160) ?? "",
    image: post.images?.[0]?.url,
    datePublished: post.created_at,
    dateModified: post.updated_at ?? post.created_at,
    author: {
      "@type": "Person",
      name: post.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: "We walk neary",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto px-4 py-8">
        <PostDetail post={post} />

        <div className="mx-auto max-w-3xl">
          <CommentSection comments={comments ?? []} postId={id}>
            <CommentForm postId={id} />
          </CommentSection>
        </div>
      </div>
    </>
  );
}
