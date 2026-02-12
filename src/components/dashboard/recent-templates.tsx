"use client";

import { FileText, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTemplates } from "@/hooks/use-templates";
import { useStartFromTemplate } from "@/hooks/use-start-from-template";
import { RECENT_TEMPLATES_LIMIT } from "@/lib/constants/workout-types";

export function RecentTemplates() {
  const { data: templatesData } = useTemplates();
  const { startFromTemplate, loadingTemplateId } = useStartFromTemplate();

  const templates = templatesData?.templates || [];
  if (templates.length === 0) return null;

  // Show top 4 most used
  const sorted = [...templates]
    .sort(
      (a: { usageCount: number }, b: { usageCount: number }) =>
        b.usageCount - a.usageCount
    )
    .slice(0, RECENT_TEMPLATES_LIMIT);

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
              onClick={() => startFromTemplate(template._id)}
            >
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                  {loadingTemplateId === template._id ? (
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
