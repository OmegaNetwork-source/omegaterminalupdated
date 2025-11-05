"use client";

/**
 * Brick Breaker Game Component
 * 
 * Break bricks with paddle and ball
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./BrickBreakerGame.module.css";

export interface BrickBreakerGameProps {
  onScoreUpdate: (score: number) => void;
  onGameEnd: (finalScore: number) => void;
}

interface Position {
  x: number;
  y: number;
}

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 10;
const BALL_SIZE = 10;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH = 45;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 5;

export function BrickBreakerGame({
  onScoreUpdate,
  onGameEnd,
}: BrickBreakerGameProps) {
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const paddleRef = useRef<Position>({ x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 30 });
  const ballRef = useRef<Position & { dx: number; dy: number }>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 50,
    dx: 3,
    dy: -3,
  });
  const bricksRef = useRef<Brick[]>([]);

  const initializeBricks = useCallback(() => {
    const bricks: Brick[] = [];
    const colors = [
      "#ff6b6b",
      "#4ecdc4",
      "#45b7d1",
      "#f9ca24",
      "#6c5ce7",
    ];

    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        bricks.push({
          x: col * (BRICK_WIDTH + BRICK_PADDING) + BRICK_PADDING,
          y: row * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_PADDING + 50,
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          color: colors[row % colors.length],
        });
      }
    }
    bricksRef.current = bricks;
  }, []);

  useEffect(() => {
    initializeBricks();
  }, [initializeBricks]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw bricks
    bricksRef.current.forEach((brick) => {
      ctx.fillStyle = brick.color;
      ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
      ctx.strokeStyle = "#fff";
      ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
    });

    // Draw paddle
    ctx.fillStyle = "var(--palette-primary, #00bcf2)";
    ctx.fillRect(
      paddleRef.current.x,
      paddleRef.current.y,
      PADDLE_WIDTH,
      PADDLE_HEIGHT
    );

    // Draw ball
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(
      ballRef.current.x,
      ballRef.current.y,
      BALL_SIZE / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }, []);

  const gameLoop = useCallback(() => {
    if (!isPlaying || gameOver) return;

    const ball = ballRef.current;
    const paddle = paddleRef.current;

    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision
    if (ball.x <= BALL_SIZE / 2 || ball.x >= CANVAS_WIDTH - BALL_SIZE / 2) {
      ball.dx = -ball.dx;
    }
    if (ball.y <= BALL_SIZE / 2) {
      ball.dy = -ball.dy;
    }

    // Paddle collision
    if (
      ball.y + BALL_SIZE / 2 >= paddle.y &&
      ball.y - BALL_SIZE / 2 <= paddle.y + PADDLE_HEIGHT &&
      ball.x >= paddle.x &&
      ball.x <= paddle.x + PADDLE_WIDTH
    ) {
      ball.dy = -Math.abs(ball.dy);
      const hitPos = (ball.x - paddle.x) / PADDLE_WIDTH;
      ball.dx = (hitPos - 0.5) * 6;
    }

    // Brick collision
    bricksRef.current.forEach((brick, index) => {
      if (
        ball.x + BALL_SIZE / 2 >= brick.x &&
        ball.x - BALL_SIZE / 2 <= brick.x + brick.width &&
        ball.y + BALL_SIZE / 2 >= brick.y &&
        ball.y - BALL_SIZE / 2 <= brick.y + brick.height
      ) {
        bricksRef.current.splice(index, 1);
        ball.dy = -ball.dy;
        const newScore = score + 10;
        setScore(newScore);
        onScoreUpdate(newScore);

        if (bricksRef.current.length === 0) {
          initializeBricks();
        }
      }
    });

    // Game over
    if (ball.y > CANVAS_HEIGHT) {
      setGameOver(true);
      setIsPlaying(false);
      onGameEnd(score);
    }

    draw();
  }, [isPlaying, gameOver, score, onScoreUpdate, onGameEnd, draw, initializeBricks]);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(gameLoop, 16);
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

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    paddleRef.current.x = Math.max(
      0,
      Math.min(x - PADDLE_WIDTH / 2, CANVAS_WIDTH - PADDLE_WIDTH)
    );
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    ballRef.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 50,
      dx: 3,
      dy: -3,
    };
    initializeBricks();
  };

  const resetGame = () => {
    setIsPlaying(false);
    setGameOver(false);
    setScore(0);
    paddleRef.current = { x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 30 };
    ballRef.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 50,
      dx: 3,
      dy: -3,
    };
    initializeBricks();
    draw();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>🎯 Score: {score}</div>
        <div>🧱 Bricks: {bricksRef.current.length}</div>
      </div>

      <div className={styles.canvasSection}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className={styles.canvas}
          onMouseMove={handleMouseMove}
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
        {!isPlaying && !gameOver && "Move mouse to control paddle"}
        {isPlaying && "Move mouse to control paddle"}
        {gameOver && "Game Over! Press Reset to play again"}
      </div>
    </div>
  );
}

