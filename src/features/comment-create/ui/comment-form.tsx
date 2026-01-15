"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { createComment } from "../api";

const commentSchema = z.object({
  content: z
    .string()
    .min(1, "댓글을 입력해주세요")
    .max(500, "댓글은 500자 이내로 입력해주세요"),
  nickname: z
    .string()
    .min(1, "닉네임을 입력해주세요")
    .max(20, "닉네임은 20자 이내로 입력해주세요"),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentFormProps {
  postId: string;
  onSuccess?: () => void;
}

export function CommentForm({ onSuccess, postId }: CommentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<CommentFormData>({
    defaultValues: {
      content: "",
      nickname: "",
    },
    resolver: zodResolver(commentSchema),
  });

  const onSubmit = (data: CommentFormData) => {
    startTransition(async () => {
      const result = await createComment({
        content: data.content,
        nickname: data.nickname,
        post_id: postId,
      });

      if (result.error) {
        toast.error("댓글 등록에 실패했습니다");
        return;
      }

      toast.success("댓글이 등록되었습니다");
      reset();
      onSuccess?.();
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex gap-2">
        <div className="w-28 shrink-0">
          <Input
            placeholder="닉네임"
            {...register("nickname")}
            aria-invalid={!!errors.nickname}
            className="bg-zinc-900 border-zinc-700 text-sm font-mono placeholder:text-zinc-600 focus-visible:ring-zinc-600"
          />
          {errors.nickname && (
            <p className="mt-1 text-xs text-red-400 font-mono">
              {errors.nickname.message}
            </p>
          )}
        </div>
        <div className="flex-1">
          <Input
            placeholder="댓글을 입력하세요..."
            {...register("content")}
            aria-invalid={!!errors.content}
            className="bg-zinc-900 border-zinc-700 text-sm font-mono placeholder:text-zinc-600 focus-visible:ring-zinc-600"
          />
          {errors.content && (
            <p className="mt-1 text-xs text-red-400 font-mono">
              {errors.content.message}
            </p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isPending}
          loading={isPending}
          variant="outline"
          size="icon"
          className="border-zinc-700 bg-transparent hover:bg-zinc-800"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </form>
  );
}
