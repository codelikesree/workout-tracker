"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { PageHeader, EmptyState } from "@/components/shared";
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

function WorkoutsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showStartSheet, setShowStartSheet] = useState(false);

  const typeFilter = searchParams.get("type") ?? "all";
  const page = Number(searchParams.get("page") ?? "1");

  const { data, isLoading } = useWorkouts({
    type: typeFilter === "all" ? undefined : typeFilter,
    page,
  });

  const setTypeFilter = (type: string) => {
    const p = new URLSearchParams(searchParams.toString());
    type === "all" ? p.delete("type") : p.set("type", type);
    p.delete("page");
    router.replace(`?${p.toString()}`, { scroll: false });
  };

  const setPage = (next: number | ((prev: number) => number)) => {
    const newPage = typeof next === "function" ? next(page) : next;
    const p = new URLSearchParams(searchParams.toString());
    newPage === 1 ? p.delete("page") : p.set("page", String(newPage));
    router.replace(`?${p.toString()}`, { scroll: false });
  };

  return (
    <main className="space-y-8" role="main">
      <PageHeader
        title="Workouts"
        description="View and manage your workout logs"
        actions={[
          {
            label: "Start Workout",
            onClick: () => setShowStartSheet(true),
            icon: Plus,
            size: "lg",
          },
        ]}
      />

      <section aria-label="Workout filters">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]" aria-label="Filter workouts by type">
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
      </section>

      <section aria-label="Workouts list">
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
          <EmptyState
            icon={Dumbbell}
            title="No workouts yet"
            description="Start tracking your fitness journey by logging your first workout."
            actions={[
              {
                label: "Start Your First Workout",
                onClick: () => setShowStartSheet(true),
                icon: Plus,
              },
            ]}
          />
        )}
      </section>

      {data?.pagination && data.pagination.totalPages > 1 && (
        <nav aria-label="Pagination" className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={data.pagination.page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="Go to previous page"
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground" aria-current="page">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={data.pagination.page === data.pagination.totalPages}
            onClick={() =>
              setPage((p) => Math.min(data.pagination.totalPages, p + 1))
            }
            aria-label="Go to next page"
          >
            Next
          </Button>
        </nav>
      )}

      <StartWorkoutSheet
        open={showStartSheet}
        onOpenChange={setShowStartSheet}
      />
    </main>
  );
}

export default function WorkoutsPage() {
  return (
    <Suspense
      fallback={
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[200px] rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      }
    >
      <WorkoutsContent />
    </Suspense>
  );
}
