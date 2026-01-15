import type { Metadata } from "next";

import { YouTubeEmbed } from "@next/third-parties/google";

export const metadata: Metadata = {
  title: "Home | We walk neary",
  description: "sandvill's Youtube Channel",
};

// 유튜브 영상 ID 목록 (필요시 수정)
const YOUTUBE_VIDEOS = [
  {
    id: "dQw4w9WgXcQ", // 예시 영상 ID - 실제 영상 ID로 교체
    title: "Featured Video",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1450px] mx-auto p-4 sm:p-8">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold font-mono tracking-wide mb-4">
            We walk neary
          </h1>
          <p className="text-zinc-400 font-mono text-sm">
            sandvill&apos;s Youtube Channel
          </p>
        </section>

        {/* YouTube Video Section */}
        <section className="mb-12">
          <div className="max-w-4xl mx-auto">
            {YOUTUBE_VIDEOS.map((video) => (
              <div key={video.id} className="mb-8">
                <div className="rounded-lg overflow-hidden bg-zinc-900">
                  <YouTubeEmbed
                    videoid={video.id}
                    style="width: 100%; aspect-ratio: 16/9;"
                  />
                </div>
                {video.title && (
                  <p className="mt-3 text-sm font-mono text-zinc-400 text-center">
                    {video.title}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Links Section */}
        <section className="text-center">
          <div className="flex flex-wrap justify-center gap-6 text-sm font-mono">
            <a
              href="/archive"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Archive →
            </a>
            <a
              href="/introduce"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Introduce →
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
