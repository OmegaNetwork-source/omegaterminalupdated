# Implementation Checklist

## Critical Files Status
- [x] `src/lib/constants.ts`
- [x] `src/lib/config.ts`
- [x] `src/lib/utils.ts`
- [x] `src/lib/themes.ts`
- [x] `src/lib/commands/CommandRegistry.ts`
- [x] `src/lib/commands/basic.ts`
- [x] `src/lib/commands/wallet.ts`
- [x] `src/lib/commands/index.ts`
- [x] `src/lib/wallet/detection.ts`
- [x] `src/lib/wallet/connection.ts`
- [x] `src/lib/wallet/session.ts`
- [x] `src/lib/wallet/index.ts`

## Provider Files Status
- [x] `src/providers/ThemeProvider.tsx`
- [x] `src/providers/WalletProvider.tsx`
- [x] `src/providers/ProviderShell.tsx`
- [x] `src/providers/ViewModeProvider.tsx`

## Component Files Status
- [x] `src/components/Terminal/TerminalContainer.tsx`
- [x] `src/components/Terminal/TerminalInput.tsx`
- [x] `src/components/Terminal/TerminalOutput.tsx`
- [x] `src/components/Dashboard/DashboardSidebar.tsx`

## Known Issues
- Command system currently loads only the minimal command set; advanced modules (AI, NFT, media, games) are deferred (`src/lib/commands/*`).
- Fallback mode activates when command registration fails; ensure recovery messaging remains visible (`TerminalContainer.tsx`).
- Wallet utilities rely on external RPC endpoints; network outages will surface as user-facing warnings (`WalletProvider.tsx`).

## Fix Priority
1. Create and stabilize the minimal command and wallet modules.
2. Resolve dashboard rendering errors by ensuring React components render JSX directly.
3. Harden command registration and execution with fallbacks and error banners.
4. Validate wallet connection flows and handle missing module cases gracefully.
5. Incrementally reintroduce postponed command groups with tests.

## Verification Steps
- Confirm all listed files exist and compile without TypeScript errors.
- Validate import paths use `@/` aliases and do not create circular dependencies.
- Run `npm run lint` and `npm run test` after major edits to catch regressions.
- Start the dev server (`npm run dev`) and ensure the terminal renders, accepts commands, and logs module failures gracefully.
- Verify MetaMask connection, session wallet creation, and basic commands (`help`, `clear`, `status`, `connect`, `balance`, `send`, `create`, `import`, `export`).
- Check browser console for warnings after each feature addition.
