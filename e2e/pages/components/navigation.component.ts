import { type Page, expect } from "@playwright/test";

/**
 * Navigation component — handles sidebar (desktop) and bottom nav (mobile).
 */
export class NavigationComponent {
  constructor(private readonly page: Page) {}

  // ── Sidebar (desktop) ──

  get sidebar() {
    return this.page.locator("aside");
  }
  get sidebarLogo() {
    return this.sidebar.getByText("Workout Tracker");
  }

  sidebarLink(name: string) {
    return this.sidebar.getByRole("link", { name });
  }

  // ── Bottom nav (mobile) ──

  get bottomNav() {
    return this.page.locator("nav").last();
  }

  // ── Header ──

  get header() {
    return this.page.locator("header");
  }
  get userMenuButton() {
    return this.header.getByRole("button").last();
  }
  get themeToggle() {
    return this.header.getByRole("button").first();
  }

  // User dropdown menu items
  get profileMenuItem() {
    return this.page.getByRole("menuitem", { name: "Profile" });
  }
  get settingsMenuItem() {
    return this.page.getByRole("menuitem", { name: "Settings" });
  }
  get logoutMenuItem() {
    return this.page.getByRole("menuitem", { name: "Log out" });
  }

  // ── Actions ──

  async navigateTo(pageName: string) {
    await this.sidebarLink(pageName).click();
  }

  async openUserMenu() {
    await this.userMenuButton.click();
  }

  async logout() {
    await this.openUserMenu();
    await this.logoutMenuItem.click();
  }

  async goToProfile() {
    await this.openUserMenu();
    await this.profileMenuItem.click();
  }

  async toggleTheme() {
    await this.themeToggle.click();
  }

  // ── Assertions ──

  async expectSidebarVisible() {
    await expect(this.sidebar).toBeVisible();
  }

  async expectSidebarHidden() {
    await expect(this.sidebar).toBeHidden();
  }

  async expectActiveLink(name: string) {
    const link = this.sidebarLink(name);
    await expect(link).toHaveClass(/bg-primary/);
  }
}
