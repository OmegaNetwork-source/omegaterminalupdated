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

import { useRef, useEffect, useState, useCallback } from "react";
import { TERMINAL_PROMPT } from "@/lib/constants";
import type { TerminalOutputProps } from "@/types/terminal";
import { MobileInlinePanel } from "@/components/Mobile/MobileInlinePanel";
import {
  extractCommandsFromSection,
  getSectionCategory,
} from "@/lib/section-commands-extractor";
import { addQuickAction } from "@/lib/quick-actions";
import { WelcomeMessage } from "@/components/Welcome/WelcomeMessage";
import { optimizeHtmlForMobile } from "@/lib/utils/mobile-html-optimizer";
import styles from "./TerminalOutput.module.css";

export function TerminalOutput({ lines, isScrolling }: TerminalOutputProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);

  // Helper function to scroll terminal to bottom
  const scrollToBottom = useCallback(() => {
    if (contentRef.current) {
      // Reset user scroll state to allow auto-scroll
      setUserScrolledUp(false);
      // Scroll to bottom with smooth behavior
      contentRef.current.scrollTo({
        top: contentRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  // Expose scroll function globally for quick actions
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__omegaScrollTerminalToBottom = scrollToBottom;
    }
    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).__omegaScrollTerminalToBottom;
      }
    };
  }, [scrollToBottom]);

  // Auto-scroll to bottom when new lines are added (only if user hasn't scrolled up)
  useEffect(() => {
    // Disable auto-scroll on mobile devices
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      return;
    }

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

  // Handle drag and drop for quick actions
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      const dropZone = target.closest("#omega-quick-actions-drop-zone");
      if (dropZone) {
        e.preventDefault();
        e.stopPropagation();
        (dropZone as HTMLElement).style.borderColor =
          "color-mix(in srgb, var(--palette-primary, #00d4ff) 60%, transparent)";
        (dropZone as HTMLElement).style.background =
          "linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent) 0%, color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent) 100%)";
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      const dropZone = target.closest("#omega-quick-actions-drop-zone");
      if (dropZone && !dropZone.contains(e.relatedTarget as Node)) {
        (dropZone as HTMLElement).style.borderColor =
          "color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent)";
        (dropZone as HTMLElement).style.background =
          "linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent) 0%, color-mix(in srgb, var(--palette-secondary, #00ff88) 6%, transparent) 100%)";
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const target = e.target as HTMLElement;
      const dropZone = target.closest("#omega-quick-actions-drop-zone");
      if (!dropZone) return;

      // Reset drop zone styling
      (dropZone as HTMLElement).style.borderColor =
        "color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent)";
      (dropZone as HTMLElement).style.background =
        "linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent) 0%, color-mix(in srgb, var(--palette-secondary, #00ff88) 6%, transparent) 100%)";

      // Get drag data
      const dragData = e.dataTransfer?.getData("text/plain");
      if (!dragData) return;

      // Handle subaction drops (individual commands)
      if (dragData.startsWith("subaction:")) {
        const subactionData = dragData.replace("subaction:", "");
        const parts = subactionData.split("|");

        if (parts.length >= 2) {
          const command = parts[0];
          const label = parts[1];
          const description = parts[2] || undefined;

          if (!command || !label) {
            console.warn("Invalid subaction data:", subactionData);
            return;
          }

          // Determine category based on command
          let category = "Trading & Markets";
          if (command === "faucet" || command === "clear") {
            category = "Wallet & Connection";
          } else if (command.startsWith("chart")) {
            category = "Trading & Analytics";
          } else if (command.startsWith("ds")) {
            category = "Trading & Analytics";
          } else if (command.startsWith("defillama")) {
            category = "DeFi & Analytics";
          } else if (command === "perps") {
            category = "Trading & Analytics";
          } else if (command.startsWith("polymarket")) {
            category = "Trading & Markets";
          } else if (command.startsWith("kalshi")) {
            category = "Trading & Markets";
          } else if (command.startsWith("trade")) {
            category = "Trading & Markets";
          }

          addQuickAction({
            command: command,
            label: label,
            description: description,
            category: category,
          });

          // Show feedback
          if (
            typeof window !== "undefined" &&
            (window as any).__omegaExecuteCommand
          ) {
            (window as any).__omegaExecuteCommand(`quick-actions list`);
          }
        }
        return;
      }

      // Handle section drops (all commands from a section)
      if (dragData.startsWith("section:")) {
        const actualSectionId = dragData.replace("section:", "");

        // Extract commands from the section
        const sectionCommands = extractCommandsFromSection(actualSectionId);
        // For network subsections, use "Network" category, otherwise use the mapped category
        const category = actualSectionId.startsWith("network-")
          ? "Network"
          : getSectionCategory(actualSectionId);

        if (sectionCommands.length === 0) {
          console.warn("No commands found for section:", actualSectionId);
          return;
        }

        // Add all commands from the section to quick actions
        sectionCommands.forEach((cmd) => {
          addQuickAction({
            command: cmd.command,
            label: cmd.label,
            description: cmd.description,
            category: category,
          });
        });

        // Show feedback
        if (
          typeof window !== "undefined" &&
          (window as any).__omegaExecuteCommand
        ) {
          (window as any).__omegaExecuteCommand(`quick-actions list`);
        }
        return;
      }
    };

    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("drop", handleDrop);

    return () => {
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("drop", handleDrop);
    };
  }, []);

  // Handle clicks on interactive elements (delegated event handler)
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // Handle execute command clicks (click to execute directly - used in welcome message)
    const executeCommandElement = target.closest(
      ".omega-execute-command"
    ) as HTMLElement | null;
    if (executeCommandElement) {
      const command = executeCommandElement.getAttribute("data-command");
      if (
        command &&
        typeof window !== "undefined" &&
        (window as any).__omegaExecuteCommand
      ) {
        // Execute command directly
        (window as any).__omegaExecuteCommand(command);
        // Add visual feedback
        executeCommandElement.style.transform = "scale(0.95)";
        executeCommandElement.style.opacity = "0.7";
        setTimeout(() => {
          executeCommandElement.style.transform = "";
          executeCommandElement.style.opacity = "";
        }, 200);
        // Auto-scroll to bottom to show command output
        // Use a small delay to ensure command execution has started
        setTimeout(() => {
          scrollToBottom();
        }, 100);
        // Also scroll after a longer delay to catch any async output
        setTimeout(() => {
          scrollToBottom();
        }, 500);
      }
      return;
    }

    // Handle help command clicks (click on command name to add to input)
    const helpCommandElement = target.closest(
      ".omega-help-command"
    ) as HTMLElement | null;
    if (helpCommandElement) {
      const command = helpCommandElement.getAttribute("data-command");
      if (
        command &&
        typeof window !== "undefined" &&
        (window as any).__omegaSetTerminalInput
      ) {
        (window as any).__omegaSetTerminalInput(command);
        // Add visual feedback
        helpCommandElement.style.transform = "scale(0.95)";
        setTimeout(() => {
          helpCommandElement.style.transform = "";
        }, 150);
      }
      return;
    }

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
      {/* Mobile Inline Panels - Render within terminal output */}
      <MobileInlinePanel />

      {lines.map((line) => {
        // Skip only truly empty lines on mobile (spacer lines with no content)
        if (typeof window !== "undefined" && window.innerWidth <= 768) {
          if (
            line.type === "output" &&
            typeof line.content === "string" &&
            line.content.trim() === "" &&
            !line.htmlContent
          ) {
            return null;
          }
        }

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
          // Check if this is a welcome message (has welcome header placeholder or welcome-1 id)
          const isWelcomeMessage =
            line.id === "welcome-1" ||
            line.htmlContent.includes("data-welcome-header-placeholder");

          if (isWelcomeMessage) {
            return (
              <div
                key={line.id}
                className={`${styles.line} ${styles.html}`}
                data-testid="terminal-line"
                data-line-type={line.type}
              >
                <WelcomeMessage />
              </div>
            );
          }

          // Optimize HTML for mobile devices
          const optimizedHtml = optimizeHtmlForMobile(line.htmlContent);

          return (
            <div
              key={line.id}
              className={`${styles.line} ${styles.html}`}
              data-testid="terminal-line"
              data-line-type={line.type}
              dangerouslySetInnerHTML={{ __html: optimizedHtml }}
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
