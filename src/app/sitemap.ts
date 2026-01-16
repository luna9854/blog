import type { MetadataRoute } from "next";

import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wewalkneary.com";

  // 정적 페이지들
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/archive`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/introduce`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // 동적 포스트 페이지들
  try {
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: posts } = (await supabase
      .from("posts")
      .select("id, updated_at, created_at")
      .order("created_at", { ascending: false })) as {
      data: { id: string; updated_at: string | null; created_at: string }[] | null;
    };

    const postPages: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
      url: `${baseUrl}/archive/${post.id}`,
      lastModified: new Date(post.updated_at ?? post.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticPages, ...postPages];
  } catch {
    // 데이터베이스 연결 실패 시 정적 페이지만 반환
    return staticPages;
  }
}
