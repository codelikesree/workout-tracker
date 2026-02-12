"use client";

import { useQuery } from "@tanstack/react-query";

export interface DashboardStats {
  thisWeek: number;
  thisMonth: number;
  streak: number;
  templateCount: number;
  lastWorkout: {
    name: string;
    date: string;
    id: string;
  } | null;
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch dashboard stats");
      }
      return res.json();
    },
  });
}
