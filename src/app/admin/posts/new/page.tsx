"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { Author } from "@/entities/author";

import { Skeleton } from "@/components/ui/skeleton";
import { PostForm } from "@/features/post-create";
import { createClient } from "@/lib/supabase/client";

export default function NewPostPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [authors, setAuthors] = useState<Author[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data } = (await supabase
        .from("authors")
        .select("*")
        .order("created_at", { ascending: true })) as { data: Author[] | null };

      if (!data || data.length === 0) {
        router.replace("/admin/authors");
        return;
      }

      setAuthors(data);
      setLoading(false);
    }

    fetchData();
  }, [router, supabase]);

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

  return (
    <div className="mx-auto max-w-5xl">
      <h2 className="mb-8 text-2xl font-bold">새 포스트 작성</h2>
      <PostForm authors={authors} />
    </div>
  );
}
