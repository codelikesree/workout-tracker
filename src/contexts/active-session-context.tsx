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
import type {
  ActiveSession,
  ActiveSessionExercise,
  ActiveSessionSet,
  StartWorkoutConfig,
  LastWorkoutData,
  SessionStatus,
} from "@/lib/types/active-session";

const STORAGE_KEY = "workout-session-v1";
const DEFAULT_REST_TIME = 90; // seconds

// ─── Actions ───────────────────────────────────────────────────────────

type SessionAction =
  | { type: "START_WORKOUT"; payload: StartWorkoutConfig }
  | {
      type: "UPDATE_SET";
      exerciseIndex: number;
      setIndex: number;
      data: Partial<ActiveSessionSet>;
    }
  | { type: "COMPLETE_SET"; exerciseIndex: number; setIndex: number }
  | { type: "ADD_SET"; exerciseIndex: number }
  | { type: "REMOVE_SET"; exerciseIndex: number; setIndex: number }
  | { type: "ADD_EXERCISE"; name: string }
  | { type: "REMOVE_EXERCISE"; exerciseIndex: number }
  | {
      type: "SET_LAST_WORKOUT_DATA";
      exerciseIndex: number;
      data: LastWorkoutData;
    }
  | { type: "BULK_SET_LAST_WORKOUT_DATA"; data: Record<string, LastWorkoutData> }
  | {
      type: "START_REST";
      totalSeconds: number;
      exerciseIndex: number;
      setIndex: number;
    }
  | { type: "TICK_REST" }
  | { type: "SKIP_REST" }
  | { type: "EXTEND_REST"; seconds: number }
  | { type: "TICK_ELAPSED" }
  | { type: "SET_STATUS"; status: SessionStatus }
  | { type: "UPDATE_WORKOUT_NAME"; name: string }
  | { type: "UPDATE_NOTES"; notes: string }
  | { type: "DISCARD" }
  | { type: "REHYDRATE"; session: ActiveSession };

// ─── Helpers ───────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function configToSession(config: StartWorkoutConfig): ActiveSession {
  return {
    status: "active",
    workoutName: config.workoutName,
    type: config.type,
    templateId: config.templateId || null,
    startedAt: new Date().toISOString(),
    exercises: config.exercises.map((ex) => ({
      id: generateId(),
      name: ex.name,
      sets: ex.sets.map((s, i) => ({
        setNumber: i + 1,
        targetReps: s.targetReps,
        targetWeight: s.targetWeight,
        actualReps: s.targetReps,
        actualWeight: s.targetWeight,
        weightUnit: s.weightUnit,
        isCompleted: false,
        completedAt: null,
      })),
      restTime: ex.restTime ?? DEFAULT_REST_TIME,
      notes: "",
    })),
    elapsedSeconds: 0,
    restTimer: null,
    currentExerciseIndex: 0,
    currentSetIndex: 0,
  };
}

function findNextIncompleteSet(
  exercises: ActiveSessionExercise[],
  currentExIdx: number,
  currentSetIdx: number
): { exerciseIndex: number; setIndex: number } {
  // Try next set in current exercise
  const currentExercise = exercises[currentExIdx];
  if (currentExercise) {
    for (let s = currentSetIdx + 1; s < currentExercise.sets.length; s++) {
      if (!currentExercise.sets[s].isCompleted) {
        return { exerciseIndex: currentExIdx, setIndex: s };
      }
    }
  }
  // Try next exercises
  for (let e = currentExIdx + 1; e < exercises.length; e++) {
    for (let s = 0; s < exercises[e].sets.length; s++) {
      if (!exercises[e].sets[s].isCompleted) {
        return { exerciseIndex: e, setIndex: s };
      }
    }
  }
  // No more incomplete sets, stay at current
  return { exerciseIndex: currentExIdx, setIndex: currentSetIdx };
}

// ─── Reducer ───────────────────────────────────────────────────────────

