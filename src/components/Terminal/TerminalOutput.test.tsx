import React from "react";
import { render, screen } from "@testing-library/react";

import { TerminalOutput } from "./TerminalOutput";
import type { TerminalLine } from "@/types/terminal";

const createLine = (overrides: Partial<TerminalLine>): TerminalLine => ({
  id: overrides.id ?? Math.random().toString(36),
  type: "output",
  content: "content",
  timestamp: Date.now(),
  ...overrides,
});

describe("TerminalOutput Component", () => {
  it("renders command lines with prompt", () => {
    const lines = [createLine({ type: "command", content: "help" })];
    render(<TerminalOutput lines={lines} isScrolling />);

    expect(screen.getByText("help")).toBeInTheDocument();
    const commandLine = screen
      .getByText("help")
      .closest('[data-testid="terminal-line"]');
    expect(commandLine).toHaveAttribute("data-line-type", "command");
  });

  it("renders output and error lines with styling", () => {
    const lines = [
      createLine({ type: "output", content: "result" }),
      createLine({ type: "error", content: "error occurred" }),
      createLine({ type: "success", content: "done" }),
    ];

    render(<TerminalOutput lines={lines} isScrolling />);

    expect(
      screen.getByText("result").closest('[data-testid="terminal-line"]')
    ).toHaveAttribute("data-line-type", "output");
    expect(
      screen
        .getByText("error occurred")
        .closest('[data-testid="terminal-line"]')
    ).toHaveAttribute("data-line-type", "error");
    expect(
      screen.getByText("done").closest('[data-testid="terminal-line"]')
    ).toHaveAttribute("data-line-type", "success");
  });

  it("renders HTML content lines", () => {
    const html = "<strong>HTML Content</strong>";
    const lines = [createLine({ type: "html", htmlContent: html })];

    render(<TerminalOutput lines={lines} isScrolling />);

    expect(screen.getByText("HTML Content").tagName).toBe("STRONG");
  });

  it("auto-scrolls when new lines are added", () => {
    const lines = [createLine({ content: "line 1" })];
    const { rerender } = render(<TerminalOutput lines={lines} isScrolling />);

    const scroller = screen.getByTestId("terminal-container");
    Object.defineProperty(scroller, "scrollTop", { value: 0, writable: true });
    Object.defineProperty(scroller, "scrollHeight", { value: 200 });
    Object.defineProperty(scroller, "clientHeight", { value: 100 });

    rerender(
      <TerminalOutput
        lines={[...lines, createLine({ content: "line 2" })]}
        isScrolling
      />
    );

    expect(scroller.scrollTop).toBe(200);
  });

  it("does not auto-scroll when user scrolled up", () => {
    const lines = [createLine({ content: "line 1" })];
    const { rerender } = render(<TerminalOutput lines={lines} isScrolling />);

    const scroller = screen.getByTestId("terminal-container");
    Object.defineProperty(scroller, "scrollTop", { value: 20, writable: true });
    Object.defineProperty(scroller, "scrollHeight", { value: 200 });
    Object.defineProperty(scroller, "clientHeight", { value: 100 });

    // Simulate scroll event to flag user scroll
    scroller.dispatchEvent(new Event("scroll"));

    rerender(
      <TerminalOutput
        lines={[...lines, createLine({ content: "line 2" })]}
        isScrolling
      />
    );

    expect(scroller.scrollTop).toBe(20);
  });

  it("handles empty lines array without crashing", () => {
    render(<TerminalOutput lines={[]} isScrolling />);
    expect(screen.queryByText(/.+/)).toBeNull();
  });
});
