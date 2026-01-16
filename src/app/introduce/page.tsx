import type { Metadata } from "next";

import { SrOnlyHeading } from "@/components/ui/sr-only-heading";
import { siteConfig } from "@/site.config";

import { IntroduceContent } from "./introduce-content";

// SSG: 빌드 시 정적 생성, 이후 변경 없음
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Introduce",
  description: `${siteConfig.name} 소개`,
  openGraph: {
    title: "Introduce",
    description: `${siteConfig.name} 소개`,
    type: "website",
  },
};

export default function IntroducePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1450px] mx-auto p-4 sm:p-8">
        <SrOnlyHeading>Introduce - {siteConfig.name} 소개</SrOnlyHeading>
        <IntroduceContent />
      </div>
    </div>
  );
}
