"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchAPI } from "@/lib/api/client";
import type { UserProfileResponse } from "@/lib/types/api";

interface ProfileUpdatePayload {
  fullName?: string;
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  heightUnit: "cm" | "in";
  weightUnit: "kg" | "lbs";
}

export function useProfile() {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: () => fetchAPI<UserProfileResponse>("/api/users/me"),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProfileUpdatePayload) =>
      fetchAPI<UserProfileResponse>("/api/users/me", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("Profile updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
