"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActiveSession } from "@/contexts/active-session-context";
import { ExerciseCardActive } from "./exercise-card-active";
import { RestTimerInline } from "./rest-timer-inline";
import { WorkoutTimer } from "./workout-timer";
import { FinishWorkoutSummary } from "./finish-workout-summary";
import { DiscardWorkoutDialog } from "./discard-workout-dialog";
import { ExerciseCombobox } from "@/components/ui/exercise-combobox";

export function ActiveWorkoutPage() {
  const router = useRouter();
  const {
    session,
    isActive,
    finishWorkout,
    discardWorkout,
    addExercise,
  } = useActiveSession();

  const [showDiscard, setShowDiscard] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const exerciseListRef = useRef<HTMLDivElement>(null);

  // Redirect if no session
  useEffect(() => {
    if (!isActive && !session) {
      router.replace("/dashboard");
    }
  }, [isActive, session, router]);

  // Warn on page close
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

  // Show finish summary when in "finishing" state
  if (session.status === "finishing" || session.status === "saving") {
    return <FinishWorkoutSummary />;
  }

  const handleAddExercise = () => {
    if (newExerciseName) {
      addExercise(newExerciseName);
      setNewExerciseName("");
      setShowAddExercise(false);
    }
  };

  const handleDiscard = () => {
    discardWorkout();
    router.replace("/dashboard");
  };

  const completedSets = session.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.isCompleted).length,
    0
  );
  const totalSets = session.exercises.reduce(
    (acc, ex) => acc + ex.sets.length,
    0
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-destructive"
              onClick={() => setShowDiscard(true)}
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-base font-semibold truncate">
                {session.workoutName}
              </h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <WorkoutTimer />
                <span>
                  {completedSets}/{totalSets} sets
                </span>
              </div>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={finishWorkout}
          >
            <Flag className="h-4 w-4 mr-2" />
            Finish
          </Button>
        </div>
      </div>

      {/* Rest timer */}
      <div className="px-4 pt-3">
        <RestTimerInline />
      </div>

      {/* Exercise list */}
      <div ref={exerciseListRef} className="flex-1 p-4 space-y-4">
        {session.exercises.map((exercise, exerciseIndex) => (
          <ExerciseCardActive
            key={exercise.id}
            exerciseIndex={exerciseIndex}
            exercise={exercise}
            isCurrentExercise={
              exerciseIndex === session.currentExerciseIndex
            }
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
            className="w-full border-dashed"
            onClick={() => setShowAddExercise(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Exercise
          </Button>
        )}
      </div>

      {/* Discard dialog */}
      <DiscardWorkoutDialog
        open={showDiscard}
        onOpenChange={setShowDiscard}
        onConfirm={handleDiscard}
      />
    </div>
  );
}
