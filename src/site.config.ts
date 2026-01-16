/**
 * 사이트 설정
 * 이 파일에서 사이트 전체 설정을 관리합니다.
 */

export const siteConfig = {
  // 기본 정보
  name: "Parallel Walk",

  // 2. 설명: 겉보기엔 '감성 에세이'지만, 속뜻은 '템플릿을 거부하는 삶' (소개글과 연결됨)
  description: "정해진 궤도를 벗어나, 각자의 속도로 기록하는 일상의 단면들.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://wewalkneary.com",

  // 슬로건 (헤더 아래 표시)
  slogan: "Walk in your own orbit.",

  // SEO 키워드: 정상적인 키워드로 위장
  keywords: [
    "Photography",
    "Archive",
    "Daily Log",
    "Inspiration",
    "Parallel Walk", // 브랜드명
    "Essay",
  ],

  // 작성자 정보
  // 작성자 정보
  author: {
    name: "Parallel Walk", // 혹은 본명/닉네임
    email: "luna9854@gmail.com",
  },

  // Footer
  footer: {
    since: "2026.01.12",
    contact: "luna9854@gmail.com",
  },

  // 소셜 링크 (선택)
  social: {
    instagram: "",
    twitter: "",
  },

  // OG 이미지
  ogImage: "/og-image.png",

  // 로케일
  locale: "ko_KR",
} as const;

export type SiteConfig = typeof siteConfig;
