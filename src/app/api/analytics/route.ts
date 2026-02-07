import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { WorkoutLog } from "@/lib/db/models/workout-log";
import { Template } from "@/lib/db/models/template";
import { getCurrentUserId } from "@/lib/auth/session";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
  eachDayOfInterval,
  format,
} from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "week"; // week, month, all

    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case "week":
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case "month":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "all":
        startDate = new Date("2000-01-01");
        break;
      default:
        startDate = startOfWeek(now, { weekStartsOn: 1 });
    }

    // Get workouts for the period
    const workouts = await WorkoutLog.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    })
      .sort({ date: 1 })
      .lean();

    // Calculate stats
    const totalWorkouts = workouts.length;
    const totalExercises = workouts.reduce(
      (acc, w) => acc + w.exercises.length,
      0
    );
    const totalSets = workouts.reduce(
      (acc, w) =>
        acc + w.exercises.reduce((eAcc, e) => eAcc + e.sets.length, 0),
      0
    );
    const totalDuration = workouts.reduce((acc, w) => acc + (w.duration || 0), 0);

    // Workout type breakdown
    const typeBreakdown = workouts.reduce((acc, w) => {
      acc[w.type] = (acc[w.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Daily workout counts for chart
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const dailyData = days.map((day) => {
      const dayWorkouts = workouts.filter(
        (w) =>
          format(new Date(w.date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
      );
      return {
        date: format(day, "yyyy-MM-dd"),
        label: format(day, "EEE"),
        workouts: dayWorkouts.length,
        exercises: dayWorkouts.reduce((acc, w) => acc + w.exercises.length, 0),
        sets: dayWorkouts.reduce(
          (acc, w) =>
            acc + w.exercises.reduce((eAcc, e) => eAcc + e.sets.length, 0),
          0
        ),
      };
    });

    // Weekly comparison (current vs previous)
    const prevStartDate =
      period === "week"
        ? subWeeks(startDate, 1)
        : period === "month"
        ? subMonths(startDate, 1)
        : startDate;
    const prevEndDate = period === "week" ? subWeeks(endDate, 1) : subMonths(endDate, 1);

    const prevWorkouts = await WorkoutLog.find({
      userId,
      date: { $gte: prevStartDate, $lte: prevEndDate },
    }).lean();

    const comparison = {
      current: totalWorkouts,
      previous: prevWorkouts.length,
      change:
        prevWorkouts.length > 0
          ? ((totalWorkouts - prevWorkouts.length) / prevWorkouts.length) * 100
          : totalWorkouts > 0
          ? 100
          : 0,
    };

    // Get streak
    const allWorkouts = await WorkoutLog.find({ userId })
      .sort({ date: -1 })
      .select("date")
      .lean();

    let streak = 0;
    if (allWorkouts.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let currentDay = today;
      for (const workout of allWorkouts) {
        const workoutDate = new Date(workout.date);
        workoutDate.setHours(0, 0, 0, 0);

        const diffDays = Math.floor(
          (currentDay.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays <= 1) {
          streak++;
          currentDay = workoutDate;
        } else {
          break;
        }
      }
    }

    // Get template count
    const templateCount = await Template.countDocuments({ userId });

    return NextResponse.json({
      stats: {
        totalWorkouts,
        totalExercises,
        totalSets,
        totalDuration,
        streak,
        templateCount,
      },
      typeBreakdown,
      dailyData,
      comparison,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
