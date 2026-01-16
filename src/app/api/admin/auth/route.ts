import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  const { key } = await request.json();

  // Supabase에서 admin_key 조회
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: settings, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "admin_key")
    .single();

  if (error || !settings?.value) {
    return NextResponse.json(
      { message: "서버 설정 오류", success: false },
      { status: 500 }
    );
  }

  if (key === settings.value) {
    const response = NextResponse.json({ success: true });

    // HTTP-only 쿠키 설정 (7일 유효)
    response.cookies.set("admin_auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  }

  return NextResponse.json(
    { message: "잘못된 관리자 키입니다", success: false },
    { status: 401 }
  );
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });

  // 쿠키 삭제
  response.cookies.set("admin_auth", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
