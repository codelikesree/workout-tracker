"use client";

import { Activity, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VolumeMetrics } from "@/lib/types/api";

interface VolumeTrendCardProps {
  volumeMetrics: VolumeMetrics;
  period: "week" | "month" | "all";
}

export function VolumeTrendCard({ volumeMetrics, period }: VolumeTrendCardProps) {
  const { totalVolume, volumeUnit, volumeTrend } = volumeMetrics;
  const isPositive = volumeTrend > 0;
  const isNeutral = volumeTrend === 0;

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription className="text-xs font-medium uppercase tracking-wide">
            Total Volume
          </CardDescription>
          <div className="rounded-full bg-primary/10 p-2">
            <Activity className="h-4 w-4 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tabular-nums tracking-tight">
          {totalVolume.toLocaleString()}
          <span className="ml-1 text-sm font-normal text-muted-foreground">
            {volumeUnit}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          {!isNeutral && period !== "all" && (
            <Badge
              variant={isPositive ? "default" : "secondary"}
              className={cn(
                "text-xs font-medium",
                isPositive && "bg-success text-success-foreground hover:bg-success/90",
                !isPositive && "bg-muted text-muted-foreground"
              )}
            >
              {isPositive ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3" />
              )}
              {isPositive ? "+" : ""}
              {volumeTrend}%
            </Badge>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          reps × weight (normalized to {volumeUnit})
        </p>
      </CardContent>
    </Card>
  );
}
