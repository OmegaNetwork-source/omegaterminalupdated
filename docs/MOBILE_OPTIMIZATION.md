# Mobile Optimization Guide

Comprehensive guidance for ensuring Omega Terminal behaves predictably on phones and tablets. Patterns documented here mirror the production CSS in `src/components/**`, `src/app/globals.css`, and the legacy provenance files `styles/mobile-terminal-fix.css` and `styles/mobile-fixes.css`.

## Breakpoints

- **1400px** — Tighten paddings and font sizes for large-but-constrained laptop screens (`@media (max-width: 1400px)` in `TerminalHeader.module.css`, `TerminalOutput.module.css`, `DashboardLayout.module.css`).
- **1024px** — Switch dashboard panels to stacked layouts and reduce control chrome for landscape tablets (`@media (max-width: 1024px)`).
- **768px** — Mobile default; terminal and media panels expand to `100vw`/`100vh`, inputs become fixed, and overlays switch to full-screen (`@media (max-width: 768px)` in most modules and `styles/mobile-terminal-fix.css`).
- **480px** — Small phone tuning for tighter paddings and single-column grids; modals and cards expand to `95vw` (`@media (max-width: 480px)`).

```css
/* Terminal output collapse on phones */
@media (max-width: 768px) {
  .container {
    /* from TerminalOutput.module.css */
    width: 100vw;
    max-height: calc(100vh - 120px);
    overflow-x: hidden;
  }
}
```

## Mobile-first Approach

- Build the default styles to match the immersive terminal on mobile, then add desktop-only enhancements above 768px.
- Use `width: 100vw`/`height: 100vh` on wrappers (`TerminalContainer.module.css`) and relax to fixed widths only when the viewport supports sidebars.
- Keep grids flexible with `minmax(0, 1fr)` so columns collapse gracefully when breakpoints activate (`DashboardLayout.module.css`).
- Prefer logical properties and CSS custom properties declared in `globals.css` so spacing scales consistently across viewports.

## Touch-friendly Design

- Maintain 44px x 44px interactive targets, enforced via `@media (hover: none) and (pointer: coarse)` in module files and the legacy `styles/mobile-terminal-fix.css`.
- Avoid hover-only affordances; pair them with active/focus states in button modules such as `TerminalHeader.module.css`.
- Use flexbox gaps instead of margins where possible so stacked layouts stay legible when buttons wrap.
- Delegate keyboard shortcuts to desktop; hide or demote them on touch devices (`.view-mode-toggle` rules in `styles/mobile-terminal-fix.css`).

```css
@media (hover: none) and (pointer: coarse) {
  .controlButton,
  .socialLink {
    min-height: 44px;
    min-width: 44px;
  }
}
```

## iOS-specific Fixes

- Use `height: -webkit-fill-available` to stretch panels below the dynamic island (`TerminalContainer.module.css`, `styles/mobile-terminal-fix.css`).
- Guard safe areas with `@supports (padding: max(0px))` so insets apply only on supported devices.
- Enforce `font-size: 16px` on inputs (see `TerminalInput.module.css`) to stop Safari zooming.
- Combine both feature queries to avoid regressing Android devices.
- Reach for the global `.safe-area-pad` helper when a module needs bottom padding without duplicating the feature query.

```css
@supports (-webkit-touch-callout: none) {
  .inputSection {
    -webkit-font-smoothing: antialiased;
    height: -webkit-fill-available;
  }
}

@supports (padding: max(0px)) {
  .inputSection {
    padding-bottom: max(16px, calc(16px + env(safe-area-inset-bottom)));
  }
}
```

## Horizontal Text Display Strategies

- Force terminal output lines to `writing-mode: horizontal-tb` and `white-space: pre-wrap` at the 768px breakpoint so long prompts never rotate vertically (`TerminalOutput.module.css`, `styles/mobile-terminal-fix.css`).
- Apply `word-break: break-word` and `overflow-wrap: break-word` on log lines and nested spans to prevent sideways scrolling.
- Switch tables to scroll containers (`display: block; overflow-x: auto;`) so analytics output remains readable without shrinking fonts.

## Component-specific Patterns

- **Terminal** — `TerminalContainer` expands to full screen, `TerminalOutput` becomes scroll-bound, and `TerminalInput` sticks to the bottom with 16px fonts.
- **Dashboard** — On phones, the dashboard hides via `body.basic-terminal-mode`; otherwise panels stack vertically with `grid-template-areas: "terminal" "sidebar" "stats"` at 768px.
- **Media Panels** — `MediaPanelContainer.module.css` swaps to overlay mode; Spotify/YouTube panels use fixed positioning with safe-area padding.
- **Modals** — Shared modal styles set `width: 95vw`, `max-height: 90vh`, and stacked buttons with full-width hit targets (see `WalletConnector.module.css`).
- **Cards & Galleries** — NFT grids (`MagicEdenGallery.module.css`) drop to single-column with reduced gaps; cards tighten padding at 480px.
- **Forms** — Inputs in settings and wallet modules match the terminal strategy: 16px fonts, `min-height: 44px`, and touch-friendly spacing.

## Performance Considerations

- Respect `@media (prefers-reduced-motion: reduce)` hooks in `globals.css` to disable long-running animations (scanlines, background grids) on constrained devices.
- Replace heavy drop shadows with lighter glows inside mobile breakpoints to reduce paint cost (see `TerminalContainer.module.css` and `MediaPanelContainer.module.css`).
- Defer non-critical gradients using pseudo-elements so the DOM remains simple on entry.

## Testing Checklist

- iPhone 14 Pro (390x844), iPhone SE (375x667) — portrait & landscape.
- Pixel 7/8 (412x915), Samsung Galaxy S22 (360x780) — verify adaptive paddings.
- iPad Mini (768x1024) — ensure dashboard collapses and terminal still full-screen in basic mode.
- Devices with notches/dynamic island — confirm safe-area padding around terminal input (inspect with Safari responsive design mode).
- Android Chrome + iOS Safari — verify `font-size: 16px` prevents zoom and touch targets remain ≥44px.
