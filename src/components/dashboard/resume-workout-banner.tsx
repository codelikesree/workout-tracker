"use client";

import { useRouter } from "next/navigation";
import { Play, X } from "lucide-react";
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

  const minutes = Math.floor(session.elapsedSeconds / 60);

  return (
    <div className="rounded-xl bg-primary/10 border border-primary/30 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold truncate">{session.workoutName}</p>
          <p className="text-sm text-muted-foreground">
            {completedSets}/{totalSets} sets - {minutes} min elapsed
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive h-9 w-9"
            onClick={discardWorkout}
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            className="gap-2"
            onClick={() => router.push("/workout/active")}
          >
            <Play className="h-4 w-4" />
            Resume
          </Button>
        </div>
      </div>
    </div>
  );
}
