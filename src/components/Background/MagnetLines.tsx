"use client";

import React, { useRef, useEffect, CSSProperties } from 'react';
import styles from './MagnetLines.module.css';

interface MagnetLinesProps {
  rows?: number;
  columns?: number;
  lineColor?: string;
  lineWidth?: string;
  lineHeight?: string;
  baseAngle?: number;
  className?: string;
  style?: CSSProperties;
}

const MagnetLines: React.FC<MagnetLinesProps> = ({
  rows = 12,
  columns = 8,
  lineColor,
  lineWidth = '2px',
  lineHeight = '40px',
  baseAngle = -10,
  className = '',
  style = {}
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll<HTMLSpanElement>('span');
    const parentPanel = container.closest('[class*="statsPanel"]') as HTMLElement;

    const onPointerMove = (pointer: { x: number; y: number }) => {
      items.forEach(item => {
        const rect = item.getBoundingClientRect();
        const centerX = rect.x + rect.width / 2;
        const centerY = rect.y + rect.height / 2;

        const b = pointer.x - centerX;
        const a = pointer.y - centerY;
        const c = Math.sqrt(a * a + b * b) || 1;
        const r = ((Math.acos(b / c) * 180) / Math.PI) * (pointer.y > centerY ? 1 : -1);

        item.style.setProperty('--rotate', `${r}deg`);
      });
    };

    const handlePointerMove = (e: PointerEvent) => {
      // Only update if pointer is within the panel
      if (parentPanel) {
        const panelRect = parentPanel.getBoundingClientRect();
        if (
          e.x >= panelRect.left &&
          e.x <= panelRect.right &&
          e.y >= panelRect.top &&
          e.y <= panelRect.bottom
        ) {
          onPointerMove({ x: e.x, y: e.y });
        }
      } else {
        onPointerMove({ x: e.x, y: e.y });
      }
    };

    // Listen to pointer events on window but filter by panel bounds
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // Initialize with center position
    if (items.length && container) {
      const containerRect = container.getBoundingClientRect();
      onPointerMove({ 
        x: containerRect.left + containerRect.width / 2, 
        y: containerRect.top + containerRect.height / 2 
      });
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  const total = rows * columns;
  const spans = Array.from({ length: total }, (_, i) => (
    <span
      key={i}
      style={
        {
          '--rotate': `${baseAngle}deg`,
          width: lineWidth,
          height: lineHeight
        } as CSSProperties
      }
    />
  ));

  return (
    <div
      ref={containerRef}
      className={`${styles.magnetLinesContainer} ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        '--line-color': lineColor,
        ...style
      } as CSSProperties}
    >
      {spans}
    </div>
  );
};

export default MagnetLines;

