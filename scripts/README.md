# Migration Scripts

## Body Part Migration

### Overview
The `migrate-body-parts.ts` script adds body part information to all existing workout exercises in your database. This enables body part analytics in the dashboard.

### Prerequisites
- Node.js installed
- MongoDB connection string set in `.env.local` (MONGODB_URI or DATABASE_URL)
- All dependencies installed (`npm install`)

**Important:** The script automatically loads environment variables from `.env.local` in your project root.

### Running the Migration

**Local Development:**
```bash
npm run migrate:body-parts
```

**Or directly with tsx:**
```bash
npx tsx scripts/migrate-body-parts.ts
```

### What it does
1. Connects to your MongoDB database
2. Finds all workout logs
3. For each exercise in each workout:
   - Looks up the body part based on the exercise name
   - Adds the `bodyPart` field to the exercise
4. Provides a detailed summary of:
   - Total workouts processed
   - Successfully updated workouts
   - Skipped workouts (already migrated)
   - Any errors encountered
5. Lists any exercises that don't have a body part mapping

### Example Output
```
🚀 Starting body part migration...

✅ Connected to MongoDB
📊 Found 150 total workouts to process

✓ Updated workout: Push Day (1/15/2024)
✓ Updated workout: Pull Day (1/16/2024)
...

============================================================
📈 Migration Summary:
============================================================
Total workouts processed: 150
✅ Successfully updated: 145
⏭️  Skipped (already migrated): 5
❌ Errors: 0
============================================================

🔍 Checking for exercises without body part matches...

✅ All exercises have body part mappings!

✅ Migration completed successfully!

🔌 Database connection closed

✨ Done!
```

### Safety Features
- **Idempotent**: Can be run multiple times safely - skips exercises that already have body parts
- **Non-destructive**: Only adds data, never removes or modifies existing data
- **Error handling**: Continues processing even if individual workouts fail
- **Detailed logging**: Shows exactly what's being updated

### After Migration
Once the migration completes successfully:
1. Visit `/analytics` in your app
2. You'll see a new "Body Parts Trained" chart
3. The chart shows how many sets you've performed for each body part
4. Filters work with the selected time period (week/month/all time)

### Troubleshooting

**Exercise not found:**
If the migration reports exercises without body part mappings, you can:
1. Add them to `src/lib/constants/exercises.ts`
2. Re-run the migration

**Connection error:**
- Verify your MONGODB_URI in `.env.local`
- Ensure MongoDB is accessible
- Check network connectivity

**Permission errors:**
- Ensure your MongoDB user has write permissions
- Check database authentication credentials

### Future Workouts
All new workouts will automatically include body part information - no need to run this migration again.
