import { expect, type Locator } from "@playwright/test";
import { BasePage } from "./base.page";

export class WorkoutsPage extends BasePage {
  readonly path = "/workouts";

  // ── Locators ──

  get pageTitle() {
    return this.heading("Workouts");
  }
  get startWorkoutButton() {
    return this.button(/Start Workout/);
  }
  get typeFilter() {
    return this.page.getByLabel("Filter workouts by type");
  }
  get workoutCards() {
    return this.page.locator('section[aria-label="Workouts list"]').locator("[class*='card']");
  }
  get emptyState() {
    return this.page.getByText("No workouts yet");
  }
  get previousPageButton() {
    return this.button("Go to previous page");
  }
  get nextPageButton() {
    return this.button("Go to next page");
  }
  get paginationInfo() {
    return this.page.locator('[aria-current="page"]');
  }
  get startWorkoutSheet() {
    return this.page.getByRole("dialog");
  }

  // ── Actions ──

  async filterByType(type: string) {
    await this.typeFilter.click();
    await this.page.getByRole("option", { name: type }).click();
  }

  async clickStartWorkout() {
    await this.startWorkoutButton.click();
  }

  async selectEmptyWorkout() {
    await this.startWorkoutSheet.getByText("Empty Workout").click();
  }

  async goToNextPage() {
    await this.nextPageButton.click();
  }

  async goToPreviousPage() {
    await this.previousPageButton.click();
  }

  // ── Assertions ──

  async expectWorkoutCount(count: number) {
    await expect(this.workoutCards).toHaveCount(count);
  }

  async expectEmptyState() {
    await expect(this.emptyState).toBeVisible();
  }

  async expectPagination(current: number, total: number) {
    await expect(this.paginationInfo).toContainText(`Page ${current} of ${total}`);
  }
}
