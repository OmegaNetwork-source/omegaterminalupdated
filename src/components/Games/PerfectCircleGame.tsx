"use client";

/**
 * Perfect Circle Game Component
 * 
 * Draw the most perfect circle
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./PerfectCircleGame.module.css";

export interface PerfectCircleGameProps {
  onScoreUpdate: (score: number) => void;
  onGameEnd: (finalScore: number) => void;
}

interface Point {
  x: number;
  y: number;
}

const CANVAS_SIZE = 400;
const CENTER_X = CANVAS_SIZE / 2;
const CENTER_Y = CANVAS_SIZE / 2;
const TARGET_RADIUS = 100;

export function PerfectCircleGame({
  onScoreUpdate,
  onGameEnd,
}: PerfectCircleGameProps) {
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingPathRef = useRef<Point[]>([]);

  useEffect(() => {
    // Load best score
    const scores = JSON.parse(
      localStorage.getItem("omega_game_scores") || "{}"
    );
    const circleScores = scores["perfect-circle"] || [];
    if (circleScores.length > 0) {
      const best = Math.max(...circleScores.map((s: any) => s.score));
      setBestScore(best);
    }
    drawTarget();
  }, []);

  const drawTarget = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.fillStyle = "#1a202c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw target circle
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, TARGET_RADIUS, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }, []);

  const calculateScore = useCallback((path: Point[]): { score: number; accuracy: number } => {
    if (path.length < 10) return { score: 0, accuracy: 0 };

    let totalDeviation = 0;
    let validPoints = 0;

    path.forEach((point) => {
      const distance = Math.sqrt(
        Math.pow(point.x - CENTER_X, 2) + Math.pow(point.y - CENTER_Y, 2)
      );
      const deviation = Math.abs(distance - TARGET_RADIUS);
      totalDeviation += deviation;
      validPoints++;
    });

    const avgDeviation = totalDeviation / validPoints;
    const accuracy = Math.max(0, 100 - (avgDeviation / TARGET_RADIUS) * 100);
    const score = Math.round(accuracy * 100);

    return { score, accuracy };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    drawingPathRef.current = [{ x, y }];
    drawTarget();
  }, [drawTarget]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      drawingPathRef.current.push({ x, y });

      // Draw user path
      ctx.strokeStyle = "var(--palette-primary, #00bcf2)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (drawingPathRef.current.length > 1) {
        ctx.beginPath();
        ctx.moveTo(
          drawingPathRef.current[drawingPathRef.current.length - 2].x,
          drawingPathRef.current[drawingPathRef.current.length - 2].y
        );
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    },
    [isDrawing]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const result = calculateScore(drawingPathRef.current);
    setScore(result.score);
    setAccuracy(result.accuracy);
    onScoreUpdate(result.score);

    // Save score
    const scores = JSON.parse(
      localStorage.getItem("omega_game_scores") || "{}"
    );
    if (!scores["perfect-circle"]) {
      scores["perfect-circle"] = [];
    }
    scores["perfect-circle"].push({
      score: result.score,
      player: "Arcade Pilot",
      timestamp: new Date().toISOString(),
    });
    scores["perfect-circle"].sort((a: any, b: any) => b.score - a.score);
    scores["perfect-circle"] = scores["perfect-circle"].slice(0, 10);
    localStorage.setItem("omega_game_scores", JSON.stringify(scores));

    if (!bestScore || result.score > bestScore) {
      setBestScore(result.score);
    }

    onGameEnd(result.score);
  }, [isDrawing, calculateScore, bestScore, onScoreUpdate, onGameEnd]);

  const startNewCircle = useCallback(() => {
    setScore(0);
    setAccuracy(0);
    drawingPathRef.current = [];
    drawTarget();
  }, [drawTarget]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>🎯 Score: {score}</div>
        <div>🏆 Best: {bestScore || 0}</div>
        <div>📊 Accuracy: {accuracy.toFixed(1)}%</div>
      </div>

      <div className={styles.canvasSection}>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className={styles.canvas}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      <div className={styles.controls}>
        <button onClick={startNewCircle} className={styles.button}>
          🎨 New Circle
        </button>
      </div>

      <div className={styles.instructions}>
        Click and drag to draw a perfect circle. Try to match the dashed outline!
      </div>
    </div>
  );
}












