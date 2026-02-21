"use client";

import { useState, useCallback } from "react";
import { fetchAPI } from "@/lib/api/client";
import { DEFAULT_REST_TIME_SECONDS } from "@/lib/constants/workout-types";
import type { StartWorkoutConfig } from "@/lib/types/active-session";
import type { WorkoutType } from "@/lib/db/models/workout-log";

export interface AiSuggestion {
  workoutName: string;
  type: WorkoutType;
  rationale: string;
  exercises: Array<{
    name: string;
    targetSets: number;
    targetReps: number;
    targetWeight: number;
    weightUnit: "kg" | "lbs";
    restTime: number;
  }>;
}

type SuggestionState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; suggestion: AiSuggestion }
  | { status: "error"; message: string };

export function useAiWorkoutSuggestion() {
  const [state, setState] = useState<SuggestionState>({ status: "idle" });

  const fetchSuggestion = useCallback(async (userPrompt?: string) => {
    setState({ status: "loading" });
    try {
      const data = await fetchAPI<{ suggestion: AiSuggestion }>(
        "/api/workouts/ai-suggest",
        {
          method: "POST",
          body: JSON.stringify({ userPrompt: userPrompt ?? "" }),
        }
      );
      setState({ status: "ready", suggestion: data.suggestion });
    } catch (error) {
      setState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to get suggestion. Please try again.",
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  const toStartConfig = useCallback(
    (suggestion: AiSuggestion): StartWorkoutConfig => ({
      workoutName: suggestion.workoutName,
      type: suggestion.type,
      isAiSuggested: true,
      exercises: suggestion.exercises.map((ex) => ({
        name: ex.name,
        restTime: ex.restTime ?? DEFAULT_REST_TIME_SECONDS,
        sets: Array.from({ length: ex.targetSets }, () => ({
          targetReps: ex.targetReps,
          targetWeight: ex.targetWeight,
          weightUnit: ex.weightUnit,
        })),
      })),
    }),
    []
  );

  return { state, fetchSuggestion, reset, toStartConfig };
}
