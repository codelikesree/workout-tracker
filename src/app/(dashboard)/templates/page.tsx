"use client";

import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TemplateCard } from "@/components/templates/template-card";
import { useTemplates } from "@/hooks/use-templates";

interface TemplateExercise {
  name: string;
  targetSets: number;
  targetReps: number;
}

interface Template {
  _id: string;
  name: string;
  description?: string;
  type: string;
  exercises: TemplateExercise[];
  estimatedDuration?: number;
  usageCount: number;
}

export default function TemplatesPage() {
  const { data, isLoading } = useTemplates();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">
            Create and manage your workout templates
          </p>
        </div>
        <Button asChild>
          <Link href="/templates/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Link>
        </Button>
      </div>

      {/* Templates List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] rounded-lg" />
          ))}
        </div>
      ) : (data?.templates?.length ?? 0) > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data!.templates.map((template: Template) => (
            <TemplateCard key={template._id} template={template} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No templates yet</h3>
          <p className="text-muted-foreground mb-4">
            Create a template to quickly log your favorite workout routines.
          </p>
          <Button asChild>
            <Link href="/templates/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Template
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
