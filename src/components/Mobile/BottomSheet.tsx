"use client";

import { useEffect, useRef } from "react";
import styles from "./BottomSheet.module.css";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxHeight?: string;
}

/**
 * BottomSheet Component
 * Mobile-friendly bottom sheet UI for dropdowns and selections
 * Based on mobile UI optimization guide recommendations
 */
export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = "80vh",
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Handle ESC key to close
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

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) {
      onClose();
    }
  };

  // Handle swipe down to close (optional enhancement)
  useEffect(() => {
    if (!isOpen || !sheetRef.current) return;

    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      isDragging = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      currentY = e.touches[0].clientY;
      const diff = currentY - startY;

      // Only allow downward swipe
      if (diff > 0 && sheetRef.current) {
        sheetRef.current.style.transform = `translateY(${diff}px)`;
      }
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;
      isDragging = false;

      const diff = currentY - startY;
      // Close if swiped down more than 100px
      if (diff > 100 && sheetRef.current) {
        onClose();
        sheetRef.current.style.transform = "";
      } else if (sheetRef.current) {
        // Reset position
        sheetRef.current.style.transform = "";
      }
    };

    const sheet = sheetRef.current;
    sheet.addEventListener("touchstart", handleTouchStart);
    sheet.addEventListener("touchmove", handleTouchMove);
    sheet.addEventListener("touchend", handleTouchEnd);

    return () => {
      sheet.removeEventListener("touchstart", handleTouchStart);
      sheet.removeEventListener("touchmove", handleTouchMove);
      sheet.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className={styles.backdrop}
        onClick={handleBackdropClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close bottom sheet"
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`${styles.sheet} ${isOpen ? styles.open : ""}`}
        style={{ maxHeight }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bottom-sheet-title"
      >
        {/* Handle indicator */}
        <div className={styles.handle} />

        {/* Header */}
        <header className={styles.header}>
          <h2 id="bottom-sheet-title" className={styles.title}>
            {title}
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            ✕
          </button>
        </header>

        {/* Content */}
        <div className={styles.content}>{children}</div>
      </div>
    </>
  );
}

