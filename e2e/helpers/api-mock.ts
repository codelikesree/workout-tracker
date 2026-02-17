import { Page, Route } from "@playwright/test";

// Intercepts API routes and returns mock data.
// Use this to isolate tests from the real backend.
// URL patterns use trailing wildcards to match query parameters.
export class APIMock {
  constructor(private page: Page) {}

  /** Mock any GET/POST/PUT/DELETE to a route pattern with a JSON response */
  async mockRoute(
    urlPattern: string | RegExp,
    body: unknown,
    options: { status?: number; method?: string } = {}
  ) {
    const { status = 200, method } = options;
    await this.page.route(urlPattern, async (route: Route) => {
      if (method && route.request().method() !== method.toUpperCase()) {
        return route.fallback();
      }
      await route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(body),
      });
    });
  }

  /** Mock the dashboard stats endpoint */
  async mockDashboardStats(overrides: Partial<DashboardStats> = {}) {
    const defaults: DashboardStats = {
      thisWeek: 3,
      thisMonth: 12,
      streak: 5,
      templateCount: 4,
      lastWorkout: new Date().toISOString(),
    };
    await this.mockRoute("**/api/dashboard/stats**", { ...defaults, ...overrides });
  }

  /** Mock the workouts list endpoint (matches /api/workouts?page=1&type=...) */
  async mockWorkoutsList(workouts: MockWorkout[] = [], pagination?: Partial<Pagination>) {
    const defaultPagination: Pagination = {
      page: 1,
      limit: 10,
      total: workouts.length,
      totalPages: 1,
    };
    await this.mockRoute("**/api/workouts?**", {
      workouts,
      pagination: { ...defaultPagination, ...pagination },
    });
    // Also match the exact path without query params
    await this.mockRoute("**/api/workouts", {
      workouts,
      pagination: { ...defaultPagination, ...pagination },
    });
  }

  /** Mock the templates list endpoint */
  async mockTemplatesList(templates: MockTemplate[] = []) {
    await this.mockRoute("**/api/templates", { templates });
    await this.mockRoute("**/api/templates?**", { templates });
  }

  /** Mock the analytics endpoint */
  async mockAnalytics(overrides: Partial<MockAnalytics> = {}) {
    const defaults: MockAnalytics = {
      stats: {
        totalWorkouts: 15,
        totalExercises: 45,
        totalSets: 180,
        totalDuration: 900,
        streak: 5,
        templateCount: 3,
      },
      typeBreakdown: { strength: 10, cardio: 3, hiit: 2 },
      bodyPartBreakdown: { chest: 30, back: 25, legs: 20 },
      dailyData: [],
      comparison: { current: 5, previous: 3, change: 66.7 },
      volumeMetrics: {
        totalVolume: 15000,
        volumeUnit: "kg",
        volumeTrend: 25,
        weeklyVolumeData: [],
      },
      personalRecords: [],
      bodyPartBalance: [],
      topProgressions: [],
      recommendations: ["Try adding more leg exercises to balance your routine"],
    };
    await this.mockRoute("**/api/analytics**", { ...defaults, ...overrides });
  }

  /** Mock user profile endpoint */
  async mockProfile(overrides: Partial<MockUserProfile> = {}) {
    const defaults: MockUserProfile = {
      username: "testuser",
      email: "test@example.com",
      fullName: "Test User",
      age: 25,
      height: 175,
      weight: 70,
      heightUnit: "cm",
      weightUnit: "kg",
    };
    await this.mockRoute("**/api/users/me**", { user: { ...defaults, ...overrides } });
  }

  /** Mock last-stats endpoint for exercises */
  async mockLastStats(stats: Record<string, { date: string; sets: unknown[] }> = {}) {
    await this.mockRoute("**/api/workouts/last-stats**", { stats });
  }

  /** Mock a single workout detail */
  async mockWorkoutDetail(workout: MockWorkout) {
    await this.mockRoute(`**/api/workouts/${workout._id}`, workout);
  }

  /** Mock a single template detail */
  async mockTemplateDetail(template: MockTemplate) {
    await this.mockRoute(`**/api/templates/${template._id}`, template);
    await this.mockRoute(`**/api/templates/${template._id}?**`, template);
  }

  /** Mock template use endpoint */
  async mockTemplateUse(templateId: string, sessionConfig: unknown) {
    await this.mockRoute(`**/api/templates/${templateId}/use`, sessionConfig, {
      method: "POST",
    });
  }

  /** Intercept and capture requests to a route */
  async captureRequest(urlPattern: string | RegExp): Promise<() => unknown | null> {
    let capturedBody: unknown | null = null;
    await this.page.route(urlPattern, async (route) => {
      const request = route.request();
      try {
        capturedBody = JSON.parse(request.postData() || "null");
      } catch {
        capturedBody = request.postData();
      }
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
    });
    return () => capturedBody;
  }
}

// ── Types ──

interface DashboardStats {
  thisWeek: number;
  thisMonth: number;
  streak: number;
  templateCount: number;
  lastWorkout: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface MockWorkout {
  _id: string;
  workoutName: string;
  type: string;
  date: string;
  exercises: Array<{
    name: string;
    bodyPart?: string;
    sets: Array<{
      setNumber: number;
      reps: number;
      weight: number;
      weightUnit: string;
    }>;
  }>;
  duration?: number;
  notes?: string;
}

export interface MockTemplate {
  _id: string;
  name: string;
  description?: string;
  type: string;
  exercises: Array<{
    name: string;
    targetSets: number;
    targetReps: number;
    targetWeight?: number;
    weightUnit?: string;
  }>;
  estimatedDuration?: number;
  usageCount: number;
}

interface MockAnalytics {
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
  dailyData: unknown[];
  comparison: { current: number; previous: number; change: number };
  volumeMetrics: {
    totalVolume: number;
    volumeUnit: string;
    volumeTrend: number;
    weeklyVolumeData: unknown[];
  };
  personalRecords: unknown[];
  bodyPartBalance: unknown[];
  topProgressions: unknown[];
  recommendations: string[];
}

interface MockUserProfile {
  username: string;
  email: string;
  fullName?: string;
  age?: number;
  height?: number;
  weight?: number;
  heightUnit: "cm" | "in";
  weightUnit: "kg" | "lbs";
}
