import type { MockWorkout, MockTemplate } from "../helpers/api-mock";

// ── User credentials ──

export const TEST_USER = {
  username: "e2etester",
  email: "e2e@test.com",
  password: "Test1234!",
} as const;

export const SIGNUP_USER = {
  username: "newuser_e2e",
  email: "newuser@test.com",
  password: "NewPass123!",
} as const;

// ── Workout factories ──

let workoutCounter = 0;

export function createMockWorkout(overrides: Partial<MockWorkout> = {}): MockWorkout {
  workoutCounter++;
  return {
    _id: `workout_${workoutCounter}_${Date.now()}`,
    workoutName: `Test Workout ${workoutCounter}`,
    type: "strength",
    date: new Date().toISOString(),
    exercises: [
      {
        name: "Bench Press",
        bodyPart: "chest",
        sets: [
          { setNumber: 1, reps: 10, weight: 60, weightUnit: "kg" },
          { setNumber: 2, reps: 8, weight: 65, weightUnit: "kg" },
          { setNumber: 3, reps: 6, weight: 70, weightUnit: "kg" },
        ],
      },
      {
        name: "Squat",
        bodyPart: "legs",
        sets: [
          { setNumber: 1, reps: 10, weight: 80, weightUnit: "kg" },
          { setNumber: 2, reps: 8, weight: 90, weightUnit: "kg" },
        ],
      },
    ],
    duration: 45,
    ...overrides,
  };
}

// ── Template factories ──

let templateCounter = 0;

export function createMockTemplate(overrides: Partial<MockTemplate> = {}): MockTemplate {
  templateCounter++;
  return {
    _id: `template_${templateCounter}_${Date.now()}`,
    name: `Test Template ${templateCounter}`,
    description: "A test template for E2E testing",
    type: "strength",
    exercises: [
      { name: "Bench Press", targetSets: 3, targetReps: 10, targetWeight: 60, weightUnit: "kg" },
      { name: "Squat", targetSets: 3, targetReps: 8, targetWeight: 80, weightUnit: "kg" },
      { name: "Deadlift", targetSets: 3, targetReps: 5, targetWeight: 100, weightUnit: "kg" },
    ],
    estimatedDuration: 60,
    usageCount: 5,
    ...overrides,
  };
}

/** Create a batch of workouts for list/pagination testing */
export function createWorkoutBatch(count: number): MockWorkout[] {
  return Array.from({ length: count }, (_, i) =>
    createMockWorkout({
      workoutName: `Workout ${i + 1}`,
      date: new Date(Date.now() - i * 86_400_000).toISOString(),
      type: ["strength", "cardio", "hiit", "flexibility"][i % 4],
    })
  );
}

/** Create a batch of templates */
export function createTemplateBatch(count: number): MockTemplate[] {
  return Array.from({ length: count }, (_, i) =>
    createMockTemplate({
      name: `Template ${i + 1}`,
      type: ["strength", "cardio", "hiit"][i % 3],
      usageCount: Math.floor(Math.random() * 20),
    })
  );
}
