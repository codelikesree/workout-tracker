"use client";

import { useQuery } from "@tanstack/react-query";

export interface LastWorkoutSet {
  setNumber: number;
  reps: number;
  weight: number;
  weightUnit: string;
}

export interface LastWorkoutStats {
  [exerciseName: string]: {
    date: string;
    sets: LastWorkoutSet[];
  };
}

export function useLastWorkoutStats(exerciseNames: string[]) {
  return useQuery<LastWorkoutStats>({
    queryKey: ["last-workout-stats", exerciseNames],
    queryFn: async () => {
      const params = new URLSearchParams({
        exercises: exerciseNames.join(","),
      });
      const res = await fetch(`/api/workouts/last-stats?${params}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch last workout stats");
      }
      const data = await res.json();
      return data.stats;
    },
    enabled: exerciseNames.length > 0,
  });
}
