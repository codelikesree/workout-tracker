"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, addWeeks, subWeeks, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useWorkouts } from "@/hooks/use-workouts";
import { WORKOUT_TYPES } from "@/lib/constants/workout-types";

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

// ─── Inner component (uses useSearchParams) ──────────────────────────────────

function HistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const view = (searchParams.get("view") ?? "month") as "month" | "week";
  const dateParam = searchParams.get("date");
  const currentDate = dateParam ? parseISO(dateParam) : new Date();

  const pushParams = (newView: string, newDate: Date) => {
    const params = new URLSearchParams();
    params.set("view", newView);
    params.set("date", format(newDate, "yyyy-MM-dd"));
    router.replace(`/history?${params.toString()}`);
  };

  const startDate =
    view === "month"
      ? startOfMonth(currentDate)
      : startOfWeek(currentDate, { weekStartsOn: 1 });
  const endDate =
    view === "month"
      ? endOfMonth(currentDate)
      : endOfWeek(currentDate, { weekStartsOn: 1 });

  const { data, isLoading } = useWorkouts({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    limit: 100,
  });

  const workouts: Workout[] = data?.workouts || [];

  const getWorkoutsForDay = (day: Date) =>
    workouts.filter((w) => isSameDay(new Date(w.date), day));

  const navigatePrevious = () => {
    const newDate =
      view === "month" ? subMonths(currentDate, 1) : subWeeks(currentDate, 1);
    pushParams(view, newDate);
  };

  const navigateNext = () => {
    const newDate =
      view === "month" ? addMonths(currentDate, 1) : addWeeks(currentDate, 1);
    pushParams(view, newDate);
  };

  const goToToday = () => pushParams(view, new Date());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workout History</h1>
          <p className="text-muted-foreground">
            View your workout history by month or week
          </p>
        </div>
      </div>

      <Tabs value={view} onValueChange={(v) => pushParams(v, currentDate)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={navigatePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[150px] text-center">
              {view === "month"
                ? format(currentDate, "MMMM yyyy")
                : `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`}
            </span>
            <Button variant="outline" size="icon" onClick={navigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-[500px] mt-4 rounded-lg" />
        ) : (
          <>
            <TabsContent value="month" className="mt-4">
              <MonthView
                currentDate={currentDate}
                workouts={workouts}
                getWorkoutsForDay={getWorkoutsForDay}
              />
            </TabsContent>
            <TabsContent value="week" className="mt-4">
              <WeekView
                startDate={startDate}
                getWorkoutsForDay={getWorkoutsForDay}
              />
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{workouts.length}</div>
              <div className="text-sm text-muted-foreground">Total Workouts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {workouts.reduce((acc, w) => acc + w.exercises.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Exercises</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {workouts.reduce(
                  (acc, w) =>
                    acc + w.exercises.reduce((eAcc, e) => eAcc + e.sets.length, 0),
                  0
                )}
              </div>
              <div className="text-sm text-muted-foreground">Total Sets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {workouts.reduce((acc, w) => acc + (w.duration || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Minutes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Month / Week view components (unchanged) ────────────────────────────────

function MonthView({
  currentDate,
  workouts,
  getWorkoutsForDay,
}: {
  currentDate: Date;
  workouts: Workout[];
  getWorkoutsForDay: (day: Date) => Workout[];
}) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayWorkouts = getWorkoutsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-[80px] p-1 border rounded-md",
                  !isCurrentMonth && "bg-muted/50 text-muted-foreground",
                  isToday && "border-primary"
                )}
              >
                <div
                  className={cn(
                    "text-sm font-medium mb-1",
                    isToday &&
                      "bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center"
                  )}
                >
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {dayWorkouts.slice(0, 2).map((workout) => (
                    <Link key={workout._id} href={`/workouts/${workout._id}`} className="block">
                      <div className="text-xs p-1 bg-primary/10 rounded truncate hover:bg-primary/20 transition-colors">
                        {workout.workoutName}
                      </div>
                    </Link>
                  ))}
                  {dayWorkouts.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayWorkouts.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function WeekView({
  startDate,
  getWorkoutsForDay,
}: {
  startDate: Date;
  getWorkoutsForDay: (day: Date) => Workout[];
}) {
  const days = eachDayOfInterval({
    start: startDate,
    end: endOfWeek(startDate, { weekStartsOn: 1 }),
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      {days.map((day) => {
        const dayWorkouts = getWorkoutsForDay(day);
        const isToday = isSameDay(day, new Date());

        return (
          <Card key={day.toISOString()} className={cn(isToday && "border-primary")}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                <div className={cn("flex items-center gap-2", isToday && "text-primary")}>
                  {format(day, "EEE")}
                  <span
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                      isToday && "bg-primary text-primary-foreground"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dayWorkouts.length > 0 ? (
                <div className="space-y-2">
                  {dayWorkouts.map((workout) => {
                    const typeLabel =
                      WORKOUT_TYPES.find((t) => t.value === workout.type)?.label ||
                      workout.type;
                    return (
                      <Link
                        key={workout._id}
                        href={`/workouts/${workout._id}`}
                        className="block p-2 rounded-md border hover:bg-muted transition-colors"
                      >
                        <div className="font-medium text-sm">{workout.workoutName}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {typeLabel}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {workout.exercises.length} exercises
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  <CalendarIcon className="h-6 w-6 mx-auto mb-1 opacity-50" />
                  Rest day
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Page (Suspense boundary required by useSearchParams) ────────────────────

export default function HistoryPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[600px] rounded-lg" />}>
      <HistoryContent />
    </Suspense>
  );
}
