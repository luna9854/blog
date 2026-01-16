"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const videoSchema = z.object({
  video_id: z
    .string()
    .min(1, "영상 ID를 입력해주세요")
    .max(20, "올바른 YouTube 영상 ID를 입력해주세요"),
  title: z.string().max(100).optional(),
});

type VideoFormData = z.infer<typeof videoSchema>;

type YouTubeVideo = {
  id: string;
  video_id: string;
  title: string | null;
  order_index: number;
};

interface SortableItemProps {
  video: YouTubeVideo;
  onDelete: (id: string) => void;
  isPending: boolean;
}

function SortableItem({ video, onDelete, isPending }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: video.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 bg-background"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="size-5 text-muted-foreground" />
      </button>

      <div className="flex-1">
        <p className="text-sm" style={{ fontFamily: "monospace" }}>{video.video_id}</p>
        {video.title && (
          <p className="text-sm text-muted-foreground">{video.title}</p>
        )}
      </div>

      <a
        href={`https://youtube.com/watch?v=${video.video_id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-blue-400 hover:underline"
      >
        미리보기
      </a>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onDelete(video.id)}
        disabled={isPending}
      >
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </li>
  );
}

export default function VideosPage() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const supabase = createClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<VideoFormData>({
    resolver: zodResolver(videoSchema),
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const { data } = (await supabase
      .from("youtube_videos")
      .select("*")
      .order("order_index", { ascending: true })) as {
      data: YouTubeVideo[] | null;
    };
    setVideos(data ?? []);
  };

  const onSubmit = (data: VideoFormData) => {
    startTransition(async () => {
      const maxOrder =
        videos.length > 0 ? Math.max(...videos.map((v) => v.order_index)) : -1;

      const { error } = await supabase.from("youtube_videos").insert({
        video_id: data.video_id,
        title: data.title || null,
        order_index: maxOrder + 1,
      } as never);

      if (error) {
        toast.error("영상 추가 실패: " + error.message);
        return;
      }

      toast.success("영상이 추가되었습니다");
      reset();
      setShowForm(false);
      fetchVideos();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    startTransition(async () => {
      const { error } = await supabase
        .from("youtube_videos")
        .delete()
        .eq("id", id);

      if (error) {
        toast.error("삭제 실패: " + error.message);
        return;
      }

      toast.success("영상이 삭제되었습니다");
      fetchVideos();
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = videos.findIndex((v) => v.id === active.id);
      const newIndex = videos.findIndex((v) => v.id === over.id);

      const newVideos = arrayMove(videos, oldIndex, newIndex);
      setVideos(newVideos);

      // DB 업데이트
      startTransition(async () => {
        const updates = newVideos.map((video, index) =>
          supabase
            .from("youtube_videos")
            .update({ order_index: index } as never)
            .eq("id", video.id)
        );

        await Promise.all(updates);
      });
    }
  };

  // YouTube 영상 ID 추출 (URL에서도 추출 가능)
  const extractVideoId = (input: string): string => {
    // 이미 ID 형태면 그대로 반환
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
      return input;
    }

    // URL에서 추출
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) return match[1];
    }

    return input;
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">YouTube 영상 관리</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="size-4" />
          영상 추가
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-lg border border-border bg-background p-6"
        >
          <div className="space-y-2">
            <label htmlFor="video_id" className="text-sm font-medium">
              YouTube 영상 ID 또는 URL *
            </label>
            <Input
              id="video_id"
              placeholder="dQw4w9WgXcQ 또는 https://youtube.com/watch?v=..."
              {...register("video_id", {
                setValueAs: extractVideoId,
              })}
              aria-invalid={!!errors.video_id}
            />
            {errors.video_id && (
              <p className="text-sm text-destructive">
                {errors.video_id.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              YouTube URL을 붙여넣으면 자동으로 ID가 추출됩니다
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              제목 (선택)
            </label>
            <Input id="title" placeholder="영상 제목" {...register("title")} />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                reset();
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
        {videos.length === 0 ? (
          <p className="p-8 text-center text-muted-foreground">
            등록된 영상이 없습니다.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={videos.map((v) => v.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="divide-y divide-border">
                {videos.map((video) => (
                  <SortableItem
                    key={video.id}
                    video={video}
                    onDelete={handleDelete}
                    isPending={isPending}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
