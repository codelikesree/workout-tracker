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
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Rest</span>
        </div>
        <span className="text-2xl font-bold tabular-nums text-primary">
          {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-primary/15 rounded-full overflow-hidden">
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
          className="flex-1 h-9"
          onClick={skipRest}
        >
          <SkipForward className="h-3.5 w-3.5 mr-1.5" />
          Skip
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 h-9"
          onClick={() => extendRest(30)}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          +30s
        </Button>
      </div>
    </div>
  );
}
