"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { StartWorkoutSheet } from "@/components/workout/start-workout-sheet";

export function StartWorkoutCTA() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="group relative w-full overflow-hidden rounded-2xl bg-primary px-6 py-5 text-primary-foreground transition-all duration-200 hover:brightness-105 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <Zap className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-lg font-semibold leading-tight">Start Workout</p>
            <p className="text-sm text-primary-foreground/70">
              Log a new session
            </p>
          </div>
        </div>
      </button>
      <StartWorkoutSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
