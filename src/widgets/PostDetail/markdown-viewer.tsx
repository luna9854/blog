"use client";

import Image from "next/image";
import Markdown from "react-markdown";

import { cn } from "@/lib/utils";

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export function MarkdownViewer({ className, content }: MarkdownViewerProps) {
  if (!content) {
    return null;
  }

  return (
    <div className={cn("prose prose-invert prose-zinc max-w-none", className)}>
      <Markdown
        components={{
          // 링크 새 탭에서 열기
          a: ({ ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
          // 코드 블록 스타일링
          code: ({ children, className, ...props }) => {
            const isInline = !className;
            return isInline ? (
              <code
                className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm"
                {...props}
              >
                {children}
              </code>
            ) : (
              <code
                className={cn(
                  "block bg-zinc-900 p-4 rounded-lg overflow-x-auto",
                  className
                )}
                {...props}
              >
                {children}
              </code>
            );
          },
          // next/image 사용
          img: ({ src, alt }) =>
            src ? (
              <Image
                src={src}
                alt={alt || "이미지"}
                width={800}
                height={600}
                className="rounded-lg max-w-full h-auto my-4"
                sizes="(max-width: 768px) 100vw, 80vw"
              />
            ) : null,
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
