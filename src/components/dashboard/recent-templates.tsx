"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTemplates, useTemplateForWorkout } from "@/hooks/use-templates";
import { useActiveSession } from "@/contexts/active-session-context";
import type { StartWorkoutConfig } from "@/lib/types/active-session";

export function RecentTemplates() {
  const router = useRouter();
  const { data: templatesData } = useTemplates();
  const { startWorkout, setLastWorkoutData } = useActiveSession();
  const loadTemplate = useTemplateForWorkout();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const templates = templatesData?.templates || [];
  if (templates.length === 0) return null;

  // Show top 4 most used
  const sorted = [...templates]
    .sort(
      (a: { usageCount: number }, b: { usageCount: number }) =>
        b.usageCount - a.usageCount
    )
    .slice(0, 4);

  const handleSelect = async (templateId: string) => {
    setLoadingId(templateId);
    try {
      const payload = await loadTemplate.mutateAsync(templateId);

      const config: StartWorkoutConfig = {
        workoutName: payload.workoutName,
        type: payload.type as StartWorkoutConfig["type"],
        templateId,
        exercises: payload.exercises.map((ex) => ({
          name: ex.name,
          sets: ex.sets.map((s) => ({
            targetReps: s.reps,
            targetWeight: s.weight,
            weightUnit: s.weightUnit,
          })),
          restTime: 90,
        })),
      };

      startWorkout(config);

      // Fetch last workout data
      const exerciseNames = payload.exercises.map((ex) => ex.name);
      if (exerciseNames.length > 0) {
        try {
          const params = new URLSearchParams({
            exercises: exerciseNames.join(","),
          });
          const res = await fetch(`/api/workouts/last-stats?${params}`);
          if (res.ok) {
            const data = await res.json();
            setLastWorkoutData(data.stats);
          }
        } catch {
          // Non-critical
        }
      }

      router.push("/workout/active");
    } catch {
      // Error handled by mutation
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground">
        Quick Start from Template
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {sorted.map(
          (template: {
            _id: string;
            name: string;
            type: string;
            exercises: Array<{ name: string }>;
            usageCount: number;
          }) => (
            <Card
              key={template._id}
              className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98] touch-manipulation"
              onClick={() => handleSelect(template._id)}
            >
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                  {loadingId === template._id ? (
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  ) : (
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="font-medium text-sm truncate">
                    {template.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <Badge variant="secondary" className="text-[10px]">
                    {template.exercises.length} exercises
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
