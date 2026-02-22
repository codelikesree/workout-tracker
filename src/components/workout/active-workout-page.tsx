"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus, X, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActiveSession } from "@/contexts/active-session-context";
import { DEFAULT_REST_TIME_SECONDS } from "@/lib/constants/workout-types";
import type { StartWorkoutConfig } from "@/lib/types/active-session";
import { ExerciseCardActive } from "./exercise-card-active";
import { RestTimerInline } from "./rest-timer-inline";
import { WorkoutTimer } from "./workout-timer";
import { FinishWorkoutSummary } from "./finish-workout-summary";
import { DiscardWorkoutDialog } from "./discard-workout-dialog";
import { ExerciseCombobox } from "@/components/ui/exercise-combobox";
import { fetchAPI } from "@/lib/api/client";
import type { LastStatsResponse } from "@/lib/types/api";

export function ActiveWorkoutPage() {
  const router = useRouter();
  const { status: authStatus } = useSession();
  const {
    session,
    isActive,
    startWorkout,
    finishWorkout,
    discardWorkout,
    addExercise,
  } = useActiveSession();

  const [showDiscard, setShowDiscard] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const exerciseListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authStatus === "loading") return;
    if (!isActive && !session) {
      if (authStatus === "authenticated") {
        router.replace("/dashboard");
      } else {
        const config: StartWorkoutConfig = {
          workoutName: "Workout",
          type: "strength",
          exercises: [
            {
              name: "",
              sets: [{ targetReps: 10, targetWeight: 0, weightUnit: "kg" }],
              restTime: DEFAULT_REST_TIME_SECONDS,
            },
          ],
        };
        startWorkout(config);
      }
    }
  }, [isActive, session, authStatus, router, startWorkout]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (session && session.status !== "saving") {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [session]);

  if (!session) return null;

  if (session.status === "finishing" || session.status === "saving") {
    return <FinishWorkoutSummary />;
  }

  const handleAddExercise = async () => {
    if (newExerciseName) {
      let sets: Array<{ reps: number; weight: number; weightUnit: "kg" | "lbs" }> | undefined;

      if (authStatus === "authenticated") {
        try {
          const params = new URLSearchParams({ exercises: newExerciseName });
          const data = await fetchAPI<LastStatsResponse>(
            `/api/workouts/last-stats?${params}`
          );
          if (data.stats[newExerciseName]) {
            sets = data.stats[newExerciseName].sets.map((s) => ({
              reps: s.reps,
              weight: s.weight,
              weightUnit: s.weightUnit as "kg" | "lbs",
            }));
          }
        } catch {
          // Non-critical
        }
      }

      addExercise(newExerciseName, sets);
      setNewExerciseName("");
      setShowAddExercise(false);
    }
  };

  const handleDiscard = () => {
    discardWorkout();
    router.replace(authStatus === "authenticated" ? "/dashboard" : "/");
  };

  const completedSets = session.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.isCompleted).length,
    0
  );
  const totalSets = session.exercises.reduce(
    (acc, ex) => acc + ex.sets.length,
    0
  );
  const progressPct = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="shrink-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => setShowDiscard(true)}
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold truncate leading-tight">
                {session.workoutName}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <WorkoutTimer />
                <span>·</span>
                <span>{completedSets}/{totalSets} sets</span>
              </div>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={finishWorkout}
            className="gap-1.5 shrink-0"
          >
            <Flag className="h-3.5 w-3.5" />
            Finish
          </Button>
        </div>
        {/* Thin progress bar */}
        <div className="h-0.5 w-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Rest timer */}
      <div className="shrink-0 px-4 pt-3">
        <RestTimerInline />
      </div>

      {/* Exercise list */}
      <div
        ref={exerciseListRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3"
        style={{
          WebkitOverflowScrolling: "touch",
          paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
        }}
      >
        {session.exercises.map((exercise, exerciseIndex) => (
          <ExerciseCardActive
            key={exercise.id}
            exerciseIndex={exerciseIndex}
            exercise={exercise}
            isCurrentExercise={exerciseIndex === session.currentExerciseIndex}
            canRemove={session.exercises.length > 1}
          />
        ))}

        {/* Add exercise */}
        {showAddExercise ? (
          <div className="rounded-xl border-2 border-dashed border-primary/30 p-4 space-y-3">
            <ExerciseCombobox
              value={newExerciseName}
              onChange={setNewExerciseName}
              placeholder="Search exercise..."
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setShowAddExercise(false);
                  setNewExerciseName("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="flex-1"
                onClick={handleAddExercise}
                disabled={!newExerciseName}
              >
                Add
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed h-11"
            onClick={() => setShowAddExercise(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Exercise
          </Button>
        )}
      </div>

      <DiscardWorkoutDialog
        open={showDiscard}
        onOpenChange={setShowDiscard}
        onConfirm={handleDiscard}
      />
    </div>
  );
}
