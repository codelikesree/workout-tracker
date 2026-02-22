"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api/client";
import type { EnhancedAnalyticsResponse } from "@/lib/types/api";

export function useAnalytics(period: "week" | "month" | "all" = "week") {
  return useQuery({
    queryKey: ["analytics", period],
    queryFn: () => fetchAPI<EnhancedAnalyticsResponse>(`/api/analytics?period=${period}`),
    staleTime: 5 * 60 * 1000, // analytics data is historical — rarely changes mid-session
  });
}
