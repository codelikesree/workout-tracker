import { test as setup } from "@playwright/test";
import path from "path";

const AUTH_FILE = path.join(__dirname, ".auth", "user.json");

/**
 * Global auth setup: creates a test user (if needed), logs in,
 * and saves the storage state so all subsequent tests start authenticated.
 */
setup("authenticate", async ({ page, request }) => {
  const username = process.env.E2E_USERNAME || "e2etester";
  const email = process.env.E2E_EMAIL || "e2e@test.com";
  const password = process.env.E2E_PASSWORD || "Test1234!";

  // Step 1: Ensure the test user exists (ignore "already taken" errors)
  const signupResponse = await request.post("/api/auth/signup", {
    data: { username, email, password },
  });
  // 201 = created, 400 = already exists — both are fine
  if (signupResponse.status() !== 201 && signupResponse.status() !== 400) {
    const body = await signupResponse.text();
    throw new Error(`Unexpected signup response ${signupResponse.status()}: ${body}`);
  }

  // Step 2: Log in via the UI
  await page.goto("/login");
  await page.getByLabel("Username or Email").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  // Wait for navigation to dashboard
  await page.waitForURL("**/dashboard", { timeout: 15_000 });

  // Step 3: Save signed-in state
  await page.context().storageState({ path: AUTH_FILE });
});
