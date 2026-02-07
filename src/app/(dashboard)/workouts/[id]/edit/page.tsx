"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkoutForm } from "@/components/workouts/workout-form";
import { useWorkout } from "@/hooks/use-workouts";

export default function EditWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useWorkout(id);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px] rounded-lg" />
      </div>
    );
  }

  if (!data?.workout) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-muted-foreground">Workout not found</p>
        <Button asChild className="mt-4">
          <Link href="/workouts">Back to Workouts</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" asChild>
        <Link href={`/workouts/${id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Workout
        </Link>
      </Button>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Workout</h1>
        <p className="text-muted-foreground">
          Update your workout details and exercises.
        </p>
      </div>
      <WorkoutForm initialData={data.workout} mode="edit" />
    </div>
  );
}
