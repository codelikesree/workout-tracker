import { expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class ActiveWorkoutPage extends BasePage {
  readonly path = "/workout/active";

  // ── Locators ──

  get workoutName() {
    return this.page.locator("h1");
  }
  get timer() {
    return this.page.locator("text=/\\d+:\\d+/").first();
  }
  get setsProgress() {
    return this.page.getByText(/\d+\/\d+ sets/);
  }
  get finishButton() {
    return this.button(/Finish/);
  }
  get discardButton() {
    // The X button that opens discard dialog
    return this.page.locator("button").filter({ has: this.page.locator("svg.lucide-x") }).first();
  }
  get addExerciseButton() {
    return this.button(/Add Exercise/);
  }
  get exerciseCards() {
    return this.page.locator("[class*='card'], [class*='rounded-xl']").filter({
      has: this.page.locator("button"),
    });
  }

  // Discard dialog
  get discardDialog() {
    return this.page.getByRole("dialog");
  }
  get confirmDiscardButton() {
    return this.discardDialog.getByRole("button", { name: /Discard/i });
  }
  get cancelDiscardButton() {
    return this.discardDialog.getByRole("button", { name: /Cancel/i });
  }

  // Add exercise flow
  get exerciseSearchInput() {
    return this.page.getByPlaceholder("Search exercise...");
  }
  get addButton() {
    return this.page.getByRole("button", { name: "Add" }).last();
  }
  get cancelAddButton() {
    return this.page.getByRole("button", { name: "Cancel" }).last();
  }

  // ── Actions ──

  async clickFinish() {
    await this.finishButton.click();
  }

  async openDiscardDialog() {
    await this.discardButton.click();
  }

  async confirmDiscard() {
    await this.confirmDiscardButton.click();
  }

  async cancelDiscard() {
    await this.cancelDiscardButton.click();
  }

  async startAddExercise() {
    await this.addExerciseButton.click();
  }

  async searchExercise(name: string) {
    await this.exerciseSearchInput.fill(name);
  }

  async confirmAddExercise() {
    await this.addButton.click();
  }

  // ── Assertions ──

  async expectWorkoutName(name: string) {
    await expect(this.workoutName).toContainText(name);
  }

  async expectTimerRunning() {
    await expect(this.timer).toBeVisible();
  }

  async expectFinishButtonVisible() {
    await expect(this.finishButton).toBeVisible();
  }
}
