import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Template } from "@/lib/db/models/template";
import { getCurrentUserId } from "@/lib/auth/session";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/templates/[id]/use - Load template as workout-ready payload & increment usage
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid template ID" }, { status: 400 });
    }

    await connectDB();

    // Atomically increment usageCount and return the template
    const template = await Template.findOneAndUpdate(
      { _id: id, userId },
      { $inc: { usageCount: 1 } },
      { new: true }
    ).lean();

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Convert template exercises into workout-ready format with expanded sets
    const exercises = template.exercises.map((ex) => ({
      name: ex.name,
      sets: Array.from({ length: ex.targetSets }, (_, i) => ({
        setNumber: i + 1,
        reps: ex.targetReps,
        weight: ex.targetWeight || 0,
        weightUnit: ex.weightUnit || "kg",
      })),
    }));

    return NextResponse.json({
      workoutName: template.name,
      type: template.type,
      exercises,
      duration: template.estimatedDuration || undefined,
    });
  } catch (error) {
    console.error("Error using template:", error);
    return NextResponse.json(
      { error: "Failed to load template" },
      { status: 500 }
    );
  }
}
