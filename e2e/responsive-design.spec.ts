import { test, expect } from "./fixtures/omega-test";

test.describe("Responsive Terminal Layout", () => {
  test("renders primary widgets on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await expect(page.getByText("Terminal 1")).toBeVisible();
    await expect(page.getByPlaceholder("Enter command...")).toBeVisible();
    await expect(page.getByText("Ω Terminal v2.0.1")).toBeVisible();
  });

  test("keeps command input accessible on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 720 });
    await page.goto("/");

    await expect(page.getByText("Terminal 1")).toBeVisible();
    await expect(page.getByPlaceholder("Enter command...")).toBeVisible();
  });
});
