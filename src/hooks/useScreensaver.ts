"use client";

import { useState, useEffect, useCallback } from "react";

interface ScreensaverState {
  isActive: boolean;
}

export function useScreensaver() {
  const [screensaverState, setScreensaverState] = useState<ScreensaverState>({
    isActive: false,
  });

  useEffect(() => {
    const handleOpen = (e: CustomEvent) => {
      setScreensaverState({ isActive: true });
    };

    const handleClose = () => {
      setScreensaverState({ isActive: false });
    };

    window.addEventListener("omega:openScreensaver", handleOpen as EventListener);
    window.addEventListener("omega:closeScreensaver", handleClose);

    return () => {
      window.removeEventListener("omega:openScreensaver", handleOpen as EventListener);
      window.removeEventListener("omega:closeScreensaver", handleClose);
    };
  }, []);

  const openScreensaver = useCallback(() => {
    setScreensaverState({ isActive: true });
  }, []);

  const closeScreensaver = useCallback(() => {
    setScreensaverState({ isActive: false });
  }, []);

  return {
    screensaverState,
    openScreensaver,
    closeScreensaver,
  };
}


