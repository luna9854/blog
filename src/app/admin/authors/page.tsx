"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { Author } from "@/entities/author";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const authorSchema = z.object({
  bio: z.string().max(200).optional(),
  instagram: z.string().max(50).optional(),
  name: z.string().min(1, "이름을 입력해주세요").max(50),
});

type AuthorFormData = z.infer<typeof authorSchema>;

// 파일명 정리
const sanitizeFileName = (name: string): string => {
  const ext = name.split(".").pop() || "png";
  const baseName = name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 50);
  return `${baseName}.${ext}`;
};

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<AuthorFormData>({
    resolver: zodResolver(authorSchema),
  });

  const {
    formState: { errors: editErrors },
    handleSubmit: handleEditSubmit,
    register: registerEdit,
    reset: resetEdit,
    setValue: setEditValue,
  } = useForm<AuthorFormData>({
    resolver: zodResolver(authorSchema),
  });

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    const { data } = (await supabase
      .from("authors")
      .select("*")
      .order("created_at", { ascending: true })) as { data: Author[] | null };
    setAuthors(data ?? []);
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    const sanitizedName = sanitizeFileName(file.name);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${sanitizedName}`;
    const filePath = `avatars/${fileName}`;

    const { error } = await supabase.storage
      .from("post-images")
      .upload(filePath, file);

    if (error) {
      console.error("Avatar upload error:", error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("post-images")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드할 수 있습니다");
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (data: AuthorFormData) => {
    startTransition(async () => {
      let avatarUrl: string | null = null;

      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
        if (!avatarUrl) {
          toast.error("프로필 사진 업로드 실패");
          return;
        }
      }

      const { error } = (await supabase.from("authors").insert({
        avatar_url: avatarUrl,
        bio: data.bio || null,
        instagram: data.instagram || null,
        name: data.name,
      } as never)) as { error: Error | null };

      if (error) {
        toast.error("작성자 추가 실패: " + error.message);
        return;
      }

      toast.success("작성자가 추가되었습니다");
      reset();
      setShowForm(false);
      setAvatarPreview(null);
      setAvatarFile(null);
      fetchAuthors();
    });
  };

  const handleUpdateAvatar = async (authorId: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error("이미지 파일만 업로드할 수 있습니다");
        return;
      }

      startTransition(async () => {
        const avatarUrl = await uploadAvatar(file);
        if (!avatarUrl) {
          toast.error("프로필 사진 업로드 실패");
          return;
        }

        const { error } = await supabase
          .from("authors")
          .update({ avatar_url: avatarUrl } as never)
          .eq("id", authorId);

        if (error) {
          toast.error("프로필 사진 변경 실패: " + error.message);
          return;
        }

        toast.success("프로필 사진이 변경되었습니다");
        fetchAuthors();
      });
    };
    input.click();
  };

  const handleDelete = (authorId: string) => {
    if (!confirm("정말 삭제하시겠습니까? 관련 포스트도 모두 삭제됩니다.")) {
      return;
    }

    startTransition(async () => {
      const { error } = await supabase
        .from("authors")
        .delete()
        .eq("id", authorId);

      if (error) {
        toast.error("삭제 실패: " + error.message);
        return;
      }

      toast.success("작성자가 삭제되었습니다");
      fetchAuthors();
    });
  };

  const startEditing = (author: Author) => {
    setEditingAuthor(author);
    setEditValue("name", author.name);
    setEditValue("instagram", author.instagram || "");
    setEditValue("bio", author.bio || "");
  };

  const cancelEditing = () => {
    setEditingAuthor(null);
    resetEdit();
  };

  const onEditSubmit = (data: AuthorFormData) => {
    if (!editingAuthor) return;

    startTransition(async () => {
      const { error } = await supabase
        .from("authors")
        .update({
          name: data.name,
          instagram: data.instagram || null,
          bio: data.bio || null,
        } as never)
        .eq("id", editingAuthor.id);

      if (error) {
        toast.error("수정 실패: " + error.message);
        return;
      }

      toast.success("작성자 정보가 수정되었습니다");
      setEditingAuthor(null);
      resetEdit();
      fetchAuthors();
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">작성자 관리</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="size-4" />
          작성자 추가
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-lg border border-border bg-background p-6"
        >
          {/* Avatar Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">프로필 사진</label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative size-20 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-border bg-muted hover:border-primary transition-colors"
              >
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Avatar preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Camera className="size-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <p className="text-sm text-muted-foreground">
                클릭하여 사진 업로드
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              이름 *
            </label>
            <Input
              id="name"
              placeholder="Baesongjun"
              {...register("name")}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="instagram" className="text-sm font-medium">
              Instagram
            </label>
            <Input
              id="instagram"
              placeholder="@username"
              {...register("instagram")}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium">
              소개
            </label>
            <Input id="bio" placeholder="간단한 소개" {...register("bio")} />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                reset();
                setAvatarPreview(null);
                setAvatarFile(null);
              }}
            >
              취소
            </Button>
            <Button type="submit" disabled={isPending} loading={isPending}>
              추가
            </Button>
          </div>
        </form>
      )}

      <div className="rounded-lg border border-border bg-background">
        {authors.length === 0 ? (
          <p className="p-8 text-center text-muted-foreground">
            등록된 작성자가 없습니다.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {authors.map((author) => (
              <li key={author.id} className="p-4">
                {editingAuthor?.id === author.id ? (
                  <form
                    onSubmit={handleEditSubmit(onEditSubmit)}
                    className="space-y-4"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div
                        onClick={() => handleUpdateAvatar(author.id)}
                        className="group relative size-12 shrink-0 cursor-pointer overflow-hidden rounded-full bg-muted"
                      >
                        {author.avatar_url ? (
                          <Image
                            src={author.avatar_url}
                            alt={author.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Camera className="size-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                          <Pencil className="size-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">
                            이름
                          </label>
                          <Input
                            placeholder="이름"
                            {...registerEdit("name")}
                            aria-invalid={!!editErrors.name}
                          />
                          {editErrors.name && (
                            <p className="mt-1 text-sm text-destructive">
                              {editErrors.name.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">
                            Instagram
                          </label>
                          <Input
                            placeholder="@username"
                            {...registerEdit("instagram")}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">
                            소개
                          </label>
                          <Input
                            placeholder="간단한 소개 문구"
                            {...registerEdit("bio")}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={cancelEditing}
                      >
                        취소
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isPending}
                        loading={isPending}
                      >
                        저장
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div
                        onClick={() => handleUpdateAvatar(author.id)}
                        className="group relative size-12 cursor-pointer overflow-hidden rounded-full bg-muted"
                      >
                        {author.avatar_url ? (
                          <Image
                            src={author.avatar_url}
                            alt={author.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Camera className="size-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                          <Pencil className="size-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">{author.name}</p>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          {author.instagram && <span>{author.instagram}</span>}
                          {author.bio && <span>· {author.bio}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => startEditing(author)}
                        disabled={isPending}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(author.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
