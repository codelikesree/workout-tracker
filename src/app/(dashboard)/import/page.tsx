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
import { parseWorkoutText, formatExampleImport } from "@/lib/utils/import-parser";

export default function ImportPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [preview, setPreview] = useState<ReturnType<typeof parseWorkoutText>>(
    null
  );

  const handleTextChange = (value: string) => {
    setText(value);
    if (value.trim()) {
      setPreview(parseWorkoutText(value));
    } else {
      setPreview(null);
    }
  };

  const handleImport = async () => {
    if (!preview || preview.length === 0) {
      toast.error("Please enter valid workout data");
      return;
    }

    setIsImporting(true);

    try {
      const response = await fetch("/api/workouts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to import workout");
        return;
      }

      const count = result.workouts.length;
      toast.success(
        count === 1
          ? "Workout imported successfully!"
          : `${count} workouts imported successfully!`
      );

      if (count === 1) {
        router.push(`/workouts/${result.workouts[0]._id}`);
      } else {
        router.push("/workouts");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };

  const loadExample = () => {
    const example = formatExampleImport();
    setText(example);
    setPreview(parseWorkoutText(example));
  };

  const totalExercises =
    preview?.reduce((sum, w) => sum + w.exercises.length, 0) ?? 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import Workout</h1>
        <p className="text-muted-foreground">
          Paste your workout data to quickly import it
        </p>
      </div>

      {/* Format Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Smart Import
          </CardTitle>
          <CardDescription>
            Paste any text containing workout data — chat messages, notes, or
            multi-day logs. The parser will find exercises, extract numbers, and
            split by date.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <p className="font-medium">Supported formats:</p>
            <div className="grid gap-2">
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">Bench Press 3x10 @ 80kg</Badge>
                <Badge variant="outline">squat 100kg x 8</Badge>
                <Badge variant="outline">deadlift 3 sets 5 reps 140kg</Badge>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">pull ups: 4x12</Badge>
                <Badge variant="outline">dumbbell curl 15kg 10 reps</Badge>
                <Badge variant="outline">bech press 3x8 @ 70kg</Badge>
              </div>
            </div>
            <p className="text-muted-foreground text-xs">
              Dates, chat names, and irrelevant text are automatically filtered
              out. Exercises are fuzzy-matched against 165+ known exercises —
              typos are OK. Multiple dates in the text create separate workouts.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadExample}>
            Load Multi-Day Example
          </Button>
        </CardContent>
      </Card>

      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Paste Your Workout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste your workout data here..."
            className="min-h-[200px] font-mono"
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Preview */}
      {text.trim() && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {preview && preview.length > 0 ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Preview
                  {preview.length > 1 && (
                    <Badge variant="secondary" className="ml-2">
                      {preview.length} days
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
                          Day {wIdx + 1}
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
                          {workout.date.toLocaleDateString()}
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
                            <span className="font-medium">
                              {exercise.name}
                            </span>
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
              <p className="text-red-500">
                Could not parse the workout text. Please check the format and
                try again.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          onClick={handleImport}
          disabled={!preview || preview.length === 0 || isImporting}
        >
          {isImporting
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
