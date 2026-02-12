"use client";

import Link from "next/link";
import { MoreVertical, Edit, Trash2, Eye, FileText, Dumbbell } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useDeleteTemplate } from "@/hooks/use-templates";
import { useStartFromTemplate } from "@/hooks/use-start-from-template";
import { WORKOUT_TYPES } from "@/lib/constants/workout-types";

interface TemplateExercise {
  name: string;
  targetSets: number;
  targetReps: number;
}

interface TemplateCardProps {
  template: {
    _id: string;
    name: string;
    description?: string;
    type: string;
    exercises: TemplateExercise[];
    estimatedDuration?: number;
    usageCount: number;
  };
}

export function TemplateCard({ template }: TemplateCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteTemplate = useDeleteTemplate();
  const { startFromTemplate, loadingTemplateId } = useStartFromTemplate();

  const typeLabel =
    WORKOUT_TYPES.find((t) => t.value === template.type)?.label || template.type;

  const totalSets = template.exercises.reduce(
    (acc, ex) => acc + ex.targetSets,
    0
  );

  const handleDelete = async () => {
    await deleteTemplate.mutateAsync(template._id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {template.name}
            </CardTitle>
            {template.description && (
              <CardDescription className="line-clamp-2">
                {template.description}
              </CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/templates/${template._id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => startFromTemplate(template._id)}
                disabled={loadingTemplateId !== null}
              >
                <Dumbbell className="mr-2 h-4 w-4" />
                {loadingTemplateId === template._id ? "Starting..." : "Start Workout"}
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/templates/${template._id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary">{typeLabel}</Badge>
            {template.estimatedDuration && (
              <Badge variant="outline">~{template.estimatedDuration} min</Badge>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {template.exercises.length} exercise
                {template.exercises.length !== 1 ? "s" : ""}, {totalSets} set
                {totalSets !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="text-sm">
              {template.exercises.slice(0, 3).map((ex, idx) => (
                <span key={idx} className="text-muted-foreground">
                  {ex.name}
                  {idx < Math.min(template.exercises.length, 3) - 1 && ", "}
                </span>
              ))}
              {template.exercises.length > 3 && (
                <span className="text-muted-foreground">
                  {" "}
                  +{template.exercises.length - 3} more
                </span>
              )}
            </div>
            {template.usageCount > 0 && (
              <p className="text-xs text-muted-foreground">
                Used {template.usageCount} time
                {template.usageCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{template.name}&quot;? This action
              cannot be undone.
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
    </>
  );
}
