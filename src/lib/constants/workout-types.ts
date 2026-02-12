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

// ─── Numeric Constants ──────────────────────────────────────────────

export const DEFAULT_REST_TIME_SECONDS = 90;
export const DEFAULT_WEIGHT_STEP = 2.5;
export const RECENT_TEMPLATES_LIMIT = 4;
