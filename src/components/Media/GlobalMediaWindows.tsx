"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { useSpotify } from "@/hooks/useSpotify";
import { useYouTube } from "@/hooks/useYouTube";
import { useNewsReader } from "@/hooks/useNewsReader";
import { DraggableResizableWindow } from "./DraggableResizableWindow";

// Dynamically import media panels
const SpotifyPanel = dynamic(
  () => import("@/components/Media/SpotifyPanel").then((mod) => ({ default: mod.SpotifyPanel })),
  { ssr: false }
);

const YouTubePanel = dynamic(
  () => import("@/components/Media/YouTubePanel").then((mod) => ({ default: mod.YouTubePanel })),
  { ssr: false }
);

const NewsReaderPanel = dynamic(
  () => import("@/components/Media/NewsReaderPanel").then((mod) => ({ default: mod.NewsReaderPanel })),
  { ssr: false }
);

export function GlobalMediaWindows() {
  const spotify = useSpotify();
  const youtube = useYouTube();
  const newsReader = useNewsReader();

  return (
    <>
      {/* Spotify Window */}
      <DraggableResizableWindow
        id="spotify-player"
        title="Spotify Player"
        isOpen={spotify.playerState.isPanelOpen}
        onClose={spotify.closePanel}
        defaultWidth={500}
        defaultHeight={600}
        defaultX={100}
        defaultY={100}
        minWidth={400}
        minHeight={500}
        zIndex={spotify.playerState.isPanelOpen ? 1000 : 0}
      >
        <Suspense fallback={<div style={{ padding: "20px", textAlign: "center" }}>Loading Spotify...</div>}>
          <SpotifyPanel />
        </Suspense>
      </DraggableResizableWindow>

      {/* YouTube Window */}
      <DraggableResizableWindow
        id="youtube-player"
        title="YouTube Player"
        isOpen={youtube.playerState.isPanelOpen}
        onClose={youtube.closePanel}
        defaultWidth={600}
        defaultHeight={500}
        defaultX={150}
        defaultY={150}
        minWidth={400}
        minHeight={300}
        zIndex={youtube.playerState.isPanelOpen ? 1001 : 0}
      >
        <Suspense fallback={<div style={{ padding: "20px", textAlign: "center" }}>Loading YouTube...</div>}>
          <YouTubePanel />
        </Suspense>
      </DraggableResizableWindow>

      {/* News Reader Window */}
      <DraggableResizableWindow
        id="news-reader"
        title="News Reader"
        isOpen={newsReader.readerState.isPanelOpen}
        onClose={newsReader.closePanel}
        defaultWidth={700}
        defaultHeight={600}
        defaultX={200}
        defaultY={200}
        minWidth={500}
        minHeight={400}
        zIndex={newsReader.readerState.isPanelOpen ? 1002 : 0}
      >
        <Suspense fallback={<div style={{ padding: "20px", textAlign: "center" }}>Loading News...</div>}>
          <NewsReaderPanel />
        </Suspense>
      </DraggableResizableWindow>
    </>
  );
}

