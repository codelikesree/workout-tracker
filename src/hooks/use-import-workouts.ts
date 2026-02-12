"use client";

import { useMutation } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api/client";
import type { ImportWorkoutsResponse } from "@/lib/types/api";

export function useImportWorkouts() {
  return useMutation({
    mutationFn: (text: string) =>
      fetchAPI<ImportWorkoutsResponse>("/api/workouts/import", {
        method: "POST",
        body: JSON.stringify({ text }),
      }),
  });
}
