"use client";

/**
 * DigitalFace Component
 * 
 * An interactive animated digital face for the AI companion.
 * Features a detailed, outlined face with clear features that responds to AI state.
 * Uses the current theme palette for uniform color flashing.
 * 
 * Interactive Features:
 * - Hover over face: Changes expression
 * - Click on face: Shows angry expression
 * - Click around face: Speeds up all animations
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import styles from "./DigitalFace.module.css";

export type FaceExpression = "idle" | "thinking" | "speaking" | "happy" | "surprised" | "sleeping" | "angry" | "curious" | "omega" | "matrix";

export interface DigitalFaceProps {
  expression?: FaceExpression;
  isThinking?: boolean;
  isSpeaking?: boolean;
  /** Speech intensity affects how animated the mouth is (0-1, default 0.5) */
  speechIntensity?: number;
  /** Current message being spoken (used to vary animation) */
  currentMessage?: string;
  glitchColors?: string[];
  className?: string;
  onExpressionChange?: (expression: FaceExpression) => void;
}

// Get CSS variable value from document
const getCSSVar = (name: string, fallback: string): string => {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};

export function DigitalFace({
  expression = "matrix",
  isThinking = false,
  isSpeaking = false,
  speechIntensity = 0.5,
  currentMessage = "",
  glitchColors,
  className,
  onExpressionChange,
}: DigitalFaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);
  const lastBlinkRef = useRef(0);
  const isBlinkingRef = useRef(false);
  const blinkPhaseRef = useRef(0);
  const speakPhaseRef = useRef(0);
  const colorPhaseRef = useRef(0);
  const glitchOffsetRef = useRef({ x: 0, y: 0 });
  
  // Interactive state
  const [isHovering, setIsHovering] = useState(false);
  const [isHoveringFace, setIsHoveringFace] = useState(false);
  const [interactiveExpression, setInteractiveExpression] = useState<FaceExpression | null>(null);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const speedDecayRef = useRef<NodeJS.Timeout | null>(null);
  const angryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const omegaTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hoverExpressionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const matrixTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickTimeRef = useRef(0);
  const clickCountRef = useRef(0);
  
  // Random hover expression state
  const [randomHoverExpression, setRandomHoverExpression] = useState<FaceExpression>("curious");
  
  // All available expressions for random hover (excluding sleeping)
  const hoverExpressions: FaceExpression[] = ["idle", "curious", "happy", "surprised", "omega", "thinking", "matrix"];
  
  // Matrix rain columns state
  interface MatrixColumn {
    x: number;
    chars: { char: string; y: number; speed: number; brightness: number; }[];
    headY: number;
    speed: number;
    length: number;
  }
  const matrixColumnsRef = useRef<MatrixColumn[]>([]);
  const matrixInitializedRef = useRef(false);
  
  // Matrix characters - Japanese katakana, numbers, and symbols
  const MATRIX_CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*(){}[]|;:<>,.?/~`Ω";
  
  // Theme colors - read from CSS variables or use defaults
  const [themeColors, setThemeColors] = useState({
    primary: "#00d4ff",
    secondary: "#00ff88",
    accent: "#ff00ff",
    text: "#e0e0e0",
    surface: "#151520",
  });

  // Update theme colors from CSS variables
  useEffect(() => {
    const updateColors = () => {
      setThemeColors({
        primary: getCSSVar("--palette-primary", "#00d4ff"),
        secondary: getCSSVar("--palette-secondary", "#00ff88"),
        accent: getCSSVar("--palette-accent", "#ff00ff"),
        text: getCSSVar("--palette-text", "#e0e0e0"),
        surface: getCSSVar("--palette-surface", "#151520"),
      });
    };
    
    updateColors();
    
    // Listen for theme changes
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "class"] });
    
    return () => observer.disconnect();
  }, []);

  // Use theme colors or provided glitch colors
  // Create a bright version of primary for highlights
  const brightPrimary = useMemo(() => {
    const hex = themeColors.primary;
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = Math.min(255, parseInt(result[1], 16) + 80);
      const g = Math.min(255, parseInt(result[2], 16) + 80);
      const b = Math.min(255, parseInt(result[3], 16) + 80);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    return "#aaffff";
  }, [themeColors.primary]);

  const activeColors = useMemo(() => {
    if (glitchColors && glitchColors.length > 0) {
      return glitchColors;
    }
    // Use theme colors for uniform palette - bright version instead of white
    return [themeColors.primary, themeColors.secondary, themeColors.accent, brightPrimary];
  }, [glitchColors, themeColors, brightPrimary]);

  // Determine current expression based on state and interactions
  const currentExpression = useMemo(() => {
    // Interactive expressions take priority
    if (interactiveExpression) return interactiveExpression;
    // Then AI state
    if (isThinking) return "thinking";
    if (isSpeaking) return "speaking";
    // Then hover expressions - random expression that constantly changes
    if (isHoveringFace) {
      return randomHoverExpression;
    }
    return expression;
  }, [expression, isThinking, isSpeaking, interactiveExpression, isHoveringFace, randomHoverExpression]);

  // Get color based on phase for uniform flashing
  const getPhaseColor = useCallback((phase: number, intensity: number = 1) => {
    const colorIndex = Math.floor(phase) % activeColors.length;
    const nextIndex = (colorIndex + 1) % activeColors.length;
    const t = phase % 1;
    
    // Parse colors
    const parseColor = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      } : { r: 0, g: 212, b: 255 };
    };
    
    const c1 = parseColor(activeColors[colorIndex] || "#00d4ff");
    const c2 = parseColor(activeColors[nextIndex] || "#00ff88");
    
    const r = Math.round(c1.r + (c2.r - c1.r) * t);
    const g = Math.round(c1.g + (c2.g - c1.g) * t);
    const b = Math.round(c1.b + (c2.b - c1.b) * t);
    
    return `rgba(${r}, ${g}, ${b}, ${intensity})`;
  }, [activeColors]);

  // Get mouth color with hue shifting effect based on color palette
  const getMouthColor = useCallback((phase: number, intensity: number = 1, hueShift: number = 0) => {
    // Convert RGB to HSL for hue manipulation
    const rgbToHsl = (r: number, g: number, b: number) => {
      r /= 255;
      g /= 255;
      b /= 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }
      return { h: h * 360, s, l };
    };

    // Convert HSL to RGB
    const hslToRgb = (h: number, s: number, l: number) => {
      h = h % 360;
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs((h / 60) % 2 - 1));
      const m = l - c / 2;
      let r = 0, g = 0, b = 0;

      if (h < 60) { r = c; g = x; b = 0; }
      else if (h < 120) { r = x; g = c; b = 0; }
      else if (h < 180) { r = 0; g = c; b = x; }
      else if (h < 240) { r = 0; g = x; b = c; }
      else if (h < 300) { r = x; g = 0; b = c; }
      else { r = c; g = 0; b = x; }

      return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255),
      };
    };

    // Cycle through palette colors with smooth transitions
    const colorIndex = Math.floor(phase) % activeColors.length;
    const nextIndex = (colorIndex + 1) % activeColors.length;
    const t = phase % 1;
    
    // Parse colors with fallbacks
    const parseColor = (hex: string | undefined) => {
      if (!hex) return { r: 0, g: 212, b: 255 };
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      } : { r: 0, g: 212, b: 255 };
    };
    
    const color1 = activeColors[colorIndex] || themeColors.primary;
    const color2 = activeColors[nextIndex] || themeColors.secondary;
    const c1 = parseColor(color1);
    const c2 = parseColor(color2);
    
    // Convert to HSL
    const hsl1 = rgbToHsl(c1.r, c1.g, c1.b);
    const hsl2 = rgbToHsl(c2.r, c2.g, c2.b);
    
    // Interpolate HSL with hue shift - ensure smooth transitions
    let h = hsl1.h + (hsl2.h - hsl1.h) * t;
    
    // Handle hue wrap-around for smooth transitions
    if (Math.abs(hsl2.h - hsl1.h) > 180) {
      if (hsl2.h > hsl1.h) {
        h = (hsl1.h - 360) + (hsl2.h - (hsl1.h - 360)) * t;
      } else {
        h = (hsl1.h + 360) + (hsl2.h - (hsl1.h + 360)) * t;
      }
    }
    
    // Apply hue shift for color changing effect
    h = (h + hueShift) % 360;
    if (h < 0) h += 360;
    
    const s = Math.min(1, Math.max(0, hsl1.s + (hsl2.s - hsl1.s) * t));
    const l = Math.min(1, Math.max(0, hsl1.l + (hsl2.l - hsl1.l) * t));
    
    // Convert back to RGB
    const rgb = hslToRgb(h, s, l);
    
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity})`;
  }, [activeColors, themeColors]);

  // Check if point is inside face area
  const isPointInFace = useCallback((x: number, y: number, canvasRect: DOMRect) => {
    const centerX = canvasRect.width / 2;
    const centerY = canvasRect.height / 2;
    const faceSize = Math.min(canvasRect.width, canvasRect.height) * 0.85;
    const faceWidth = faceSize * 0.8 * 0.42;
    const faceHeight = faceSize * 0.9 * 0.42;
    
    // Ellipse equation: (x-h)²/a² + (y-k)²/b² <= 1
    const normalizedX = (x - centerX) / faceWidth;
    const normalizedY = (y - centerY) / faceHeight;
    
    return (normalizedX * normalizedX + normalizedY * normalizedY) <= 1;
  }, []);

  // Get a random expression (excluding current one for variety)
  const getRandomExpression = useCallback((currentExpr?: FaceExpression): FaceExpression => {
    const available = hoverExpressions.filter(e => e !== currentExpr);
    return available[Math.floor(Math.random() * available.length)] || "curious";
  }, [hoverExpressions]);

  // Get random matrix character
  const getRandomMatrixChar = useCallback(() => {
    return MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
  }, []);

  // Initialize matrix rain columns
  const initializeMatrixRain = useCallback((width: number, height: number) => {
    const columnWidth = 14;
    const columnCount = Math.ceil(width / columnWidth);
    
    matrixColumnsRef.current = [];
    
    for (let i = 0; i < columnCount; i++) {
      const columnLength = 15 + Math.floor(Math.random() * 20);
      const chars: { char: string; y: number; speed: number; brightness: number; }[] = [];
      
      // Create characters for this column
      for (let j = 0; j < columnLength; j++) {
        chars.push({
          char: getRandomMatrixChar(),
          y: -j * 18 - Math.random() * height, // Start above screen, staggered
          speed: 2 + Math.random() * 4,
          brightness: 1 - (j / columnLength) * 0.8, // Head is brightest
        });
      }
      
      matrixColumnsRef.current.push({
        x: i * columnWidth + columnWidth / 2,
        chars,
        headY: -Math.random() * height,
        speed: 3 + Math.random() * 5,
        length: columnLength,
      });
    }
    
    matrixInitializedRef.current = true;
  }, [getRandomMatrixChar]);

  // Update matrix rain positions
  const updateMatrixRain = useCallback((height: number) => {
    matrixColumnsRef.current.forEach(column => {
      // Move the head down
      column.headY += column.speed * speedMultiplier;
      
      // Reset column when it goes off screen
      if (column.headY > height + column.length * 18) {
        column.headY = -column.length * 18 - Math.random() * 100;
        column.speed = 3 + Math.random() * 5;
        // Randomize characters
        column.chars.forEach(c => {
          c.char = getRandomMatrixChar();
        });
      }
      
      // Update individual character positions
      column.chars.forEach((charObj, idx) => {
        charObj.y = column.headY - idx * 18;
        // Randomly change characters occasionally
        if (Math.random() < 0.02) {
          charObj.char = getRandomMatrixChar();
        }
      });
    });
  }, [speedMultiplier, getRandomMatrixChar]);

  // Check if a point is inside the 3D face shape for matrix effect
  const isPointInFace3D = useCallback((x: number, y: number, centerX: number, centerY: number, faceWidth: number, faceHeight: number): { inside: boolean; depth: number } => {
    // Normalized coordinates
    const nx = (x - centerX) / (faceWidth * 0.5);
    const ny = (y - centerY) / (faceHeight * 0.5);
    
    // Face outline (ellipse with chin)
    const faceEllipse = nx * nx + ny * ny * 1.1;
    const chinAdjust = ny > 0.3 ? (ny - 0.3) * 0.3 : 0;
    const inFaceOutline = faceEllipse + chinAdjust < 1;
    
    if (!inFaceOutline) return { inside: false, depth: 0 };
    
    // Calculate depth based on position (3D sphere-like depth)
    const baseDepth = Math.sqrt(Math.max(0, 1 - faceEllipse));
    
    // Eye sockets (indentations)
    const leftEyeX = -0.35;
    const rightEyeX = 0.35;
    const eyeY = -0.15;
    const eyeRadius = 0.18;
    
    const leftEyeDist = Math.sqrt((nx - leftEyeX) ** 2 + (ny - eyeY) ** 2);
    const rightEyeDist = Math.sqrt((nx - rightEyeX) ** 2 + (ny - eyeY) ** 2);
    
    let depth = baseDepth;
    
    // Eye socket depth (pushed in)
    if (leftEyeDist < eyeRadius) {
      depth -= 0.3 * (1 - leftEyeDist / eyeRadius);
    }
    if (rightEyeDist < eyeRadius) {
      depth -= 0.3 * (1 - rightEyeDist / eyeRadius);
    }
    
    // Nose ridge (raised)
    const noseDist = Math.abs(nx) + Math.abs(ny - 0.1) * 0.5;
    if (noseDist < 0.15 && ny > -0.1 && ny < 0.25) {
      depth += 0.2 * (1 - noseDist / 0.15);
    }
    
    // Brow ridge (raised)
    if (ny > -0.35 && ny < -0.2 && Math.abs(nx) < 0.5) {
      depth += 0.15 * (1 - Math.abs(ny + 0.27) / 0.08);
    }
    
    // Cheekbones (raised)
    const cheekDist = Math.sqrt((Math.abs(nx) - 0.35) ** 2 + (ny - 0.05) ** 2);
    if (cheekDist < 0.2) {
      depth += 0.1 * (1 - cheekDist / 0.2);
    }
    
    // Mouth area (slightly recessed)
    if (ny > 0.25 && ny < 0.45 && Math.abs(nx) < 0.25) {
      depth -= 0.1 * (1 - Math.abs(ny - 0.35) / 0.1);
    }
    
    return { inside: true, depth: Math.max(0, Math.min(1, depth)) };
  }, []);

  // Handle mouse move for hover detection
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const inFace = isPointInFace(x, y, rect);
    setIsHoveringFace(inFace);
  }, [isPointInFace]);

  // Constantly change expression while hovering over face
  useEffect(() => {
    if (isHoveringFace && !interactiveExpression) {
      // Immediately set a random expression when starting to hover
      setRandomHoverExpression(getRandomExpression());
      
      // Set up interval to randomly change expression
      hoverExpressionIntervalRef.current = setInterval(() => {
        setRandomHoverExpression(prev => getRandomExpression(prev));
      }, 400 + Math.random() * 300); // Random interval between 400-700ms
      
      return () => {
        if (hoverExpressionIntervalRef.current) {
          clearInterval(hoverExpressionIntervalRef.current);
          hoverExpressionIntervalRef.current = null;
        }
      };
    } else {
      // Clear interval when not hovering
      if (hoverExpressionIntervalRef.current) {
        clearInterval(hoverExpressionIntervalRef.current);
        hoverExpressionIntervalRef.current = null;
      }
    }
  }, [isHoveringFace, interactiveExpression, getRandomExpression]);

  // Handle click on face - single click for angry, double click for omega, triple click for matrix
  const handleFaceClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const now = Date.now();
    
    // Track click count for triple-click detection
    if (now - lastClickTimeRef.current < 400) {
      clickCountRef.current += 1;
    } else {
      clickCountRef.current = 1;
    }
    lastClickTimeRef.current = now;
    
    const inFace = isPointInFace(x, y, rect);
    
    if (inFace) {
      // Clear previous timeouts
      if (angryTimeoutRef.current) {
        clearTimeout(angryTimeoutRef.current);
      }
      if (omegaTimeoutRef.current) {
        clearTimeout(omegaTimeoutRef.current);
      }
      if (matrixTimeoutRef.current) {
        clearTimeout(matrixTimeoutRef.current);
      }
      
      if (clickCountRef.current >= 3) {
        // Triple-click ON face - MATRIX MODE!
        clickCountRef.current = 0;
        setInteractiveExpression("matrix");
        onExpressionChange?.("matrix");
        
        // Reset matrix rain for fresh start
        matrixInitializedRef.current = false;
        
        // Return to normal after 6 seconds (longer for matrix)
        matrixTimeoutRef.current = setTimeout(() => {
          setInteractiveExpression(null);
        }, 6000);
        
        // Dramatic glitch effect
        glitchOffsetRef.current = {
          x: (Math.random() - 0.5) * 20,
          y: (Math.random() - 0.5) * 20,
        };
      } else if (clickCountRef.current === 2) {
        // Double-click ON face - show OMEGA expression!
        setInteractiveExpression("omega");
        onExpressionChange?.("omega");
        
        // Return to normal after 4 seconds (longer for omega)
        omegaTimeoutRef.current = setTimeout(() => {
          setInteractiveExpression(null);
        }, 4000);
        
        // Add special glitch for omega
        glitchOffsetRef.current = {
          x: (Math.random() - 0.5) * 8,
          y: (Math.random() - 0.5) * 8,
        };
      } else {
        // Single click ON face - show angry expression
        setInteractiveExpression("angry");
        onExpressionChange?.("angry");
        
        // Return to normal after 2 seconds
        angryTimeoutRef.current = setTimeout(() => {
          setInteractiveExpression(null);
        }, 2000);
        
        // Add intense glitch
        glitchOffsetRef.current = {
          x: (Math.random() - 0.5) * 15,
          y: (Math.random() - 0.5) * 15,
        };
      }
    } else {
      // Click AROUND face - speed up everything
      setSpeedMultiplier(prev => Math.min(prev + 1.5, 8));
      
      // Add glitch burst
      glitchOffsetRef.current = {
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 10,
      };
      
      // Decay speed back to normal
      if (speedDecayRef.current) {
        clearTimeout(speedDecayRef.current);
      }
      
      speedDecayRef.current = setTimeout(() => {
        const decay = () => {
          setSpeedMultiplier(prev => {
            const next = prev * 0.95;
            if (next > 1.1) {
              speedDecayRef.current = setTimeout(decay, 100);
              return next;
            }
            return 1;
          });
        };
        decay();
      }, 500);
    }
  }, [isPointInFace, onExpressionChange]);

  // Handle blinking
  const updateBlink = useCallback(() => {
    const now = Date.now();
    const blinkInterval = currentExpression === "angry" ? 1000 : 3000 + Math.random() * 2000;
    
    if (!isBlinkingRef.current && now - lastBlinkRef.current > blinkInterval) {
      isBlinkingRef.current = true;
      blinkPhaseRef.current = 0;
      lastBlinkRef.current = now;
    }
    
    if (isBlinkingRef.current) {
      blinkPhaseRef.current += 0.15 * speedMultiplier;
      if (blinkPhaseRef.current >= 1) {
        isBlinkingRef.current = false;
        blinkPhaseRef.current = 0;
      }
    }
  }, [currentExpression, speedMultiplier]);

  // Draw the detailed face
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const dpr = window.devicePixelRatio || 1;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);

    const centerX = width / 2;
    const centerY = height / 2;
    const faceSize = Math.min(width, height) * 0.85;
    const faceWidth = faceSize * 0.8;
    const faceHeight = faceSize * 0.9;

    // ============================================================
    // MATRIX EXPRESSION - Full screen digital rain with 3D face
    // Uses theme colors for uniform palette integration
    // ============================================================
    if (currentExpression === "matrix") {
      // Initialize matrix rain if not done
      if (!matrixInitializedRef.current || matrixColumnsRef.current.length === 0) {
        initializeMatrixRain(width, height);
      }
      
      // Update matrix rain
      updateMatrixRain(height);
      
      // Parse theme primary color for matrix effect
      const parseHex = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        } : { r: 0, g: 212, b: 255 };
      };
      
      const primaryRGB = parseHex(themeColors.primary);
      const secondaryRGB = parseHex(themeColors.secondary);
      const accentRGB = parseHex(themeColors.accent);
      
      // Create theme-aware matrix colors
      const matrixPrimary = themeColors.primary;
      const matrixBright = `rgb(${Math.min(255, primaryRGB.r + 100)}, ${Math.min(255, primaryRGB.g + 100)}, ${Math.min(255, primaryRGB.b + 100)})`;
      const matrixDim = `rgb(${Math.floor(primaryRGB.r * 0.2)}, ${Math.floor(primaryRGB.g * 0.2)}, ${Math.floor(primaryRGB.b * 0.2)})`;
      
      // Dark background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);
      
      // Add subtle depth gradient for 3D effect using theme colors
      const depthGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, faceSize * 0.6
      );
      depthGradient.addColorStop(0, `rgba(${primaryRGB.r * 0.15}, ${primaryRGB.g * 0.15}, ${primaryRGB.b * 0.15}, 0.4)`);
      depthGradient.addColorStop(0.5, `rgba(${primaryRGB.r * 0.1}, ${primaryRGB.g * 0.1}, ${primaryRGB.b * 0.1}, 0.2)`);
      depthGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = depthGradient;
      ctx.fillRect(0, 0, width, height);
      
      ctx.font = "bold 16px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Color phase for animated color cycling
      const matrixColorPhase = frameCountRef.current * 0.02;
      
      // Draw each column
      matrixColumnsRef.current.forEach((column) => {
        column.chars.forEach((charObj, charIdx) => {
          if (charObj.y < -20 || charObj.y > height + 20) return;
          
          const x = column.x;
          const y = charObj.y;
          
          // Check if this character is part of the face
          const faceCheck = isPointInFace3D(x, y, centerX, centerY, faceWidth * 1.1, faceHeight * 1.1);
          
          let alpha = charObj.brightness;
          let color = matrixPrimary;
          let fontSize = 16;
          let glowAmount = 0;
          
          if (faceCheck.inside) {
            // Character is inside the face - use theme colors with depth-based intensity
            const depthFactor = faceCheck.depth;
            
            // Depth affects brightness significantly
            alpha = 0.4 + depthFactor * 0.6;
            
            // Characters on raised parts (nose, brows, cheeks) are brightest - use secondary color
            if (depthFactor > 0.6) {
              // Cycle between primary and secondary for raised areas
              const colorMix = (Math.sin(matrixColorPhase + x * 0.05) + 1) * 0.5;
              const r = Math.floor(primaryRGB.r * (1 - colorMix) + secondaryRGB.r * colorMix + 80);
              const g = Math.floor(primaryRGB.g * (1 - colorMix) + secondaryRGB.g * colorMix + 80);
              const b = Math.floor(primaryRGB.b * (1 - colorMix) + secondaryRGB.b * colorMix + 80);
              color = `rgb(${Math.min(255, r)}, ${Math.min(255, g)}, ${Math.min(255, b)})`;
              fontSize = 16 + depthFactor * 4;
              glowAmount = 15 + depthFactor * 10;
            } else if (depthFactor > 0.3) {
              color = matrixPrimary;
              fontSize = 16 + depthFactor * 2;
              glowAmount = 8 + depthFactor * 8;
            } else {
              // Recessed areas (eye sockets, mouth) - dimmer version of primary
              const dimFactor = 0.4 + depthFactor;
              color = `rgb(${Math.floor(primaryRGB.r * dimFactor)}, ${Math.floor(primaryRGB.g * dimFactor)}, ${Math.floor(primaryRGB.b * dimFactor)})`;
              fontSize = 14;
              glowAmount = 4;
            }
            
            // Head of column is always brightest - use bright theme color
            if (charIdx === 0) {
              const brightR = Math.min(255, primaryRGB.r + 120);
              const brightG = Math.min(255, primaryRGB.g + 120);
              const brightB = Math.min(255, primaryRGB.b + 120);
              color = `rgb(${brightR}, ${brightG}, ${brightB})`;
              glowAmount = 25;
              alpha = 1;
            }
          } else {
            // Background rain - dimmer, uses theme colors
            alpha *= 0.5;
            
            // First character (head) is brightest - accent color
            if (charIdx === 0) {
              color = themeColors.accent;
              alpha = 0.9;
              glowAmount = 12;
            } else if (charIdx < 3) {
              color = matrixPrimary;
              alpha *= 1.5;
              glowAmount = 6;
            } else {
              color = matrixDim;
              glowAmount = 0;
            }
          }
          
          // Apply glow effect
          if (glowAmount > 0) {
            ctx.shadowColor = color;
            ctx.shadowBlur = glowAmount;
          } else {
            ctx.shadowBlur = 0;
          }
          
          // Draw the character
          ctx.fillStyle = color;
          ctx.globalAlpha = Math.min(1, alpha);
          ctx.font = `bold ${fontSize}px 'Courier New', monospace`;
          ctx.fillText(charObj.char, x, y);
        });
      });
      
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      
      // Draw subtle face outline for definition using theme primary
      ctx.strokeStyle = `rgba(${primaryRGB.r}, ${primaryRGB.g}, ${primaryRGB.b}, 0.15)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY - faceHeight * 0.05, faceWidth * 0.45, faceHeight * 0.48, 0, 0, Math.PI * 2);
      ctx.stroke();
      
      // Draw eye positions with extra glow using theme colors
      const eyeY = centerY - faceHeight * 0.12;
      const eyeSpacing = faceWidth * 0.2;
      
      [-1, 1].forEach(side => {
        const eyeX = centerX + side * eyeSpacing;
        
        // Eye glow - use secondary color
        const eyeGlow = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, faceWidth * 0.12);
        eyeGlow.addColorStop(0, `rgba(${secondaryRGB.r}, ${secondaryRGB.g}, ${secondaryRGB.b}, 0.4)`);
        eyeGlow.addColorStop(0.5, `rgba(${secondaryRGB.r}, ${secondaryRGB.g}, ${secondaryRGB.b}, 0.15)`);
        eyeGlow.addColorStop(1, `rgba(${secondaryRGB.r}, ${secondaryRGB.g}, ${secondaryRGB.b}, 0)`);
        ctx.fillStyle = eyeGlow;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, faceWidth * 0.12, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner eye - pulsing with accent color
        const pulseSize = 4 + Math.sin(frameCountRef.current * 0.1) * 2;
        ctx.fillStyle = themeColors.accent;
        ctx.shadowColor = themeColors.accent;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, pulseSize, 0, Math.PI * 2);
        ctx.fill();
      });
      
      ctx.shadowBlur = 0;
      
      // Scanline effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.03)";
      for (let y = 0; y < height; y += 2) {
        ctx.fillRect(0, y, width, 1);
      }
      
      // Status text removed - matrix mode is now default
      // No title displayed for cleaner look
      
      // Corner brackets in theme primary
      const bracketSize = 15;
      const bracketInset = 10;
      ctx.strokeStyle = `rgba(${primaryRGB.r}, ${primaryRGB.g}, ${primaryRGB.b}, 0.5)`;
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.moveTo(bracketInset, bracketInset + bracketSize);
      ctx.lineTo(bracketInset, bracketInset);
      ctx.lineTo(bracketInset + bracketSize, bracketInset);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(width - bracketInset - bracketSize, bracketInset);
      ctx.lineTo(width - bracketInset, bracketInset);
      ctx.lineTo(width - bracketInset, bracketInset + bracketSize);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(bracketInset, height - bracketInset - bracketSize);
      ctx.lineTo(bracketInset, height - bracketInset);
      ctx.lineTo(bracketInset + bracketSize, height - bracketInset);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(width - bracketInset - bracketSize, height - bracketInset);
      ctx.lineTo(width - bracketInset, height - bracketInset);
      ctx.lineTo(width - bracketInset, height - bracketInset - bracketSize);
      ctx.stroke();
      
      ctx.restore();
      return; // Exit early - matrix mode handles all rendering
    }
    // ============================================================
    // END MATRIX EXPRESSION
    // ============================================================

    // Update color phase for uniform flashing (affected by speed)
    const baseFlashSpeed = currentExpression === "thinking" ? 0.08 : 
                          currentExpression === "speaking" ? 0.12 :
                          currentExpression === "angry" ? 0.2 :
                          currentExpression === "curious" ? 0.06 : 0.02;
    // Increase color phase speed for more visible color changes in mouth
    colorPhaseRef.current += baseFlashSpeed * speedMultiplier * 2;
    
    // Random glitch offset (more intense when angry or speeding)
    const glitchChance = currentExpression === "angry" ? 0.15 : 0.02 * speedMultiplier;
    const glitchIntensity = currentExpression === "angry" ? 8 : 4 * Math.min(speedMultiplier, 3);
    
    if (Math.random() < glitchChance) {
      glitchOffsetRef.current = {
        x: (Math.random() - 0.5) * glitchIntensity,
        y: (Math.random() - 0.5) * glitchIntensity,
      };
    } else {
      glitchOffsetRef.current.x *= 0.85;
      glitchOffsetRef.current.y *= 0.85;
    }

    const glitchX = glitchOffsetRef.current.x;
    const glitchY = glitchOffsetRef.current.y;

    // Angry expression uses red colors
    const angryColors = currentExpression === "angry";
    const getExpressionColor = (phase: number, intensity: number) => {
      if (angryColors) {
        const pulse = Math.sin(phase * 2) * 0.3 + 0.7;
        return `rgba(255, ${50 + Math.floor(pulse * 50)}, ${50 + Math.floor(pulse * 30)}, ${intensity * pulse})`;
      }
      return getPhaseColor(phase, intensity);
    };

    // === BACKGROUND GRID ===
    ctx.font = "10px monospace";
    const gridChars = angryColors ? "!@#$%^&*X><" : "01░▒▓█▀▄▌▐";
    const gridSize = 14;
    const primaryR = parseInt(themeColors.primary.slice(1,3), 16) || 0;
    const primaryG = parseInt(themeColors.primary.slice(3,5), 16) || 212;
    const primaryB = parseInt(themeColors.primary.slice(5,7), 16) || 255;
    const dimColor = angryColors 
      ? `rgba(80, 20, 20, 0.2)` 
      : `rgba(${primaryR * 0.2}, ${primaryG * 0.2}, ${primaryB * 0.2}, 0.15)`;
    
    const gridUpdateChance = 0.03 * speedMultiplier;
    for (let y = 0; y < height; y += gridSize) {
      for (let x = 0; x < width; x += gridSize) {
        if (Math.random() < gridUpdateChance) {
          ctx.fillStyle = getExpressionColor(colorPhaseRef.current + x * 0.01 + y * 0.01, 0.3);
        } else {
          ctx.fillStyle = dimColor;
        }
        const char = gridChars[Math.floor(Math.random() * gridChars.length)];
        ctx.fillText(char, x, y + 10);
      }
    }

    // === FACE BACKGROUND (Dark oval) ===
    const faceGradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, faceSize * 0.5
    );
    if (angryColors) {
      faceGradient.addColorStop(0, "rgba(30, 5, 5, 0.95)");
      faceGradient.addColorStop(0.7, "rgba(20, 5, 10, 0.9)");
    } else {
      faceGradient.addColorStop(0, "rgba(5, 10, 20, 0.95)");
      faceGradient.addColorStop(0.7, "rgba(10, 15, 30, 0.9)");
    }
    faceGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    
    ctx.fillStyle = faceGradient;
    ctx.beginPath();
    ctx.ellipse(centerX + glitchX * 0.5, centerY + glitchY * 0.5, faceWidth * 0.55, faceHeight * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();

    // === FACE OUTLINE (Clear boundary) ===
    const outlineColor = getExpressionColor(colorPhaseRef.current, 0.8);
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 3;
    ctx.shadowColor = outlineColor;
    ctx.shadowBlur = angryColors ? 20 : 15;
    
    // Main face outline - rounded rectangle shape
    ctx.beginPath();
    const faceTop = centerY - faceHeight * 0.42 + glitchY * 0.3;
    const faceBottom = centerY + faceHeight * 0.42 + glitchY * 0.3;
    const faceLeft = centerX - faceWidth * 0.42 + glitchX * 0.3;
    const faceRight = centerX + faceWidth * 0.42 + glitchX * 0.3;
    const cornerRadius = faceWidth * 0.15;
    
    // Draw rounded rectangle for face
    ctx.moveTo(faceLeft + cornerRadius, faceTop);
    ctx.lineTo(faceRight - cornerRadius, faceTop);
    ctx.quadraticCurveTo(faceRight, faceTop, faceRight, faceTop + cornerRadius);
    ctx.lineTo(faceRight, faceBottom - cornerRadius * 1.5);
    ctx.quadraticCurveTo(faceRight, faceBottom, faceRight - cornerRadius, faceBottom);
    ctx.lineTo(centerX + cornerRadius * 0.5 + glitchX * 0.3, faceBottom);
    ctx.quadraticCurveTo(centerX + glitchX * 0.3, faceBottom + cornerRadius * 0.3, centerX - cornerRadius * 0.5 + glitchX * 0.3, faceBottom);
    ctx.lineTo(faceLeft + cornerRadius, faceBottom);
    ctx.quadraticCurveTo(faceLeft, faceBottom, faceLeft, faceBottom - cornerRadius * 1.5);
    ctx.lineTo(faceLeft, faceTop + cornerRadius);
    ctx.quadraticCurveTo(faceLeft, faceTop, faceLeft + cornerRadius, faceTop);
    ctx.closePath();
    ctx.stroke();

    ctx.shadowBlur = 0;

    // === FOREHEAD DETAILS ===
    const foreheadY = centerY - faceHeight * 0.28;
    ctx.strokeStyle = getExpressionColor(colorPhaseRef.current, 0.4);
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.moveTo(centerX - faceWidth * 0.25, foreheadY);
    ctx.lineTo(centerX - faceWidth * 0.1, foreheadY);
    ctx.lineTo(centerX - faceWidth * 0.05, foreheadY - 8);
    ctx.lineTo(centerX + faceWidth * 0.05, foreheadY - 8);
    ctx.lineTo(centerX + faceWidth * 0.1, foreheadY);
    ctx.lineTo(centerX + faceWidth * 0.25, foreheadY);
    ctx.stroke();

    ctx.fillStyle = getExpressionColor(colorPhaseRef.current, 0.9);
    ctx.beginPath();
    ctx.arc(centerX, foreheadY - 8, angryColors ? 4 : 3, 0, Math.PI * 2);
    ctx.fill();

    // === EYES ===
    const eyeY = centerY - faceHeight * 0.1;
    const eyeSpacing = faceWidth * 0.22;
    const eyeWidth = faceWidth * 0.18;
    const eyeHeight = faceHeight * 0.12;
    
    const blinkAmount = isBlinkingRef.current ? Math.sin(blinkPhaseRef.current * Math.PI) : 0;
    
    // Angry eyes are narrower
    const eyeNarrow = currentExpression === "angry" ? 0.5 : 1;
    const eyeOpenHeight = eyeHeight * (1 - blinkAmount * 0.9) * eyeNarrow;

    [-1, 1].forEach((side) => {
      const eyeCenterX = centerX + side * eyeSpacing + glitchX;
      const eyeCenterY = eyeY + glitchY;

      // Eye socket
      ctx.fillStyle = angryColors ? "rgba(30, 0, 0, 0.9)" : "rgba(0, 5, 15, 0.9)";
      ctx.beginPath();
      ctx.ellipse(eyeCenterX, eyeCenterY, eyeWidth * 0.7, eyeOpenHeight * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eye outline
      ctx.strokeStyle = getExpressionColor(colorPhaseRef.current + side * 0.2, 0.9);
      ctx.lineWidth = 2;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(eyeCenterX, eyeCenterY, eyeWidth * 0.7, eyeOpenHeight * 0.8, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      if (!isBlinkingRef.current || blinkAmount < 0.8) {
        // Iris
        const irisSize = eyeWidth * 0.4;
        const irisGradient = ctx.createRadialGradient(
          eyeCenterX, eyeCenterY, 0,
          eyeCenterX, eyeCenterY, irisSize
        );
        
        if (angryColors) {
          irisGradient.addColorStop(0, "#ff3333");
          irisGradient.addColorStop(0.5, "#cc0000");
          irisGradient.addColorStop(1, "#330000");
        } else if (currentExpression === "omega") {
          // Special golden/cyan gradient for omega expression
          const omegaPhase = colorPhaseRef.current * 0.5;
          irisGradient.addColorStop(0, `hsl(${(omegaPhase * 30) % 360 + 180}, 100%, 60%)`);
          irisGradient.addColorStop(0.4, getPhaseColor(colorPhaseRef.current, 0.9));
          irisGradient.addColorStop(0.7, "rgba(0, 40, 60, 0.95)");
          irisGradient.addColorStop(1, "rgba(0, 10, 20, 1)");
        } else {
          irisGradient.addColorStop(0, getPhaseColor(colorPhaseRef.current + side * 0.3, 1));
          irisGradient.addColorStop(0.5, getPhaseColor(colorPhaseRef.current + 0.5, 0.8));
          irisGradient.addColorStop(1, "rgba(0, 20, 40, 0.9)");
        }
        
        ctx.fillStyle = irisGradient;
        ctx.beginPath();
        ctx.arc(eyeCenterX, eyeCenterY, irisSize, 0, Math.PI * 2);
        ctx.fill();

        // Pupil - smaller when angry, moves when curious, Omega symbol for omega expression
        let pupilSize = eyeWidth * 0.15;
        let pupilOffsetX = 0;
        let pupilOffsetY = 0;
        
        if (currentExpression === "omega") {
          // Draw Omega symbol (Ω) as the pupil
          const omegaSize = irisSize * 0.9;
          const omegaPulse = 0.9 + Math.sin(frameCountRef.current * 0.08 * speedMultiplier) * 0.1;
          
          // Omega glow effect
          ctx.shadowColor = getPhaseColor(colorPhaseRef.current, 1);
          ctx.shadowBlur = 15;
          
          // Draw the Omega symbol
          ctx.fillStyle = getPhaseColor(colorPhaseRef.current, 1);
          ctx.font = `bold ${omegaSize * omegaPulse}px "Arial", sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("Ω", eyeCenterX, eyeCenterY + 1);
          
          // Add inner glow with different color
          ctx.fillStyle = getPhaseColor(colorPhaseRef.current + 1, 0.6);
          ctx.font = `bold ${omegaSize * omegaPulse * 0.85}px "Arial", sans-serif`;
          ctx.fillText("Ω", eyeCenterX, eyeCenterY + 1);
          
          ctx.shadowBlur = 0;
        } else {
          // Regular pupil drawing
          ctx.fillStyle = "#000";
          ctx.beginPath();
          
          if (currentExpression === "angry") {
            pupilSize = eyeWidth * 0.1;
          } else if (currentExpression === "thinking") {
            pupilOffsetX = Math.sin(frameCountRef.current * 0.05 * speedMultiplier) * 3;
          } else if (currentExpression === "curious") {
            pupilOffsetX = Math.sin(frameCountRef.current * 0.08 * speedMultiplier) * 4;
            pupilOffsetY = Math.cos(frameCountRef.current * 0.06 * speedMultiplier) * 2;
          }
          
          ctx.arc(eyeCenterX + pupilOffsetX, eyeCenterY + pupilOffsetY, pupilSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Eye highlight (skip for omega - the symbol is the highlight) - use bright theme color
        if (!angryColors && currentExpression !== "omega") {
          const highlightColor = getPhaseColor(colorPhaseRef.current, 0.9);
          ctx.fillStyle = highlightColor;
          ctx.beginPath();
          ctx.arc(eyeCenterX - irisSize * 0.3, eyeCenterY - irisSize * 0.3, pupilSize * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Angry eye vein effect
        if (angryColors) {
          ctx.strokeStyle = "rgba(255, 100, 100, 0.4)";
          ctx.lineWidth = 1;
          for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2 + frameCountRef.current * 0.01;
            ctx.beginPath();
            ctx.moveTo(eyeCenterX, eyeCenterY);
            ctx.lineTo(
              eyeCenterX + Math.cos(angle) * eyeWidth * 0.6,
              eyeCenterY + Math.sin(angle) * eyeOpenHeight * 0.7
            );
            ctx.stroke();
          }
        }

        // Scanning effect for thinking/curious
        if (currentExpression === "thinking" || currentExpression === "curious") {
          const scanY = eyeCenterY - eyeOpenHeight * 0.6 + (frameCountRef.current * speedMultiplier % 60) / 60 * eyeOpenHeight * 1.2;
          ctx.strokeStyle = getExpressionColor(colorPhaseRef.current, 0.6);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(eyeCenterX - eyeWidth * 0.6, scanY);
          ctx.lineTo(eyeCenterX + eyeWidth * 0.6, scanY);
          ctx.stroke();
        }
      }

      if (blinkAmount > 0.1) {
        ctx.strokeStyle = getExpressionColor(colorPhaseRef.current, 0.8);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(eyeCenterX - eyeWidth * 0.6, eyeCenterY);
        ctx.lineTo(eyeCenterX + eyeWidth * 0.6, eyeCenterY);
        ctx.stroke();
      }
    });

    // === EYEBROWS ===
    const eyebrowY = eyeY - eyeHeight * 1.5;
    const eyebrowLength = eyeWidth * 1.2;
    
    [-1, 1].forEach((side) => {
      const browX = centerX + side * eyeSpacing;
      let browTilt = 0;
      let browAngle = 0;
      
      switch (currentExpression) {
        case "angry":
          browTilt = side * -12; // Angry V shape
          browAngle = side * 0.3;
          break;
        case "thinking":
          browTilt = side * 5;
          break;
        case "surprised":
          browTilt = -5;
          break;
        case "curious":
          browTilt = side * 8;
          break;
      }
      
      ctx.strokeStyle = getExpressionColor(colorPhaseRef.current + 0.3, 0.9);
      ctx.lineWidth = angryColors ? 4 : 3;
      ctx.lineCap = "round";
      
      ctx.save();
      ctx.translate(browX, eyebrowY);
      ctx.rotate(browAngle);
      
      ctx.beginPath();
      ctx.moveTo(-side * eyebrowLength * 0.5, browTilt);
      ctx.lineTo(side * eyebrowLength * 0.5, -browTilt);
      ctx.stroke();
      
      ctx.restore();
    });

    // === NOSE ===
    const noseTop = centerY - faceHeight * 0.02;
    const noseBottom = centerY + faceHeight * 0.12;
    const noseWidth = faceWidth * 0.08;
    
    ctx.strokeStyle = getExpressionColor(colorPhaseRef.current + 0.7, 0.6);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    
    ctx.beginPath();
    ctx.moveTo(centerX, noseTop);
    ctx.lineTo(centerX, noseBottom);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(centerX - noseWidth, noseBottom);
    ctx.quadraticCurveTo(centerX, noseBottom + 5, centerX + noseWidth, noseBottom);
    ctx.stroke();

    // === MOUTH - ROBOT LED STYLE (Like R2-D2/C-3PO) ===
    const mouthY = centerY + faceHeight * 0.22;
    const mouthWidth = faceWidth * 0.38;
    const mouthTotalHeight = 35; // Fixed pixel height for consistency
    
    // Number of LED bars
    const ledBarCount = 5;
    const ledBarGap = 3;
    const ledBarHeight = (mouthTotalHeight - (ledBarCount - 1) * ledBarGap) / ledBarCount;
    
    // Calculate LED activity based on expression
    let ledLevels: number[] = new Array(ledBarCount).fill(0.3);
    let centerGlow = 0.5;
    let pulseSpeed = 1;
    
    // Always animate with frameCount for visibility
    const basePhase = frameCountRef.current * 0.05 * speedMultiplier;
    
    if (currentExpression === "speaking") {
      // Dynamic LED animation when speaking - like audio visualizer
      const intensity = Math.max(0.5, Math.min(1, speechIntensity));
      pulseSpeed = speedMultiplier * (1 + intensity * 0.5);
      
      // Generate audio-visualizer-like levels for each bar
      const barPhase = speakPhaseRef.current * pulseSpeed;
      ledLevels = [
        0.5 + Math.sin(barPhase * 3) * 0.5,
        0.6 + Math.sin(barPhase * 4.2 + 1) * 0.4,
        0.7 + Math.sin(barPhase * 5.5 + 2) * 0.3,
        0.6 + Math.sin(barPhase * 4.2 + 3) * 0.4,
        0.5 + Math.sin(barPhase * 3 + 4) * 0.5,
      ];
      centerGlow = 0.8 + Math.sin(barPhase * 4) * 0.2;
    } else {
      // Animated patterns for all expressions
      switch (currentExpression) {
        case "happy":
          // Smile pattern - outer bars higher, animated
          ledLevels = [
            0.8 + Math.sin(basePhase) * 0.2,
            0.6 + Math.sin(basePhase + 0.5) * 0.2,
            0.4 + Math.sin(basePhase + 1) * 0.2,
            0.6 + Math.sin(basePhase + 1.5) * 0.2,
            0.8 + Math.sin(basePhase + 2) * 0.2,
          ];
          centerGlow = 0.7 + Math.sin(basePhase * 2) * 0.2;
          break;
        case "thinking":
          // Scanning pattern - wave moves across
          const scanPos = (Math.sin(basePhase * 1.5) + 1) / 2 * ledBarCount;
          for (let i = 0; i < ledBarCount; i++) {
            const dist = Math.abs(i - scanPos);
            ledLevels[i] = Math.max(0.2, 1 - dist * 0.4);
          }
          centerGlow = 0.5 + Math.sin(basePhase * 3) * 0.2;
          break;
        case "surprised":
          // All bars high and pulsing fast
          const surprisePulse = Math.sin(basePhase * 4) * 0.3 + 0.7;
          ledLevels = new Array(ledBarCount).fill(surprisePulse);
          centerGlow = 0.9 + Math.sin(basePhase * 5) * 0.1;
          break;
        case "curious":
          // Asymmetric wave pattern
          for (let i = 0; i < ledBarCount; i++) {
            ledLevels[i] = 0.4 + Math.sin(basePhase * 2 + i * 0.8) * 0.4;
          }
          centerGlow = 0.6 + Math.sin(basePhase * 2.5) * 0.2;
          break;
        case "angry":
          // Intense red pulsing
          const angryPulse = Math.abs(Math.sin(basePhase * 5));
          ledLevels = new Array(ledBarCount).fill(0.6 + angryPulse * 0.4);
          centerGlow = 0.9;
          break;
        case "omega":
          // Center out wave pattern
          for (let i = 0; i < ledBarCount; i++) {
            const distFromCenter = Math.abs(i - 2);
            ledLevels[i] = 0.5 + Math.sin(basePhase * 3 - distFromCenter * 0.8) * 0.5;
          }
          centerGlow = 0.8 + Math.sin(basePhase * 4) * 0.2;
          break;
        case "sleeping":
          // Very dim, slow pulse
          const sleepPulse = Math.sin(basePhase * 0.5) * 0.15 + 0.25;
          ledLevels = new Array(ledBarCount).fill(sleepPulse);
          centerGlow = 0.3 + Math.sin(basePhase * 0.5) * 0.1;
          break;
        case "matrix":
          // Binary cascade pattern
          for (let i = 0; i < ledBarCount; i++) {
            const matrixPhase = (basePhase * 3 + i * 2) % (Math.PI * 2);
            ledLevels[i] = 0.3 + Math.abs(Math.sin(matrixPhase)) * 0.7;
          }
          centerGlow = 0.7 + Math.sin(basePhase * 4) * 0.2;
          break;
        default: // idle - breathing effect
          const breathVal = Math.sin(basePhase) * 0.2 + 0.4;
          ledLevels = [
            breathVal + 0.1,
            breathVal + 0.15,
            breathVal + 0.2,
            breathVal + 0.15,
            breathVal + 0.1,
          ];
          centerGlow = 0.4 + Math.sin(basePhase) * 0.15;
      }
    }

    // === DRAW ROBOT MOUTH FRAME ===
    const framePadding = 6;
    const frameLeft = centerX - mouthWidth - framePadding;
    const frameRight = centerX + mouthWidth + framePadding;
    const frameTop = mouthY - framePadding;
    const frameBottom = mouthY + mouthTotalHeight + framePadding;
    const frameRadius = 8;
    
    // Outer frame background
    ctx.fillStyle = angryColors ? "rgba(30, 5, 5, 0.95)" : "rgba(8, 12, 25, 0.95)";
    ctx.beginPath();
    ctx.roundRect(frameLeft, frameTop, frameRight - frameLeft, frameBottom - frameTop, frameRadius);
    ctx.fill();
    
    // Frame border with glow - using mouth color with hue shift
    const frameHueShift = (frameCountRef.current * 0.3) % 360;
    const frameColor = getMouthColor(colorPhaseRef.current, 0.9, frameHueShift);
    ctx.strokeStyle = frameColor;
    ctx.lineWidth = 2;
    ctx.shadowColor = frameColor;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.roundRect(frameLeft, frameTop, frameRight - frameLeft, frameBottom - frameTop, frameRadius);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Inner frame line
    ctx.strokeStyle = getMouthColor(colorPhaseRef.current, 0.3, frameHueShift);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(frameLeft + 3, frameTop + 3, frameRight - frameLeft - 6, frameBottom - frameTop - 6, frameRadius - 2);
    ctx.stroke();

    // === DRAW LED BARS ===
    for (let i = 0; i < ledBarCount; i++) {
      const barY = mouthY + i * (ledBarHeight + ledBarGap);
      const level = Math.max(0, Math.min(1, ledLevels[i] || 0));
      
      // Calculate bar width based on level
      const minWidth = mouthWidth * 0.4;
      const barWidth = minWidth + (mouthWidth - minWidth) * level;
      const barLeft = centerX - barWidth;
      const barRight = centerX + barWidth;
      
      // Single LED bar with segments
      const segmentCount = 11;
      const totalBarWidth = barRight - barLeft;
      const segmentWidth = totalBarWidth / segmentCount;
      const segGap = 2;
      
      for (let j = 0; j < segmentCount; j++) {
        const segX = barLeft + j * segmentWidth;
        
        // All segments visible, brightness varies by distance from center
        const distFromCenter = Math.abs(j - (segmentCount - 1) / 2) / ((segmentCount - 1) / 2);
        const segmentBrightness = level * (1 - distFromCenter * 0.5);
        
        // LED glow effect with hue shifting - more pronounced shifts for visible color changes
        if (segmentBrightness > 0.3) {
          // Use frameCount for smoother, more visible color transitions
          const hueShift = (frameCountRef.current * 0.5 + i * 30 + j * 10) % 360;
          const glowColor = getMouthColor(colorPhaseRef.current + i * 0.3 + j * 0.1, 1, hueShift);
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = 6 + segmentBrightness * 8;
        } else {
          ctx.shadowBlur = 0;
        }
        
        // LED color based on brightness with hue shifting effect
        if (segmentBrightness > 0.25) {
          // Active - use theme color with hue shift for color changing effect
          // Use frameCount for smoother animation
          const hueShift = (frameCountRef.current * 0.4 + i * 25 + j * 8) % 360;
          ctx.fillStyle = getMouthColor(colorPhaseRef.current + i * 0.3 + j * 0.1, segmentBrightness, hueShift);
        } else {
          // Dim/inactive - use dimmed theme color with hue shift
          const dimHueShift = (frameCountRef.current * 0.2) % 360;
          ctx.fillStyle = angryColors ? "rgba(50, 15, 15, 0.7)" : getMouthColor(colorPhaseRef.current * 0.5, 0.4, dimHueShift);
        }
        
        // Draw segment
        ctx.beginPath();
        ctx.roundRect(
          segX + segGap / 2, 
          barY, 
          segmentWidth - segGap, 
          ledBarHeight, 
          2
        );
        ctx.fill();
        
        // Highlight on bright segments
        if (segmentBrightness > 0.5) {
          ctx.fillStyle = `rgba(255, 255, 255, ${segmentBrightness * 0.3})`;
          ctx.beginPath();
          ctx.roundRect(
            segX + segmentWidth * 0.2, 
            barY + 1, 
            segmentWidth * 0.6, 
            2, 
            1
          );
          ctx.fill();
        }
      }
      
      ctx.shadowBlur = 0;
    }
    
    // === CENTER INDICATOR LIGHT ===
    const indicatorY = frameBottom + 8;
    const indicatorRadius = 5;
    
    // Indicator glow with hue shifting - more pronounced
    const indicatorHueShift = (frameCountRef.current * 0.4) % 360;
    const indicatorColor = getMouthColor(colorPhaseRef.current, centerGlow, indicatorHueShift);
    ctx.shadowColor = indicatorColor;
    ctx.shadowBlur = 15;
    
    // Outer glow ring
    ctx.fillStyle = getMouthColor(colorPhaseRef.current, centerGlow * 0.3, indicatorHueShift);
    ctx.beginPath();
    ctx.arc(centerX, indicatorY, indicatorRadius * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Main indicator
    ctx.fillStyle = indicatorColor;
    ctx.beginPath();
    ctx.arc(centerX, indicatorY, indicatorRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner bright point
    ctx.fillStyle = `rgba(255, 255, 255, ${centerGlow * 0.7})`;
    ctx.beginPath();
    ctx.arc(centerX, indicatorY, indicatorRadius * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    
    // === SPEAKING AUDIO WAVES ===
    if (currentExpression === "speaking") {
      const waveIntensity = speechIntensity;
      
      // Sound wave arcs with hue shifting - more pronounced
      for (let i = 0; i < 3; i++) {
        const wavePhase = (speakPhaseRef.current * pulseSpeed * 0.5 + i * 0.33) % 1;
        const waveRadius = 15 + wavePhase * 30;
        const waveAlpha = (1 - wavePhase) * 0.4 * waveIntensity;
        const waveHueShift = (frameCountRef.current * 0.35 + i * 50) % 360;
        
        ctx.strokeStyle = getMouthColor(colorPhaseRef.current + i * 0.3, waveAlpha, waveHueShift);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, mouthY + mouthTotalHeight * 0.5, waveRadius, Math.PI * 0.25, Math.PI * 0.75);
        ctx.stroke();
      }
      
      // Vertical pulse lines on sides
      const pulseHeight = mouthTotalHeight * (0.5 + waveIntensity * 0.5);
      const pulseAlpha = 0.3 + Math.sin(speakPhaseRef.current * pulseSpeed * 6) * 0.2;
      const pulseHueShift = (frameCountRef.current * 0.3) % 360;
      
      ctx.strokeStyle = getMouthColor(colorPhaseRef.current, pulseAlpha, pulseHueShift);
      ctx.lineWidth = 2;
      
      [-1, 1].forEach(side => {
        const lineX = centerX + side * (mouthWidth + 15);
        ctx.beginPath();
        ctx.moveTo(lineX, mouthY + mouthTotalHeight / 2 - pulseHeight / 2);
        ctx.lineTo(lineX, mouthY + mouthTotalHeight / 2 + pulseHeight / 2);
        ctx.stroke();
        
        // Horizontal ticks
        ctx.lineWidth = 1;
        for (let t = 0; t < 3; t++) {
          const tickY = mouthY + mouthTotalHeight / 2 + (t - 1) * (pulseHeight / 4);
          ctx.beginPath();
          ctx.moveTo(lineX, tickY);
          ctx.lineTo(lineX + side * 5, tickY);
          ctx.stroke();
        }
      });
    }
    
    // === CORNER BRACKETS ON MOUTH FRAME ===
    const bracketLen = 8;
    const bracketHueShift = (frameCountRef.current * 0.25) % 360;
    ctx.strokeStyle = getMouthColor(colorPhaseRef.current, 0.6, bracketHueShift);
    ctx.lineWidth = 2;
    
    // Top-left
    ctx.beginPath();
    ctx.moveTo(frameLeft - 3, frameTop + bracketLen);
    ctx.lineTo(frameLeft - 3, frameTop - 3);
    ctx.lineTo(frameLeft + bracketLen, frameTop - 3);
    ctx.stroke();
    
    // Top-right
    ctx.beginPath();
    ctx.moveTo(frameRight - bracketLen, frameTop - 3);
    ctx.lineTo(frameRight + 3, frameTop - 3);
    ctx.lineTo(frameRight + 3, frameTop + bracketLen);
    ctx.stroke();
    
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(frameLeft - 3, frameBottom - bracketLen);
    ctx.lineTo(frameLeft - 3, frameBottom + 3);
    ctx.lineTo(frameLeft + bracketLen, frameBottom + 3);
    ctx.stroke();
    
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(frameRight - bracketLen, frameBottom + 3);
    ctx.lineTo(frameRight + 3, frameBottom + 3);
    ctx.lineTo(frameRight + 3, frameBottom - bracketLen);
    ctx.stroke();

    // === CHEEK ACCENTS ===
    if ((currentExpression === "happy" || currentExpression === "speaking" || currentExpression === "curious") && !angryColors) {
      const cheekY = centerY + faceHeight * 0.08;
      const cheekSpacing = faceWidth * 0.35;
      const blushIntensity = currentExpression === "happy" ? 0.4 : 0.2;
      
      [-1, 1].forEach((side) => {
        const cheekX = centerX + side * cheekSpacing;
        
        const blushGradient = ctx.createRadialGradient(
          cheekX, cheekY, 0,
          cheekX, cheekY, faceWidth * 0.1
        );
        blushGradient.addColorStop(0, `rgba(255, 100, 150, ${blushIntensity})`);
        blushGradient.addColorStop(1, "rgba(255, 100, 150, 0)");
        
        ctx.fillStyle = blushGradient;
        ctx.beginPath();
        ctx.arc(cheekX, cheekY, faceWidth * 0.1, 0, Math.PI * 2);
        ctx.fill();
        
        const sparklePhase = frameCountRef.current * 0.1 * speedMultiplier + side;
        ctx.fillStyle = getPhaseColor(colorPhaseRef.current, 0.5 + Math.sin(sparklePhase) * 0.3);
        ctx.font = "12px monospace";
        ctx.textAlign = "center";
        ctx.fillText("✦", cheekX, cheekY);
      });
    }

    // === ANGRY EFFECTS ===
    if (angryColors) {
      // Steam/anger marks above head
      ctx.font = "14px monospace";
      ctx.fillStyle = `rgba(255, 100, 100, ${0.5 + Math.sin(frameCountRef.current * 0.2) * 0.3})`;
      ctx.textAlign = "center";
      
      const steamY = centerY - faceHeight * 0.5;
      ctx.fillText("💢", centerX - 20 + Math.sin(frameCountRef.current * 0.1) * 3, steamY);
      ctx.fillText("💢", centerX + 20 + Math.cos(frameCountRef.current * 0.1) * 3, steamY - 5);
      
      // Pulsing red border
      const pulseIntensity = 0.3 + Math.sin(frameCountRef.current * 0.15) * 0.2;
      ctx.strokeStyle = `rgba(255, 50, 50, ${pulseIntensity})`;
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, width - 4, height - 4);
    }

    // === OMEGA EFFECTS ===
    if (currentExpression === "omega") {
      // Rotating omega symbols around the face
      const omegaRingRadius = faceSize * 0.55;
      const omegaCount = 6;
      const rotationSpeed = frameCountRef.current * 0.02 * speedMultiplier;
      
      ctx.font = "bold 16px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      for (let i = 0; i < omegaCount; i++) {
        const angle = (i / omegaCount) * Math.PI * 2 + rotationSpeed;
        const x = centerX + Math.cos(angle) * omegaRingRadius;
        const y = centerY + Math.sin(angle) * omegaRingRadius * 0.85;
        const alpha = 0.4 + Math.sin(frameCountRef.current * 0.1 + i) * 0.2;
        
        ctx.fillStyle = getPhaseColor(colorPhaseRef.current + i * 0.3, alpha);
        ctx.shadowColor = getPhaseColor(colorPhaseRef.current + i * 0.3, 1);
        ctx.shadowBlur = 10;
        ctx.fillText("Ω", x, y);
      }
      ctx.shadowBlur = 0;
      
      // Energy rings emanating from center
      const ringCount = 3;
      for (let i = 0; i < ringCount; i++) {
        const ringPhase = (frameCountRef.current * 0.03 * speedMultiplier + i * 0.33) % 1;
        const ringRadius = faceSize * 0.3 + ringPhase * faceSize * 0.4;
        const ringAlpha = (1 - ringPhase) * 0.4;
        
        ctx.strokeStyle = getPhaseColor(colorPhaseRef.current + i * 0.5, ringAlpha);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, ringRadius, ringRadius * 0.85, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Corner Omega symbols
      const cornerSize = 20;
      const cornerInset = 25;
      ctx.font = "bold 18px Arial, sans-serif";
      ctx.fillStyle = getPhaseColor(colorPhaseRef.current, 0.6);
      ctx.shadowColor = getPhaseColor(colorPhaseRef.current, 1);
      ctx.shadowBlur = 8;
      
      ctx.fillText("Ω", cornerInset, cornerInset + 5);
      ctx.fillText("Ω", width - cornerInset, cornerInset + 5);
      ctx.fillText("Ω", cornerInset, height - cornerInset);
      ctx.fillText("Ω", width - cornerInset, height - cornerInset);
      ctx.shadowBlur = 0;
      
      // Glowing border
      const borderPulse = 0.4 + Math.sin(frameCountRef.current * 0.1) * 0.2;
      ctx.strokeStyle = getPhaseColor(colorPhaseRef.current, borderPulse);
      ctx.lineWidth = 3;
      ctx.strokeRect(4, 4, width - 8, height - 8);
    }

    // === SPEED EFFECTS ===
    if (speedMultiplier > 1.5) {
      // Speed lines
      ctx.strokeStyle = getExpressionColor(colorPhaseRef.current, 0.2 * (speedMultiplier - 1));
      ctx.lineWidth = 1;
      
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const startR = faceSize * 0.5;
        const endR = faceSize * 0.7;
        
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(angle) * startR, centerY + Math.sin(angle) * startR);
        ctx.lineTo(centerX + Math.cos(angle) * endR, centerY + Math.sin(angle) * endR);
        ctx.stroke();
      }
    }

    // === SIDE DECORATIONS ===
    const sideLineY = centerY;
    ctx.strokeStyle = getExpressionColor(colorPhaseRef.current, 0.3);
    ctx.lineWidth = 1;
    
    [-1, 1].forEach((side) => {
      const startX = centerX + side * faceWidth * 0.5;
      
      for (let i = 0; i < 3; i++) {
        const y = sideLineY - 20 + i * 20;
        const lineLength = 15 + (i === 1 ? 10 : 0);
        
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(startX + side * lineLength, y);
        ctx.stroke();
        
        ctx.fillStyle = getExpressionColor(colorPhaseRef.current + i * 0.2, 0.6);
        ctx.beginPath();
        ctx.arc(startX + side * lineLength, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // === THINKING INDICATOR ===
    if (currentExpression === "thinking" || currentExpression === "curious") {
      const dotY = centerY - faceHeight * 0.55;
      const dotSpacing = 12;
      
      for (let i = 0; i < 3; i++) {
        const dotX = centerX + (i - 1) * dotSpacing;
        const bounce = Math.sin(frameCountRef.current * 0.15 * speedMultiplier + i * 0.7) * 6;
        const dotSize = 4 + Math.sin(frameCountRef.current * 0.1 * speedMultiplier + i) * 2;
        
        ctx.fillStyle = getExpressionColor(colorPhaseRef.current + i * 0.3, 0.8);
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(dotX, dotY + bounce, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    // === SPEAKING WAVES ===
    if (currentExpression === "speaking") {
      const waveCount = 4;
      
      for (let i = 0; i < waveCount; i++) {
        const radius = faceSize * 0.45 + i * 12 + Math.sin(frameCountRef.current * 0.1 * speedMultiplier + i) * 4;
        const alpha = 0.3 - i * 0.07;
        
        ctx.strokeStyle = getExpressionColor(colorPhaseRef.current + i * 0.2, alpha);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radius, radius * 0.85, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // === STATUS LABEL ===
    // Status text removed - no titles displayed for cleaner look

    // === CORNER BRACKETS ===
    const bracketSize = 15;
    const bracketInset = 10;
    ctx.strokeStyle = getExpressionColor(colorPhaseRef.current, 0.5);
    ctx.lineWidth = 2;
    
    // Top-left
    ctx.beginPath();
    ctx.moveTo(bracketInset, bracketInset + bracketSize);
    ctx.lineTo(bracketInset, bracketInset);
    ctx.lineTo(bracketInset + bracketSize, bracketInset);
    ctx.stroke();
    
    // Top-right
    ctx.beginPath();
    ctx.moveTo(width - bracketInset - bracketSize, bracketInset);
    ctx.lineTo(width - bracketInset, bracketInset);
    ctx.lineTo(width - bracketInset, bracketInset + bracketSize);
    ctx.stroke();
    
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(bracketInset, height - bracketInset - bracketSize);
    ctx.lineTo(bracketInset, height - bracketInset);
    ctx.lineTo(bracketInset + bracketSize, height - bracketInset);
    ctx.stroke();
    
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(width - bracketInset - bracketSize, height - bracketInset);
    ctx.lineTo(width - bracketInset, height - bracketInset);
    ctx.lineTo(width - bracketInset, height - bracketInset - bracketSize);
    ctx.stroke();

    ctx.restore();
  }, [currentExpression, themeColors, getPhaseColor, getMouthColor, activeColors, speedMultiplier, initializeMatrixRain, updateMatrixRain, isPointInFace3D]);

  // Animation loop
  const animate = useCallback(() => {
    frameCountRef.current += speedMultiplier;
    
    if (isSpeaking) {
      speakPhaseRef.current += 0.25 * speedMultiplier;
    }
    
    updateBlink();
    draw();
    
    animationRef.current = requestAnimationFrame(animate);
  }, [draw, isSpeaking, updateBlink, speedMultiplier]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const parent = canvas.parentElement;
      if (!parent) return;
      
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Start animation
  useEffect(() => {
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  // Cleanup timeouts and intervals
  useEffect(() => {
    return () => {
      if (speedDecayRef.current) clearTimeout(speedDecayRef.current);
      if (angryTimeoutRef.current) clearTimeout(angryTimeoutRef.current);
      if (omegaTimeoutRef.current) clearTimeout(omegaTimeoutRef.current);
      if (matrixTimeoutRef.current) clearTimeout(matrixTimeoutRef.current);
      if (hoverExpressionIntervalRef.current) clearInterval(hoverExpressionIntervalRef.current);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`${styles.container} ${className || ""} ${speedMultiplier > 2 ? styles.overdrive : ""} ${currentExpression === "matrix" ? styles.matrix : ""}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setIsHoveringFace(false);
      }}
      onClick={handleFaceClick}
    >
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.scanlines} />
      {speedMultiplier > 2 && <div className={styles.overdriveGlow} />}
      {currentExpression === "matrix" && <div className={styles.matrixGlow} />}
    </div>
  );
}

export default DigitalFace;
