import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";

import { useCommandExecution } from "./useCommandExecution";

import { ThemeProvider } from "@/providers/ThemeProvider";
import { SoundEffectsProvider } from "@/providers/SoundEffectsProvider";
import { CustomizerProvider } from "@/providers/CustomizerProvider";
import { ViewModeProvider } from "@/providers/ViewModeProvider";
import { GUIThemeProvider } from "@/providers/GUIThemeProvider";
import { NewsReaderProvider } from "@/providers/NewsReaderProvider";
import { GamesProvider } from "@/providers/GamesProvider";
import { SpotifyProvider } from "@/providers/SpotifyProvider";
import { YouTubeProvider } from "@/providers/YouTubeProvider";
import { MultiChainProvider } from "@/providers/MultiChainProvider";
import { WalletProvider } from "@/providers/WalletProvider";

const suggestions = ["help", "connect", "clear", "theme modern"];
const executeMock = jest.fn();
const getUniqueCommandNamesMock = jest.fn(() => suggestions);

jest.mock("@/lib/commands", () => ({
  commandRegistry: {
    execute: (...args: unknown[]) => executeMock(...args),
    getUniqueCommandNames: () => getUniqueCommandNamesMock(),
  },
}));

const AllProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ThemeProvider>
    <SoundEffectsProvider>
      <CustomizerProvider>
        <ViewModeProvider>
          <GUIThemeProvider>
            <NewsReaderProvider>
              <GamesProvider>
                <SpotifyProvider>
                  <YouTubeProvider>
                    <MultiChainProvider>
                      <WalletProvider>{children}</WalletProvider>
                    </MultiChainProvider>
                  </YouTubeProvider>
                </SpotifyProvider>
              </GamesProvider>
            </NewsReaderProvider>
          </GUIThemeProvider>
        </ViewModeProvider>
      </CustomizerProvider>
    </SoundEffectsProvider>
  </ThemeProvider>
);

describe("useCommandExecution Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("initializes with welcome terminal lines", () => {
    const { result } = renderHook(() => useCommandExecution(), {
      wrapper: AllProviders,
    });

    expect(result.current.terminalLines.length).toBeGreaterThanOrEqual(3);
    expect(result.current.terminalLines[0]!.content).toContain(
      "Omega Terminal"
    );
  });

  it("executes help command", async () => {
    const { result } = renderHook(() => useCommandExecution(), {
      wrapper: AllProviders,
    });

    await act(async () => {
      await result.current.executeCommand("help");
    });

    await waitFor(() => expect(executeMock).toHaveBeenCalled());
    expect(executeMock.mock.calls[0][0]).toBe("help");
    expect(result.current.commandHistory).toContain("help");
  });

  it("executes clear command and clears terminal output", async () => {
    const { result } = renderHook(() => useCommandExecution(), {
      wrapper: AllProviders,
    });

    await act(async () => {
      await result.current.executeCommand("clear");
    });

    act(() => {
      result.current.clearTerminal();
    });

    expect(result.current.terminalLines).toHaveLength(0);
  });

  it("navigates command history up and down", async () => {
    const { result } = renderHook(() => useCommandExecution(), {
      wrapper: AllProviders,
    });

    await act(async () => {
      await result.current.executeCommand("help");
      await result.current.executeCommand("connect");
    });

    const up = result.current.navigateHistory("up");
    expect(up).toBe("connect");

    const upAgain = result.current.navigateHistory("up");
    expect(upAgain).toBe("help");

    const down = result.current.navigateHistory("down");
    expect(down).toBe("connect");
  });

  it("provides autocomplete suggestions", () => {
    const { result } = renderHook(() => useCommandExecution(), {
      wrapper: AllProviders,
    });

    expect(result.current.autocomplete("he")).toEqual(["help"]);
    expect(result.current.autocomplete("")).toEqual(suggestions);
  });

  it("handles command execution errors gracefully", async () => {
    executeMock.mockImplementationOnce(() => {
      throw new Error("Command failed");
    });

    const { result } = renderHook(() => useCommandExecution(), {
      wrapper: AllProviders,
    });

    await act(async () => {
      await result.current.executeCommand("fail");
    });

    await waitFor(() => {
      expect(
        result.current.terminalLines.some((line) => line.type === "error")
      ).toBe(true);
    });
  });

  it("updates AI provider and persists to localStorage", () => {
    const { result } = renderHook(() => useCommandExecution(), {
      wrapper: AllProviders,
    });

    act(() => {
      result.current.setAiProvider("openai");
    });

    expect(result.current.aiProvider).toBe("openai");
    expect(localStorage.getItem("omega-ai-mode")).toBe("openai");
  });

  it("executes wallet connect command", async () => {
    const { result } = renderHook(() => useCommandExecution(), {
      wrapper: AllProviders,
    });

    await act(async () => {
      await result.current.executeCommand("connect");
    });

    await waitFor(() => expect(executeMock).toHaveBeenCalled());
    expect(executeMock.mock.calls.slice(-1)[0]?.[0]).toBe("connect");
  });

  it("executes theme command", async () => {
    const { result } = renderHook(() => useCommandExecution(), {
      wrapper: AllProviders,
    });

    await act(async () => {
      await result.current.executeCommand("theme modern");
    });

    expect(executeMock.mock.calls.slice(-1)[0]?.[0]).toBe("theme modern");
  });

  it("adds commands to history in order", async () => {
    const { result } = renderHook(() => useCommandExecution(), {
      wrapper: AllProviders,
    });

    await act(async () => {
      await result.current.executeCommand("help");
      await result.current.executeCommand("balance");
    });

    expect(result.current.commandHistory).toEqual(["help", "balance"]);
  });
});
