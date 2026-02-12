export const BODY_PARTS = [
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "shoulders", label: "Shoulders" },
  { value: "legs", label: "Legs" },
  { value: "biceps", label: "Biceps" },
  { value: "triceps", label: "Triceps" },
  { value: "core", label: "Core" },
  { value: "full_body", label: "Full Body" },
  { value: "cardio", label: "Cardio" },
  { value: "other", label: "Other" },
] as const;

export type BodyPart = (typeof BODY_PARTS)[number]["value"];

export interface Exercise {
  name: string;
  bodyPart: BodyPart;
}

export const EXERCISES: Exercise[] = [
  // Chest
  { name: "Bench Press", bodyPart: "chest" },
  { name: "Dumbbell Bench Press", bodyPart: "chest" },
  { name: "Incline Bench Press", bodyPart: "chest" },
  { name: "Incline Dumbbell Bench Press", bodyPart: "chest" },
  { name: "Decline Bench Press", bodyPart: "chest" },
  { name: "Push Ups", bodyPart: "chest" },
  { name: "Close Grip Bench Press", bodyPart: "chest" },
  { name: "Smith Machine Bench Press", bodyPart: "chest" },
  { name: "Chest Press Machine", bodyPart: "chest" },
  { name: "Machine Chest Fly", bodyPart: "chest" },
  { name: "Dumbbell Fly", bodyPart: "chest" },
  { name: "Chest Fly", bodyPart: "chest" },
  { name: "Cable Crossover", bodyPart: "chest" },
  { name: "Dips (Chest)", bodyPart: "chest" },

  // Back
  { name: "Pull Ups", bodyPart: "back" },
  { name: "Chin Ups", bodyPart: "back" },
  { name: "Bent Over Row", bodyPart: "back" },
  { name: "Barbell Row", bodyPart: "back" },
  { name: "Dumbbell Row", bodyPart: "back" },
  { name: "Lat Pulldown", bodyPart: "back" },
  { name: "Seated Cable Row", bodyPart: "back" },
  { name: "T-Bar Row", bodyPart: "back" },
  { name: "Neutral Grip Pull Ups", bodyPart: "back" },
  { name: "Face Pulls", bodyPart: "back" },
  { name: "Straight Arm Pulldown", bodyPart: "back" },
  { name: "Pendlay Row", bodyPart: "back" },
  { name: "Meadows Row", bodyPart: "back" },

  // Shoulders
  { name: "Overhead Press", bodyPart: "shoulders" },
  { name: "Shoulder Press", bodyPart: "shoulders" },
  { name: "Dumbbell Shoulder Press", bodyPart: "shoulders" },
  { name: "Military Press", bodyPart: "shoulders" },
  { name: "Seated Shoulder Press", bodyPart: "shoulders" },
  { name: "Machine Shoulder Press", bodyPart: "shoulders" },
  { name: "Seated Dumbbell Shoulder Press", bodyPart: "shoulders" },
  { name: "Push Press", bodyPart: "shoulders" },
  { name: "Dumbbell Lateral Raise", bodyPart: "shoulders" },
  { name: "Lateral Raise", bodyPart: "shoulders" },
  { name: "Front Raise", bodyPart: "shoulders" },
  { name: "Rear Delt Fly", bodyPart: "shoulders" },
  { name: "Arnold Press", bodyPart: "shoulders" },
  { name: "Upright Row", bodyPart: "shoulders" },
  { name: "Barbell Shrug", bodyPart: "shoulders" },
  { name: "Dumbbell Shrug", bodyPart: "shoulders" },

  // Legs
  { name: "Squat", bodyPart: "legs" },
  { name: "Back Squat", bodyPart: "legs" },
  { name: "Front Squat", bodyPart: "legs" },
  { name: "Leg Press", bodyPart: "legs" },
  { name: "Sled Leg Press", bodyPart: "legs" },
  { name: "Horizontal Leg Press", bodyPart: "legs" },
  { name: "Hack Squat", bodyPart: "legs" },
  { name: "Leg Extension", bodyPart: "legs" },
  { name: "Leg Curl", bodyPart: "legs" },
  { name: "Seated Leg Curl", bodyPart: "legs" },
  { name: "Lying Leg Curl", bodyPart: "legs" },
  { name: "Standing Leg Curl", bodyPart: "legs" },
  { name: "Romanian Deadlift", bodyPart: "legs" },
  { name: "Stiff Leg Deadlift", bodyPart: "legs" },
  { name: "Hip Thrust", bodyPart: "legs" },
  { name: "Glute Bridge", bodyPart: "legs" },
  { name: "Bulgarian Split Squat", bodyPart: "legs" },
  { name: "Dumbbell Bulgarian Split Squat", bodyPart: "legs" },
  { name: "Goblet Squat", bodyPart: "legs" },
  { name: "Bodyweight Squat", bodyPart: "legs" },
  { name: "Lunges", bodyPart: "legs" },
  { name: "Walking Lunges", bodyPart: "legs" },
  { name: "Glute Kickback", bodyPart: "legs" },
  { name: "Hip Adduction", bodyPart: "legs" },
  { name: "Hip Abduction", bodyPart: "legs" },
  { name: "Calf Raise", bodyPart: "legs" },
  { name: "Machine Calf Raise", bodyPart: "legs" },
  { name: "Seated Calf Raise", bodyPart: "legs" },
  { name: "Standing Calf Raise", bodyPart: "legs" },

  // Biceps
  { name: "Barbell Curl", bodyPart: "biceps" },
  { name: "Dumbbell Curl", bodyPart: "biceps" },
  { name: "Hammer Curl", bodyPart: "biceps" },
  { name: "EZ Bar Curl", bodyPart: "biceps" },
  { name: "Preacher Curl", bodyPart: "biceps" },
  { name: "Incline Dumbbell Curl", bodyPart: "biceps" },
  { name: "Concentration Curl", bodyPart: "biceps" },
  { name: "Cable Curl", bodyPart: "biceps" },
  { name: "Spider Curl", bodyPart: "biceps" },

  // Triceps
  { name: "Tricep Pushdown", bodyPart: "triceps" },
  { name: "Rope Pushdown", bodyPart: "triceps" },
  { name: "Dips (Triceps)", bodyPart: "triceps" },
  { name: "Close Grip Bench Press", bodyPart: "triceps" },
  { name: "Lying Tricep Extension", bodyPart: "triceps" },
  { name: "Skull Crushers", bodyPart: "triceps" },
  { name: "Overhead Tricep Extension", bodyPart: "triceps" },
  { name: "Tricep Extension Machine", bodyPart: "triceps" },
  { name: "Tricep Kickback", bodyPart: "triceps" },
  { name: "Diamond Push Ups", bodyPart: "triceps" },

  // Core
  { name: "Ab Crunch Machine", bodyPart: "core" },
  { name: "Crunches", bodyPart: "core" },
  { name: "Sit Ups", bodyPart: "core" },
  { name: "Plank", bodyPart: "core" },
  { name: "Side Plank", bodyPart: "core" },
  { name: "Leg Raise", bodyPart: "core" },
  { name: "Hanging Leg Raise", bodyPart: "core" },
  { name: "Ab Wheel Rollout", bodyPart: "core" },
  { name: "Russian Twist", bodyPart: "core" },
  { name: "Cable Crunch", bodyPart: "core" },
  { name: "Dead Bug", bodyPart: "core" },
  { name: "Mountain Climbers", bodyPart: "core" },
  { name: "Bicycle Crunches", bodyPart: "core" },

  // Full Body / Compound
  { name: "Deadlift", bodyPart: "full_body" },
  { name: "Conventional Deadlift", bodyPart: "full_body" },
  { name: "Sumo Deadlift", bodyPart: "full_body" },
  { name: "Hex Bar Deadlift", bodyPart: "full_body" },
  { name: "Trap Bar Deadlift", bodyPart: "full_body" },
  { name: "Power Clean", bodyPart: "full_body" },
  { name: "Clean", bodyPart: "full_body" },
  { name: "Clean and Jerk", bodyPart: "full_body" },
  { name: "Snatch", bodyPart: "full_body" },
  { name: "Muscle Ups", bodyPart: "full_body" },
  { name: "Burpees", bodyPart: "full_body" },
  { name: "Thrusters", bodyPart: "full_body" },
  { name: "Kettlebell Swing", bodyPart: "full_body" },
  { name: "Turkish Get Up", bodyPart: "full_body" },
  { name: "Farmers Walk", bodyPart: "full_body" },

  // Cardio
  { name: "Running", bodyPart: "cardio" },
  { name: "Treadmill", bodyPart: "cardio" },
  { name: "Cycling", bodyPart: "cardio" },
  { name: "Stationary Bike", bodyPart: "cardio" },
  { name: "Rowing Machine", bodyPart: "cardio" },
  { name: "Elliptical", bodyPart: "cardio" },
  { name: "Stair Climber", bodyPart: "cardio" },
  { name: "Jump Rope", bodyPart: "cardio" },
  { name: "Swimming", bodyPart: "cardio" },
  { name: "Walking", bodyPart: "cardio" },
  { name: "Sprints", bodyPart: "cardio" },
  { name: "Box Jumps", bodyPart: "cardio" },
  { name: "Battle Ropes", bodyPart: "cardio" },
];

// Helper to get exercises by body part
export function getExercisesByBodyPart(bodyPart: BodyPart): Exercise[] {
  return EXERCISES.filter((ex) => ex.bodyPart === bodyPart);
}

// Helper to get body part label
export function getBodyPartLabel(bodyPart: BodyPart): string {
  return BODY_PARTS.find((bp) => bp.value === bodyPart)?.label || bodyPart;
}

// Group exercises by body part for dropdown display
export function getExercisesGroupedByBodyPart(): Record<BodyPart, Exercise[]> {
  return EXERCISES.reduce((acc, exercise) => {
    if (!acc[exercise.bodyPart]) {
      acc[exercise.bodyPart] = [];
    }
    acc[exercise.bodyPart].push(exercise);
    return acc;
  }, {} as Record<BodyPart, Exercise[]>);
}
