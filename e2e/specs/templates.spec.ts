import { test, expect } from "../fixtures/test-fixtures";
import { APIMock } from "../helpers/api-mock";
import { createMockTemplate } from "../data/test-data";

test.describe("Templates", () => {
  // ────────────────────────────────────────
  // List Page
  // ────────────────────────────────────────

  test.describe("Templates List", () => {
    test("should display page title and create button", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockTemplatesList([]);

      await authedPage.goto("/templates");

      await expect(authedPage.getByRole("heading", { name: "Templates", exact: true })).toBeVisible();
      await expect(authedPage.getByRole("link", { name: /Create Template/ })).toBeVisible();
    });

    test("should show empty state when no templates exist", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockTemplatesList([]);

      await authedPage.goto("/templates");

      await expect(authedPage.getByText("No templates yet")).toBeVisible({ timeout: 5000 });
      await expect(
        authedPage.getByText("Create a template to quickly log")
      ).toBeVisible();
    });

    test("should display template cards when templates exist", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      const templates = [
        createMockTemplate({ name: "Push Day", type: "strength", usageCount: 10 }),
        createMockTemplate({ name: "Cardio Session", type: "cardio", usageCount: 5 }),
      ];
      await apiMock.mockTemplatesList(templates);

      await authedPage.goto("/templates");

      await expect(authedPage.getByText("Push Day")).toBeVisible({ timeout: 5000 });
      await expect(authedPage.getByText("Cardio Session")).toBeVisible();
    });

    test("should show exercise count and set count on cards", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      const template = createMockTemplate({
        name: "Full Body",
        exercises: [
          { name: "Squat", targetSets: 3, targetReps: 10 },
          { name: "Bench", targetSets: 3, targetReps: 8 },
        ],
      });
      await apiMock.mockTemplatesList([template]);

      await authedPage.goto("/templates");

      // Should show "2 exercises, 6 sets"
      await expect(authedPage.getByText(/2 exercises/)).toBeVisible({ timeout: 5000 });
      await expect(authedPage.getByText(/6 sets/)).toBeVisible();
    });

    test("should show usage count on cards", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockTemplatesList([
        createMockTemplate({ name: "Popular Template", usageCount: 15 }),
      ]);

      await authedPage.goto("/templates");

      await expect(authedPage.getByText(/Used 15 times/)).toBeVisible({ timeout: 5000 });
    });

    test("should show type badge on cards", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockTemplatesList([
        createMockTemplate({ name: "HIIT Blast", type: "hiit" }),
      ]);

      await authedPage.goto("/templates");

      await expect(authedPage.getByText("HIIT", { exact: true })).toBeVisible({ timeout: 5000 });
    });

    test("should show loading skeletons while data loads", async ({ authedPage }) => {
      await authedPage.route("**/api/templates**", async (route) => {
        await new Promise((r) => setTimeout(r, 2000));
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ templates: [] }),
        });
      });

      await authedPage.goto("/templates");

      const skeletons = authedPage.locator('[data-slot="skeleton"]');
      await expect(skeletons.first()).toBeVisible({ timeout: 2000 });
    });
  });

  // ────────────────────────────────────────
  // Card Actions (Dropdown Menu)
  // ────────────────────────────────────────

  test.describe("Template Card Actions", () => {
    const template = createMockTemplate({ name: "Test Template" });

    /** Set up mocks and navigate, returning the apiMock instance */
    async function setupCardTest(page: import("@playwright/test").Page) {
      const apiMock = new APIMock(page);
      await apiMock.mockTemplatesList([template]);
      await page.goto("/templates");
      await expect(page.getByText("Test Template", { exact: true })).toBeVisible({ timeout: 10000 });
      return apiMock;
    }

    /** Click the 3-dot menu on the template card */
    async function openCardMenu(page: import("@playwright/test").Page) {
      await page
        .locator("[data-slot='card']")
        .filter({ hasText: "Test Template" })
        .getByRole("button")
        .first()
        .click();
    }

    test("should open dropdown menu with all options", async ({ authedPage }) => {
      await setupCardTest(authedPage);
      await openCardMenu(authedPage);

      // All menu items should be visible
      await expect(authedPage.getByRole("menuitem", { name: "View Details" })).toBeVisible();
      await expect(authedPage.getByRole("menuitem", { name: "Start Workout" })).toBeVisible();
      await expect(authedPage.getByRole("menuitem", { name: "Edit" })).toBeVisible();
      await expect(authedPage.getByRole("menuitem", { name: "Delete" })).toBeVisible();
    });

    test("should navigate to template details", async ({ authedPage }) => {
      const apiMock = await setupCardTest(authedPage);
      await apiMock.mockTemplateDetail(template);
      await openCardMenu(authedPage);
      await authedPage.getByRole("menuitem", { name: "View Details" }).click();

      await expect(authedPage).toHaveURL(new RegExp(`/templates/${template._id}`));
    });

    test("should navigate to edit template", async ({ authedPage }) => {
      const apiMock = await setupCardTest(authedPage);
      await apiMock.mockTemplateDetail(template);
      await openCardMenu(authedPage);
      await authedPage.getByRole("menuitem", { name: "Edit" }).click();

      await expect(authedPage).toHaveURL(new RegExp(`/templates/${template._id}/edit`));
    });

    test("should show delete confirmation dialog", async ({ authedPage }) => {
      await setupCardTest(authedPage);
      await openCardMenu(authedPage);
      await authedPage.getByRole("menuitem", { name: "Delete" }).click();

      // Confirmation dialog should appear
      await expect(authedPage.getByText("Delete Template")).toBeVisible();
      await expect(authedPage.getByText(/Are you sure/)).toBeVisible();
      await expect(authedPage.getByRole("button", { name: "Cancel" })).toBeVisible();
      await expect(authedPage.getByRole("button", { name: /Delete/ }).last()).toBeVisible();
    });

    test("should cancel delete when clicking Cancel", async ({ authedPage }) => {
      await setupCardTest(authedPage);
      await openCardMenu(authedPage);
      await authedPage.getByRole("menuitem", { name: "Delete" }).click();
      await authedPage.getByRole("button", { name: "Cancel" }).click();

      // Template should still be visible
      await expect(authedPage.getByText("Test Template", { exact: true })).toBeVisible();
    });
  });

  // ────────────────────────────────────────
  // Create Template Navigation
  // ────────────────────────────────────────

  test.describe("Create Template", () => {
    test("should navigate to create template page", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockTemplatesList([]);

      await authedPage.goto("/templates");

      await authedPage.getByRole("link", { name: /Create Template/ }).first().click();
      await expect(authedPage).toHaveURL(/\/templates\/new/);
    });

    test("should navigate via empty state CTA", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockTemplatesList([]);

      await authedPage.goto("/templates");

      await expect(authedPage.getByText("No templates yet")).toBeVisible({ timeout: 5000 });
      await authedPage.getByRole("link", { name: /Create Your First Template/ }).click();
      await expect(authedPage).toHaveURL(/\/templates\/new/);
    });
  });
});
