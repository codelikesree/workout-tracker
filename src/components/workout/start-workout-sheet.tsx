"use client";

import { useRouter } from "next/navigation";
import { Dumbbell, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useActiveSession } from "@/contexts/active-session-context";
import { useTemplates } from "@/hooks/use-templates";
import { useStartFromTemplate } from "@/hooks/use-start-from-template";
import type { StartWorkoutConfig } from "@/lib/types/active-session";

interface StartWorkoutSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StartWorkoutSheet({
  open,
  onOpenChange,
}: StartWorkoutSheetProps) {
  const router = useRouter();
  const { startWorkout } = useActiveSession();
  const { data: templatesData } = useTemplates();
  const { startFromTemplate, loadingTemplateId } = useStartFromTemplate();

  const handleEmptyWorkout = () => {
    const config: StartWorkoutConfig = {
      workoutName: "Workout",
      type: "strength",
      exercises: [
        {
          name: "",
          sets: [{ targetReps: 10, targetWeight: 0, weightUnit: "kg" }],
          restTime: 90,
        },
      ],
    };
    startWorkout(config);
    onOpenChange(false);
    router.push("/workout/active");
  };

  const handleTemplateSelect = async (templateId: string) => {
    await startFromTemplate(templateId);
    onOpenChange(false);
  };

  const templates = templatesData?.templates || [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh]">
        <SheetHeader className="pb-4">
          <SheetTitle>Start Workout</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 overflow-y-auto pb-8">
          {/* Empty workout */}
          <Button
            variant="outline"
            className="w-full h-auto py-4 flex items-center gap-4 justify-start"
            onClick={handleEmptyWorkout}
          >
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Dumbbell className="h-6 w-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Empty Workout</p>
              <p className="text-sm text-muted-foreground">
                Start from scratch
              </p>
            </div>
          </Button>

          {/* Templates */}
          {templates.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground px-1">
                From Template
              </h3>
              {templates.map(
                (template: {
                  _id: string;
                  name: string;
                  type: string;
                  exercises: Array<{ name: string }>;
                }) => (
                  <Button
                    key={template._id}
                    variant="outline"
                    className="w-full h-auto py-3 flex items-center gap-4 justify-start"
                    onClick={() => handleTemplateSelect(template._id)}
                    disabled={loadingTemplateId !== null}
                  >
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      {loadingTemplateId === template._id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <FileText className="h-5 w-5" />
                      )}
                    </div>
                    <div className="text-left min-w-0">
                      <p className="font-medium truncate">{template.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {template.exercises
                          .map((ex: { name: string }) => ex.name)
                          .join(", ")}
                      </p>
                    </div>
                  </Button>
                )
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
