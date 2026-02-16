#!/usr/bin/env tsx

/**
 * Migration Script: Add Body Part to Existing Workouts
 *
 * This script updates all existing workout logs to include body part information
 * for each exercise based on the exercise name.
 *
 * Usage:
 *   npm run migrate:body-parts
 *
 * Or directly with tsx:
 *   npx tsx scripts/migrate-body-parts.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import mongoose from "mongoose";
import { WorkoutLog } from "../src/lib/db/models/workout-log";
import { getBodyPartFromExerciseName } from "../src/lib/constants/exercises";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;
if (!MONGODB_URI) {
  console.error(
    "❌ Error: MONGODB_URI or DATABASE_URL environment variable is not set",
  );
  console.error("   Make sure .env.local exists with MONGODB_URI or DATABASE_URL");
  process.exit(1);
}

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

async function migrateBodyParts() {
  console.log("\n🚀 Starting body part migration...\n");

  try {
    await connectDB();

    // Find all workouts
    const workouts = await WorkoutLog.find({}).lean();
    console.log(`📊 Found ${workouts.length} total workouts to process\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Process each workout
    for (const workout of workouts) {
      try {
        let hasChanges = false;
        const updatedExercises = workout.exercises.map((exercise) => {
          // Skip if already has bodyPart
          if (exercise.bodyPart) {
            return exercise;
          }

          // Get body part from exercise name
          const bodyPart = getBodyPartFromExerciseName(exercise.name);

          if (bodyPart) {
            hasChanges = true;
            return { ...exercise, bodyPart };
          }

          return exercise;
        });

        // Update if changes were made
        if (hasChanges) {
          await WorkoutLog.updateOne(
            { _id: workout._id },
            { $set: { exercises: updatedExercises } },
          );
          updatedCount++;
          console.log(
            `✓ Updated workout: ${workout.workoutName} (${new Date(workout.date).toLocaleDateString()})`,
          );
        } else {
          skippedCount++;
        }
      } catch (error) {
        errorCount++;
        console.error(`✗ Error updating workout ${workout._id}:`, error);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📈 Migration Summary:");
    console.log("=".repeat(60));
    console.log(`Total workouts processed: ${workouts.length}`);
    console.log(`✅ Successfully updated: ${updatedCount}`);
    console.log(`⏭️  Skipped (already migrated): ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log("=".repeat(60) + "\n");

    // Show sample of exercises without body part matches
    console.log("🔍 Checking for exercises without body part matches...\n");

    const allWorkouts = await WorkoutLog.find({}).lean();
    const exercisesWithoutBodyPart = new Set<string>();

    for (const workout of allWorkouts) {
      for (const exercise of workout.exercises) {
        if (!exercise.bodyPart) {
          const bodyPart = getBodyPartFromExerciseName(exercise.name);
          if (!bodyPart) {
            exercisesWithoutBodyPart.add(exercise.name);
          }
        }
      }
    }

    if (exercisesWithoutBodyPart.size > 0) {
      console.log("⚠️  Exercises without body part mapping:");
      Array.from(exercisesWithoutBodyPart)
        .sort()
        .forEach((name) => console.log(`   - ${name}`));
      console.log(
        "\nℹ️  Consider adding these exercises to src/lib/constants/exercises.ts\n",
      );
    } else {
      console.log("✅ All exercises have body part mappings!\n");
    }

    console.log("✅ Migration completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed\n");
  }
}

// Run migration
migrateBodyParts()
  .then(() => {
    console.log("✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
