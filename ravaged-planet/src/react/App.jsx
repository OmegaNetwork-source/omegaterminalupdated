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
import { multiplayerManager } from '../utils/multiplayer';
import { setGameConfig, startGame, restartGame, startNextLevel } from '../engine/gameEngine';

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
    // Directly start the game via game engine
    startGame();
  }, [selectedMode, playerCount, configureGame]);

  const handleMenuStartGame = useCallback(() => {
    // If mode selector is shown, configure first
    if (showModeSelector) {
      const config = { gameMode: selectedMode, playerCount };
      setGameConfig(config);
      configureGame(config);
      setShowModeSelector(false);
    }
    // Start the game
    startGame();
  }, [selectedMode, playerCount, configureGame, showModeSelector]);

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
              gap: '10px', 
              flexWrap: 'wrap' 
            }}
          >
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowModeSelector(true);
              }}
              style={{ padding: '8px 16px', background: 'rgba(255,215,0,0.3)', border: '2px solid #ffd700', color: '#ffd700', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px', boxShadow: '0 0 10px rgba(255,215,0,0.5)' }}
            >
              GAME MODES
            </button>
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowLeaderboard(true);
              }}
              style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)', color: '#fff', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}
            >
              LEADERBOARD
            </button>
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowAssetSettings(true);
              }}
              style={{ padding: '8px 16px', background: 'rgba(100,200,255,0.2)', border: '2px solid rgba(100,200,255,0.4)', color: '#64C8FF', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}
            >
              ENHANCE ASSETS
            </button>
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMapEditor(true);
              }}
              style={{ padding: '8px 16px', background: 'rgba(255,100,200,0.2)', border: '2px solid rgba(255,100,200,0.4)', color: '#ff64c8', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}
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
              style={{ padding: '8px 16px', background: 'rgba(100,255,150,0.2)', border: '2px solid rgba(100,255,150,0.4)', color: '#64ff96', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}
            >
              SELECT MAP
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

