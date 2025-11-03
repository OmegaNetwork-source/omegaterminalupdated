"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  PropsWithChildren,
} from "react";
import {
  SoundConfig,
  SoundEffectsContextValue,
  SoundEffectsState,
  SoundInfo,
  SoundName,
  SoundPlayOptions,
} from "@/types/sound";

const ENABLED_KEY = "omega-sound-effects-enabled";
const VOLUME_KEY = "omega-sound-effects-volume";

export const SoundEffectsContext = createContext<
  SoundEffectsContextValue | undefined
>(undefined);

/**
 * Provider that manages sound effects via the Web Audio API and HTMLAudioElement.
 * Handles registration, preloading, playback, preferences, and global button sounds.
 */
export function SoundEffectsProvider({ children }: PropsWithChildren<{}>) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundsRef = useRef<Map<string, SoundConfig>>(new Map());
  const playingRef = useRef<Set<string>>(new Set());
  const activeInstancesRef = useRef<Map<string, Set<HTMLAudioElement>>>(
    new Map()
  );

  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [volume, setVolumeState] = useState<number>(0.7);
  const [audioContextState, setAudioContextState] = useState<
    "suspended" | "running" | "closed" | null
  >(null);

  const initializeAudioContext = useCallback(async () => {
    try {
      if (typeof window === "undefined") return;
      const AC: any =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AC) {
        setAudioContextState(null);
        setIsEnabled(false);
        return;
      }
      if (!audioContextRef.current) {
        audioContextRef.current = new AC();
      }
      setAudioContextState(audioContextRef.current.state as any);
    } catch {
      setIsEnabled(false);
    }
  }, []);

  const preloadSound = useCallback(
    async (name: string) => {
      const cfg = soundsRef.current.get(name);
      if (!cfg) return;
      try {
        const audio = new Audio(cfg.src);
        audio.preload = "auto";
        audio.volume = (cfg.volume ?? 0.7) * volume;
        await new Promise<void>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            // Timeout fallback after 8 seconds
            resolve();
          }, 8000);

          const onReady = () => {
            clearTimeout(timeoutId);
            audio.removeEventListener("canplaythrough", onReady);
            audio.removeEventListener("loadeddata", onLoadedData);
            resolve();
          };
          const onLoadedData = () => {
            // Fallback to loadeddata if canplaythrough doesn't fire
            clearTimeout(timeoutId);
            audio.removeEventListener("canplaythrough", onReady);
            audio.removeEventListener("loadeddata", onLoadedData);
            resolve();
          };
          const onErr = () => {
            clearTimeout(timeoutId);
            audio.removeEventListener("error", onErr);
            reject(new Error("audio preload error"));
          };
          audio.addEventListener("canplaythrough", onReady, { once: true });
          audio.addEventListener("loadeddata", onLoadedData, { once: true });
          audio.addEventListener("error", onErr, { once: true });
          audio.load();
        });
        cfg.audioElement = audio;
        soundsRef.current.set(name, cfg);
      } catch {
        // ignore preload errors; fallback to on-demand
      }
    },
    [volume]
  );

  const registerSound = useCallback(
    async (name: SoundName | string, config: SoundConfig) => {
      const cfg: SoundConfig = {
        volume: 0.7,
        duration: 1000,
        preload: true,
        loop: false,
        description: "",
        ...config,
      };
      soundsRef.current.set(name, cfg);
      if (cfg.preload) {
        await preloadSound(name);
      }
    },
    [preloadSound]
  );

  const playSound = useCallback(
    async (name: SoundName, options?: SoundPlayOptions) => {
      if (!isEnabled) return;
      const cfg = soundsRef.current.get(name);
      if (!cfg) return;

      const ctx = audioContextRef.current;
      if (ctx && ctx.state === "suspended") {
        try {
          await ctx.resume();
          setAudioContextState(ctx.state as any);
        } catch {
          // resume may fail due to autoplay policies; continue anyway
        }
      }

      const base = cfg.audioElement
        ? cfg.audioElement.cloneNode(true)
        : new Audio(cfg.src);
      const audio = base as HTMLAudioElement;
      const effectiveVolume =
        (cfg.volume ?? 0.7) * volume * (options?.volume ?? 1);
      audio.volume = Math.max(0, Math.min(1, effectiveVolume));
      audio.loop = options?.loop ?? !!cfg.loop;

      // Track this active instance
      if (!activeInstancesRef.current.has(name)) {
        activeInstancesRef.current.set(name, new Set());
      }
      activeInstancesRef.current.get(name)!.add(audio);

      playingRef.current.add(name);

      const cleanup = () => {
        playingRef.current.delete(name);
        const instances = activeInstancesRef.current.get(name);
        if (instances) {
          instances.delete(audio);
        }
      };
      audio.addEventListener("ended", cleanup, { once: true });
      audio.addEventListener("error", cleanup, { once: true });

      try {
        await audio.play();
      } catch {
        cleanup();
        return;
      }

      if (!audio.loop) {
        const duration = cfg.duration === undefined ? 1000 : cfg.duration;
        if (duration && duration > 0) {
          window.setTimeout(() => {
            try {
              audio.pause();
              audio.currentTime = 0;
            } finally {
              cleanup();
            }
          }, duration);
        }
      }
    },
    [isEnabled, volume]
  );

  const stopSound = useCallback((name: string) => {
    // Stop all active instances for this sound
    const instances = activeInstancesRef.current.get(name);
    if (instances && instances.size > 0) {
      instances.forEach((audio) => {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch {}
      });
      instances.clear();
    }

    // Also stop the cached preloaded element if it exists
    const cfg = soundsRef.current.get(name);
    if (cfg?.audioElement) {
      try {
        cfg.audioElement.pause();
        cfg.audioElement.currentTime = 0;
      } catch {}
    }

    playingRef.current.delete(name);
  }, []);

  const stopAllSounds = useCallback(() => {
    // Stop all active instances across all sounds
    for (const [, instances] of activeInstancesRef.current) {
      instances.forEach((audio) => {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch {}
      });
      instances.clear();
    }

    // Also stop all cached preloaded elements
    for (const [, cfg] of soundsRef.current) {
      if (cfg.audioElement) {
        try {
          cfg.audioElement.pause();
          cfg.audioElement.currentTime = 0;
        } catch {}
      }
    }

    playingRef.current.clear();
  }, []);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);

    // Update cached preloaded elements
    for (const [, cfg] of soundsRef.current) {
      if (cfg.audioElement) {
        cfg.audioElement.volume = (cfg.volume ?? 0.7) * clamped;
      }
    }

    // Update all actively playing instances
    for (const [name, instances] of activeInstancesRef.current) {
      const cfg = soundsRef.current.get(name);
      const baseVolume = cfg?.volume ?? 0.7;
      instances.forEach((audio) => {
        try {
          // Preserve any per-instance volume multiplier by recalculating
          audio.volume = Math.max(0, Math.min(1, baseVolume * clamped));
        } catch {}
      });
    }

    try {
      localStorage.setItem(VOLUME_KEY, String(clamped));
    } catch {}
  }, []);

  const setEnabled = useCallback(
    (enabled: boolean) => {
      setIsEnabled(enabled);
      if (!enabled) stopAllSounds();
      try {
        localStorage.setItem(ENABLED_KEY, String(enabled));
      } catch {}
    },
    [stopAllSounds]
  );

  const getRegisteredSounds = useCallback((): SoundInfo[] => {
    const out: SoundInfo[] = [];
    for (const [name, cfg] of soundsRef.current) {
      out.push({
        name,
        description: cfg.description ?? "",
        duration: cfg.duration ?? null,
        volume: cfg.volume ?? 0.7,
        isPlaying: playingRef.current.has(name),
      });
    }
    return out;
  }, []);

  const isPlaying = useCallback(
    (name: string) => playingRef.current.has(name),
    []
  );

  const playWalletConnectSound = useCallback(
    (options?: SoundPlayOptions) => playSound("wallet-connect", options),
    [playSound]
  );
  const playAIToggleSound = useCallback(
    (options?: SoundPlayOptions) => playSound("ai-toggle", options),
    [playSound]
  );
  const playBalanceWealthSound = useCallback(
    (options?: SoundPlayOptions) => playSound("balance-wealth", options),
    [playSound]
  );
  const playChartViewerSound = useCallback(
    (options?: SoundPlayOptions) => playSound("chart-viewer", options),
    [playSound]
  );
  const playBasicViewSound = useCallback(
    (options?: SoundPlayOptions) => playSound("basic-view", options),
    [playSound]
  );
  const playClearTerminalSound = useCallback(
    (options?: SoundPlayOptions) => playSound("clear-terminal", options),
    [playSound]
  );
  const playModernUIThemeSound = useCallback(
    (options?: SoundPlayOptions) => playSound("modern-ui-theme", options),
    [playSound]
  );
  const playHelpCommandSound = useCallback(
    (options?: SoundPlayOptions) => playSound("help-command", options),
    [playSound]
  );

  const loadDefaultSounds = useCallback(async () => {
    await registerSound("interface-select", {
      src: "/sounds/wookie.mp4.mp3",
      volume: 0.8,
      duration: 2000,
      description: "Interface selection",
    });
    await registerSound("wallet-connect", {
      src: "/sounds/robot-gmb.mp3",
      volume: 0.8,
      duration: 2000,
      description: "Wallet connect",
    });
    await registerSound("ai-toggle", {
      src: "/sounds/i-am-a-robot.mp3",
      volume: 1.0,
      duration: null,
      description: "AI toggle",
    });
    await registerSound("balance-wealth", {
      src: "/sounds/so-you-rich.mp3",
      volume: 0.8,
      duration: null,
      description: "Balance / wealth",
    });
    await registerSound("chart-viewer", {
      src: "/sounds/so-you-rich.mp3",
      volume: 0.8,
      duration: null,
      description: "Chart viewer",
    });
    await registerSound("basic-view", {
      src: "/sounds/oh-fucking.mp3",
      volume: 0.8,
      duration: null,
      preload: false,
      description: "Basic terminal view",
    });
    await registerSound("clear-terminal", {
      src: "/sounds/you-cocky.mp3",
      volume: 0.8,
      duration: null,
      preload: false,
      description: "Clear terminal",
    });
    await registerSound("modern-ui-theme", {
      src: "/sounds/grandmas-boy.mp3",
      volume: 0.8,
      duration: null,
      description: "Modern UI theme",
    });
    await registerSound("help-command", {
      src: "/sounds/grandmas-boy.mp3",
      volume: 0.8,
      duration: null,
      description: "Help command",
    });
    await registerSound("command-execute", {
      src: "/sounds/wookie.mp4.mp3",
      volume: 0.7,
      duration: null,
      preload: false,
      description: "Command execution",
    });
  }, [registerSound]);

  useEffect(() => {
    initializeAudioContext();
    loadDefaultSounds();

    try {
      const persistedEnabled = localStorage.getItem(ENABLED_KEY);
      if (persistedEnabled != null) setIsEnabled(persistedEnabled === "true");
      const persistedVolume = localStorage.getItem(VOLUME_KEY);
      if (persistedVolume != null) setVolumeState(Number(persistedVolume));
    } catch {}

    const handler = async () => {
      const ctx = audioContextRef.current;
      if (ctx && ctx.state === "suspended") {
        try {
          await ctx.resume();
          setAudioContextState(ctx.state as any);
        } catch {}
      }
    };

    document.addEventListener("click", handler);
    document.addEventListener("touchstart", handler, { passive: true });

    const buttonDelegation = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const isButtonLike = (el: HTMLElement) => {
        const tag = el.tagName?.toLowerCase();
        if (tag === "button") return true;
        if (el.getAttribute("role") === "button") return true;
        const style = window.getComputedStyle(el);
        if (style.cursor === "pointer") return true;
        if (
          el.classList.contains("interface-option") ||
          el.classList.contains("tab") ||
          el.classList.contains("theme-toggle")
        ) {
          return true;
        }
        return false;
      };
      let el: HTMLElement | null = target;
      while (el) {
        if (isButtonLike(el)) {
          // non-blocking; ignore errors
          playSound("interface-select").catch(() => {});
          break;
        }
        el = el.parentElement;
      }
    };
    document.addEventListener("click", buttonDelegation);
    document.addEventListener("touchstart", buttonDelegation, {
      passive: true,
    });

    return () => {
      document.removeEventListener("click", handler);
      document.removeEventListener("touchstart", handler);
      document.removeEventListener("click", buttonDelegation);
      document.removeEventListener("touchstart", buttonDelegation);
    };
  }, [initializeAudioContext, loadDefaultSounds, playSound]);

  const state: SoundEffectsState = useMemo(
    () => ({
      isEnabled,
      volume,
      currentlyPlaying: playingRef.current,
      audioContextState,
    }),
    [isEnabled, volume, audioContextState]
  );

  const value: SoundEffectsContextValue = useMemo(
    () => ({
      state,
      playSound,
      stopSound,
      stopAllSounds,
      setVolume,
      setEnabled,
      getRegisteredSounds,
      isPlaying,
      playWalletConnectSound,
      playAIToggleSound,
      playBalanceWealthSound,
      playChartViewerSound,
      playBasicViewSound,
      playClearTerminalSound,
      playModernUIThemeSound,
      playHelpCommandSound,
    }),
    [
      state,
      playSound,
      stopSound,
      stopAllSounds,
      setVolume,
      setEnabled,
      getRegisteredSounds,
      isPlaying,
      playWalletConnectSound,
      playAIToggleSound,
      playBalanceWealthSound,
      playChartViewerSound,
      playBasicViewSound,
      playClearTerminalSound,
      playModernUIThemeSound,
      playHelpCommandSound,
    ]
  );

  return (
    <SoundEffectsContext.Provider value={value}>
      {children}
    </SoundEffectsContext.Provider>
  );
}
