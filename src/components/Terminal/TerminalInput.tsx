"use client";

/**
 * TerminalInput Component
 * Handles command input with history navigation (Arrow Up/Down) and autocomplete (Tab)
 * Submits commands on Enter key press
 */

import { useState, useRef, useEffect, type KeyboardEvent, useImperativeHandle, forwardRef } from "react";
import type { TerminalInputProps } from "@/types/terminal";
import { TERMINAL_PROMPT } from "@/lib/constants";
import {
  handleTokenCreationInput,
  isAwaitingTokenInput,
} from "@/lib/commands/token-factory";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import { VirtualKeyboard } from "@/components/Mobile/VirtualKeyboard";
import styles from "./TerminalInput.module.css";

export interface TerminalInputRef {
  setValue: (value: string) => void;
  focus: () => void;
}

export const TerminalInput = forwardRef<TerminalInputRef, TerminalInputProps>(({
  onSubmit,
  onHistoryUp,
  onHistoryDown,
  onAutocomplete,
  placeholder = "Enter command...",
  disabled = false,
}, ref) => {
  const [inputValue, setInputValue] = useState("");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobile = useMobileDetection();

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    setValue: (value: string) => {
      setInputValue(value);
      // Focus and move cursor to end
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(value.length, value.length);
        }
      }, 0);
    },
    focus: () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    },
  }));

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  // Handle focus events to show keyboard on mobile
  const handleFocus = () => {
    if (mobile.isMobile && mobile.isTouchDevice) {
      // Prevent native keyboard from showing
      if (inputRef.current) {
        inputRef.current.blur();
      }
      setIsKeyboardOpen(true);
      // Add class to body to adjust layout when keyboard is open
      document.body.classList.add("keyboard-open");
      // Scroll input into view
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 100);
    }
  };

  const handleBlur = () => {
    // Don't close keyboard on blur - let user explicitly close it
    // This prevents closing when tapping keyboard buttons
  };

  // Clean up keyboard-open class when keyboard closes
  useEffect(() => {
    if (!isKeyboardOpen) {
      document.body.classList.remove("keyboard-open");
    }
    return () => {
      document.body.classList.remove("keyboard-open");
    };
  }, [isKeyboardOpen]);

  // Handle virtual keyboard key press
  const handleVirtualKeyPress = (key: string) => {
    const currentValue = inputValue;
    const cursorPosition = inputRef.current?.selectionStart || currentValue.length;
    const newValue =
      currentValue.slice(0, cursorPosition) +
      key +
      currentValue.slice(inputRef.current?.selectionEnd || cursorPosition);
    setInputValue(newValue);

    // Update cursor position and scroll into view
    setTimeout(() => {
      if (inputRef.current) {
        const newPosition = cursorPosition + key.length;
        inputRef.current.setSelectionRange(newPosition, newPosition);
        // Scroll input to show cursor position
        inputRef.current.scrollLeft = inputRef.current.scrollWidth;
        // Ensure input is visible
        inputRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 0);
  };

  // Handle virtual keyboard backspace
  const handleVirtualBackspace = () => {
    const currentValue = inputValue;
    const cursorPosition = inputRef.current?.selectionStart || currentValue.length;
    if (cursorPosition > 0) {
      const newValue =
        currentValue.slice(0, cursorPosition - 1) +
        currentValue.slice(cursorPosition);
      setInputValue(newValue);

      setTimeout(() => {
        if (inputRef.current) {
          const newPosition = cursorPosition - 1;
          inputRef.current.setSelectionRange(newPosition, newPosition);
        }
      }, 0);
    }
  };

  // Handle virtual keyboard enter
  const handleVirtualEnter = () => {
    if (inputValue.trim()) {
      if (isAwaitingTokenInput()) {
        const handled = handleTokenCreationInput(inputValue.trim());
        if (handled) {
          setInputValue("");
          return;
        }
      }
      onSubmit(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "Enter":
        // Submit command or handle token creation input
        if (inputValue.trim()) {
          // Check if we're in token creation mode (matches vanilla terminal.html line 4028)
          if (isAwaitingTokenInput()) {
            const handled = handleTokenCreationInput(inputValue.trim());
            if (handled) {
              setInputValue("");
              e.preventDefault();
              return;
            }
          }

          // Normal command execution
          onSubmit(inputValue.trim());
          setInputValue("");
        }
        e.preventDefault();
        break;

      case "ArrowUp":
        // Navigate to previous command in history
        const prevCommand = onHistoryUp();
        if (prevCommand !== null) {
          setInputValue(prevCommand);
          // Move cursor to end
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.selectionStart = prevCommand.length;
              inputRef.current.selectionEnd = prevCommand.length;
            }
          }, 0);
        }
        e.preventDefault();
        break;

      case "ArrowDown":
        // Navigate to next command in history
        const nextCommand = onHistoryDown();
        if (nextCommand !== null) {
          setInputValue(nextCommand);
          // Move cursor to end
          setTimeout(() => {
            if (inputRef.current) {
              const len = nextCommand.length;
              inputRef.current.selectionStart = len;
              inputRef.current.selectionEnd = len;
            }
          }, 0);
        }
        e.preventDefault();
        break;

      case "Tab":
        // Autocomplete command
        const matches = onAutocomplete(inputValue.trim());
        if (matches.length === 1) {
          // Single match: autocomplete it
          const match = matches[0];
          if (match) {
            setInputValue(match + " ");
            // Move cursor to end
            setTimeout(() => {
              if (inputRef.current) {
                const len = match.length + 1;
                inputRef.current.selectionStart = len;
                inputRef.current.selectionEnd = len;
              }
            }, 0);
          }
        } else if (matches.length > 1) {
          // Multiple matches: log them (future: show in output)
          console.log("Autocomplete matches:", matches);
        }
        e.preventDefault();
        break;

      default:
        break;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    // Scroll input to show cursor when typing
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.scrollLeft = inputRef.current.scrollWidth;
      }
    }, 0);
  };

  return (
    <>
      <div className={styles.inputSection}>
        <div className={styles.inputLine}>
          <span className={styles.prompt}>{TERMINAL_PROMPT}</span>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
            spellCheck={false}
            className={styles.input}
            inputMode={mobile.isMobile ? "none" : "text"} // Prevent native keyboard on mobile
          />
          {/* Keyboard toggle button for mobile */}
          {mobile.isMobile && mobile.isTouchDevice && (
            <button
              className={styles.keyboardToggle}
              onClick={() => setIsKeyboardOpen(!isKeyboardOpen)}
              aria-label={isKeyboardOpen ? "Close keyboard" : "Open keyboard"}
              type="button"
            >
              ⌨️
            </button>
          )}
        </div>
      </div>

      {/* Virtual Keyboard */}
      {mobile.isMobile && mobile.isTouchDevice && (
        <VirtualKeyboard
          isOpen={isKeyboardOpen}
          onClose={() => {
            setIsKeyboardOpen(false);
            document.body.classList.remove("keyboard-open");
          }}
          onKeyPress={handleVirtualKeyPress}
          onBackspace={handleVirtualBackspace}
          onEnter={handleVirtualEnter}
        />
      )}
    </>
  );
});

TerminalInput.displayName = "TerminalInput";
