import mongoose, { Schema, Document, Model } from "mongoose";

export type WorkoutType =
  | "strength"
  | "cardio"
  | "flexibility"
  | "hiit"
  | "sports"
  | "other";

export interface IExerciseSet {
  setNumber: number;
  reps: number;
  weight: number;
  weightUnit: "kg" | "lbs";
  duration?: number;
  distance?: number;
  notes?: string;
}

export interface IExercise {
  name: string;
  sets: IExerciseSet[];
  restTime?: number;
}

export interface IWorkoutLog extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  workoutName: string;
  type: WorkoutType;
  date: Date;
  exercises: IExercise[];
  duration?: number;
  notes?: string;
  templateId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSetSchema = new Schema<IExerciseSet>(
  {
    setNumber: { type: Number, required: true },
    reps: { type: Number, required: true, min: 0 },
    weight: { type: Number, required: true, min: 0 },
    weightUnit: { type: String, enum: ["kg", "lbs"], default: "kg" },
    duration: { type: Number, min: 0 },
    distance: { type: Number, min: 0 },
    notes: { type: String, maxlength: 200 },
  },
  { _id: false }
);

const ExerciseSchema = new Schema<IExercise>(
  {
    name: { type: String, required: true, trim: true },
    sets: { type: [ExerciseSetSchema], required: true },
    restTime: { type: Number, min: 0 },
  },
  { _id: false }
);

const WorkoutLogSchema = new Schema<IWorkoutLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    workoutName: {
      type: String,
      required: [true, "Workout name is required"],
      trim: true,
      maxlength: [100, "Workout name cannot exceed 100 characters"],
    },
    type: {
      type: String,
      enum: ["strength", "cardio", "flexibility", "hiit", "sports", "other"],
      required: [true, "Workout type is required"],
    },
    date: {
      type: Date,
      required: [true, "Workout date is required"],
      index: true,
    },
    exercises: {
      type: [ExerciseSchema],
      required: true,
      validate: {
        validator: (v: IExercise[]) => v.length > 0,
        message: "At least one exercise is required",
      },
    },
    duration: {
      type: Number,
      min: [0, "Duration must be positive"],
    },
    notes: {
      type: String,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: "Template",
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
WorkoutLogSchema.index({ userId: 1, date: -1 });
WorkoutLogSchema.index({ userId: 1, type: 1 });
WorkoutLogSchema.index({ userId: 1, date: 1, type: 1 });

export const WorkoutLog: Model<IWorkoutLog> =
  mongoose.models.WorkoutLog ||
  mongoose.model<IWorkoutLog>("WorkoutLog", WorkoutLogSchema);
