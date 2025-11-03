import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures/omega-test";

const runCommand = async (page: Page, command: string) => {
  const input = page.getByPlaceholder("Enter command...");
  await input.fill(command);
  await input.press("Enter");
};

const ensureReady = async (page: Page) => {
  const input = page.getByPlaceholder("Enter command...");
  await expect(input).toBeEnabled();
  await page.waitForSelector("text=Initializing command system…", {
    state: "detached",
    timeout: 30_000,
  });
};

test.describe("Mining Workflow", () => {
  test("starts mining and claims rewards @smoke", async ({ page }) => {
    await page.goto("/");
    await ensureReady(page);

    await runCommand(page, "connect");
    await expect(page.getByTestId("terminal-container")).toContainText(
      "Wallet connected successfully"
    );

    await runCommand(page, "mine");
    await expect(page.getByTestId("terminal-container")).toContainText(
      "Starting automated mining session"
    );
    await expect(page.getByTestId("terminal-container")).toContainText(
      "Mining successful! Reward: +0.25 OMEGA"
    );

    await runCommand(page, "claim");
    await expect(page.getByTestId("terminal-container")).toContainText(
      "Rewards claimed successfully"
    );

    await runCommand(page, "stop");
    await expect(page.getByTestId("terminal-container")).toContainText(
      "Mining stopped"
    );
  });
});
