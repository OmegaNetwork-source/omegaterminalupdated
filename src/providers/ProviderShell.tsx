"use client";

import dynamic from "next/dynamic";
import { Suspense, type ReactNode } from "react";

const SpotifyProvider = dynamic(
  () =>
    import("./SpotifyProvider").then((mod) => ({
      default: mod.SpotifyProvider,
    })),
  {
    ssr: false,
  }
);

const YouTubeProvider = dynamic(
  () =>
    import("./YouTubeProvider").then((mod) => ({
      default: mod.YouTubeProvider,
    })),
  {
    ssr: false,
  }
);

const NewsReaderProvider = dynamic(
  () =>
    import("./NewsReaderProvider").then((mod) => ({
      default: mod.NewsReaderProvider,
    })),
  {
    ssr: false,
  }
);

const GamesProvider = dynamic(
  () =>
    import("./GamesProvider").then((mod) => ({
      default: mod.GamesProvider,
    })),
  {
    ssr: false,
  }
);

function ProvidersFallback() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "IBM Plex Mono, monospace",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "rgba(0, 255, 214, 0.8)",
      }}
    >
      Initializing experiential systems…
    </div>
  );
}

const TerminalProvider = dynamic(
  () =>
    import("./TerminalProvider").then((mod) => ({
      default: mod.TerminalProvider,
    })),
  {
    ssr: false,
  }
);

export function ProviderShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ProvidersFallback />}>
      <SpotifyProvider>
        <YouTubeProvider>
          <NewsReaderProvider>
            <GamesProvider>
              <TerminalProvider>{children}</TerminalProvider>
            </GamesProvider>
          </NewsReaderProvider>
        </YouTubeProvider>
      </SpotifyProvider>
    </Suspense>
  );
}
