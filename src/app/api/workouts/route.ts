import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { WorkoutLog } from "@/lib/db/models/workout-log";
import { getCurrentUserId } from "@/lib/auth/session";
import { createWorkoutSchema } from "@/lib/validators/workout";
import { getBodyPartFromExerciseName } from "@/lib/constants/exercises";
import { User } from "@/lib/db/models/user";
import { estimateCalories, lbsToKg } from "@/lib/utils/calorie-estimator";

// GET /api/workouts - List all workouts for current user
export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const type = searchParams.get("type");

    // Build query
    const query: Record<string, unknown> = { userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        (query.date as Record<string, Date>).$gte = new Date(startDate);
      }
      if (endDate) {
        (query.date as Record<string, Date>).$lte = new Date(endDate);
      }
    }

    if (type) {
      query.type = type;
    }

    const skip = (page - 1) * limit;

    const [workouts, total] = await Promise.all([
      WorkoutLog.find(query).sort({ date: -1 }).skip(skip).limit(limit).lean(),
      WorkoutLog.countDocuments(query),
    ]);

    return NextResponse.json({
      workouts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching workouts:", error);
    return NextResponse.json(
      { error: "Failed to fetch workouts" },
      { status: 500 }
    );
  }
}

// POST /api/workouts - Create new workout
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate input
    const validationResult = createWorkoutSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    // Enrich exercises with body part information
    const exercisesWithBodyPart = validationResult.data.exercises.map((ex) => ({
      ...ex,
      bodyPart: getBodyPartFromExerciseName(ex.name),
    }));

    // Fetch user weight for calorie estimation
    const user = await User.findById(userId).select("weight weightUnit").lean();
    const bodyWeightKg = user?.weight
      ? user.weightUnit === "lbs"
        ? lbsToKg(user.weight)
        : user.weight
      : 70; // default fallback

    const estimatedCals = estimateCalories({
      workoutType: validationResult.data.type,
      durationMinutes: validationResult.data.duration ?? 0,
      exercises: exercisesWithBodyPart.map((ex) => ({
        bodyPart: ex.bodyPart,
        setCount: ex.sets.length,
      })),
      bodyWeightKg,
    });

    const workout = await WorkoutLog.create({
      ...validationResult.data,
      exercises: exercisesWithBodyPart,
      estimatedCalories: estimatedCals,
      userId,
    });

    return NextResponse.json({ workout }, { status: 201 });
  } catch (error) {
    console.error("Error creating workout:", error);
    return NextResponse.json(
      { error: "Failed to create workout" },
      { status: 500 }
    );
  }
}
