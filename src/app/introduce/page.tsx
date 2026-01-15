import type { Metadata } from "next";

import { IntroduceContent } from "./introduce-content";

// SSG: 빌드 시 정적 생성, 이후 변경 없음
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Introduce",
  description: "Who we are, for now",
};

export default function IntroducePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1450px] mx-auto p-4 sm:p-8">
        <IntroduceContent />
      </div>
    </div>
  );
}
