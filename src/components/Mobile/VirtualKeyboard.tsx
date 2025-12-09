"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import styles from "./VirtualKeyboard.module.css";

interface VirtualKeyboardProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
}

interface KeyLayout {
  value: string;
  label: string;
  shiftLabel?: string;
  type?: "normal" | "wide" | "space" | "special" | "backspace";
  action?: "backspace" | "enter" | "shift" | "close";
}

// Terminal-specific keyboard layout - Apple-style vertical layout
// Restructured to have fewer keys per row (max 10-11) for better mobile fit
const KEYBOARD_LAYOUT: KeyLayout[][] = [
  // Row 1: Numbers and symbols - max 11 keys
  [
    { value: "`", label: "`", shiftLabel: "~" },
    { value: "1", label: "1", shiftLabel: "!" },
    { value: "2", label: "2", shiftLabel: "@" },
    { value: "3", label: "3", shiftLabel: "#" },
    { value: "4", label: "4", shiftLabel: "$" },
    { value: "5", label: "5", shiftLabel: "%" },
    { value: "6", label: "6", shiftLabel: "^" },
    { value: "7", label: "7", shiftLabel: "&" },
    { value: "8", label: "8", shiftLabel: "*" },
    { value: "9", label: "9", shiftLabel: "(" },
    { value: "0", label: "0", shiftLabel: ")" },
    { value: "-", label: "-", shiftLabel: "_" },
    { value: "=", label: "=", shiftLabel: "+" },
    { value: "Backspace", label: "⌫", type: "backspace", action: "backspace" },
  ],
  // Row 2: QWERTY top row - max 11 keys
  [
    { value: "Tab", label: "Tab", type: "wide" },
    { value: "q", label: "q", shiftLabel: "Q" },
    { value: "w", label: "w", shiftLabel: "W" },
    { value: "e", label: "e", shiftLabel: "E" },
    { value: "r", label: "r", shiftLabel: "R" },
    { value: "t", label: "t", shiftLabel: "T" },
    { value: "y", label: "y", shiftLabel: "Y" },
    { value: "u", label: "u", shiftLabel: "U" },
    { value: "i", label: "i", shiftLabel: "I" },
    { value: "o", label: "o", shiftLabel: "O" },
    { value: "p", label: "p", shiftLabel: "P" },
  ],
  // Row 3: Bracket row - continuation of QWERTY
  [
    { value: "[", label: "[", shiftLabel: "{" },
    { value: "]", label: "]", shiftLabel: "}" },
    { value: "\\", label: "\\", shiftLabel: "|" },
    { value: "Caps", label: "Caps", type: "wide" },
    { value: "a", label: "a", shiftLabel: "A" },
    { value: "s", label: "s", shiftLabel: "S" },
    { value: "d", label: "d", shiftLabel: "D" },
    { value: "f", label: "f", shiftLabel: "F" },
    { value: "g", label: "g", shiftLabel: "G" },
    { value: "h", label: "h", shiftLabel: "H" },
    { value: "j", label: "j", shiftLabel: "J" },
    { value: "k", label: "k", shiftLabel: "K" },
    { value: "l", label: "l", shiftLabel: "L" },
  ],
  // Row 4: ASDF continuation and symbols
  [
    { value: ";", label: ";", shiftLabel: ":" },
    { value: "'", label: "'", shiftLabel: '"' },
    { value: "Enter", label: "↵", type: "wide", action: "enter" },
    { value: "Shift", label: "⇧", type: "wide", action: "shift" },
    { value: "z", label: "z", shiftLabel: "Z" },
    { value: "x", label: "x", shiftLabel: "X" },
    { value: "c", label: "c", shiftLabel: "C" },
    { value: "v", label: "v", shiftLabel: "V" },
    { value: "b", label: "b", shiftLabel: "B" },
    { value: "n", label: "n", shiftLabel: "N" },
    { value: "m", label: "m", shiftLabel: "M" },
  ],
  // Row 5: Bottom row - punctuation and modifiers
  [
    { value: ",", label: ",", shiftLabel: "<" },
    { value: ".", label: ".", shiftLabel: ">" },
    { value: "/", label: "/", shiftLabel: "?" },
    { value: "Shift", label: "⇧", type: "wide", action: "shift" },
  ],
  // Row 6: Spacebar row
  [
    { value: " ", label: "Space", type: "space" },
    { value: "Close", label: "⌨️", type: "special", action: "close" },
  ],
];

// Common command shortcuts
const COMMAND_SHORTCUTS = [
  "help",
  "clear",
  "connect",
  "wallet",
  "mining",
  "spotify",
  "youtube",
  "games",
];

