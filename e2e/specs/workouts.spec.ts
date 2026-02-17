import { test, expect } from "../fixtures/test-fixtures";
import { APIMock } from "../helpers/api-mock";
import { createMockWorkout, createWorkoutBatch } from "../data/test-data";

test.describe("Workouts", () => {
  // ────────────────────────────────────────
  // List Page
  // ────────────────────────────────────────

  test.describe("Workouts List", () => {
    test("should display page title and start button", async ({ workoutsPage }) => {
      await workoutsPage.goto();
      await expect(workoutsPage.pageTitle).toBeVisible();
      await expect(workoutsPage.startWorkoutButton).toBeVisible();
    });

    test("should show empty state when no workouts exist", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockWorkoutsList([]);
      await apiMock.mockTemplatesList([]);

      await authedPage.goto("/workouts");

      await expect(authedPage.getByText("No workouts yet")).toBeVisible({ timeout: 5000 });
      await expect(
        authedPage.getByText("Start tracking your fitness journey")
      ).toBeVisible();
    });

    test("should display workout cards when workouts exist", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      const workouts = [
        createMockWorkout({ workoutName: "Morning Push" }),
        createMockWorkout({ workoutName: "Evening Pull" }),
      ];
      await apiMock.mockWorkoutsList(workouts);
      await apiMock.mockTemplatesList([]);

      await authedPage.goto("/workouts");

      await expect(authedPage.getByText("Morning Push")).toBeVisible({ timeout: 5000 });
      await expect(authedPage.getByText("Evening Pull")).toBeVisible();
    });

    test("should show loading skeletons while data loads", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      // Delay response to see skeletons
      await authedPage.route("**/api/workouts**", async (route) => {
        await new Promise((r) => setTimeout(r, 2000));
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ workouts: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } }),
        });
      });
      await apiMock.mockTemplatesList([]);

      await authedPage.goto("/workouts");

      // Skeletons should appear briefly
      const skeletons = authedPage.locator('[data-slot="skeleton"]');
      await expect(skeletons.first()).toBeVisible({ timeout: 2000 });
    });
  });

  // ────────────────────────────────────────
  // Filtering
  // ────────────────────────────────────────

  test.describe("Type Filter", () => {
    test("should have a type filter dropdown", async ({ workoutsPage }) => {
      await workoutsPage.goto();
      await expect(workoutsPage.typeFilter).toBeVisible();
    });

    test("should filter workouts by type", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      const workouts = createWorkoutBatch(5);
      await apiMock.mockWorkoutsList(workouts);
      await apiMock.mockTemplatesList([]);

      await authedPage.goto("/workouts");
      await expect(authedPage.getByText(workouts[0].workoutName)).toBeVisible({ timeout: 5000 });

      // Intercept the filtered request
      await authedPage.route("**/api/workouts?*type=cardio*", async (route) => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            workouts: workouts.filter((w) => w.type === "cardio"),
            pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
          }),
        });
      });

      // Click the filter and select Cardio
      await authedPage.getByLabel("Filter workouts by type").click();
      await authedPage.getByRole("option", { name: "Cardio" }).click();
    });
  });

  // ────────────────────────────────────────
  // Pagination
  // ────────────────────────────────────────

  test.describe("Pagination", () => {
    test("should show pagination when there are multiple pages", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      const workouts = createWorkoutBatch(10);
      await apiMock.mockWorkoutsList(workouts, {
        page: 1,
        totalPages: 3,
        total: 30,
      });
      await apiMock.mockTemplatesList([]);

      await authedPage.goto("/workouts");

      // Pagination controls should be visible
      await expect(authedPage.getByText("Page 1 of 3")).toBeVisible({ timeout: 5000 });
      await expect(authedPage.getByLabel("Go to next page")).toBeVisible();
    });

    test("should disable previous button on first page", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockWorkoutsList(createWorkoutBatch(5), {
        page: 1,
        totalPages: 2,
        total: 15,
      });
      await apiMock.mockTemplatesList([]);

      await authedPage.goto("/workouts");

      await expect(authedPage.getByLabel("Go to previous page")).toBeDisabled({ timeout: 5000 });
    });

    test("should not show pagination for single page", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockWorkoutsList(createWorkoutBatch(3), {
        page: 1,
        totalPages: 1,
        total: 3,
      });
      await apiMock.mockTemplatesList([]);

      await authedPage.goto("/workouts");

      // Wait for content to load, then check pagination is absent
      await expect(authedPage.getByText("Workout 1")).toBeVisible({ timeout: 5000 });
      await expect(authedPage.locator('[aria-label="Pagination"]')).toBeHidden();
    });
  });

  // ────────────────────────────────────────
  // Start Workout Sheet
  // ────────────────────────────────────────

  test.describe("Start Workout", () => {
    test("should open start workout sheet when clicking start button", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockWorkoutsList([]);
      await apiMock.mockTemplatesList([]);

      await authedPage.goto("/workouts");

      await authedPage.getByRole("button", { name: /Start Workout/ }).click();

      // Sheet should appear with Empty Workout option
      await expect(authedPage.getByText("Start Workout").last()).toBeVisible();
      await expect(authedPage.getByText("Empty Workout")).toBeVisible();
    });

    test("should show templates in start workout sheet", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockWorkoutsList([]);
      await apiMock.mockTemplatesList([
        {
          _id: "t1",
          name: "Push Day",
          type: "strength",
          exercises: [{ name: "Bench Press", targetSets: 3, targetReps: 10 }],
          usageCount: 5,
          estimatedDuration: 60,
        },
      ]);

      await authedPage.goto("/workouts");
      await authedPage.getByRole("button", { name: /Start Workout/ }).click();

      await expect(authedPage.getByText("Push Day")).toBeVisible();
      await expect(authedPage.getByText("From Template")).toBeVisible();
    });

    test("should navigate to active workout when starting empty workout", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockWorkoutsList([]);
      await apiMock.mockTemplatesList([]);
      await apiMock.mockLastStats();

      await authedPage.goto("/workouts");
      await authedPage.getByRole("button", { name: /Start Workout/ }).click();
      await authedPage.getByText("Empty Workout").click();

      await expect(authedPage).toHaveURL(/\/workout\/active/);
    });
  });
});
