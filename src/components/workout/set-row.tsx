"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NumberStepper } from "./number-stepper";
import { cn } from "@/lib/utils";
import type { ActiveSessionSet } from "@/lib/types/active-session";

interface SetRowProps {
  setIndex: number;
  set: ActiveSessionSet;
  lastWorkoutSet?: { reps: number; weight: number; weightUnit: string };
  onComplete: () => void;
  onUncomplete: () => void;
  onIncrementReps: () => void;
  onDecrementReps: () => void;
  onIncrementWeight: () => void;
  onDecrementWeight: () => void;
}

export function SetRow({
  setIndex,
  set,
  lastWorkoutSet,
  onComplete,
  onUncomplete,
  onIncrementReps,
  onDecrementReps,
  onIncrementWeight,
  onDecrementWeight,
}: SetRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 py-3 px-3 rounded-lg transition-colors",
        set.isCompleted
          ? "bg-green-500/10 dark:bg-green-500/15"
          : "bg-muted/30"
      )}
    >
      {/* Set number */}
      <div className="w-8 text-center">
        <span className="text-sm font-bold text-muted-foreground">
          {setIndex + 1}
        </span>
      </div>

      {/* Reps */}
      <div className="flex-1 flex flex-col items-center">
        <NumberStepper
          value={set.actualReps}
          onChange={() => {}}
          step={1}
          min={0}
          label="Reps"
          size="sm"
        />
        {lastWorkoutSet && !set.isCompleted && (
          <span className="text-[10px] text-muted-foreground mt-0.5">
            prev: {lastWorkoutSet.reps}
          </span>
        )}
      </div>

      {/* Weight */}
      <div className="flex-1 flex flex-col items-center">
        <NumberStepper
          value={set.actualWeight}
          onChange={() => {}}
          step={2.5}
          min={0}
          decimal
          label={set.weightUnit}
          size="sm"
        />
        {lastWorkoutSet && !set.isCompleted && (
          <span className="text-[10px] text-muted-foreground mt-0.5">
            prev: {lastWorkoutSet.weight}
            {lastWorkoutSet.weightUnit}
          </span>
        )}
      </div>

      {/* Complete/Uncomplete button */}
      <Button
        type="button"
        variant={set.isCompleted ? "default" : "outline"}
        size="icon"
        className={cn(
          "h-10 w-10 rounded-full shrink-0 touch-manipulation",
          set.isCompleted && "bg-green-600 hover:bg-green-700 text-white"
        )}
        onClick={set.isCompleted ? onUncomplete : onComplete}
      >
        <Check className="h-5 w-5" />
      </Button>
    </div>
  );
}

// Wrapper that uses the context callbacks for actual increment/decrement
interface ConnectedSetRowProps {
  exerciseIndex: number;
  setIndex: number;
  set: ActiveSessionSet;
  lastWorkoutSet?: { reps: number; weight: number; weightUnit: string };
  onComplete: () => void;
  onUncomplete: () => void;
  onIncrementReps: () => void;
  onDecrementReps: () => void;
  onIncrementWeight: () => void;
  onDecrementWeight: () => void;
}

export function ConnectedSetRow({
  exerciseIndex,
  setIndex,
  set,
  lastWorkoutSet,
  onComplete,
  onUncomplete,
  onIncrementReps,
  onDecrementReps,
  onIncrementWeight,
  onDecrementWeight,
}: ConnectedSetRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 sm:gap-3 py-3 px-2 sm:px-3 rounded-lg transition-colors",
        set.isCompleted
          ? "bg-green-500/10 dark:bg-green-500/15"
          : "bg-muted/30"
      )}
    >
      {/* Set number */}
      <div className="w-7 text-center shrink-0">
        <span className="text-sm font-bold text-muted-foreground">
          {setIndex + 1}
        </span>
      </div>

      {/* Reps stepper */}
      <div className="flex-1 flex flex-col items-center min-w-0">
        <span className="text-[10px] text-muted-foreground font-medium mb-1">
          Reps
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="h-8 w-8 rounded-full border flex items-center justify-center text-sm font-bold touch-manipulation active:bg-muted"
            onClick={onDecrementReps}
          >
            -
          </button>
          <span className="text-lg font-bold tabular-nums min-w-[2.5ch] text-center">
            {set.actualReps}
          </span>
          <button
            type="button"
            className="h-8 w-8 rounded-full border flex items-center justify-center text-sm font-bold touch-manipulation active:bg-muted"
            onClick={onIncrementReps}
          >
            +
          </button>
        </div>
        {lastWorkoutSet && !set.isCompleted && (
          <span className="text-[10px] text-muted-foreground">
            prev: {lastWorkoutSet.reps}
          </span>
        )}
      </div>

      {/* Weight stepper */}
      <div className="flex-1 flex flex-col items-center min-w-0">
        <span className="text-[10px] text-muted-foreground font-medium mb-1">
          {set.weightUnit}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="h-8 w-8 rounded-full border flex items-center justify-center text-sm font-bold touch-manipulation active:bg-muted"
            onClick={onDecrementWeight}
          >
            -
          </button>
          <span className="text-lg font-bold tabular-nums min-w-[3.5ch] text-center">
            {set.actualWeight % 1 === 0
              ? set.actualWeight
              : set.actualWeight.toFixed(1)}
          </span>
          <button
            type="button"
            className="h-8 w-8 rounded-full border flex items-center justify-center text-sm font-bold touch-manipulation active:bg-muted"
            onClick={onIncrementWeight}
          >
            +
          </button>
        </div>
        {lastWorkoutSet && !set.isCompleted && (
          <span className="text-[10px] text-muted-foreground">
            prev: {lastWorkoutSet.weight}{lastWorkoutSet.weightUnit}
          </span>
        )}
      </div>

      {/* Complete/Uncomplete button */}
      <Button
        type="button"
        variant={set.isCompleted ? "default" : "outline"}
        size="icon"
        className={cn(
          "h-10 w-10 rounded-full shrink-0 touch-manipulation",
          set.isCompleted && "bg-green-600 hover:bg-green-700 text-white"
        )}
        onClick={set.isCompleted ? onUncomplete : onComplete}
      >
        <Check className="h-5 w-5" />
      </Button>
    </div>
  );
}
