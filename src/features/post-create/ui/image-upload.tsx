"use client";

import { FileText, GripVertical, Plus, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface UploadedImage {
  url: string;
  storage_path: string;
  order_index: number;
}

interface ImageUploadProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  onInsertToContent?: (url: string) => void;
}

// 파일명 정리 (특수문자 제거)
const sanitizeFileName = (name: string): string => {
  const ext = name.split(".").pop() || "png";
  const baseName = name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 50);
  return `${baseName}.${ext}`;
};

export function ImageUpload({
  images,
  onChange,
  onInsertToContent,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (fileArray.length === 0) {
        toast.error("이미지 파일만 업로드할 수 있습니다");
        return;
      }

      setIsUploading(true);

      try {
        const uploadPromises = fileArray.map(async (file, idx) => {
          const sanitizedName = sanitizeFileName(file.name);
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${sanitizedName}`;
          const filePath = `posts/${fileName}`;

          const { error } = await supabase.storage
            .from("post-images")
            .upload(filePath, file);

          if (error) {
            throw new Error(error.message);
          }

          const { data: urlData } = supabase.storage
            .from("post-images")
            .getPublicUrl(filePath);

          return {
            order_index: images.length + idx,
            storage_path: filePath,
            url: urlData.publicUrl,
          };
        });

        const uploaded = await Promise.all(uploadPromises);
        onChange([...images, ...uploaded]);
        toast.success(`${uploaded.length}개 이미지 업로드 완료`);
      } catch (err) {
        console.error("Upload error:", err);
        toast.error("이미지 업로드 실패");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [images, onChange, supabase.storage]
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await uploadFiles(files);
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages.map((img, i) => ({ ...img, order_index: i })));
  };

  const handleInsertToContent = (url: string) => {
    if (onInsertToContent) {
      onInsertToContent(url);
      toast.success("이미지가 본문에 삽입되었습니다");
    }
  };

  // 드래그 앤 드롭 (이미지 순서 변경)
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const [dragged] = newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, dragged);

    onChange(newImages.map((img, i) => ({ ...img, order_index: i })));
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // 드래그 앤 드롭 (파일 업로드)
  const handleFileDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;
      await uploadFiles(files);
    },
    [uploadFiles]
  );

  const handleFileDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // 파일 드래그인지 확인
    if (e.dataTransfer?.types.includes("Files")) {
      setIsDragging(true);
    }
  }, []);

  const handleFileDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <div
        className={cn(
          "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 p-4 rounded-lg border-2 border-dashed transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-transparent"
        )}
        onDrop={handleFileDrop}
        onDragOver={handleFileDragOver}
        onDragLeave={handleFileDragLeave}
      >
        {images.map((image, index) => (
          <div
            key={image.storage_path}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted",
              draggedIndex === index && "opacity-50"
            )}
          >
            <Image
              src={image.url}
              alt={`Image ${index + 1}`}
              fill
              className="object-cover"
              sizes="200px"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex h-full items-center justify-center gap-2">
                <button type="button" className="cursor-grab text-white">
                  <GripVertical className="size-5" />
                </button>
                {onInsertToContent && (
                  <button
                    type="button"
                    onClick={() => handleInsertToContent(image.url)}
                    className="text-white hover:text-primary"
                    title="본문에 삽입"
                  >
                    <FileText className="size-5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="text-white hover:text-destructive"
                >
                  <Trash2 className="size-5" />
                </button>
              </div>
            </div>
            <div className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
              {index + 1}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            "flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary hover:bg-muted",
            isDragging && "border-primary bg-primary/10"
          )}
        >
          {isUploading ? (
            <Upload className="size-8 animate-pulse text-muted-foreground" />
          ) : isDragging ? (
            <>
              <Upload className="size-8 text-primary" />
              <span className="text-xs text-primary">놓으세요</span>
            </>
          ) : (
            <>
              <Plus className="size-8 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                드래그 또는 클릭
              </span>
            </>
          )}
        </button>
      </div>

      <p className="text-sm text-muted-foreground">
        이미지를 드래그하여 업로드하거나 순서를 변경할 수 있습니다, 첫번째
        이미지가 썸네일로 사용됩니다.
        <br />
        📄 아이콘으로 본문에 삽입합니다.
      </p>
    </div>
  );
}
