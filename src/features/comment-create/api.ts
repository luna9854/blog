"use server";

import type { Comment, CommentInsert } from "@/entities/comment";

import { createServerClient } from "@/lib/supabase/server";

export async function createComment(data: CommentInsert) {
  const supabase = await createServerClient();

  const { data: comment, error } = (await supabase
    .from("comments")
    .insert(data as never)
    .select()
    .single()) as { data: Comment | null; error: Error | null };

  if (error) {
    return { error: error.message };
  }

  return { data: comment };
}
