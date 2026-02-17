import { expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class AnalyticsPage extends BasePage {
  readonly path = "/analytics";

  // ── Locators ──

  get pageTitle() {
    return this.heading("Analytics");
  }
  get subtitle() {
    return this.page.getByText("Transform data into actionable insights");
  }
  get weekTab() {
    return this.page.getByRole("tab", { name: "This Week" });
  }
  get monthTab() {
    return this.page.getByRole("tab", { name: "This Month" });
  }
  get allTimeTab() {
    return this.page.getByRole("tab", { name: "All Time" });
  }
  get keyMetricsSection() {
    return this.page.getByText("Key Metrics");
  }
  get streakCard() {
    return this.page.getByText("Streak").first();
  }
  get workoutsCard() {
    return this.page.getByText("Workouts").first();
  }
  get totalSetsCard() {
    return this.page.getByText("Total Sets").first();
  }
  get durationCard() {
    return this.page.getByText("Duration").first();
  }
  get progressiveOverloadSection() {
    return this.page.getByText("Progressive Overload");
  }
  get muscleBalanceSection() {
    return this.page.getByText("Muscle Balance");
  }
  get additionalMetrics() {
    return this.page.getByText("Additional Metrics");
  }

  // ── Actions ──

  async selectPeriod(period: "week" | "month" | "all") {
    const tabs = { week: this.weekTab, month: this.monthTab, all: this.allTimeTab };
    await tabs[period].click();
  }

  // ── Assertions ──

  async expectMainSectionsVisible() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.keyMetricsSection).toBeVisible();
    await expect(this.progressiveOverloadSection).toBeVisible();
    await expect(this.muscleBalanceSection).toBeVisible();
  }

  async expectStatCards() {
    await expect(this.streakCard).toBeVisible();
    await expect(this.workoutsCard).toBeVisible();
    await expect(this.totalSetsCard).toBeVisible();
    await expect(this.durationCard).toBeVisible();
  }
}
