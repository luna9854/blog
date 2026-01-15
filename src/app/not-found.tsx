import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-muted-foreground">페이지를 찾을 수 없습니다.</p>
      <Link
        href="/"
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80"
      >
        홈으로 돌아가기
      </Link>
    </main>
  );
}
