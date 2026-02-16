"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import type { VolumeMetrics } from "@/lib/types/api";

interface VolumeChartProps {
  volumeMetrics: VolumeMetrics;
}

export function VolumeChart({ volumeMetrics }: VolumeChartProps) {
  const { weeklyVolumeData, volumeUnit } = volumeMetrics;
  const hasData = weeklyVolumeData.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Volume Trend</CardTitle>
        <CardDescription>Weekly training volume over time</CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weeklyVolumeData}>
              <defs>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="weekLabel"
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                label={{
                  value: `Volume (${volumeUnit})`,
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 12 },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#volumeGradient)"
                name={`Volume (${volumeUnit})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No weekly data available for this period
          </div>
        )}
      </CardContent>
    </Card>
  );
}
