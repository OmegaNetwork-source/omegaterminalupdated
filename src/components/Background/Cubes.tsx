"use client";

import React, { useCallback, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import gsap from 'gsap';
import styles from './Cubes.module.css';

interface Gap {
  row: number;
  col: number;
}

interface Duration {
  enter: number;
  leave: number;
}

export interface CubesProps {
  gridSize?: number;
  cubeSize?: number;
  maxAngle?: number;
  radius?: number;
  easing?: gsap.EaseString;
  duration?: Duration;
  cellGap?: number | Gap;
  borderStyle?: string;
  faceColor?: string;
  shadow?: boolean | string;
  autoAnimate?: boolean;
  rippleOnClick?: boolean;
  rippleColor?: string;
  rippleSpeed?: number;
  className?: string;
  style?: React.CSSProperties;
}

export interface CubesRef {
  pulse: (options?: { intensity?: number; duration?: number; origin?: { row: number; col: number } }) => void;
}

const Cubes = forwardRef<CubesRef, CubesProps>(({
  gridSize = 8,
  cubeSize,
  maxAngle = 25,
  radius = 2.5,
  easing = 'power3.out',
  duration = { enter: 0.3, leave: 0.6 },
  cellGap,
  borderStyle,
  faceColor,
  shadow = false,
  autoAnimate = true,
  rippleOnClick = true,
  rippleColor,
  rippleSpeed = 2,
  className = '',
  style = {}
}, ref) => {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userActiveRef = useRef(false);
  const simPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const simTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const simRAFRef = useRef<number | null>(null);
  const pulseAnimationRef = useRef<gsap.core.Timeline | null>(null);

  const colGap =
    typeof cellGap === 'number'
      ? `${cellGap}px`
      : (cellGap as Gap)?.col !== undefined
        ? `${(cellGap as Gap).col}px`
        : '4%';

  const rowGap =
    typeof cellGap === 'number'
      ? `${cellGap}px`
      : (cellGap as Gap)?.row !== undefined
        ? `${(cellGap as Gap).row}px`
        : '4%';

  const enterDur = duration.enter;
  const leaveDur = duration.leave;

  const tiltAt = useCallback(
    (rowCenter: number, colCenter: number) => {
      if (!sceneRef.current) return;

      sceneRef.current.querySelectorAll<HTMLDivElement>(`.${styles.cube}`).forEach(cube => {
        const r = +cube.dataset.row!;
        const c = +cube.dataset.col!;
        const dist = Math.hypot(r - rowCenter, c - colCenter);
        if (dist <= radius) {
          const pct = 1 - dist / radius;
          const angle = pct * maxAngle;
          gsap.to(cube, {
            duration: enterDur,
            ease: easing,
            overwrite: true,
            rotateX: -angle,
            rotateY: angle
          });
        } else {
          gsap.to(cube, {
            duration: leaveDur,
            ease: 'power3.out',
            overwrite: true,
            rotateX: 0,
            rotateY: 0
          });
        }
      });
    },
    [radius, maxAngle, enterDur, leaveDur, easing, styles.cube]
  );

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      userActiveRef.current = true;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

      if (!sceneRef.current) return;
      const rect = sceneRef.current.getBoundingClientRect();
      const cellW = rect.width / gridSize;
      const cellH = rect.height / gridSize;
      const colCenter = (e.clientX - rect.left) / cellW;
      const rowCenter = (e.clientY - rect.top) / cellH;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => tiltAt(rowCenter, colCenter));

      idleTimerRef.current = setTimeout(() => {
        userActiveRef.current = false;
      }, 3000);
    },
    [gridSize, tiltAt]
  );

  const resetAll = useCallback(() => {
    if (!sceneRef.current) return;
    sceneRef.current.querySelectorAll<HTMLDivElement>(`.${styles.cube}`).forEach(cube =>
      gsap.to(cube, {
        duration: leaveDur,
        rotateX: 0,
        rotateY: 0,
        ease: 'power3.out'
      })
    );
  }, [leaveDur, styles.cube]);

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      e.preventDefault();
      userActiveRef.current = true;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

      if (!sceneRef.current) return;
      const rect = sceneRef.current.getBoundingClientRect();
      const cellW = rect.width / gridSize;
      const cellH = rect.height / gridSize;

      const touch = e.touches[0];
      if (!touch) return;
      const colCenter = (touch.clientX - rect.left) / cellW;
      const rowCenter = (touch.clientY - rect.top) / cellH;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => tiltAt(rowCenter, colCenter));

      idleTimerRef.current = setTimeout(() => {
        userActiveRef.current = false;
      }, 3000);
    },
    [gridSize, tiltAt]
  );

  const onTouchStart = useCallback(() => {
    userActiveRef.current = true;
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!sceneRef.current) return;
    resetAll();
  }, [resetAll]);

  // Pulse animation - triggered when new components enter the panel
  const pulse = useCallback((
    options?: { 
      intensity?: number; 
      duration?: number; 
      origin?: { row: number; col: number } 
    }
  ) => {
    if (!sceneRef.current) return;

    const intensity = options?.intensity ?? 1.0;
    const pulseDuration = options?.duration ?? 0.8;
    const originRow = options?.origin?.row ?? gridSize / 2;
    const originCol = options?.origin?.col ?? gridSize / 2;

    // Cancel any existing pulse animation
    if (pulseAnimationRef.current) {
      pulseAnimationRef.current.kill();
    }

    const cubes = sceneRef.current.querySelectorAll<HTMLDivElement>(`.${styles.cube}`);
    const faces = Array.from(cubes).flatMap(cube => 
      Array.from(cube.querySelectorAll<HTMLElement>(`.${styles.cubeFace}`))
    );

    // Create a timeline for the pulse animation
    const tl = gsap.timeline();
    pulseAnimationRef.current = tl;

    // Calculate distance from origin for each cube
    const cubeData = Array.from(cubes).map(cube => {
      const r = +cube.dataset.row!;
      const c = +cube.dataset.col!;
      const dist = Math.hypot(r - originRow, c - originCol);
      const maxDist = Math.hypot(gridSize, gridSize);
      const normalizedDist = dist / maxDist;
      return { cube, faces: Array.from(cube.querySelectorAll<HTMLElement>(`.${styles.cubeFace}`)), dist, normalizedDist };
    });

    // Sort by distance for wave effect
    cubeData.sort((a, b) => a.dist - b.dist);

    // Create wave animation
    cubeData.forEach(({ cube, faces: cubeFaces, normalizedDist }) => {
      const delay = normalizedDist * (pulseDuration * 0.4);
      const scale = 1 + (intensity * 0.2 * (1 - normalizedDist));
      const glowIntensity = intensity * (1 - normalizedDist * 0.7);
      const pulseColor = rippleColor || 'var(--palette-primary, #00bcf2)';

      // Animate scale using GSAP's transform (handles 3D properly)
      tl.to(cube, {
        scale: scale,
        duration: pulseDuration * 0.3,
        delay: delay,
        ease: 'power2.out',
        transformOrigin: '50% 50% 50%'
      }, 0);

      // Color pulse on faces with opacity for smoother transition
      tl.to(cubeFaces, {
        backgroundColor: pulseColor,
        opacity: 0.9 + (glowIntensity * 0.1),
        duration: pulseDuration * 0.2,
        delay: delay,
        ease: 'power2.out'
      }, 0);

      // Add border glow effect
      tl.to(cubeFaces, {
        borderColor: pulseColor,
        borderWidth: `${1 + glowIntensity * 2}px`,
        duration: pulseDuration * 0.2,
        delay: delay,
        ease: 'power2.out'
      }, 0);

      // Return to normal
      tl.to(cube, {
        scale: 1,
        duration: pulseDuration * 0.5,
        delay: delay + pulseDuration * 0.3,
        ease: 'power2.inOut'
      }, 0);

      tl.to(cubeFaces, {
        backgroundColor: faceColor || 'var(--cube-face-bg, rgba(6, 0, 16, 0.4))',
        opacity: 1,
        borderColor: 'var(--palette-border, rgba(0, 188, 242, 0.2))',
        borderWidth: '1px',
        duration: pulseDuration * 0.5,
        delay: delay + pulseDuration * 0.3,
        ease: 'power2.inOut'
      }, 0);
    });

    // Clean up timeline reference when animation completes
    tl.eventCallback('onComplete', () => {
      pulseAnimationRef.current = null;
    });
  }, [gridSize, faceColor, rippleColor, styles.cube, styles.cubeFace]);

  // Expose pulse method via ref
  useImperativeHandle(ref, () => ({
    pulse
  }), [pulse]);

  const onClick = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!rippleOnClick || !sceneRef.current) return;

      // Check if click target is interactive content (buttons, inputs, links, etc.)
      // Only prevent ripple on actual interactive elements, not background areas
      const target = e.target as HTMLElement;
      if (target) {
        // Check if clicking on interactive elements
        const isInteractive = target.closest('button, a, input, select, textarea, [role="button"], [tabindex]');
        // Check if clicking on actual panel content (not just background)
        const isPanelContent = target.closest('[class*="card"], [class*="chartContainer"], [class*="mediaPanel"], [class*="articleCard"]');
        
        // Only prevent ripple if clicking on interactive elements or actual content
        // Allow ripple on background areas and empty spaces
        if (isInteractive || isPanelContent) {
        return;
        }
      }

      const rect = sceneRef.current.getBoundingClientRect();
      const cellW = rect.width / gridSize;
      const cellH = rect.height / gridSize;

      let clientX: number | undefined;
      let clientY: number | undefined;

      if (e instanceof MouseEvent) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else if (e instanceof TouchEvent && e.touches && e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }

      if (clientX === undefined || clientY === undefined) return;

      const colHit = Math.floor((clientX - rect.left) / cellW);
      const rowHit = Math.floor((clientY - rect.top) / cellH);

      const baseRingDelay = 0.15;
      const baseAnimDur = 0.3;
      const baseHold = 0.6;

      const spreadDelay = baseRingDelay / rippleSpeed;
      const animDuration = baseAnimDur / rippleSpeed;
      const holdTime = baseHold / rippleSpeed;

      const rings: Record<number, HTMLDivElement[]> = {};

      sceneRef.current.querySelectorAll<HTMLDivElement>(`.${styles.cube}`).forEach(cube => {
        const r = +cube.dataset.row!;
        const c = +cube.dataset.col!;
        const dist = Math.hypot(r - rowHit, c - colHit);
        const ring = Math.round(dist);

        if (!rings[ring]) {
          rings[ring] = [];
        }
        const ringArray = rings[ring];
        if (ringArray) {
          ringArray.push(cube);
        }
      });

      Object.keys(rings)
        .map(Number)
        .sort((a, b) => a - b)
        .forEach(ring => {
          const ringArray = rings[ring];
          if (!ringArray) return;
          
          const delay = ring * spreadDelay;
          const faces = ringArray.flatMap(cube => 
            Array.from(cube.querySelectorAll<HTMLElement>(`.${styles.cubeFace}`))
          );

          gsap.to(faces, {
            backgroundColor: rippleColor || 'var(--palette-primary, #00bcf2)',
            duration: animDuration,
            delay,
            ease: 'power3.out'
          });

          gsap.to(faces, {
            backgroundColor: faceColor || 'var(--cube-face-bg, rgba(6, 0, 16, 0.4))',
            duration: animDuration,
            delay: delay + animDuration + holdTime,
            ease: 'power3.out'
          });
        });
    },
    [rippleOnClick, gridSize, faceColor, rippleColor, rippleSpeed, styles.cube, styles.cubeFace]
  );

  useEffect(() => {
    if (!autoAnimate || !sceneRef.current) return;

    simPosRef.current = {
      x: Math.random() * gridSize,
      y: Math.random() * gridSize
    };
    simTargetRef.current = {
      x: Math.random() * gridSize,
      y: Math.random() * gridSize
    };

    const speed = 0.02;
    const loop = () => {
      if (!userActiveRef.current) {
        const pos = simPosRef.current;
        const tgt = simTargetRef.current;
        pos.x += (tgt.x - pos.x) * speed;
        pos.y += (tgt.y - pos.y) * speed;
        tiltAt(pos.y, pos.x);
        if (Math.hypot(pos.x - tgt.x, pos.y - tgt.y) < 0.1) {
          simTargetRef.current = {
            x: Math.random() * gridSize,
            y: Math.random() * gridSize
          };
        }
      }
      simRAFRef.current = requestAnimationFrame(loop);
    };

    simRAFRef.current = requestAnimationFrame(loop);

    return () => {
      if (simRAFRef.current != null) {
        cancelAnimationFrame(simRAFRef.current);
      }
    };
  }, [autoAnimate, gridSize, tiltAt]);

  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;

    el.addEventListener('pointermove', onPointerMove, { passive: true });
    el.addEventListener('pointerleave', resetAll);
    el.addEventListener('click', onClick);

    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerleave', resetAll);
      el.removeEventListener('click', onClick);

      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);

      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [onPointerMove, resetAll, onClick, onTouchMove, onTouchStart, onTouchEnd]);

  const cells = Array.from({ length: gridSize });
  const sceneStyle: React.CSSProperties = {
    gridTemplateColumns: cubeSize ? `repeat(${gridSize}, ${cubeSize}px)` : `repeat(${gridSize}, 1fr)`,
    gridTemplateRows: cubeSize ? `repeat(${gridSize}, ${cubeSize}px)` : `repeat(${gridSize}, 1fr)`,
    columnGap: colGap,
    rowGap: rowGap,
    ...style
  };

  const wrapperStyle: React.CSSProperties & {
    '--cube-face-border'?: string;
    '--cube-face-bg'?: string;
    '--cube-face-shadow'?: string;
  } = {
    '--cube-face-border': borderStyle || '1px solid var(--palette-border, rgba(0, 188, 242, 0.2))',
    '--cube-face-bg': faceColor || 'var(--palette-surface, rgba(6, 0, 16, 0.4))',
    '--cube-face-shadow': shadow === true 
      ? '0 0 6px rgba(0,0,0,.5)' 
      : shadow || 'none',
    ...(cubeSize
      ? {
          width: `${gridSize * cubeSize}px`,
          height: `${gridSize * cubeSize}px`
        }
      : {})
  };

  return (
    <div className={`${styles.cubesWrapper} ${className}`} style={wrapperStyle}>
      <div ref={sceneRef} className={styles.cubesScene} style={sceneStyle}>
        {cells.map((_, r) =>
          cells.map((__, c) => (
            <div key={`${r}-${c}`} className={styles.cube} data-row={r} data-col={c}>
              <div className={`${styles.cubeFace} ${styles.cubeFaceTop}`} />
              <div className={`${styles.cubeFace} ${styles.cubeFaceBottom}`} />
              <div className={`${styles.cubeFace} ${styles.cubeFaceLeft}`} />
              <div className={`${styles.cubeFace} ${styles.cubeFaceRight}`} />
              <div className={`${styles.cubeFace} ${styles.cubeFaceFront}`} />
              <div className={`${styles.cubeFace} ${styles.cubeFaceBack}`} />
            </div>
          ))
        )}
      </div>
    </div>
  );
});

Cubes.displayName = 'Cubes';

export default Cubes;

