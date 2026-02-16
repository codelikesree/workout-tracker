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
  addWeeks,
} from "date-fns";
import { getBodyPartLabel, type BodyPart } from "@/lib/constants/exercises";
import type {
  VolumeMetrics,
  PersonalRecord,
  BodyPartBalance,
  ProgressionData,
} from "@/lib/types/api";

// ─── Volume Calculation Helpers ──────────────────────────────────────────

function normalizeWeightToKg(weight: number, unit: "kg" | "lbs"): number {
  return unit === "lbs" ? weight * 0.453592 : weight;
}

function calculateSetVolume(set: { reps: number; weight: number; weightUnit: "kg" | "lbs" }): number {
  const weightKg = normalizeWeightToKg(set.weight, set.weightUnit);
  return set.reps * weightKg;
}

function calculateExerciseVolume(exercise: { sets: any[] }): number {
  return exercise.sets.reduce((total, set) => total + calculateSetVolume(set), 0);
}

function calculateWorkoutVolume(workout: { exercises: any[] }): number {
  return workout.exercises.reduce((total, ex) => total + calculateExerciseVolume(ex), 0);
}

// ─── PR Tracking ─────────────────────────────────────────────────────────

function getExercisePRs(workouts: any[], currentPeriodStart: Date): PersonalRecord[] {
  const exerciseMaxes = new Map<string, any>();

  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise: any) => {
      exercise.sets.forEach((set: any) => {
        const key = exercise.name.toLowerCase();
        const existing = exerciseMaxes.get(key);
        const weightKg = normalizeWeightToKg(set.weight, set.weightUnit);
        const existingWeightKg = existing ? normalizeWeightToKg(existing.weight, existing.weightUnit) : 0;

        if (!existing || weightKg > existingWeightKg) {
          exerciseMaxes.set(key, {
            exerciseName: exercise.name,
            weight: set.weight,
            weightUnit: set.weightUnit,
            reps: set.reps,
            date: workout.date,
          });
        }
      });
    });
  });

  return Array.from(exerciseMaxes.values())
    .map((record) => ({
      ...record,
      date: record.date.toISOString(),
      isNewPR: record.date >= currentPeriodStart,
    }))
    .sort((a, b) => {
      if (a.isNewPR !== b.isNewPR) return a.isNewPR ? -1 : 1;
      return normalizeWeightToKg(b.weight, b.weightUnit) - normalizeWeightToKg(a.weight, a.weightUnit);
    })
    .slice(0, 10);
}

// ─── Weekly Volume Data ──────────────────────────────────────────────────

function getWeeklyVolumeData(workouts: any[], startDate: Date, endDate: Date) {
  const weeks = new Map<string, { start: Date; end: Date; volume: number }>();
  let currentWeekStart = startOfWeek(startDate, { weekStartsOn: 1 });

  while (currentWeekStart <= endDate) {
    const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    const key = format(currentWeekStart, "yyyy-MM-dd");
    weeks.set(key, { start: currentWeekStart, end: currentWeekEnd, volume: 0 });

    workouts.forEach((workout: any) => {
      if (workout.date >= currentWeekStart && workout.date <= currentWeekEnd) {
        weeks.get(key)!.volume += calculateWorkoutVolume(workout);
      }
    });

    currentWeekStart = addWeeks(currentWeekStart, 1);
  }

  return Array.from(weeks.entries()).map(([key, data], index) => ({
    weekLabel: `Week ${index + 1}`,
    weekStart: data.start.toISOString(),
    weekEnd: data.end.toISOString(),
    volume: Math.round(data.volume),
  }));
}

// ─── Body Part Balance ───────────────────────────────────────────────────

function calculateBodyPartBalance(workouts: any[]): BodyPartBalance[] {
  const bodyPartVolumes = new Map<string, number>();

  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise: any) => {
      if (exercise.bodyPart) {
        const volume = calculateExerciseVolume(exercise);
        bodyPartVolumes.set(exercise.bodyPart, (bodyPartVolumes.get(exercise.bodyPart) || 0) + volume);
      }
    });
  });

  const totalVolume = Array.from(bodyPartVolumes.values()).reduce((sum, v) => sum + v, 0);
  const averageVolume = totalVolume / (bodyPartVolumes.size || 1);

  return Array.from(bodyPartVolumes.entries())
    .map(([bodyPart, volume]) => ({
      bodyPart,
      volume: Math.round(volume),
      percentage: Math.round((volume / totalVolume) * 1000) / 10,
      isUnderworked: volume < averageVolume * 0.7,
    }))
    .sort((a, b) => b.volume - a.volume);
}

