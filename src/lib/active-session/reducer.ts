import type {
  ActiveSession,
  ActiveSessionExercise,
  ActiveSessionSet,
  StartWorkoutConfig,
  LastWorkoutData,
  SessionStatus,
} from "@/lib/types/active-session";
import {
  DEFAULT_REST_TIME_SECONDS,
  DEFAULT_WEIGHT_STEP,
} from "@/lib/constants/workout-types";

const DEFAULT_REST_TIME = DEFAULT_REST_TIME_SECONDS;

export { DEFAULT_REST_TIME, DEFAULT_WEIGHT_STEP };

// ─── Actions ───────────────────────────────────────────────────────────

export type SessionAction =
  | { type: "START_WORKOUT"; payload: StartWorkoutConfig }
  | {
      type: "UPDATE_SET";
      exerciseIndex: number;
      setIndex: number;
      data: Partial<ActiveSessionSet>;
    }
  | { type: "COMPLETE_SET"; exerciseIndex: number; setIndex: number }
  | { type: "UNCOMPLETE_SET"; exerciseIndex: number; setIndex: number }
  | { type: "INCREMENT_REPS"; exerciseIndex: number; setIndex: number }
  | { type: "DECREMENT_REPS"; exerciseIndex: number; setIndex: number }
  | {
      type: "INCREMENT_WEIGHT";
      exerciseIndex: number;
      setIndex: number;
      step: number;
    }
  | {
      type: "DECREMENT_WEIGHT";
      exerciseIndex: number;
      setIndex: number;
      step: number;
    }
  | { type: "ADD_SET"; exerciseIndex: number }
  | { type: "REMOVE_SET"; exerciseIndex: number; setIndex: number }
  | { type: "ADD_EXERCISE"; name: string }
  | { type: "REMOVE_EXERCISE"; exerciseIndex: number }
  | {
      type: "SET_LAST_WORKOUT_DATA";
      exerciseIndex: number;
      data: LastWorkoutData;
    }
  | {
      type: "BULK_SET_LAST_WORKOUT_DATA";
      data: Record<string, LastWorkoutData>;
    }
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
  const currentExercise = exercises[currentExIdx];
  if (currentExercise) {
    for (let s = currentSetIdx + 1; s < currentExercise.sets.length; s++) {
      if (!currentExercise.sets[s].isCompleted) {
        return { exerciseIndex: currentExIdx, setIndex: s };
      }
    }
  }
  for (let e = currentExIdx + 1; e < exercises.length; e++) {
    for (let s = 0; s < exercises[e].sets.length; s++) {
      if (!exercises[e].sets[s].isCompleted) {
        return { exerciseIndex: e, setIndex: s };
      }
    }
  }
  return { exerciseIndex: currentExIdx, setIndex: currentSetIdx };
}

function updateSetField(
  state: ActiveSession,
  exerciseIndex: number,
  setIndex: number,
  data: Partial<ActiveSessionSet>
): ActiveSession {
  const exercises = [...state.exercises];
  const exercise = { ...exercises[exerciseIndex] };
  const sets = [...exercise.sets];
  sets[setIndex] = { ...sets[setIndex], ...data };
  exercise.sets = sets;
  exercises[exerciseIndex] = exercise;
  return { ...state, exercises };
}

// ─── Reducer ───────────────────────────────────────────────────────────

export function sessionReducer(
  state: ActiveSession | null,
  action: SessionAction
): ActiveSession | null {
  switch (action.type) {
    case "START_WORKOUT":
      return configToSession(action.payload);

    case "REHYDRATE": {
      const rehydrated = { ...action.session };
      if (rehydrated.startedAt) {
        rehydrated.elapsedSeconds = Math.floor(
          (Date.now() - new Date(rehydrated.startedAt).getTime()) / 1000
        );
      }
      return rehydrated;
    }

    case "DISCARD":
      return null;

    case "SET_STATUS":
      if (!state) return null;
      return { ...state, status: action.status };

    case "UPDATE_WORKOUT_NAME":
      if (!state) return null;
      return { ...state, workoutName: action.name };

    case "TICK_ELAPSED":
      if (!state) return null;
      return {
        ...state,
        elapsedSeconds: Math.floor(
          (Date.now() - new Date(state.startedAt).getTime()) / 1000
        ),
      };

    case "UPDATE_SET": {
      if (!state) return null;
      return updateSetField(
        state,
        action.exerciseIndex,
        action.setIndex,
        action.data
      );
    }

    case "INCREMENT_REPS": {
      if (!state) return null;
      const current =
        state.exercises[action.exerciseIndex]?.sets[action.setIndex]
          ?.actualReps ?? 0;
      return updateSetField(state, action.exerciseIndex, action.setIndex, {
        actualReps: current + 1,
      });
    }

    case "DECREMENT_REPS": {
      if (!state) return null;
      const current =
        state.exercises[action.exerciseIndex]?.sets[action.setIndex]
          ?.actualReps ?? 0;
      return updateSetField(state, action.exerciseIndex, action.setIndex, {
        actualReps: Math.max(0, current - 1),
      });
    }

    case "INCREMENT_WEIGHT": {
      if (!state) return null;
      const current =
        state.exercises[action.exerciseIndex]?.sets[action.setIndex]
          ?.actualWeight ?? 0;
      return updateSetField(state, action.exerciseIndex, action.setIndex, {
        actualWeight: current + action.step,
      });
    }

    case "DECREMENT_WEIGHT": {
      if (!state) return null;
      const current =
        state.exercises[action.exerciseIndex]?.sets[action.setIndex]
          ?.actualWeight ?? 0;
      return updateSetField(state, action.exerciseIndex, action.setIndex, {
        actualWeight: Math.max(0, current - action.step),
      });
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

      const next = findNextIncompleteSet(
        exercises,
        action.exerciseIndex,
        action.setIndex
      );

      const allCompleted = exercises.every((ex) =>
        ex.sets.every((s) => s.isCompleted)
      );

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

    case "UNCOMPLETE_SET": {
      if (!state) return null;
      return updateSetField(state, action.exerciseIndex, action.setIndex, {
        isCompleted: false,
        completedAt: null,
      });
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
      exercise.sets = exercise.sets
        .filter((_, i) => i !== action.setIndex)
        .map((s, i) => ({ ...s, setNumber: i + 1 }));
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
      const remaining = Math.max(0, state.restTimer.totalSeconds - elapsed);
      if (remaining <= 0) {
        return { ...state, status: "active", restTimer: null };
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
