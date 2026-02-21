"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchAPI } from "@/lib/api/client";
import type { BodyPart } from "@/lib/constants/exercises";

export interface CustomExercise {
  _id: string;
  userId: string;
  name: string;
  bodyPart: BodyPart;
  createdAt: string;
  updatedAt: string;
}

interface CustomExercisesResponse {
  exercises: CustomExercise[];
}

interface CustomExerciseResponse {
  exercise: CustomExercise;
  updatedLogs?: number;
  updatedTemplates?: number;
}

export function useCustomExercises() {
  return useQuery({
    queryKey: ["exercises"],
    queryFn: () => fetchAPI<CustomExercisesResponse>("/api/exercises"),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; bodyPart: BodyPart }) =>
      fetchAPI<CustomExerciseResponse>("/api/exercises", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      toast.success("Exercise added!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; bodyPart?: BodyPart };
    }) =>
      fetchAPI<CustomExerciseResponse>(`/api/exercises/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["workouts"] });

      const { updatedLogs = 0, updatedTemplates = 0 } = result;
      if (updatedLogs > 0 || updatedTemplates > 0) {
        toast.success(
          `Exercise renamed. Updated ${updatedLogs} workout log${updatedLogs !== 1 ? "s" : ""} and ${updatedTemplates} template${updatedTemplates !== 1 ? "s" : ""}.`
        );
      } else {
        toast.success("Exercise updated!");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchAPI<{ success: boolean }>(`/api/exercises/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      toast.success("Exercise deleted. Past workouts are unaffected.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
