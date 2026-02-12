"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useActiveSession } from "@/contexts/active-session-context";
import { useTemplateForWorkout } from "@/hooks/use-templates";
import { fetchAPI } from "@/lib/api/client";
import { DEFAULT_REST_TIME_SECONDS } from "@/lib/constants/workout-types";
import type { StartWorkoutConfig } from "@/lib/types/active-session";
import type { LastStatsResponse } from "@/lib/types/api";

export function useStartFromTemplate() {
  const router = useRouter();
  const { startWorkout, setLastWorkoutData } = useActiveSession();
  const loadTemplate = useTemplateForWorkout();
  const [loadingTemplateId, setLoadingTemplateId] = useState<string | null>(
    null
  );

  const startFromTemplate = useCallback(
    async (templateId: string) => {
      setLoadingTemplateId(templateId);
      try {
        const payload = await loadTemplate.mutateAsync(templateId);

        const config: StartWorkoutConfig = {
          workoutName: payload.workoutName,
          type: payload.type as StartWorkoutConfig["type"],
          templateId,
          exercises: payload.exercises.map((ex) => ({
            name: ex.name,
            sets: ex.sets.map((s) => ({
              targetReps: s.reps,
              targetWeight: s.weight,
              weightUnit: s.weightUnit,
            })),
            restTime: DEFAULT_REST_TIME_SECONDS,
          })),
        };

        startWorkout(config);

        // Fetch last workout stats for these exercises
        const exerciseNames = payload.exercises.map((ex) => ex.name);
        if (exerciseNames.length > 0) {
          try {
            const params = new URLSearchParams({
              exercises: exerciseNames.join(","),
            });
            const data = await fetchAPI<LastStatsResponse>(
              `/api/workouts/last-stats?${params}`
            );
            setLastWorkoutData(data.stats);
          } catch {
            // Non-critical, continue without last workout data
          }
        }

        router.push("/workout/active");
      } catch {
        // Error handled by the mutation's onError
      } finally {
        setLoadingTemplateId(null);
      }
    },
    [loadTemplate, startWorkout, setLastWorkoutData, router]
  );

  return { startFromTemplate, loadingTemplateId };
}
