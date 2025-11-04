# CSS Architecture

Reference guide for how Omega Terminal’s styles are organized post-Phase 17. Use this when adding new components or migrating legacy CSS. The real implementations live in `src/app/globals.css`, `src/components/**/**/*.module.css`, and shared provenance styles (`styles/*.css`).

## Architecture Overview

- **`src/app/globals.css`** holds app-wide concerns: resets, typography, CSS variables, color palettes, utility classes, motion preferences, and body-level theme hooks.
- **CSS Modules (`*.module.css`)** encapsulate component styling. They export locally scoped class names and expose theme overrides via `:global(body.theme-*) .moduleClass` selectors when global state must influence them.
- GUI themes and view modes rely on body classes (`body.gui-chatgpt`, `body.basic-terminal-mode`); modules reference those via `:global` instead of leaking component selectors into globals.

## `globals.css` Structure

- **Reset & Base** — `*` reset, `html/body` sizing, typography defaults.
- **Variables** — root color tokens, spacing, radii, transitions, plus palette tokens (`--palette-*`) and glassmorphism values.
- **Palettes** — `[data-color-palette]` attribute selectors update the palette variables for themes such as `neo`, `sunset`, `matrix`, `quantum`.
- **Utilities** — scrollbars, blur helpers, dashed outlines, animation helpers, reduced-motion fallbacks, loading indicators.
- **Keyframes** — animations for scanlines, glows, panel slide-ins.
- **Mobile utilities** — shared 16px input scaling and `.safe-area-pad` helper for safe-area bottoms when modules opt-in.
- **Theme Classes** — `body.theme-dark`, `body.theme-modern`, `body.theme-retro`, etc. provide the high-level background/foreground colors the modules inherit.

## CSS Modules Pattern

- Keep component classes small and descriptive (`.header`, `.container`, `.inputSection`). Modules own layout, spacing, and component-specific UI.
- Inject global context with `:global` selectors instead of variant classes. Example from `TerminalHeader.module.css`:

```css
:global(body.theme-modern) .header {
  border-bottom-color: rgba(98, 0, 255, 0.4);
  background: linear-gradient(
    180deg,
    rgba(18, 20, 36, 0.85) 0%,
    rgba(10, 12, 20, 0) 100%
  );
}
```

- Favor CSS variables from `globals.css` (e.g., `var(--palette-primary)`) so palette and theme switches propagate automatically.
- Export modifiers when JSX must apply multiple classes; otherwise rely on global selectors to keep markup simple.

## Theme System

- **Core themes** — `dark`, `light`, `matrix`, `retro`, `powershell`, `executive`, `modern` (set via `body.theme-*`).
- Modules reference them through `:global(body.theme-*)` selectors to adjust backgrounds, borders, prompts, line accents, etc.
- Additional **modern UI variant** states (`body.modern-ui-futuristic`, `body.modern-ui-glass`) provide higher fidelity skins for dashboard + terminal pairings.

## Color Palette System

- Controlled by `body[data-color-palette="<name>"]` (managed in `useCustomizer`).
- Palettes override `--palette-primary`, `--palette-accent`, `--palette-text`, and related tokens; modules read these variables for gradients, glows, and text color.
- When a module needs a palette-aware value, reach for `color: var(--palette-primary)` instead of hardcoding theme literals.

## View Modes

- `body.basic-terminal-mode` collapses the dashboard and keeps the terminal full screen (see `DashboardLayout.module.css`, `TerminalContainer.module.css`).
- `body.futuristic-mode` enables glassmorphism, multi-panel dashboard, and GUI overlays.
- Modules check these classes with `:global` selectors to opt components in or out of advanced chrome.

## GUI Themes

- Options exposed in the customizer: `gui-chatgpt`, `gui-aol`, `gui-discord`, `gui-windows95`, `gui-limewire`, plus the default terminal skin.
- Each theme toggles a body class consumed by layout modules (`src/components/GUIThemes/**`) and global utilities. Keep theme-specific overrides scoped within the respective module or a GUI theme module—avoid adding them back to `globals.css`.

## Responsive Strategy

- Shared breakpoints at 1400px, 1024px, 768px, and 480px across modules (terminal, dashboard, settings, NFT galleries).
- Ensure mobile-first rules live at the module level, then layer bigger-screen adjustments above the breakpoint.
- Safe-area and iOS behaviors handled via feature queries:

```css
@media (max-width: 768px) {
  .inputSection {
    /* TerminalInput.module.css */
    width: 100vw;
    border-radius: 16px 16px 0 0;
  }
}

@supports (padding: max(0px)) {
  .dashboard {
    padding-left: max(18px, calc(18px + env(safe-area-inset-left)));
  }
}
```

## Migration Checklist

- [ ] Add/reset variables in `globals.css` instead of hardcoding colors in modules.
- [ ] Scope new component selectors inside a module; expose required overrides with `:global(body.*)`.
- [ ] Include all four breakpoints (1400/1024/768/480) where layout changes.
- [ ] Mirror touch and safe-area feature queries if the component is interactive on mobile.
- [ ] Update documentation (`CSS_ARCHITECTURE.md`, `MOBILE_OPTIMIZATION.md`) when patterns change.

## Best Practices

- Keep modules ASCII-only and group sections with comment banners (Layout, Theme Variants, Responsive, Feature Queries) to match existing files.
- Use descriptive class names so JSX stays declarative (`className={styles.terminalArea}` instead of generic `.wrapper`).
- Prefer utility mix-ins via CSS variables and global classes; avoid reintroducing `composes` or `@extend` patterns unsupported by Next.js.
- Test theme + palette + GUI combinations at each breakpoint before merging.
- When in doubt, reference `styles/mobile-terminal-fix.css` and migrate relevant pieces into modules rather than duplicating legacy globals.
