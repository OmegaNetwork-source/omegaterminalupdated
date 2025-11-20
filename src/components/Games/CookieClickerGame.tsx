"use client";

/**
 * Cookie Clicker Game Component
 * 
 * Click cookies to earn points and buy upgrades
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import styles from "./CookieClickerGame.module.css";

export interface CookieClickerGameProps {
  onScoreUpdate: (score: number) => void;
  onGameEnd: (finalScore: number) => void;
}

interface Upgrade {
  id: string;
  name: string;
  cost: number;
  benefit: number;
  type: "click" | "auto";
}

const UPGRADES: Upgrade[] = [
  { id: "cursor", name: "👆 Cursor", cost: 10, benefit: 1, type: "click" },
  { id: "grandma", name: "👵 Grandma", cost: 100, benefit: 5, type: "auto" },
  { id: "factory", name: "🏭 Factory", cost: 500, benefit: 20, type: "auto" },
  { id: "mine", name: "⛏️ Mine", cost: 2000, benefit: 100, type: "auto" },
  { id: "shipment", name: "🚢 Shipment", cost: 10000, benefit: 500, type: "auto" },
];

export function CookieClickerGame({
  onScoreUpdate,
  onGameEnd,
}: CookieClickerGameProps) {
  const [cookies, setCookies] = useState(0);
  const [clickPower, setClickPower] = useState(1);
  const [cookiesPerSecond, setCookiesPerSecond] = useState(0);
  const [upgrades, setUpgrades] = useState<Record<string, number>>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-generate cookies
  useEffect(() => {
    if (cookiesPerSecond > 0) {
      intervalRef.current = setInterval(() => {
        setCookies((prev) => {
          const newCookies = prev + cookiesPerSecond;
          onScoreUpdate(newCookies);
          return newCookies;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [cookiesPerSecond, onScoreUpdate]);

  const handleCookieClick = useCallback(() => {
    setCookies((prev) => {
      const newCookies = prev + clickPower;
      onScoreUpdate(newCookies);
      return newCookies;
    });
  }, [clickPower, onScoreUpdate]);

  const buyUpgrade = useCallback(
    (upgrade: Upgrade) => {
      if (cookies >= upgrade.cost) {
        setCookies((prev) => prev - upgrade.cost);
        setUpgrades((prev) => ({
          ...prev,
          [upgrade.id]: (prev[upgrade.id] || 0) + 1,
        }));

        if (upgrade.type === "click") {
          setClickPower((prev) => prev + upgrade.benefit);
        } else {
          setCookiesPerSecond((prev) => prev + upgrade.benefit);
        }
      }
    },
    [cookies]
  );

  return (
    <div className={styles.container}>
      <div className={styles.scoreSection}>
        <div className={styles.cookieCount}>
          🍪 {Math.floor(cookies)}
        </div>
        <div className={styles.cps}>
          {cookiesPerSecond} cookies/sec
        </div>
      </div>

      <div className={styles.cookieSection}>
        <button
          onClick={handleCookieClick}
          className={styles.cookieButton}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "scale(0.95)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          🍪
        </button>
      </div>

      <div className={styles.shopSection}>
        <div className={styles.shopTitle}>🛒 Shop</div>
        <div className={styles.upgradesList}>
          {UPGRADES.map((upgrade) => {
            const owned = upgrades[upgrade.id] || 0;
            const canAfford = cookies >= upgrade.cost;
            return (
              <div
                key={upgrade.id}
                className={`${styles.upgradeItem} ${
                  canAfford ? styles.canAfford : ""
                }`}
                onClick={() => canAfford && buyUpgrade(upgrade)}
              >
                <div>
                  <div className={styles.upgradeName}>{upgrade.name}</div>
                  <div className={styles.upgradeDesc}>
                    {upgrade.type === "click"
                      ? `+${upgrade.benefit} per click`
                      : `+${upgrade.benefit} cookies/sec`}
                    {owned > 0 && ` • Owned: ${owned}`}
                  </div>
                </div>
                <div className={styles.upgradeCost}>🍪 {upgrade.cost}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}









