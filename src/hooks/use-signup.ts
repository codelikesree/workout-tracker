"use client";

import { useMutation } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api/client";
import type { SignupResponse } from "@/lib/types/api";

interface SignupPayload {
  username: string;
  email: string;
  password: string;
}

export function useSignup() {
  return useMutation({
    mutationFn: (data: SignupPayload) =>
      fetchAPI<SignupResponse>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}
