import { test, expect } from "./fixtures/omega-test";

test.describe("Media Panel Interactions", () => {
  test("opens Spotify, YouTube, and News panels", async ({ page }) => {
    await page.goto("/media");
    await expect(
      page.getByRole("heading", { name: "Omega Media Hub" })
    ).toBeVisible();

    await page.getByRole("button", { name: "Open Spotify Panel" }).click();
    await expect(page.getByRole("heading", { name: "Spotify" })).toBeVisible();
    await expect(page.getByText("Connect to Spotify")).toBeVisible();
    await page.getByRole("button", { name: "Close Spotify panel" }).click();

    await page.getByRole("button", { name: "Open YouTube Panel" }).click();
    await expect(page.getByRole("heading", { name: "YouTube" })).toBeVisible();
    await expect(
      page.getByText("Loading player...", { exact: false })
    ).toBeVisible();
    await page.getByRole("button", { name: "Close YouTube panel" }).click();

    await page.getByRole("button", { name: "Open News Reader" }).click();
    await expect(
      page.getByRole("heading", { name: "Crypto News" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Close news panel" })
    ).toBeVisible();
    await page.getByRole("button", { name: "Close news panel" }).click();
  });
});
