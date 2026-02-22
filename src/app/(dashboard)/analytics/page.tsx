"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Dumbbell, Calendar, TrendingUp, Clock, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalytics } from "@/hooks/use-analytics";
import { VolumeTrendCard, RecentPRsCard } from "@/components/analytics";

// Recharts-heavy panel deferred — stats cards + tabs become interactive first
const ChartsPanel = dynamic(
  () => import("@/components/analytics/charts-panel").then((m) => m.ChartsPanel),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-[350px] rounded-lg bg-muted animate-pulse" />
          <div className="h-[350px] rounded-lg bg-muted animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-[350px] rounded-lg bg-muted animate-pulse" />
          <div className="h-[350px] rounded-lg bg-muted animate-pulse" />
        </div>
      </div>
    ),
  }
);

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<"week" | "month" | "all">("week");
  const { data, isLoading } = useAnalytics(period);

  const stats = data?.stats ?? {
    totalWorkouts: 0,
    totalExercises: 0,
    totalSets: 0,
    totalDuration: 0,
    totalCalories: 0,
    streak: 0,
    templateCount: 0,
  };
  const volumeMetrics = data?.volumeMetrics;
  const personalRecords = data?.personalRecords ?? [];
  const comparison = data?.comparison ?? { current: 0, previous: 0, change: 0 };
  const recentPRs = personalRecords.filter((pr) => pr.isNewPR);

  return (
    <div className="space-y-8">
      {/* Header + period tabs — interactive immediately, no recharts needed */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Transform data into actionable insights</p>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <TabsList>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stat cards — lightweight, render immediately */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Key Metrics</h2>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[140px] rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {volumeMetrics && <VolumeTrendCard volumeMetrics={volumeMetrics} period={period} />}
            {recentPRs.length > 0 && <RecentPRsCard personalRecords={personalRecords} period={period} />}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Streak</CardTitle>
                  <div className="rounded-full bg-primary/10 p-2"><Calendar className="h-4 w-4 text-primary" /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">{stats.streak}</div>
                <p className="text-xs text-muted-foreground mt-1">days — keep it going!</p>
              </CardContent>
            </Card>
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Workouts</CardTitle>
                  <div className="rounded-full bg-primary/10 p-2"><Dumbbell className="h-4 w-4 text-primary" /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">{stats.totalWorkouts}</div>
                {comparison.change !== 0 && period !== "all" && (
                  <p className={`text-xs mt-1 ${comparison.change > 0 ? "text-success" : "text-muted-foreground"}`}>
                    {comparison.change > 0 ? "+" : ""}{comparison.change.toFixed(0)}% vs last {period === "week" ? "week" : "month"}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Total Sets</CardTitle>
                  <div className="rounded-full bg-primary/10 p-2"><TrendingUp className="h-4 w-4 text-primary" /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">{stats.totalSets}</div>
                <p className="text-xs text-muted-foreground mt-1">sets completed</p>
              </CardContent>
            </Card>
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Duration</CardTitle>
                  <div className="rounded-full bg-primary/10 p-2"><Clock className="h-4 w-4 text-primary" /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">{stats.totalDuration}</div>
                <p className="text-xs text-muted-foreground mt-1">total minutes</p>
              </CardContent>
            </Card>
            {(stats.totalCalories ?? 0) > 0 && (
              <Card className="transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
                    <div className="rounded-full bg-orange-500/10 p-2"><Flame className="h-4 w-4 text-orange-500" /></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">{stats.totalCalories}</div>
                  <p className="text-xs text-muted-foreground mt-1">estimated kcal</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </section>

      {/* Recharts-heavy charts — deferred via dynamic import */}
      {data && <ChartsPanel data={data} period={period} />}
    </div>
  );
}
