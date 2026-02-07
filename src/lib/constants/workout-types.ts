export const WORKOUT_TYPES = [
  { value: "strength", label: "Strength Training" },
  { value: "cardio", label: "Cardio" },
  { value: "flexibility", label: "Flexibility" },
  { value: "hiit", label: "HIIT" },
  { value: "sports", label: "Sports" },
  { value: "other", label: "Other" },
] as const;

export const WEIGHT_UNITS = [
  { value: "kg", label: "kg" },
  { value: "lbs", label: "lbs" },
] as const;

export type WorkoutType = (typeof WORKOUT_TYPES)[number]["value"];
export type WeightUnit = (typeof WEIGHT_UNITS)[number]["value"];
