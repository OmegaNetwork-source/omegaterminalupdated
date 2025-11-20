"use client";

import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

export interface LetterGlitchProps {
  glitchColors?: string[];
  glitchSpeed?: number;
  centerVignette?: boolean;
  outerVignette?: boolean;
  smooth?: boolean;
  characters?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface LetterGlitchRef {
  triggerIntenseGlitch: (colors?: string[], duration?: number) => void;
  triggerHoverGlitch: (colors?: string[], duration?: number) => void;
  stopHoverGlitch: () => void;
  scrambleAll: (colors?: string[]) => void;
  resetToNormal: () => void;
}

export const LetterGlitch = forwardRef<LetterGlitchRef, LetterGlitchProps>(({
  glitchColors = ['#2b4539', '#61dca3', '#61b3dc'],
  glitchSpeed = 50,
  centerVignette = false,
  outerVignette = true,
  smooth = true,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789Ω',
  className,
  style
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const letters = useRef<
    {
      char: string;
      color: string;
      targetColor: string;
      colorProgress: number;
      offsetX: number;
      offsetY: number;
      targetOffsetX: number;
      targetOffsetY: number;
      offsetProgress: number;
      isFrozen: boolean;
      frozenText?: string; // Store the word this letter belongs to
    }[]
  >([]);
  const grid = useRef({ columns: 0, rows: 0 });
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const lastGlitchTime = useRef(Date.now());
  const originalGlitchSpeed = useRef(glitchSpeed);
  const originalGlitchColors = useRef(glitchColors);
  const isGlitching = useRef(false);
  const isHoverGlitch = useRef(false);
  const glitchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const glitchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hoverGlitchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const vortexAnimationRef = useRef<number | null>(null);
  
  // Easter egg hidden text patterns - only these should use special colors
  const hiddenTexts = useRef<string[]>([
    'OMEGA', 'DeFi', 'Web3', 'ETH', 'BTC', 'SOL', 'Ω'
  ]);
  const hiddenTextTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hiddenTextFadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isShowingHiddenText = useRef(false);
  const activeHiddenTextRef = useRef<{
    text: string;
    startCol: number;
    startRow: number;
    length: number;
    indices: number[];
  } | null>(null);

  const lettersAndSymbols = Array.from(characters);

  const fontSize = 16;
  const charWidth = 10;
  const charHeight = 20;

  const getRandomChar = () => {
    return lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)];
  };

  const getRandomColor = () => {
    return glitchColors[Math.floor(Math.random() * glitchColors.length)];
  };

  const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (_m, r, g, b) => {
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : null;
  };

  const interpolateColor = (
    start: { r: number; g: number; b: number },
    end: { r: number; g: number; b: number },
    factor: number
  ) => {
    const result = {
      r: Math.round(start.r + (end.r - start.r) * factor),
      g: Math.round(start.g + (end.g - start.g) * factor),
      b: Math.round(start.b + (end.b - start.b) * factor)
    };
    return `rgb(${result.r}, ${result.g}, ${result.b})`;
  };

  const calculateGrid = (width: number, height: number) => {
    const columns = Math.ceil(width / charWidth);
    const rows = Math.ceil(height / charHeight);
    return { columns, rows };
  };

  const initializeLetters = (columns: number, rows: number) => {
    grid.current = { columns, rows };

    const totalLetters = columns * rows;
    letters.current = Array.from({ length: totalLetters }, () => ({
      char: getRandomChar(),
      color: getRandomColor(),
      targetColor: getRandomColor(),
      colorProgress: 1,
      offsetX: 0,
      offsetY: 0,
      targetOffsetX: 0,
      targetOffsetY: 0,
      offsetProgress: 1,
      isFrozen: false,
      frozenText: undefined
    }));
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    if (context.current) {
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const { columns, rows } = calculateGrid(rect.width, rect.height);
    initializeLetters(columns, rows);
    drawLetters();
  };

  const drawLetters = () => {
    if (!context.current || letters.current.length === 0) return;
    const ctx = context.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const { width, height } = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, width, height);
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = 'top';

    // Calculate center for vortex effect
    const centerX = width / 2;
    const centerY = height / 2;

    letters.current.forEach((letter, index) => {
      const baseX = (index % grid.current.columns) * charWidth;
      const baseY = Math.floor(index / grid.current.columns) * charHeight;
      
      // Apply offset for hover glitch (separation effect)
      const x = baseX + letter.offsetX;
      const y = baseY + letter.offsetY;
      
      // Calculate distance from center for vortex effect
      const dx = baseX - centerX;
      const dy = baseY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Vortex effect: pull letters toward center based on distance
      // Stronger pull near center, weaker at edges
      const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
      const normalizedDistance = distance / maxDistance;
      
      // Vortex strength curve - exponential falloff for black hole effect
      // Active in center 50% of screen, with strong pull in inner 30%
      const vortexStrength = normalizedDistance < 0.5 
        ? Math.pow(1 - (normalizedDistance / 0.5), 2) // Exponential falloff
        : 0;
      
      const vortexPull = vortexStrength * 1.2; // Max pull of 1.2 character widths
      
      // Calculate angle to center
      const angle = Math.atan2(dy, dx);
      
      // Apply vortex offset (pull toward center)
      // Frozen letters are not affected by vortex
      let vortexX = 0;
      let vortexY = 0;
      if (!letter.isFrozen) {
        // Add slight rotation for spiral effect
        const rotation = normalizedDistance * 0.3; // Subtle rotation
        vortexX = -Math.cos(angle + rotation) * vortexPull * charWidth;
        vortexY = -Math.sin(angle + rotation) * vortexPull * charHeight;
      }
      
      // Combine hover offset with vortex offset
      const finalX = x + vortexX;
      const finalY = y + vortexY;
      
      // Opacity and scale based on vortex strength (letters fade and shrink as they get pulled in)
      // Frozen letters are always fully visible and not affected by vortex
      const opacity = letter.isFrozen ? 1 : (1 - (vortexStrength * 0.5)); // Fade up to 50% at center
      const scale = letter.isFrozen ? 1 : (1 - (vortexStrength * 0.3)); // Shrink up to 30% at center
      ctx.globalAlpha = opacity;
      
      // Apply scale transformation
      ctx.save();
      ctx.translate(finalX + charWidth / 2, finalY + charHeight / 2);
      ctx.scale(scale, scale);
      ctx.translate(-(finalX + charWidth / 2), -(finalY + charHeight / 2));
      
      ctx.fillStyle = letter.color;
      ctx.fillText(letter.char, finalX, finalY);
      
      ctx.restore(); // Restore transformations
      ctx.globalAlpha = 1; // Reset opacity
    });
  };

  const updateLetters = () => {
    if (!letters.current || letters.current.length === 0) return;
    
    // Don't update if in hover glitch mode (it has its own update cycle)
    if (isHoverGlitch.current) return;

    const updateCount = Math.max(1, Math.floor(letters.current.length * 0.05));

    for (let i = 0; i < updateCount; i++) {
      const index = Math.floor(Math.random() * letters.current.length);
      if (!letters.current[index]) continue;
      
      // Skip frozen letters - they stay as hidden text
      if (letters.current[index].isFrozen) continue;

      letters.current[index].char = getRandomChar();
      letters.current[index].targetColor = getRandomColor(); // Always use palette colors

      if (!smooth) {
        letters.current[index].color = letters.current[index].targetColor;
        letters.current[index].colorProgress = 1;
      } else {
        letters.current[index].colorProgress = 0;
      }
    }
  };

  const handleSmoothTransitions = () => {
    let needsRedraw = false;
    letters.current.forEach(letter => {
      // Handle color transitions
      if (letter.colorProgress < 1) {
        letter.colorProgress += 0.05;
        if (letter.colorProgress > 1) letter.colorProgress = 1;

        const startRgb = hexToRgb(letter.color);
        const endRgb = hexToRgb(letter.targetColor);
        if (startRgb && endRgb) {
          letter.color = interpolateColor(startRgb, endRgb, letter.colorProgress);
          needsRedraw = true;
        }
      }
      
      // Handle position offset transitions (for hover glitch separation)
      if (letter.offsetProgress < 1) {
        letter.offsetProgress += 0.02; // Slower transition for smooth separation
        if (letter.offsetProgress > 1) letter.offsetProgress = 1;
        
        letter.offsetX = letter.offsetX + (letter.targetOffsetX - letter.offsetX) * 0.02;
        letter.offsetY = letter.offsetY + (letter.targetOffsetY - letter.offsetY) * 0.02;
        needsRedraw = true;
      } else if (!isHoverGlitch.current && !isGlitching.current) {
        // Ensure offsets return to zero when not in any glitch mode
        if (Math.abs(letter.offsetX) > 0.01 || Math.abs(letter.offsetY) > 0.01) {
          letter.offsetX = letter.offsetX * 0.95; // Gradually return to zero
          letter.offsetY = letter.offsetY * 0.95;
          needsRedraw = true;
        } else {
          letter.offsetX = 0;
          letter.offsetY = 0;
        }
      }
    });

    if (needsRedraw) {
      drawLetters();
    }
  };

  // Show hidden text easter egg - only these use special colors
  const showHiddenText = () => {
    if (!letters.current || letters.current.length === 0 || isGlitching.current) return;
    if (grid.current.columns === 0 || grid.current.rows === 0) return;
    
    const text = hiddenTexts.current[Math.floor(Math.random() * hiddenTexts.current.length)];
    const textLength = text.length;
    
    // Find a random position to place the text (ensure it fits)
    const maxCol = grid.current.columns - textLength;
    const maxRow = grid.current.rows - 1;
    
    if (maxCol < 0 || maxRow < 0) return; // Grid too small
    
    const startCol = Math.floor(Math.random() * maxCol);
    const startRow = Math.floor(Math.random() * maxRow);
    
    isShowingHiddenText.current = true;
    
    // Special bright colors ONLY for hidden text (not from palette)
    const specialColors = ['#00ff88', '#00d4ff', '#ffffff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800'];
    const highlightColor = specialColors[Math.floor(Math.random() * specialColors.length)];
    
    // Store active hidden text info for click detection
    const indices: number[] = [];
    
    // Place the text letters with special highlight colors
    for (let i = 0; i < textLength; i++) {
      const col = startCol + i;
      if (col >= grid.current.columns) break;
      
      const index = startRow * grid.current.columns + col;
      if (index < letters.current.length && letters.current[index]) {
        // Skip if already frozen
        if (letters.current[index].isFrozen) continue;
        
        indices.push(index);
        letters.current[index].char = text[i];
        letters.current[index].targetColor = highlightColor;
        letters.current[index].color = highlightColor; // Set immediately for visibility
        letters.current[index].colorProgress = 1;
      }
    }
    
    // Store active hidden text for click detection
    activeHiddenTextRef.current = {
      text,
      startCol,
      startRow,
      length: textLength,
      indices
    };
    
    drawLetters();
    
    // Keep the text visible for a moment, then gradually fade it back
    if (hiddenTextTimeoutRef.current) {
      clearTimeout(hiddenTextTimeoutRef.current);
    }
    
    // First, keep it bright for 2 seconds (more time to click)
    hiddenTextTimeoutRef.current = setTimeout(() => {
      // Only fade if not frozen
      if (activeHiddenTextRef.current) {
        const shouldFade = !activeHiddenTextRef.current.indices.some(idx => 
          letters.current[idx]?.isFrozen
        );
        
        if (shouldFade) {
          // Clear any existing fade interval
          if (hiddenTextFadeIntervalRef.current) {
            clearInterval(hiddenTextFadeIntervalRef.current);
          }
          
          // Then gradually fade and scramble
          let fadeStep = 0;
          hiddenTextFadeIntervalRef.current = setInterval(() => {
            fadeStep++;
            
            for (let i = 0; i < activeHiddenTextRef.current!.length; i++) {
              const col = activeHiddenTextRef.current!.startCol + i;
              if (col >= grid.current.columns) break;
              
              const index = activeHiddenTextRef.current!.startRow * grid.current.columns + col;
              if (index < letters.current.length && letters.current[index] && !letters.current[index].isFrozen) {
                if (fadeStep < 5) {
                  // Gradually change back to random
                  letters.current[index].char = getRandomChar();
                  letters.current[index].targetColor = getRandomColor(); // Back to palette color
                  letters.current[index].colorProgress = 0;
                } else {
                  // Fully scrambled
                  letters.current[index].char = getRandomChar();
                  letters.current[index].targetColor = getRandomColor(); // Back to palette color
                  letters.current[index].colorProgress = 1;
                }
              }
            }
            
            drawLetters();
            
            if (fadeStep >= 5) {
              if (hiddenTextFadeIntervalRef.current) {
                clearInterval(hiddenTextFadeIntervalRef.current);
                hiddenTextFadeIntervalRef.current = null;
              }
              isShowingHiddenText.current = false;
              activeHiddenTextRef.current = null;
            }
          }, 100);
        } else {
          // Some letters are frozen, keep the rest visible
          isShowingHiddenText.current = false;
          activeHiddenTextRef.current = null;
        }
      }
    }, 2000); // Show clearly for 2 seconds (more time to click)
  };
  
  // Freeze hidden text when clicked
  const freezeHiddenText = (x: number, y: number) => {
    if (!activeHiddenTextRef.current || !canvasRef.current) return false;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = x - rect.left;
    const clickY = y - rect.top;
    
    // Check if click is within the hidden text area
    const { startCol, startRow, length } = activeHiddenTextRef.current;
    const textStartX = startCol * charWidth;
    const textEndX = (startCol + length) * charWidth;
    const textY = startRow * charHeight;
    const textEndY = (startRow + 1) * charHeight;
    
    if (clickX >= textStartX && clickX <= textEndX && 
        clickY >= textY && clickY <= textEndY) {
      // Freeze all letters in this hidden text
      activeHiddenTextRef.current.indices.forEach(index => {
        if (letters.current[index] && !letters.current[index].isFrozen) {
          letters.current[index].isFrozen = true;
          letters.current[index].frozenText = activeHiddenTextRef.current!.text;
          // Keep the special color
        }
      });
      
      // Clear the active hidden text so it doesn't fade
      activeHiddenTextRef.current = null;
      isShowingHiddenText.current = false;
      
      if (hiddenTextTimeoutRef.current) {
        clearTimeout(hiddenTextTimeoutRef.current);
        hiddenTextTimeoutRef.current = null;
      }
      if (hiddenTextFadeIntervalRef.current) {
        clearInterval(hiddenTextFadeIntervalRef.current);
        hiddenTextFadeIntervalRef.current = null;
      }
      
      drawLetters();
      return true;
    }
    
    return false;
  };
  
  // Randomly show hidden text easter eggs
  const scheduleHiddenText = () => {
    if (isGlitching.current || isShowingHiddenText.current) {
      // Reschedule if currently glitching
      setTimeout(scheduleHiddenText, 5000);
      return;
    }
    
    // Random delay between 8-15 seconds
    const delay = 8000 + Math.random() * 7000;
    
    if (hiddenTextTimeoutRef.current) {
      clearTimeout(hiddenTextTimeoutRef.current);
    }
    
    hiddenTextTimeoutRef.current = setTimeout(() => {
      showHiddenText();
      scheduleHiddenText(); // Schedule next one
    }, delay);
  };

  const animate = () => {
    const now = Date.now();
    const currentSpeed = isGlitching.current ? 10 : (isHoverGlitch.current ? 200 : glitchSpeed);
    
    // Only update letters if not in hover glitch mode (hover glitch has its own interval)
    if (!isHoverGlitch.current && now - lastGlitchTime.current >= currentSpeed) {
      updateLetters();
      drawLetters();
      lastGlitchTime.current = now;
    }

    if (smooth) {
      handleSmoothTransitions();
    }
    
    // Always redraw for vortex effect and smooth transitions
    drawLetters();

    animationRef.current = requestAnimationFrame(animate);
  };

  // Hover glitch effect - slower, gradual separation
  const triggerHoverGlitch = (colors?: string[], duration: number = 800) => {
    if (!letters.current || letters.current.length === 0) return;
    
    // Cancel any existing hover glitch
    if (hoverGlitchTimeoutRef.current) {
      clearTimeout(hoverGlitchTimeoutRef.current);
    }
    
    isHoverGlitch.current = true;
    const glitchColorsToUse = colors || originalGlitchColors.current;
    
    // Gradually separate letters and change colors slowly
    letters.current.forEach((letter, index) => {
      // Skip frozen letters - they stay as hidden text
      if (letter.isFrozen) return;
      
      // Calculate random separation direction (outward from center)
      const angle = Math.random() * Math.PI * 2;
      const separationDistance = 2 + Math.random() * 4; // 2-6 character widths
      
      letter.targetOffsetX = Math.cos(angle) * separationDistance * charWidth;
      letter.targetOffsetY = Math.sin(angle) * separationDistance * charHeight;
      letter.offsetProgress = 0; // Start transition
      
      // Slowly change color (use palette colors)
      letter.targetColor = glitchColorsToUse[Math.floor(Math.random() * glitchColorsToUse.length)];
      letter.colorProgress = 0;
      
      // Occasionally change character (slower than intense glitch)
      if (Math.random() < 0.1) { // Only 10% chance per letter
        letter.char = getRandomChar();
      }
    });
    
    drawLetters();
    
    // Continue slow updates during hover
    const hoverInterval = setInterval(() => {
      if (!isHoverGlitch.current) {
        clearInterval(hoverInterval);
        return;
      }
      
      // Slowly update random letters
      const updateCount = Math.max(1, Math.floor(letters.current.length * 0.02)); // Only 2% per update
      for (let i = 0; i < updateCount; i++) {
        const index = Math.floor(Math.random() * letters.current.length);
        if (letters.current[index] && !letters.current[index].isFrozen) {
          // Gradually increase separation
          const currentDist = Math.sqrt(
            letters.current[index].offsetX ** 2 + 
            letters.current[index].offsetY ** 2
          );
          if (currentDist < 8) { // Max separation
            const angle = Math.random() * Math.PI * 2;
            letters.current[index].targetOffsetX = Math.cos(angle) * (currentDist + 0.5) * charWidth;
            letters.current[index].targetOffsetY = Math.sin(angle) * (currentDist + 0.5) * charHeight;
            letters.current[index].offsetProgress = 0;
          }
          
          // Slowly change color (use palette colors)
          if (Math.random() < 0.3) {
            letters.current[index].targetColor = glitchColorsToUse[Math.floor(Math.random() * glitchColorsToUse.length)];
            letters.current[index].colorProgress = 0;
          }
        }
      }
      drawLetters();
    }, 150); // Slower updates (150ms vs 20ms)
    
    // Store interval reference for cleanup
    glitchIntervalRef.current = hoverInterval as any;
    
    // Auto-stop after duration (but can be stopped earlier)
    hoverGlitchTimeoutRef.current = setTimeout(() => {
      stopHoverGlitch();
    }, duration);
  };
  
  // Stop hover glitch and return letters to normal
  const stopHoverGlitch = () => {
    isHoverGlitch.current = false;
    
    if (hoverGlitchTimeoutRef.current) {
      clearTimeout(hoverGlitchTimeoutRef.current);
      hoverGlitchTimeoutRef.current = null;
    }
    
    if (glitchIntervalRef.current) {
      clearInterval(glitchIntervalRef.current);
      glitchIntervalRef.current = null;
    }
    
    // Gradually return letters to original positions
    letters.current.forEach((letter) => {
      letter.targetOffsetX = 0;
      letter.targetOffsetY = 0;
      letter.offsetProgress = 0;
      
      // Return colors to normal glitch colors
      letter.targetColor = getRandomColor();
      letter.colorProgress = 0;
    });
    
    drawLetters();
  };

  // Intense glitch effect - scrambles all letters rapidly
  const triggerIntenseGlitch = (colors?: string[], duration: number = 300) => {
    if (!letters.current || letters.current.length === 0) return;
    
    // Stop hover glitch first
    stopHoverGlitch();
    
    // Cancel any hidden text display during glitch
    if (hiddenTextTimeoutRef.current) {
      clearTimeout(hiddenTextTimeoutRef.current);
      hiddenTextTimeoutRef.current = null;
    }
    if (hiddenTextFadeIntervalRef.current) {
      clearInterval(hiddenTextFadeIntervalRef.current);
      hiddenTextFadeIntervalRef.current = null;
    }
    isShowingHiddenText.current = false;
    
    const glitchColorsToUse = colors || originalGlitchColors.current;
    isGlitching.current = true;
    
    // Store original colors if first time
    if (originalGlitchColors.current.length === 0 || 
        JSON.stringify(originalGlitchColors.current) === JSON.stringify(['#2b4539', '#61dca3', '#61b3dc'])) {
      originalGlitchColors.current = [...glitchColors];
    }
    
    // Scramble ALL letters immediately (except frozen ones)
    letters.current.forEach((letter, index) => {
      // Skip frozen letters - they stay as hidden text
      if (letter.isFrozen) return;
      
      letter.char = getRandomChar();
      letter.targetColor = glitchColorsToUse[Math.floor(Math.random() * glitchColorsToUse.length)];
      if (!smooth) {
        letter.color = letter.targetColor;
        letter.colorProgress = 1;
      } else {
        letter.colorProgress = 0;
      }
    });
    
    drawLetters();
    
    // Clear any existing interval
    if (glitchIntervalRef.current) {
      clearInterval(glitchIntervalRef.current);
    }
    
    // Rapid updates during glitch
    glitchIntervalRef.current = setInterval(() => {
      // Scramble random letters
      const scrambleCount = Math.floor(letters.current.length * 0.3);
      for (let i = 0; i < scrambleCount; i++) {
        const index = Math.floor(Math.random() * letters.current.length);
        if (letters.current[index]) {
          letters.current[index].char = getRandomChar();
          letters.current[index].targetColor = glitchColorsToUse[Math.floor(Math.random() * glitchColorsToUse.length)];
          letters.current[index].colorProgress = 0;
        }
      }
      drawLetters();
    }, 20); // Very fast updates
    
    // Reset after duration
    if (glitchTimeoutRef.current) {
      clearTimeout(glitchTimeoutRef.current);
    }
    
    glitchTimeoutRef.current = setTimeout(() => {
      if (glitchIntervalRef.current) {
        clearInterval(glitchIntervalRef.current);
        glitchIntervalRef.current = null;
      }
      isGlitching.current = false;
      
      // Reset offsets to ensure clean return to normal
      letters.current.forEach((letter) => {
        letter.targetOffsetX = 0;
        letter.targetOffsetY = 0;
        letter.offsetProgress = 0;
        // Return to normal glitch colors
        letter.targetColor = getRandomColor();
        letter.colorProgress = 0;
      });
      
      // Reorganize letters back to normal pattern
      reorganizeLetters();
      
      // Reschedule hidden text after glitch completes
      setTimeout(() => {
        scheduleHiddenText();
      }, 2000);
    }, duration);
  };

  // Scramble all letters at once
  const scrambleAll = (colors?: string[]) => {
    if (!letters.current || letters.current.length === 0) return;
    
    const glitchColorsToUse = colors || originalGlitchColors.current;
    
    letters.current.forEach((letter) => {
      // Skip frozen letters - they stay as hidden text
      if (letter.isFrozen) return;
      
      letter.char = getRandomChar();
      letter.targetColor = glitchColorsToUse[Math.floor(Math.random() * glitchColorsToUse.length)];
      letter.colorProgress = 0;
    });
    
    drawLetters();
  };

  // Reorganize letters back to a more organized pattern
  const reorganizeLetters = () => {
    if (!letters.current || letters.current.length === 0) return;
    
    // Gradually reorganize - create a wave effect
    const totalLetters = letters.current.length;
    const reorganizeInBatches = (batchIndex: number) => {
      const batchSize = Math.ceil(totalLetters / 10);
      const start = batchIndex * batchSize;
      const end = Math.min(start + batchSize, totalLetters);
      
      for (let i = start; i < end; i++) {
        if (letters.current[i]) {
          // Use more organized characters
          const organizedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          letters.current[i].char = organizedChars[Math.floor(Math.random() * organizedChars.length)];
          letters.current[i].targetColor = originalGlitchColors.current[Math.floor(Math.random() * originalGlitchColors.current.length)];
          letters.current[i].colorProgress = 0;
        }
      }
      
      drawLetters();
      
      if (end < totalLetters) {
        setTimeout(() => reorganizeInBatches(batchIndex + 1), 30);
      }
    };
    
    reorganizeInBatches(0);
  };

  // Reset to normal glitch behavior
  const resetToNormal = () => {
    stopHoverGlitch();
    
    if (glitchTimeoutRef.current) {
      clearTimeout(glitchTimeoutRef.current);
      glitchTimeoutRef.current = null;
    }
    if (glitchIntervalRef.current) {
      clearInterval(glitchIntervalRef.current);
      glitchIntervalRef.current = null;
    }
    isGlitching.current = false;
    
    // Reset all letters to normal state
    letters.current.forEach((letter) => {
      letter.offsetX = 0;
      letter.offsetY = 0;
      letter.targetOffsetX = 0;
      letter.targetOffsetY = 0;
      letter.offsetProgress = 1;
      letter.targetColor = getRandomColor();
      letter.colorProgress = 0;
    });
    
    reorganizeLetters();
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    triggerIntenseGlitch,
    triggerHoverGlitch,
    stopHoverGlitch,
    scrambleAll,
    resetToNormal
  }));

  // Update original colors when glitchColors prop changes
  useEffect(() => {
    originalGlitchColors.current = [...glitchColors];
    originalGlitchSpeed.current = glitchSpeed;
  }, [glitchColors, glitchSpeed]);

  // Update letter colors when glitchColors prop changes
  useEffect(() => {
    if (letters.current.length > 0 && glitchColors.length > 0 && !isGlitching.current) {
      const getRandomColorFromPalette = () => {
        return glitchColors[Math.floor(Math.random() * glitchColors.length)];
      };
      
      letters.current.forEach(letter => {
        letter.color = getRandomColorFromPalette();
        letter.targetColor = getRandomColorFromPalette();
        letter.colorProgress = smooth ? 0 : 1;
      });
      // Force redraw to show new colors
      if (context.current) {
        drawLetters();
      }
    }
  }, [glitchColors, smooth]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    context.current = canvas.getContext('2d');
    resizeCanvas();
    animate();
    
    // Start showing hidden text easter eggs after initial delay
    setTimeout(() => {
      scheduleHiddenText();
    }, 3000);
    
    // Handle clicks on canvas to freeze hidden text
    const handleCanvasClick = (e: MouseEvent) => {
      if (freezeHiddenText(e.clientX, e.clientY)) {
        // Successfully froze text, schedule next one
        setTimeout(() => {
          scheduleHiddenText();
        }, 3000);
      }
    };
    
    canvas.addEventListener('click', handleCanvasClick);

    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        resizeCanvas();
        animate();
        // Reschedule hidden text after resize
        if (hiddenTextTimeoutRef.current) {
          clearTimeout(hiddenTextTimeoutRef.current);
        }
        setTimeout(() => {
          scheduleHiddenText();
        }, 2000);
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (glitchIntervalRef.current) {
        clearInterval(glitchIntervalRef.current);
        glitchIntervalRef.current = null;
      }
      if (glitchTimeoutRef.current) {
        clearTimeout(glitchTimeoutRef.current);
        glitchTimeoutRef.current = null;
      }
      if (hiddenTextTimeoutRef.current) {
        clearTimeout(hiddenTextTimeoutRef.current);
        hiddenTextTimeoutRef.current = null;
      }
      if (hiddenTextFadeIntervalRef.current) {
        clearInterval(hiddenTextFadeIntervalRef.current);
        hiddenTextFadeIntervalRef.current = null;
      }
      if (hoverGlitchTimeoutRef.current) {
        clearTimeout(hoverGlitchTimeoutRef.current);
        hoverGlitchTimeoutRef.current = null;
      }
      if (canvas) {
        canvas.removeEventListener('click', handleCanvasClick);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [glitchSpeed, smooth]);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    overflow: 'hidden',
    ...style
  };

  const canvasStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    height: '100%'
  };

  const outerVignetteStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    background: 'radial-gradient(circle, rgba(0,0,0,0) 75%, rgba(0,0,0,0.6) 100%)'
  };

  const centerVignetteStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    background: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 8%, rgba(0,0,0,0.85) 15%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0) 60%)',
    animation: 'vortexPulse 4s ease-in-out infinite',
    willChange: 'opacity, transform'
  } as React.CSSProperties;

  return (
    <div style={containerStyle} className={className}>
      <canvas ref={canvasRef} style={canvasStyle} />
      {outerVignette && <div style={outerVignetteStyle}></div>}
      {centerVignette && <div style={centerVignetteStyle}></div>}
    </div>
  );
});

LetterGlitch.displayName = 'LetterGlitch';

export default LetterGlitch;

