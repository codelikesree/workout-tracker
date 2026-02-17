import { expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class ProfilePage extends BasePage {
  readonly path = "/profile";

  // ── Locators ──

  get pageTitle() {
    return this.heading("Profile");
  }
  get accountInfoCard() {
    return this.page.getByText("Account Information");
  }
  get personalInfoCard() {
    return this.page.getByText("Personal Information");
  }
  get fullNameInput() {
    return this.input("Full Name");
  }
  get ageInput() {
    return this.input("Age");
  }
  get heightInput() {
    return this.input("Height");
  }
  get weightInput() {
    return this.input("Weight");
  }
  get saveButton() {
    return this.button(/Save Changes/);
  }
  get usernameDisplay() {
    return this.page.locator("text=Username").locator("..");
  }
  get emailDisplay() {
    return this.page.locator("text=Email").locator("..");
  }

  // ── Actions ──

  async fillProfile(data: {
    fullName?: string;
    age?: string;
    height?: string;
    weight?: string;
  }) {
    if (data.fullName !== undefined) {
      await this.fullNameInput.clear();
      await this.fullNameInput.fill(data.fullName);
    }
    if (data.age !== undefined) {
      await this.ageInput.clear();
      await this.ageInput.fill(data.age);
    }
    if (data.height !== undefined) {
      await this.heightInput.clear();
      await this.heightInput.fill(data.height);
    }
    if (data.weight !== undefined) {
      await this.weightInput.clear();
      await this.weightInput.fill(data.weight);
    }
  }

  async saveProfile() {
    await this.saveButton.click();
  }

  // ── Assertions ──

  async expectAccountInfo(username: string, email: string) {
    await expect(this.page.getByText(username)).toBeVisible();
    await expect(this.page.getByText(email)).toBeVisible();
  }

  async expectSaving() {
    await expect(this.button("Saving...")).toBeVisible();
  }
}
