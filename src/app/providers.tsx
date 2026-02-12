"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { useState, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ActiveSessionProvider } from "@/contexts/active-session-context";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <QueryClientProvider client={queryClient}>
          <ActiveSessionProvider>
            {children}
          </ActiveSessionProvider>
          <Toaster position="top-right" richColors />
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
