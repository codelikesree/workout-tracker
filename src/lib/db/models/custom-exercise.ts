import mongoose, { Schema, Document, Model } from "mongoose";
import type { BodyPart } from "@/lib/constants/exercises";

export interface ICustomExercise extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  bodyPart: BodyPart;
  createdAt: Date;
  updatedAt: Date;
}

const CustomExerciseSchema = new Schema<ICustomExercise>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Exercise name is required"],
      trim: true,
      minlength: [1, "Exercise name cannot be empty"],
      maxlength: [100, "Exercise name cannot exceed 100 characters"],
    },
    bodyPart: {
      type: String,
      required: [true, "Body part is required"],
      enum: [
        "chest",
        "back",
        "shoulders",
        "legs",
        "biceps",
        "triceps",
        "core",
        "full_body",
        "cardio",
        "other",
      ],
    },
  },
  { timestamps: true }
);

// Unique name per user (case-insensitive via collation on the index)
CustomExerciseSchema.index({ userId: 1, name: 1 }, { unique: true });

const CustomExercise: Model<ICustomExercise> =
  mongoose.models.CustomExercise ||
  mongoose.model<ICustomExercise>("CustomExercise", CustomExerciseSchema);

export { CustomExercise };
