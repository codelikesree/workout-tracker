import { NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getCurrentUserId } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connection";
import { WorkoutLog } from "@/lib/db/models/workout-log";
import { EXERCISES } from "@/lib/constants/exercises";

const EXERCISE_NAMES = EXERCISES.map((ex) => ex.name).join(", ");

const SYSTEM_PROMPT = `You are an expert personal trainer. Analyse the user's recent workout history and suggest the next optimal workout.

AVAILABLE EXERCISES — use ONLY these exact names:
${EXERCISE_NAMES}

WORKOUT TYPES: strength | cardio | flexibility | hiit | sports | other

PROGRAMMING PRINCIPLES:
- Avoid muscle groups heavily trained in the last 48 hours (based on the dates provided)
- Rotate through undertrained or rested muscle groups
- Apply progressive overload: for exercises seen in history, suggest weights ~2.5-5% higher than the last session
- Aim for 3-5 exercises, 3-4 sets each (suitable for a 45-60 min session)
- If fewer than 3 workouts in history, suggest a balanced full-body strength session
- restTime is in seconds (60-120 for strength, 30-60 for HIIT)

OUTPUT — return ONLY valid JSON, no markdown:
{
  "workoutName": "Push Day",
  "type": "strength",
  "rationale": "One concise sentence explaining why this workout fits now",
  "exercises": [
    {
      "name": "Bench Press",
      "targetSets": 4,
      "targetReps": 8,
      "targetWeight": 82.5,
      "weightUnit": "kg",
      "restTime": 90
    }
  ]
}`;

function formatWorkoutsForPrompt(workouts: Array<{
  workoutName: string;
  date: Date;
  type: string;
  exercises: Array<{
    name: string;
    sets: Array<{ reps: number; weight: number; weightUnit: string }>;
  }>;
}>): string {
  if (workouts.length === 0) {
    return "No workout history. Suggest a beginner full-body strength session.";
  }

  return workouts.map((w) => {
    const date = new Date(w.date).toLocaleDateString("en-GB");
    const exercises = w.exercises.map((ex) => {
      const bestSet = ex.sets.reduce(
        (best, s) => (s.weight > best.weight ? s : best),
        ex.sets[0]
      );
      return `  - ${ex.name}: ${ex.sets.length} sets × ${bestSet?.reps ?? 0} reps @ ${bestSet?.weight ?? 0}${bestSet?.weightUnit ?? "kg"}`;
    }).join("\n");
    return `[${date}] ${w.workoutName} (${w.type})\n${exercises}`;
  }).join("\n\n");
}

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const userPrompt: string = typeof body.userPrompt === "string" ? body.userPrompt.trim() : "";

    await connectDB();

    const recentWorkouts = await WorkoutLog.find({ userId })
      .sort({ date: -1 })
      .limit(10)
      .lean();

    const historyText = formatWorkoutsForPrompt(recentWorkouts);

    const userPreference = userPrompt
      ? `\n\nUSER PREFERENCE: "${userPrompt}" — prioritise this in your suggestion.`
      : "";

    const result = await generateText({
      model: google("gemini-2.5-flash"),
      system: SYSTEM_PROMPT,
      prompt: `Based on my recent workouts, suggest what I should do next. Return ONLY the JSON:\n\n${historyText}${userPreference}`,
      temperature: 0,
    });

    let jsonText = result.text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText
        .replace(/^```(?:json)?\s*\n/, "")
        .replace(/\n```\s*$/, "")
        .trim();
    }

    const suggestion = JSON.parse(jsonText);

    if (!suggestion.workoutName || !suggestion.exercises || !Array.isArray(suggestion.exercises)) {
      throw new Error("AI returned invalid structure");
    }

    return NextResponse.json({ suggestion });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (error.message.includes("429") ||
        error.message.includes("quota") ||
        error.message.includes("rate limit"))
    ) {
      return NextResponse.json(
        { error: "AI service rate limit reached. Please try again in a moment." },
        { status: 429 }
      );
    }

    if (error instanceof Error && error.message.includes("API key")) {
      return NextResponse.json(
        { error: "AI service configuration error." },
        { status: 500 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "AI returned an unexpected response. Please try again." },
        { status: 500 }
      );
    }

    console.error("AI suggest error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestion. Please try again." },
      { status: 500 }
    );
  }
}
