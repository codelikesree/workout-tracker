"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { ArrowLeft, Save, Dumbbell, Clock, Layers, Weight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useActiveSession } from "@/contexts/active-session-context";
import { AuthPromptDialog, PENDING_SAVE_KEY } from "./auth-prompt-dialog";

export function FinishWorkoutSummary() {
  const { status: authStatus } = useSession();
  const { session, saveWorkout, resumeWorkout, updateWorkoutName } =
    useActiveSession();
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const autoSaveTriggered = useRef(false);

  // Auto-save when returning from auth with a pending save
  useEffect(() => {
    if (
      authStatus === "authenticated" &&
      !autoSaveTriggered.current &&
      localStorage.getItem(PENDING_SAVE_KEY)
    ) {
      autoSaveTriggered.current = true;
      localStorage.removeItem(PENDING_SAVE_KEY);
      saveWorkout();
    }
  }, [authStatus, saveWorkout]);

  if (!session) return null;

  const completedExercises = session.exercises.filter((ex) =>
    ex.sets.some((s) => s.isCompleted)
  );
  const totalSets = completedExercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.isCompleted).length,
    0
  );
  const totalVolume = completedExercises.reduce(
    (acc, ex) =>
      acc +
      ex.sets
        .filter((s) => s.isCompleted)
        .reduce((setAcc, s) => setAcc + s.actualWeight * s.actualReps, 0),
    0
  );

  const hours = Math.floor(session.elapsedSeconds / 3600);
  const minutes = Math.floor((session.elapsedSeconds % 3600) / 60);
  const duration =
    hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;

  const handleSave = async () => {
    if (authStatus !== "authenticated") {
      setShowAuthPrompt(true);
      return;
    }
    setIsSaving(true);
    await saveWorkout();
    setIsSaving(false);
  };

  return (
    <div className="h-dvh bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={resumeWorkout}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Workout Summary</h1>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-none p-4 space-y-4 max-w-lg mx-auto w-full">
        {/* Workout Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Workout Name</label>
          <Input
            value={session.workoutName}
            onChange={(e) => updateWorkoutName(e.target.value)}
            placeholder="Name your workout..."
            className="text-lg font-semibold"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-lg font-bold">{duration}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Exercises</p>
                <p className="text-lg font-bold">{completedExercises.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sets</p>
                <p className="text-lg font-bold">{totalSets}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Weight className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Volume</p>
                <p className="text-lg font-bold">
                  {totalVolume > 1000
                    ? `${(totalVolume / 1000).toFixed(1)}t`
                    : `${Math.round(totalVolume)}kg`}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exercise breakdown */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Exercises Completed
            </h3>
            {completedExercises.map((ex, i) => {
              const completedSets = ex.sets.filter((s) => s.isCompleted);
              return (
                <div key={i} className="flex justify-between items-center">
                  <span className="font-medium">{ex.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {completedSets.length} sets
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Notes (optional)</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did this workout feel?"
            className="min-h-[80px]"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-8">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={resumeWorkout}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={handleSave}
            disabled={isSaving || completedExercises.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Workout"}
          </Button>
        </div>
      </div>

      <AuthPromptDialog
        open={showAuthPrompt}
        onOpenChange={setShowAuthPrompt}
      />
    </div>
  );
}
