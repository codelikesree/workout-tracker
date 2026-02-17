"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Dumbbell, Calendar, TrendingUp, Clock, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalytics } from "@/hooks/use-analytics";
import { WORKOUT_TYPES } from "@/lib/constants/workout-types";
import { getBodyPartLabel, type BodyPart } from "@/lib/constants/exercises";
import {
  VolumeTrendCard,
  RecentPRsCard,
  TopProgressions,
  MuscleBalance,
  Recommendations,
  VolumeChart,
} from "@/components/analytics";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#8884d8",
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<"week" | "month" | "all">("week");
  const { data, isLoading } = useAnalytics(period);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Transform data into action</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[140px] rounded-lg" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[400px] rounded-lg" />
          <Skeleton className="h-[400px] rounded-lg" />
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    totalWorkouts: 0,
    totalExercises: 0,
    totalSets: 0,
    totalDuration: 0,
    totalCalories: 0,
    streak: 0,
    templateCount: 0,
  };

  const volumeMetrics = data?.volumeMetrics;
  const personalRecords = data?.personalRecords || [];
  const bodyPartBalance = data?.bodyPartBalance || [];
  const topProgressions = data?.topProgressions || [];
  const recommendations = data?.recommendations || [];

  const typeBreakdown = data?.typeBreakdown || {};
  const bodyPartBreakdown = data?.bodyPartBreakdown || {};
  const dailyData = data?.dailyData || [];
  const comparison = data?.comparison || { current: 0, previous: 0, change: 0 };

  // Transform type breakdown for pie chart
  const pieData = Object.entries(typeBreakdown).map(([type, count]) => ({
    name: WORKOUT_TYPES.find((t) => t.value === type)?.label || type,
    value: count as number,
  }));

  // Transform body part breakdown for bar chart
  const bodyPartData = Object.entries(bodyPartBreakdown)
    .map(([bodyPart, count]) => ({
      name: getBodyPartLabel(bodyPart as BodyPart),
      sets: count as number,
    }))
    .sort((a, b) => b.sets - a.sets);

  const recentPRs = personalRecords.filter((pr) => pr.isNewPR);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Transform data into actionable insights
          </p>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <TabsList>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Key Actionable Metrics */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Key Metrics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {volumeMetrics && (
            <VolumeTrendCard volumeMetrics={volumeMetrics} period={period} />
          )}
          {recentPRs.length > 0 && (
            <RecentPRsCard personalRecords={personalRecords} period={period} />
          )}
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Streak</CardTitle>
                <div className="rounded-full bg-primary/10 p-2">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{stats.streak}</div>
              <p className="text-xs text-muted-foreground mt-1">days - Keep it going!</p>
            </CardContent>
          </Card>
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Workouts</CardTitle>
                <div className="rounded-full bg-primary/10 p-2">
                  <Dumbbell className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{stats.totalWorkouts}</div>
              {comparison.change !== 0 && period !== "all" && (
                <p
                  className={`text-xs mt-1 ${
                    comparison.change > 0 ? "text-success" : "text-muted-foreground"
                  }`}
                >
                  {comparison.change > 0 ? "+" : ""}
                  {comparison.change.toFixed(0)}% vs last {period === "week" ? "week" : "month"}
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Total Sets</CardTitle>
                <div className="rounded-full bg-primary/10 p-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
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
                <div className="rounded-full bg-primary/10 p-2">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
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
                  <div className="rounded-full bg-orange-500/10 p-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">{stats.totalCalories}</div>
                <p className="text-xs text-muted-foreground mt-1">estimated kcal</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section>
          <Recommendations recommendations={recommendations} />
        </section>
      )}

      {/* Progressive Overload */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Progressive Overload</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {volumeMetrics && <VolumeChart volumeMetrics={volumeMetrics} />}
          <TopProgressions progressions={topProgressions} period={period} />
        </div>
      </section>

      {/* Muscle Balance */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Muscle Balance</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <MuscleBalance bodyPartBalance={bodyPartBalance} />

          {/* Body Part Breakdown - Enhanced */}
          <Card>
            <CardHeader>
              <CardTitle>Body Parts Trained</CardTitle>
            </CardHeader>
            <CardContent>
              {bodyPartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={bodyPartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={80} />
                    <Tooltip />
                    <Bar
                      dataKey="sets"
                      name="Sets"
                      fill="hsl(var(--chart-3))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No data for this period
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Traditional Metrics - De-emphasized */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
          Additional Metrics
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Daily Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar
                      dataKey="workouts"
                      name="Workouts"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No data for this period
                </div>
              )}
            </CardContent>
          </Card>

          {/* Workout Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Workout Types</CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No data for this period
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
