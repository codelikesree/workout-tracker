import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Template } from "@/lib/db/models/template";
import { WorkoutLog } from "@/lib/db/models/workout-log";
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

    // Fetch last workout stats for all exercises in this template
    const exerciseNames = template.exercises.map((ex) => ex.name);
    const lastStats: Record<
      string,
      Array<{ reps: number; weight: number; weightUnit: string }>
    > = {};

    if (exerciseNames.length > 0) {
      const pipeline = [
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            "exercises.name": { $in: exerciseNames },
          },
        },
        { $sort: { date: -1 as const } },
        { $unwind: "$exercises" },
        { $match: { "exercises.name": { $in: exerciseNames } } },
        {
          $group: {
            _id: "$exercises.name",
            sets: { $first: "$exercises.sets" },
          },
        },
      ];

      const results = await WorkoutLog.aggregate(pipeline);
      for (const result of results) {
        lastStats[result._id] = result.sets.map(
          (s: { reps: number; weight: number; weightUnit: string }) => ({
            reps: s.reps,
            weight: s.weight,
            weightUnit: s.weightUnit,
          })
        );
      }
    }

    // Convert template exercises into workout-ready format
    // Use last logged values when available, fall back to template defaults
    const exercises = template.exercises.map((ex) => {
      const lastSets = lastStats[ex.name];

      return {
        name: ex.name,
        sets: Array.from({ length: ex.targetSets }, (_, i) => {
          const lastSet = lastSets?.[i];
          return {
            setNumber: i + 1,
            reps: lastSet?.reps ?? ex.targetReps,
            weight: lastSet?.weight ?? ex.targetWeight ?? 0,
            weightUnit: lastSet?.weightUnit ?? ex.weightUnit ?? "kg",
          };
        }),
      };
    });

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
