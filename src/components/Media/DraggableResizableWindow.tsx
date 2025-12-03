"use client";

import React, { useState, useRef, useEffect, useCallback, ReactNode } from "react";
import styles from "./DraggableResizableWindow.module.css";

export interface DraggableResizableWindowProps {
  id: string;
  title: string;
  children: ReactNode;
  defaultWidth?: number;
  defaultHeight?: number;
  defaultX?: number;
  defaultY?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  onClose?: () => void;
  isOpen: boolean;
  zIndex?: number;
}

export function DraggableResizableWindow({
  id,
  title,
  children,
  defaultWidth = 500,
  defaultHeight = 400,
  defaultX = 100,
  defaultY = 100,
  minWidth = 300,
  minHeight = 200,
  maxWidth,
  maxHeight,
  onClose,
  isOpen,
  zIndex = 1000,
}: DraggableResizableWindowProps) {
  const [position, setPosition] = useState({ x: defaultX, y: defaultY });
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const savedSizeRef = useRef({ width: defaultWidth, height: defaultHeight });

  // Load saved position, size, and minimized state from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const saved = localStorage.getItem(`window-${id}`);
    if (saved) {
      try {
        const { position: savedPos, size: savedSize, isMinimized: savedMinimized } = JSON.parse(saved);
        if (savedPos) setPosition(savedPos);
        if (savedSize) {
          setSize(savedSize);
          savedSizeRef.current = savedSize;
        }
        if (savedMinimized !== undefined) setIsMinimized(savedMinimized);
      } catch (e) {
        console.warn(`Failed to load window state for ${id}:`, e);
      }
    } else {
      savedSizeRef.current = { width: defaultWidth, height: defaultHeight };
    }
  }, [id, defaultWidth, defaultHeight]);

  // Save position, size, and minimized state to localStorage
  const saveState = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        `window-${id}`,
        JSON.stringify({ position, size, isMinimized })
      );
    } catch (e) {
      console.warn(`Failed to save window state for ${id}:`, e);
    }
  }, [id, position, size, isMinimized]);

  // Toggle minimize
  const handleMinimize = useCallback(() => {
    if (isMinimized) {
      // Restore
      setIsMinimized(false);
      setSize(savedSizeRef.current);
    } else {
      // Minimize
      savedSizeRef.current = size;
      setIsMinimized(true);
      setSize({ width: size.width, height: 40 }); // Header height
    }
    saveState();
  }, [isMinimized, size, saveState]);

  // Handle drag start
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (!headerRef.current) return;
    
    const rect = windowRef.current?.getBoundingClientRect();
    if (!rect) return;

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    e.preventDefault();
  }, []);

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    if (!windowRef.current) return;
    
    const rect = windowRef.current.getBoundingClientRect();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: rect.width,
      height: rect.height,
    });
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Handle mouse move for dragging and resizing
  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        // Constrain to viewport
        const maxX = window.innerWidth - size.width;
        const maxY = window.innerHeight - size.height;
        
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        
        let newWidth = resizeStart.width + deltaX;
        let newHeight = resizeStart.height + deltaY;
        
        // Apply constraints
        newWidth = Math.max(minWidth, newWidth);
        newHeight = Math.max(minHeight, newHeight);
        
        if (maxWidth) newWidth = Math.min(maxWidth, newWidth);
        if (maxHeight) newHeight = Math.min(maxHeight, newHeight);
        
        // Constrain to viewport
        const rect = windowRef.current?.getBoundingClientRect();
        if (rect) {
          const maxWidthViewport = window.innerWidth - rect.left;
          const maxHeightViewport = window.innerHeight - rect.top;
          newWidth = Math.min(newWidth, maxWidthViewport);
          newHeight = Math.min(newHeight, maxHeightViewport);
        }
        
        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      if (isDragging || isResizing) {
        setIsDragging(false);
        setIsResizing(false);
        saveState();
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart, size, minWidth, minHeight, maxWidth, maxHeight, saveState]);

  // Save state when position or size changes
  useEffect(() => {
    if (!isDragging && !isResizing) {
      const timeout = setTimeout(saveState, 500);
      return () => clearTimeout(timeout);
    }
  }, [position, size, isDragging, isResizing, saveState]);

  // Bring window to front when clicked
  const handleWindowClick = useCallback((e: React.MouseEvent) => {
    // Don't bring to front if clicking on buttons or resize handle
    const target = e.target as HTMLElement;
    if (target.closest(`.${styles.closeButton}`) || 
        target.closest(`.${styles.minimizeButton}`) || 
        target.closest(`.${styles.resizeHandle}`)) {
      return;
    }

    if (windowRef.current && isOpen) {
      // Find all draggable windows and get the highest z-index
      const allWindows = document.querySelectorAll('[data-draggable-window="true"]');
      let maxZ = zIndex;
      allWindows.forEach((win) => {
        if (win instanceof HTMLElement && win !== windowRef.current) {
          const currentZ = parseInt(window.getComputedStyle(win).zIndex) || 1000;
          if (currentZ > maxZ) {
            maxZ = currentZ;
          }
        }
      });
      // Bring this window to front
      windowRef.current.style.zIndex = String(maxZ + 1);
    }
  }, [isOpen, zIndex, styles.closeButton, styles.minimizeButton, styles.resizeHandle]);

  if (!isOpen) return null;

  return (
    <div
      ref={windowRef}
      className={`${styles.window} ${isMinimized ? styles.minimized : ""}`}
      data-draggable-window="true"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: isMinimized ? "40px" : `${size.height}px`,
        zIndex,
      }}
      onClick={handleWindowClick}
    >
      <div
        ref={headerRef}
        className={styles.header}
        onMouseDown={handleDragStart}
      >
        <span className={styles.title}>{title}</span>
        <div className={styles.headerButtons}>
          <button
            className={styles.minimizeButton}
            onClick={handleMinimize}
            aria-label={isMinimized ? "Restore window" : "Minimize window"}
            title={isMinimized ? "Restore" : "Minimize"}
          >
            {isMinimized ? "□" : "−"}
          </button>
          {onClose && (
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close window"
            >
              ×
            </button>
          )}
        </div>
      </div>
      {!isMinimized && (
        <>
          <div className={styles.content}>
            {children}
          </div>
          <div
            className={styles.resizeHandle}
            onMouseDown={handleResizeStart}
          />
        </>
      )}
    </div>
  );
}

