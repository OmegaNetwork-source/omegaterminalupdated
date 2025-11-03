import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures/omega-test";

const runCommand = async (page: Page, command: string) => {
  const input = page.getByPlaceholder("Enter command...");
  await input.fill(command);
  await input.press("Enter");
};

const waitForTerminalReady = async (page: Page) => {
  const input = page.getByPlaceholder("Enter command...");
  await expect(input).toBeEnabled();
  await page.waitForSelector("text=Initializing command system…", {
    state: "detached",
    timeout: 30_000,
  });
};

test.describe("GUI Theme Transformations", () => {
  test("switches between terminal and chat layouts", async ({ page }) => {
    await page.goto("/");
    await waitForTerminalReady(page);

    await runCommand(page, "gui chatgpt");
    await expect(page.locator("body")).toContainText("GUI set to: chatgpt");

    await expect(
      page.getByRole("heading", { name: "Omega Chat" })
    ).toBeVisible();
    await expect(page.getByPlaceholder("Ask anything...")).toBeVisible();

    await page.getByRole("button", { name: "\u2190 Terminal" }).click();
    await expect(page.getByPlaceholder("Enter command...")).toBeVisible();

    await runCommand(page, "gui terminal");
    await expect(page.getByTestId("terminal-container")).toContainText(
      "GUI set to: terminal"
    );
  });
});
