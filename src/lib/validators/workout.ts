import { z } from "zod";

export const exerciseSetSchema = z.object({
  setNumber: z.number().int().positive(),
  reps: z.number().int().min(0),
  weight: z.number().min(0),
  weightUnit: z.enum(["kg", "lbs"]).default("kg"),
  duration: z.number().min(0).optional(),
  distance: z.number().min(0).optional(),
  notes: z.string().max(200).optional(),
});

export const exerciseSchema = z.object({
  name: z.string().min(1, "Exercise name is required").max(100),
  sets: z.array(exerciseSetSchema).min(1, "At least one set is required"),
  restTime: z.number().min(0).optional(),
});

export const workoutTypeSchema = z.enum([
  "strength",
  "cardio",
  "flexibility",
  "hiit",
  "sports",
  "other",
]);

export const createWorkoutSchema = z.object({
  workoutName: z
    .string()
    .min(1, "Workout name is required")
    .max(100, "Workout name cannot exceed 100 characters"),
  type: workoutTypeSchema,
  date: z.string().or(z.date()).transform((val) => new Date(val)),
  exercises: z.array(exerciseSchema).min(1, "At least one exercise is required"),
  duration: z.number().min(0).optional(),
  notes: z.string().max(1000).optional(),
  templateId: z.string().optional(),
});

export const updateWorkoutSchema = createWorkoutSchema.partial();

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;
