"use client";

/**
 * TerminalInput Component
 * Handles command input with history navigation (Arrow Up/Down) and autocomplete (Tab)
 * Submits commands on Enter key press
 */

import {
  useState,
  useRef,
  useEffect,
  type KeyboardEvent,
  useImperativeHandle,
  forwardRef,
} from "react";
import type { TerminalInputProps } from "@/types/terminal";
import { TERMINAL_PROMPT } from "@/lib/constants";
import {
  handleTokenCreationInput,
  isAwaitingTokenInput,
} from "@/lib/commands/token-factory";
import {
  handleStableTokenCreationInput,
  isAwaitingStableTokenInput,
} from "@/lib/commands/stable-token";
import { handleSwapInput, isAwaitingSwapInput } from "@/lib/commands/rubic";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import styles from "./TerminalInput.module.css";

export interface TerminalInputRef {
  setValue: (value: string) => void;
  focus: () => void;
}

export const TerminalInput = forwardRef<TerminalInputRef, TerminalInputProps>(
  (
    {
      onSubmit,
      onHistoryUp,
      onHistoryDown,
      onAutocomplete,
      placeholder = "Enter command...",
      disabled = false,
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState("");
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

    const attemptSubmit = () => {
      const trimmedValue = inputValue.trim();
      if (!trimmedValue) {
        return;
      }

      if (isAwaitingTokenInput()) {
        const handled = handleTokenCreationInput(trimmedValue);
        if (handled) {
          setInputValue("");
          return;
        }
      }

      if (isAwaitingStableTokenInput()) {
        const handled = handleStableTokenCreationInput(trimmedValue);
        if (handled) {
          setInputValue("");
          return;
        }
      }

      if (isAwaitingSwapInput()) {
        const handled = handleSwapInput(trimmedValue);
        if (handled) {
          setInputValue("");
          return;
        }
      }

      onSubmit(trimmedValue);
      setInputValue("");
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "Enter":
          attemptSubmit();
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

    const isSendDisabled = disabled || !inputValue.trim();

    const isMobile = mobile.isMobile;

    return (
      <>
        <div
          className={`${styles.inputSection} ${
            isMobile ? styles.inputSectionMobile : ""
          }`}
        >
          <div
            className={`${styles.inputLine} ${
              isMobile ? styles.inputLineMobile : ""
            }`}
          >
            {!isMobile && (
              <span className={styles.prompt}>{TERMINAL_PROMPT}</span>
            )}
            <div className={styles.inputWrapper}>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className={styles.input}
                inputMode="text"
              />
              <button
                type="button"
                className={styles.sendButton}
                onClick={attemptSubmit}
                disabled={isSendDisabled}
                aria-label="Send command"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="20"
                  height="20"
                >
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
);

TerminalInput.displayName = "TerminalInput";
