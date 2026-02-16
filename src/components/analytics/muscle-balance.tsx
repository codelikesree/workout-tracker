"use client";

import { Activity, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getBodyPartLabel, type BodyPart } from "@/lib/constants/exercises";
import type { BodyPartBalance } from "@/lib/types/api";

interface MuscleBalanceProps {
  bodyPartBalance: BodyPartBalance[];
}

export function MuscleBalance({ bodyPartBalance }: MuscleBalanceProps) {
  const hasData = bodyPartBalance.length > 0;
  const underworked = bodyPartBalance.filter((bp) => bp.isUnderworked);

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Muscle Balance</CardTitle>
        </div>
        <CardDescription>
          Volume distribution across body parts
          {underworked.length > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {underworked.length} underworked
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="space-y-4">
            {bodyPartBalance.map((bp) => (
              <div key={bp.bodyPart} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {getBodyPartLabel(bp.bodyPart as BodyPart)}
                    </span>
                    {bp.isUnderworked && (
                      <AlertTriangle className="h-3 w-3 text-amber-500" />
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">{bp.percentage}%</span>
                </div>
                <Progress
                  value={bp.percentage}
                  className="h-2"
                  indicatorClassName={bp.isUnderworked ? "bg-amber-500" : ""}
                />
                <p className="text-xs text-muted-foreground">
                  {bp.volume.toLocaleString()} kg total volume
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              Start tracking exercises with body parts to see balance
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
