"use client";

/**
 * TerminalOutput Component
 * Displays terminal command history and output with auto-scrolling capability
 * Shows commands with prompt and outputs with appropriate styling based on type
 *
 * Supports HTML content rendering for rich formatting (wallet export, buttons, links, etc.)
 * Note: HTML content should be sanitized before rendering to prevent XSS attacks.
 * Currently trusts that command handlers provide safe HTML content.
 */

import { useRef, useEffect, useState } from "react";
import { TERMINAL_PROMPT } from "@/lib/constants";
import type { TerminalOutputProps } from "@/types/terminal";
import styles from "./TerminalOutput.module.css";

export function TerminalOutput({ lines, isScrolling }: TerminalOutputProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);

  // Auto-scroll to bottom when new lines are added (only if user hasn't scrolled up)
  useEffect(() => {
    if (isScrolling && !userScrolledUp && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [lines, isScrolling, userScrolledUp]);

  // Detect manual scrolling
  const handleScroll = () => {
    if (!contentRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;

    // If user scrolled to bottom, resume auto-scroll
    if (isAtBottom) {
      setUserScrolledUp(false);
    } else {
      setUserScrolledUp(true);
    }
  };

  // Handle clicks on interactive elements (delegated event handler)
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // Handle copy button clicks
    if (target.tagName === "BUTTON" && target.hasAttribute("data-clipboard")) {
      const text = target.getAttribute("data-clipboard");
      if (text) {
        navigator.clipboard.writeText(text).catch((err) => {
          console.error("Failed to copy:", err);
        });
      }
    }

    // Handle reveal button clicks
    if (target.tagName === "BUTTON" && target.hasAttribute("data-reveal")) {
      const targetId = target.getAttribute("data-reveal");
      if (targetId) {
        const revealElement = document.getElementById(targetId);
        if (revealElement) {
          target.style.display = "none";
          revealElement.style.display = "inline";
        }
      }
    }
  };

  return (
    <div
      ref={contentRef}
      className={styles.container}
      data-testid="terminal-container"
      onScroll={handleScroll}
      onClick={handleClick}
    >
      {lines.map((line) => {
        if (line.type === "command") {
          return (
            <div
              key={line.id}
              className={`${styles.line} ${styles.command}`}
              data-testid="terminal-line"
              data-line-type={line.type}
            >
              <span className={styles.prompt}>{TERMINAL_PROMPT}</span>
              {line.content}
            </div>
          );
        }

        // Render HTML content for 'html' type lines
        if (line.type === "html" && line.htmlContent) {
          return (
            <div
              key={line.id}
              className={`${styles.line} ${styles.html}`}
              data-testid="terminal-line"
              data-line-type={line.type}
              dangerouslySetInnerHTML={{ __html: line.htmlContent }}
            />
          );
        }

        const variantClasses = [styles.line, styles.output];
        const variantStyle = styles[line.type as keyof typeof styles];

        if (line.type !== "output" && typeof variantStyle === "string") {
          variantClasses.push(variantStyle);
        }

        return (
          <div
            key={line.id}
            className={variantClasses.join(" ")}
            data-testid="terminal-line"
            data-line-type={line.type}
          >
            {line.content}
          </div>
        );
      })}
    </div>
  );
}
