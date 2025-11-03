"use client";

import React, { createContext, useContext, ReactNode } from "react";
import {
  useCommandExecution,
  UseCommandExecutionReturn,
} from "@/hooks/useCommandExecution";

/**
 * Terminal Context
 * Shares terminal state and command execution across all components
 */
const TerminalContext = createContext<UseCommandExecutionReturn | undefined>(
  undefined
);

/**
 * Terminal Provider
 * Wraps the application to provide shared terminal state
 * This ensures sidebar, terminal, and all other components share the same command execution instance
 */
export function TerminalProvider({ children }: { children: ReactNode }) {
  const terminal = useCommandExecution();

  return (
    <TerminalContext.Provider value={terminal}>
      {children}
    </TerminalContext.Provider>
  );
}

/**
 * Use Terminal Hook
 * Access shared terminal state from any component
 */
export function useTerminal(): UseCommandExecutionReturn {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error("useTerminal must be used within a TerminalProvider");
  }
  return context;
}

export default TerminalProvider;
