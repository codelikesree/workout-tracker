import { test, expect } from "../fixtures/test-fixtures";


test.describe("Authentication", () => {
  // ────────────────────────────────────────
  // Login
  // ────────────────────────────────────────

  test.describe("Login Page", () => {
    test("should display the login form", async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.expectCardVisible();
      await expect(loginPage.usernameInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.submitButton).toBeVisible();
      await expect(loginPage.signupLink).toBeVisible();
    });

    test("should show validation errors for empty fields", async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.submitButton.click();
      await loginPage.expectValidationError("Username or email is required");
      await loginPage.expectValidationError("Password is required");
    });

    test("should show error for invalid credentials", async ({ loginPage, page }) => {
      await loginPage.goto();

      // Mock the NextAuth signIn to return an error
      await page.route("**/api/auth/callback/credentials", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Invalid credentials",
            status: 401,
            ok: false,
            url: null,
          }),
        });
      });

      await loginPage.login("baduser", "badpassword");
      await loginPage.expectToast(/Invalid credentials|Something went wrong/);
    });

    test("should show loading state while signing in", async ({ loginPage, page }) => {
      await loginPage.goto();

      // Delay the auth response to observe loading state
      await page.route("**/api/auth/callback/credentials", async (route) => {
        await new Promise((r) => setTimeout(r, 1000));
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ error: null, ok: true, url: "/dashboard" }),
        });
      });

      await loginPage.usernameInput.fill("testuser");
      await loginPage.passwordInput.fill("password");
      await loginPage.submitButton.click();
      await loginPage.expectSubmitLoading();
    });

    test("should navigate to signup page via link", async ({ loginPage, page }) => {
      await loginPage.goto();
      await loginPage.signupLink.click();
      await expect(page).toHaveURL(/\/signup/);
    });

    test("should preserve callbackUrl when navigating to signup", async ({ loginPage, page }) => {
      await page.goto("/login?callbackUrl=%2Fworkouts");
      await loginPage.signupLink.click();
      await expect(page).toHaveURL(/\/signup\?callbackUrl=/);
    });
  });

  // ────────────────────────────────────────
  // Signup
  // ────────────────────────────────────────

  test.describe("Signup Page", () => {
    test("should display the signup form", async ({ signupPage }) => {
      await signupPage.goto();
      await signupPage.expectCardVisible();
      await expect(signupPage.usernameInput).toBeVisible();
      await expect(signupPage.emailInput).toBeVisible();
      await expect(signupPage.passwordInput).toBeVisible();
      await expect(signupPage.confirmPasswordInput).toBeVisible();
      await expect(signupPage.submitButton).toBeVisible();
    });

    test("should validate minimum username length", async ({ signupPage }) => {
      await signupPage.goto();
      await signupPage.fillForm({
        username: "ab",
        email: "test@test.com",
        password: "Test1234!",
        confirmPassword: "Test1234!",
      });
      await signupPage.submitForm();
      await signupPage.expectValidationError(/at least 3 characters/);
    });

    test("should validate username format (no special chars)", async ({ signupPage }) => {
      await signupPage.goto();
      await signupPage.fillForm({
        username: "bad@user!",
        email: "test@test.com",
        password: "Test1234!",
        confirmPassword: "Test1234!",
      });
      await signupPage.submitForm();
      await signupPage.expectValidationError(/letters, numbers, and underscores/);
    });

    test("should validate email format", async ({ signupPage }) => {
      await signupPage.goto();
      await signupPage.fillForm({
        username: "testuser",
        email: "notanemail",
        password: "Test1234!",
        confirmPassword: "Test1234!",
      });
      await signupPage.submitForm();
      // Browser native validation prevents form submission for invalid email
      // Verify we stay on the signup page
      await signupPage.expectToBeOnPage();
    });

    test("should validate minimum password length", async ({ signupPage }) => {
      await signupPage.goto();
      await signupPage.fillForm({
        username: "testuser",
        email: "test@test.com",
        password: "12345",
        confirmPassword: "12345",
      });
      await signupPage.submitForm();
      await signupPage.expectValidationError(/at least 6 characters/);
    });

    test("should validate password confirmation match", async ({ signupPage }) => {
      await signupPage.goto();
      await signupPage.fillForm({
        username: "testuser",
        email: "test@test.com",
        password: "Test1234!",
        confirmPassword: "DifferentPass!",
      });
      await signupPage.submitForm();
      await signupPage.expectValidationError(/don't match/);
    });

    test("should navigate to login page via link", async ({ signupPage, page }) => {
      await signupPage.goto();
      await signupPage.loginLink.click();
      await expect(page).toHaveURL(/\/login/);
    });

    test("should show loading state during signup", async ({ signupPage, page }) => {
      await signupPage.goto();

      // Mock signup API to delay
      await page.route("**/api/auth/signup", async (route) => {
        await new Promise((r) => setTimeout(r, 1000));
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ id: "1", username: "newuser", email: "new@test.com" }),
        });
      });

      await signupPage.fillForm({
        username: "newuser",
        email: "new@test.com",
        password: "Test1234!",
        confirmPassword: "Test1234!",
      });
      await signupPage.submitForm();
      await expect(page.getByRole("button", { name: "Creating account..." })).toBeVisible();
    });
  });

  // ────────────────────────────────────────
  // Auth Guards (middleware)
  // ────────────────────────────────────────

  test.describe("Route Protection", () => {
    test("should redirect unauthenticated user from dashboard to login", async ({ page }) => {
      // Clear any auth state by using a fresh context
      await page.goto("/dashboard");
      // Middleware should redirect to /login (with callbackUrl)
      await expect(page).toHaveURL(/\/login/);
    });

    test("should redirect unauthenticated user from workouts to login", async ({ page }) => {
      await page.goto("/workouts");
      await expect(page).toHaveURL(/\/login/);
    });

    test("should redirect unauthenticated user from templates to login", async ({ page }) => {
      await page.goto("/templates");
      await expect(page).toHaveURL(/\/login/);
    });

    test("should redirect unauthenticated user from analytics to login", async ({ page }) => {
      await page.goto("/analytics");
      await expect(page).toHaveURL(/\/login/);
    });

    test("should redirect unauthenticated user from profile to login", async ({ page }) => {
      await page.goto("/profile");
      await expect(page).toHaveURL(/\/login/);
    });
  });

  // ────────────────────────────────────────
  // Logout
  // ────────────────────────────────────────

  test.describe("Logout", () => {
    test("should log out and redirect to login", async ({ nav, authedPage }) => {
      await authedPage.goto("/dashboard");
      await nav.logout();
      await expect(authedPage).toHaveURL(/\/login/);
    });
  });
});
