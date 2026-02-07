import { WorkoutForm } from "@/components/workouts/workout-form";

export default function NewWorkoutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Log Workout</h1>
        <p className="text-muted-foreground">
          Record your exercises, sets, reps, and weights.
        </p>
      </div>
      <WorkoutForm mode="create" />
    </div>
  );
}
