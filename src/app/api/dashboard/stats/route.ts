import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { WorkoutLog } from "@/lib/db/models/workout-log";
import { Template } from "@/lib/db/models/template";
import { getCurrentUserId } from "@/lib/auth/session";
import { startOfWeek, startOfMonth } from "date-fns";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);

    const [thisWeek, thisMonth, templateCount, lastWorkout, allWorkouts] =
      await Promise.all([
        WorkoutLog.countDocuments({
          userId,
          date: { $gte: weekStart },
        }),
        WorkoutLog.countDocuments({
          userId,
          date: { $gte: monthStart },
        }),
        Template.countDocuments({ userId }),
        WorkoutLog.findOne({ userId })
          .sort({ date: -1 })
          .select("workoutName date _id")
          .lean(),
        WorkoutLog.find({ userId })
          .sort({ date: -1 })
          .select("date")
          .lean(),
      ]);

    // Calculate streak
    let streak = 0;
    if (allWorkouts.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let currentDay = today;
      for (const workout of allWorkouts) {
        const workoutDate = new Date(workout.date);
        workoutDate.setHours(0, 0, 0, 0);

        const diffDays = Math.floor(
          (currentDay.getTime() - workoutDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (diffDays <= 1) {
          streak++;
          currentDay = workoutDate;
        } else {
          break;
        }
      }
    }

    return NextResponse.json({
      thisWeek,
      thisMonth,
      streak,
      templateCount,
      lastWorkout: lastWorkout
        ? {
            name: lastWorkout.workoutName,
            date: lastWorkout.date,
            id: lastWorkout._id,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
