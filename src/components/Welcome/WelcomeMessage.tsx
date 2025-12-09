'use client';

import { useState, useEffect, useCallback } from 'react';
import { getQuickActions, groupQuickActionsByCategory } from '@/lib/quick-actions';
import { createCommandLine } from '@/lib/commands/command-output-helpers';
import { WelcomeHeader } from './WelcomeHeader';
import { useTerminal } from '@/providers/TerminalProvider';

const lightbulbIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><path d="M9 21h6"></path><path d="M12 3a6 6 0 0 0 6 6c0 2.5-1.5 4.5-3 6H9c-1.5-1.5-3-3.5-3-6a6 6 0 0 1 6-6z"></path><line x1="12" y1="9" x2="12" y2="15"></line></svg>`;

const walletIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`;
const tradingIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><line x1="12" y1="2" x2="12" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`;
const analyticsIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><path d="M3 3v18h18"></path><path d="M18 7l-5 5-4-4-6 6"></path></svg>`;
const mediaIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;

export function WelcomeMessage() {
  const { executeCommand } = useTerminal();
  const [actions, setActions] = useState(getQuickActions());

  // Listen for quick actions updates
  useEffect(() => {
    const handleUpdate = () => {
      setActions(getQuickActions());
    };

    window.addEventListener('omega-quick-actions-updated', handleUpdate);
    return () => {
      window.removeEventListener('omega-quick-actions-updated', handleUpdate);
    };
  }, []);

  const handleConnectWallet = useCallback(() => {
    void executeCommand("connect");
  }, [executeCommand]);

  const handleSystemHelp = useCallback(() => {
    void executeCommand("help");
  }, [executeCommand]);

  const handleQuickActionClick = useCallback((command: string) => {
    void executeCommand(command);
    // Auto-scroll terminal to bottom to show command output
    if (typeof window !== "undefined" && (window as any).__omegaScrollTerminalToBottom) {
      setTimeout(() => {
        (window as any).__omegaScrollTerminalToBottom();
      }, 100);
      setTimeout(() => {
        (window as any).__omegaScrollTerminalToBottom();
      }, 500);
    }
  }, [executeCommand]);

  const grouped = groupQuickActionsByCategory(actions);
  
  const categoryIcons: Record<string, string> = {
    "Wallet & Connection": walletIcon,
    "Trading & Markets": tradingIcon,
    "DeFi & Analytics": analyticsIcon,
    "Ethereum & Uniswap": tradingIcon,
    "Media & Entertainment": mediaIcon,
    "Other": lightbulbIcon,
  };
  const categoryColors: Record<string, string> = {
    "Wallet & Connection": "var(--palette-secondary, #00ff88)",
    "Trading & Markets": "var(--palette-warning, #ffa502)",
    "DeFi & Analytics": "var(--palette-secondary, #00ff88)",
    "Ethereum & Uniswap": "var(--palette-primary, #00d4ff)",
    "Media & Entertainment": "var(--palette-accent, #ff00ff)",
    "Other": "var(--palette-primary, #00d4ff)",
  };

  // Filter out "Wallet & Connection" category since we have buttons at the top
  const categories = Object.keys(grouped).filter(category => category !== "Wallet & Connection");

  return (
    <div
      style={{
        fontFamily: "'Courier New', monospace",
        color: 'var(--palette-text, #e0e0e0)',
        padding: '24px 0',
        lineHeight: 1.6,
        position: 'relative',
      }}
    >
      {/* Animated Background Pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              color-mix(in srgb, var(--palette-primary, #00d4ff) 3%, transparent) 2px,
              color-mix(in srgb, var(--palette-primary, #00d4ff) 3%, transparent) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              color-mix(in srgb, var(--palette-primary, #00d4ff) 3%, transparent) 2px,
              color-mix(in srgb, var(--palette-primary, #00d4ff) 3%, transparent) 4px
            )
          `,
          opacity: 0.3,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header with Typing Animation */}
        <WelcomeHeader />

        {/* Action Buttons - styled like sidebar buttons, side by side and centered */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: '12px', marginBottom: '24px', justifyContent: 'center', alignItems: 'center' }}>
          <button
            onClick={handleConnectWallet}
            style={{
              background: 'color-mix(in srgb, var(--palette-primary, #00bcf2) 8%, transparent)',
              border: '1px solid var(--palette-border, rgba(0, 212, 255, 0.15))',
              borderRadius: '8px',
              padding: '8px 12px',
              color: 'var(--palette-primary, #00d4ff)',
              fontFamily: '"Courier New", monospace',
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.05em',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '8px',
              minHeight: '36px',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget;
              target.style.background = 'color-mix(in srgb, var(--palette-primary, #00bcf2) 18%, transparent)';
              target.style.borderColor = 'var(--palette-primary, #00d4ff)';
              target.style.boxShadow = '0 0 20px var(--palette-primary-glow, color-mix(in srgb, var(--palette-primary, #00bcf2) 30%, transparent)), inset 0 0 10px var(--palette-primary-glow, color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent))';
              target.style.transform = 'translateX(6px) scale(1.02)';
              target.style.color = 'var(--palette-secondary, #00ffff)';
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget;
              target.style.background = 'color-mix(in srgb, var(--palette-primary, #00bcf2) 8%, transparent)';
              target.style.borderColor = 'var(--palette-border, rgba(0, 212, 255, 0.15))';
              target.style.boxShadow = 'none';
              target.style.transform = 'none';
              target.style.color = 'var(--palette-primary, #00d4ff)';
            }}
          >
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              style={{ width: '14px', height: '14px', flexShrink: 0 }}
            >
              <path d="M21,18V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.9 10,8V16A2,2 0 0,0 12,18H21M12,16V8H21V16H12Z" fill="currentColor" />
            </svg>
            <span>Connect Wallet</span>
          </button>

          <button
            onClick={handleSystemHelp}
            style={{
              background: 'color-mix(in srgb, var(--palette-primary, #00bcf2) 8%, transparent)',
              border: '1px solid var(--palette-border, rgba(0, 212, 255, 0.15))',
              borderRadius: '8px',
              padding: '8px 12px',
              color: 'var(--palette-primary, #00d4ff)',
              fontFamily: '"Courier New", monospace',
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.05em',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '8px',
              minHeight: '36px',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget;
              target.style.background = 'color-mix(in srgb, var(--palette-primary, #00bcf2) 18%, transparent)';
              target.style.borderColor = 'var(--palette-primary, #00d4ff)';
              target.style.boxShadow = '0 0 20px var(--palette-primary-glow, color-mix(in srgb, var(--palette-primary, #00bcf2) 30%, transparent)), inset 0 0 10px var(--palette-primary-glow, color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent))';
              target.style.transform = 'translateX(6px) scale(1.02)';
              target.style.color = 'var(--palette-secondary, #00ffff)';
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget;
              target.style.background = 'color-mix(in srgb, var(--palette-primary, #00bcf2) 8%, transparent)';
              target.style.borderColor = 'var(--palette-border, rgba(0, 212, 255, 0.15))';
              target.style.boxShadow = 'none';
              target.style.transform = 'none';
              target.style.color = 'var(--palette-primary, #00d4ff)';
            }}
          >
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              style={{ width: '14px', height: '14px', flexShrink: 0 }}
            >
              <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z" fill="currentColor" />
            </svg>
            <span>System Help</span>
          </button>
        </div>

        {/* Quick Actions Hint Text - styled like buttons, centered below */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '16px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: 'color-mix(in srgb, var(--palette-text, #e0e0e0) 70%, transparent)',
              fontFamily: '"Courier New", monospace',
              fontWeight: 500,
              letterSpacing: '0.05em',
            }}
            dangerouslySetInnerHTML={{
              __html: `💡 Drag sections from sidebar here to add commands | ${createCommandLine('quick-actions', 'quick-actions')}`,
            }}
          />
        </div>

        {/* Custom Quick Actions Section with Drop Zone (invisible box, but functional) */}
        <div
          id="omega-quick-actions-drop-zone"
          style={{
            padding: '24px 0',
            marginBottom: '24px',
            minHeight: '100px',
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >

          {categories.length > 0 && (
            categories.map((category, catIndex) => {
              const categoryActions = grouped[category];
              if (!categoryActions || categoryActions.length === 0) return null;
              const icon = categoryIcons[category] || lightbulbIcon;
              const color = categoryColors[category] || 'var(--palette-primary, #00d4ff)';

              return (
                <div key={category} style={{ marginBottom: catIndex === categories.length - 1 ? 0 : '20px' }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: color,
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    <span dangerouslySetInnerHTML={{ __html: icon }} />
                    <span>{category}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                    {categoryActions.map((action, actionIndex) => {
                      const escapedCommand = action.command.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                      
                      return (
                        <div
                          key={`${category}-${action.id}-${actionIndex}`}
                          className="omega-execute-command"
                          data-command={escapedCommand}
                          onClick={() => handleQuickActionClick(action.command)}
                          style={{
                            color: 'var(--palette-secondary, #00ff88)',
                            fontWeight: 'bold',
                            fontSize: '1.05em',
                            fontFamily: "'Courier New', monospace",
                            textShadow: '0 0 6px rgba(0, 255, 136, 0.3)',
                            cursor: 'pointer',
                            display: 'inline-block',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            background: 'color-mix(in srgb, var(--palette-primary, #00d4ff) 8%, transparent)',
                            border: '1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 25%, transparent)',
                            transition: 'all 0.2s ease',
                            userSelect: 'none',
                          }}
                          onMouseEnter={(e) => {
                            const target = e.currentTarget;
                            target.style.background = 'color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent)';
                            target.style.transform = 'translateY(-2px)';
                            target.style.boxShadow = '0 4px 12px color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent)';
                          }}
                          onMouseLeave={(e) => {
                            const target = e.currentTarget;
                            target.style.background = 'color-mix(in srgb, var(--palette-primary, #00d4ff) 8%, transparent)';
                            target.style.transform = 'translateY(0)';
                            target.style.boxShadow = 'none';
                          }}
                          title={`Click to execute: ${escapedCommand}`}
                        >
                          {action.label || action.command}
                          {action.description && (
                            <div
                              style={{
                                fontSize: '0.85em',
                                color: 'color-mix(in srgb, var(--palette-text, #e0e0e0) 70%, transparent)',
                                marginTop: '4px',
                                fontWeight: 'normal',
                              }}
                            >
                              {action.description}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

