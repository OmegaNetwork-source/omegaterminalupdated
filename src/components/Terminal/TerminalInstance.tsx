"use client";

/**
 * TerminalInstance Component
 * Individual terminal instance wrapper with controls
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { TerminalContainer } from "./TerminalContainer";
import { TerminalProvider } from "@/providers/TerminalProvider";
import { useCommandExecution, UseCommandExecutionReturn } from "@/hooks/useCommandExecution";
import styles from "./TerminalInstance.module.css";

export interface TerminalInstanceProps {
  id: string;
  title: string;
  gridArea?: string;
  onRemove: (id: string) => void;
  onTitleChange: (id: string, title: string) => void;
  onGridAreaChange: (id: string, gridArea: string) => void;
  canRemove: boolean;
  executor?: UseCommandExecutionReturn;
}

export function TerminalInstance({
  id,
  title: initialTitle,
  gridArea,
  onRemove,
  onTitleChange,
  onGridAreaChange,
  canRemove,
  executor,
}: TerminalInstanceProps) {
  const [title, setTitle] = useState(initialTitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeStartRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
    onTitleChange(id, newTitle);
    setIsEditingTitle(false);
  }, [id, onTitleChange]);

  const handleStartResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: rect.width,
      height: rect.height,
    };
    setIsResizing(true);
  }, []);

  const handleResize = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeStartRef.current || !containerRef.current) return;
    
    const deltaX = e.clientX - resizeStartRef.current.x;
    const deltaY = e.clientY - resizeStartRef.current.y;
    
    const newWidth = Math.max(300, resizeStartRef.current.width + deltaX);
    const newHeight = Math.max(200, resizeStartRef.current.height + deltaY);
    
    containerRef.current.style.width = `${newWidth}px`;
    containerRef.current.style.height = `${newHeight}px`;
  }, [isResizing]);

  const handleEndResize = useCallback(() => {
    setIsResizing(false);
    resizeStartRef.current = null;
  }, []);

  // Attach resize listeners
  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleResize);
      window.addEventListener("mouseup", handleEndResize);
      return () => {
        window.removeEventListener("mousemove", handleResize);
        window.removeEventListener("mouseup", handleEndResize);
      };
    }
  }, [isResizing, handleResize, handleEndResize]);

  return (
    <div
      ref={containerRef}
      className={`${styles.instance} ${isMinimized ? styles.minimized : ""}`}
      style={gridArea ? { gridArea } : undefined}
    >
      {/* Terminal Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          {isEditingTitle ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => handleTitleChange(title)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleTitleChange(title);
                } else if (e.key === "Escape") {
                  setTitle(initialTitle);
                  setIsEditingTitle(false);
                }
              }}
              className={styles.titleInput}
              autoFocus
            />
          ) : (
            <span
              className={styles.title}
              onDoubleClick={() => setIsEditingTitle(true)}
              title="Double-click to rename"
            >
              {title}
            </span>
          )}
        </div>
        <div className={styles.headerRight}>
          <button
            className={styles.headerButton}
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? "Maximize" : "Minimize"}
          >
            {isMinimized ? "□" : "−"}
          </button>
          {canRemove && (
            <button
              className={styles.headerButton}
              onClick={() => onRemove(id)}
              title="Close Terminal"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Terminal Content */}
      {!isMinimized && (
        <div className={styles.content}>
          {/* Wrap each terminal in its own provider for isolated state */}
          <TerminalProvider>
            <TerminalContainer />
          </TerminalProvider>
        </div>
      )}

      {/* Resize Handle */}
      {!isMinimized && (
        <div
          className={styles.resizeHandle}
          onMouseDown={handleStartResize}
        />
      )}
    </div>
  );
}


