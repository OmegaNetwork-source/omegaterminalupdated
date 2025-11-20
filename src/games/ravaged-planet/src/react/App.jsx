import { useRef, useEffect, useState, useCallback } from 'react';
import { GameProvider, useGameState } from './providers/GameProvider';
import { GameHUD } from './components/GameHUD';
import { GameModeSelector } from './components/GameModeSelector';
import { Leaderboard, updateLeaderboard } from './components/Leaderboard';
import { Menu } from './components/Menu';
import { GameCanvas } from './components/GameCanvas';
import { AssetSettings } from './components/AssetSettings';
import { MapEditor } from './components/MapEditor';
import { MapSelector } from './components/MapSelector';
import { DamageNumbers, addDamageNumber } from './components/DamageNumbers';
import { KillFeed, addKillFeedEntry } from './components/KillFeed';
import { TurnTimer, resetTurnTimer } from './components/TurnTimer';
import { VictoryScreen } from './components/VictoryScreen';
import { Matchmaking } from './components/Matchmaking';
import { MultiplayerGame } from './components/MultiplayerGame';
import { MatchResult } from './components/MatchResult';
import { WeaponDraft } from './components/WeaponDraft';
// CharacterSelector removed - was causing game freezing issues
import { multiplayerManager } from '../utils/multiplayer';
import { setGameConfig, startGame, restartGame, startNextLevel } from '../engine/gameEngine';
import { initDraftSession, getDraftSession } from '../engine/weaponDraft.js';

// Expose restart functions globally for VictoryScreen
if (typeof window !== 'undefined') {
  window.restartGame = restartGame;
  window.startNextLevel = startNextLevel;
  window.showMenu = () => {
    // Menu is handled by React state, but this can trigger menu visibility
    window.dispatchEvent(new CustomEvent('showMenu'));
  };
}

