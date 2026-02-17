"use client";

import Link from "next/link";
import { format } from "date-fns";
import { MoreVertical, Edit, Trash2, Eye, Dumbbell, Flame } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useDeleteWorkout } from "@/hooks/use-workouts";
import { WORKOUT_TYPES } from "@/lib/constants/workout-types";

interface Exercise {
  name: string;
  sets: Array<{
    reps: number;
    weight: number;
    weightUnit: string;
  }>;
}

interface WorkoutCardProps {
  workout: {
    _id: string;
    workoutName: string;
    type: string;
    date: string;
    exercises: Exercise[];
    duration?: number;
    estimatedCalories?: number;
  };
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteWorkout = useDeleteWorkout();

  const typeLabel =
    WORKOUT_TYPES.find((t) => t.value === workout.type)?.label || workout.type;

  const totalSets = workout.exercises.reduce(
    (acc, ex) => acc + ex.sets.length,
    0
  );

  const handleDelete = async () => {
    await deleteWorkout.mutateAsync(workout._id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-lg">{workout.workoutName}</CardTitle>
            <CardDescription>
              {format(new Date(workout.date), "EEEE, MMMM d, yyyy")}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/workouts/${workout._id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/workouts/${workout._id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary">{typeLabel}</Badge>
            {workout.duration && (
              <Badge variant="outline">{workout.duration} min</Badge>
            )}
            {workout.estimatedCalories != null && workout.estimatedCalories > 0 && (
              <Badge variant="outline" className="gap-1">
                <Flame className="h-3 w-3 text-orange-500" />
                {workout.estimatedCalories} kcal
              </Badge>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Dumbbell className="h-4 w-4" />
              <span>
                {workout.exercises.length} exercise
                {workout.exercises.length !== 1 ? "s" : ""}, {totalSets} set
                {totalSets !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="text-sm">
              {workout.exercises.slice(0, 3).map((ex, idx) => (
                <span key={idx} className="text-muted-foreground">
                  {ex.name}
                  {idx < Math.min(workout.exercises.length, 3) - 1 && ", "}
                </span>
              ))}
              {workout.exercises.length > 3 && (
                <span className="text-muted-foreground">
                  {" "}
                  +{workout.exercises.length - 3} more
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workout</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{workout.workoutName}&quot;? This
              action cannot be undone.
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
    </>
  );
}
