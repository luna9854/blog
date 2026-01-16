"use client";

import { ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Comment } from "@/entities/comment";
import type { PostFull } from "@/entities/post";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCommentsByPost } from "@/entities/comment";
import { CommentForm } from "@/features/comment-create";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { CommentSection } from "@/widgets/CommentSection";
import { PostContent } from "@/widgets/PostDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export default function PostModalPage({ params }: Props) {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const [postId, setPostId] = useState<string | null>(null);

  const [post, setPost] = useState<PostFull | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const supabase = createClient();

  // params 처리
  useEffect(() => {
    params.then((p) => setPostId(p.id));
  }, [params]);

  // 모달 내부 스크롤 감지 (히스테리시스 적용으로 떨림 방지)
  const handleScroll = useCallback(() => {
    if (modalRef.current) {
      const scrollTop = modalRef.current.scrollTop;
      // 스크롤 다운: 60px 이상이면 축소
      // 스크롤 업: 30px 이하면 확대
      // 30~60px 사이는 현재 상태 유지 (버퍼 존)
      setScrolled((prev) => {
        if (!prev && scrollTop > 60) return true;
        if (prev && scrollTop < 30) return false;
        return prev;
      });
    }
  }, []);

  // 모달 열릴 때 body 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!postId) return;

    async function fetchData() {
      if (!postId) return;

      setLoading(true);

      const { data: postData } = (await supabase
        .from("posts")
        .select(
          `
          *,
          author:authors(*),
          images:post_images(*)
        `
        )
        .eq("id", postId)
        .single()) as { data: PostFull | null };

      if (postData) {
        if (postData.images) {
          postData.images.sort((a, b) => a.order_index - b.order_index);
        }
        setPost(postData);

        const commentData = await getCommentsByPost(postId);
        setComments(commentData);
      }

      setLoading(false);
    }

    fetchData();
  }, [postId, supabase]);

  const handleClose = () => {
    router.back();
  };

  const refreshComments = async () => {
    if (!postId) return;
    const commentData = await getCommentsByPost(postId);
    setComments(commentData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 데스크톱: 배경 오버레이 (클릭 시 닫기) */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm hidden md:block"
        onClick={handleClose}
      />

      <div
        ref={modalRef}
        onScroll={handleScroll}
        className="relative z-10 h-full w-full overflow-y-auto bg-zinc-950 md:h-auto md:max-h-[90vh] md:max-w-4xl"
      >
        {/* Sticky Header */}
        <div
          className={cn(
            "sticky top-0 z-20 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800 flex items-center",
            scrolled ? "px-4 py-3 md:px-6" : "px-4 py-4 md:px-6 md:py-6"
          )}
        >
          {/* 모바일: 뒤로가기 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="shrink-0 text-zinc-400 hover:text-foreground md:hidden mr-2"
          >
            <ArrowLeft className="size-5" />
          </Button>

          {loading ? (
            <Skeleton className="h-6 w-1/3" />
          ) : post ? (
            <div className="min-w-0 flex-1 pr-4">
              <h1
                className={cn(
                  "font-bold font-mono tracking-wide truncate",
                  scrolled ? "text-base" : "text-lg md:text-xl"
                )}
              >
                {post.title}
              </h1>
              <p
                className={cn(
                  "font-mono text-zinc-400",
                  scrolled ? "text-xs" : "text-xs md:text-sm mt-1"
                )}
              >
                {post.author.name} ·{" "}
                {new Date(post.created_at).toLocaleDateString("ko-KR")}
              </p>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {/* 데스크톱: X 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="shrink-0 text-zinc-400 hover:text-foreground hidden md:flex"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 lg:p-8">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="aspect-4/3 w-full" />
            </div>
          ) : post ? (
            <>
              <PostContent post={post} showHeader={false} className="mb-10" />

              <CommentSection
                comments={comments}
                postId={post.id}
                onRefresh={refreshComments}
              >
                <CommentForm postId={post.id} onSuccess={refreshComments} />
              </CommentSection>
            </>
          ) : (
            <p className="py-20 text-center text-zinc-500 font-mono">
              포스트를 찾을 수 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
