"use client";

/**
 * MultiTerminalProvider
 * Manages state for multiple terminal instances
 * Each terminal maintains its own command history and output
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface TerminalState {
  id: string;
  title: string;
  history: string[];
  output: Array<{ id: string; type: string; content: string }>;
  isActive: boolean;
}

interface MultiTerminalContextType {
  terminals: TerminalState[];
  addTerminal: () => string;
  removeTerminal: (id: string) => void;
  updateTerminalTitle: (id: string, title: string) => void;
  addToHistory: (id: string, command: string) => void;
  addToOutput: (id: string, output: { id: string; type: string; content: string }) => void;
  setActiveTerminal: (id: string) => void;
  activeTerminalId: string | null;
}

const MultiTerminalContext = createContext<MultiTerminalContextType | undefined>(undefined);

export function MultiTerminalProvider({ children }: { children: ReactNode }) {
  const [terminals, setTerminals] = useState<TerminalState[]>([
    {
      id: "terminal-1",
      title: "Terminal 1",
      history: [],
      output: [],
      isActive: true,
    },
  ]);
  const [activeTerminalId, setActiveTerminalId] = useState<string>("terminal-1");

  const addTerminal = useCallback(() => {
    const newId = `terminal-${terminals.length + 1}`;
    const newTerminal: TerminalState = {
      id: newId,
      title: `Terminal ${terminals.length + 1}`,
      history: [],
      output: [],
      isActive: false,
    };
    setTerminals((prev) => [...prev, newTerminal]);
    return newId;
  }, [terminals.length]);

  const removeTerminal = useCallback((id: string) => {
    if (terminals.length <= 1) return;
    setTerminals((prev) => {
      const filtered = prev.filter((term) => term.id !== id);
      // If removing active terminal, activate first remaining
      if (id === activeTerminalId && filtered.length > 0) {
        setActiveTerminalId(filtered[0].id);
        filtered[0].isActive = true;
      }
      return filtered;
    });
  }, [terminals.length, activeTerminalId]);

  const updateTerminalTitle = useCallback((id: string, title: string) => {
    setTerminals((prev) =>
      prev.map((term) => (term.id === id ? { ...term, title } : term))
    );
  }, []);

  const addToHistory = useCallback((id: string, command: string) => {
    setTerminals((prev) =>
      prev.map((term) =>
        term.id === id
          ? { ...term, history: [...term.history, command] }
          : term
      )
    );
  }, []);

  const addToOutput = useCallback((id: string, output: { id: string; type: string; content: string }) => {
    setTerminals((prev) =>
      prev.map((term) =>
        term.id === id
          ? { ...term, output: [...term.output, output] }
          : term
      )
    );
  }, []);

  const setActiveTerminal = useCallback((id: string) => {
    setActiveTerminalId(id);
    setTerminals((prev) =>
      prev.map((term) => ({ ...term, isActive: term.id === id }))
    );
  }, []);

  return (
    <MultiTerminalContext.Provider
      value={{
        terminals,
        addTerminal,
        removeTerminal,
        updateTerminalTitle,
        addToHistory,
        addToOutput,
        setActiveTerminal,
        activeTerminalId,
      }}
    >
      {children}
    </MultiTerminalContext.Provider>
  );
}

export function useMultiTerminal(): MultiTerminalContextType {
  const context = useContext(MultiTerminalContext);
  if (!context) {
    throw new Error("useMultiTerminal must be used within a MultiTerminalProvider");
  }
  return context;
}

