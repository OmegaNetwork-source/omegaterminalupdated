"use client";

/**
 * useLoFiPlayer Hook
 *
 * Simple state management for Omega Lo-Fi Player panel visibility.
 * No provider needed - just local state with event listeners.
 */

import { useState, useEffect, useCallback } from "react";

interface LoFiPlayerState {
  isPanelOpen: boolean;
}

export function useLoFiPlayer() {
  const [playerState, setPlayerState] = useState<LoFiPlayerState>({
    isPanelOpen: false,
  });

  useEffect(() => {
    const handleOpen = (e: CustomEvent) => {
      // Close all other players when this one opens
      window.dispatchEvent(new CustomEvent("omega:closeBluesPlayer"));
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

    window.addEventListener("omega:openLoFiPlayer", handleOpen as EventListener);
    window.addEventListener("omega:closeLoFiPlayer", handleClose);
    window.addEventListener("omega:openBluesPlayer", handleOtherPlayerOpen);
    window.addEventListener("omega:openTechPlayer", handleOtherPlayerOpen);
    window.addEventListener("omega:openFunkyPlayer", handleOtherPlayerOpen);

    return () => {
      window.removeEventListener("omega:openLoFiPlayer", handleOpen as EventListener);
      window.removeEventListener("omega:closeLoFiPlayer", handleClose);
      window.removeEventListener("omega:openBluesPlayer", handleOtherPlayerOpen);
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

