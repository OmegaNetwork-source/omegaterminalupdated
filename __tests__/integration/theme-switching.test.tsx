import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ThemeProvider } from "@/providers/ThemeProvider";
import { TerminalHeader } from "@/components/Terminal/TerminalHeader";
import { useTheme } from "@/hooks/useTheme";

const playModernThemeSoundMock = jest.fn();
const playAIToggleSoundMock = jest.fn();

jest.mock("@/hooks/useSoundEffects", () => ({
  useSoundEffects: () => ({
    state: { isEnabled: true },
    playAIToggleSound: playAIToggleSoundMock,
    playWalletConnectSound: jest.fn(),
    playModernUIThemeSound: playModernThemeSoundMock,
    playSound: jest.fn(),
    stopSound: jest.fn(),
    stopAllSounds: jest.fn(),
    setVolume: jest.fn(),
    setEnabled: jest.fn(),
  }),
}));

function ThemeHeaderHarness() {
  const { toggleTheme, setTheme } = useTheme();

  return (
    <TerminalHeader
      onThemeCycle={() => toggleTheme()}
      onPaletteCycle={() => {}}
      onLightDarkToggle={() => setTheme("dark")}
      onDashboardToggle={() => {}}
      aiProvider="off"
      onAiProviderChange={() => {}}
      connectionStatus="disconnected"
      walletAddress={undefined}
    />
  );
}

describe("Theme Switching Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    document.body.className = "";
  });

  it("cycles through themes and updates body classes", async () => {
    render(
      <ThemeProvider>
        <ThemeHeaderHarness />
      </ThemeProvider>
    );

    const cycleButton = screen.getByTitle("Cycle Theme");

    expect(document.body.className).toContain("theme-dark");

    await userEvent.click(cycleButton);
    expect(document.body.className).toContain("theme-light");

    // Advance to modern theme
    for (let i = 0; i < 5; i += 1) {
      await userEvent.click(cycleButton);
    }

    expect(document.body.className).toContain("modern-ui-futuristic");
    expect(playModernThemeSoundMock).toHaveBeenCalled();
    expect(localStorage.getItem("omega-terminal-theme")).toBe("modern");
  });
});
