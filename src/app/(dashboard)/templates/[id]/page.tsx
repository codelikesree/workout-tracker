"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Dumbbell, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useTemplate, useDeleteTemplate } from "@/hooks/use-templates";
import { WORKOUT_TYPES } from "@/lib/constants/workout-types";

interface TemplateExercise {
  name: string;
  targetSets: number;
  targetReps: number;
  targetWeight?: number;
  weightUnit: string;
  notes?: string;
}

export default function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading } = useTemplate(id);
  const deleteTemplate = useDeleteTemplate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] rounded-lg" />
      </div>
    );
  }

  if (!data?.template) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-muted-foreground">Template not found</p>
        <Button asChild className="mt-4">
          <Link href="/templates">Back to Templates</Link>
        </Button>
      </div>
    );
  }

  const template = data.template;
  const typeLabel =
    WORKOUT_TYPES.find((t) => t.value === template.type)?.label || template.type;

  const handleDelete = async () => {
    await deleteTemplate.mutateAsync(template._id);
    router.push("/templates");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/templates">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/workouts/new?template=${template._id}`}>
              <Dumbbell className="mr-2 h-4 w-4" />
              Use Template
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/templates/${template._id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{template.name}</h1>
        {template.description && (
          <p className="text-muted-foreground mt-2">{template.description}</p>
        )}
        <div className="flex items-center gap-4 mt-3">
          <Badge>{typeLabel}</Badge>
          {template.estimatedDuration && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              ~{template.estimatedDuration} minutes
            </span>
          )}
          {template.usageCount > 0 && (
            <span className="text-sm text-muted-foreground">
              Used {template.usageCount} time
              {template.usageCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exercises</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {template.exercises.map((exercise: TemplateExercise, idx: number) => (
            <div key={idx} className="border-b last:border-0 pb-4 last:pb-0">
              <h4 className="font-semibold mb-2">{exercise.name}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Sets: </span>
                  <span className="font-medium">{exercise.targetSets}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Reps: </span>
                  <span className="font-medium">{exercise.targetReps}</span>
                </div>
                {exercise.targetWeight !== undefined && exercise.targetWeight > 0 && (
                  <div>
                    <span className="text-muted-foreground">Weight: </span>
                    <span className="font-medium">
                      {exercise.targetWeight} {exercise.weightUnit}
                    </span>
                  </div>
                )}
              </div>
              {exercise.notes && (
                <p className="text-sm text-muted-foreground mt-2">
                  {exercise.notes}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{template.name}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteTemplate.isPending}
            >
              {deleteTemplate.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
