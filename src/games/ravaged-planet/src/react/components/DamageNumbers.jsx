/**
 * DamageNumbers Component
 * Displays animated floating damage numbers when players take damage
 */

import { useEffect, useState } from 'react';
import './DamageNumbers.css';

const damageNumbers = [];

export function addDamageNumber(x, y, damage, color = '#ff0000', isKill = false) {
  const id = Date.now() + Math.random();
  damageNumbers.push({
    id,
    x,
    y,
    damage: Math.round(damage),
    color,
    isKill,
    opacity: 1,
    scale: isKill ? 1.5 : 1,
    lifetime: 0,
    maxLifetime: isKill ? 100 : 60
  });
  
  // Trigger re-render if component is mounted
  window.dispatchEvent(new CustomEvent('damageNumberAdded'));
}

export function DamageNumbers() {
  const [numbers, setNumbers] = useState([]);

  useEffect(() => {
    const updateNumbers = () => {
      const updated = damageNumbers.map(num => ({
        ...num,
        lifetime: num.lifetime + 1,
        y: num.y - 0.5, // Float upward
        opacity: Math.max(0, 1 - (num.lifetime / num.maxLifetime)),
        scale: num.isKill 
          ? 1.5 + Math.sin(num.lifetime * 0.2) * 0.2 
          : 1 + Math.sin(num.lifetime * 0.3) * 0.1
      })).filter(num => num.lifetime < num.maxLifetime);
      
      setNumbers(updated);
      
      // Clean up old numbers from global array
      damageNumbers.length = 0;
      damageNumbers.push(...updated);
    };

    const interval = setInterval(updateNumbers, 16); // ~60fps
    const handler = () => updateNumbers();
    window.addEventListener('damageNumberAdded', handler);

    return () => {
      clearInterval(interval);
      window.removeEventListener('damageNumberAdded', handler);
    };
  }, []);

  return (
    <div className="damage-numbers-container">
      {numbers.map(num => (
        <div
          key={num.id}
          className={`damage-number ${num.isKill ? 'kill' : ''}`}
          style={{
            left: `${num.x}px`,
            top: `${num.y}px`,
            color: num.color,
            opacity: num.opacity,
            transform: `translate(-50%, -50%) scale(${num.scale})`,
            textShadow: `0 0 10px ${num.color}, 0 0 20px ${num.color}`,
          }}
        >
          {num.isKill ? `💀 KILL +100` : `-${num.damage}`}
        </div>
      ))}
    </div>
  );
}



