/**
 * EggplantRain Component
 * Spawns eggplant emojis on click for Gio theme
 */

"use client";

import { useEffect, useState } from "react";
import styles from "./EggplantRain.module.css";

interface Eggplant {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  randomX: number;
}

export function EggplantRain() {
  const [eggplants, setEggplants] = useState<Eggplant[]>([]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      // Create multiple eggplants at click position
      const count = 25; // Number of eggplants per click
      const newEggplants: Eggplant[] = [];

      for (let i = 0; i < count; i++) {
        newEggplants.push({
          id: Date.now() + i,
          x: e.clientX + (Math.random() - 0.5) * 150, // Spread around click
          y: e.clientY + (Math.random() - 0.5) * 150,
          rotation: Math.random() * 360,
          scale: 0.4 + Math.random() * 0.8, // Random size between 0.4 and 1.2
          randomX: (Math.random() - 0.5) * 200, // Random horizontal movement
        });
      }

      setEggplants((prev) => [...prev, ...newEggplants]);

      // Remove eggplants after animation completes
      setTimeout(() => {
        setEggplants((prev) =>
          prev.filter((eggplant) => !newEggplants.includes(eggplant))
        );
      }, 2000);
    };

    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return (
    <div className={styles.container}>
      {eggplants.map((eggplant) => (
        <div
          key={eggplant.id}
          className={styles.eggplant}
          style={{
            left: `${eggplant.x}px`,
            top: `${eggplant.y}px`,
            transform: `rotate(${eggplant.rotation}deg) scale(${eggplant.scale})`,
            "--random-x": `${eggplant.randomX}px`,
          } as React.CSSProperties}
        >
          🍆
        </div>
      ))}
    </div>
  );
}

