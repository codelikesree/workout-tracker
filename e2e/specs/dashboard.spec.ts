import { test, expect } from "../fixtures/test-fixtures";
import { APIMock } from "../helpers/api-mock";
import { createMockTemplate } from "../data/test-data";

test.describe("Dashboard", () => {
  test.describe("Layout & Content", () => {
    test("should display greeting with username", async ({ dashboardPage }) => {
      await dashboardPage.goto();
      await dashboardPage.expectGreeting();
    });

    test("should display 'Ready to train?' subtitle", async ({ dashboardPage }) => {
      await dashboardPage.goto();
      await expect(dashboardPage.readyToTrain).toBeVisible();
    });

    test("should show the start workout section", async ({ dashboardPage }) => {
      await dashboardPage.goto();
      await expect(dashboardPage.startWorkoutSection).toBeVisible();
    });

    test("should show quick stats section", async ({ dashboardPage }) => {
      await dashboardPage.goto();
      await expect(dashboardPage.quickStatsSection).toBeVisible();
    });

    test("should show quick links for Analytics and New Template", async ({ dashboardPage, authedPage }) => {
      await dashboardPage.goto();
      // Scope to main content to avoid matching sidebar links
      const main = authedPage.locator('main, [role="main"]');
      await expect(main.getByText("Analytics")).toBeVisible();
      await expect(main.getByText("New Template")).toBeVisible();
    });
  });

  test.describe("Quick Stats", () => {
    test("should display stats from the API", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockDashboardStats({
        thisWeek: 5,
        thisMonth: 20,
        streak: 7,
      });
      await apiMock.mockTemplatesList([]);

      await authedPage.goto("/dashboard");

      // Stats should eventually render with real numbers
      await expect(authedPage.getByText("5")).toBeVisible({ timeout: 5000 });
    });

    test("should show zero stats for new user", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockDashboardStats({
        thisWeek: 0,
        thisMonth: 0,
        streak: 0,
        templateCount: 0,
        lastWorkout: null,
      });
      await apiMock.mockTemplatesList([]);

      await authedPage.goto("/dashboard");
      // Multiple 0 values should be visible
      const zeros = authedPage.getByText("0");
      await expect(zeros.first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Recent Templates", () => {
    test("should show recent templates when available", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      const templates = [
        createMockTemplate({ name: "Push Day" }),
        createMockTemplate({ name: "Pull Day" }),
      ];
      await apiMock.mockTemplatesList(templates);
      await apiMock.mockDashboardStats();

      await authedPage.goto("/dashboard");

      await expect(authedPage.getByText("Push Day")).toBeVisible({ timeout: 5000 });
      await expect(authedPage.getByText("Pull Day")).toBeVisible();
    });
  });

  test.describe("Navigation", () => {
    test("should navigate to analytics when clicking Analytics quick link", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockDashboardStats();
      await apiMock.mockTemplatesList([]);

      await authedPage.goto("/dashboard");

      // Click the analytics quick link in main content (not sidebar)
      const main = authedPage.locator('main, [role="main"]');
      await main.getByRole("link", { name: /Analytics/ }).click();
      await expect(authedPage).toHaveURL(/\/analytics/);
    });

    test("should navigate to new template when clicking New Template link", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockDashboardStats();
      await apiMock.mockTemplatesList([]);

      await authedPage.goto("/dashboard");

      const main = authedPage.locator('main, [role="main"]');
      await main.getByRole("link", { name: /New Template/ }).click();
      await expect(authedPage).toHaveURL(/\/templates\/new/);
    });
  });
});
