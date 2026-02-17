import { test, expect } from "../fixtures/test-fixtures";
import { APIMock } from "../helpers/api-mock";

test.describe("Active Workout", () => {
  /**
   * Helper: start an empty workout by navigating through the workouts page.
   * Sets up necessary mocks and navigates to /workout/active.
   */
  async function startEmptyWorkout(
    page: import("@playwright/test").Page,
    apiMock: APIMock
  ) {
    await apiMock.mockWorkoutsList([]);
    await apiMock.mockTemplatesList([]);
    await apiMock.mockLastStats();

    await page.goto("/workouts");
    await page.getByRole("button", { name: /Start Workout/ }).click();
    await page.getByText("Empty Workout").click();
    await page.waitForURL("**/workout/active", { timeout: 10_000 });
  }

  // ────────────────────────────────────────
  // Workout Session UI
  // ────────────────────────────────────────

  test.describe("Session UI", () => {
    test("should show workout name and timer", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await startEmptyWorkout(authedPage, apiMock);

      // Default workout name is "Workout"
      await expect(authedPage.locator("h1")).toContainText("Workout");

      // Timer should be visible and running (showing 0:XX format)
      await expect(authedPage.getByText(/\d+:\d+/)).toBeVisible();
    });

    test("should show sets progress counter", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await startEmptyWorkout(authedPage, apiMock);

      // Should show "0/X sets" initially
      await expect(authedPage.getByText(/\d+\/\d+ sets/)).toBeVisible();
    });

    test("should show finish button", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await startEmptyWorkout(authedPage, apiMock);

      await expect(authedPage.getByRole("button", { name: /Finish/ })).toBeVisible();
    });

    test("should show add exercise button", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await startEmptyWorkout(authedPage, apiMock);

      await expect(authedPage.getByRole("button", { name: /Add Exercise/ })).toBeVisible();
    });
  });

  // ────────────────────────────────────────
  // Add Exercise Flow
  // ────────────────────────────────────────

  test.describe("Add Exercise", () => {
    test("should show exercise search when clicking Add Exercise", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await startEmptyWorkout(authedPage, apiMock);

      await authedPage.getByRole("button", { name: /Add Exercise/ }).click();

      // Should show the search input and Add/Cancel buttons
      await expect(authedPage.getByRole("combobox").last()).toBeVisible();
      await expect(authedPage.getByRole("button", { name: "Cancel" }).last()).toBeVisible();
      await expect(authedPage.getByRole("button", { name: "Add" }).last()).toBeVisible();
    });

    test("should disable Add button until exercise is selected", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await startEmptyWorkout(authedPage, apiMock);

      await authedPage.getByRole("button", { name: /Add Exercise/ }).click();

      // Add button should be disabled without a selection
      await expect(authedPage.getByRole("button", { name: "Add" }).last()).toBeDisabled();
    });

    test("should cancel adding exercise", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await startEmptyWorkout(authedPage, apiMock);

      await authedPage.getByRole("button", { name: /Add Exercise/ }).click();
      await expect(authedPage.getByRole("combobox").last()).toBeVisible();

      await authedPage.getByRole("button", { name: "Cancel" }).last().click();

      // Search should disappear, Add Exercise button should return
      await expect(authedPage.getByRole("button", { name: /Add Exercise/ })).toBeVisible();
    });
  });

  // ────────────────────────────────────────
  // Discard Workout
  // ────────────────────────────────────────

  test.describe("Discard Workout", () => {
    test("should open discard dialog when clicking X", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await startEmptyWorkout(authedPage, apiMock);

      // Click the X (discard) button - it has text-destructive class
      const discardTrigger = authedPage.locator("button.text-destructive");
      await discardTrigger.click();

      // Discard dialog should appear
      await expect(authedPage.getByRole("dialog")).toBeVisible();
    });

    test("should cancel discard and return to workout", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await startEmptyWorkout(authedPage, apiMock);

      const discardTrigger = authedPage.locator("button.text-destructive");
      await discardTrigger.click();

      // Cancel the discard
      await authedPage.getByRole("dialog").getByRole("button", { name: /Keep Going/i }).click();

      // Should still be on active workout
      await expect(authedPage).toHaveURL(/\/workout\/active/);
    });

    test("should discard workout and redirect to dashboard", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockDashboardStats();
      await apiMock.mockTemplatesList([]);
      await startEmptyWorkout(authedPage, apiMock);

      const discardTrigger = authedPage.locator("button.text-destructive");
      await discardTrigger.click();

      // Confirm discard
      await authedPage
        .getByRole("dialog")
        .getByRole("button", { name: /Discard/i })
        .click();

      // Should redirect to dashboard
      await expect(authedPage).toHaveURL(/\/dashboard/, { timeout: 10_000 });
    });
  });

  // ────────────────────────────────────────
  // Finish Workout
  // ────────────────────────────────────────

  test.describe("Finish Workout", () => {
    test("should show finish summary when clicking Finish", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await startEmptyWorkout(authedPage, apiMock);

      await authedPage.getByRole("button", { name: /Finish/ }).click();

      // The FinishWorkoutSummary component replaces the active workout UI
      await expect(authedPage.getByText("Workout Summary")).toBeVisible({ timeout: 5000 });
    });
  });

  // ────────────────────────────────────────
  // Redirect Behavior
  // ────────────────────────────────────────

  test.describe("Session Redirect", () => {
    test("should redirect to dashboard if no active session", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockDashboardStats();
      await apiMock.mockTemplatesList([]);

      // Clear any localStorage session data
      await authedPage.goto("/dashboard");
      await authedPage.evaluate(() => {
        localStorage.removeItem("activeWorkoutSession");
      });

      // Try to navigate directly to active workout
      await authedPage.goto("/workout/active");

      // Should redirect back to dashboard (no active session)
      await expect(authedPage).toHaveURL(/\/dashboard/, { timeout: 10_000 });
    });
  });
});
