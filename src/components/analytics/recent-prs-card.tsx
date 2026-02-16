"use client";

import { Trophy, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import type { PersonalRecord } from "@/lib/types/api";

interface RecentPRsCardProps {
  personalRecords: PersonalRecord[];
  period: "week" | "month" | "all";
}

export function RecentPRsCard({ personalRecords, period }: RecentPRsCardProps) {
  const recentPRs = personalRecords.filter((pr) => pr.isNewPR).slice(0, 3);
  const hasPRs = recentPRs.length > 0;

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-base">Personal Records</CardTitle>
        </div>
        <CardDescription>
          {hasPRs
            ? `${recentPRs.length} new PR${recentPRs.length !== 1 ? "s" : ""} this ${period}`
            : `No new PRs this ${period}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasPRs ? (
          <div className="space-y-3">
            {recentPRs.map((pr, index) => (
              <div
                key={`${pr.exerciseName}-${pr.date}`}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{pr.exerciseName}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(pr.date), "MMM dd, yyyy")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">
                    {pr.weight} {pr.weightUnit}
                  </p>
                  <p className="text-xs text-muted-foreground">{pr.reps} reps</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <TrendingUp className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              Keep pushing to set new records!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
