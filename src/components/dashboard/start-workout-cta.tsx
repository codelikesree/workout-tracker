"use client";

import { useState } from "react";
import { Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StartWorkoutSheet } from "@/components/workout/start-workout-sheet";

export function StartWorkoutCTA() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <Button
        size="lg"
        className="w-full h-16 text-lg font-semibold gap-3"
        onClick={() => setSheetOpen(true)}
      >
        <Dumbbell className="h-6 w-6" />
        Start Workout
      </Button>
      <StartWorkoutSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
