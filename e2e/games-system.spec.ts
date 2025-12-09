import { test, expect } from "@playwright/test";

test.describe("Games System E2E", () => {
  test("should load games route", async ({ page }) => {
    await page.goto("/games");
    await expect(page.locator("body")).toBeVisible();
  });
});
