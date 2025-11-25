"use client";

import { useCallback } from "react";
import { BottomSheet } from "./BottomSheet";
import type { AIProvider } from "@/types";
import styles from "./AIProviderBottomSheet.module.css";

interface AIProviderBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentProvider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
}

const AI_PROVIDERS: Array<{ value: AIProvider; label: string; description: string }> = [
  { value: "off", label: "Off", description: "AI assistance disabled" },
  { value: "near", label: "NEAR AI", description: "NEAR Protocol AI assistant" },
  { value: "openai", label: "OpenAI", description: "OpenAI GPT assistant" },
  { value: "companion", label: "Companion", description: "AI companion with video chat" },
];

/**
 * AIProviderBottomSheet Component
 * Mobile-friendly bottom sheet for selecting AI provider
 * Replaces the native select dropdown on mobile devices
 */
export function AIProviderBottomSheet({
  isOpen,
  onClose,
  currentProvider,
  onProviderChange,
}: AIProviderBottomSheetProps) {
  const handleProviderSelect = useCallback(
    (provider: AIProvider) => {
      onProviderChange(provider);
      onClose();
    },
    [onProviderChange, onClose]
  );

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Select AI Provider">
      <div className={styles.providersList}>
        {AI_PROVIDERS.map((provider) => (
          <button
            key={provider.value}
            className={`${styles.providerOption} ${
              currentProvider === provider.value ? styles.providerOptionActive : ""
            }`}
            onClick={() => handleProviderSelect(provider.value)}
            type="button"
            aria-label={`Select ${provider.label}`}
            aria-pressed={currentProvider === provider.value}
          >
            <div className={styles.providerInfo}>
              <span className={styles.providerLabel}>{provider.label}</span>
              <span className={styles.providerDescription}>{provider.description}</span>
            </div>
            {currentProvider === provider.value && (
              <span className={styles.providerCheckmark} aria-hidden="true">
                ✓
              </span>
            )}
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}

