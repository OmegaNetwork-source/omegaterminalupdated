import { test, expect } from "./fixtures/omega-test";

test.describe("Wallet Connection Journeys", () => {
  test("connects via MetaMask, session wallet, and import flows @smoke", async ({
    page,
  }) => {
    await page.goto("/wallet");

    const heading = page.getByRole("heading", { name: "Connect Wallet" });
    await expect(heading).toBeVisible();

    // MetaMask connection flow
    await page.getByRole("button", { name: "Connect MetaMask" }).click();
    await expect(
      page.getByText("Successfully connected to MetaMask!", { exact: false })
    ).toBeVisible();
    await expect(page.getByText("MetaMask")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Disconnect" })
    ).toBeVisible();

    await page.getByRole("button", { name: "Disconnect" }).click();
    await expect(page.getByText("Wallet disconnected")).toBeVisible();
    await expect(heading).toBeVisible();

    // Session wallet creation flow
    await page.getByRole("button", { name: "Create New Wallet" }).click();
    await expect(
      page.getByText("Session wallet created!", { exact: false })
    ).toBeVisible();
    await expect(page.getByText("Session Wallet")).toBeVisible();

    await page.getByRole("button", { name: "Disconnect" }).click();
    await expect(page.getByText("Wallet disconnected")).toBeVisible();

    // Import wallet flow
    await page.getByRole("button", { name: "Show Import Options" }).click();
    const privateKey = `0x${"11".repeat(32)}`;
    await page.getByPlaceholder("0x...").fill(privateKey);
    await page.getByRole("button", { name: "Import Wallet" }).click();

    await expect(
      page.getByText("Wallet imported successfully!", { exact: false })
    ).toBeVisible();
    await expect(page.getByText("Imported Wallet")).toBeVisible();
  });
});
