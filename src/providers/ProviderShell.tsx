"use client";

import dynamic from "next/dynamic";
import { Suspense, type ReactNode } from "react";

const PerpsProvider = dynamic(
  () =>
    import("./PerpsProvider").then((mod) => ({
      default: mod.PerpsProvider,
    })),
  {
    ssr: false,
  }
);

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

const PGTProvider = dynamic(
  () =>
    import("./PGTProvider").then((mod) => ({
      default: mod.PGTProvider,
    })),
  {
    ssr: false,
  }
);

const TelegramProvider = dynamic(
  () =>
    import("./TelegramProvider").then((mod) => ({
      default: mod.TelegramProvider,
    })),
  {
    ssr: false,
  }
);

const CompanionProvider = dynamic(
  () =>
    import("./CompanionProvider").then((mod) => ({
      default: mod.CompanionProvider,
    })),
  {
    ssr: false,
  }
);

const ParlayProvider = dynamic(
  () =>
    import("./ParlayProvider").then((mod) => ({
      default: mod.ParlayProvider,
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

import { TerminalProvider } from "./TerminalProvider";

const GlobalGameModal = dynamic(
  () =>
    import("@/components/Games/GlobalGameModal").then((mod) => ({
      default: mod.GlobalGameModal,
    })),
  {
    ssr: false,
  }
);

const XmasSnowfall = dynamic(
  () =>
    import("@/components/Effects/XmasSnowfall").then((mod) => ({
      default: mod.default || mod.XmasSnowfall,
    })),
  {
    ssr: false,
  }
);

const GlobalParlayBuilder = dynamic(
  () =>
    import("@/components/Parlay/GlobalParlayBuilder").then((mod) => ({
      default: mod.GlobalParlayBuilder,
    })),
  {
    ssr: false,
  }
);

const GlobalMediaWindows = dynamic(
  () =>
    import("@/components/Media/GlobalMediaWindows").then((mod) => ({
      default: mod.GlobalMediaWindows,
    })),
  {
    ssr: false,
  }
);

export function ProviderShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ProvidersFallback />}>
      <PGTProvider>
        <PerpsProvider>
          <SpotifyProvider>
            <YouTubeProvider>
              <NewsReaderProvider>
                <GamesProvider>
                  <TelegramProvider>
                    <CompanionProvider>
                      <ParlayProvider>
                        <TerminalProvider>
                          {children}
                          <GlobalGameModal />
                          <GlobalParlayBuilder />
                          <GlobalMediaWindows />
                          <XmasSnowfall />
                        </TerminalProvider>
                      </ParlayProvider>
                    </CompanionProvider>
                  </TelegramProvider>
                </GamesProvider>
              </NewsReaderProvider>
            </YouTubeProvider>
          </SpotifyProvider>
        </PerpsProvider>
      </PGTProvider>
    </Suspense>
  );
}
