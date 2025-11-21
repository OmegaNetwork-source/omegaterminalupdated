"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useCustomizerContext } from "@/providers/CustomizerProvider";
import styles from "./ChristmasTapGame.module.css";

type Character = "grinch" | "santa" | null;

interface GameState {
  selectedCharacter: Character;
  grinchScore: number;
  santaScore: number;
  walletAddress: string | null;
  team: "red" | "blue" | null;
}

const STORAGE_KEY = "omega-christmas-tap-game";

/**
 * ChristmasTapGame Component
 * A tap/click game where users choose a character (Grinch or Santa) and collect presents
 * - Player 1 (Red) = Grinch
 * - Player 2 (Blue) = Santa
 * - One-time character selection linked to wallet
 * - Scores saved locally
 */
interface ChristmasTapGameProps {
  showCharactersOnly?: boolean;
  showPresentAnimations?: boolean;
}

export function ChristmasTapGame({ showCharactersOnly = false, showPresentAnimations = false }: ChristmasTapGameProps): JSX.Element {
  const { colorPalette } = useCustomizerContext();
  const wallet = useWallet();
  const isXmasPalette = colorPalette === "xmas";

  const [gameState, setGameState] = useState<GameState>(() => {
    // Load from localStorage on mount
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Invalid data, use defaults
        }
      }
    }
    return {
      selectedCharacter: null,
      grinchScore: 0,
      santaScore: 0,
      walletAddress: null,
      team: null,
    };
  });

  const [presentAnimations, setPresentAnimations] = useState<
    Array<{ 
      id: number; 
      x: number; 
      y: number; 
      endX: number;
      endY: number;
      character: Character;
      direction: "toTree" | "fromTree";
    }>
  >([]);

  const [grinchFrame, setGrinchFrame] = useState(1);
  const [santaFrame, setSantaFrame] = useState(1);
  
  // Global scores (will be fetched from backend)
  const [globalScores, setGlobalScores] = useState({
    santa: 0,
    grinch: 0,
  });

  // Save to localStorage whenever gameState changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    }
  }, [gameState]);

  // Fetch global scores from backend
  useEffect(() => {
    const fetchGlobalScores = async () => {
      try {
        const response = await fetch('/api/christmas-game/global-scores', {
          cache: 'no-store',
        });
        
        if (response.ok) {
          const data = await response.json();
          setGlobalScores({ 
            santa: data.santa || 0, 
            grinch: data.grinch || 0 
          });
        } else {
          console.error('Failed to fetch global scores:', response.statusText);
        }
      } catch (error) {
        console.error('Failed to fetch global scores:', error);
      }
    };

    // Fetch immediately and then poll every 5 seconds for updates
    fetchGlobalScores();
    const interval = setInterval(fetchGlobalScores, 5000);
    return () => clearInterval(interval);
  }, []);

  // Animate Grinch sprite frames - always running
  useEffect(() => {
    // Start animation immediately
    setGrinchFrame(1);
    const interval = setInterval(() => {
      setGrinchFrame((prev) => {
        const next = prev >= 4 ? 1 : prev + 1;
        return next;
      });
    }, 200); // 200ms per frame = 0.8s total cycle for smoother animation

    return () => clearInterval(interval);
  }, []); // Run always, not dependent on selection

  // Animate Santa sprite frames - always running
  useEffect(() => {
    // Start animation immediately
    setSantaFrame(1);
    const interval = setInterval(() => {
      setSantaFrame((prev) => {
        const next = prev >= 4 ? 1 : prev + 1;
        return next;
      });
    }, 200); // 200ms per frame = 0.8s total cycle for smoother animation

    return () => clearInterval(interval);
  }, []); // Run always, not dependent on selection

  // Check if wallet is connected and update team assignment
  useEffect(() => {
    if (wallet.state.isConnected && wallet.state.address) {
      // If character not selected yet, allow selection
      if (!gameState.selectedCharacter) {
        // Don't auto-select, let user choose
        return;
      }

      // If wallet changed, reset selection (optional - you might want to keep it)
      if (
        gameState.walletAddress &&
        gameState.walletAddress !== wallet.state.address
      ) {
        // Reset if wallet changed
        setGameState((prev) => ({
          ...prev,
          selectedCharacter: null,
          walletAddress: null,
          team: null,
        }));
      } else if (!gameState.walletAddress) {
        // Link wallet to existing selection
        setGameState((prev) => ({
          ...prev,
          walletAddress: wallet.state.address,
        }));
      }
    }
  }, [wallet.state.isConnected, wallet.state.address, gameState.selectedCharacter, gameState.walletAddress]);

  const handleCharacterSelect = useCallback(
    (character: "grinch" | "santa") => {
      // Only allow selection if not already selected
      if (gameState.selectedCharacter) {
        return;
      }

      const team = character === "grinch" ? "red" : "blue";
      setGameState((prev) => ({
        ...prev,
        selectedCharacter: character,
        team,
        walletAddress: wallet.state.address || null,
      }));
    },
    [gameState.selectedCharacter, wallet.state.address]
  );

  const handleCharacterTap = useCallback(
    (character: "grinch" | "santa", event: React.MouseEvent<HTMLDivElement>) => {
      // If no character selected, allow selection
      if (!gameState.selectedCharacter) {
        handleCharacterSelect(character);
        return;
      }

      // Only allow tapping your selected character
      if (gameState.selectedCharacter !== character) {
        return;
      }

      // Get character position for present animation
      // Try to find character sprite (if outside box) or character box (if in box)
      const characterSprite = event.currentTarget.closest(`.${styles.characterSpriteOnly}`);
      const characterBox = event.currentTarget.querySelector(`.${styles.characterBox}`);
      const welcomeHeader = event.currentTarget.closest('[style*="position: relative"]') || 
                           document.querySelector('[style*="position: relative"]');
      
      let characterX: number;
      let characterY: number;
      let treeX: number;
      let treeY: number;
      
      if (characterSprite) {
        // Character is outside the box (near tree)
        const spriteRect = characterSprite.getBoundingClientRect();
        const headerRect = welcomeHeader?.getBoundingClientRect() || spriteRect;
        
        characterX = spriteRect.left + spriteRect.width / 2 - (headerRect?.left || 0);
        characterY = spriteRect.top + spriteRect.height / 2 - (headerRect?.top || 0);
        
        // Tree is in center of header
        treeX = (headerRect?.width || 0) / 2;
        treeY = (headerRect?.height || 0) / 2 - 20;
      } else if (characterBox) {
        // Character is in the game box
        const boxRect = characterBox.getBoundingClientRect();
        const gameContainer = event.currentTarget.closest(`.${styles.gameContainer}`);
        const containerRect = gameContainer?.getBoundingClientRect() || boxRect;
        
        characterX = boxRect.left + boxRect.width / 2 - containerRect.left;
        characterY = boxRect.top + boxRect.height / 2 - containerRect.top;
        
        treeX = containerRect.width / 2;
        treeY = containerRect.height / 2 - 20;
      } else {
        return;
      }

      // Add present animation with start and end positions
      const animationId = Date.now();
      
      if (character === "santa") {
        // Santa sends presents TO the tree (from Santa to tree)
        setPresentAnimations((prev) => [
          ...prev,
          { 
            id: animationId, 
            x: characterX, 
            y: characterY,
            endX: treeX,
            endY: treeY,
            character,
            direction: "toTree"
          },
        ]);
      } else {
        // Grinch steals presents FROM the tree (from tree to Grinch)
        setPresentAnimations((prev) => [
          ...prev,
          { 
            id: animationId, 
            x: treeX, 
            y: treeY,
            endX: characterX,
            endY: characterY,
            character,
            direction: "fromTree"
          },
        ]);
      }

      // Remove animation after it completes
      setTimeout(() => {
        setPresentAnimations((prev) =>
          prev.filter((anim) => anim.id !== animationId)
        );
      }, 1000);

      // Increment local score
      setGameState((prev) => ({
        ...prev,
        grinchScore:
          character === "grinch" ? prev.grinchScore + 1 : prev.grinchScore,
        santaScore:
          character === "santa" ? prev.santaScore + 1 : prev.santaScore,
      }));

      // Send click to backend to update global scores
      const sendClickToBackend = async () => {
        try {
          const response = await fetch('/api/christmas-game/click', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              character, 
              walletAddress: wallet.state.address || null 
            }),
          });

          if (response.ok) {
            // Optionally refresh global scores after a short delay
            // to show the updated count
            setTimeout(async () => {
              try {
                const scoresResponse = await fetch('/api/christmas-game/global-scores', {
                  cache: 'no-store',
                });
                if (scoresResponse.ok) {
                  const data = await scoresResponse.json();
                  setGlobalScores({ 
                    santa: data.santa || 0, 
                    grinch: data.grinch || 0 
                  });
                }
              } catch (error) {
                // Silently fail - scores will update on next poll
              }
            }, 1000);
          }
        } catch (error) {
          // Silently fail - don't interrupt user experience
          console.error('Failed to send click to backend:', error);
        }
      };

      // Send click asynchronously (non-blocking)
      sendClickToBackend();
    },
    [gameState.selectedCharacter, handleCharacterSelect, wallet.state.address]
  );

  if (!isXmasPalette) {
    return <></>;
  }

  const isGrinchSelected = gameState.selectedCharacter === "grinch";
  const isSantaSelected = gameState.selectedCharacter === "santa";
  const canSelect = !gameState.selectedCharacter;

  // If showing present animations only, render just the animation container
  if (showPresentAnimations) {
    return (
      <div className={styles.presentAnimationsContainer}>
        {presentAnimations.map((anim) => (
          <div
            key={anim.id}
            className={`${styles.presentAnimation} ${
              anim.direction === "toTree" ? styles.presentToTree : styles.presentFromTree
            }`}
            style={{
              "--start-x": `${anim.x}px`,
              "--start-y": `${anim.y}px`,
              "--end-x": `${anim.endX}px`,
              "--end-y": `${anim.endY}px`,
            } as React.CSSProperties}
          >
            🎁
          </div>
        ))}
      </div>
    );
  }

  // If showing characters only, render just the character sprites
  if (showCharactersOnly) {
    return (
      <>
        {/* Grinch - Left side of tree */}
        <div
          className={`${styles.characterSpriteOnly} ${styles.grinchSpriteOnly} ${
            isGrinchSelected ? styles.selected : ""
          }`}
          onClick={(e) => {
            if (!gameState.selectedCharacter) {
              handleCharacterSelect("grinch");
            } else if (gameState.selectedCharacter === "grinch") {
              handleCharacterTap("grinch", e);
            }
          }}
        >
          <div className={styles.spriteContainer}>
            <div
              className={styles.characterBackground}
              style={{
                backgroundImage: "url('/grinch.png')",
              }}
            />
            <div
              className={`${styles.sprite} ${styles.grinchSprite}`}
              key={`grinch-${grinchFrame}`}
              style={{
                backgroundImage: `url('/grinch${grinchFrame}.png')`,
              }}
            />
          </div>
        </div>

        {/* Santa - Right side of tree */}
        <div
          className={`${styles.characterSpriteOnly} ${styles.santaSpriteOnly} ${
            isSantaSelected ? styles.selected : ""
          }`}
          onClick={(e) => {
            if (!gameState.selectedCharacter) {
              handleCharacterSelect("santa");
            } else if (gameState.selectedCharacter === "santa") {
              handleCharacterTap("santa", e);
            }
          }}
        >
          <div className={styles.spriteContainer}>
            <div
              className={styles.characterBackground}
              style={{
                backgroundImage: "url('/santa.png')",
              }}
            />
            <div
              className={`${styles.sprite} ${styles.santaSprite}`}
              key={`santa-${santaFrame}`}
              style={{
                backgroundImage: `url('/santas${santaFrame}.png')`,
              }}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <div className={styles.gameContainer}>
      <div className={styles.gameHeader}>
        <h3 className={styles.gameTitle}>🎁 Christmas Tap Game</h3>
        {gameState.selectedCharacter && (
          <div className={styles.walletInfo}>
            {wallet.state.isConnected
              ? `Wallet: ${wallet.state.address?.slice(0, 6)}...${wallet.state.address?.slice(-4)}`
              : "Connect wallet to link your team"}
          </div>
        )}
      </div>

      {/* Global Scores Section */}
      <div className={styles.globalScoresSection}>
        <h4 className={styles.globalScoresTitle}>Global Scores</h4>
        <div className={styles.globalScoresList}>
          <div className={styles.globalScoreItem}>
            <span className={styles.globalScoreLabel}>Santa -</span>
            <span className={styles.globalScoreValue}>{globalScores.santa.toLocaleString()}</span>
          </div>
          <div className={styles.globalScoreItem}>
            <span className={styles.globalScoreLabel}>Grinch -</span>
            <span className={styles.globalScoreValue}>{globalScores.grinch.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className={styles.charactersContainer}>
        {/* Grinch - Player 1 (Red) */}
        <div
          className={`${styles.characterWrapper} ${styles.grinchWrapper} ${
            isGrinchSelected ? styles.selected : ""
          } ${canSelect ? styles.selectable : ""}`}
          onClick={(e) => handleCharacterTap("grinch", e)}
        >
          <div
            className={`${styles.characterBox} ${styles.redTeam} ${
              isGrinchSelected ? styles.active : ""
            }`}
          >
            <div className={styles.spriteContainer}>
              {/* Only show large background character image */}
              <div
                className={styles.characterBackground}
                style={{
                  backgroundImage: "url('/grinch.png')",
                }}
              />
            </div>
            <div className={styles.characterLabel}>Grinch</div>
            <div className={styles.score}>Score: {gameState.grinchScore}</div>
            {canSelect && (
              <div className={styles.selectHint}>Click to select</div>
            )}
          </div>
        </div>

        {/* VS Divider */}
        <div className={styles.vsDivider}>
          <span>VS</span>
        </div>

        {/* Santa - Player 2 (Blue) */}
        <div
          className={`${styles.characterWrapper} ${styles.santaWrapper} ${
            isSantaSelected ? styles.selected : ""
          } ${canSelect ? styles.selectable : ""}`}
          onClick={(e) => handleCharacterTap("santa", e)}
        >
          <div
            className={`${styles.characterBox} ${styles.blueTeam} ${
              isSantaSelected ? styles.active : ""
            }`}
          >
            <div className={styles.spriteContainer}>
              {/* Only show large background character image */}
              <div
                className={styles.characterBackground}
                style={{
                  backgroundImage: "url('/santa.png')",
                }}
              />
            </div>
            <div className={styles.characterLabel}>Santa</div>
            <div className={styles.score}>Score: {gameState.santaScore}</div>
            {canSelect && (
              <div className={styles.selectHint}>Click to select</div>
            )}
          </div>
        </div>
      </div>

      {/* Present Animations */}
      <div className={styles.presentAnimationsContainer}>
        {presentAnimations.map((anim) => (
          <div
            key={anim.id}
            className={`${styles.presentAnimation} ${
              anim.direction === "toTree" ? styles.presentToTree : styles.presentFromTree
            }`}
            style={{
              "--start-x": `${anim.x}px`,
              "--start-y": `${anim.y}px`,
              "--end-x": `${anim.endX}px`,
              "--end-y": `${anim.endY}px`,
            } as React.CSSProperties}
          >
            🎁
          </div>
        ))}
      </div>

      {/* Instructions */}
      {!gameState.selectedCharacter && (
        <div className={styles.instructions}>
          Choose your character to start collecting presents!
        </div>
      )}
      {gameState.selectedCharacter && (
        <div className={styles.instructions}>
          Tap your character to collect presents! 🎁
        </div>
      )}
    </div>
  );
}

export default ChristmasTapGame;

