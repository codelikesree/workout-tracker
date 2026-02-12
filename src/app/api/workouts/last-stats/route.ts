import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { WorkoutLog } from "@/lib/db/models/workout-log";
import { getCurrentUserId } from "@/lib/auth/session";
import mongoose from "mongoose";

// GET /api/workouts/last-stats?exercises=Bench+Press,Squat
export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const exercisesParam = searchParams.get("exercises");

    if (!exercisesParam) {
      return NextResponse.json(
        { error: "exercises query parameter is required" },
        { status: 400 }
      );
    }

    const exerciseNames = exercisesParam
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);

    if (exerciseNames.length === 0) {
      return NextResponse.json({ stats: {} });
    }

    await connectDB();

    // Aggregation: For each exercise name, find the most recent workout containing it
    const pipeline = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          "exercises.name": { $in: exerciseNames },
        },
      },
      { $sort: { date: -1 as const } },
      { $unwind: "$exercises" },
      {
        $match: {
          "exercises.name": { $in: exerciseNames },
        },
      },
      {
        $group: {
          _id: "$exercises.name",
          date: { $first: "$date" },
          sets: { $first: "$exercises.sets" },
        },
      },
    ];

    const results = await WorkoutLog.aggregate(pipeline);

    const stats: Record<
      string,
      {
        date: string;
        sets: Array<{
          setNumber: number;
          reps: number;
          weight: number;
          weightUnit: string;
        }>;
      }
    > = {};

    for (const result of results) {
      stats[result._id] = {
        date: result.date,
        sets: result.sets.map(
          (s: {
            setNumber: number;
            reps: number;
            weight: number;
            weightUnit: string;
          }) => ({
            setNumber: s.setNumber,
            reps: s.reps,
            weight: s.weight,
            weightUnit: s.weightUnit,
          })
        ),
      };
    }

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching last workout stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch last workout stats" },
      { status: 500 }
    );
  }
}
