/**
 * KillFeed Component
 * Shows recent kills and major game events
 */

import { useEffect, useState } from 'react';
import './KillFeed.css';

const killFeed = [];
const MAX_FEED_ITEMS = 5;
const FEED_LIFETIME = 5000; // 5 seconds

export function addKillFeedEntry(killerName, victimName, weaponName = 'MISSILE') {
  const entry = {
    id: Date.now() + Math.random(),
    killerName,
    victimName,
    weaponName,
    timestamp: Date.now()
  };
  
  killFeed.push(entry);
  
  // Keep only recent entries
  if (killFeed.length > MAX_FEED_ITEMS) {
    killFeed.shift();
  }
  
  // Trigger update
  window.dispatchEvent(new CustomEvent('killFeedUpdate'));
  
  // Auto-remove after lifetime
  setTimeout(() => {
    const index = killFeed.findIndex(e => e.id === entry.id);
    if (index !== -1) {
      killFeed.splice(index, 1);
      window.dispatchEvent(new CustomEvent('killFeedUpdate'));
    }
  }, FEED_LIFETIME);
}

export function KillFeed() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const updateFeed = () => {
      setEntries([...killFeed]);
    };

    window.addEventListener('killFeedUpdate', updateFeed);
    return () => window.removeEventListener('killFeedUpdate', updateFeed);
  }, []);

  return (
    <div className="kill-feed">
      {entries.map(entry => (
        <div key={entry.id} className="kill-feed-entry">
          <span className="kill-feed-killer">{entry.killerName}</span>
          <span className="kill-feed-weapon">{entry.weaponName}</span>
          <span className="kill-feed-victim">{entry.victimName}</span>
        </div>
      ))}
    </div>
  );
}