// ─── Progressive Overload ────────────────────────────────────────────────

function calculateTopProgressions(currentWorkouts: any[], previousWorkouts: any[]): ProgressionData[] {
  const getVolumeByExercise = (workouts: any[]) => {
    const volumes = new Map<string, number>();
    workouts.forEach((workout) => {
      workout.exercises.forEach((exercise: any) => {
        const key = exercise.name.toLowerCase();
        volumes.set(key, (volumes.get(key) || 0) + calculateExerciseVolume(exercise));
      });
    });
    return volumes;
  };

  const current = getVolumeByExercise(currentWorkouts);
  const previous = getVolumeByExercise(previousWorkouts);
  const progressions: ProgressionData[] = [];

  current.forEach((currentVolume, exerciseName) => {
    const previousVolume = previous.get(exerciseName);
    if (previousVolume && previousVolume > 0) {
      const increase = ((currentVolume - previousVolume) / previousVolume) * 100;
      if (increase > 0) {
        progressions.push({
          exerciseName,
          volumeIncrease: Math.round(increase * 10) / 10,
          previousVolume: Math.round(previousVolume),
          currentVolume: Math.round(currentVolume),
        });
      }
    }
  });

  return progressions.sort((a, b) => b.volumeIncrease - a.volumeIncrease).slice(0, 5);
}

// ─── Recommendations ─────────────────────────────────────────────────────

function generateRecommendations(balance: BodyPartBalance[], progressions: ProgressionData[]): string[] {
  const recommendations: string[] = [];

  const underworked = balance.filter((bp) => bp.isUnderworked);
  if (underworked.length > 0) {
    const bodyParts = underworked.map((bp) => getBodyPartLabel(bp.bodyPart as BodyPart)).join(", ");
    recommendations.push(`Consider increasing volume for: ${bodyParts} (currently underworked)`);
  }

  if (progressions.length === 0) {
    recommendations.push("Focus on progressive overload: aim to increase weight or reps each week");
  } else {
    recommendations.push(`Great progress on ${progressions[0].exerciseName}! Keep up the progressive overload`);
  }

  const topBodyPart = balance[0];
  const bottomBodyPart = balance[balance.length - 1];
  if (topBodyPart && bottomBodyPart) {
    const ratio = topBodyPart.volume / (bottomBodyPart.volume || 1);
    if (ratio > 3) {
      recommendations.push(
        `Balance your training: ${getBodyPartLabel(topBodyPart.bodyPart as BodyPart)} has ${ratio.toFixed(1)}x more volume than ${getBodyPartLabel(bottomBodyPart.bodyPart as BodyPart)}`
      );
    }
  }

  return recommendations;
}

// ─── API Handler ─────────────────────────────────────────────────────────

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

    // Body part breakdown (count of exercises per body part)
    const bodyPartBreakdown = workouts.reduce((acc, w) => {
      w.exercises.forEach((ex) => {
        if (ex.bodyPart) {
          acc[ex.bodyPart] = (acc[ex.bodyPart] || 0) + ex.sets.length;
        }
      });
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

    // ─── Enhanced Analytics Calculations ─────────────────────────────────

    // Calculate volume metrics
    const totalVolume = workouts.reduce((sum, w) => sum + calculateWorkoutVolume(w), 0);
    const previousTotalVolume = prevWorkouts.reduce((sum, w) => sum + calculateWorkoutVolume(w), 0);
    const volumeTrend = previousTotalVolume > 0
      ? ((totalVolume - previousTotalVolume) / previousTotalVolume) * 100
      : totalVolume > 0 ? 100 : 0;

    // Get all user workouts for PR tracking
    const allUserWorkouts = await WorkoutLog.find({ userId }).sort({ date: 1 }).lean();

    const volumeMetrics: VolumeMetrics = {
      totalVolume: Math.round(totalVolume),
      volumeUnit: "kg",
      volumeTrend: Math.round(volumeTrend * 10) / 10,
      weeklyVolumeData: period === "all" ? [] : getWeeklyVolumeData(workouts, startDate, endDate),
    };

    const personalRecords = getExercisePRs(allUserWorkouts, startDate);
    const bodyPartBalance = calculateBodyPartBalance(workouts);
    const topProgressions = calculateTopProgressions(workouts, prevWorkouts);
    const recommendations = generateRecommendations(bodyPartBalance, topProgressions);

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
      bodyPartBreakdown,
      dailyData,
      comparison,
      volumeMetrics,
      personalRecords,
      bodyPartBalance,
      topProgressions,
      recommendations,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
