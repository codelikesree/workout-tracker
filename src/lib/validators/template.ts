import { z } from "zod";
import { workoutTypeSchema } from "./workout";

export const templateExerciseSchema = z.object({
  name: z.string().min(1, "Exercise name is required").max(100),
  targetSets: z.number().int().positive("Target sets must be at least 1"),
  targetReps: z.number().int().positive("Target reps must be at least 1"),
  targetWeight: z.number().min(0).optional(),
  weightUnit: z.enum(["kg", "lbs"]).default("kg"),
  restTime: z.number().min(0).optional(),
  notes: z.string().max(200).optional(),
});

export const createTemplateSchema = z.object({
  name: z
    .string()
    .min(1, "Template name is required")
    .max(100, "Template name cannot exceed 100 characters"),
  description: z.string().max(500).optional(),
  type: workoutTypeSchema,
  exercises: z
    .array(templateExerciseSchema)
    .min(1, "At least one exercise is required"),
  estimatedDuration: z.number().min(0).optional(),
});

export const updateTemplateSchema = createTemplateSchema.partial();

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
