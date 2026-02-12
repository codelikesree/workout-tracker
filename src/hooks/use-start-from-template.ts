"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useActiveSession } from "@/contexts/active-session-context";
import { useTemplateForWorkout } from "@/hooks/use-templates";
import type { StartWorkoutConfig } from "@/lib/types/active-session";

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
          exercises: payload.exercises.map(
            (ex: { name: string; sets: Array<{ reps: number; weight: number; weightUnit: "kg" | "lbs" }> }) => ({
              name: ex.name,
              sets: ex.sets.map((s) => ({
                targetReps: s.reps,
                targetWeight: s.weight,
                weightUnit: s.weightUnit,
              })),
              restTime: 90,
            })
          ),
        };

        startWorkout(config);

        // Fetch last workout stats for these exercises
        const exerciseNames = payload.exercises.map(
          (ex: { name: string }) => ex.name
        );
        if (exerciseNames.length > 0) {
          try {
            const params = new URLSearchParams({
              exercises: exerciseNames.join(","),
            });
            const res = await fetch(`/api/workouts/last-stats?${params}`);
            if (res.ok) {
              const data = await res.json();
              setLastWorkoutData(data.stats);
            }
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
