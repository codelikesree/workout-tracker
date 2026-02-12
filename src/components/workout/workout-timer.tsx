"use client";

import { Clock } from "lucide-react";
import { useActiveSession } from "@/contexts/active-session-context";

export function WorkoutTimer() {
  const { session } = useActiveSession();

  if (!session) return null;

  const totalSeconds = session.elapsedSeconds;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const display =
    hours > 0
      ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      : `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <Clock className="h-4 w-4" />
      <span className="text-sm font-mono tabular-nums">{display}</span>
    </div>
  );
}
