"use client";

import { Loader2, ChevronRight } from "lucide-react";
import { useTemplates } from "@/hooks/use-templates";
import { useStartFromTemplate } from "@/hooks/use-start-from-template";
import { RECENT_TEMPLATES_LIMIT } from "@/lib/constants/workout-types";
import { cn } from "@/lib/utils";

export function RecentTemplates() {
  const { data: templatesData } = useTemplates();
  const { startFromTemplate, loadingTemplateId } = useStartFromTemplate();

  const templates = templatesData?.templates || [];
  if (templates.length === 0) return null;

  const sorted = [...templates]
    .sort(
      (a: { usageCount: number }, b: { usageCount: number }) =>
        b.usageCount - a.usageCount
    )
    .slice(0, RECENT_TEMPLATES_LIMIT);

  return (
    <div className="space-y-2.5">
      <h2 className="text-sm font-medium text-muted-foreground">
        Quick Start
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {sorted.map(
          (template: {
            _id: string;
            name: string;
            type: string;
            exercises: Array<{ name: string }>;
            usageCount: number;
          }) => {
            const isLoading = loadingTemplateId === template._id;
            return (
              <button
                key={template._id}
                type="button"
                onClick={() => startFromTemplate(template._id)}
                disabled={isLoading}
                className={cn(
                  "group relative flex items-center justify-between gap-2 rounded-xl border bg-card p-3.5 text-left transition-all duration-150",
                  "hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm",
                  "active:scale-[0.98] touch-manipulation",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isLoading && "opacity-60 pointer-events-none"
                )}
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate leading-snug">
                    {template.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {template.exercises.length} exercise
                    {template.exercises.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}
