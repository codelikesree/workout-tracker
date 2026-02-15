"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Edit, Trash2, Clock, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useWorkout, useDeleteWorkout } from "@/hooks/use-workouts";
import { WORKOUT_TYPES } from "@/lib/constants/workout-types";

interface ExerciseSet {
  setNumber: number;
  reps: number;
  weight: number;
  weightUnit: string;
}

interface Exercise {
  name: string;
  sets: ExerciseSet[];
}

export default function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading } = useWorkout(id);
  const deleteWorkout = useDeleteWorkout();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] rounded-lg" />
      </div>
    );
  }

  if (!data?.workout) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-muted-foreground">Workout not found</p>
        <Link href="/workouts">
          <Button className="mt-4">Back to Workouts</Button>
        </Link>
      </div>
    );
  }

  const workout = data.workout;
  const typeLabel =
    WORKOUT_TYPES.find((t) => t.value === workout.type)?.label || workout.type;

  const handleDelete = async () => {
    await deleteWorkout.mutateAsync(workout._id);
    router.push("/workouts");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/workouts">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Workouts
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link href={`/workouts/${workout._id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {workout.workoutName}
        </h1>
        <div className="flex items-center gap-4 mt-2 text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            {format(new Date(workout.date), "EEEE, MMMM d, yyyy")}
          </span>
          {workout.duration && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {workout.duration} minutes
            </span>
          )}
        </div>
        <div className="flex gap-2 mt-3">
          <Badge>{typeLabel}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exercises</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {workout.exercises.map((exercise: Exercise, idx: number) => (
            <div key={idx} className="border-b last:border-0 pb-4 last:pb-0">
              <h4 className="font-semibold mb-3">{exercise.name}</h4>
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground">
                  <div>Set</div>
                  <div>Reps</div>
                  <div>Weight</div>
                  <div>Unit</div>
                </div>
                {exercise.sets.map((set: ExerciseSet, setIdx: number) => (
                  <div
                    key={setIdx}
                    className="grid grid-cols-4 gap-4 text-sm py-1"
                  >
                    <div>{setIdx + 1}</div>
                    <div>{set.reps}</div>
                    <div>{set.weight}</div>
                    <div>{set.weightUnit}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {workout.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {workout.notes}
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workout</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{workout.workoutName}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteWorkout.isPending}
            >
              {deleteWorkout.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
