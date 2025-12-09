import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

import { TerminalInput } from "./TerminalInput";

describe("TerminalInput Component", () => {
  const setup = (
    props: Partial<React.ComponentProps<typeof TerminalInput>> = {}
  ) => {
    const onSubmit = jest.fn();
    const onHistoryUp = jest.fn().mockReturnValue("previous command");
    const onHistoryDown = jest.fn().mockReturnValue("next command");
    const onAutocomplete = jest.fn().mockReturnValue(["help"]);

    render(
      <TerminalInput
        onSubmit={onSubmit}
        onHistoryUp={onHistoryUp}
        onHistoryDown={onHistoryDown}
        onAutocomplete={onAutocomplete}
        {...props}
      />
    );

    const input = screen.getByPlaceholderText(
      props.placeholder ?? "Enter command..."
    ) as HTMLInputElement;
    return { input, onSubmit, onHistoryUp, onHistoryDown, onAutocomplete };
  };

  it("renders input with placeholder", () => {
    const placeholder = "Type command";
    const { input } = setup({ placeholder });
    expect(input).toBeInTheDocument();
    expect(input.placeholder).toBe(placeholder);
  });

  it("calls onSubmit when Enter is pressed", () => {
    const { input, onSubmit } = setup();
    fireEvent.change(input, { target: { value: "help" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSubmit).toHaveBeenCalledWith("help");
    expect(input.value).toBe("");
  });

  it("does not submit empty command", () => {
    const { input, onSubmit } = setup();
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("navigates history with arrow keys", () => {
    const { input, onHistoryUp, onHistoryDown } = setup();

    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(onHistoryUp).toHaveBeenCalled();
    expect(input.value).toBe("previous command");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(onHistoryDown).toHaveBeenCalled();
    expect(input.value).toBe("next command");
  });

  it("autocompletes with Tab key", () => {
    const { input, onAutocomplete } = setup();

    fireEvent.change(input, { target: { value: "he" } });
    fireEvent.keyDown(input, { key: "Tab" });

    expect(onAutocomplete).toHaveBeenCalledWith("he");
    expect(input.value).toBe("help ");
  });

  it("updates input value on change", () => {
    const { input } = setup();
    fireEvent.change(input, { target: { value: "connect" } });
    expect(input.value).toBe("connect");
  });

  it("focuses input on mount", () => {
    const { input } = setup();
    expect(document.activeElement).toBe(input);
  });

  it("disables input when disabled prop is true", () => {
    const { input } = setup({ disabled: true });
    expect(input.disabled).toBe(true);
  });
});
