'use client';

import { useState, useEffect } from 'react';
import { getQuickActions, groupQuickActionsByCategory } from '@/lib/quick-actions';
import { createCommandLine } from '@/lib/commands/command-output-helpers';
import { WelcomeHeader } from './WelcomeHeader';

const lightbulbIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><path d="M9 21h6"></path><path d="M12 3a6 6 0 0 0 6 6c0 2.5-1.5 4.5-3 6H9c-1.5-1.5-3-3.5-3-6a6 6 0 0 1 6-6z"></path><line x1="12" y1="9" x2="12" y2="15"></line></svg>`;

const walletIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`;
const tradingIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><line x1="12" y1="2" x2="12" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`;
const analyticsIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><path d="M3 3v18h18"></path><path d="M18 7l-5 5-4-4-6 6"></path></svg>`;
const mediaIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;

export function WelcomeMessage() {
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

  const categories = Object.keys(grouped);

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

        {/* Custom Quick Actions Section with Drop Zone */}
        <div
          id="omega-quick-actions-drop-zone"
          style={{
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent) 0%, color-mix(in srgb, var(--palette-secondary, #00ff88) 6%, transparent) 100%)',
            border: '2px dashed color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 4px 20px color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            const target = e.currentTarget;
            target.style.borderColor = 'color-mix(in srgb, var(--palette-primary, #00d4ff) 50%, transparent)';
            target.style.background = 'linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent) 0%, color-mix(in srgb, var(--palette-secondary, #00ff88) 10%, transparent) 100%)';
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget;
            target.style.borderColor = 'color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent)';
            target.style.background = 'linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent) 0%, color-mix(in srgb, var(--palette-secondary, #00ff88) 6%, transparent) 100%)';
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--palette-primary, #00d4ff)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: lightbulbIcon }} />
            <span>Your Quick Actions</span>
          </div>

          {categories.length > 0 ? (
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
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '20px',
                color: 'color-mix(in srgb, var(--palette-text, #e0e0e0) 70%, transparent)',
              }}
            >
              No quick actions set yet. Drag sections from the sidebar here or use 'quick-actions add' to customize!
            </div>
          )}

          <div
            style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent)',
              textAlign: 'center',
              fontSize: '12px',
              color: 'color-mix(in srgb, var(--palette-text, #e0e0e0) 70%, transparent)',
            }}
            dangerouslySetInnerHTML={{
              __html: `💡 Drag sections from sidebar here to add commands | ${createCommandLine('quick-actions', 'quick-actions')} to customize`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

