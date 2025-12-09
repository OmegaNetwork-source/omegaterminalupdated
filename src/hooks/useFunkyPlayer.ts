"use client";

/**
 * useFunkyPlayer Hook
 *
 * Simple state management for Omega Funky Player panel visibility.
 * No provider needed - just local state with event listeners.
 */

import { useState, useEffect, useCallback } from "react";

interface FunkyPlayerState {
  isPanelOpen: boolean;
}

export function useFunkyPlayer() {
  const [playerState, setPlayerState] = useState<FunkyPlayerState>({
    isPanelOpen: false,
  });

  useEffect(() => {
    const handleOpen = (e: CustomEvent) => {
      // Close all other players when this one opens
      window.dispatchEvent(new CustomEvent("omega:closeBluesPlayer"));
      window.dispatchEvent(new CustomEvent("omega:closeLoFiPlayer"));
      window.dispatchEvent(new CustomEvent("omega:closeTechPlayer"));
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

    window.addEventListener("omega:openFunkyPlayer", handleOpen as EventListener);
    window.addEventListener("omega:closeFunkyPlayer", handleClose);
    window.addEventListener("omega:openBluesPlayer", handleOtherPlayerOpen);
    window.addEventListener("omega:openLoFiPlayer", handleOtherPlayerOpen);
    window.addEventListener("omega:openTechPlayer", handleOtherPlayerOpen);
    window.addEventListener("omega:openOmegaTrancePlayer", handleOtherPlayerOpen);
    window.addEventListener("omega:openOmegaMelodiesPlayer", handleOtherPlayerOpen);

    return () => {
      window.removeEventListener("omega:openFunkyPlayer", handleOpen as EventListener);
      window.removeEventListener("omega:closeFunkyPlayer", handleClose);
      window.removeEventListener("omega:openBluesPlayer", handleOtherPlayerOpen);
      window.removeEventListener("omega:openLoFiPlayer", handleOtherPlayerOpen);
      window.removeEventListener("omega:openTechPlayer", handleOtherPlayerOpen);
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

