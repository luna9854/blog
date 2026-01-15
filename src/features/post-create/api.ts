"use server";

import { revalidatePath } from "next/cache";

import type {
  Post,
  PostImage,
  PostImageInsert,
  PostInsert,
} from "@/entities/post";

import { createServerClient } from "@/lib/supabase/server";

interface CreatePostData {
  post: PostInsert;
  images: Array<{ url: string; storage_path: string; order_index: number }>;
}

export async function createPost(data: CreatePostData) {
  const supabase = await createServerClient();

  // 포스트 생성
  const { data: post, error: postError } = (await supabase
    .from("posts")
    .insert(data.post as never)
    .select()
    .single()) as { data: Post | null; error: Error | null };

  if (postError || !post) {
    return { error: postError?.message ?? "Failed to create post" };
  }

  // 이미지가 있으면 추가
  if (data.images.length > 0) {
    const imageInserts: PostImageInsert[] = data.images.map((img) => ({
      order_index: img.order_index,
      post_id: post.id,
      storage_path: img.storage_path,
      url: img.url,
    }));

    const { error: imageError } = (await supabase
      .from("post_images")
      .insert(imageInserts as never[])) as { error: Error | null };

    if (imageError) {
      // 이미지 추가 실패 시 포스트 삭제
      await supabase.from("posts").delete().eq("id", post.id);
      return { error: imageError.message };
    }
  }

  revalidatePath("/archive");
  return { data: post };
}

export async function updatePost(
  postId: string,
  data: Partial<PostInsert>,
  images?: Array<{ url: string; storage_path: string; order_index: number }>
) {
  const supabase = await createServerClient();

  const { error: postError } = (await supabase
    .from("posts")
    .update({ ...data, updated_at: new Date().toISOString() } as never)
    .eq("id", postId)) as { error: Error | null };

  if (postError) {
    return { error: postError.message };
  }

  // 이미지 업데이트가 있으면 기존 이미지 삭제 후 새로 추가
  if (images !== undefined) {
    await supabase.from("post_images").delete().eq("post_id", postId);

    if (images.length > 0) {
      const imageInserts: PostImageInsert[] = images.map((img) => ({
        order_index: img.order_index,
        post_id: postId,
        storage_path: img.storage_path,
        url: img.url,
      }));

      const { error: imageError } = (await supabase
        .from("post_images")
        .insert(imageInserts as never[])) as { error: Error | null };

      if (imageError) {
        return { error: imageError.message };
      }
    }
  }

  revalidatePath("/archive");
  revalidatePath(`/archive/${postId}`);
  return { success: true };
}

export async function deletePost(postId: string) {
  const supabase = await createServerClient();

  // 먼저 이미지 Storage 파일 삭제
  const { data: images } = (await supabase
    .from("post_images")
    .select("storage_path")
    .eq("post_id", postId)) as { data: Array<{ storage_path: string }> | null };

  if (images && images.length > 0) {
    const paths = images.map((img) => img.storage_path);
    await supabase.storage.from("post-images").remove(paths);
  }

  // 포스트 삭제 (CASCADE로 이미지, 댓글도 삭제됨)
  const { error } = (await supabase
    .from("posts")
    .delete()
    .eq("id", postId)) as { error: Error | null };

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/archive");
  return { success: true };
}

export async function uploadImage(formData: FormData) {
  const supabase = await createServerClient();
  const file = formData.get("file") as File;

  if (!file) {
    return { error: "No file provided" };
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `posts/${fileName}`;

  const { error } = await supabase.storage
    .from("post-images")
    .upload(filePath, file);

  if (error) {
    return { error: error.message };
  }

  const { data: urlData } = supabase.storage
    .from("post-images")
    .getPublicUrl(filePath);

  return {
    data: {
      storage_path: filePath,
      url: urlData.publicUrl,
    },
  };
}
