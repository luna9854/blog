"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { OverlayProvider } from "overlay-kit";
import { useState } from "react";

import { SecretAdminProvider } from "@/providers/secret-admin-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 60 * 1000, // 1분
          },
        },
      })
  );

  return (
    <NuqsAdapter>
      <QueryClientProvider client={queryClient}>
        <OverlayProvider>
          <SecretAdminProvider>{children}</SecretAdminProvider>
        </OverlayProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </NuqsAdapter>
  );
}
