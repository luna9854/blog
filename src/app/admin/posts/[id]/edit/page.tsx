"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { Author } from "@/entities/author";
import type { PostFull } from "@/entities/post";

import { Skeleton } from "@/components/ui/skeleton";
import { PostForm } from "@/features/post-create";
import { createClient } from "@/lib/supabase/client";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<PostFull | null>(null);
  const [authors, setAuthors] = useState<Author[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data: postData } = (await supabase
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

      if (!postData) {
        router.replace("/admin");
        return;
      }

      // 이미지 정렬
      if (postData.images) {
        postData.images.sort((a, b) => a.order_index - b.order_index);
      }

      setPost(postData);

      const { data: authorsData } = (await supabase
        .from("authors")
        .select("*")
        .order("created_at", { ascending: true })) as { data: Author[] | null };

      setAuthors(authorsData ?? []);
      setLoading(false);
    }

    fetchData();
  }, [router, supabase, id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-8">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-5xl py-20 text-center text-muted-foreground">
        포스트를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h2 className="mb-8 text-2xl font-bold">포스트 수정</h2>
      <PostForm authors={authors} initialData={post} />
    </div>
  );
}
