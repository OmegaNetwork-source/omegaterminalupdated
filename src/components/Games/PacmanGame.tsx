"use client";

/**
 * Pac-Man Game Component
 * 
 * Classic Pac-Man game with canvas rendering
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./PacmanGame.module.css";

export interface PacmanGameProps {
  onScoreUpdate: (score: number) => void;
  onGameEnd: (finalScore: number) => void;
}

interface Position {
  x: number;
  y: number;
}

enum Direction {
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}

const GRID_SIZE = 20;
const GRID_COUNT = 25;
const GAME_SPEED = 200;

export function PacmanGame({ onScoreUpdate, onGameEnd }: PacmanGameProps) {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const pacmanRef = useRef<Position>({ x: 12, y: 18 });
  const directionRef = useRef<Direction | null>(null);
  const dotsRef = useRef<Position[]>([]);
  const ghostsRef = useRef<Array<Position & { color: string }>>([
    { x: 12, y: 9, color: "#ff0000" },
    { x: 11, y: 9, color: "#00ffff" },
    { x: 13, y: 9, color: "#ffb8ff" },
    { x: 12, y: 10, color: "#ffb852" },
  ]);
  const wallsRef = useRef<Set<string>>(new Set());

  // Initialize maze and dots
  useEffect(() => {
    initializeMaze();
    initializeDots();
  }, []);

  const initializeMaze = useCallback(() => {
    const walls = new Set<string>();
    
    // Border walls
    for (let x = 0; x < GRID_COUNT; x++) {
      walls.add(`${x},0`);
      walls.add(`${x},${GRID_COUNT - 1}`);
    }
    for (let y = 0; y < GRID_COUNT; y++) {
      walls.add(`0,${y}`);
      walls.add(`${GRID_COUNT - 1},${y}`);
    }
    
    // Internal walls
    for (let i = 5; i < 20; i++) {
      walls.add(`${i},5`);
      walls.add(`${i},10`);
      walls.add(`${i},15`);
      walls.add(`${i},20`);
    }
    
    wallsRef.current = walls;
  }, []);

  const initializeDots = useCallback(() => {
    const dots: Position[] = [];
    for (let x = 1; x < GRID_COUNT - 1; x++) {
      for (let y = 1; y < GRID_COUNT - 1; y++) {
        if (!wallsRef.current.has(`${x},${y}`)) {
          dots.push({ x, y });
        }
      }
    }
    dotsRef.current = dots;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw walls
    ctx.fillStyle = "#1a4d8c";
    wallsRef.current.forEach((wall) => {
      const [x, y] = wall.split(",").map(Number);
      ctx.fillRect(
        x * GRID_SIZE,
        y * GRID_SIZE,
        GRID_SIZE,
        GRID_SIZE
      );
    });

    // Draw dots
    ctx.fillStyle = "#ffd700";
    dotsRef.current.forEach((dot) => {
      ctx.beginPath();
      ctx.arc(
        dot.x * GRID_SIZE + GRID_SIZE / 2,
        dot.y * GRID_SIZE + GRID_SIZE / 2,
        3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });

    // Draw Pac-Man
    ctx.fillStyle = "#ffd700";
    ctx.beginPath();
    ctx.arc(
      pacmanRef.current.x * GRID_SIZE + GRID_SIZE / 2,
      pacmanRef.current.y * GRID_SIZE + GRID_SIZE / 2,
      GRID_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw ghosts
    ghostsRef.current.forEach((ghost) => {
      ctx.fillStyle = ghost.color;
      ctx.beginPath();
      ctx.arc(
        ghost.x * GRID_SIZE + GRID_SIZE / 2,
        ghost.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
  }, []);

  const gameLoop = useCallback(() => {
    if (!isPlaying || gameOver) return;

    const pacman = pacmanRef.current;
    const direction = directionRef.current;

    // Move Pac-Man
    if (direction) {
      let newX = pacman.x;
      let newY = pacman.y;

      switch (direction) {
        case Direction.UP:
          newY--;
          break;
        case Direction.DOWN:
          newY++;
          break;
        case Direction.LEFT:
          newX--;
          break;
        case Direction.RIGHT:
          newX++;
          break;
      }

      if (
        newX >= 0 &&
        newX < GRID_COUNT &&
        newY >= 0 &&
        newY < GRID_COUNT &&
        !wallsRef.current.has(`${newX},${newY}`)
      ) {
        pacman.x = newX;
        pacman.y = newY;
      }
    }

    // Check dot collection
    const dotIndex = dotsRef.current.findIndex(
      (dot) => dot.x === pacman.x && dot.y === pacman.y
    );
    if (dotIndex !== -1) {
      dotsRef.current.splice(dotIndex, 1);
      const newScore = score + 10;
      setScore(newScore);
      onScoreUpdate(newScore);

      if (dotsRef.current.length === 0) {
        initializeDots();
      }
    }

    // Simple ghost movement
    ghostsRef.current.forEach((ghost) => {
      const moves = [
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
      ];
      const move = moves[Math.floor(Math.random() * moves.length)];
      const newX = ghost.x + move.dx;
      const newY = ghost.y + move.dy;

      if (
        newX >= 0 &&
        newX < GRID_COUNT &&
        newY >= 0 &&
        newY < GRID_COUNT &&
        !wallsRef.current.has(`${newX},${newY}`)
      ) {
        ghost.x = newX;
        ghost.y = newY;
      }
    });

    // Check ghost collision
    const hit = ghostsRef.current.some(
      (ghost) => ghost.x === pacman.x && ghost.y === pacman.y
    );
    if (hit) {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setGameOver(true);
        setIsPlaying(false);
        onGameEnd(score);
      } else {
        // Reset positions
        pacmanRef.current = { x: 12, y: 18 };
        ghostsRef.current = [
          { x: 12, y: 9, color: "#ff0000" },
          { x: 11, y: 9, color: "#00ffff" },
          { x: 13, y: 9, color: "#ffb8ff" },
          { x: 12, y: 10, color: "#ffb852" },
        ];
      }
    }

    draw();
  }, [isPlaying, gameOver, score, lives, onScoreUpdate, onGameEnd, draw, initializeDots]);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(gameLoop, GAME_SPEED);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [isPlaying, gameOver, gameLoop]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isPlaying) return;

    switch (e.key) {
      case "ArrowUp":
      case "w":
      case "W":
        directionRef.current = Direction.UP;
        break;
      case "ArrowDown":
      case "s":
      case "S":
        directionRef.current = Direction.DOWN;
        break;
      case "ArrowLeft":
      case "a":
      case "A":
        directionRef.current = Direction.LEFT;
        break;
      case "ArrowRight":
      case "d":
      case "D":
        directionRef.current = Direction.RIGHT;
        break;
    }
  }, [isPlaying]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    draw();
  }, [draw]);

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setLives(3);
    pacmanRef.current = { x: 12, y: 18 };
    initializeDots();
  };

  const resetGame = () => {
    setIsPlaying(false);
    setGameOver(false);
    setScore(0);
    setLives(3);
    pacmanRef.current = { x: 12, y: 18 };
    ghostsRef.current = [
      { x: 12, y: 9, color: "#ff0000" },
      { x: 11, y: 9, color: "#00ffff" },
      { x: 13, y: 9, color: "#ffb8ff" },
      { x: 12, y: 10, color: "#ffb852" },
    ];
    initializeDots();
    draw();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>🍒 Score: {score}</div>
        <div>👻 Lives: {lives}</div>
      </div>

      <div className={styles.canvasSection}>
        <canvas
          ref={canvasRef}
          width={GRID_COUNT * GRID_SIZE}
          height={GRID_COUNT * GRID_SIZE}
          className={styles.canvas}
        />
      </div>

      <div className={styles.controls}>
        {!isPlaying && !gameOver && (
          <button onClick={startGame} className={styles.button}>
            🚀 Start Game
          </button>
        )}
        {isPlaying && (
          <button
            onClick={() => setIsPlaying(false)}
            className={styles.button}
          >
            ⏸️ Pause
          </button>
        )}
        <button onClick={resetGame} className={styles.button}>
          🔄 Reset
        </button>
      </div>

      <div className={styles.instructions}>
        {!isPlaying && !gameOver && "Press Start to begin"}
        {isPlaying && "Use Arrow keys to move"}
        {gameOver && "Game Over! Press Reset to play again"}
      </div>
    </div>
  );
}











