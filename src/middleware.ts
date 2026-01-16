import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin/login은 인증 체크 제외
  if (pathname === "/admin/login") {
    // 이미 인증된 경우 /admin으로 리다이렉트
    const isAuth = request.cookies.get("admin_auth")?.value === "true";
    if (isAuth) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // /admin/* 경로는 인증 필요
  if (pathname.startsWith("/admin")) {
    const isAuth = request.cookies.get("admin_auth")?.value === "true";

    if (!isAuth) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
