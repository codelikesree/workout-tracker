import { expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class SignupPage extends BasePage {
  readonly path = "/signup";

  // ── Locators ──

  get usernameInput() {
    return this.input("Username");
  }
  get emailInput() {
    return this.input("Email");
  }
  /** Use exact match to avoid matching "Confirm Password" */
  get passwordInput() {
    return this.page.getByLabel("Password", { exact: true });
  }
  get confirmPasswordInput() {
    return this.input("Confirm Password");
  }
  get submitButton() {
    return this.button(/Create account/);
  }
  get loginLink() {
    return this.link("Sign in");
  }
  /** CardTitle is a <div>, not a heading element */
  get cardTitle() {
    return this.page.locator('[data-slot="card-title"]').getByText("Create an account");
  }

  // ── Actions ──

  async fillForm(data: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) {
    await this.usernameInput.fill(data.username);
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    await this.confirmPasswordInput.fill(data.confirmPassword);
  }

  async submitForm() {
    await this.submitButton.click();
  }

  // ── Assertions ──

  async expectCardVisible() {
    await expect(this.cardTitle).toBeVisible();
  }

  async expectValidationError(text: string | RegExp) {
    await expect(this.page.getByText(text)).toBeVisible();
  }
}
