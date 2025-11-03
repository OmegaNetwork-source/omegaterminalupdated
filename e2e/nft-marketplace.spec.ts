import { test, expect } from "./fixtures/omega-test";

test.describe("NFT Marketplace", () => {
  test("loads gallery and expands results", async ({ page }) => {
    await page.goto("/nft");

    await expect(
      page.getByRole("heading", { name: "Omega NFT Collections" })
    ).toBeVisible();

    const viewButtons = page.getByRole("button", { name: "View" });
    await expect(viewButtons).toHaveCount(24);
    await expect(page.getByText("Omega Artifact #000")).toBeVisible();

    await page.getByRole("button", { name: "Load More NFTs" }).click();
    await expect(viewButtons).toHaveCount(36);
    await expect(page.getByText("Omega Artifact #024")).toBeVisible();

    const firstCard = page.getByText("Omega Artifact #000").first();
    await expect(firstCard).toBeVisible();
    await expect(viewButtons.first()).toBeVisible();
  });
});
