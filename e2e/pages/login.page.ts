import { expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class LoginPage extends BasePage {
  readonly path = "/login";

  // ── Locators ──

  get usernameInput() {
    return this.input("Username or Email");
  }
  get passwordInput() {
    return this.input("Password");
  }
  get submitButton() {
    return this.button(/Sign in/);
  }
  get signupLink() {
    return this.link("Sign up");
  }
  /** CardTitle is a <div>, not a heading element */
  get cardTitle() {
    return this.page.locator('[data-slot="card-title"]').getByText("Welcome back");
  }

  // ── Actions ──

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async loginAndWaitForDashboard(username: string, password: string) {
    await this.login(username, password);
    await this.page.waitForURL("**/dashboard", { timeout: 15_000 });
  }

  // ── Assertions ──

  async expectCardVisible() {
    await expect(this.cardTitle).toBeVisible();
  }

  async expectValidationError(text: string | RegExp) {
    await expect(this.page.getByText(text)).toBeVisible();
  }

  async expectSubmitDisabled() {
    await expect(this.submitButton).toBeDisabled();
  }

  async expectSubmitLoading() {
    await expect(this.button("Signing in...")).toBeVisible();
  }
}
