/**
 * Weapon Draft Component
 * Card-based weapon selection before battle
 */

import { useState, useEffect } from 'react';
import { 
  getDraftSession, 
  initDraftSession, 
  RARITY_COLORS,
  WEAPON_RARITIES 
} from '../../engine/weaponDraft.js';
import './WeaponDraft.css';

export function WeaponDraft({ playerCount, onDraftComplete }) {
  const [session, setSession] = useState(null);
  const [currentPack, setCurrentPack] = useState(null);
  const [currentDrafter, setCurrentDrafter] = useState(0);
  const [progress, setProgress] = useState(null);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [draftHistory, setDraftHistory] = useState([]);
  const [autoPickAI, setAutoPickAI] = useState(true);

  // Initialize draft session
  useEffect(() => {
    console.log('[WeaponDraft] Initializing draft for', playerCount, 'players');
    const newSession = initDraftSession(playerCount);
    
    // Set AI personalities
    const personalities = ['balanced', 'aggressive', 'defensive', 'tactical', 'balanced', 'aggressive'];
    for (let i = 1; i < playerCount; i++) {
      newSession.setAIPersonality(i, personalities[i % personalities.length]);
    }
    
    setSession(newSession);
    updateDraftState(newSession);
  }, [playerCount]);

  // Auto-pick for AI players
  useEffect(() => {
    if (!session || !autoPickAI || session.draftComplete) return;
    
    const drafter = session.getCurrentDrafter();
    
    // If it's an AI player (not player 0), auto-pick after delay
    if (drafter !== 0) {
      const timeout = setTimeout(() => {
        console.log(`[WeaponDraft] AI Player ${drafter + 1} auto-picking...`);
        const success = session.aiDraft(drafter);
        
        if (success) {
          updateDraftState(session);
          
          // Check if draft is complete
          if (session.draftComplete) {
            console.log('[WeaponDraft] Draft complete!');
            setTimeout(() => {
              onDraftComplete(session.getDraftSummary());
            }, 1500);
          }
        }
      }, 800); // AI picks after 800ms
      
      return () => clearTimeout(timeout);
    }
  }, [session, currentDrafter, autoPickAI]);

  const updateDraftState = (draftSession) => {
    setCurrentPack(draftSession.getCurrentPack());
    setCurrentDrafter(draftSession.getCurrentDrafter());
    setProgress(draftSession.getProgress());
  };

  const handleBundleSelect = (bundleIndex) => {
    if (!session || session.draftComplete) return;
    
    const drafter = session.getCurrentDrafter();
    
    // Only allow human player (player 0) to pick
    if (drafter !== 0) {
      console.warn('[WeaponDraft] Not your turn!');
      return;
    }
    
    const pack = session.getCurrentPack();
    const bundle = pack.bundles[bundleIndex];
    
    setSelectedBundle(bundle);
    
    // Draft the bundle
    setTimeout(() => {
      const success = session.draftBundle(drafter, bundleIndex);
      
      if (success) {
        // Add to history
        setDraftHistory(prev => [...prev, {
          player: drafter,
          bundle,
          packNumber: pack.packNumber
        }]);
        
        setSelectedBundle(null);
        updateDraftState(session);
        
        // Check if draft complete
        if (session.draftComplete) {
          console.log('[WeaponDraft] Draft complete!');
          setTimeout(() => {
            onDraftComplete(session.getDraftSummary());
          }, 1500);
        }
      }
    }, 300); // Animation delay
  };

  if (!session || !currentPack || !progress) {
    return (
      <div className="draft-loading">
        <div className="draft-loading-spinner">⟳</div>
        <div>Generating weapon packs...</div>
      </div>
    );
  }

  const isHumanTurn = currentDrafter === 0;
  const currentPlayerColor = ['#ff6b6b', '#00d4ff', '#4ade80', '#ffd700', '#ff6bd4', '#a78bfa'][currentDrafter];

  return (
    <div className="weapon-draft-container">
      {/* Header */}
      <div className="draft-header">
        <div className="draft-title">⚔️ WEAPON DRAFT</div>
        <div className="draft-subtitle">Select your arsenal for battle</div>
      </div>

      {/* Progress Bar */}
      <div className="draft-progress-container">
        <div className="draft-progress-bar">
          <div 
            className="draft-progress-fill" 
            style={{ width: `${progress.progressPercent}%` }}
          />
        </div>
        <div className="draft-progress-text">
          Pack {progress.currentPack} of {progress.totalPacks}
        </div>
      </div>

      {/* Current Drafter Info */}
      <div className="draft-current-player" style={{ borderColor: currentPlayerColor }}>
        <div className="draft-player-indicator">
          {isHumanTurn ? '👤 YOUR TURN' : `🤖 PLAYER ${currentDrafter + 1}'S TURN`}
        </div>
        <div className="draft-instruction">
          {isHumanTurn ? 'Choose one bundle' : 'AI is selecting...'}
        </div>
      </div>

      {/* Weapon Pack (5 bundles) */}
      <div className="draft-pack-container">
        {currentPack.bundles.map((bundle, index) => {
          const isSelected = selectedBundle === bundle;
          const rarityColor = RARITY_COLORS[bundle.rarity];
          
          return (
            <div
              key={`bundle-${index}`}
              className={`draft-card ${isSelected ? 'selected' : ''} ${!isHumanTurn ? 'disabled' : ''}`}
              style={{ 
                borderColor: rarityColor,
                boxShadow: `0 0 20px ${rarityColor}40`
              }}
              onClick={() => isHumanTurn && handleBundleSelect(index)}
            >
              <div className="draft-card-rarity" style={{ background: rarityColor }}>
                {bundle.rarity.toUpperCase()}
              </div>
              
              <div className="draft-card-content">
                <div className="draft-card-icon">🚀</div>
                <div className="draft-card-name">{bundle.weaponDef.name}</div>
                <div className="draft-card-quantity">×{bundle.quantity}</div>
                <div className="draft-card-description">
                  {bundle.weaponDef.description}
                </div>
              </div>
              
              {isSelected && (
                <div className="draft-card-selected-indicator">
                  ✓ SELECTED
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Draft History (Recent Picks) */}
      <div className="draft-history">
        <div className="draft-history-title">RECENT PICKS</div>
        <div className="draft-history-items">
          {draftHistory.slice(-6).reverse().map((pick, index) => (
            <div 
              key={`history-${draftHistory.length - index}`} 
              className="draft-history-item"
              style={{ 
                borderLeftColor: RARITY_COLORS[pick.bundle.rarity]
              }}
            >
              <div className="history-player">P{pick.player + 1}</div>
              <div className="history-weapon">{pick.bundle.weaponDef.name}</div>
              <div className="history-quantity">×{pick.bundle.quantity}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="draft-footer">
        <div className="draft-tip">
          💡 <strong>TIP:</strong> Balance damage, terrain control, and utility weapons
        </div>
      </div>
    </div>
  );
}






