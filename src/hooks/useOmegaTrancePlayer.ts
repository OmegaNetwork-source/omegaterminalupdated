"use client";

import { useState, useEffect, useCallback } from "react";

interface OmegaTrancePlayerState {
  isPanelOpen: boolean;
}

export function useOmegaTrancePlayer() {
  const [playerState, setPlayerState] = useState<OmegaTrancePlayerState>({
    isPanelOpen: false,
  });

  useEffect(() => {
    const handleOpen = (e: CustomEvent) => {
      // Close all other players when this one opens
      window.dispatchEvent(new CustomEvent("omega:closeBluesPlayer"));
      window.dispatchEvent(new CustomEvent("omega:closeLoFiPlayer"));
      window.dispatchEvent(new CustomEvent("omega:closeTechPlayer"));
      window.dispatchEvent(new CustomEvent("omega:closeFunkyPlayer"));
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

    window.addEventListener("omega:openOmegaTrancePlayer", handleOpen as EventListener);
    window.addEventListener("omega:closeOmegaTrancePlayer", handleClose);
    window.addEventListener("omega:openBluesPlayer", handleOtherPlayerOpen);
    window.addEventListener("omega:openLoFiPlayer", handleOtherPlayerOpen);
    window.addEventListener("omega:openTechPlayer", handleOtherPlayerOpen);
    window.addEventListener("omega:openFunkyPlayer", handleOtherPlayerOpen);
    window.addEventListener("omega:openOmegaMelodiesPlayer", handleOtherPlayerOpen);

    return () => {
      window.removeEventListener("omega:openOmegaTrancePlayer", handleOpen as EventListener);
      window.removeEventListener("omega:closeOmegaTrancePlayer", handleClose);
      window.removeEventListener("omega:openBluesPlayer", handleOtherPlayerOpen);
      window.removeEventListener("omega:openLoFiPlayer", handleOtherPlayerOpen);
      window.removeEventListener("omega:openTechPlayer", handleOtherPlayerOpen);
      window.removeEventListener("omega:openFunkyPlayer", handleOtherPlayerOpen);
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
