interface ParsedExercise {
  name: string;
  sets: Array<{
    setNumber: number;
    reps: number;
    weight: number;
    weightUnit: "kg" | "lbs";
  }>;
}

interface ParsedWorkout {
  workoutName: string;
  date: Date;
  type: "strength" | "cardio" | "flexibility" | "hiit" | "sports" | "other";
  exercises: ParsedExercise[];
}

export function parseWorkoutText(text: string): ParsedWorkout | null {
  const lines = text.trim().split("\n").filter((line) => line.trim());

  if (lines.length === 0) {
    return null;
  }

  let workoutName = "Imported Workout";
  let date = new Date();
  const exercises: ParsedExercise[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check for workout name: "Workout: Push Day" or "Name: Push Day"
    const nameMatch = trimmedLine.match(/^(?:workout|name):\s*(.+)$/i);
    if (nameMatch) {
      workoutName = nameMatch[1].trim();
      continue;
    }

    // Check for date: "Date: 2024-01-15" or "Date: January 15, 2024"
    const dateMatch = trimmedLine.match(/^date:\s*(.+)$/i);
    if (dateMatch) {
      const parsedDate = new Date(dateMatch[1].trim());
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate;
      }
      continue;
    }

    // Skip empty lines or header-like lines
    if (!trimmedLine || trimmedLine.startsWith("#") || trimmedLine.startsWith("---")) {
      continue;
    }

    // Parse exercise line
    // Supported formats:
    // "Bench Press: 3x10 @ 60kg"
    // "Bench Press: 3x10 @ 60 kg"
    // "Bench Press: 3x10 60kg"
    // "Bench Press: 3 sets x 10 reps @ 60kg"
    // "Bench Press 3x10 @ 60kg"

    // Try to parse exercise
    const exerciseRegex =
      /^(.+?)[:|\s]+(\d+)\s*(?:sets?\s*)?[x×]\s*(\d+)\s*(?:reps?)?\s*(?:@|at)?\s*(\d+(?:\.\d+)?)\s*(kg|lbs?)?$/i;
    const exerciseMatch = trimmedLine.match(exerciseRegex);

    if (exerciseMatch) {
      const [, name, setsStr, repsStr, weightStr, unitStr] = exerciseMatch;
      const numSets = parseInt(setsStr, 10);
      const reps = parseInt(repsStr, 10);
      const weight = parseFloat(weightStr);
      const weightUnit = unitStr?.toLowerCase().startsWith("lb")
        ? "lbs"
        : "kg";

      exercises.push({
        name: name.trim(),
        sets: Array.from({ length: numSets }, (_, i) => ({
          setNumber: i + 1,
          reps,
          weight,
          weightUnit: weightUnit as "kg" | "lbs",
        })),
      });
      continue;
    }

    // Try simpler format without weight: "Bench Press: 3x10"
    const simpleRegex = /^(.+?)[:|\s]+(\d+)\s*[x×]\s*(\d+)$/i;
    const simpleMatch = trimmedLine.match(simpleRegex);

    if (simpleMatch) {
      const [, name, setsStr, repsStr] = simpleMatch;
      const numSets = parseInt(setsStr, 10);
      const reps = parseInt(repsStr, 10);

      exercises.push({
        name: name.trim(),
        sets: Array.from({ length: numSets }, (_, i) => ({
          setNumber: i + 1,
          reps,
          weight: 0,
          weightUnit: "kg" as const,
        })),
      });
    }
  }

  if (exercises.length === 0) {
    return null;
  }

  return {
    workoutName,
    date,
    type: "strength", // Default to strength
    exercises,
  };
}

export function formatExampleImport(): string {
  return `Workout: Push Day
Date: ${new Date().toISOString().split("T")[0]}

Bench Press: 3x10 @ 60kg
Incline Dumbbell Press: 3x12 @ 20kg
Tricep Pushdown: 4x15 @ 25kg
Overhead Press: 3x8 @ 40kg`;
}
