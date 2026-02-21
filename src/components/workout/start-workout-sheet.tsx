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

  return { message: LOADING_STEPS[step], index: step };
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
  const { message: loadingMessage, index: loadingIndex } = useLoadingStep(
    aiState.status === "loading"
  );

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
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh]">
        <SheetHeader className="pb-4">
          <SheetTitle>Start Workout</SheetTitle>
        </SheetHeader>

        <div className="space-y-3 overflow-y-auto pb-safe-or-8 pb-8">
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

          {/* ── AI Suggest: idle / error ─────────────────────── */}
          {(aiState.status === "idle" || aiState.status === "error") && (
            <div className="border border-violet-500/40 rounded-xl bg-violet-500/5 dark:bg-violet-500/10">
              {/* Title row */}
              <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-500 shrink-0" />
                <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">
                  AI Suggest
                </span>
                <span className="text-xs text-muted-foreground">
                  · based on your last 10 workouts
                </span>
              </div>

              {/* Input row — stacked on smallest screens, side-by-side otherwise */}
              <div className="px-4 pb-1">
                <div className="flex gap-2 items-stretch">
                  {/* font-size 16px prevents iOS auto-zoom */}
                  <Input
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleFetchSuggestion()}
                    placeholder="e.g. focus on chest, keep it light…"
                    className="flex-1 h-11 text-base bg-background"
                    maxLength={120}
                    style={{ fontSize: "16px" }}
                  />
                  <Button
                    className="h-11 w-11 shrink-0 bg-violet-600 hover:bg-violet-700 text-white p-0"
                    onClick={handleFetchSuggestion}
                    aria-label="Get AI suggestion"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Optional — leave blank for a fully automatic suggestion
                </p>
              </div>

              {/* Error message */}
              {aiState.status === "error" && (
                <div className="mx-4 mb-3 mt-1 flex items-start gap-2 p-3 rounded-lg border border-destructive/40 bg-destructive/5">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive leading-relaxed">
                    {aiState.message}
                  </p>
                </div>
              )}

              <div className="pb-3" />
            </div>
          )}

          {/* ── AI Suggest: loading ──────────────────────────── */}
          {aiState.status === "loading" && (
            <div className="border border-violet-500/40 rounded-xl px-4 py-4 bg-violet-500/5 dark:bg-violet-500/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-violet-500/15 flex items-center justify-center shrink-0">
                  <Loader2 className="h-5 w-5 text-violet-500 animate-spin" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">
                    Thinking…
                  </p>
                  <p
                    key={loadingMessage}
                    className="text-xs text-muted-foreground mt-0.5 truncate"
                  >
                    {loadingMessage}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 flex gap-1">
                {LOADING_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full flex-1 transition-all duration-500 ${
                      loadingIndex >= i ? "bg-violet-500" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── AI Suggest: ready (suggestion preview) ───────── */}
          {aiState.status === "ready" && (
            <div className="border border-violet-500/30 rounded-xl overflow-hidden bg-violet-500/5 dark:bg-violet-500/10">
              {/* Header */}
              <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="h-4 w-4 text-violet-500 shrink-0" />
                  <span className="text-sm font-semibold text-violet-600 dark:text-violet-400 truncate">
                    {aiState.suggestion.workoutName}
                  </span>
                  <Badge variant="secondary" className="text-xs capitalize shrink-0">
                    {aiState.suggestion.type}
                  </Badge>
                </div>
                {/* Larger touch target for close */}
                <button
                  onClick={resetSuggestion}
                  className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0 ml-2"
                  aria-label="Dismiss suggestion"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Rationale */}
              <p className="px-4 pb-3 text-xs text-muted-foreground italic leading-relaxed">
                {aiState.suggestion.rationale}
              </p>

              {/* Exercise list — two lines per exercise for readability */}
              <div className="px-4 pb-3 space-y-2">
                {aiState.suggestion.exercises.map((ex, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 py-1.5 border-b border-border/50 last:border-0">
                    <span className="font-medium text-sm leading-tight">{ex.name}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 tabular-nums">
                      {ex.targetSets}×{ex.targetReps} @ {ex.targetWeight}{ex.weightUnit}
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions — full-height buttons for easy tapping */}
              <div className="px-4 pb-4 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-11"
                  onClick={() => fetchSuggestion(userPrompt.trim() || undefined)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
                <Button
                  className="flex-1 h-11 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white"
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
              <h3 className="text-sm font-medium text-muted-foreground px-1 pt-1">
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
