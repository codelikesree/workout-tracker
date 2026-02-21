import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getCurrentUserId } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connection";
import { CustomExercise } from "@/lib/db/models/custom-exercise";
import { WorkoutLog } from "@/lib/db/models/workout-log";
import { Template } from "@/lib/db/models/template";
import { EXERCISES } from "@/lib/constants/exercises";

const SYSTEM_NAMES_LOWER = new Set(
  EXERCISES.map((ex) => ex.name.toLowerCase())
);

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid exercise ID" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));

    await connectDB();

    const exercise = await CustomExercise.findOne({
      _id: id,
      userId,
    });

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    const oldName = exercise.name;
    let updatedLogs = 0;
    let updatedTemplates = 0;

    // Apply updates
    if (typeof body.name === "string" && body.name.trim()) {
      const newName = body.name.trim();

      // Prevent shadowing a system exercise (unless same name as current)
      if (
        newName.toLowerCase() !== oldName.toLowerCase() &&
        SYSTEM_NAMES_LOWER.has(newName.toLowerCase())
      ) {
        return NextResponse.json(
          { error: "An exercise with this name already exists in the built-in list" },
          { status: 409 }
        );
      }

      exercise.name = newName;

      // Cascade rename if name actually changed
      if (newName !== oldName) {
        const userObjectId = new mongoose.Types.ObjectId(userId);

        const logResult = await WorkoutLog.updateMany(
          { userId: userObjectId, "exercises.name": oldName },
          { $set: { "exercises.$[elem].name": newName } },
          { arrayFilters: [{ "elem.name": oldName }] }
        );
        updatedLogs = logResult.modifiedCount;

        const templateResult = await Template.updateMany(
          { userId: userObjectId, "exercises.name": oldName },
          { $set: { "exercises.$[elem].name": newName } },
          { arrayFilters: [{ "elem.name": oldName }] }
        );
        updatedTemplates = templateResult.modifiedCount;
      }
    }

    if (typeof body.bodyPart === "string" && body.bodyPart.trim()) {
      exercise.bodyPart = body.bodyPart.trim() as typeof exercise.bodyPart;
    }

    await exercise.save();

    return NextResponse.json({ exercise, updatedLogs, updatedTemplates });
  } catch (error: unknown) {
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
    console.error("PATCH /api/exercises/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update exercise" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid exercise ID" }, { status: 400 });
    }

    await connectDB();

    const exercise = await CustomExercise.findOneAndDelete({ _id: id, userId });

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/exercises/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete exercise" },
      { status: 500 }
    );
  }
}
