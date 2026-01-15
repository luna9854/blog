"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { Author } from "@/entities/author";
import type { PostFull } from "@/entities/post";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import type { EditorRef } from "./tui-editor";

import { createPost, updatePost } from "../api";
import { ImageUpload } from "./image-upload";

const TuiEditor = dynamic(
  () => import("./tui-editor").then((mod) => mod.TuiEditor),
  {
    loading: () => <Skeleton className="h-[600px] w-full" />,
    ssr: false,
  }
);

const postSchema = z.object({
  author_id: z.string().min(1, "작성자를 선택해주세요"),
  created_at: z.date({ message: "작성일을 선택해주세요" }),
  title: z
    .string()
    .min(1, "제목을 입력해주세요")
    .max(100, "제목은 100자 이내로 입력해주세요"),
});

type PostFormData = z.infer<typeof postSchema>;

interface UploadedImage {
  url: string;
  storage_path: string;
  order_index: number;
}

interface PostFormProps {
  authors: Author[];
  initialData?: PostFull;
}

export function PostForm({ authors, initialData }: PostFormProps) {
  const router = useRouter();
  const editorRef = useRef<EditorRef>(null);
  const [isPending, startTransition] = useTransition();
  const [images, setImages] = useState<UploadedImage[]>(
    initialData?.images.map((img, idx) => ({
      order_index: idx,
      storage_path: img.storage_path,
      url: img.url,
    })) ?? []
  );

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<PostFormData>({
    defaultValues: {
      author_id: initialData?.author_id ?? authors[0]?.id ?? "",
      created_at: initialData?.created_at
        ? new Date(initialData.created_at)
        : new Date(),
      title: initialData?.title ?? "",
    },
    resolver: zodResolver(postSchema),
  });

  const onSubmit = (data: PostFormData) => {
    const content = editorRef.current?.getInstance().getMarkdown() ?? "";

    startTransition(async () => {
      const createdAt = data.created_at.toISOString();

      if (initialData) {
        const result = await updatePost(
          initialData.id,
          {
            author_id: data.author_id,
            content,
            created_at: createdAt,
            title: data.title,
          },
          images
        );

        if (result.error) {
          toast.error(result.error);
          return;
        }

        toast.success("포스트가 수정되었습니다");
        router.push("/admin");
      } else {
        const result = await createPost({
          images,
          post: {
            author_id: data.author_id,
            content,
            created_at: createdAt,
            title: data.title,
          },
        });

        if (result.error) {
          toast.error(result.error);
          return;
        }

        toast.success("포스트가 생성되었습니다");
        router.push("/admin");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          제목
        </label>
        <Input
          id="title"
          placeholder="포스트 제목을 입력하세요"
          {...register("title")}
          aria-invalid={!!errors.title}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="author_id" className="text-sm font-medium">
            작성자
          </label>
          <select
            id="author_id"
            {...register("author_id")}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
          {errors.author_id && (
            <p className="text-sm text-destructive">
              {errors.author_id.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">작성일</label>
          <Controller
            control={control}
            name="created_at"
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                placeholder="작성일 선택"
              />
            )}
          />
          {errors.created_at && (
            <p className="text-sm text-destructive">
              {errors.created_at.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">이미지</label>
        <ImageUpload
          images={images}
          onChange={setImages}
          onInsertToContent={(url) => {
            editorRef.current?.insertText(`\n\n![이미지](${url})\n\n`);
          }}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">내용</label>
        <TuiEditor
          ref={editorRef}
          initialValue={initialData?.content ?? ""}
          placeholder="내용을 입력하세요..."
          height="600px"
        />
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          취소
        </Button>
        <Button type="submit" disabled={isPending} loading={isPending}>
          {initialData ? "수정하기" : "작성하기"}
        </Button>
      </div>
    </form>
  );
}
