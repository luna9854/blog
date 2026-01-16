"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { PostImage, PostWithAuthor } from "@/entities/post";

import { Button } from "@/components/ui/button";
import dayjs from "@/lib/dayjs";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: PostWithAuthor & { images?: PostImage[] };
  thumbnail?: string;
  className?: string;
}

export function PostCard({
  className,
  post,
  thumbnail,
}: PostCardProps) {
  // 각 카드마다 4~6초 사이 랜덤 인터벌
  const autoplayInterval = useMemo(
    () => Math.floor(Math.random() * 2000) + 4000,
    []
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [fixedHeight, setFixedHeight] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Sort images by order_index
  const sortedImages = [...(post.images ?? [])].sort(
    (a, b) => a.order_index - b.order_index
  );

  const hasMultipleImages = sortedImages.length > 1;

  // Autoplay
  useEffect(() => {
    if (!hasMultipleImages || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === sortedImages.length - 1 ? 0 : prev + 1
      );
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [hasMultipleImages, isPaused, sortedImages.length, autoplayInterval]);

  // 모바일 터치 피드백
  const [isPressed, setIsPressed] = useState(false);

  // 인터셉팅 라우트 (모달로 열림)
  const href = `/archive/${post.id}`;

  const goToPrevious = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      setCurrentIndex((prev) =>
        prev === 0 ? sortedImages.length - 1 : prev - 1
      );
    },
    [sortedImages.length]
  );

  const goToNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      setCurrentIndex((prev) =>
        prev === sortedImages.length - 1 ? 0 : prev + 1
      );
    },
    [sortedImages.length]
  );

  // 터치 이벤트 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current || !touchEndX.current) return;

    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      e.preventDefault();
      if (diff > 0) {
        // 왼쪽으로 스와이프 → 다음
        goToNext();
      } else {
        // 오른쪽으로 스와이프 → 이전
        goToPrevious();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <Link
      href={href}
      scroll={false}
      className={cn(
        "group block overflow-hidden transition-all duration-150 hover:opacity-80 active:scale-[0.98]",
        isPressed && "scale-[0.98] opacity-80",
        className
      )}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onTouchCancel={() => setIsPressed(false)}
    >
      <div
        className="relative overflow-hidden bg-zinc-900"
        style={{
          height: fixedHeight ? `${fixedHeight}px` : "auto",
          minHeight: "200px",
          maxHeight: "400px",
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={hasMultipleImages ? handleTouchStart : undefined}
        onTouchMove={hasMultipleImages ? handleTouchMove : undefined}
        onTouchEnd={hasMultipleImages ? handleTouchEnd : undefined}
      >
        {sortedImages.length > 0 ? (
          <div
            className="flex transition-transform duration-1000 ease-out h-full"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {sortedImages.map((image, index) => (
              <div
                key={image.id}
                className="min-w-full h-full flex items-center justify-center"
              >
                <Image
                  src={image.url}
                  alt={`${post.title} - ${index + 1}`}
                  width={800}
                  height={600}
                  className="w-full h-auto max-h-[400px] object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  onLoad={(e) => {
                    // 첫 번째 이미지 로드 시 높이 고정
                    if (index === 0 && !fixedHeight) {
                      const img = e.currentTarget;
                      setFixedHeight(img.clientHeight);
                    }
                  }}
                />
              </div>
            ))}
          </div>
        ) : thumbnail ? (
          <div className="h-full flex items-center justify-center">
            <Image
              src={thumbnail}
              alt={post.title}
              width={800}
              height={600}
              className="w-full h-auto max-h-[400px] object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onLoad={(e) => {
                if (!fixedHeight) {
                  const img = e.currentTarget;
                  setFixedHeight(img.clientHeight);
                }
              }}
            />
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-zinc-600 font-mono text-sm w-full">
            No Image
          </div>
        )}

        {hasMultipleImages && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevious}
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 text-zinc-400 hover:bg-black/70 hover:text-white z-10 size-8 hidden md:flex"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 text-zinc-400 hover:bg-black/70 hover:text-white z-10 size-8 hidden md:flex"
            >
              <ChevronRight className="size-4" />
            </Button>

            {/* Dot indicators */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {sortedImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  className={cn(
                    "size-1.5 rounded-full transition-colors",
                    index === currentIndex
                      ? "bg-white"
                      : "bg-white/40 hover:bg-white/60"
                  )}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="mt-3">
        <h3 className="truncate font-mono text-sm">{post.title}</h3>
        <time
          dateTime={post.created_at}
          className="mt-1 block text-xs font-mono text-zinc-500"
        >
          {dayjs(post.created_at).format("YYYY.MM.DD")}
        </time>
      </div>
    </Link>
  );
}
