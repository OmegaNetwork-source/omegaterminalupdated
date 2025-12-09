"use client";

/**
 * Account Connection Component
 * 
 * Allows users to connect their Kalshi and Polymarket trading accounts.
 * Features a sleek, modern interface for credential input and status display.
 */

import React, { useState, useCallback } from 'react';
import { useTradingAccounts } from '@/providers/TradingAccountsProvider';
import styles from './AccountConnection.module.css';

// =============================================================================
// Types
// =============================================================================

type Tab = 'kalshi' | 'polymarket';

interface KalshiCredentials {
  apiKeyId: string;
  privateKey: string;
}

interface PolymarketCredentials {
  privateKey: string;
  proxyWallet: string;
}

// =============================================================================
// Component
// =============================================================================

export function AccountConnection() {
  const {
    accounts,
    connectKalshi,
    disconnectKalshi,
    connectPolymarket,
    disconnectPolymarket,
    refreshAccounts,
    isLoading,
  } = useTradingAccounts();
  
  const [activeTab, setActiveTab] = useState<Tab>('kalshi');
  const [showCredentials, setShowCredentials] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Kalshi form state
  const [kalshiCreds, setKalshiCreds] = useState<KalshiCredentials>({
    apiKeyId: '',
    privateKey: '',
  });
  
  // Polymarket form state
  const [polyCreds, setPolyCreds] = useState<PolymarketCredentials>({
    privateKey: '',
    proxyWallet: '',
  });

  // ===========================================================================
  // Handlers
  // ===========================================================================

  const handleKalshiConnect = useCallback(async () => {
    if (!kalshiCreds.apiKeyId || !kalshiCreds.privateKey) {
      setError('Please enter both API Key ID and Private Key');
      return;
    }
    
    setIsConnecting(true);
    setError(null);
    
    try {
      const success = await connectKalshi(kalshiCreds);
      if (success) {
        setShowCredentials(false);
        setKalshiCreds({ apiKeyId: '', privateKey: '' });
      } else {
        setError('Failed to connect to Kalshi. Check your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  }, [kalshiCreds, connectKalshi]);

  const handlePolymarketConnect = useCallback(async () => {
    if (!polyCreds.privateKey) {
      setError('Please enter your wallet private key');
      return;
    }
    
    setIsConnecting(true);
    setError(null);
    
    try {
      const success = await connectPolymarket({
        privateKey: polyCreds.privateKey,
        proxyWallet: polyCreds.proxyWallet || undefined,
      });
      if (success) {
        setShowCredentials(false);
        setPolyCreds({ privateKey: '', proxyWallet: '' });
      } else {
        setError('Failed to connect to Polymarket. Check your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  }, [polyCreds, connectPolymarket]);

  const handleDisconnect = useCallback((venue: Tab) => {
    if (venue === 'kalshi') {
      disconnectKalshi();
    } else {
      disconnectPolymarket();
    }
  }, [disconnectKalshi, disconnectPolymarket]);

  // ===========================================================================
  // Render Helpers
  // ===========================================================================

  const formatBalance = (balance?: { available: number; locked: number; total: number }) => {
    if (!balance) return '$0.00';
    return `$${balance.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'var(--accent-green)';
      case 'connecting': return 'var(--accent-yellow)';
      case 'error': return 'var(--accent-red)';
      default: return 'var(--text-secondary)';
    }
  };

  const renderAccountCard = (venue: Tab) => {
    const account = venue === 'kalshi' ? accounts.kalshi : accounts.polymarket;
    const isConnected = account.status === 'connected';
    
    return (
      <div className={styles.accountCard}>
        <div className={styles.accountHeader}>
          <div className={styles.venueInfo}>
            <div className={`${styles.venueLogo} ${styles[venue]}`}>
              {venue === 'kalshi' ? 'K' : 'P'}
            </div>
            <div className={styles.venueDetails}>
              <h3 className={styles.venueName}>
                {venue === 'kalshi' ? 'Kalshi' : 'Polymarket'}
              </h3>
              <span 
                className={styles.status}
                style={{ color: getStatusColor(account.status) }}
              >
                <span className={styles.statusDot} style={{ backgroundColor: getStatusColor(account.status) }} />
                {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
              </span>
            </div>
          </div>
          
          {isConnected && (
            <button 
              className={styles.disconnectButton}
              onClick={() => handleDisconnect(venue)}
            >
              Disconnect
            </button>
          )}
        </div>
        
        {isConnected ? (
          <div className={styles.accountInfo}>
            <div className={styles.balanceSection}>
              <div className={styles.balanceItem}>
                <span className={styles.balanceLabel}>Available</span>
                <span className={styles.balanceValue}>
                  ${account.balance?.available.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                </span>
              </div>
              <div className={styles.balanceItem}>
                <span className={styles.balanceLabel}>In Positions</span>
                <span className={styles.balanceValue}>
                  ${account.balance?.locked.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                </span>
              </div>
              <div className={`${styles.balanceItem} ${styles.total}`}>
                <span className={styles.balanceLabel}>Total</span>
                <span className={styles.balanceValue}>
                  {formatBalance(account.balance)}
                </span>
              </div>
            </div>
            
            {account.stats && (
              <div className={styles.statsSection}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>P&L</span>
                  <span className={`${styles.statValue} ${account.stats.pnl >= 0 ? styles.positive : styles.negative}`}>
                    {account.stats.pnl >= 0 ? '+' : ''}${account.stats.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
            
            <button 
              className={styles.refreshButton}
              onClick={() => refreshAccounts()}
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        ) : (
          <div className={styles.connectSection}>
            {!showCredentials ? (
              <button 
                className={styles.connectButton}
                onClick={() => setShowCredentials(true)}
              >
                Connect {venue === 'kalshi' ? 'Kalshi' : 'Polymarket'}
              </button>
            ) : (
              <div className={styles.credentialsForm}>
                {venue === 'kalshi' ? (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>API Key ID</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        placeholder="Enter your Kalshi API Key ID"
                        value={kalshiCreds.apiKeyId}
                        onChange={(e) => setKalshiCreds(prev => ({ ...prev, apiKeyId: e.target.value }))}
                        autoComplete="off"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Private Key (RSA)</label>
                      <textarea
                        className={styles.formTextarea}
                        placeholder="Paste your RSA private key..."
                        value={kalshiCreds.privateKey}
                        onChange={(e) => setKalshiCreds(prev => ({ ...prev, privateKey: e.target.value }))}
                        rows={4}
                      />
                    </div>
                    <div className={styles.helpText}>
                      Get your API credentials from{' '}
                      <a href="https://kalshi.com/settings/api" target="_blank" rel="noopener noreferrer">
                        Kalshi Settings → API
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Wallet Private Key</label>
                      <input
                        type="password"
                        className={styles.formInput}
                        placeholder="Enter your Ethereum private key (0x...)"
                        value={polyCreds.privateKey}
                        onChange={(e) => setPolyCreds(prev => ({ ...prev, privateKey: e.target.value }))}
                        autoComplete="off"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Proxy Wallet (Optional)</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        placeholder="CLOB proxy wallet address"
                        value={polyCreds.proxyWallet}
                        onChange={(e) => setPolyCreds(prev => ({ ...prev, proxyWallet: e.target.value }))}
                        autoComplete="off"
                      />
                    </div>
                    <div className={styles.helpText}>
                      Use the wallet you registered with Polymarket's CLOB.{' '}
                      <a href="https://polymarket.com/profile" target="_blank" rel="noopener noreferrer">
                        View Profile
                      </a>
                    </div>
                  </>
                )}
                
                <div className={styles.securityNote}>
                  <span className={styles.securityIcon}>🔒</span>
                  <span>Your credentials are never stored on our servers. All trading is executed locally.</span>
                </div>
                
                <div className={styles.formActions}>
                  <button 
                    className={styles.cancelButton}
                    onClick={() => {
                      setShowCredentials(false);
                      setError(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.submitButton}
                    onClick={venue === 'kalshi' ? handleKalshiConnect : handlePolymarketConnect}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <span className={styles.spinner} />
                        Connecting...
                      </>
                    ) : (
                      'Connect'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {account.error && (
          <div className={styles.errorMessage}>
            {account.error}
          </div>
        )}
      </div>
    );
  };

  // ===========================================================================
  // Render
  // ===========================================================================

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Trading Accounts</h2>
        <p className={styles.subtitle}>
          Connect your prediction market accounts to execute trades
        </p>
      </div>
      
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'kalshi' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('kalshi');
            setShowCredentials(false);
            setError(null);
          }}
        >
          <span className={`${styles.tabIcon} ${styles.kalshi}`}>K</span>
          Kalshi
          {accounts.kalshi.status === 'connected' && (
            <span className={styles.connectedBadge}>✓</span>
          )}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'polymarket' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('polymarket');
            setShowCredentials(false);
            setError(null);
          }}
        >
          <span className={`${styles.tabIcon} ${styles.polymarket}`}>P</span>
          Polymarket
          {accounts.polymarket.status === 'connected' && (
            <span className={styles.connectedBadge}>✓</span>
          )}
        </button>
      </div>
      
      {error && (
        <div className={styles.globalError}>
          {error}
          <button className={styles.dismissError} onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      <div className={styles.content}>
        {renderAccountCard(activeTab)}
      </div>
      
      <div className={styles.footer}>
        <div className={styles.connectionSummary}>
          <span className={styles.summaryLabel}>Connected Accounts:</span>
          <span className={styles.summaryValue}>
            {[accounts.kalshi.status === 'connected', accounts.polymarket.status === 'connected'].filter(Boolean).length} / 2
          </span>
        </div>
        
        <div className={styles.totalBalance}>
          <span className={styles.totalLabel}>Combined Balance:</span>
          <span className={styles.totalValue}>
            ${(
              (accounts.kalshi.balance?.total || 0) + 
              (accounts.polymarket.balance?.total || 0)
            ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}

export default AccountConnection;

