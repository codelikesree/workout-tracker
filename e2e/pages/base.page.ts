import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Base Page Object — every POM extends this.
 * Provides shared helpers for navigation, waiting, and assertions.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** The route path for this page (override in subclasses) */
  abstract readonly path: string;

  /** Navigate to this page */
  async goto() {
    await this.page.goto(this.path);
    await this.page.waitForLoadState("domcontentloaded");
  }

  /** Assert we are on this page */
  async expectToBeOnPage() {
    await expect(this.page).toHaveURL(new RegExp(this.path));
  }

  /** Get the main heading of the page */
  heading(text: string | RegExp): Locator {
    return this.page.getByRole("heading", { name: text });
  }

  /** Get a button by its accessible name */
  button(name: string | RegExp): Locator {
    return this.page.getByRole("button", { name });
  }

  /** Get a link by its accessible name */
  link(name: string | RegExp): Locator {
    return this.page.getByRole("link", { name });
  }

  /** Get a text input by its label */
  input(label: string): Locator {
    return this.page.getByLabel(label);
  }

  /** Assert that loading skeletons are gone */
  async waitForContentLoad() {
    await expect(async () => {
      const skeletons = this.page.locator('[data-slot="skeleton"]');
      expect(await skeletons.count()).toBe(0);
    }).toPass({ timeout: 10_000 });
  }

  /** Assert a toast message is visible */
  async expectToast(text: string | RegExp) {
    const toast = this.page.locator("[data-sonner-toaster]").getByText(text);
    await expect(toast).toBeVisible({ timeout: 5000 });
  }
}
