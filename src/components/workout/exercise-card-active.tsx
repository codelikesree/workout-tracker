"use client";

import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConnectedSetRow } from "./set-row";
import { cn } from "@/lib/utils";
import { useActiveSession } from "@/contexts/active-session-context";
import type { ActiveSessionExercise } from "@/lib/types/active-session";

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
  const {
    completeSet,
    addSet,
    removeExercise,
    incrementReps,
    decrementReps,
    incrementWeight,
    decrementWeight,
  } = useActiveSession();

  const [collapsed, setCollapsed] = useState(false);

  const completedSets = exercise.sets.filter((s) => s.isCompleted).length;
  const totalSets = exercise.sets.length;
  const allCompleted = completedSets === totalSets;

  return (
    <div
      className={cn(
        "rounded-xl border-2 transition-all",
        isCurrentExercise
          ? "border-primary shadow-sm"
          : allCompleted
          ? "border-green-500/30"
          : "border-border"
      )}
    >
      {/* Header */}
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 touch-manipulation"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <h3 className="font-semibold text-base truncate">{exercise.name}</h3>
          <Badge
            variant={allCompleted ? "default" : "secondary"}
            className={cn(
              "shrink-0",
              allCompleted && "bg-green-600 text-white"
            )}
          >
            {completedSets}/{totalSets}
          </Badge>
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

      {/* Sets */}
      {!collapsed && (
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
