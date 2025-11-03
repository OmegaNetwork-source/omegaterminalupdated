"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import type { SoundInfo } from "@/types/sound";
import styles from "./SoundPreferences.module.css";

/**
 * SoundPreferences UI for enabling/disabling sounds and adjusting volume.
 */
export function SoundPreferences(): JSX.Element {
  const {
    state,
    setEnabled,
    setVolume,
    getRegisteredSounds,
    stopAllSounds,
    playSound,
  } = useSoundEffects();
  const { isEnabled, volume, audioContextState } = state;
  const [registered, setRegistered] = useState<SoundInfo[]>([]);

  useEffect(() => {
    setRegistered(getRegisteredSounds());
    const id = window.setInterval(() => {
      setRegistered(getRegisteredSounds());
    }, 500);
    return () => window.clearInterval(id);
  }, [getRegisteredSounds]);

  const statusClass = useMemo(() => {
    if (audioContextState === "running") return styles.statusRunning;
    if (audioContextState === "suspended") return styles.statusSuspended;
    if (audioContextState === "closed") return styles.statusClosed;
    return "";
  }, [audioContextState]);

  const handleToggleEnabled = () => setEnabled(!isEnabled);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);
  };

  const handleTestSound = async () => {
    try {
      await playSound("interface-select");
    } catch {}
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span>🔊</span>
        <span>Sound Effects Settings</span>
      </div>

      <div className={`${styles.section} ${styles.toggleSection}`}>
        <span className={styles.toggleLabel}>Enable Sound Effects</span>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            className={styles.toggleInput}
            checked={isEnabled}
            onChange={handleToggleEnabled}
          />
          <span className={styles.toggleSlider}></span>
        </label>
      </div>

      <div className={`${styles.section} ${styles.volumeSection}`}>
        <label className={styles.volumeLabel}>Master Volume</label>
        <div className={styles.volumeControl}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={volume}
            onChange={handleVolumeChange}
            className={styles.volumeSlider}
          />
          <span className={styles.volumePercentage}>
            {Math.round(volume * 100)}%
          </span>
          <button className={styles.testButton} onClick={handleTestSound}>
            Test Sound
          </button>
        </div>
      </div>

      <div className={`${styles.section} ${styles.statusSection}`}>
        <span className={styles.statusLabel}>Audio Context:</span>
        <span className={`${styles.statusValue} ${statusClass}`}>
          {audioContextState ?? "unavailable"}
        </span>
      </div>

      <div className={styles.section}>
        <div className={styles.volumeLabel}>Registered Sounds</div>
        <div className={styles.soundsList}>
          {registered.map((s) => (
            <div key={s.name} className={styles.soundItem}>
              <div className={styles.soundInfo}>
                <div className={styles.soundName}>{s.name}</div>
                {s.description ? (
                  <div className={styles.soundDescription}>{s.description}</div>
                ) : null}
                <div className={styles.soundMeta}>
                  vol {(s.volume * 100).toFixed(0)}% • {s.duration ?? "natural"}
                </div>
              </div>
              {s.isPlaying ? <div className={styles.playingIndicator} /> : null}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.controls}>
        <button
          className={styles.stopAllButton}
          onClick={stopAllSounds}
          disabled={registered.every((s) => !s.isPlaying)}
        >
          Stop All Sounds
        </button>
      </div>
    </div>
  );
}

export default SoundPreferences;
