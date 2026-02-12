"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api/client";
import type { DashboardStatsResponse } from "@/lib/types/api";

export type DashboardStats = DashboardStatsResponse;

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: () => fetchAPI<DashboardStatsResponse>("/api/dashboard/stats"),
  });
}
