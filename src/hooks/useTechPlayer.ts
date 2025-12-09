"use client";

/**
 * useTechPlayer Hook
 *
 * Simple state management for Omega Tech Player panel visibility.
 * No provider needed - just local state with event listeners.
 */

import { useState, useEffect, useCallback } from "react";

interface TechPlayerState {
  isPanelOpen: boolean;
}

export function useTechPlayer() {
  const [playerState, setPlayerState] = useState<TechPlayerState>({
    isPanelOpen: false,
  });

  useEffect(() => {
    const handleOpen = (e: CustomEvent) => {
      // Close all other players when this one opens
      window.dispatchEvent(new CustomEvent("omega:closeBluesPlayer"));
      window.dispatchEvent(new CustomEvent("omega:closeLoFiPlayer"));
      window.dispatchEvent(new CustomEvent("omega:closeFunkyPlayer"));
      window.dispatchEvent(new CustomEvent("omega:closeOmegaTrancePlayer"));
      window.dispatchEvent(new CustomEvent("omega:closeOmegaMelodiesPlayer"));
      setPlayerState({ isPanelOpen: true });
    };

    const handleClose = () => {
      setPlayerState({ isPanelOpen: false });
    };

    // Listen for other players opening and close this one
    const handleOtherPlayerOpen = () => {
      setPlayerState({ isPanelOpen: false });
    };

    window.addEventListener("omega:openTechPlayer", handleOpen as EventListener);
    window.addEventListener("omega:closeTechPlayer", handleClose);
    window.addEventListener("omega:openBluesPlayer", handleOtherPlayerOpen);
    window.addEventListener("omega:openLoFiPlayer", handleOtherPlayerOpen);
    window.addEventListener("omega:openFunkyPlayer", handleOtherPlayerOpen);
    window.addEventListener("omega:openOmegaTrancePlayer", handleOtherPlayerOpen);
    window.addEventListener("omega:openOmegaMelodiesPlayer", handleOtherPlayerOpen);

    return () => {
      window.removeEventListener("omega:openTechPlayer", handleOpen as EventListener);
      window.removeEventListener("omega:closeTechPlayer", handleClose);
      window.removeEventListener("omega:openBluesPlayer", handleOtherPlayerOpen);
      window.removeEventListener("omega:openLoFiPlayer", handleOtherPlayerOpen);
      window.removeEventListener("omega:openFunkyPlayer", handleOtherPlayerOpen);
      window.removeEventListener("omega:openOmegaTrancePlayer", handleOtherPlayerOpen);
      window.removeEventListener("omega:openOmegaMelodiesPlayer", handleOtherPlayerOpen);
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

