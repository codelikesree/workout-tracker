"use client";

// All recharts-dependent charts isolated here so the analytics page can
// dynamic-import this module and defer its parsing to after first paint.

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VolumeChart } from "./volume-chart";
import { MuscleBalance } from "./muscle-balance";
import { TopProgressions } from "./top-progressions";
import { Recommendations } from "./recommendations";
import type { EnhancedAnalyticsResponse } from "@/lib/types/api";
import { WORKOUT_TYPES } from "@/lib/constants/workout-types";
import { getBodyPartLabel, type BodyPart } from "@/lib/constants/exercises";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#8884d8",
];

interface ChartsPanelProps {
  data: EnhancedAnalyticsResponse;
  period: "week" | "month" | "all";
}

export function ChartsPanel({ data, period }: ChartsPanelProps) {
  const volumeMetrics = data.volumeMetrics;
  const personalRecords = data.personalRecords || [];
  const bodyPartBalance = data.bodyPartBalance || [];
  const topProgressions = data.topProgressions || [];
  const recommendations = data.recommendations || [];
  const typeBreakdown = data.typeBreakdown || {};
  const bodyPartBreakdown = data.bodyPartBreakdown || {};
  const dailyData = data.dailyData || [];

  const pieData = Object.entries(typeBreakdown).map(([type, count]) => ({
    name: WORKOUT_TYPES.find((t) => t.value === type)?.label || type,
    value: count as number,
  }));

  const bodyPartData = Object.entries(bodyPartBreakdown)
    .map(([bodyPart, count]) => ({
      name: getBodyPartLabel(bodyPart as BodyPart),
      sets: count as number,
    }))
    .sort((a, b) => b.sets - a.sets);

  return (
    <>
      {recommendations.length > 0 && (
        <section>
          <Recommendations recommendations={recommendations} />
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-4">Progressive Overload</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {volumeMetrics && <VolumeChart volumeMetrics={volumeMetrics} />}
          <TopProgressions progressions={topProgressions} period={period} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Muscle Balance</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <MuscleBalance bodyPartBalance={bodyPartBalance} />
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
                    <Bar dataKey="sets" name="Sets" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
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

      <section>
        <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Additional Metrics</h2>
        <div className="grid gap-4 md:grid-cols-2">
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
                    <Bar dataKey="workouts" name="Workouts" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No data for this period
                </div>
              )}
            </CardContent>
          </Card>

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
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
    </>
  );
}
