import { Page, expect } from "@playwright/test";

/**
 * Wait for network to settle (no pending requests for `ms` milliseconds).
 * Prefer this over hard waits.
 */
export async function waitForNetworkIdle(page: Page, ms = 500) {
  await page.waitForLoadState("networkidle", { timeout: ms + 5000 }).catch(() => {
    // networkidle can be flaky; swallow and continue
  });
}

/**
 * Assert that a toast notification appears with the given text.
 * Sonner renders toasts inside [data-sonner-toaster].
 */
export async function expectToast(page: Page, text: string | RegExp) {
  const toast = page.locator("[data-sonner-toaster]").getByText(text);
  await expect(toast).toBeVisible({ timeout: 5000 });
}

/**
 * Assert the current URL matches the expected path.
 */
export async function expectURL(page: Page, path: string | RegExp) {
  if (typeof path === "string") {
    await expect(page).toHaveURL(new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  } else {
    await expect(page).toHaveURL(path);
  }
}

/**
 * Assert page has no accessibility violations for a heading structure.
 * (Lightweight check — not a full a11y audit.)
 */
export async function expectHeadingPresent(page: Page, text: string | RegExp) {
  const heading = page.getByRole("heading", { name: text });
  await expect(heading).toBeVisible();
}

/**
 * Check that skeleton loaders disappear (content has loaded).
 */
export async function waitForSkeletonsToDisappear(page: Page) {
  const skeletons = page.locator('[class*="skeleton"], [data-slot="skeleton"]');
  // Wait until no skeletons are visible (they may not exist at all)
  await expect(async () => {
    const count = await skeletons.count();
    expect(count).toBe(0);
  }).toPass({ timeout: 10_000 });
}

/**
 * Generate a unique string for test isolation.
 */
export function uniqueId(prefix = "test") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
