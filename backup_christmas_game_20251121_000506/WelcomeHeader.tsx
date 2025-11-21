'use client';

import TextType from '@/components/TextType/TextType';
import { APP_VERSION } from '@/lib/constants';
import { useCustomizerContext } from '@/providers/CustomizerProvider';
import { ChristmasTree } from '@/components/Effects/ChristmasTree';
import { ChristmasTapGame } from '@/components/Effects/ChristmasTapGame';

const chartIcon = (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}
  >
    <path d="M3 3v18h18" />
    <path d="M7 16l4-4 4 4 6-6" />
    <path d="M7 12h10" />
    <path d="M11 8h6" />
  </svg>
);

const rocketIcon = (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}
  >
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

export function WelcomeHeader() {
  const { colorPalette } = useCustomizerContext();
  const isXmasPalette = colorPalette === 'xmas';

  return (
    <div
      style={{
        textAlign: 'center',
        marginBottom: '32px',
        padding: '24px 20px',
        background: 'color-mix(in srgb, var(--palette-surface, #111) 85%, transparent)',
        border: '1px solid color-mix(in srgb, var(--palette-border, #2a2a2a) 90%, transparent)',
        borderRadius: '20px',
        boxShadow: 'none',
        position: 'relative',
      }}
    >
      {/* Binary Text with Typing Animation */}
      <div
        style={{
          fontSize: '13px',
          color: 'color-mix(in srgb, var(--palette-text, #e0e0e0) 50%, transparent)',
          letterSpacing: '3px',
          marginBottom: '12px',
          fontWeight: 300,
          fontFamily: "'Courier New', monospace",
          minHeight: '20px',
        }}
      >
        <TextType
          text="01001111 01101101 01100101 01100111 01100001"
          typingSpeed={80}
          initialDelay={500}
          pauseDuration={3000}
          deletingSpeed={40}
          loop={true}
          showCursor={true}
          cursorCharacter="|"
          cursorBlinkDuration={0.5}
          textColors={['color-mix(in srgb, var(--palette-text, #e0e0e0) 50%, transparent)']}
        />
      </div>

      {/* Main Title with Typing Animation */}
      <div
        style={{
          fontSize: '26px',
          fontWeight: 700,
          color: 'var(--palette-text, #f0f0f0)',
          marginBottom: '12px',
          letterSpacing: '0.08em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          minHeight: '40px',
          fontFamily:
            'var(--theme-font-heading, var(--theme-font-body, "Inter", "Segoe UI", system-ui))',
          textTransform: 'uppercase',
        }}
      >
        {chartIcon}
        <TextType
          text={`WELCOME TO Ω OMEGA TERMINAL v${APP_VERSION}`}
          typingSpeed={60}
          initialDelay={2000}
          pauseDuration={4000}
          deletingSpeed={30}
          loop={false}
          showCursor={true}
          cursorCharacter="|"
          cursorBlinkDuration={0.5}
          textColors={['var(--palette-text, #f0f0f0)']}
        />
      </div>

      {/* Subtitle with Typing Animation */}
      <div
        style={{
          fontSize: '15px',
          color: 'var(--palette-secondary, #00ff88)',
          fontWeight: 600,
          marginTop: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          minHeight: '24px',
        }}
      >
        {rocketIcon}
        <TextType
          text="Your Gateway to Web3, DeFi, NFTs & Advanced Trading"
          typingSpeed={50}
          initialDelay={5000}
          pauseDuration={3000}
          deletingSpeed={25}
          loop={false}
          showCursor={true}
          cursorCharacter="|"
          cursorBlinkDuration={0.5}
          textColors={['var(--palette-secondary, #00ff88)']}
        />
      </div>

      {/* Christmas Tree with Characters - Only shows when Xmas palette is active */}
      {isXmasPalette && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid color-mix(in srgb, var(--palette-border, #2a2a2a) 50%, transparent)',
            position: 'relative',
            minHeight: '140px',
            overflow: 'visible',
          }}
        >
          <ChristmasTapGame showCharactersOnly={true} />
          <ChristmasTree />
          <ChristmasTapGame showPresentAnimations={true} />
        </div>
      )}

      {/* Christmas Tap Game UI - Only shows when Xmas palette is active */}
      {isXmasPalette && <ChristmasTapGame showCharactersOnly={false} />}
    </div>
  );
}

