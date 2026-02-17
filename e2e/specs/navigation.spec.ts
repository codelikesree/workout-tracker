import { test, expect } from "../fixtures/test-fixtures";
import { APIMock } from "../helpers/api-mock";

test.describe("Navigation & Responsive Behavior", () => {
  // ────────────────────────────────────────
  // Desktop Sidebar
  // ────────────────────────────────────────

  test.describe("Sidebar Navigation (Desktop)", () => {
    // Only run on desktop-sized viewports
    test.beforeEach(({}, testInfo) => {
      test.skip(testInfo.project.name.includes("mobile"), "Desktop only");
    });

    test("should display sidebar with all nav items", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockDashboardStats();
      await apiMock.mockTemplatesList([]);
      await authedPage.goto("/dashboard");

      const sidebar = authedPage.locator("aside");
      await expect(sidebar).toBeVisible();
      await expect(sidebar.getByText("Workout Tracker")).toBeVisible();
      await expect(sidebar.getByRole("link", { name: "Dashboard" })).toBeVisible();
      await expect(sidebar.getByRole("link", { name: "Workouts" })).toBeVisible();
      await expect(sidebar.getByRole("link", { name: "Templates" })).toBeVisible();
      await expect(sidebar.getByRole("link", { name: "History" })).toBeVisible();
      await expect(sidebar.getByRole("link", { name: "Analytics" })).toBeVisible();
      await expect(sidebar.getByRole("link", { name: "Import" })).toBeVisible();
      await expect(sidebar.getByRole("link", { name: "Profile" })).toBeVisible();
    });

    test("should highlight active nav item", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockDashboardStats();
      await apiMock.mockTemplatesList([]);
      await authedPage.goto("/dashboard");

      const dashboardLink = authedPage.locator("aside").getByRole("link", { name: "Dashboard" });
      await expect(dashboardLink).toHaveClass(/bg-primary/);
    });

    test("should navigate between pages via sidebar", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockDashboardStats();
      await apiMock.mockTemplatesList([]);
      await apiMock.mockWorkoutsList([]);
      await apiMock.mockAnalytics();
      await apiMock.mockProfile();

      await authedPage.goto("/dashboard");
      const sidebar = authedPage.locator("aside");

      // Navigate to Workouts
      await sidebar.getByRole("link", { name: "Workouts" }).click();
      await expect(authedPage).toHaveURL(/\/workouts/);

      // Navigate to Analytics
      await sidebar.getByRole("link", { name: "Analytics" }).click();
      await expect(authedPage).toHaveURL(/\/analytics/);

      // Navigate to Profile
      await sidebar.getByRole("link", { name: "Profile" }).click();
      await expect(authedPage).toHaveURL(/\/profile/);

      // Navigate back to Dashboard
      await sidebar.getByRole("link", { name: "Dashboard" }).click();
      await expect(authedPage).toHaveURL(/\/dashboard/);
    });
  });

  // ────────────────────────────────────────
  // Mobile Bottom Nav
  // ────────────────────────────────────────

  test.describe("Bottom Navigation (Mobile)", () => {
    // Only run on mobile viewports
    test.beforeEach(({}, testInfo) => {
      test.skip(!testInfo.project.name.includes("mobile"), "Mobile only");
    });

    test("should hide sidebar on mobile", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockDashboardStats();
      await apiMock.mockTemplatesList([]);
      await authedPage.goto("/dashboard");

      const sidebar = authedPage.locator("aside");
      await expect(sidebar).toBeHidden();
    });

    test("should show bottom navigation on mobile", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockDashboardStats();
      await apiMock.mockTemplatesList([]);
      await authedPage.goto("/dashboard");

      // Bottom nav should be visible (the last nav element)
      const bottomNav = authedPage.locator("nav").last();
      await expect(bottomNav).toBeVisible();
    });
  });

  // ────────────────────────────────────────
  // Header
  // ────────────────────────────────────────

  test.describe("Header", () => {
    test("should display header with user menu", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockDashboardStats();
      await apiMock.mockTemplatesList([]);
      await authedPage.goto("/dashboard");

      const header = authedPage.locator("header");
      await expect(header).toBeVisible();
    });

    test("should open user dropdown menu", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockDashboardStats();
      await apiMock.mockTemplatesList([]);
      await authedPage.goto("/dashboard");

      // Click the avatar button (last button in header)
      await authedPage.locator("header").getByRole("button").last().click();

      // Menu items should be visible
      await expect(authedPage.getByRole("menuitem", { name: "Profile" })).toBeVisible();
      await expect(authedPage.getByRole("menuitem", { name: "Settings" })).toBeVisible();
      await expect(authedPage.getByRole("menuitem", { name: "Log out" })).toBeVisible();
    });

    test("should navigate to profile from user menu", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockDashboardStats();
      await apiMock.mockTemplatesList([]);
      await apiMock.mockProfile();
      await authedPage.goto("/dashboard");

      await authedPage.locator("header").getByRole("button").last().click();
      await authedPage.getByRole("menuitem", { name: "Profile" }).click();

      await expect(authedPage).toHaveURL(/\/profile/);
    });

    test("should have a theme toggle button", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockDashboardStats();
      await apiMock.mockTemplatesList([]);
      await authedPage.goto("/dashboard");

      // The theme toggle is a button in the header
      const header = authedPage.locator("header");
      const buttons = header.getByRole("button");
      await expect(buttons.first()).toBeVisible();
    });
  });

  // ────────────────────────────────────────
  // Page Transitions
  // ────────────────────────────────────────

  test.describe("Page Transitions", () => {
    test("should maintain auth state across page navigations", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockDashboardStats();
      await apiMock.mockTemplatesList([]);
      await apiMock.mockWorkoutsList([]);
      await apiMock.mockAnalytics();

      // Navigate through multiple pages without being redirected to login
      await authedPage.goto("/dashboard");
      await expect(authedPage).toHaveURL(/\/dashboard/);

      await authedPage.goto("/workouts");
      await expect(authedPage).toHaveURL(/\/workouts/);

      await authedPage.goto("/analytics");
      await expect(authedPage).toHaveURL(/\/analytics/);

      // Should NOT be redirected to login
      await expect(authedPage).not.toHaveURL(/\/login/);
    });
  });
});
