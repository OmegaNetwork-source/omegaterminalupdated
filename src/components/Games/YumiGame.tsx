"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import styles from "./YumiGame.module.css";

interface Bubble {
  x: number;
  y: number;
  radius: number;
  dx: number;
  dy: number;
  size: "tiny" | "small" | "medium" | "large" | "huge";
  type: "normal" | "shatter" | "shatterChild";
  color: string;
}

interface Projectile {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
}

interface PowerUp {
  x: number;
  y: number;
  type: "speed" | "shield" | "spread" | "freeze";
  radius: number;
  dy: number;
}

interface GameState {
  score: number;
  lives: number;
  level: number;
  combo: number;
  isPaused: boolean;
  isGameOver: boolean;
}

const BUBBLE_SIZES = {
  huge: { radius: 60, points: 100, splits: 2 },
  large: { radius: 45, points: 50, splits: 2 },
  medium: { radius: 30, points: 25, splits: 2 },
  small: { radius: 20, points: 10, splits: 2 },
  tiny: { radius: 12, points: 5, splits: 0 },
} as const;

const COLORS = {
  huge: "#ff5fd4",
  large: "#ff88cc",
  medium: "#ffaadd",
  small: "#ffccee",
  tiny: "#ffeeff",
  player: "#46fbe3",
  projectile: "#46fbe3",
  background: "#101010",
  text: "#ffffff",
} as const;

interface YumiGameProps {
  onScoreUpdate: (score: number) => void;
  onGameEnd: (finalScore: number) => void;
}