function sessionReducer(
  state: ActiveSession | null,
  action: SessionAction
): ActiveSession | null {
  switch (action.type) {
    case "START_WORKOUT":
      return configToSession(action.payload);

    case "REHYDRATE":
      return action.session;

    case "DISCARD":
      return null;

    case "SET_STATUS":
      if (!state) return null;
      return { ...state, status: action.status };

    case "UPDATE_WORKOUT_NAME":
      if (!state) return null;
      return { ...state, workoutName: action.name };

    case "UPDATE_NOTES":
      // Store notes at session level (used in finish summary)
      if (!state) return null;
      return state;

    case "TICK_ELAPSED":
      if (!state) return null;
      return { ...state, elapsedSeconds: state.elapsedSeconds + 1 };

    case "UPDATE_SET": {
      if (!state) return null;
      const exercises = [...state.exercises];
      const exercise = { ...exercises[action.exerciseIndex] };
      const sets = [...exercise.sets];
      sets[action.setIndex] = { ...sets[action.setIndex], ...action.data };
      exercise.sets = sets;
      exercises[action.exerciseIndex] = exercise;
      return { ...state, exercises };
    }

    case "COMPLETE_SET": {
      if (!state) return null;
      const exercises = [...state.exercises];
      const exercise = { ...exercises[action.exerciseIndex] };
      const sets = [...exercise.sets];
      const set = { ...sets[action.setIndex] };

      set.isCompleted = true;
      set.completedAt = new Date().toISOString();
      sets[action.setIndex] = set;
      exercise.sets = sets;
      exercises[action.exerciseIndex] = exercise;

      // Auto-advance to next incomplete set
      const next = findNextIncompleteSet(
        exercises,
        action.exerciseIndex,
        action.setIndex
      );

      // Check if this is the last set of the last exercise
      const allCompleted = exercises.every((ex) =>
        ex.sets.every((s) => s.isCompleted)
      );

      // Start rest timer if not all done
      const restTimer =
        !allCompleted && exercise.restTime > 0
          ? {
              isRunning: true,
              totalSeconds: exercise.restTime,
              remainingSeconds: exercise.restTime,
              startedAt: new Date().toISOString(),
              exerciseIndex: action.exerciseIndex,
              setIndex: action.setIndex,
            }
          : null;

      return {
        ...state,
        exercises,
        currentExerciseIndex: next.exerciseIndex,
        currentSetIndex: next.setIndex,
        status: restTimer ? "resting" : "active",
        restTimer,
      };
    }

    case "ADD_SET": {
      if (!state) return null;
      const exercises = [...state.exercises];
      const exercise = { ...exercises[action.exerciseIndex] };
      const lastSet = exercise.sets[exercise.sets.length - 1];
      exercise.sets = [
        ...exercise.sets,
        {
          setNumber: exercise.sets.length + 1,
          targetReps: lastSet?.targetReps ?? 10,
          targetWeight: lastSet?.targetWeight ?? 0,
          actualReps: lastSet?.actualReps ?? 10,
          actualWeight: lastSet?.actualWeight ?? 0,
          weightUnit: lastSet?.weightUnit ?? "kg",
          isCompleted: false,
          completedAt: null,
        },
      ];
      exercises[action.exerciseIndex] = exercise;
      return { ...state, exercises };
    }

    case "REMOVE_SET": {
      if (!state) return null;
      const exercises = [...state.exercises];
      const exercise = { ...exercises[action.exerciseIndex] };
      if (exercise.sets.length <= 1) return state;
      exercise.sets = exercise.sets.filter((_, i) => i !== action.setIndex);
      // Renumber
      exercise.sets = exercise.sets.map((s, i) => ({
        ...s,
        setNumber: i + 1,
      }));
      exercises[action.exerciseIndex] = exercise;
      return { ...state, exercises };
    }

    case "ADD_EXERCISE": {
      if (!state) return null;
      const newExercise: ActiveSessionExercise = {
        id: generateId(),
        name: action.name,
        sets: [
          {
            setNumber: 1,
            targetReps: 10,
            targetWeight: 0,
            actualReps: 10,
            actualWeight: 0,
            weightUnit: "kg",
            isCompleted: false,
            completedAt: null,
          },
        ],
        restTime: DEFAULT_REST_TIME,
        notes: "",
      };
      return { ...state, exercises: [...state.exercises, newExercise] };
    }

    case "REMOVE_EXERCISE": {
      if (!state) return null;
      if (state.exercises.length <= 1) return state;
      const exercises = state.exercises.filter(
        (_, i) => i !== action.exerciseIndex
      );
      const currentExerciseIndex = Math.min(
        state.currentExerciseIndex,
        exercises.length - 1
      );
      return { ...state, exercises, currentExerciseIndex };
    }

    case "SET_LAST_WORKOUT_DATA": {
      if (!state) return null;
      const exercises = [...state.exercises];
      exercises[action.exerciseIndex] = {
        ...exercises[action.exerciseIndex],
        lastWorkoutData: action.data,
      };
      return { ...state, exercises };
    }

    case "BULK_SET_LAST_WORKOUT_DATA": {
      if (!state) return null;
      const exercises = state.exercises.map((ex) => {
        const data = action.data[ex.name];
        if (data) {
          return { ...ex, lastWorkoutData: data };
        }
        return ex;
      });
      return { ...state, exercises };
    }

    case "START_REST": {
      if (!state) return null;
      return {
        ...state,
        status: "resting",
        restTimer: {
          isRunning: true,
          totalSeconds: action.totalSeconds,
          remainingSeconds: action.totalSeconds,
          startedAt: new Date().toISOString(),
          exerciseIndex: action.exerciseIndex,
          setIndex: action.setIndex,
        },
      };
    }

    case "TICK_REST": {
      if (!state || !state.restTimer) return state;
      const elapsed = Math.floor(
        (Date.now() - new Date(state.restTimer.startedAt).getTime()) / 1000
      );
      const remaining = Math.max(
        0,
        state.restTimer.totalSeconds - elapsed
      );
      if (remaining <= 0) {
        return {
          ...state,
          status: "active",
          restTimer: null,
        };
      }
      return {
        ...state,
        restTimer: { ...state.restTimer, remainingSeconds: remaining },
      };
    }

    case "SKIP_REST":
      if (!state) return null;
      return { ...state, status: "active", restTimer: null };

    case "EXTEND_REST": {
      if (!state || !state.restTimer) return state;
      return {
        ...state,
        restTimer: {
          ...state.restTimer,
          totalSeconds: state.restTimer.totalSeconds + action.seconds,
          // Push startedAt back by the extension amount to keep elapsed calculation correct
          startedAt: new Date(
            new Date(state.restTimer.startedAt).getTime() -
              action.seconds * 1000
          ).toISOString(),
        },
      };
    }

    default:
      return state;
  }
}

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
  addSet: (exerciseIndex: number) => void;
  removeSet: (exerciseIndex: number, setIndex: number) => void;

  // Exercise operations
  addExercise: (name: string) => void;
  removeExercise: (exerciseIndex: number) => void;

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

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ActiveSession;
        dispatch({ type: "REHYDRATE", session: parsed });
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Persist to localStorage on every state change
  useEffect(() => {
    if (!hasRehydrated.current) return;
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
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
      // Rest just ended (transitioned from resting -> active with null timer)
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

      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save workout");
      }

      const data = await res.json();
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

  const addSet = useCallback((exerciseIndex: number) => {
    dispatch({ type: "ADD_SET", exerciseIndex });
  }, []);

  const removeSet = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      dispatch({ type: "REMOVE_SET", exerciseIndex, setIndex });
    },
    []
  );

  const addExercise = useCallback((name: string) => {
    dispatch({ type: "ADD_EXERCISE", name });
  }, []);

  const removeExercise = useCallback((exerciseIndex: number) => {
    dispatch({ type: "REMOVE_EXERCISE", exerciseIndex });
  }, []);

  const skipRest = useCallback(() => {
    dispatch({ type: "SKIP_REST" });
  }, []);

  const extendRest = useCallback((seconds: number) => {
    dispatch({ type: "EXTEND_REST", seconds });
  }, []);

  const incrementReps = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      if (!session) return;
      const current =
        session.exercises[exerciseIndex]?.sets[setIndex]?.actualReps ?? 0;
      dispatch({
        type: "UPDATE_SET",
        exerciseIndex,
        setIndex,
        data: { actualReps: current + 1 },
      });
    },
    [session]
  );

  const decrementReps = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      if (!session) return;
      const current =
        session.exercises[exerciseIndex]?.sets[setIndex]?.actualReps ?? 0;
      dispatch({
        type: "UPDATE_SET",
        exerciseIndex,
        setIndex,
        data: { actualReps: Math.max(0, current - 1) },
      });
    },
    [session]
  );

  const incrementWeight = useCallback(
    (exerciseIndex: number, setIndex: number, step = 2.5) => {
      if (!session) return;
      const current =
        session.exercises[exerciseIndex]?.sets[setIndex]?.actualWeight ?? 0;
      dispatch({
        type: "UPDATE_SET",
        exerciseIndex,
        setIndex,
        data: { actualWeight: current + step },
      });
    },
    [session]
  );

  const decrementWeight = useCallback(
    (exerciseIndex: number, setIndex: number, step = 2.5) => {
      if (!session) return;
      const current =
        session.exercises[exerciseIndex]?.sets[setIndex]?.actualWeight ?? 0;
      dispatch({
        type: "UPDATE_SET",
        exerciseIndex,
        setIndex,
        data: { actualWeight: Math.max(0, current - step) },
      });
    },
    [session]
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
    addSet,
    removeSet,
    addExercise,
    removeExercise,
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
