import { expect, type Locator } from "@playwright/test";
import { BasePage } from "./base.page";

export class DashboardPage extends BasePage {
  readonly path = "/dashboard";

  // ── Locators ──

  get greeting() {
    return this.page.getByRole("heading", { level: 1 });
  }
  get readyToTrain() {
    return this.page.getByText("Ready to train?");
  }
  get startWorkoutSection() {
    return this.page.locator('section[aria-label="Start new workout"]');
  }
  get recentTemplatesSection() {
    return this.page.locator('section[aria-label="Recent templates"]');
  }
  get quickStatsSection() {
    return this.page.locator('section[aria-label="Quick statistics"]');
  }
  get analyticsLink() {
    return this.link(/Analytics/);
  }
  get newTemplateLink() {
    return this.link(/New Template/);
  }
  get resumeBanner() {
    return this.page.locator('section[aria-label="Active workout"]');
  }

  // ── Actions ──

  async clickStartWorkout() {
    // The start workout CTA is inside the start section
    await this.startWorkoutSection.getByRole("button").first().click();
  }

  // ── Assertions ──

  async expectGreeting(name?: string) {
    if (name) {
      await expect(this.greeting).toContainText(`Hey, ${name}`);
    } else {
      await expect(this.greeting).toContainText("Hey,");
    }
  }

  async expectQuickLinksVisible() {
    await expect(this.analyticsLink).toBeVisible();
    await expect(this.newTemplateLink).toBeVisible();
  }
}
