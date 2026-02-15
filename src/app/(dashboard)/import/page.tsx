"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Calendar,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useImportWorkouts } from "@/hooks/use-import-workouts";

interface ParsedWorkout {
  workoutName: string;
  date: string;
  type: "strength" | "cardio" | "flexibility" | "hiit" | "sports" | "other";
  exercises: Array<{
    name: string;
    sets: Array<{
      setNumber: number;
      reps: number;
      weight: number;
      weightUnit: "kg" | "lbs";
    }>;
  }>;
}

interface ParseResponse {
  workouts: ParsedWorkout[];
}

export default function ImportPage() {
  const router = useRouter();
  const importWorkouts = useImportWorkouts();
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<ParsedWorkout[] | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleParse = async () => {
    if (!text.trim()) {
      setPreview(null);
      return;
    }

    setIsParsing(true);
    setParseError(null);
    setPreview(null);

    try {
      const response = await fetch("/api/workouts/parse-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      console.log(response);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error(
            errorData.error ||
              "AI rate limit exceeded. Please try again in a moment.",
          );
        }
        throw new Error(errorData.error || "Failed to parse workout data");
      }

      // Read the streamed response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;
        }
      }

      // Clean up markdown code blocks and parse JSON
      const jsonContent = accumulatedText
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();

      // Parse the JSON
      const parsed: ParseResponse = JSON.parse(jsonContent);

      if (!parsed.workouts || parsed.workouts.length === 0) {
        throw new Error(
          "No workouts found in the text. Please check your input.",
        );
      }

      setPreview(parsed.workouts);
      toast.success("Workout data parsed successfully!");
    } catch (error) {
      console.error("Parse error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to parse workout data. Please try again.";
      setParseError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsParsing(false);
    }
  };

  const handleImport = async () => {
    if (!preview || preview.length === 0) {
      toast.error("Please parse workout data first");
      return;
    }

    try {
      const result = await importWorkouts.mutateAsync(text);

      const count = result.workouts.length;
      toast.success(
        count === 1
          ? "Workout imported successfully!"
          : `${count} workouts imported successfully!`,
      );

      if (count === 1) {
        router.push(`/workouts/${result.workouts[0]._id}`);
      } else {
        router.push("/workouts");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  const loadExample = () => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const example = `${yesterdayStr}
Bench Press: 3x10 @ 60kg
Incline Dumbbell Press: 3x12 @ 20kg
Tricep Pushdown: 4x15 @ 25kg

${today}
Squat: 4x8 @ 100kg
Leg Press: 3x12 @ 140kg
Leg Curl: 3x15 @ 40kg`;
    setText(example);
    setPreview(null);
    setParseError(null);
  };

  const totalExercises =
    preview?.reduce((sum, w) => sum + w.exercises.length, 0) ?? 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          Import Workout
          <Sparkles className="h-6 w-6 text-primary" />
        </h1>
        <p className="text-muted-foreground">
          Paste your workout data in ANY format — powered by AI
        </p>
      </div>

      {/* Format Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            AI-Powered Smart Import
          </CardTitle>
          <CardDescription>
            Paste ANY text containing workout data — chat messages, WhatsApp
            logs, notes, spreadsheets, or multi-day/month logs. The AI will
            intelligently parse exercises, dates, sets, reps, and weights in any
            format.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <p className="font-medium">Works with any format:</p>
            <div className="grid gap-2">
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">Bench Press 3x10 @ 80kg</Badge>
                <Badge variant="outline">squat 100kg x 8</Badge>
                <Badge variant="outline">pull ups 4x12</Badge>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">Chat logs with dates</Badge>
                <Badge variant="outline">Multi-month data</Badge>
                <Badge variant="outline">Typos & abbreviations OK</Badge>
              </div>
            </div>
            <p className="text-muted-foreground text-xs">
              Supports 165+ exercises with fuzzy matching. Can handle multiple
              days, weeks, or even months of data. Automatically detects dates,
              filters noise, and structures your workout history.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadExample}>
            Load Example
          </Button>
        </CardContent>
      </Card>

      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Paste Your Workout Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your workout data here... Any format works!"
            className="min-h-[200px] font-mono"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button
            onClick={handleParse}
            disabled={!text.trim() || isParsing}
            className="w-full sm:w-auto"
          >
            {isParsing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Parsing with AI...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Parse with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Preview */}
      {(preview || parseError) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {preview && preview.length > 0 ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Preview
                  {preview.length > 1 && (
                    <Badge variant="secondary" className="ml-2">
                      {preview.length} workouts
                    </Badge>
                  )}
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Parse Error
                </>
              )}
            </CardTitle>
            {preview && preview.length > 0 && (
              <CardDescription>
                {totalExercises} exercise{totalExercises !== 1 && "s"} across{" "}
                {preview.length} workout{preview.length !== 1 && "s"}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {preview && preview.length > 0 ? (
              <div className="space-y-6">
                {preview.map((workout, wIdx) => (
                  <div
                    key={wIdx}
                    className={
                      preview.length > 1
                        ? "border rounded-lg p-4 space-y-3"
                        : "space-y-3"
                    }
                  >
                    {preview.length > 1 && (
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">
                          Workout {wIdx + 1}
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Workout Name
                        </span>
                        <p className="font-medium">{workout.workoutName}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Date
                        </span>
                        <p className="font-medium">
                          {new Date(workout.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm text-muted-foreground mb-2 block">
                        Exercises ({workout.exercises.length})
                      </span>
                      <div className="space-y-2">
                        {workout.exercises.map((exercise, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 bg-muted rounded-md"
                          >
                            <span className="font-medium">{exercise.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {exercise.sets.length} sets x{" "}
                              {exercise.sets[0]?.reps} reps
                              {exercise.sets[0]?.weight > 0 &&
                                ` @ ${exercise.sets[0].weight}${exercise.sets[0].weightUnit}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-destructive font-medium">{parseError}</p>
                <p className="text-sm text-muted-foreground">
                  The AI couldn't parse your workout data. Please check your
                  input and try again, or try the example format.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          onClick={handleImport}
          disabled={
            !preview || preview.length === 0 || importWorkouts.isPending
          }
        >
          {importWorkouts.isPending
            ? "Importing..."
            : preview && preview.length > 1
              ? `Import ${preview.length} Workouts`
              : "Import Workout"}
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
