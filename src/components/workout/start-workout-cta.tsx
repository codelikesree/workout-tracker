"use client";

import { useRouter } from "next/navigation";
import { Dumbbell, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActiveSession } from "@/contexts/active-session-context";
import { DEFAULT_REST_TIME_SECONDS } from "@/lib/constants/workout-types";
import type { StartWorkoutConfig } from "@/lib/types/active-session";

export function StartWorkoutCTA() {
  const router = useRouter();
  const { session, startWorkout } = useActiveSession();

  if (session) {
    return (
      <Button
        size="lg"
        onClick={() => router.push("/workout/active")}
        className="gap-2"
      >
        <Play className="h-5 w-5" />
        Resume Workout
      </Button>
    );
  }

  const handleStart = () => {
    const config: StartWorkoutConfig = {
      workoutName: "Workout",
      type: "strength",
      exercises: [
        {
          name: "",
          sets: [{ targetReps: 10, targetWeight: 0, weightUnit: "kg" }],
          restTime: DEFAULT_REST_TIME_SECONDS,
        },
      ],
    };
    startWorkout(config);
    router.push("/workout/active");
  };

  return (
    <Button size="lg" onClick={handleStart} className="gap-2">
      <Dumbbell className="h-5 w-5" />
      Start a Workout
    </Button>
  );
}
