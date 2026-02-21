"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dumbbell,
  FileText,
  Loader2,
  Sparkles,
  AlertCircle,
  RefreshCw,
  X,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useActiveSession } from "@/contexts/active-session-context";
import { useTemplates } from "@/hooks/use-templates";
import { useStartFromTemplate } from "@/hooks/use-start-from-template";
import { useAiWorkoutSuggestion } from "@/hooks/use-ai-workout-suggestion";
import { DEFAULT_REST_TIME_SECONDS } from "@/lib/constants/workout-types";
import type { StartWorkoutConfig } from "@/lib/types/active-session";

const LOADING_STEPS = [
  "Reviewing your recent workouts…",
  "Checking muscle group recovery…",
  "Calculating progressive overload…",
  "Picking the best exercises…",
  "Almost ready…",
];

function useLoadingStep(active: boolean) {
  const [step, setStep] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) {
      setStep(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setStep((s) => (s < LOADING_STEPS.length - 1 ? s + 1 : s));
    }, 1400);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active]);

  return LOADING_STEPS[step];
}

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
  const { state: aiState, fetchSuggestion, reset: resetSuggestion, toStartConfig } =
    useAiWorkoutSuggestion();

  const [userPrompt, setUserPrompt] = useState("");
  const loadingMessage = useLoadingStep(aiState.status === "loading");

  const handleEmptyWorkout = () => {
    const config: StartWorkoutConfig = {
      workoutName: "Workout",
      type: "strength",
      exercises: [
        {
          name: "",
          sets: [{ targetReps: 10, targetWeight: 0, weightUnit: "kg" }],
          restTime: DEFAULT_REST_TIME_SECONDS,
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

  const handleFetchSuggestion = () => {
    fetchSuggestion(userPrompt.trim() || undefined);
  };

  const handleStartAiSuggestion = () => {
    if (aiState.status !== "ready") return;
    const config = toStartConfig(aiState.suggestion);
    startWorkout(config);
    onOpenChange(false);
    router.push("/workout/active");
  };

  const handleRegenerate = () => {
    fetchSuggestion(userPrompt.trim() || undefined);
  };

  const templates = templatesData?.templates || [];

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          resetSuggestion();
          setUserPrompt("");
        }
        onOpenChange(o);
      }}
    >
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
              <p className="text-sm text-muted-foreground">Start from scratch</p>
            </div>
          </Button>

          {/* ── AI Suggest section ─────────────────────────────── */}

          {/* Idle: prompt input + button */}
          {(aiState.status === "idle" || aiState.status === "error") && (
            <div className="border border-violet-500/40 rounded-xl overflow-hidden bg-violet-500/5 dark:bg-violet-500/10">
              <div className="px-4 pt-4 pb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-500 shrink-0" />
                <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">
                  AI Suggest
                </span>
              </div>

              {/* Optional prompt */}
              <div className="px-4 pb-3">
                <div className="flex gap-2">
                  <Input
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleFetchSuggestion()}
                    placeholder="e.g. focus on chest, keep it light…"
                    className="text-sm h-9 bg-background"
                    maxLength={120}
                  />
                  <Button
                    size="sm"
                    className="bg-violet-600 hover:bg-violet-700 text-white px-3 shrink-0"
                    onClick={handleFetchSuggestion}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 px-0.5">
                  Optional — leave blank for a fully automatic suggestion
                </p>
              </div>

              {/* Error inline */}
              {aiState.status === "error" && (
                <div className="mx-4 mb-3 flex items-center gap-2 p-2.5 rounded-lg border border-destructive/40 bg-destructive/5">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                  <p className="text-xs text-destructive">{aiState.message}</p>
                </div>
              )}
            </div>
          )}

          {/* Loading: animated status steps */}
          {aiState.status === "loading" && (
            <div className="border border-violet-500/40 rounded-xl px-4 py-5 bg-violet-500/5 dark:bg-violet-500/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-violet-500/15 flex items-center justify-center shrink-0">
                  <Loader2 className="h-5 w-5 text-violet-500 animate-spin" />
                </div>
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
                    Thinking…
                  </p>
                  <p
                    key={loadingMessage}
                    className="text-xs text-muted-foreground transition-all duration-500"
                  >
                    {loadingMessage}
                  </p>
                </div>
              </div>
              {/* Progress dots */}
              <div className="flex gap-1.5 mt-4 pl-[52px]">
                {LOADING_STEPS.map((step, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      LOADING_STEPS.indexOf(loadingMessage) >= i
                        ? "bg-violet-500 w-4"
                        : "bg-muted w-1.5"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Ready: suggestion preview */}
          {aiState.status === "ready" && (
            <div className="border border-violet-500/30 rounded-xl overflow-hidden bg-violet-500/5 dark:bg-violet-500/10">
              {/* Header */}
              <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">
                    AI Suggestion
                  </span>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {aiState.suggestion.type}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground"
                  onClick={resetSuggestion}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              {/* Name + rationale */}
              <div className="px-4 pb-2">
                <p className="font-semibold text-base">
                  {aiState.suggestion.workoutName}
                </p>
                <p className="text-xs text-muted-foreground italic mt-0.5">
                  {aiState.suggestion.rationale}
                </p>
              </div>

              {/* Exercise list */}
              <div className="px-4 pb-3 space-y-1.5">
                {aiState.suggestion.exercises.map((ex, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate mr-2">{ex.name}</span>
                    <span className="text-muted-foreground text-xs whitespace-nowrap">
                      {ex.targetSets}×{ex.targetReps} @ {ex.targetWeight}
                      {ex.weightUnit}
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="px-4 pb-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleRegenerate}
                >
                  <RefreshCw className="h-3 w-3 mr-1.5" />
                  Regenerate
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                  onClick={handleStartAiSuggestion}
                >
                  Start Workout
                </Button>
              </div>
            </div>
          )}

          {/* ── Templates ──────────────────────────────────────── */}
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
