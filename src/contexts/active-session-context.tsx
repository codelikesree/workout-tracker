"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchAPI } from "@/lib/api/client";
import {
  sessionReducer,
  DEFAULT_WEIGHT_STEP,
} from "@/lib/active-session/reducer";
import { loadSession, saveSession } from "@/lib/active-session/storage";
import type {
  ActiveSession,
  ActiveSessionSet,
  StartWorkoutConfig,
  LastWorkoutData,
} from "@/lib/types/active-session";
import type { WorkoutResponse } from "@/lib/types/api";

// ─── Context ───────────────────────────────────────────────────────────

interface ActiveSessionContextValue {
  session: ActiveSession | null;
  isActive: boolean;

  // Lifecycle
  startWorkout: (config: StartWorkoutConfig) => void;
  discardWorkout: () => void;
  finishWorkout: () => void;
  saveWorkout: () => Promise<void>;
  resumeWorkout: () => void;

  // Set operations
  updateSet: (
    exerciseIndex: number,
    setIndex: number,
    data: Partial<ActiveSessionSet>
  ) => void;
  completeSet: (exerciseIndex: number, setIndex: number) => void;
  uncompleteSet: (exerciseIndex: number, setIndex: number) => void;
  addSet: (exerciseIndex: number) => void;
  removeSet: (exerciseIndex: number, setIndex: number) => void;

  // Exercise operations
  addExercise: (
    name: string,
    sets?: Array<{ reps: number; weight: number; weightUnit: "kg" | "lbs" }>
  ) => void;
  removeExercise: (exerciseIndex: number) => void;
  updateExerciseName: (
    exerciseIndex: number,
    name: string,
    sets?: Array<{ reps: number; weight: number; weightUnit: "kg" | "lbs" }>
  ) => void;

  // Rest timer
  skipRest: () => void;
  extendRest: (seconds: number) => void;

  // Value adjusters
  incrementReps: (exerciseIndex: number, setIndex: number) => void;
  decrementReps: (exerciseIndex: number, setIndex: number) => void;
  incrementWeight: (
    exerciseIndex: number,
    setIndex: number,
    step?: number
  ) => void;
  decrementWeight: (
    exerciseIndex: number,
    setIndex: number,
    step?: number
  ) => void;

  // Metadata
  updateWorkoutName: (name: string) => void;
  setLastWorkoutData: (data: Record<string, LastWorkoutData>) => void;
}

const ActiveSessionContext = createContext<ActiveSessionContextValue | null>(
  null
);

// ─── Provider ──────────────────────────────────────────────────────────