/**
 * VirtualKeyboard Component
 * Mobile virtual keyboard with terminal-specific keys and command shortcuts
 */
export function VirtualKeyboard({
  isOpen,
  onClose,
  onKeyPress,
  onBackspace,
  onEnter,
}: VirtualKeyboardProps) {
  const mobile = useMobileDetection();
  const [shift, setShift] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [isCompressed, setIsCompressed] = useState(false);
  const keyboardRef = useRef<HTMLDivElement | null>(null);

  // Close keyboard when clicking outside or pressing ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Auto-release shift after single key press
  useEffect(() => {
    if (shift) {
      const timer = setTimeout(() => {
        setShift(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [shift]);

  // Detect if keys overflow horizontally and compress layout if needed
  useEffect(() => {
    if (!isOpen) {
      setIsCompressed(false);
      return;
    }

    if (typeof window === "undefined" || typeof ResizeObserver === "undefined") {
      return;
    }

    const checkOverflow = () => {
      const container = keyboardRef.current;
      if (!container) return;

      const rows = container.querySelectorAll<HTMLElement>(`.${styles.keyRow}`);
      let hasOverflow = false;

      rows.forEach((row) => {
        if (row.scrollWidth - row.clientWidth > 2) {
          hasOverflow = true;
        }
      });

      setIsCompressed(hasOverflow);
    };

    checkOverflow();

    const observerTarget = keyboardRef.current;
    if (!observerTarget) return;

    const resizeObserver = new ResizeObserver(() => {
      checkOverflow();
    });

    resizeObserver.observe(observerTarget);

    window.addEventListener("orientationchange", checkOverflow);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("orientationchange", checkOverflow);
    };
  }, [isOpen]);

  const handleKeyClick = useCallback(
    (key: KeyLayout) => {
      if (key.action === "backspace") {
        onBackspace();
        return;
      }

      if (key.action === "enter") {
        onEnter();
        return;
      }

      if (key.action === "shift") {
        setShift(!shift);
        return;
      }

      if (key.action === "close") {
        onClose();
        return;
      }

      if (key.value === "Caps") {
        setCapsLock(!capsLock);
        return;
      }

      let outputKey = key.value;

      // Handle shift modifier
      if (shift || capsLock) {
        if (key.shiftLabel) {
          outputKey = key.shiftLabel;
        } else if (key.value.length === 1 && /[a-z]/.test(key.value)) {
          outputKey = key.value.toUpperCase();
        }
      }

      onKeyPress(outputKey);

      // Auto-release shift after single key (except for Caps)
      if (shift && key.value !== "Shift") {
        setShift(false);
      }
    },
    [shift, capsLock, onKeyPress, onBackspace, onEnter, onClose]
  );

  if (!isOpen || !mobile.isMobile) return null;

  return (
    <div
      ref={keyboardRef}
      className={`${styles.keyboard} ${
        isCompressed ? styles.keyboardCompressed : ""
      }`}
    >
      <div className={styles.keyboardHeader}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close keyboard"
          type="button"
        >
          ⌨️
        </button>
        <span className={styles.headerTitle}>Virtual Keyboard</span>
        <div className={styles.modifierIndicators}>
          {shift && <span className={styles.modifier}>⇧</span>}
          {capsLock && <span className={styles.modifier}>A</span>}
        </div>
      </div>

      {/* Command Shortcuts Bar */}
      <div className={styles.shortcutsBar}>
        {COMMAND_SHORTCUTS.map((cmd) => (
          <button
            key={cmd}
            className={styles.shortcutButton}
            onClick={() => {
              onKeyPress(cmd + " ");
              onEnter();
            }}
            type="button"
            aria-label={`Execute ${cmd}`}
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Keyboard Body */}
      <div className={styles.keyboardBody}>
        {KEYBOARD_LAYOUT.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.keyRow}>
            {row.map((key, keyIndex) => {
              const isShifted = shift || capsLock;
              const displayLabel =
                isShifted && key.shiftLabel
                  ? key.shiftLabel
                  : key.label;

              return (
                <button
                  key={keyIndex}
                  className={`${styles.key} ${
                    key.type === "wide"
                      ? styles.keyWide
                      : key.type === "space"
                      ? styles.keySpace
                      : key.type === "special"
                      ? styles.keySpecial
                      : key.type === "backspace"
                      ? styles.keyBackspace
                      : ""
                  } ${key.action === "shift" && shift ? styles.keyActive : ""} ${
                    key.action === "close" ? styles.keyClose : ""
                  }`}
                  onClick={() => handleKeyClick(key)}
                  type="button"
                  aria-label={key.value === " " ? "Space" : displayLabel}
                >
                  {displayLabel}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

