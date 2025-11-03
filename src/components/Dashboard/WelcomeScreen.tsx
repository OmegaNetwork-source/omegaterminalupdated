"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useViewMode } from "@/hooks/useViewMode";
import styles from "./WelcomeScreen.module.css";
import { APP_VERSION } from "@/lib/constants";
import type { ViewMode } from "@/types/ui";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export interface WelcomeScreenProps {
  onComplete: () => void;
}

/**
 * WelcomeScreen with loading animation and interface selector.
 */
export function WelcomeScreen({ onComplete }: WelcomeScreenProps): JSX.Element {
  const { setViewMode } = useViewMode();
  const soundEffects = useSoundEffects();
  const [progress, setProgress] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [exiting, setExiting] = useState<boolean>(false);
  const [selectedMode, setSelectedMode] = useState<ViewMode>("futuristic");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    let savedMode: ViewMode | null = null;
    try {
      const saved = localStorage.getItem("omega-view-mode") as ViewMode | null;
      if (saved === "basic" || saved === "futuristic") {
        savedMode = saved;
      }
    } catch {}

    let mobile = false;
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent.toLowerCase();
      const mobileUA =
        /iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i;
      mobile = window.innerWidth <= 768 || mobileUA.test(ua);
    }

    setIsMobile(mobile);

    if (mobile) {
      setSelectedMode("basic");
    } else if (savedMode) {
      setSelectedMode(savedMode);
    }
  }, []);

  const steps = [
    "Initializing system",
    "Loading providers",
    "Setting up UI",
    "Preparing media modules",
    "Syncing data",
    "Finalizing",
  ];

  useEffect(() => {
    if (isMobile) {
      setSelectedMode("basic");
    }
    const id = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + 2);
        const idx = Math.min(
          steps.length - 1,
          Math.floor(next / (100 / steps.length))
        );
        setCurrentStep(idx);
        if (next === 100) {
          setIsReady(true);
          clearInterval(id);
        }
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [isMobile, steps.length]);

  const handleModeSelect = useCallback(
    (mode: ViewMode) => {
      if (!isReady) return;
      if (isMobile && mode === "futuristic") return;
      setSelectedMode(mode);
      // Play interface selection sound (non-blocking)
      try {
        soundEffects.playSound("interface-select");
      } catch {}
      try {
        localStorage.setItem("omega-view-mode", mode);
      } catch {}
      setTimeout(() => {
        setViewMode(mode);
        setExiting(true);
        setTimeout(() => {
          try {
            localStorage.setItem("omega-initialized", "true");
          } catch {}
          onComplete();
        }, 400);
      }, 500);
    },
    [isReady, onComplete, setViewMode, isMobile, soundEffects]
  );

  return (
    <div className={`${styles.container} ${exiting ? styles.exiting : ""}`}>
      <div className={styles.bgGrid} />

      <div className={styles.topBar}>
        <div className={styles.systemInfo}>
          <div className={styles.statusIndicator}>
            <span className={styles.statusDot} />
            <span>OMEGA SYSTEM ONLINE</span>
          </div>
          <div className={styles.versionBadge}>v{APP_VERSION}</div>
          <div className={styles.securityBadge}>🔒 SECURE BOOT</div>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.loadingSection}>
          <div className={styles.spinner}>
            <div className={styles.spinnerRing} />
            <div className={styles.spinnerRing} />
            <div className={styles.spinnerRing} />
            <div className={styles.omegaSymbol}>Ω</div>
          </div>
          <div className={styles.loadingText}>{steps[currentStep]}</div>
          <div className={styles.loadingSubText}>Preparing interface...</div>
          <div className={styles.progressContainer}>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className={styles.progressPercentage}>{progress}%</div>
          </div>
        </div>

        <div className={styles.interfaceSelector}>
          <div className={styles.selectorHeader}>
            <div className={styles.selectorTitle}>SELECT INTERFACE</div>
            <div className={styles.selectorSubtitle}>
              Choose between Basic Terminal and Futuristic Dashboard
            </div>
          </div>
          <div className={styles.interfaceOptions}>
            <div
              className={`${styles.interfaceOption} ${
                selectedMode === "basic" ? styles.interfaceOptionActive : ""
              }`}
              style={{
                pointerEvents: isReady ? "auto" : "none",
                opacity: isReady ? 1 : 0.5,
              }}
              onClick={() => handleModeSelect("basic")}
            >
              <div className={styles.optionIcon}>⌨️</div>
              <div className={styles.optionTitle}>Basic Terminal</div>
              <div className={styles.optionDescription}>
                Clean, focused terminal interface. Optimized for mobile.
              </div>
            </div>
            <div
              className={`${styles.interfaceOption} ${
                selectedMode === "futuristic"
                  ? styles.interfaceOptionActive
                  : ""
              }`}
              style={{
                pointerEvents: isReady && !isMobile ? "auto" : "none",
                opacity: isReady && !isMobile ? 1 : 0.4,
              }}
              title={isMobile ? "Dashboard is desktop-only" : undefined}
              onClick={() => handleModeSelect("futuristic")}
            >
              <div className={styles.optionIcon}>🛸</div>
              <div className={styles.optionTitle}>Dashboard</div>
              <div className={styles.optionDescription}>
                3-panel layout with sidebar, terminal, and system stats.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomStatus}>
        OMEGA PROTOCOL v{APP_VERSION} - SYSTEM READY
      </div>
    </div>
  );
}

export default WelcomeScreen;
