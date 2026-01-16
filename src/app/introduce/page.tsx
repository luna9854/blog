import type { Metadata } from "next";

import { SrOnlyHeading } from "@/components/ui/sr-only-heading";

import { IntroduceContent } from "./introduce-content";

// SSG: 빌드 시 정적 생성, 이후 변경 없음
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Introduce",
  description: "We walk neary - 각자의 감각을 찾고 탐구하는 사진 아카이브 소개",
  openGraph: {
    title: "Introduce",
    description: "We walk neary - 각자의 감각을 찾고 탐구하는 사진 아카이브 소개",
    type: "website",
  },
};

export default function IntroducePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1450px] mx-auto p-4 sm:p-8">
        <SrOnlyHeading>Introduce - We walk neary 소개</SrOnlyHeading>
        <IntroduceContent />
      </div>
    </div>
  );
}
