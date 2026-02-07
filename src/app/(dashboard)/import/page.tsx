"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { parseWorkoutText, formatExampleImport } from "@/lib/utils/import-parser";

export default function ImportPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [preview, setPreview] = useState<ReturnType<typeof parseWorkoutText>>(null);

  const handleTextChange = (value: string) => {
    setText(value);
    if (value.trim()) {
      setPreview(parseWorkoutText(value));
    } else {
      setPreview(null);
    }
  };

  const handleImport = async () => {
    if (!preview) {
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

      toast.success("Workout imported successfully!");
      router.push(`/workouts/${result.workout._id}`);
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
            Format Guide
          </CardTitle>
          <CardDescription>
            Use this simple format to import your workout data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md font-mono text-sm space-y-1">
            <p>Workout: Push Day</p>
            <p>Date: 2024-01-15</p>
            <p className="text-muted-foreground">&nbsp;</p>
            <p>Bench Press: 3x10 @ 60kg</p>
            <p>Incline Dumbbell Press: 3x12 @ 20kg</p>
            <p>Tricep Pushdown: 4x15 @ 25kg</p>
          </div>
          <div className="mt-4 flex gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">Exercise: SetsxReps @ Weight</Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={loadExample}
          >
            Load Example
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
              {preview ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Preview
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Parse Error
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {preview ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Workout Name
                    </span>
                    <p className="font-medium">{preview.workoutName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Date</span>
                    <p className="font-medium">
                      {preview.date.toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-muted-foreground mb-2 block">
                    Exercises ({preview.exercises.length})
                  </span>
                  <div className="space-y-2">
                    {preview.exercises.map((exercise, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                      >
                        <span className="font-medium">{exercise.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {exercise.sets.length} sets x {exercise.sets[0]?.reps}{" "}
                          reps
                          {exercise.sets[0]?.weight > 0 &&
                            ` @ ${exercise.sets[0].weight}${exercise.sets[0].weightUnit}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
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
        <Button onClick={handleImport} disabled={!preview || isImporting}>
          {isImporting ? "Importing..." : "Import Workout"}
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
