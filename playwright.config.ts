import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e/specs",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [["html", { open: "never" }], ["github"]]
    : [["html", { open: "on-failure" }]],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  projects: [
    // Auth setup - runs before all tests that need authentication
    { name: "setup", testDir: "./e2e/fixtures", testMatch: "auth.setup.ts" },

    // Desktop Chrome
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },

    // Mobile Safari
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 14"] },
      dependencies: ["setup"],
    },

    // Mobile Chrome
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
      dependencies: ["setup"],
    },
  ],

  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
