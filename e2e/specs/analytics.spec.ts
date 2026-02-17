import { test, expect } from "../fixtures/test-fixtures";
import { APIMock } from "../helpers/api-mock";

test.describe("Analytics", () => {
  test.describe("Page Layout", () => {
    test("should display page title and period tabs", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockAnalytics();

      await authedPage.goto("/analytics");

      await expect(authedPage.getByRole("heading", { name: "Analytics" })).toBeVisible();
      await expect(authedPage.getByRole("tab", { name: "This Week" })).toBeVisible();
      await expect(authedPage.getByRole("tab", { name: "This Month" })).toBeVisible();
      await expect(authedPage.getByRole("tab", { name: "All Time" })).toBeVisible();
    });

    test("should show key metric cards", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockAnalytics({
        stats: {
          totalWorkouts: 15,
          totalExercises: 45,
          totalSets: 180,
          totalDuration: 900,
          streak: 5,
          templateCount: 3,
        },
      });

      await authedPage.goto("/analytics");

      await expect(authedPage.getByText("Streak")).toBeVisible({ timeout: 5000 });
      const main = authedPage.locator('main, [role="main"]');
      await expect(main.getByText("Workouts")).toBeVisible();
      await expect(authedPage.getByText("Total Sets")).toBeVisible();
      await expect(authedPage.getByText("Duration")).toBeVisible();
    });

    test("should show stat values from API", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockAnalytics({
        stats: {
          totalWorkouts: 42,
          totalExercises: 100,
          totalSets: 500,
          totalDuration: 1200,
          streak: 10,
          templateCount: 5,
        },
      });

      await authedPage.goto("/analytics");

      // Check the rendered stat values
      await expect(authedPage.getByText("42")).toBeVisible({ timeout: 5000 });
      await expect(authedPage.getByText("500")).toBeVisible();
      await expect(authedPage.getByText("1200")).toBeVisible();
      await expect(authedPage.getByText("10")).toBeVisible();
    });
  });

  test.describe("Section Visibility", () => {
    test("should show all main sections", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockAnalytics();

      await authedPage.goto("/analytics");

      await expect(authedPage.getByText("Key Metrics")).toBeVisible({ timeout: 5000 });
      await expect(authedPage.getByText("Progressive Overload")).toBeVisible();
      await expect(authedPage.getByRole("heading", { name: "Muscle Balance" })).toBeVisible();
      await expect(authedPage.getByText("Additional Metrics")).toBeVisible();
    });

    test("should show recommendations when available", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockAnalytics({
        recommendations: ["Add more leg exercises", "Consider increasing rest times"],
      });

      await authedPage.goto("/analytics");

      await expect(authedPage.getByText("Add more leg exercises")).toBeVisible({ timeout: 5000 });
    });

    test("should show 'No data for this period' when charts have no data", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockAnalytics({
        dailyData: [],
        bodyPartBreakdown: {},
        typeBreakdown: {},
      });

      await authedPage.goto("/analytics");

      const noDataMessages = authedPage.getByText("No data for this period");
      await expect(noDataMessages.first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Period Switching", () => {
    test("should switch to monthly view", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockAnalytics();

      await authedPage.goto("/analytics");

      // Track if a new request is made with month period
      let requestedPeriod = "";
      await authedPage.route("**/api/analytics**", async (route) => {
        const url = new URL(route.request().url());
        requestedPeriod = url.searchParams.get("period") || "";
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            stats: { totalWorkouts: 30, totalExercises: 90, totalSets: 360, totalDuration: 1800, streak: 5, templateCount: 3 },
            typeBreakdown: {},
            bodyPartBreakdown: {},
            dailyData: [],
            comparison: { current: 30, previous: 20, change: 50 },
            volumeMetrics: { totalVolume: 0, volumeUnit: "kg", volumeTrend: 0, weeklyVolumeData: [] },
            personalRecords: [],
            bodyPartBalance: [],
            topProgressions: [],
            recommendations: [],
          }),
        });
      });

      // Wait for initial data to load before switching tabs
      await expect(authedPage.getByText("Key Metrics")).toBeVisible({ timeout: 5000 });
      await authedPage.getByRole("tab", { name: "This Month" }).click();

      // Wait a moment for the request
      await authedPage.waitForTimeout(500);
      expect(requestedPeriod).toBe("month");
    });

    test("should switch to all-time view", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockAnalytics();

      await authedPage.goto("/analytics");

      let requestedPeriod = "";
      await authedPage.route("**/api/analytics**", async (route) => {
        const url = new URL(route.request().url());
        requestedPeriod = url.searchParams.get("period") || "";
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            stats: { totalWorkouts: 100, totalExercises: 300, totalSets: 1000, totalDuration: 5000, streak: 5, templateCount: 3 },
            typeBreakdown: { strength: 60, cardio: 25, hiit: 15 },
            bodyPartBreakdown: {},
            dailyData: [],
            comparison: { current: 0, previous: 0, change: 0 },
            volumeMetrics: { totalVolume: 0, volumeUnit: "kg", volumeTrend: 0, weeklyVolumeData: [] },
            personalRecords: [],
            bodyPartBalance: [],
            topProgressions: [],
            recommendations: [],
          }),
        });
      });

      // Wait for initial data to load before switching tabs
      await expect(authedPage.getByText("Key Metrics")).toBeVisible({ timeout: 5000 });
      await authedPage.getByRole("tab", { name: "All Time" }).click();
      await authedPage.waitForTimeout(500);
      expect(requestedPeriod).toBe("all");
    });
  });

  test.describe("Loading State", () => {
    test("should show skeletons while loading", async ({ authedPage }) => {
      await authedPage.route("**/api/analytics**", async (route) => {
        await new Promise((r) => setTimeout(r, 2000));
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            stats: { totalWorkouts: 0, totalExercises: 0, totalSets: 0, totalDuration: 0, streak: 0, templateCount: 0 },
            typeBreakdown: {},
            bodyPartBreakdown: {},
            dailyData: [],
            comparison: { current: 0, previous: 0, change: 0 },
            volumeMetrics: null,
            personalRecords: [],
            bodyPartBalance: [],
            topProgressions: [],
            recommendations: [],
          }),
        });
      });

      await authedPage.goto("/analytics");

      const skeletons = authedPage.locator('[data-slot="skeleton"]');
      await expect(skeletons.first()).toBeVisible({ timeout: 2000 });
    });
  });

  test.describe("Comparison Indicator", () => {
    test("should show positive comparison when workouts increased", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockAnalytics({
        comparison: { current: 10, previous: 5, change: 100 },
      });

      await authedPage.goto("/analytics");

      await expect(authedPage.getByText(/\+100%/)).toBeVisible({ timeout: 5000 });
    });
  });
});