function GameContainer() {
  const gameContainerRef = useRef(null);
  const gameState = useGameState();
  const { menuVisible, state, players } = gameState;
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [selectedMode, setSelectedMode] = useState('ffa');
  const [playerCount, setPlayerCount] = useState(6);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAssetSettings, setShowAssetSettings] = useState(false);
  const [showMapEditor, setShowMapEditor] = useState(false);
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [showMatchmaking, setShowMatchmaking] = useState(false);
  const [activeMatch, setActiveMatch] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [showWeaponDraft, setShowWeaponDraft] = useState(false);
  const [draftEnabled, setDraftEnabled] = useState(true); // Enable draft by default
  const [draftSummary, setDraftSummary] = useState(null);
  // Character selector removed - was causing game freezing issues

  // Note: Game engine is initialized by GameCanvas component
  // We don't need useGameEngine hook here to avoid duplicate initialization
  const configureGame = useCallback((config) => {
    setGameConfig(config);
  }, []);

  // Listen for menu events from canvas menu (for backward compatibility)
  useEffect(() => {
    const handleGameModes = () => setShowModeSelector(true);
    const handleLeaderboard = () => setShowLeaderboard(true);
    
    window.addEventListener('openGameModes', handleGameModes);
    window.addEventListener('openLeaderboard', handleLeaderboard);

    return () => {
      window.removeEventListener('openGameModes', handleGameModes);
      window.removeEventListener('openLeaderboard', handleLeaderboard);
    };
  }, []);

  // Layout is now handled by CSS - no need for panel visibility toggling

  const handleModeSelect = useCallback((mode) => {
    setSelectedMode(mode);
    const config = { gameMode: mode, playerCount };
    setGameConfig(config);
    configureGame(config);
  }, [playerCount, configureGame]);

  const handleStartGame = useCallback(() => {
    const config = { gameMode: selectedMode, playerCount };
    setGameConfig(config);
    configureGame(config);
    setShowModeSelector(false);
    
    // If draft is enabled, show draft screen first
    if (draftEnabled) {
      console.log('[App] Starting weapon draft...');
      setShowWeaponDraft(true);
    } else {
      // Directly start the game via game engine (classic mode)
      console.log('[App] Starting game (classic mode)...');
      startGame();
    }
  }, [selectedMode, playerCount, configureGame, draftEnabled]);

  const handleMenuStartGame = useCallback(() => {
    // If mode selector is shown, configure first
    if (showModeSelector) {
      const config = { gameMode: selectedMode, playerCount };
      setGameConfig(config);
      configureGame(config);
      setShowModeSelector(false);
    }
    
    // If draft enabled, show draft screen
    if (draftEnabled) {
      console.log('[App] Starting weapon draft...');
      setShowWeaponDraft(true);
    } else {
      // Start the game (classic mode)
      startGame();
    }
  }, [selectedMode, playerCount, configureGame, showModeSelector, draftEnabled]);

  const handleDraftComplete = useCallback((summary) => {
    console.log('[App] Draft complete, starting game with drafted weapons');
    console.log('[App] Draft summary:', summary);
    
    setDraftSummary(summary);
    setShowWeaponDraft(false);
    
    // Store draft summary for game initialization
    window.draftSummary = summary;
    
    // Start the game with drafted weapons
    startGame();
  }, []);

  // Update leaderboard when game ends
  useEffect(() => {
    if (state === 'player-win' && players && players.length > 0) {
      players.forEach(player => {
        updateLeaderboard(player);
      });
    }
  }, [state, players]);

  // Expose functions to game engine
  useEffect(() => {
    window.addDamageNumber = addDamageNumber;
    window.addKillFeedEntry = addKillFeedEntry;
    window.resetTurnTimer = resetTurnTimer;
    return () => {
      delete window.addDamageNumber;
      delete window.addKillFeedEntry;
      delete window.resetTurnTimer;
    };
  }, []);

  // Show weapon draft screen
  if (showWeaponDraft) {
    return (
      <div id="game-container" ref={gameContainerRef}>
        <WeaponDraft
          playerCount={playerCount}
          onDraftComplete={handleDraftComplete}
        />
      </div>
    );
  }

  if (showLeaderboard) {
    return (
      <>
        <Menu
          onStartGame={handleMenuStartGame}
          onOpenGameModes={() => setShowModeSelector(true)}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
        />
        <div id="game-container" ref={gameContainerRef}>
          <div style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 2000, width: '300px', pointerEvents: 'auto' }}>
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowLeaderboard(false);
              }}
              style={{ marginBottom: '10px', padding: '8px 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', pointerEvents: 'auto' }}
            >
              BACK
            </button>
            <Leaderboard />
          </div>
        </div>
      </>
    );
  }

  if (showModeSelector) {
    return (
      <>
        <Menu
          onStartGame={handleMenuStartGame}
          onOpenGameModes={() => setShowModeSelector(true)}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
        />
        <div id="game-container" ref={gameContainerRef}>
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2000, width: '600px', background: 'rgba(26,26,46,0.95)', padding: '20px', borderRadius: '8px', border: '2px solid #444', pointerEvents: 'auto' }}>
            <GameModeSelector
              onModeSelect={handleModeSelect}
              selectedMode={selectedMode}
              playerCount={playerCount}
              onPlayerCountChange={setPlayerCount}
              draftEnabled={draftEnabled}
              onDraftToggle={setDraftEnabled}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleStartGame();
                }}
                style={{ flex: 1, padding: '12px', background: 'rgba(255,215,0,0.2)', border: '2px solid #ffd700', color: '#ffd700', fontWeight: 'bold', cursor: 'pointer', pointerEvents: 'auto' }}
              >
                START GAME
              </button>
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowModeSelector(false);
                }}
                style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', pointerEvents: 'auto' }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
        <Menu
          onStartGame={handleMenuStartGame}
          onOpenGameModes={() => setShowModeSelector(true)}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenMapEditor={() => setShowMapEditor(true)}
          onOpenMapSelector={() => setShowMapSelector(true)}
          onOpenMultiplayer={() => setShowMatchmaking(true)}
        />
      <div id="game-container" ref={gameContainerRef}>
        {/* Top action buttons only visible when menu is active and no other overlay is shown */}
        {menuVisible && !showModeSelector && !showLeaderboard && !showAssetSettings && !showMapEditor && !showMapSelector && (
          <div 
            className="menu-action-buttons"
            style={{ 
              position: 'fixed', 
              top: '20px', 
              right: '20px', 
              zIndex: 2001, 
              pointerEvents: 'auto', 
              display: 'flex', 
              gap: '12px', 
              flexWrap: 'wrap',
              maxWidth: '600px'
            }}
          >
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMapEditor(true);
              }}
              style={{ 
                padding: '10px 18px', 
                background: 'rgba(255,100,200,0.25)', 
                border: '2px solid rgba(255,100,200,0.5)', 
                color: '#ff64c8', 
                cursor: 'pointer', 
                borderRadius: '6px', 
                fontWeight: 'bold',
                fontFamily: 'Courier New, monospace',
                fontSize: '14px',
                letterSpacing: '1px',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              MAP EDITOR
            </button>
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMapSelector(true);
              }}
              style={{ 
                padding: '10px 18px', 
                background: 'rgba(100,255,150,0.25)', 
                border: '2px solid rgba(100,255,150,0.5)', 
                color: '#64ff96', 
                cursor: 'pointer', 
                borderRadius: '6px', 
                fontWeight: 'bold',
                fontFamily: 'Courier New, monospace',
                fontSize: '14px',
                letterSpacing: '1px',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              SELECT MAP
            </button>
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowAssetSettings(true);
              }}
              style={{ 
                padding: '10px 18px', 
                background: 'rgba(100,200,255,0.25)', 
                border: '2px solid rgba(100,200,255,0.5)', 
                color: '#64C8FF', 
                cursor: 'pointer', 
                borderRadius: '6px', 
                fontWeight: 'bold',
                fontFamily: 'Courier New, monospace',
                fontSize: '14px',
                letterSpacing: '1px',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              ENHANCE ASSETS
            </button>
          </div>
        )}
        {showAssetSettings && (
          <AssetSettings onClose={() => setShowAssetSettings(false)} />
        )}
        {showMapEditor && (
          <MapEditor onClose={() => setShowMapEditor(false)} onSave={() => {}} />
        )}
        {showMapSelector && (
          <MapSelector onClose={() => setShowMapSelector(false)} />
        )}
        {showMatchmaking && !activeMatch && (
          <Matchmaking
            serverUrl="ws://localhost:3001"
            onMatchFound={(matchData) => {
              setActiveMatch(matchData);
              setShowMatchmaking(false);
            }}
            onClose={() => setShowMatchmaking(false)}
          />
        )}
        {activeMatch && (
          <MultiplayerGame
            matchData={activeMatch}
            onMatchEnd={(result) => {
              setActiveMatch(null);
              if (!result.disconnected) {
                setMatchResult({
                  ...result,
                  myPlayerId: multiplayerManager?.playerId,
                });
              } else {
                setShowMatchmaking(false);
              }
            }}
          />
        )}
        {matchResult && (
          <MatchResult
            matchResult={matchResult}
            onClose={() => {
              setMatchResult(null);
            }}
          />
        )}
        {/* Character selector removed - was causing game freezing issues */}
        <GameCanvas />
        <GameHUD />
        <DamageNumbers />
        <KillFeed />
        <TurnTimer />
        <VictoryScreen />
      </div>
    </>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameContainer />
    </GameProvider>
  );
}

