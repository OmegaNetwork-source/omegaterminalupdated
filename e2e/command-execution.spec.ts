import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures/omega-test";

const runCommand = async (page: Page, command: string) => {
  const input = page.getByPlaceholder("Enter command...");
  await input.fill(command);
  await input.press("Enter");
};

test.describe("Terminal Command Execution", () => {
  test("executes help, connect, balance, and theme commands @smoke", async ({
    page,
  }) => {
    await page.goto("/");

    const commandInput = page.getByPlaceholder("Enter command...");
    await expect(commandInput).toBeVisible();
    await expect(commandInput).toBeEnabled();

    await page.waitForSelector("text=Initializing command system…", {
      state: "detached",
      timeout: 30_000,
    });

    // Help command
    await runCommand(page, "help");
    await expect(page.getByTestId("terminal-container")).toContainText(
      "=== Ω Terminal v2.0.1 Commands ==="
    );

    // Connect command (uses mocked MetaMask)
    await runCommand(page, "connect");
    await expect(page.getByTestId("terminal-container")).toContainText(
      "Wallet connected successfully"
    );
    await expect(page.getByTestId("terminal-container")).toContainText(
      "Balance:"
    );

    // Balance command to verify wallet context
    await runCommand(page, "balance");
    await expect(page.getByTestId("terminal-container")).toContainText(
      "EVM WALLET BALANCE"
    );

    // Theme command updates global theme classes
    await runCommand(page, "theme executive");
    await expect(page.getByTestId("terminal-container")).toContainText(
      "Theme set to: executive"
    );

    await expect
      .poll(async () => {
        return await page.evaluate(() => Array.from(document.body.classList));
      })
      .toContain("theme-executive");
  });
});
