// ─── Workout Responses ───────────────────────────────────────────────

export interface WorkoutSetResponse {
  setNumber: number;
  reps: number;
  weight: number;
  weightUnit: "kg" | "lbs";
  duration?: number;
  distance?: number;
  notes?: string;
}

export interface WorkoutExerciseResponse {
  name: string;
  sets: WorkoutSetResponse[];
  restTime?: number;
}

export interface WorkoutResponse {
  workout: {
    _id: string;
    userId: string;
    workoutName: string;
    type: string;
    date: string;
    exercises: WorkoutExerciseResponse[];
    duration?: number;
    notes?: string;
    templateId?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface WorkoutsListResponse {
  workouts: WorkoutResponse["workout"][];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DeleteWorkoutResponse {
  message: string;
}

// ─── Template Responses ──────────────────────────────────────────────

export interface TemplateExerciseResponse {
  name: string;
  targetSets: number;
  targetReps: number;
  targetWeight?: number;
  weightUnit: "kg" | "lbs";
  restTime?: number;
  notes?: string;
}

export interface TemplateResponse {
  template: {
    _id: string;
    userId: string;
    name: string;
    description?: string;
    type: string;
    exercises: TemplateExerciseResponse[];
    estimatedDuration?: number;
    isPublic: boolean;
    usageCount: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface TemplatesListResponse {
  templates: TemplateResponse["template"][];
}

export interface DeleteTemplateResponse {
  message: string;
}

export interface TemplateUseResponse {
  workoutName: string;
  type: string;
  exercises: Array<{
    name: string;
    sets: Array<{
      setNumber: number;
      reps: number;
      weight: number;
      weightUnit: "kg" | "lbs";
    }>;
  }>;
  duration?: number;
}

// ─── Last Stats ──────────────────────────────────────────────────────

export interface LastStatsSet {
  setNumber: number;
  reps: number;
  weight: number;
  weightUnit: string;
}

export interface LastStatsResponse {
  stats: Record<
    string,
    {
      date: string;
      sets: LastStatsSet[];
    }
  >;
}

// ─── Dashboard Stats ─────────────────────────────────────────────────

export interface DashboardStatsResponse {
  thisWeek: number;
  thisMonth: number;
  streak: number;
  templateCount: number;
  lastWorkout: {
    name: string;
    date: string;
    id: string;
  } | null;
}

// ─── Analytics ───────────────────────────────────────────────────────

export interface AnalyticsResponse {
  stats: {
    totalWorkouts: number;
    totalExercises: number;
    totalSets: number;
    totalDuration: number;
    streak: number;
    templateCount: number;
  };
  typeBreakdown: Record<string, number>;
  bodyPartBreakdown: Record<string, number>;
  dailyData: Array<{
    date: string;
    label: string;
    workouts: number;
    exercises: number;
    sets: number;
  }>;
  comparison: {
    current: number;
    previous: number;
    change: number;
  };
}

// ─── User Profile ────────────────────────────────────────────────────

export interface UserProfileResponse {
  user: {
    _id: string;
    username: string;
    email: string;
    fullName?: string;
    age?: number;
    height?: number;
    weight?: number;
    heightUnit?: "cm" | "in";
    weightUnit?: "kg" | "lbs";
  };
}

// ─── Auth ────────────────────────────────────────────────────────────

export interface SignupResponse {
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

// ─── Import ──────────────────────────────────────────────────────────

export interface ImportWorkoutsResponse {
  workouts: Array<{ _id: string }>;
}
