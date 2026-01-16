import type { Metadata, Viewport } from "next";

import "./globals.css";

import { Navigation } from "@/components/navigation";
import { Slogan } from "@/components/slogan";
import { Toaster } from "@/components/ui/sonner";

import { Providers } from "./providers";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://wewalkneary.com";
const SITE_NAME = "We walk neary";
const SITE_DESCRIPTION =
  "We walk neary - 각자의 감각을 찾고 탐구하는 사진 아카이브";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ["사진", "아카이브", "포토", "갤러리", "we walk neary", "sandvill"],
  authors: [{ name: "We walk neary" }],
  creator: "We walk neary",
  publisher: "We walk neary",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: SITE_URL,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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
