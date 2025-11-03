import { test, expect } from "@playwright/test";

test.describe("View Mode Switching E2E", () => {
  test("should render basic mode by default", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Terminal 1")).toBeVisible();
  });
});
