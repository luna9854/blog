import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { key } = await request.json();
  const adminKey = process.env.ADMIN_KEY;

  if (!adminKey) {
    return NextResponse.json(
      { message: "서버 설정 오류", success: false },
      { status: 500 }
    );
  }

  if (key === adminKey) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { message: "잘못된 관리자 키입니다", success: false },
    { status: 401 }
  );
}
