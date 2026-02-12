"use client";

import {
  Dumbbell,
  CalendarDays,
  Flame,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";

export function QuickStats() {
  const { data, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: "This Week",
      value: data?.thisWeek ?? 0,
      icon: CalendarDays,
      suffix: "workouts",
    },
    {
      label: "This Month",
      value: data?.thisMonth ?? 0,
      icon: Dumbbell,
      suffix: "workouts",
    },
    {
      label: "Streak",
      value: data?.streak ?? 0,
      icon: Flame,
      suffix: "days",
    },
    {
      label: "Templates",
      value: data?.templateCount ?? 0,
      icon: FileText,
      suffix: "saved",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <stat.icon className="h-4 w-4" />
              <span className="text-xs font-medium">{stat.label}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{stat.value}</span>
              <span className="text-xs text-muted-foreground">
                {stat.suffix}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
