"use client";

import { useState, useEffect, useCallback } from "react";

interface OmegaMelodiesPlayerState {
  isPanelOpen: boolean;
}

export function useOmegaMelodiesPlayer() {
  const [playerState, setPlayerState] = useState<OmegaMelodiesPlayerState>({
    isPanelOpen: false,
  });

  useEffect(() => {
    const handleOpen = (e: CustomEvent) => {
      // Close all other players when this one opens
      window.dispatchEvent(new CustomEvent("omega:closeBluesPlayer"));
      window.dispatchEvent(new CustomEvent("omega:closeLoFiPlayer"));
      window.dispatchEvent(new CustomEvent("omega:closeTechPlayer"));
      window.dispatchEvent(new CustomEvent("omega:closeFunkyPlayer"));
      window.dispatchEvent(new CustomEvent("omega:closeOmegaTrancePlayer"));
      setPlayerState({ isPanelOpen: true });
    };

    const handleClose = () => {
      setPlayerState({ isPanelOpen: false });
    };

    // Listen for other players opening and close this one
    const handleOtherPlayerOpen = () => {
      setPlayerState({ isPanelOpen: false });
    };

    window.addEventListener("omega:openOmegaMelodiesPlayer", handleOpen as EventListener);
    window.addEventListener("omega:closeOmegaMelodiesPlayer", handleClose);
    window.addEventListener("omega:openBluesPlayer", handleOtherPlayerOpen);
    window.addEventListener("omega:openLoFiPlayer", handleOtherPlayerOpen);
    window.addEventListener("omega:openTechPlayer", handleOtherPlayerOpen);
    window.addEventListener("omega:openFunkyPlayer", handleOtherPlayerOpen);
    window.addEventListener("omega:openOmegaTrancePlayer", handleOtherPlayerOpen);

    return () => {
      window.removeEventListener("omega:openOmegaMelodiesPlayer", handleOpen as EventListener);
      window.removeEventListener("omega:closeOmegaMelodiesPlayer", handleClose);
      window.removeEventListener("omega:openBluesPlayer", handleOtherPlayerOpen);
      window.removeEventListener("omega:openLoFiPlayer", handleOtherPlayerOpen);
      window.removeEventListener("omega:openTechPlayer", handleOtherPlayerOpen);
      window.removeEventListener("omega:openFunkyPlayer", handleOtherPlayerOpen);
      window.removeEventListener("omega:openOmegaTrancePlayer", handleOtherPlayerOpen);
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
