import { type WorkoutType } from "@/lib/db/models/workout-log";

export type SessionStatus = "active" | "resting" | "finishing" | "saving";

export interface ActiveSessionSet {
  setNumber: number;
  targetReps: number;
  targetWeight: number;
  actualReps: number;
  actualWeight: number;
  weightUnit: "kg" | "lbs";
  isCompleted: boolean;
  completedAt: string | null;
}

export interface LastWorkoutData {
  sets: Array<{ reps: number; weight: number; weightUnit: string }>;
  date: string;
}

export interface ActiveSessionExercise {
  id: string;
  name: string;
  sets: ActiveSessionSet[];
  restTime: number; // seconds
  notes: string;
  lastWorkoutData?: LastWorkoutData;
}

export interface RestTimer {
  isRunning: boolean;
  totalSeconds: number;
  remainingSeconds: number;
  startedAt: string; // ISO timestamp for drift-free countdown
  exerciseIndex: number;
  setIndex: number;
}

export interface ActiveSession {
  status: SessionStatus;
  workoutName: string;
  type: WorkoutType;
  templateId: string | null;
  startedAt: string; // ISO timestamp
  exercises: ActiveSessionExercise[];
  elapsedSeconds: number;
  restTimer: RestTimer | null;
  currentExerciseIndex: number;
  currentSetIndex: number;
}

export interface StartWorkoutConfig {
  workoutName: string;
  type: WorkoutType;
  templateId?: string;
  exercises: Array<{
    name: string;
    sets: Array<{
      targetReps: number;
      targetWeight: number;
      weightUnit: "kg" | "lbs";
    }>;
    restTime?: number;
  }>;
}
