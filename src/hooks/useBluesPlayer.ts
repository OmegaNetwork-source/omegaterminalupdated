"use client";

/**
 * useBluesPlayer Hook
 *
 * Simple state management for Omega Blues Player panel visibility.
 * No provider needed - just local state with event listeners.
 */

import { useState, useEffect, useCallback } from "react";

interface BluesPlayerState {
  isPanelOpen: boolean;
}

export function useBluesPlayer() {
  const [playerState, setPlayerState] = useState<BluesPlayerState>({
    isPanelOpen: false,
  });

  useEffect(() => {
    const handleOpen = (e: CustomEvent) => {
      // Close all other players when this one opens
      window.dispatchEvent(new CustomEvent("omega:closeLoFiPlayer"));
      window.dispatchEvent(new CustomEvent("omega:closeTechPlayer"));
      window.dispatchEvent(new CustomEvent("omega:closeFunkyPlayer"));
      setPlayerState({ isPanelOpen: true });
    };

    const handleClose = () => {
      setPlayerState({ isPanelOpen: false });
    };

    // Listen for other players opening and close this one
    const handleOtherPlayerOpen = () => {
      setPlayerState({ isPanelOpen: false });
    };

    window.addEventListener("omega:openBluesPlayer", handleOpen as EventListener);
    window.addEventListener("omega:closeBluesPlayer", handleClose);
    window.addEventListener("omega:openLoFiPlayer", handleOtherPlayerOpen);
    window.addEventListener("omega:openTechPlayer", handleOtherPlayerOpen);
    window.addEventListener("omega:openFunkyPlayer", handleOtherPlayerOpen);

    return () => {
      window.removeEventListener("omega:openBluesPlayer", handleOpen as EventListener);
      window.removeEventListener("omega:closeBluesPlayer", handleClose);
      window.removeEventListener("omega:openLoFiPlayer", handleOtherPlayerOpen);
      window.removeEventListener("omega:openTechPlayer", handleOtherPlayerOpen);
      window.removeEventListener("omega:openFunkyPlayer", handleOtherPlayerOpen);
    };
  }, []);

  const openPanel = useCallback(() => {
    setPlayerState({ isPanelOpen: true });
  }, []);

  const closePanel = useCallback(() => {
    setPlayerState({ isPanelOpen: false });
  }, []);

  return {
    playerState,
    openPanel,
    closePanel,
  };
}

