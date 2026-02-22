"use client";

import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ConnectedSetRow } from "./set-row";
import { cn } from "@/lib/utils";
import { useActiveSession } from "@/contexts/active-session-context";
import type { ActiveSessionExercise } from "@/lib/types/active-session";
import { ExerciseCombobox } from "@/components/ui/exercise-combobox";
import { fetchAPI } from "@/lib/api/client";
import type { LastStatsResponse } from "@/lib/types/api";

interface ExerciseCardActiveProps {
  exerciseIndex: number;
  exercise: ActiveSessionExercise;
  isCurrentExercise: boolean;
  canRemove: boolean;
}

export function ExerciseCardActive({
  exerciseIndex,
  exercise,
  isCurrentExercise,
  canRemove,
}: ExerciseCardActiveProps) {
  const { status: authStatus } = useSession();
  const {
    completeSet,
    uncompleteSet,
    addSet,
    removeExercise,
    updateExerciseName,
    incrementReps,
    decrementReps,
    incrementWeight,
    decrementWeight,
  } = useActiveSession();

  const [collapsed, setCollapsed] = useState(false);

  const completedSets = exercise.sets.filter((s) => s.isCompleted).length;
  const totalSets = exercise.sets.length;
  const allCompleted = completedSets === totalSets;
  const needsName = !exercise.name || exercise.name.trim() === "";

  const handleExerciseNameChange = async (name: string) => {
    // Try to fetch last workout stats for this exercise
    let sets: Array<{ reps: number; weight: number; weightUnit: "kg" | "lbs" }> | undefined;

    if (authStatus === "authenticated") {
      try {
        const params = new URLSearchParams({
          exercises: name,
        });
        const data = await fetchAPI<LastStatsResponse>(
          `/api/workouts/last-stats?${params}`
        );

        if (data.stats[name]) {
          sets = data.stats[name].sets.map(s => ({
            reps: s.reps,
            weight: s.weight,
            weightUnit: s.weightUnit as "kg" | "lbs",
          }));
        }
      } catch {
        // Non-critical, continue without last workout data
      }
    }

    updateExerciseName(exerciseIndex, name, sets);
  };

  return (
    <div
      className={cn(
        "rounded-xl border transition-all duration-200",
        isCurrentExercise
          ? "border-primary/50 shadow-sm bg-card"
          : allCompleted
          ? "border-success/30 bg-success/5"
          : "border-border bg-card"
      )}
    >
      {/* Header */}
      {needsName ? (
        <div className="px-4 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base text-muted-foreground">
              Select Exercise
            </h3>
            {canRemove && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => removeExercise(exerciseIndex)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <ExerciseCombobox
            value={exercise.name}
            onChange={handleExerciseNameChange}
            placeholder="Select exercise..."
          />
        </div>
      ) : (
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3 touch-manipulation"
          onClick={() => setCollapsed(!collapsed)}
        >
          <div className="flex items-center gap-3 min-w-0">
            <h3 className="font-semibold text-base truncate">{exercise.name}</h3>
            <span
              className={cn(
                "shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full",
                allCompleted
                  ? "bg-success/15 text-success"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {completedSets}/{totalSets}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {canRemove && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  removeExercise(exerciseIndex);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            {collapsed ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>
      )}

      {/* Sets */}
      {!needsName && !collapsed && (
        <div className="px-3 pb-3 space-y-2">
          {exercise.sets.map((set, setIndex) => {
            const lastSet = exercise.lastWorkoutData?.sets[setIndex];
            return (
              <ConnectedSetRow
                key={setIndex}
                exerciseIndex={exerciseIndex}
                setIndex={setIndex}
                set={set}
                lastWorkoutSet={lastSet}
                onComplete={() => completeSet(exerciseIndex, setIndex)}
                onUncomplete={() => uncompleteSet(exerciseIndex, setIndex)}
                onIncrementReps={() => incrementReps(exerciseIndex, setIndex)}
                onDecrementReps={() => decrementReps(exerciseIndex, setIndex)}
                onIncrementWeight={() =>
                  incrementWeight(exerciseIndex, setIndex)
                }
                onDecrementWeight={() =>
                  decrementWeight(exerciseIndex, setIndex)
                }
              />
            );
          })}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full mt-1"
            onClick={() => addSet(exerciseIndex)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Set
          </Button>
        </div>
      )}
    </div>
  );
}