export function ActiveSessionProvider({ children }: { children: ReactNode }) {
  const [session, dispatch] = useReducer(sessionReducer, null);
  const router = useRouter();
  const hasRehydrated = useRef(false);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    if (hasRehydrated.current) return;
    hasRehydrated.current = true;

    const stored = loadSession();
    if (stored) {
      dispatch({ type: "REHYDRATE", session: stored });
    }
  }, []);

  // Persist to localStorage on every state change
  useEffect(() => {
    if (!hasRehydrated.current) return;
    saveSession(session);
  }, [session]);

  // Elapsed time timer (ticks every second when active)
  useEffect(() => {
    if (!session || session.status === "saving") return;

    const interval = setInterval(() => {
      dispatch({ type: "TICK_ELAPSED" });
    }, 1000);

    return () => clearInterval(interval);
  }, [session?.status]);

  // Rest timer (ticks every second when resting)
  useEffect(() => {
    if (!session || session.status !== "resting" || !session.restTimer) return;

    const interval = setInterval(() => {
      dispatch({ type: "TICK_REST" });
    }, 1000);

    return () => clearInterval(interval);
  }, [session?.status, session?.restTimer?.startedAt]);

  // Vibrate when rest timer expires
  useEffect(() => {
    if (
      session?.restTimer === null &&
      session?.status === "active" &&
      hasRehydrated.current
    ) {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, [session?.restTimer, session?.status]);

  // ─── Context Methods ─────────────────────────────────────────────

  const startWorkout = useCallback((config: StartWorkoutConfig) => {
    dispatch({ type: "START_WORKOUT", payload: config });
  }, []);

  const discardWorkout = useCallback(() => {
    dispatch({ type: "DISCARD" });
  }, []);

  const finishWorkout = useCallback(() => {
    dispatch({ type: "SET_STATUS", status: "finishing" });
  }, []);

  const resumeWorkout = useCallback(() => {
    dispatch({ type: "SET_STATUS", status: "active" });
  }, []);

  const saveWorkout = useCallback(async () => {
    if (!session) return;

    dispatch({ type: "SET_STATUS", status: "saving" });

    try {
      const payload = {
        workoutName: session.workoutName,
        type: session.type,
        date: new Date(session.startedAt).toISOString(),
        templateId: session.templateId || undefined,
        duration: Math.round(session.elapsedSeconds / 60),
        exercises: session.exercises
          .filter((ex) => ex.sets.some((s) => s.isCompleted))
          .map((ex) => ({
            name: ex.name,
            restTime: ex.restTime,
            sets: ex.sets
              .filter((s) => s.isCompleted)
              .map((s, i) => ({
                setNumber: i + 1,
                reps: s.actualReps,
                weight: s.actualWeight,
                weightUnit: s.weightUnit,
              })),
          })),
      };

      const data = await fetchAPI<WorkoutResponse>("/api/workouts", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      dispatch({ type: "DISCARD" });
      toast.success("Workout saved!");
      router.push(`/workouts/${data.workout._id}`);
    } catch (error) {
      dispatch({ type: "SET_STATUS", status: "finishing" });
      toast.error(
        error instanceof Error ? error.message : "Failed to save workout"
      );
    }
  }, [session, router]);

  const updateSet = useCallback(
    (
      exerciseIndex: number,
      setIndex: number,
      data: Partial<ActiveSessionSet>
    ) => {
      dispatch({ type: "UPDATE_SET", exerciseIndex, setIndex, data });
    },
    []
  );

  const completeSet = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      dispatch({ type: "COMPLETE_SET", exerciseIndex, setIndex });
    },
    []
  );

  const uncompleteSet = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      dispatch({ type: "UNCOMPLETE_SET", exerciseIndex, setIndex });
    },
    []
  );

  const addSet = useCallback((exerciseIndex: number) => {
    dispatch({ type: "ADD_SET", exerciseIndex });
  }, []);

  const removeSet = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      dispatch({ type: "REMOVE_SET", exerciseIndex, setIndex });
    },
    []
  );

  const addExercise = useCallback(
    (
      name: string,
      sets?: Array<{ reps: number; weight: number; weightUnit: "kg" | "lbs" }>
    ) => {
      dispatch({ type: "ADD_EXERCISE", name, sets });
    },
    []
  );

  const removeExercise = useCallback((exerciseIndex: number) => {
    dispatch({ type: "REMOVE_EXERCISE", exerciseIndex });
  }, []);

  const updateExerciseName = useCallback(
    (
      exerciseIndex: number,
      name: string,
      sets?: Array<{ reps: number; weight: number; weightUnit: "kg" | "lbs" }>
    ) => {
      dispatch({ type: "UPDATE_EXERCISE_NAME", exerciseIndex, name, sets });
    },
    []
  );

  const skipRest = useCallback(() => {
    dispatch({ type: "SKIP_REST" });
  }, []);

  const extendRest = useCallback((seconds: number) => {
    dispatch({ type: "EXTEND_REST", seconds });
  }, []);

  const incrementReps = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      dispatch({ type: "INCREMENT_REPS", exerciseIndex, setIndex });
    },
    []
  );

  const decrementReps = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      dispatch({ type: "DECREMENT_REPS", exerciseIndex, setIndex });
    },
    []
  );

  const incrementWeight = useCallback(
    (exerciseIndex: number, setIndex: number, step = DEFAULT_WEIGHT_STEP) => {
      dispatch({ type: "INCREMENT_WEIGHT", exerciseIndex, setIndex, step });
    },
    []
  );

  const decrementWeight = useCallback(
    (exerciseIndex: number, setIndex: number, step = DEFAULT_WEIGHT_STEP) => {
      dispatch({ type: "DECREMENT_WEIGHT", exerciseIndex, setIndex, step });
    },
    []
  );

  const updateWorkoutName = useCallback((name: string) => {
    dispatch({ type: "UPDATE_WORKOUT_NAME", name });
  }, []);

  const setLastWorkoutData = useCallback(
    (data: Record<string, LastWorkoutData>) => {
      dispatch({ type: "BULK_SET_LAST_WORKOUT_DATA", data });
    },
    []
  );

  const value: ActiveSessionContextValue = {
    session,
    isActive: session !== null && session.status !== "saving",
    startWorkout,
    discardWorkout,
    finishWorkout,
    saveWorkout,
    resumeWorkout,
    updateSet,
    completeSet,
    uncompleteSet,
    addSet,
    removeSet,
    addExercise,
    removeExercise,
    updateExerciseName,
    skipRest,
    extendRest,
    incrementReps,
    decrementReps,
    incrementWeight,
    decrementWeight,
    updateWorkoutName,
    setLastWorkoutData,
  };

  return (
    <ActiveSessionContext.Provider value={value}>
      {children}
    </ActiveSessionContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────

export function useActiveSession() {
  const context = useContext(ActiveSessionContext);
  if (!context) {
    throw new Error(
      "useActiveSession must be used within an ActiveSessionProvider"
    );
  }
  return context;
}
