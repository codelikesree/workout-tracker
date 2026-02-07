"use client";

import { useQuery } from "@tanstack/react-query";

export function useAnalytics(period: "week" | "month" | "all" = "week") {
  return useQuery({
    queryKey: ["analytics", period],
    queryFn: async () => {
      const res = await fetch(`/api/analytics?period=${period}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch analytics");
      }
      return res.json();
    },
  });
}
