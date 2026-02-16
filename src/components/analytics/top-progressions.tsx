"use client";

import { TrendingUp, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { ProgressionData } from "@/lib/types/api";

interface TopProgressionsProps {
  progressions: ProgressionData[];
  period: "week" | "month" | "all";
}

export function TopProgressions({ progressions, period }: TopProgressionsProps) {
  const hasProgressions = progressions.length > 0;

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Top Progressions</CardTitle>
        </div>
        <CardDescription>
          {hasProgressions
            ? `Biggest volume increases this ${period}`
            : `No progressions tracked this ${period}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasProgressions ? (
          <div className="space-y-4">
            {progressions.map((prog, index) => (
              <div key={prog.exerciseName} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{prog.exerciseName}</span>
                  </div>
                  <Badge variant="default" className="bg-success text-success-foreground">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    +{prog.volumeIncrease}%
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{prog.previousVolume} kg</span>
                  <span>→</span>
                  <span className="font-medium text-foreground">
                    {prog.currentVolume} kg
                  </span>
                </div>
                <Progress value={Math.min(prog.volumeIncrease, 100)} className="h-1.5" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <TrendingUp className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              Track your progress by maintaining consistent exercises
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
