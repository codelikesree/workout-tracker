import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connection";
import { CustomExercise } from "@/lib/db/models/custom-exercise";
import { EXERCISES } from "@/lib/constants/exercises";

const SYSTEM_NAMES_LOWER = new Set(
  EXERCISES.map((ex) => ex.name.toLowerCase())
);

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const exercises = await CustomExercise.find({ userId })
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({ exercises });
  } catch (error) {
    console.error("GET /api/exercises error:", error);
    return NextResponse.json(
      { error: "Failed to fetch exercises" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const name: string =
      typeof body.name === "string" ? body.name.trim() : "";
    const bodyPart: string =
      typeof body.bodyPart === "string" ? body.bodyPart.trim() : "";

    if (!name) {
      return NextResponse.json(
        { error: "Exercise name is required" },
        { status: 400 }
      );
    }
    if (!bodyPart) {
      return NextResponse.json(
        { error: "Body part is required" },
        { status: 400 }
      );
    }

    // Prevent shadowing a system exercise
    if (SYSTEM_NAMES_LOWER.has(name.toLowerCase())) {
      return NextResponse.json(
        { error: "An exercise with this name already exists in the built-in list" },
        { status: 409 }
      );
    }

    await connectDB();

    const exercise = await CustomExercise.create({ userId, name, bodyPart });

    return NextResponse.json({ exercise }, { status: 201 });
  } catch (error: unknown) {
    // Mongoose duplicate key
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { error: "You already have a custom exercise with this name" },
        { status: 409 }
      );
    }
    console.error("POST /api/exercises error:", error);
    return NextResponse.json(
      { error: "Failed to create exercise" },
      { status: 500 }
    );
  }
}
