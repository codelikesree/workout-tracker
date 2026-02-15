"use client";

import { useState, useEffect } from "react";
import { Plus, Dumbbell, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkoutCard } from "@/components/workouts/workout-card";
import { useWorkouts } from "@/hooks/use-workouts";
import { WORKOUT_TYPES } from "@/lib/constants/workout-types";
import { StartWorkoutSheet } from "@/components/workout/start-workout-sheet";

interface Exercise {
  name: string;
  sets: Array<{
    reps: number;
    weight: number;
    weightUnit: string;
  }>;
}

interface Workout {
  _id: string;
  workoutName: string;
  type: string;
  date: string;
  exercises: Exercise[];
  duration?: number;
}

export default function WorkoutsPage() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [showStartSheet, setShowStartSheet] = useState(false);
  const { data, isLoading } = useWorkouts({
    type: typeFilter === "all" ? undefined : typeFilter,
    page,
  });

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [typeFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workouts</h1>
          <p className="text-muted-foreground">
            View and manage your workout logs
          </p>
        </div>
        <Button onClick={() => setShowStartSheet(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Start Workout
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {WORKOUT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Workouts List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] rounded-lg" />
          ))}
        </div>
      ) : (data?.workouts?.length ?? 0) > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data!.workouts.map((workout: Workout) => (
            <WorkoutCard key={workout._id} workout={workout} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No workouts yet</h3>
          <p className="text-muted-foreground mb-4">
            Start tracking your fitness journey by logging your first workout.
          </p>
          <Button onClick={() => setShowStartSheet(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Start Your First Workout
          </Button>
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={data.pagination.page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={data.pagination.page === data.pagination.totalPages}
            onClick={() =>
              setPage((p) => Math.min(data.pagination.totalPages, p + 1))
            }
          >
            Next
          </Button>
        </div>
      )}

      <StartWorkoutSheet
        open={showStartSheet}
        onOpenChange={setShowStartSheet}
      />
    </div>
  );
}
