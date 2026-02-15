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
  // Haptic feedback on complete (mobile only)
  const handleComplete = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(50); // Short haptic buzz
    }
    onComplete();
  };

  const handleUncomplete = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(30); // Lighter buzz
    }
    onUncomplete();
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 sm:gap-3 py-4 px-3 sm:px-4 rounded-lg transition-all duration-200",
        set.isCompleted
          ? "bg-success/10 border border-success/20 dark:bg-success/15"
          : "bg-muted/30 border border-transparent"
      )}
      role="group"
      aria-label={`Set ${setIndex + 1}${set.isCompleted ? " - completed" : ""}`}
    >
      {/* Set number with visual indicator */}
      <div className="w-8 text-center shrink-0">
        <span
          className={cn(
            "text-sm font-bold",
            set.isCompleted ? "text-success" : "text-muted-foreground"
          )}
        >
          {setIndex + 1}
        </span>
        {set.isCompleted && (
          <span className="sr-only">Completed</span>
        )}
      </div>

      {/* Reps stepper - Touch-friendly 44px buttons */}
      <div className="flex-1 flex flex-col items-center min-w-0">
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">
          Reps
        </span>
        <div
          className="flex items-center gap-1"
          role="group"
          aria-label="Reps"
        >
          <button
            type="button"
            className="h-11 w-11 rounded-full border-2 border-input flex items-center justify-center text-base font-bold touch-target-lg transition-all active:scale-95 active:bg-muted hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={onDecrementReps}
            aria-label="Decrease reps"
          >
            −
          </button>
          <span
            className="text-xl font-bold tabular-nums min-w-[2.5ch] text-center"
            aria-live="polite"
          >
            {set.actualReps}
          </span>
          <button
            type="button"
            className="h-11 w-11 rounded-full border-2 border-input flex items-center justify-center text-base font-bold touch-target-lg transition-all active:scale-95 active:bg-muted hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={onIncrementReps}
            aria-label="Increase reps"
          >
            +
          </button>
        </div>
        {lastWorkoutSet && !set.isCompleted && (
          <span className="text-[10px] text-muted-foreground mt-1">
            prev: {lastWorkoutSet.reps}
          </span>
        )}
      </div>

      {/* Weight stepper - Touch-friendly 44px buttons */}
      <div className="flex-1 flex flex-col items-center min-w-0">
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">
          {set.weightUnit}
        </span>
        <div
          className="flex items-center gap-1"
          role="group"
          aria-label={`Weight in ${set.weightUnit}`}
        >
          <button
            type="button"
            className="h-11 w-11 rounded-full border-2 border-input flex items-center justify-center text-base font-bold touch-target-lg transition-all active:scale-95 active:bg-muted hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={onDecrementWeight}
            aria-label="Decrease weight"
          >
            −
          </button>
          <span
            className="text-xl font-bold tabular-nums min-w-[3.5ch] text-center"
            aria-live="polite"
          >
            {set.actualWeight % 1 === 0
              ? set.actualWeight
              : set.actualWeight.toFixed(1)}
          </span>
          <button
            type="button"
            className="h-11 w-11 rounded-full border-2 border-input flex items-center justify-center text-base font-bold touch-target-lg transition-all active:scale-95 active:bg-muted hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={onIncrementWeight}
            aria-label="Increase weight"
          >
            +
          </button>
        </div>
        {lastWorkoutSet && !set.isCompleted && (
          <span className="text-[10px] text-muted-foreground mt-1">
            prev: {lastWorkoutSet.weight}{lastWorkoutSet.weightUnit}
          </span>
        )}
      </div>

      {/* Complete/Uncomplete button - Enhanced with icon + text for colorblind users */}
      <Button
        type="button"
        variant={set.isCompleted ? "default" : "outline"}
        size="icon-lg"
        className={cn(
          "rounded-full shrink-0 transition-all",
          set.isCompleted && "bg-success hover:bg-success/90 text-success-foreground border-success"
        )}
        onClick={set.isCompleted ? handleUncomplete : handleComplete}
        aria-label={set.isCompleted ? "Mark as incomplete" : "Mark as complete"}
        aria-pressed={set.isCompleted}
      >
        <Check
          className={cn(
            "h-5 w-5 transition-transform",
            set.isCompleted && "scale-110"
          )}
        />
        <span className="sr-only">
          {set.isCompleted ? "Completed" : "Not completed"}
        </span>
      </Button>
    </div>
  );
}
