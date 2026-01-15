import type { Metadata } from "next";

import "./globals.css";

import { Navigation } from "@/components/navigation";
import { Slogan } from "@/components/slogan";
import { Toaster } from "@/components/ui/sonner";

import { Providers } from "./providers";

export const metadata: Metadata = {
  description: "We walk neary - Photo Archive",
  title: "We walk neary",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body suppressHydrationWarning className="min-h-screen flex flex-col">
        <Providers>
          <Navigation />
          <Slogan />

          {/* Main Content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="py-8 text-center border-t border-zinc-800">
            <div className="flex flex-col items-center gap-2 text-sm font-mono text-zinc-500">
              <p>Since 2026.01.12</p>
              <p>Contact: jae040507@gmail.com</p>
            </div>
          </footer>

          <Toaster position="bottom-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
