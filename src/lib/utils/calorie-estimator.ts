/**
 * Calorie burn estimation using MET (Metabolic Equivalent of Task) values.
 *
 * Formula: calories = MET × bodyWeightKg × (durationMinutes / 60)
 *
 * MET values are approximate and based on the Compendium of Physical Activities.
 * For strength workouts, a weighted-average MET is computed by body part.
 */

export interface ExerciseForCalories {
  bodyPart?: string;
  setCount: number;
}

export interface CalorieEstimationInput {
  workoutType: string;
  durationMinutes: number;
  exercises: ExerciseForCalories[];
  bodyWeightKg: number;
}

const STRENGTH_BODY_PART_MET: Record<string, number> = {
  legs: 5.0,
  back: 4.5,
  chest: 4.5,
  full_body: 5.5,
  shoulders: 4.0,
  biceps: 3.5,
  triceps: 3.5,
  core: 3.8,
  cardio: 8.0,
  other: 4.0,
};

const WORKOUT_TYPE_MET: Record<string, number> = {
  cardio: 8.0,
  hiit: 9.0,
  flexibility: 2.5,
  sports: 7.0,
  other: 4.0,
};

const DEFAULT_STRENGTH_MET = 4.0;

export function estimateCalories(input: CalorieEstimationInput): number {
  const { workoutType, durationMinutes, exercises, bodyWeightKg } = input;

  if (durationMinutes <= 0 || bodyWeightKg <= 0) return 0;

  let met: number;

  if (workoutType === "strength") {
    // Weighted average MET by body part, weighted by set count
    let totalSets = 0;
    let weightedMetSum = 0;

    for (const ex of exercises) {
      const bodyPartMet =
        STRENGTH_BODY_PART_MET[ex.bodyPart ?? "other"] ?? DEFAULT_STRENGTH_MET;
      weightedMetSum += bodyPartMet * ex.setCount;
      totalSets += ex.setCount;
    }

    met = totalSets > 0 ? weightedMetSum / totalSets : DEFAULT_STRENGTH_MET;
  } else {
    met = WORKOUT_TYPE_MET[workoutType] ?? WORKOUT_TYPE_MET.other;
  }

  const durationHours = durationMinutes / 60;
  return Math.round(met * bodyWeightKg * durationHours);
}

export function lbsToKg(lbs: number): number {
  return lbs * 0.453592;
}
