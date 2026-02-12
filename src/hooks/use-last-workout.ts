"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api/client";
import type { LastStatsResponse } from "@/lib/types/api";

export type { LastStatsSet } from "@/lib/types/api";

export type LastWorkoutStats = LastStatsResponse["stats"];

export function useLastWorkoutStats(exerciseNames: string[]) {
  return useQuery<LastWorkoutStats>({
    queryKey: ["last-workout-stats", exerciseNames],
    queryFn: async () => {
      const params = new URLSearchParams({
        exercises: exerciseNames.join(","),
      });
      const data = await fetchAPI<LastStatsResponse>(
        `/api/workouts/last-stats?${params}`
      );
      return data.stats;
    },
    enabled: exerciseNames.length > 0,
  });
}
