# Omega Terminal Recovery Plan

## Current Issues
- Command modules referenced by the Next.js app do not exist, producing `Cannot find module './basic'` errors during boot.
- `DashboardSidebar` mixes vanilla JS `render()` callbacks with React, triggering runtime errors such as `TypeError: s.render is not a function`.
- Wallet provider functions assume full module availability and crash when the underlying utilities are missing or fail to load.
- The terminal attempts to initialize an entire 20-phase feature set at once, leaving the core command system non-functional.

## Root Cause
The original migration plan documented future architecture phases but never produced the foundational `src/lib/` modules. The Next.js app was wired for the completed architecture while the codebase still relied on the legacy `/js/` implementation. Attempting to ship every feature simultaneously blocked delivery of a minimal working terminal.

## Recovery Strategy
1. Rebuild a minimal `src/lib/` structure (constants, config, utils, commands, wallet) based on the legacy JavaScript files.
2. Harden providers and hooks so that missing modules degrade gracefully instead of crashing the UI.
3. Ship a functional terminal first, then reintroduce advanced dashboards, GUIs, and plugins incrementally.
4. Document progress and verification steps so future phases can be tracked without regressions.

## Phase 1: Get Terminal Working
- Implement `src/lib/constants.ts`, `src/lib/config.ts`, `src/lib/utils.ts`.
- Implement `src/lib/commands/CommandRegistry.ts`, `src/lib/commands/basic.ts`, `src/lib/commands/index.ts`.
- Update `src/hooks/useCommandExecution.ts` and `src/components/Terminal/TerminalContainer.tsx` with defensive command registration and fallbacks.
- Simplify `src/app/page.tsx` to render only `TerminalContainer` inside an `ErrorBoundary`.

## Phase 2: Get Wallet Working
- Implement `src/lib/wallet/detection.ts`, `connection.ts`, `session.ts`, and `index.ts`.
- Update `src/providers/WalletProvider.tsx` to safely import wallet helpers and provide fallback messaging when modules are unavailable.
- Test MetaMask connection, session wallet creation, and private key import/export flows.

## Phase 3: Add Essential Commands
- Implement `src/lib/commands/wallet.ts` and expand `src/lib/commands/basic.ts` with status, theme, and help messaging.
- Verify command execution (`help`, `clear`, `status`, `connect`, `disconnect`, `balance`, `send`, `create`, `import`, `export`).

## Phase 4: Restore Dashboard
- Re-enable dashboard layout in `page.tsx` once terminal and wallet flows are stable.
- Ensure `DashboardSidebar` uses React elements instead of `.render()` functions and confirm sections open without errors.

## Phase 5: Add Remaining Features Incrementally
- Reintroduce advanced modules (multi-chain, NFT, AI, media, games) one at a time.
- After each addition, run smoke tests and confirm command registration succeeds without fallback mode.

## Testing Checklist
- `npm run dev` starts without runtime errors or missing module warnings.
- Terminal renders, accepts input, and fallback commands respond even if registration fails.
- Wallet connect/disconnect/balance/send flows operate without unhandled exceptions.
- Console remains free of React rendering errors.

## Rollback Plan
If the new modules fail to stabilize the terminal, switch back to the legacy vanilla JS app temporarily. Recreate the Next.js migration from scratch, importing modules in small batches and verifying each phase before layering additional features.
