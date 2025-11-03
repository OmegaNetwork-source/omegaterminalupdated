import { useContext } from "react";
import { SoundEffectsContext } from "@/providers/SoundEffectsProvider";
import { SoundEffectsContextValue } from "@/types/sound";

/**
 * Access the SoundEffects context for playing UI sounds.
 * Must be used within the SoundEffectsProvider.
 */
export function useSoundEffects(): SoundEffectsContextValue {
  const ctx = useContext(SoundEffectsContext);
  if (!ctx) {
    throw new Error("useSoundEffects must be used within SoundEffectsProvider");
  }
  return ctx;
}