export function YumiGame({ onScoreUpdate, onGameEnd }: YumiGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: 3,
    level: 1,
    combo: 0,
    isPaused: false,
    isGameOver: false,
  });

  // Update score in parent
  useEffect(() => {
    onScoreUpdate(gameState.score);
  }, [gameState.score, onScoreUpdate]);

  const playerRef = useRef({ x: 0, y: 0, width: 60, height: 60, speed: 5 });
  const bubblesRef = useRef<Bubble[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const keysRef = useRef<Set<string>>(new Set());
  const lastShotRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef(performance.now());

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      // Initialize player position
      playerRef.current.x = canvas.width / 2 - playerRef.current.width / 2;
      playerRef.current.y = canvas.height - playerRef.current.height - 20;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Spawn initial bubbles
    spawnBubbles(gameState.level);

    // Start game loop
    gameLoop();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
        return;
      }
      keysRef.current.add(e.key);
      
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        shoot();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const spawnBubbles = useCallback((level: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const count = Math.min(3 + level, 8);
    bubblesRef.current = [];

    for (let i = 0; i < count; i++) {
      const size = Math.random() > 0.7 ? "large" : Math.random() > 0.5 ? "medium" : "small";
      const radius = BUBBLE_SIZES[size].radius;
      
      bubblesRef.current.push({
        x: Math.random() * (canvas.width - radius * 2) + radius,
        y: -radius - Math.random() * 200,
        radius,
        dx: (Math.random() - 0.5) * 2,
        dy: 0.5 + level * 0.1,
        size: size as Bubble["size"],
        type: "normal",
        color: COLORS[size],
      });
    }
  }, []);

  const shoot = useCallback(() => {
    const now = performance.now();
    if (now - lastShotRef.current < 200) return; // Rate limit
    
    lastShotRef.current = now;
    const player = playerRef.current;

    projectilesRef.current.push({
      x: player.x + player.width / 2,
      y: player.y,
      dx: 0,
      dy: -8,
      radius: 4,
    });
  }, []);

  const splitBubble = useCallback((bubble: Bubble, index: number) => {
    bubblesRef.current.splice(index, 1);
    
    if (bubble.size === "tiny") {
      setGameState((prev) => ({
        ...prev,
        score: prev.score + BUBBLE_SIZES.tiny.points * (prev.combo + 1),
        combo: prev.combo + 1,
      }));
      return;
    }

    const sizeMap: Record<string, { next: Bubble["size"]; radius: number }> = {
      huge: { next: "large", radius: BUBBLE_SIZES.large.radius },
      large: { next: "medium", radius: BUBBLE_SIZES.medium.radius },
      medium: { next: "small", radius: BUBBLE_SIZES.small.radius },
      small: { next: "tiny", radius: BUBBLE_SIZES.tiny.radius },
    };

    const next = sizeMap[bubble.size];
    if (!next) return;

    const splits = BUBBLE_SIZES[bubble.size].splits;
    for (let i = 0; i < splits; i++) {
      const angle = (Math.PI / 2) * (i - (splits - 1) / 2) / (splits - 1);
      bubblesRef.current.push({
        x: bubble.x,
        y: bubble.y,
        radius: next.radius,
        dx: Math.cos(angle) * 2,
        dy: Math.sin(angle) * 2,
        size: next.next,
        type: "normal",
        color: COLORS[next.next],
      });
    }

    setGameState((prev) => ({
      ...prev,
      score: prev.score + BUBBLE_SIZES[bubble.size].points * (prev.combo + 1),
      combo: prev.combo + 1,
    }));
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const now = performance.now();
    const deltaTime = Math.min((now - lastTimeRef.current) / 16.67, 2); // Cap at 2x speed
    lastTimeRef.current = now;

    if (gameState.isPaused || gameState.isGameOver) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    // Update player
    const player = playerRef.current;
    if (keysRef.current.has("ArrowLeft") && player.x > 0) {
      player.x -= player.speed;
    }
    if (keysRef.current.has("ArrowRight") && player.x < canvas.width - player.width) {
      player.x += player.speed;
    }

    // Update bubbles
    bubblesRef.current.forEach((bubble, i) => {
      bubble.x += bubble.dx;
      bubble.y += bubble.dy;

      // Bounce off walls
      if (bubble.x - bubble.radius < 0 || bubble.x + bubble.radius > canvas.width) {
        bubble.dx = -bubble.dx;
      }

      // Check if bubble reached bottom
      if (bubble.y + bubble.radius > canvas.height) {
        bubblesRef.current.splice(i, 1);
        setGameState((prev) => {
          const newLives = prev.lives - 1;
          if (newLives <= 0) {
            // Call onGameEnd when game over
            setTimeout(() => {
              onGameEnd(prev.score);
            }, 100);
            return { ...prev, lives: 0, isGameOver: true };
          }
          return { ...prev, lives: newLives, combo: 0 };
        });
      }
    });

    // Update projectiles
    projectilesRef.current.forEach((proj, i) => {
      proj.y += proj.dy;

      // Check collision with bubbles
      bubblesRef.current.forEach((bubble, bi) => {
        const dx = proj.x - bubble.x;
        const dy = proj.y - bubble.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < proj.radius + bubble.radius) {
          projectilesRef.current.splice(i, 1);
          splitBubble(bubble, bi);
        }
      });

      // Remove if out of bounds
      if (proj.y < 0) {
        projectilesRef.current.splice(i, 1);
      }
    });

    // Check level completion
    if (bubblesRef.current.length === 0 && !gameState.isGameOver) {
      setGameState((prev) => ({
        ...prev,
        level: prev.level + 1,
        combo: 0,
      }));
      spawnBubbles(gameState.level + 1);
    }

    // Draw
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw bubbles
    bubblesRef.current.forEach((bubble) => {
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
      ctx.fillStyle = bubble.color;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw projectiles
    projectilesRef.current.forEach((proj) => {
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.projectile;
      ctx.fill();
    });

    // Draw player
    ctx.fillStyle = COLORS.player;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw UI
    ctx.fillStyle = COLORS.text;
    ctx.font = "16px monospace";
    ctx.fillText(`Score: ${gameState.score}`, 10, 30);
    ctx.fillText(`Lives: ${gameState.lives}`, 10, 50);
    ctx.fillText(`Level: ${gameState.level}`, 10, 70);
    ctx.fillText(`Combo: ${gameState.combo}x`, 10, 90);

    if (gameState.isPaused) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = COLORS.text;
      ctx.font = "32px monospace";
      ctx.textAlign = "center";
      ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
      ctx.textAlign = "left";
    }

    if (gameState.isGameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = COLORS.text;
      ctx.font = "32px monospace";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);
      ctx.font = "16px monospace";
      ctx.fillText(`Final Score: ${gameState.score}`, canvas.width / 2, canvas.height / 2 + 20);
      ctx.textAlign = "left";
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, splitBubble, spawnBubbles]);

  // Restart game loop when state changes
  useEffect(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    gameLoop();
  }, [gameLoop]);

  const handleRestart = () => {
    setGameState({
      score: 0,
      lives: 3,
      level: 1,
      combo: 0,
      isPaused: false,
      isGameOver: false,
    });
    bubblesRef.current = [];
    projectilesRef.current = [];
    powerUpsRef.current = [];
    lastTimeRef.current = performance.now();
    spawnBubbles(1);
  };

  return (
    <div className={styles.gameContainer}>
      <div className={styles.gameHeader}>
        <h2 className={styles.gameTitle}>🎮 Yumi Pop</h2>
        <div className={styles.gameControls}>
          <button onClick={handleRestart} className={styles.controlButton}>
            Restart
          </button>
          <button
            onClick={() => setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }))}
            className={styles.controlButton}
          >
            {gameState.isPaused ? "Resume" : "Pause"}
          </button>
        </div>
      </div>
      <canvas ref={canvasRef} className={styles.gameCanvas} />
      <div className={styles.gameInstructions}>
        <p>← → Move | Spacebar Shoot | ESC Pause</p>
      </div>
    </div>
  );
}

