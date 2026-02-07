import mongoose, { Schema, Document, Model } from "mongoose";
import { WorkoutType } from "./workout-log";

export interface ITemplateExercise {
  name: string;
  targetSets: number;
  targetReps: number;
  targetWeight?: number;
  weightUnit: "kg" | "lbs";
  restTime?: number;
  notes?: string;
}

export interface ITemplate extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  type: WorkoutType;
  exercises: ITemplateExercise[];
  estimatedDuration?: number;
  isPublic: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateExerciseSchema = new Schema<ITemplateExercise>(
  {
    name: { type: String, required: true, trim: true },
    targetSets: { type: Number, required: true, min: 1 },
    targetReps: { type: Number, required: true, min: 1 },
    targetWeight: { type: Number, min: 0 },
    weightUnit: { type: String, enum: ["kg", "lbs"], default: "kg" },
    restTime: { type: Number, min: 0 },
    notes: { type: String, maxlength: 200 },
  },
  { _id: false }
);

const TemplateSchema = new Schema<ITemplate>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Template name is required"],
      trim: true,
      maxlength: [100, "Template name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    type: {
      type: String,
      enum: ["strength", "cardio", "flexibility", "hiit", "sports", "other"],
      required: [true, "Workout type is required"],
    },
    exercises: {
      type: [TemplateExerciseSchema],
      required: true,
      validate: {
        validator: (v: ITemplateExercise[]) => v.length > 0,
        message: "At least one exercise is required",
      },
    },
    estimatedDuration: {
      type: Number,
      min: [0, "Duration must be positive"],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for user's templates
TemplateSchema.index({ userId: 1, name: 1 });

export const Template: Model<ITemplate> =
  mongoose.models.Template || mongoose.model<ITemplate>("Template", TemplateSchema);
