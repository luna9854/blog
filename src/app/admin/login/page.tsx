"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  key: z.string().min(1, "관리자 키를 입력해주세요"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    startTransition(async () => {
      const res = await fetch("/api/admin/auth", {
        body: JSON.stringify({ key: data.key }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const result = await res.json();

      if (result.success) {
        toast.success("로그인 성공");
        router.push("/admin");
        router.refresh();
      } else {
        toast.error(result.message || "로그인 실패");
      }
    });
  };

  return (
    <div className="mx-auto max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <p className="mt-2 text-muted-foreground">관리자 키를 입력하세요</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="key" className="text-sm font-medium">
            관리자 키
          </label>
          <Input
            id="key"
            type="password"
            placeholder="관리자 키 입력"
            {...register("key")}
            aria-invalid={!!errors.key}
          />
          {errors.key && (
            <p className="text-sm text-destructive">{errors.key.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isPending}
          loading={isPending}
        >
          로그인
        </Button>
      </form>
    </div>
  );
}
