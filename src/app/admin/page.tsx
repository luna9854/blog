"use client";

import { Edit, Plus, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import dayjs from "@/lib/dayjs";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type PostWithAuthor = {
  id: string;
  title: string;
  created_at: string;
  author: { name: string } | null;
  images: Array<{ id: string }> | null;
};

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [hasAuthors, setHasAuthors] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const auth = sessionStorage.getItem("admin_auth") === "true";
      if (!auth) {
        router.replace("/admin/login");
        return;
      }
      setIsAuth(true);
      await fetchData();
    }

    async function fetchData() {
      const { data: postsData } = (await supabase
        .from("posts")
        .select(
          `
          *,
          author:authors(name),
          images:post_images(id)
        `
        )
        .order("created_at", { ascending: false })) as {
        data: PostWithAuthor[] | null;
      };

      const { data: authors } = (await supabase
        .from("authors")
        .select("id")) as {
        data: Array<{ id: string }> | null;
      };

      setPosts(postsData ?? []);
      setHasAuthors((authors?.length ?? 0) > 0);
      setLoading(false);
    }

    checkAuth();
  }, [router, supabase]);

  if (!isAuth || loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">포스트 관리</h2>
        <div className="flex gap-2">
          <Link
            href="/admin/authors"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <Users className="size-4" />
            작성자 관리
          </Link>
          <Link href="/admin/posts/new" className={cn(buttonVariants())}>
            <Plus className="size-4" />새 포스트
          </Link>
        </div>
      </div>

      {!hasAuthors ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground">먼저 작성자를 추가해주세요.</p>
          <Link href="/admin/authors" className={cn(buttonVariants(), "mt-4")}>
            작성자 추가하기
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-background">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-4 font-medium">제목</th>
                <th className="p-4 font-medium">작성자</th>
                <th className="p-4 font-medium">이미지</th>
                <th className="p-4 font-medium">작성일</th>
                <th className="p-4 font-medium">관리</th>
              </tr>
            </thead>
            <tbody>
              {posts.length > 0 ? (
                posts.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="p-4">
                      <Link
                        href={`/archive/${post.id}`}
                        className="hover:underline"
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {post.author?.name}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {post.images?.length ?? 0}장
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {dayjs(post.created_at).format("YYYY.MM.DD")}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className={cn(
                            buttonVariants({
                              size: "icon-sm",
                              variant: "ghost",
                            })
                          )}
                        >
                          <Edit className="size-4" />
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={async () => {
                            if (confirm("정말 삭제하시겠습니까?")) {
                              await supabase
                                .from("posts")
                                .delete()
                                .eq("id", post.id);
                              setPosts(posts.filter((p) => p.id !== post.id));
                            }
                          }}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-muted-foreground"
                  >
                    포스트가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
