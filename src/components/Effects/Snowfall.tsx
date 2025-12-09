"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./Snowfall.module.css";

/**
 * Snowflake configuration interface
 */
interface Snowflake {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  drift: number;
}

/**
 * Snowfall component props
 */
interface SnowfallProps {
  /**
   * Number of snowflakes to render
   * @default 150
   */
  snowflakeCount?: number;
  /**
   * Color of snowflakes
   * @default "rgba(255, 255, 255, 0.8)"
   */
  color?: string;
  /**
   * Minimum snowflake size in pixels
   * @default 2
   */
  minSize?: number;
  /**
   * Maximum snowflake size in pixels
   * @default 8
   */
  maxSize?: number;
  /**
   * Minimum fall speed
   * @default 0.5
   */
  minSpeed?: number;
  /**
   * Maximum fall speed
   * @default 2
   */
  maxSpeed?: number;
  /**
   * Wind effect strength (horizontal drift)
   * @default 0.5
   */
  wind?: number;
  /**
   * Radius for snowflake collection area
   * @default 50
   */
  radius?: number;
}

/**
 * Custom Snowfall Component
 * Creates a beautiful, non-interactive snowfall effect
 * Inspired by react-snowfall but built from scratch for Omega Terminal
 */
export function Snowfall({
  snowflakeCount = 150,
  color = "rgba(255, 255, 255, 0.8)",
  minSize = 2,
  maxSize = 8,
  minSpeed = 0.5,
  maxSpeed = 2,
  wind = 0.5,
  radius = 50,
}: SnowfallProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const snowflakesRef = useRef<Snowflake[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Initialize snowflakes
  const initializeSnowflakes = (width: number, height: number): Snowflake[] => {
    return Array.from({ length: snowflakeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: minSize + Math.random() * (maxSize - minSize),
      speed: minSpeed + Math.random() * (maxSpeed - minSpeed),
      opacity: 0.3 + Math.random() * 0.7,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
      drift: (Math.random() - 0.5) * wind,
    }));
  };

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (typeof window !== "undefined") {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Initialize snowflakes when dimensions change
  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      snowflakesRef.current = initializeSnowflakes(
        dimensions.width,
        dimensions.height
      );
    }
  }, [dimensions, snowflakeCount, minSize, maxSize, minSpeed, maxSpeed, wind]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    canvas.width = dimensions.width || window.innerWidth;
    canvas.height = dimensions.height || window.innerHeight;

    const animate = () => {
      if (!ctx || !canvas) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const snowflakes = snowflakesRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Update and draw each snowflake
      for (let i = 0; i < snowflakes.length; i++) {
        const flake = snowflakes[i];
        if (!flake) continue;

        // Update position
        flake.y += flake.speed;
        flake.x += flake.drift + Math.sin(flake.y * 0.01) * 0.5;
        flake.rotation += flake.rotationSpeed;

        // Reset if snowflake goes off screen
        if (flake.y > height) {
          flake.y = -flake.size;
          flake.x = Math.random() * width;
        }

        // Wrap horizontally
        if (flake.x < -flake.size) {
          flake.x = width + flake.size;
        } else if (flake.x > width + flake.size) {
          flake.x = -flake.size;
        }

        // Draw snowflake
        ctx.save();
        ctx.translate(flake.x, flake.y);
        ctx.rotate(flake.rotation);
        ctx.globalAlpha = flake.opacity;

        // Draw a simple snowflake shape (6-pointed star)
        ctx.beginPath();
        const size = flake.size;
        for (let j = 0; j < 6; j++) {
          const angle = (Math.PI / 3) * j;
          const x1 = Math.cos(angle) * size;
          const y1 = Math.sin(angle) * size;
          const x2 = Math.cos(angle) * size * 0.5;
          const y2 = Math.sin(angle) * size * 0.5;

          if (j === 0) {
            ctx.moveTo(x1, y1);
          } else {
            ctx.lineTo(x1, y1);
          }
          ctx.lineTo(x2, y2);
        }
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        // Add a subtle glow effect
        ctx.shadowBlur = 3;
        ctx.shadowColor = color;
        ctx.fill();

        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions, color]);

  if (dimensions.width === 0 || dimensions.height === 0) {
    return <></>;
  }

  return (
    <canvas
      ref={canvasRef}
      className={styles.snowfall}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}

export default Snowfall;

