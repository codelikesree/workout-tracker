"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchAPI } from "@/lib/api/client";
import type { CreateWorkoutInput, UpdateWorkoutInput } from "@/lib/validators/workout";
import type {
  WorkoutsListResponse,
  WorkoutResponse,
  DeleteWorkoutResponse,
} from "@/lib/types/api";

interface WorkoutFilters {
  startDate?: string;
  endDate?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export function useWorkouts(filters?: WorkoutFilters) {
  return useQuery({
    queryKey: ["workouts", filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters?.startDate) params.set("startDate", filters.startDate);
      if (filters?.endDate) params.set("endDate", filters.endDate);
      if (filters?.type) params.set("type", filters.type);
      if (filters?.page) params.set("page", filters.page.toString());
      if (filters?.limit) params.set("limit", filters.limit.toString());

      return fetchAPI<WorkoutsListResponse>(`/api/workouts?${params}`);
    },
  });
}

export function useWorkout(id: string) {
  return useQuery({
    queryKey: ["workout", id],
    queryFn: () => fetchAPI<WorkoutResponse>(`/api/workouts/${id}`),
    enabled: !!id,
  });
}

export function useCreateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkoutInput) =>
      fetchAPI<WorkoutResponse>("/api/workouts", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      toast.success("Workout logged successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkoutInput }) =>
      fetchAPI<WorkoutResponse>(`/api/workouts/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      queryClient.invalidateQueries({ queryKey: ["workout", variables.id] });
      toast.success("Workout updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchAPI<DeleteWorkoutResponse>(`/api/workouts/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      toast.success("Workout deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
