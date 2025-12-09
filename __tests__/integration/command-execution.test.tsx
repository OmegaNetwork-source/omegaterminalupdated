import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TerminalContainer } from "@/components/Terminal/TerminalContainer";

const toggleThemeMock = jest.fn();
const toggleViewModeMock = jest.fn();
const cyclePaletteMock = jest.fn();
const executeCommandMock = jest.fn();
const navigateHistoryMock = jest.fn();
const autocompleteMock = jest.fn(() => ["help"]);
const setAiProviderMock = jest.fn();

jest.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ currentTheme: "dark", toggleTheme: toggleThemeMock }),
}));

jest.mock("@/hooks/useWallet", () => ({
  useWallet: () => ({
    state: {
      isConnected: true,
      address: "0x1234567890abcdef1234567890abcdef12345678",
    },
  }),
}));

jest.mock("@/hooks/useViewMode", () => ({
  useViewMode: () => ({
    isBasicMode: false,
    toggleViewMode: toggleViewModeMock,
  }),
}));

jest.mock("@/hooks/useCustomizer", () => ({
  useCustomizer: () => ({ cycleColorPalette: cyclePaletteMock }),
}));

jest.mock("@/hooks/useCommandExecution", () => ({
  useCommandExecution: () => ({
    executeCommand: executeCommandMock,
    terminalLines: [
      { id: "1", type: "command", content: "help", timestamp: Date.now() },
      {
        id: "2",
        type: "output",
        content: "Available commands...",
        timestamp: Date.now(),
      },
    ],
    clearTerminal: jest.fn(),
    commandHistory: ["help"],
    historyIndex: -1,
    navigateHistory: navigateHistoryMock,
    autocomplete: autocompleteMock,
    aiProvider: "off",
    setAiProvider: setAiProviderMock,
    miningState: { isMining: false, mineCount: 0, totalEarned: 0 },
    stressTestState: {
      isStressTesting: false,
      stats: {
        walletsCreated: 0,
        transactionsSent: 0,
        successfulTxs: 0,
        failedTxs: 0,
        startTime: 0,
      },
    },
  }),
}));

jest.mock("@/lib/commands", () => ({
  registerAllCommands: jest.fn(() => Promise.resolve()),
}));

describe("Command Execution Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("executes help command and displays output", async () => {
    render(<TerminalContainer />);

    await waitFor(() =>
      expect(
        screen.queryByText("Initializing command system…")
      ).not.toBeInTheDocument()
    );

    const input = screen.getByPlaceholderText("Enter command...");
    await userEvent.type(input, "help{enter}");

    expect(executeCommandMock).toHaveBeenCalledWith("help");
    expect(screen.getByText("Available commands...")).toBeInTheDocument();
  });

  it("provides autocomplete suggestions on Tab", async () => {
    navigateHistoryMock.mockReturnValueOnce("help");
    render(<TerminalContainer />);
    await waitFor(() =>
      expect(
        screen.queryByText("Initializing command system…")
      ).not.toBeInTheDocument()
    );

    const input = screen.getByPlaceholderText("Enter command...");
    await userEvent.type(input, "he");
    await userEvent.keyboard("{Tab}");

    expect(autocompleteMock).toHaveBeenCalledWith("he");
  });

  it("navigates command history with arrow keys", async () => {
    navigateHistoryMock.mockReturnValue("help");
    render(<TerminalContainer />);
    await waitFor(() =>
      expect(
        screen.queryByText("Initializing command system…")
      ).not.toBeInTheDocument()
    );

    const input = screen.getByPlaceholderText("Enter command...");
    await userEvent.keyboard("{ArrowUp}");

    expect(navigateHistoryMock).toHaveBeenCalledWith("up");
  });

  it("cycles theme via header control", async () => {
    render(<TerminalContainer />);
    const themeButton = await screen.findByTitle("Cycle Theme");
    await userEvent.click(themeButton);
    expect(toggleThemeMock).toHaveBeenCalled();
  });

  it("updates AI provider selection", async () => {
    render(<TerminalContainer />);
    const select = await screen.findByRole("combobox");
    await userEvent.selectOptions(select, "near");
    expect(setAiProviderMock).toHaveBeenCalledWith("near");
  });
});
