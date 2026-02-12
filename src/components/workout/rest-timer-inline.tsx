"use client";

import { Timer, SkipForward, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActiveSession } from "@/contexts/active-session-context";

export function RestTimerInline() {
  const { session, skipRest, extendRest } = useActiveSession();

  if (!session?.restTimer || session.status !== "resting") return null;

  const { remainingSeconds, totalSeconds } = session.restTimer;
  const progress = 1 - remainingSeconds / totalSeconds;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary">Rest Timer</span>
        </div>
        <span className="text-3xl font-bold tabular-nums text-primary">
          {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={skipRest}
        >
          <SkipForward className="h-4 w-4 mr-2" />
          Skip
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => extendRest(30)}
        >
          <Plus className="h-4 w-4 mr-2" />
          30s
        </Button>
      </div>
    </div>
  );
}
