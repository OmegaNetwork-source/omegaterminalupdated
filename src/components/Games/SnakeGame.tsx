"use client";

/**
 * Snake Game Component
 *
 * Canvas-based Snake game with keyboard controls
 *
 * Features:
 * - Classic snake gameplay with growth mechanism
 * - Collision detection (walls, self)
 * - Keyboard controls (Arrow keys or WASD)
 * - Pause/resume functionality
 * - Score tracking and game over handling
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./SnakeGame.module.css";

/**
 * SnakeGame Props
 */
export interface SnakeGameProps {
  /** Score update callback */
  onScoreUpdate: (score: number) => void;
  /** Game end callback */
  onGameEnd: (finalScore: number) => void;
}

/**
 * Position on grid
 */
interface Position {
  x: number;
  y: number;
}

/**
 * Direction enum
 */
enum Direction {
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}

const GRID_SIZE = 20; // Size of each grid cell
const GRID_COUNT = 20; // Number of cells in each direction
const GAME_SPEED = 150; // Game tick speed in ms

/**
 * Snake Game Component
 * Full implementation with game loop, collision detection, and scoring
 */
export function SnakeGame({ onScoreUpdate, onGameEnd }: SnakeGameProps) {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number | null>(null);
  const gameLoopIdRef = useRef<NodeJS.Timeout | null>(null);

  // Game state refs (use refs to avoid re-renders during game loop)
  const snakeRef = useRef<Position[]>([{ x: 10, y: 10 }]);
  const directionRef = useRef<Direction>(Direction.RIGHT);
  const nextDirectionRef = useRef<Direction>(Direction.RIGHT);
  const foodRef = useRef<Position>({ x: 15, y: 15 });

  /**
   * Generate random food position
   */
  const generateFood = useCallback((): Position => {
    const snake = snakeRef.current;
    let newFood: Position;

    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_COUNT),
        y: Math.floor(Math.random() * GRID_COUNT),
      };
    } while (
      snake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      )
    );

    return newFood;
  }, []);

  /**
   * Draw the game
   */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#1a202c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#2d3748";
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_COUNT; i++) {
      ctx.beginPath();
      ctx.moveTo(i * GRID_SIZE, 0);
      ctx.lineTo(i * GRID_SIZE, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * GRID_SIZE);
      ctx.lineTo(canvas.width, i * GRID_SIZE);
      ctx.stroke();
    }

    // Draw food
    const food = foodRef.current;
    ctx.fillStyle = "#f56565";
    ctx.fillRect(
      food.x * GRID_SIZE + 1,
      food.y * GRID_SIZE + 1,
      GRID_SIZE - 2,
      GRID_SIZE - 2
    );

    // Draw snake
    const snake = snakeRef.current;
    snake.forEach((segment, index) => {
      if (index === 0) {
        // Head
        ctx.fillStyle = "#48bb78";
      } else {
        // Body
        ctx.fillStyle = "#68d391";
      }
      ctx.fillRect(
        segment.x * GRID_SIZE + 1,
        segment.y * GRID_SIZE + 1,
        GRID_SIZE - 2,
        GRID_SIZE - 2
      );
    });
  }, []);

  /**
   * Game loop - update game state
   */
  const gameLoop = useCallback(() => {
    if (gameOver || isPaused || !isStarted) return;

    const snake = snakeRef.current;
    const direction = nextDirectionRef.current;
    directionRef.current = direction;

    // Calculate new head position
    const head = snake[0];
    let newHead: Position;

    switch (direction) {
      case Direction.UP:
        newHead = { x: head.x, y: head.y - 1 };
        break;
      case Direction.DOWN:
        newHead = { x: head.x, y: head.y + 1 };
        break;
      case Direction.LEFT:
        newHead = { x: head.x - 1, y: head.y };
        break;
      case Direction.RIGHT:
        newHead = { x: head.x + 1, y: head.y };
        break;
    }

    // Check wall collision
    if (
      newHead.x < 0 ||
      newHead.x >= GRID_COUNT ||
      newHead.y < 0 ||
      newHead.y >= GRID_COUNT
    ) {
      setGameOver(true);
      setIsStarted(false);
      onGameEnd(score);
      return;
    }

    // Check self collision
    if (
      snake.some(
        (segment) => segment.x === newHead.x && segment.y === newHead.y
      )
    ) {
      setGameOver(true);
      setIsStarted(false);
      onGameEnd(score);
      return;
    }

    // Add new head
    const newSnake = [newHead, ...snake];

    // Check food collision
    const food = foodRef.current;
    if (newHead.x === food.x && newHead.y === food.y) {
      // Ate food - grow snake and generate new food
      const newScore = score + 10;
      setScore(newScore);
      onScoreUpdate(newScore);
      foodRef.current = generateFood();
    } else {
      // No food - remove tail
      newSnake.pop();
    }

    snakeRef.current = newSnake;
    draw();
  }, [
    gameOver,
    isPaused,
    isStarted,
    score,
    onScoreUpdate,
    onGameEnd,
    generateFood,
    draw,
  ]);

  /**
   * Handle keyboard input
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const currentDirection = directionRef.current;

      // Handle pause
      if (event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        if (isStarted && !gameOver) {
          setIsPaused((prev) => !prev);
        }
        return;
      }

      // Prevent opposite direction changes
      switch (event.key) {
        case "ArrowUp":
        case "w":
        case "W":
          if (currentDirection !== Direction.DOWN) {
            nextDirectionRef.current = Direction.UP;
          }
          event.preventDefault();
          break;
        case "ArrowDown":
        case "s":
        case "S":
          if (currentDirection !== Direction.UP) {
            nextDirectionRef.current = Direction.DOWN;
          }
          event.preventDefault();
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          if (currentDirection !== Direction.RIGHT) {
            nextDirectionRef.current = Direction.LEFT;
          }
          event.preventDefault();
          break;
        case "ArrowRight":
        case "d":
        case "D":
          if (currentDirection !== Direction.LEFT) {
            nextDirectionRef.current = Direction.RIGHT;
          }
          event.preventDefault();
          break;
      }
    },
    [isStarted, gameOver]
  );

  /**
   * Start game
   */
  const handleStart = useCallback(() => {
    // Reset game state
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = Direction.RIGHT;
    nextDirectionRef.current = Direction.RIGHT;
    foodRef.current = generateFood();
    setScore(0);
    onScoreUpdate(0);
    setGameOver(false);
    setIsPaused(false);
    setIsStarted(true);
  }, [generateFood, onScoreUpdate]);

  /**
   * Reset game
   */
  const handleReset = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = Direction.RIGHT;
    nextDirectionRef.current = Direction.RIGHT;
    foodRef.current = { x: 15, y: 15 };
    setScore(0);
    onScoreUpdate(0);
    setGameOver(false);
    setIsPaused(false);
    setIsStarted(false);
    draw();
  }, [onScoreUpdate, draw]);

  /**
   * Toggle pause
   */
  const handlePause = useCallback(() => {
    if (!gameOver && isStarted) {
      setIsPaused((prev) => !prev);
    }
  }, [gameOver, isStarted]);

  /**
   * Set up game loop
   */
  useEffect(() => {
    if (isStarted && !gameOver && !isPaused) {
      gameLoopIdRef.current = setInterval(gameLoop, GAME_SPEED);
    } else if (gameLoopIdRef.current) {
      clearInterval(gameLoopIdRef.current);
      gameLoopIdRef.current = null;
    }

    return () => {
      if (gameLoopIdRef.current) {
        clearInterval(gameLoopIdRef.current);
        gameLoopIdRef.current = null;
      }
    };
  }, [isStarted, gameOver, isPaused, gameLoop]);

  /**
   * Set up keyboard listeners
   */
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  /**
   * Initial draw
   */
  useEffect(() => {
    draw();
  }, [draw]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (gameLoopIdRef.current) {
        clearInterval(gameLoopIdRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        width={GRID_SIZE * GRID_COUNT}
        height={GRID_SIZE * GRID_COUNT}
      />

      <div className={styles.controls}>
        <button
          className={styles.button}
          onClick={handleStart}
          disabled={isStarted && !gameOver}
        >
          Start
        </button>
        <button
          className={styles.button}
          onClick={handlePause}
          disabled={gameOver || !isStarted}
        >
          {isPaused ? "Resume" : "Pause"}
        </button>
        <button className={styles.button} onClick={handleReset}>
          Reset
        </button>
      </div>

      <div className={styles.scoreDisplay}>
        Score: {score} {gameOver && "(Game Over)"}
        {isPaused && !gameOver && "(Paused)"}
      </div>

      <div className={styles.instructions}>
        Controls: Arrow Keys or WASD • Space to Pause
      </div>
    </div>
  );
}
