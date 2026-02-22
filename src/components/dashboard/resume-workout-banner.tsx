"use client";

import { useRouter } from "next/navigation";
import { Play, X, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActiveSession } from "@/contexts/active-session-context";

export function ResumeWorkoutBanner() {
  const router = useRouter();
  const { session, isActive, discardWorkout } = useActiveSession();

  if (!isActive || !session) return null;

  const completedSets = session.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.isCompleted).length,
    0
  );
  const totalSets = session.exercises.reduce(
    (acc, ex) => acc + ex.sets.length,
    0
  );
  const progressPct = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  const minutes = Math.floor(session.elapsedSeconds / 60);

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Timer className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{session.workoutName}</p>
            <p className="text-xs text-muted-foreground">
              {completedSets}/{totalSets} sets · {minutes}m elapsed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={discardWorkout}
            aria-label="Discard workout"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => router.push("/workout/active")}
          >
            <Play className="h-3.5 w-3.5" />
            Resume
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-primary/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}
