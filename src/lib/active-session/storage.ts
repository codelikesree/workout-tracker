import type { ActiveSession } from "@/lib/types/active-session";

const STORAGE_KEY = "workout-session-v1";

export function loadSession(): ActiveSession | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    // Structural validation: check required fields exist and have correct types.
    // Catches corrupted/stale data without a full Zod schema.
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof parsed.status !== "string" ||
      typeof parsed.workoutName !== "string" ||
      typeof parsed.startedAt !== "string" ||
      !Array.isArray(parsed.exercises) ||
      parsed.exercises.length === 0
    ) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed as ActiveSession;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function saveSession(session: ActiveSession | null): void {
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}
