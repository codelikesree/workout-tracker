import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { WorkoutLog } from "@/lib/db/models/workout-log";
import { getCurrentUserId } from "@/lib/auth/session";
import { parseWorkoutText } from "@/lib/utils/import-parser";

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Please provide workout text to import" },
        { status: 400 }
      );
    }

    const parsed = parseWorkoutText(text);

    if (!parsed || parsed.length === 0) {
      return NextResponse.json(
        {
          error:
            "No exercises found. Make sure your text contains known exercise names with numbers (e.g., Bench Press 3x10 @ 80kg). Typos are OK — we fuzzy-match against 165+ exercises.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const workouts = await WorkoutLog.insertMany(
      parsed.map((w) => ({
        ...w,
        userId,
      }))
    );

    return NextResponse.json({ workouts }, { status: 201 });
  } catch (error) {
    console.error("Error importing workout:", error);
    return NextResponse.json(
      { error: "Failed to import workout" },
      { status: 500 }
    );
  }
}
