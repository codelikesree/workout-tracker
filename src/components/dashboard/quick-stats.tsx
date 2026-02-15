"use client";

import {
  Dumbbell,
  CalendarDays,
  Flame,
  FileText,
} from "lucide-react";
import { StatCard } from "@/components/shared";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";

export function QuickStats() {
  const { data, isLoading } = useDashboardStats();

  const stats = [
    {
      label: "This Week",
      value: data?.thisWeek ?? 0,
      icon: CalendarDays,
      unit: "workouts",
    },
    {
      label: "This Month",
      value: data?.thisMonth ?? 0,
      icon: Dumbbell,
      unit: "workouts",
    },
    {
      label: "Streak",
      value: data?.streak ?? 0,
      icon: Flame,
      unit: "days",
    },
    {
      label: "Templates",
      value: data?.templateCount ?? 0,
      icon: FileText,
      unit: "saved",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          unit={stat.unit}
          icon={stat.icon}
          loading={isLoading}
        />
      ))}
    </div>
  );
}
