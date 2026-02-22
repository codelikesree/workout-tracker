"use client";

import Link from "next/link";
import { format, isToday, isYesterday } from "date-fns";
import { MoreVertical, Edit, Trash2, Eye, Clock, Dumbbell, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";

const TYPE_STYLES: Record<string, string> = {
  strength: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  cardio: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  hiit: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  flexibility: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  sports: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  other: "bg-muted text-muted-foreground",
};

function formatWorkoutDate(dateStr: string) {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d, yyyy");
}

interface Exercise {
  name: string;
  sets: Array<{ reps: number; weight: number; weightUnit: string }>;
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
  const typeStyle = TYPE_STYLES[workout.type] ?? TYPE_STYLES.other;
  const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  const handleDelete = async () => {
    await deleteWorkout.mutateAsync(workout._id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="group relative hover:shadow-md transition-all duration-200 overflow-hidden">
        {/* Main clickable body — links to detail view */}
        <Link href={`/workouts/${workout._id}`} className="block p-4 pr-10">
          <p className="text-xs text-muted-foreground mb-1">
            {formatWorkoutDate(workout.date)}
          </p>
          <h3 className="font-semibold text-base leading-snug truncate mb-3">
            {workout.workoutName}
          </h3>

          {/* Metrics row */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span
              className={cn("text-xs font-medium px-2 py-0.5 rounded-full", typeStyle)}
            >
              {typeLabel}
            </span>
            {workout.duration ? (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {workout.duration}m
              </span>
            ) : null}
            {(workout.estimatedCalories ?? 0) > 0 ? (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Flame className="h-3 w-3 text-orange-400" />
                {workout.estimatedCalories} kcal
              </span>
            ) : null}
          </div>

          {/* Exercise summary */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Dumbbell className="h-3 w-3 shrink-0" />
              <span>
                {workout.exercises.length} exercise
                {workout.exercises.length !== 1 ? "s" : ""} · {totalSets} set
                {totalSets !== 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-xs text-muted-foreground/80 truncate">
              {workout.exercises.slice(0, 4).map((ex) => ex.name).join(", ")}
              {workout.exercises.length > 4 &&
                ` +${workout.exercises.length - 4} more`}
            </p>
          </div>
        </Link>

        {/* Floating action menu — outside the Link, no event conflicts */}
        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-3.5 w-3.5" />
                <span className="sr-only">Actions</span>
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
                className="text-destructive focus:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

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
    </>
  );
}
