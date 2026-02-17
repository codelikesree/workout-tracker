import { expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class TemplatesPage extends BasePage {
  readonly path = "/templates";

  // ── Locators ──

  get pageTitle() {
    return this.heading("Templates");
  }
  get createTemplateButton() {
    return this.button(/Create Template/);
  }
  get emptyState() {
    return this.page.getByText("No templates yet");
  }
  get templateCards() {
    return this.page.locator("[class*='card']").filter({ hasText: /.+/ });
  }

  // ── Actions ──

  async clickCreateTemplate() {
    await this.createTemplateButton.click();
  }

  /** Open the 3-dot menu on a template card by its name */
  async openCardMenu(templateName: string) {
    const card = this.page.locator("[class*='card']").filter({ hasText: templateName });
    await card.getByRole("button").filter({ has: this.page.locator("svg") }).first().click();
  }

  async deleteTemplate(templateName: string) {
    await this.openCardMenu(templateName);
    await this.page.getByRole("menuitem", { name: "Delete" }).click();
    // Confirm the delete dialog
    await this.page.getByRole("button", { name: /Delete/ }).last().click();
  }

  async startWorkoutFromTemplate(templateName: string) {
    await this.openCardMenu(templateName);
    await this.page.getByRole("menuitem", { name: "Start Workout" }).click();
  }

  async viewTemplateDetails(templateName: string) {
    await this.openCardMenu(templateName);
    await this.page.getByRole("menuitem", { name: "View Details" }).click();
  }

  async editTemplate(templateName: string) {
    await this.openCardMenu(templateName);
    await this.page.getByRole("menuitem", { name: "Edit" }).click();
  }

  // ── Assertions ──

  async expectEmptyState() {
    await expect(this.emptyState).toBeVisible();
  }

  async expectTemplateVisible(name: string) {
    await expect(this.page.getByText(name).first()).toBeVisible();
  }
}
