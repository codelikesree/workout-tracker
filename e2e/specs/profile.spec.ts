import { test, expect } from "../fixtures/test-fixtures";
import { APIMock } from "../helpers/api-mock";

test.describe("Profile", () => {
  test.describe("Page Layout", () => {
    test("should display page title and sections", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockProfile();

      await authedPage.goto("/profile");

      await expect(authedPage.getByRole("heading", { name: "Profile" })).toBeVisible();
      await expect(authedPage.getByText("Account Information")).toBeVisible({ timeout: 5000 });
      await expect(authedPage.getByText("Personal Information")).toBeVisible();
    });

    test("should display account info (read-only)", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockProfile({
        username: "johndoe",
        email: "john@example.com",
      });

      await authedPage.goto("/profile");

      await expect(authedPage.getByText("johndoe")).toBeVisible({ timeout: 5000 });
      await expect(authedPage.getByText("john@example.com")).toBeVisible();
    });
  });

  test.describe("Profile Form", () => {
    test("should pre-fill form with existing profile data", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockProfile({
        fullName: "John Doe",
        age: 28,
        height: 180,
        weight: 75,
      });

      await authedPage.goto("/profile");

      // Wait for data to load
      await expect(authedPage.getByText("Personal Information")).toBeVisible({ timeout: 5000 });

      // Inputs should be pre-filled
      await expect(authedPage.getByLabel("Full Name")).toHaveValue("John Doe");
      await expect(authedPage.getByLabel("Age")).toHaveValue("28");
    });

    test("should have a save button", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockProfile();

      await authedPage.goto("/profile");

      await expect(authedPage.getByRole("button", { name: /Save Changes/ })).toBeVisible({ timeout: 5000 });
    });

    test("should show saving state when submitting", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockProfile();

      // Delay the update API response
      await authedPage.route("**/api/users/me", async (route) => {
        if (route.request().method() === "PUT") {
          await new Promise((r) => setTimeout(r, 1500));
          await route.fulfill({
            status: 200,
            body: JSON.stringify({ user: { username: "testuser" } }),
          });
        } else {
          await route.fallback();
        }
      });

      await authedPage.goto("/profile");
      await expect(authedPage.getByRole("button", { name: /Save Changes/ })).toBeVisible({ timeout: 5000 });

      await authedPage.getByLabel("Full Name").fill("Updated Name");
      await authedPage.getByRole("button", { name: /Save Changes/ }).click();

      await expect(authedPage.getByRole("button", { name: "Saving..." })).toBeVisible();
    });

    test("should submit updated profile data", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockProfile({ fullName: "", age: undefined, height: undefined, weight: undefined });

      // Capture the PUT request
      let capturedBody: Record<string, unknown> | null = null;
      await authedPage.route("**/api/users/me", async (route) => {
        if (route.request().method() === "PUT") {
          capturedBody = JSON.parse(route.request().postData() || "{}");
          await route.fulfill({
            status: 200,
            body: JSON.stringify({ user: { username: "testuser" } }),
          });
        } else {
          await route.fallback();
        }
      });

      await authedPage.goto("/profile");
      await expect(authedPage.getByLabel("Full Name")).toBeVisible({ timeout: 5000 });

      await authedPage.getByLabel("Full Name").fill("Jane Smith");
      await authedPage.getByLabel("Age").fill("30");
      await authedPage.getByRole("button", { name: /Save Changes/ }).click();

      // Wait for the request
      await authedPage.waitForTimeout(1000);

      expect(capturedBody).not.toBeNull();
      expect(capturedBody!.fullName).toBe("Jane Smith");
      expect(capturedBody!.age).toBe(30);
    });
  });

  test.describe("Unit Selection", () => {
    test("should have height and weight unit selectors", async ({ authedPage }) => {
      const apiMock = new APIMock(authedPage);
      await apiMock.mockProfile();

      await authedPage.goto("/profile");

      // The height and weight sections should have unit dropdowns
      await expect(authedPage.getByLabel("Height")).toBeVisible({ timeout: 5000 });
      await expect(authedPage.getByLabel("Weight")).toBeVisible();
    });
  });

  test.describe("Loading State", () => {
    test("should show skeleton while loading", async ({ authedPage }) => {
      await authedPage.route("**/api/users/me", async (route) => {
        await new Promise((r) => setTimeout(r, 2000));
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ user: { username: "test", email: "test@test.com", heightUnit: "cm", weightUnit: "kg" } }),
        });
      });

      await authedPage.goto("/profile");

      const skeleton = authedPage.locator('[data-slot="skeleton"]');
      await expect(skeleton.first()).toBeVisible({ timeout: 2000 });
    });
  });
});
