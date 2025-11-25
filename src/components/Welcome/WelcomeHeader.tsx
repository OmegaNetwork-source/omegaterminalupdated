"use client";

import TextType from "@/components/TextType/TextType";
import { APP_VERSION } from "@/lib/constants";
import { useCustomizerContext } from "@/providers/CustomizerProvider";
import { ChristmasTree } from "@/components/Effects/ChristmasTree";
import { ChristmasTapGame } from "@/components/Effects/ChristmasTapGame";
import { useMobileDetection } from "@/hooks/useMobileDetection";

export function WelcomeHeader() {
  const { colorPalette } = useCustomizerContext();
  const { isMobile } = useMobileDetection();
  const isXmasPalette = colorPalette === "xmas" && !isMobile; // Disable Xmas effects on mobile for cleaner look

  return (
    <div
      style={{
        textAlign: "center",
        marginBottom: "32px",
        padding: "12px 20px",
        background:
          "color-mix(in srgb, var(--palette-surface, #111) 85%, transparent)",
        border:
          "1px solid color-mix(in srgb, var(--palette-border, #2a2a2a) 90%, transparent)",
        borderRadius: "20px",
        boxShadow: "none",
        position: "relative",
      }}
    >
      {/* Binary Text with Typing Animation */}
      <div
        style={{
          fontSize: "13px",
          color:
            "color-mix(in srgb, var(--palette-text, #e0e0e0) 50%, transparent)",
          letterSpacing: "3px",
          marginBottom: "8px",
          fontWeight: 300,
          fontFamily: "'Courier New', monospace",
          minHeight: "20px",
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
          textColors={[
            "color-mix(in srgb, var(--palette-text, #e0e0e0) 50%, transparent)",
          ]}
        />
      </div>

      {/* Main Title with Typing Animation */}
      <div
        style={{
          fontSize: "26px",
          fontWeight: 700,
          color: "var(--palette-text, #f0f0f0)",
          marginBottom: "0",
          letterSpacing: "0.08em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          minHeight: "40px",
          fontFamily:
            'var(--theme-font-heading, var(--theme-font-body, "Inter", "Segoe UI", system-ui))',
          textTransform: "uppercase",
        }}
      >
        <TextType
          text={`WELCOME TO OMEGA TERMINAL v${APP_VERSION}`}
          typingSpeed={60}
          initialDelay={2000}
          pauseDuration={4000}
          deletingSpeed={30}
          loop={false}
          showCursor={true}
          cursorCharacter="|"
          cursorBlinkDuration={0.5}
          textColors={["var(--palette-text, #f0f0f0)"]}
        />
      </div>

      {/* Christmas Tree with Characters - Only shows when Xmas palette is active */}
      {isXmasPalette && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "16px",
            paddingTop: "16px",
            borderTop:
              "1px solid color-mix(in srgb, var(--palette-border, #2a2a2a) 50%, transparent)",
            position: "relative",
            minHeight: "140px",
            overflow: "visible",
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
