import { test as base, expect, type Page } from "@playwright/test";
import path from "path";
import { APIMock } from "../helpers/api-mock";
import { LoginPage } from "../pages/login.page";
import { SignupPage } from "../pages/signup.page";
import { DashboardPage } from "../pages/dashboard.page";
import { WorkoutsPage } from "../pages/workouts.page";
import { TemplatesPage } from "../pages/templates.page";
import { AnalyticsPage } from "../pages/analytics.page";
import { ProfilePage } from "../pages/profile.page";
import { ActiveWorkoutPage } from "../pages/active-workout.page";
import { NavigationComponent } from "../pages/components/navigation.component";

const AUTH_FILE = path.join(__dirname, ".auth", "user.json");

// ── Extend Playwright test with custom fixtures ──

type Fixtures = {
  /** Pre-authenticated page */
  authedPage: Page;
  /** API mocking helper */
  apiMock: APIMock;
  /** Page objects */
  loginPage: LoginPage;
  signupPage: SignupPage;
  dashboardPage: DashboardPage;
  workoutsPage: WorkoutsPage;
  templatesPage: TemplatesPage;
  analyticsPage: AnalyticsPage;
  profilePage: ProfilePage;
  activeWorkoutPage: ActiveWorkoutPage;
  nav: NavigationComponent;
};

/**
 * Base test fixture with all page objects and helpers wired up.
 * Use `authedPage` when you need a pre-authenticated session.
 */
export const test = base.extend<Fixtures>({
  // Authenticated page fixture — loads saved auth state
  authedPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: AUTH_FILE });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  apiMock: async ({ page }, use) => {
    await use(new APIMock(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  signupPage: async ({ page }, use) => {
    await use(new SignupPage(page));
  },

  dashboardPage: async ({ authedPage }, use) => {
    await use(new DashboardPage(authedPage));
  },

  workoutsPage: async ({ authedPage }, use) => {
    await use(new WorkoutsPage(authedPage));
  },

  templatesPage: async ({ authedPage }, use) => {
    await use(new TemplatesPage(authedPage));
  },

  analyticsPage: async ({ authedPage }, use) => {
    await use(new AnalyticsPage(authedPage));
  },

  profilePage: async ({ authedPage }, use) => {
    await use(new ProfilePage(authedPage));
  },

  activeWorkoutPage: async ({ authedPage }, use) => {
    await use(new ActiveWorkoutPage(authedPage));
  },

  nav: async ({ authedPage }, use) => {
    await use(new NavigationComponent(authedPage));
  },
});

export { expect };
