## Phase 14: Specialized Features (Mixer, Referral, Kalshi, Perps, Profile)

## Specialized Features Configuration (Client-Side Public Variables)

Add these to `.env.local` (see `.env.example` for placeholders):

- `NEXT_PUBLIC_MIXER_ADDRESS` — Mixer contract address on Omega Network
- `NEXT_PUBLIC_REFERRAL_API_BASE` — Referral system API base URL
- `NEXT_PUBLIC_AMBASSADOR_API_BASE` — Ambassador leaderboard API base URL
- `NEXT_PUBLIC_PERPS_BASE_URL` — Perps trading interface base URL

If not set, defaults from `src/lib/config.ts` will be used.

Implemented specialized features following established patterns:

- Command modules in `src/lib/commands/`: `mixer.ts`, `referral.ts`, `kalshi.ts`, `perps.ts`, `profile.ts`
- API clients in `src/lib/api/`: `referral.ts`, `kalshi.ts`
- Specialized components in `src/components/Specialized/`: `PerpsPanel.tsx`, `PerpsPanel.module.css`, `ReferralCard.tsx`, `ReferralCard.module.css` (for Phase 15 integration)
- TypeScript types in `src/types/`: `mixer.ts`, `referral.ts`, `kalshi.ts`, `profile.ts` and re-exported in `src/types/index.ts`
- Config updates in `src/lib/config.ts`: `REFERRAL_API_BASE`, `AMBASSADOR_API_BASE`, `PERPS_BASE_URL` (plus existing `MIXER_ADDRESS`, `MIXER_ABI`)

Migration Status: Phases 1–20 ✅ Complete

- **CSS Architecture:** See how `src/app/globals.css` (tokens/utilities) and component modules share responsibilities in [CSS_ARCHITECTURE.md](./CSS_ARCHITECTURE.md).
- **Mobile Optimization:** Mobile breakpoints, safe-area rules, and touch targets are documented in [MOBILE_OPTIMIZATION.md](./MOBILE_OPTIMIZATION.md).

## Phase 15: Futuristic UI System and GUI Theme Transformations

This phase migrates the futuristic UI system into the Next.js app with React Context providers, a 3-panel dashboard layout, GUI theme transformations, color palettes, customizer, and a welcome screen flow.

### What's Implemented

- Providers in `src/providers/`: `ViewModeProvider`, `GUIThemeProvider`, `CustomizerProvider`
- Hooks in `src/hooks/`: `useViewMode`, `useGUITheme`, `useCustomizer`
- Dashboard in `src/components/Dashboard/`: `DashboardLayout`, `DashboardSidebar`, `DashboardStatsPanel`, `WelcomeScreen` (+ CSS modules)
- GUI Themes in `src/components/GUIThemes/`: `ChatGPTLayout`, `AOLLayout`, `DiscordLayout`, `Windows95Layout`, `LimeWireLayout` (+ CSS modules)
- View mode switching (basic terminal ↔ futuristic dashboard)
- GUI theme transformations (complete interface replacements)
- Color palette system with context-driven updates
- Customizer system (panels, animations, font size, glass morphism, export/import)
- Welcome screen with loading animation and interface selector (mobile defaults to basic)
- Integration with existing providers and command system

### Architecture

- Three-layer UI: view mode, GUI theme, color palette
- `ViewModeProvider` controls basic vs. futuristic layout (applies body classes)
- `GUIThemeProvider` controls full interface themes (applies `gui-*` body classes)
- `CustomizerProvider` manages color palettes and settings (applies attributes/CSS vars)
- `WelcomeScreen` shows once (persisted via `omega-initialized`)
- `DashboardLayout` renders sidebar + terminal + stats (responsive hiding rules)

### Commands

- View: `view basic`, `view futuristic`, `view toggle`
- GUI: `gui chatgpt|aol|discord|windows95|limewire|terminal`
- Color: `color list`, `color current`, `color <name>`, `color reset`

### Integration Notes

- Sidebar buttons trigger `executeCommand` and open media panels
- Stats panel reads wallet state and terminal activity
- Root layout nests providers in correct dependency order

Next Steps:

- Phase 19: Performance optimization and server observability
- Phase 20: Testing infrastructure and automated regression coverage

### Project Structure Additions

- `src/lib/api/` → `referral.ts`, `kalshi.ts`
- `src/lib/commands/` → `mixer.ts`, `referral.ts`, `kalshi.ts`, `perps.ts`, `profile.ts`
- `src/components/Specialized/` → `PerpsPanel.*`, `ReferralCard.*`, `index.ts`
- `src/types/` → `mixer.ts`, `referral.ts`, `kalshi.ts`, `profile.ts`

### Specialized Features Commands

- Mixer: `mixer deposit`, `mixer deposit-execute`, `mixer withdraw`, `mixer withdraw-execute`, `mixer help`
- Referral: `referral create`, `referral stats`, `referral share`, `referral leaderboard`, `referral dashboard`, `referral complete`, `referral help`
- Kalshi: `kalshi markets`, `kalshi market`, `kalshi orderbook`, `kalshi trades`, `kalshi events`, `kalshi event`, `kalshi series`
- Perps: `perp open`, `perp close`, `perp help` (aliases: `perps`)
- Profile: `profile open`, `profile close`, `profile set`, `profile view`, `profile export`, `profile help`

### Mixer Privacy Protocol

- Commitment-based privacy system with contract at `0xc57824b37a7fc769871075103c4dd807bfb3fd3e`
- Ethers v6 integration for deposits; secrets stored locally; save your secret
- Withdraw manual flow documented; interactive prompts coming in Phase 15

### Referral System

- Uses Omega Network Wildcard and Ambassador APIs with automatic mock fallback
- Social sharing (Twitter, Discord), leaderboard tracking, rewards summary
- External referral backend server remains separate (not a Next.js route)

### Kalshi Integration

- Via relayer proxy (`RELAYER_URL`), server-side authentication handled by relayer
- Market browsing, order book, trades, events, and series
- Caching strategy: ~60s for most endpoints, 120s for events/series

### Perps Trading

- Iframe-based Omega Perps viewer component prepared (Phase 15)
- `perp open [pair]` logs direct URL for manual access (default: ETH_USDC)

### Profile System

- Basic profile data management (view, set, export) with localStorage persistence
- Advanced UI (ENS, contacts, API keys, scripts, chat, profile picture) deferred to Phase 15

### Notes

- Interactive prompts (e.g., mixer withdraw, profile editing flows) will land in Phase 15 UI
- Perps panel, profile sidebar, and referral dashboard components are created but integrated later

## Phase 16: Sound Effects System

Implemented a React Context-based sound system with Web Audio API:

- Provider: `src/providers/SoundEffectsProvider.tsx` manages registration, preloading, playback, and preferences (localStorage)
- Hook: `src/hooks/useSoundEffects.ts` to access state and methods
- Types: `src/types/sound.ts` and re-exported from `src/types/index.ts`
- Global button click sounds via document-level event delegation
- Specific methods for key actions: wallet connect, AI toggle, balance, chart viewer, basic view, clear terminal, modern UI theme, help command
- Integrations:
  - Providers: Theme (modern-ui-theme), ViewMode (basic-view), GUITheme (interface-select)
  - Commands: wallet (connect, balance, create), basic (clear, help), chart (chart-viewer)
  - Components: WelcomeScreen (interface-select), TerminalHeader AI select (ai-toggle)
- Settings UI: `src/components/Settings/SoundPreferences.tsx` (+ module CSS)
- Assets folder: `public/sounds/` (see README.md) served at `/sounds/*`
- Autoplay policy handling: resume AudioContext on first user interaction

Sound Triggers include: Wallet Connection, AI Toggle, Balance Check, Chart Viewer, Basic View, Clear Terminal, Modern UI Theme, Help Command, Interface Selection, and generic button clicks.

Files added/updated: `src/providers/SoundEffectsProvider.tsx`, `src/hooks/useSoundEffects.ts`, `src/components/Settings/*`, `src/types/sound.ts`, `src/types/index.ts`, `src/app/layout.tsx`, `src/lib/commands/{basic, wallet, chart}.ts`, `src/providers/{ThemeProvider, ViewModeProvider, GUIThemeProvider}.tsx`, `src/components/{Dashboard/WelcomeScreen, Terminal/TerminalHeader}.tsx`, `public/sounds/README.md`.

## Phase 17: CSS Migration and Responsive Design

Phase 17 consolidated more than 40 legacy CSS files into the Next.js 15 structure and locked in consistent responsive behavior across terminal, dashboard, and media surfaces.

- `src/app/globals.css` now owns resets, root variables, palette definitions, utilities, keyframes, and body-level theme hooks (light/dark, `theme-*`, GUI view modes).
- Terminal and dashboard modules supply their own visuals with `:global(body.theme-*) .moduleClass` overrides, eliminating `.terminal-*` selectors from globals.
- Standard breakpoints (`1400px`, `1024px`, `768px`, `480px`) ship in every high-traffic module plus NFT galleries; tablet/phone layouts match the patterns in `MOBILE_OPTIMIZATION.md`.
- iOS-specific fixes (`-webkit-fill-available`, safe-area padding, 16px inputs) are applied inside modules to keep Safari from zooming or cropping controls.
- Touch guidelines enforce 44px targets, stacked modals at `95vw`, and mobile-only overlays while the dashboard defaults to `body.basic-terminal-mode` on phones.
- GUI themes (`body.gui-chatgpt`, `body.gui-aol`, `body.gui-discord`, `body.gui-windows95`, `body.gui-limewire`) and view modes (`body.futuristic-mode`, `body.basic-terminal-mode`) drive scoped overrides instead of global component selectors.
- The color palette system stays attribute-driven via `body[data-color-palette]`, so modules inherit palette swaps automatically.

See [CSS_ARCHITECTURE.md](./CSS_ARCHITECTURE.md) and [MOBILE_OPTIMIZATION.md](./MOBILE_OPTIMIZATION.md) for implementation details and checklists.

## Phase 18: Server Actions and API Routes

Phase 18 introduces a comprehensive server-side foundation that migrates critical relayer capabilities into the Next.js app and modernizes external integrations.

### What's Implemented

- Server Actions in `src/actions/` for blockchain operations: `fundWallet`, `fundStressWallet`, `executeMine`, `claimRewards`, `claimFaucet`, `getFaucetStatus`
- API routes in `src/app/api/` for external services: Jupiter (`quote`, `swap`, `search`), Kalshi (`markets`, `market`, `orderbook`, `trades`, `events`, `event`, `series`), REF Finance (`tokens`, `pools`, `quote`), Gemini AI (`ai`), relayer status (`relayer/status`), referral system (`referrals/create`, `referrals/stats`, `referrals/complete`), ambassador leaderboard (`ambassadors/leaderboard`), safe env exposure (`env`)
- Middleware utilities in `src/lib/middleware/`: rate limiting (`rate-limit.ts`), security headers (`security-headers.ts`), error handling with typed responses (`error-handler.ts`)
- Validation utilities in `src/lib/validation/` with reusable Zod schemas and the `validateRequest` helper
- Blockchain utilities in `src/lib/blockchain/`: provider management, network retry logic, nonce management, gas price bumping
- Kalshi authentication utilities in `src/lib/utils/kalshi.ts` implementing RSA-PSS signing
- Runtime input validation with Zod across Server Actions and API routes
- Rate limiting tiers with Upstash Redis support and in-memory fallback
- Security headers (HSTS, X-Frame-Options, CSP, etc.) applied globally and within API helpers
- Next.js 15 caching strategies (`revalidate` tuning for quotes, markets, events, tokens, and status endpoints)
- Migration of relayer logic to ethers v6 Server Actions with background confirmation hooks
- Network retry logic mirroring the Express relayer (exponential backoff, 30s timeout)
- Fresh nonce management per transaction and automatic 20% gas price bumping

### Project Structure Additions

- `src/actions/` → `wallet.ts`, `mining.ts`, `faucet.ts`, `index.ts`
- `src/lib/middleware/` → `rate-limit.ts`, `security-headers.ts`, `error-handler.ts`, `index.ts`
- `src/lib/validation/index.ts`
- `src/lib/blockchain/` → `provider.ts`, `index.ts`
- `src/lib/utils/kalshi.ts`
- `src/app/api/` → `relayer/status`, `ai`, `jupiter/quote`, `jupiter/swap`, `jupiter/search`, `kalshi/*`, `ref/*`, `referrals/*`, `ambassadors/leaderboard`, `env`

### Server Actions

- Execute on the server with automatic serialization and access to secure environment variables
- Enforce runtime validation via shared Zod schemas before touching blockchain state
- Use `withNetworkRetry` for exponential backoff (5 attempts, 30s timeout) on JSON-RPC calls
- Obtain fresh nonces with `getFreshNonce` to prevent collisions under heavy load
- Apply a 20% gas price bump (`getGasPrice`) to accelerate confirmations during congestion
- Provide typed responses to client components and log failures for observability

### API Routes

- Proxy third-party services (Jupiter, Kalshi, REF Finance, Gemini AI) with caching tuned per data freshness requirements
- Wrap handlers with reusable middleware (`withRateLimit`, `createSecureResponse`, `handleApiError`)
- Apply Zod validation to all payloads and query parameters for predictable typing
- Add security headers on every response and propagate rate limit metadata (`X-RateLimit-*`)
- Implement Kalshi RSA-PSS authentication locally using configured API credentials

### Validation

- Centralized schemas (`ethereumAddressSchema`, `amountSchema`, `usernameSchema`, etc.) reduce duplication
- Request bodies reuse typed schemas (`FundWalletSchema`, `MineBlockSchema`, `CreateReferralSchema`, etc.)
- `validateRequest` helper provides consistent success/error unions for API handlers
- TypeScript inference via `z.infer` guarantees server code and client consumers remain in sync

### Rate Limiting

- Tiers: `DEFAULT` (10/10s), `BLOCKCHAIN` (5/60s), `FAUCET` (1/24h), `API_PROXY` (30/60s), `USER_MANAGEMENT` (20/60s)
- Upstash Redis-backed sliding window when credentials provided; Map-based fallback for local development
- Identifier resolution by IP or wallet address, emitting reset timestamps for UX feedback
- Graceful degradation if Redis is unreachable (logs and allows requests)

### Security

- Global security headers from `next.config.ts` plus per-route CSP via `createSecureResponse`
- Server-side secrets (`RELAYER_PRIVATE_KEY`, Kalshi credentials, Gemini key) never exposed to the client
- RSA-PSS signing kept server-only in `src/lib/utils/kalshi.ts`
- Uniform error serialization through `handleApiError` and `ApiError`
- CORS headers applied to safe env exposure endpoint (`/api/env`)

### Caching Strategy

- Real-time data (Jupiter quotes/orderbooks): `revalidate: 10`
- Market/event data (Kalshi): `revalidate: 60–120`
- Token lists and static catalogs (REF Finance): `revalidate: 300`
- Status endpoint: `revalidate: 30`
- Mutation endpoints (POST routes) use `cache: 'no-store'` or `revalidate: 0`

### Blockchain Operations

- Server Actions replace the Express relayer for funding, mining, and faucet flows
- Retry wrappers guard against transient network errors and timeouts
- Nonce management prevents duplicated transactions during bursts
- Gas price bump ensures submissions land quickly without manual tuning
- Logging surfaces failure contexts for observability (e.g., missing rewards, cooldowns)

### Environment Variables

- New server-only variables: `RELAYER_PRIVATE_KEY`, `GEMINI_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- Existing credentials retained (Kalshi keys, ChainGPT, Spotify, etc.)
- `.env.example` documents safe defaults while `.env.local` stores secrets outside version control
- `/api/env` exposes only non-sensitive values (e.g., `CHAINGPT_API_KEY`) with explicit allowlist

### Usage Examples

- **Server Action:**

  ```ts
  import { fundWallet } from "@/actions";

  const result = await fundWallet(userAddress, "0.1");
  if (!result.success) {
    // handle error
  }
  ```

- **API Route:**

  ```ts
  const response = await fetch("/api/jupiter/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inputMint, outputMint, amount, slippageBps: 50 }),
  });
  ```

- Inspect `X-RateLimit-*` headers on responses to surface cooldown timers in the UI.

### Migration from Express Relayer

- Legacy `server/relayer-faucet.js` (3,700+ lines) remains for Python bots, SQLite-backed user systems, and unported endpoints
- Critical blockchain flows now execute through Next.js Server Actions with better ergonomics and security
- Third-party proxies (Kalshi, Jupiter, REF Finance, AI, referrals) consolidated into typed Next.js API routes
- SQLite utilities can be reintroduced via `better-sqlite3` in future phases or proxied to the existing relayer
- Express server can continue to run for features pending migration while Phase 18 endpoints power the main app

# Omega Terminal - Next.js 15 Migration

**Advanced Web3 Terminal with Multi-Chain Support and AI Integration**

A powerful, modular terminal interface for Web3 trading, NFTs, DeFi, and blockchain interactions, rebuilt with Next.js 15, React 18, and TypeScript for enhanced performance, maintainability, and developer experience.

![Version](https://img.shields.io/badge/version-2.0.1-blue.svg) ![License](https://img.shields.io/badge/license-MIT-green.svg) ![Next.js](https://img.shields.io/badge/Next.js-15-black.svg) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **UI Library**: [React 18](https://react.dev/)
- **Blockchain**:
  - [ethers.js v6](https://docs.ethers.org/v6/) for EVM chains
  - [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/) for Solana
  - eth-crypto for cryptographic operations
- **Styling**: CSS Modules / Inline Styles (Phase 1)
- **Build Tool**: Next.js built-in compiler (Turbopack-ready)

## 📋 Prerequisites

- **Node.js**: >= 18.0.0
- **Package Manager**: npm, yarn, or pnpm
- **Browser**: Chrome/Brave (recommended), Firefox, Edge, or Safari

## 🏁 Getting Started

### 1. Installation

Clone the repository and install dependencies:

```bash
# Clone the repository
git clone https://github.com/your-username/omega-terminal-nextjs.git
cd omega-terminal-nextjs

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### 2. Environment Configuration

**IMPORTANT**: The canonical template for all environment variables is `.env.example`. Always refer to this file for the complete list of available configuration options.

Create your local environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys and configuration. **Key sections to configure**:

#### Server-Side Variables (No NEXT*PUBLIC* prefix)

```env
# NFT and IPFS Configuration (REQUIRED for NFT minting)
PINATA_JWT=your_pinata_jwt_token_here

# AI Services (Optional)
GEMINI_API_KEY=your_gemini_api_key
CHAINGPT_API_KEY=your_chaingpt_api_key

# Blockchain Operations (Optional)
RELAYER_PRIVATE_KEY=your_relayer_private_key

# Prediction Markets (Optional)
KALSHI_API_KEY=your_kalshi_api_key
KALSHI_PRIVATE_KEY=your_kalshi_private_key
```

#### Client-Side Public Variables (NEXT*PUBLIC* prefix)

```env
# API Endpoints
NEXT_PUBLIC_OMEGA_API_URL=https://omeganetwork.co/api
NEXT_PUBLIC_RELAYER_URL=https://terminal-v1-5-9.onrender.com

# NFT Contract Address
NEXT_PUBLIC_OMEGA_NFT_CONTRACT=0x3aa39fe2dab93838ed3ad314b8867a8792902dd7

# Application Version
NEXT_PUBLIC_APP_VERSION=2.0.1
```

**Security Notes:**

- Server-side variables (like `PINATA_JWT`) are NEVER exposed to the browser
- Client-side variables (prefixed with `NEXT_PUBLIC_`) are bundled into the client JavaScript
- Never commit `.env.local` to version control (it's gitignored by default)
- Refer to `.env.example` for detailed documentation of each variable

### 3. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the terminal.

## 📁 Project Structure

```
omega-terminal-nextjs/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout with ThemeProvider & WalletProvider
│   │   ├── page.tsx           # Home page (terminal interface)
│   │   └── globals.css        # Global styles and CSS variables
│   ├── components/            # React components
│   │   ├── Terminal/          # Terminal components
│   │   │   ├── BootAnimation.tsx           # Boot animation component
│   │   │   ├── BootAnimation.module.css    # Boot animation styles
│   │   │   ├── TerminalContainer.tsx       # Main terminal wrapper
│   │   │   ├── TerminalContainer.module.css # Container styles
│   │   │   ├── TerminalHeader.tsx          # Header with controls
│   │   │   ├── TerminalHeader.module.css   # Header styles
│   │   │   ├── TerminalOutput.tsx          # Command output display
│   │   │   ├── TerminalOutput.module.css   # Output styles
│   │   │   ├── TerminalInput.tsx           # Command input
│   │   │   ├── TerminalInput.module.css    # Input styles
│   │   │   └── index.ts                    # Barrel export
│   │   ├── Wallet/            # Wallet components
│   │   │   ├── WalletConnector.tsx         # Wallet connection UI
│   │   │   ├── WalletConnector.module.css  # Wallet connector styles
│   │   │   ├── TransactionModal.tsx        # Transaction confirmation modal
│   │   │   ├── TransactionModal.module.css # Transaction modal styles
│   │   │   └── index.ts                    # Barrel export
│   │   ├── Mining/            # Mining components
│   │   │   ├── MiningStatus.tsx            # Real-time mining status widget
│   │   │   ├── MiningStatus.module.css     # Mining status styles
│   │   │   ├── StressTestStats.tsx         # Stress test statistics widget
│   │   │   ├── StressTestStats.module.css  # Stress test stats styles
│   │   │   └── index.ts                    # Barrel export
│   │   ├── Analytics/         # Analytics components (Phase 9)
│   │   │   ├── TokenCard.tsx              # DexScreener token cards
│   │   │   ├── TokenCard.module.css       # Token card styles
│   │   │   ├── ProtocolCard.tsx           # DeFi Llama protocol cards
│   │   │   ├── ProtocolCard.module.css    # Protocol card styles
│   │   │   ├── ChainCard.tsx              # DeFi Llama chain cards
│   │   │   ├── ChainCard.module.css       # Chain card styles
│   │   │   └── index.ts                   # Barrel export
│   │   ├── NFT/               # NFT components (Phase 10)
│   │   │   ├── NFTCard.tsx                # OpenSea NFT cards
│   │   │   ├── NFTCard.module.css         # NFT card styles
│   │   │   ├── MagicEdenCard.tsx          # Magic Eden NFT cards
│   │   │   ├── MagicEdenCard.module.css   # Magic Eden card styles
│   │   │   ├── NFTGallery.tsx             # OpenSea NFT gallery grid
│   │   │   ├── NFTGallery.module.css      # Gallery styles
│   │   │   ├── MagicEdenGallery.tsx       # Magic Eden NFT gallery
│   │   │   ├── MagicEdenGallery.module.css # Magic Eden gallery styles
│   │   │   ├── MintNFTModal.tsx           # NFT minting modal (Phase 15)
│   │   │   ├── MintNFTModal.module.css    # Minting modal styles
│   │   │   └── index.ts                   # Barrel export
│   │   ├── AI/                # AI components (Phase 11, 15)
│   │   │   ├── ChatMessage.tsx            # AI chat message display
│   │   │   ├── ChatMessage.module.css     # Chat message styles
│   │   │   └── index.ts                   # Barrel export
│   │   └── MultiChain/        # Multi-chain components (Phase 8)
│   │       ├── SolanaSwapInterface.tsx    # Solana swap UI placeholder
│   │       ├── EclipseSwapInterface.tsx   # Eclipse swap UI placeholder
│   │       └── index.ts                   # Barrel export
│   ├── providers/             # React Context providers
│   │   ├── ThemeProvider.tsx  # Theme management provider
│   │   └── WalletProvider.tsx # Wallet state management provider
│   ├── lib/                   # Utilities and business logic
│   │   ├── constants.ts       # Application constants
│   │   ├── config.ts          # Configuration (contracts, networks, APIs)
│   │   ├── utils.ts           # Helper functions (ethers v6 integrated)
│   │   ├── themes.ts          # Theme configuration and helpers
│   │   ├── commands/          # Command system
│   │   │   ├── CommandRegistry.ts  # Command registration and routing
│   │   │   ├── basic.ts           # Basic commands (help, clear, status, theme, stop, etc.)
│   │   │   ├── wallet.ts          # Wallet commands (connect, disconnect, balance, send, etc.)
│   │   │   ├── mining.ts          # Mining commands (mine, claim, faucet, stats)
│   │   │   ├── network.ts         # Network commands (stress, stopstress, stressstats)
│   │   │   ├── solana.ts          # Solana commands (Phase 8)
│   │   │   ├── near.ts            # NEAR commands (Phase 8)
│   │   │   ├── eclipse.ts         # Eclipse commands (Phase 8)
│   │   │   ├── dexscreener.ts     # DexScreener/GeckoTerminal commands (Phase 9)
│   │   │   ├── alphavantage.ts    # Alpha Vantage commands (Phase 9)
│   │   │   ├── defillama.ts       # DeFi Llama commands (Phase 9)
│   │   │   ├── pgt.ts             # PGT commands (Phase 9)
│   │   │   ├── chart.ts           # Chart command placeholder (Phase 9)
│   │   │   ├── opensea.ts         # OpenSea commands (Phase 10)
│   │   │   ├── magiceden.ts       # Magic Eden commands (Phase 10)
│   │   │   ├── nft-mint.ts        # Omega NFT minting commands (Phase 10)
│   │   │   ├── chaingpt-chat.ts   # ChainGPT chat commands (Phase 11)
│   │   │   ├── chaingpt-contract.ts # ChainGPT contract generator (Phase 11)
│   │   │   ├── chaingpt-auditor.ts # ChainGPT auditor commands (Phase 11)
│   │   │   ├── chaingpt-nft.ts    # ChainGPT NFT generator (Phase 11)
│   │   │   └── index.ts           # Command system entry point
│   │   ├── wallet/            # Wallet modules
│   │   │   ├── detection.ts   # Wallet detection (MetaMask, Phantom)
│   │   │   ├── connection.ts  # MetaMask connection & network management
│   │   │   ├── session.ts     # Session wallet creation & import
│   │   │   └── index.ts       # Barrel export
│   │   ├── api/               # External API clients (Phase 9, 10 & 11)
│   │   │   ├── dexscreener.ts # DexScreener API client
│   │   │   ├── geckoterminal.ts # GeckoTerminal API client
│   │   │   ├── alphavantage.ts  # Alpha Vantage API client
│   │   │   ├── defillama.ts   # DeFi Llama API client
│   │   │   ├── pgt.ts         # PGT API client
│   │   │   ├── opensea.ts     # OpenSea API client (Phase 10)
│   │   │   ├── magiceden.ts   # Magic Eden API client (Phase 10)
│   │   │   ├── pinata.ts      # Pinata IPFS API client (Phase 10)
│   │   │   ├── chaingpt.ts    # ChainGPT AI API client (Phase 11)
│   │   │   └── index.ts       # Barrel export with namespace imports
│   │   └── multichain/        # Multi-chain integration (Phase 8)
│   │       ├── solana/        # Solana integration
│   │       ├── near/          # NEAR integration
│   │       └── eclipse/       # Eclipse integration
│   ├── hooks/                 # Custom React hooks
│   │   ├── useTheme.ts        # Theme context hook
│   │   ├── useWallet.ts       # Wallet context hook
│   │   └── useCommandExecution.ts  # Command execution hook
│   └── types/                 # TypeScript type definitions
│       ├── index.ts           # Main types barrel file
│       ├── config.ts          # Configuration types
│       ├── utils.ts           # Utility function types
│       ├── theme.ts           # Theme system types
│       ├── terminal.ts        # Terminal component types
│       ├── wallet.ts          # Wallet system types
│       ├── commands.ts        # Command system types
│       ├── multichain.ts      # Multi-chain types (Phase 8)
│       ├── api.ts             # API integration types (Phase 9)
│       ├── nft.ts             # NFT marketplace types (Phase 10)
│       └── chaingpt.ts        # ChainGPT AI integration types (Phase 11)
├── public/                    # Static assets
│   └── favicon.ico           # Application icon
├── .env.local                 # Local environment variables (git-ignored)
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── next.config.ts            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Project dependencies
└── README.md                 # This file
```

## 📜 Available Scripts

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start development server with hot reload |
| `npm run build` | Build optimized production bundle        |
| `npm run start` | Start production server                  |
| `npm run lint`  | Run ESLint to check code quality         |

## 🔐 Environment Variables

### Required Variables

None! The terminal works out-of-the-box with limited functionality.

### Optional Variables

#### Prediction Markets

- `KALSHI_API_KEY` - Enable Kalshi prediction markets (get from [kalshi.com](https://kalshi.com/account/profile))
- `KALSHI_PRIVATE_KEY` - RSA private key for Kalshi API signing

#### Blockchain Operations

- `RELAYER_PRIVATE_KEY` - Enable mining, faucet, and transaction relaying

#### AI Services

- `GEMINI_API_KEY` - Enable Google Gemini AI chat (get from [AI Studio](https://makersuite.google.com/app/apikey))

#### Server Configuration

- `ADMIN_KEY` - Secure admin-only endpoints
- `PORT` - Server port (default: 4000)

#### Client-Side Variables

- `NEXT_PUBLIC_OMEGA_API_URL` - Omega Network API endpoint
- `NEXT_PUBLIC_RELAYER_URL` - Relayer/faucet server URL
- `NEXT_PUBLIC_APP_VERSION` - Application version for display

#### Wallet Configuration (Required for Phase 4)

- `NEXT_PUBLIC_OMEGA_RPC_URL` - Omega Network RPC endpoint (e.g., `https://0x4e454228.rpc.aurora-cloud.dev`)
- `NEXT_PUBLIC_CONTRACT_ADDRESS` - SimpleMiner contract address (e.g., `0x54c731627f2d2b55267b53e604c869ab8e6a323b`)
- `NEXT_PUBLIC_FAUCET_ADDRESS` - Faucet contract address (e.g., `0xf8e00f8cfaccf9b95f703642ec589d1c6ceee1a9`)
- `NEXT_PUBLIC_MINER_FAUCET_ADDRESS` - Miner faucet contract address (e.g., `0x1c4ffffcc804ba265f6cfccffb94d0ae28b36207`)
- `NEXT_PUBLIC_MIXER_ADDRESS` - Mixer contract address (e.g., `0xc57824b37a7fc769871075103c4dd807bfb3fd3e`)
- `NEXT_PUBLIC_OMEGA_NFT_CONTRACT` - Omega Network ERC-721 NFT contract address (e.g., `0x3aa39fe2dab93838ed3ad314b8867a8792902dd7`)

#### NFT and IPFS Configuration (Phase 10)

- `PINATA_JWT` - **REQUIRED for NFT minting** - Pinata API JWT for IPFS uploads (get from [Pinata](https://app.pinata.cloud/developers/api-keys))
  - Server-side only - NEVER expose to client code
  - No NEXT*PUBLIC* prefix
  - Used by `/api/pinata/*` routes to upload images and metadata to IPFS
  - API routes will fail with clear error message if not configured

#### Other Variables

- `CHAINGPT_API_KEY` - ChainGPT production API key (server-side only)

**For complete environment variable documentation, always refer to [.env.example](.env.example) as the canonical source of truth.**

## 🎯 Migration Status

**Complete: Phases 1-13 ✅**

The Next.js 15 migration is progressing through a phased approach. Each phase implements a core aspect of the original Omega Terminal with modern TypeScript, improved architecture, and enhanced features.

### ✅ Phase 1: Project Initialization

- [x] Next.js 15 project setup with TypeScript
- [x] Directory structure (`src/app`, `src/components`, `src/lib`, `src/hooks`, `src/types`)
- [x] Configuration files (`next.config.ts`, `tsconfig.json`, `.env.local`)
- [x] Root layout with external CDN scripts (ethers.js, Solana Web3.js)
- [x] Basic terminal UI with boot animation
- [x] Global CSS with variables and animations
- [x] TypeScript type definitions
- [x] Application constants

### ✅ Phase 2: Configuration and Theme System

- [x] TypeScript configuration module (`src/lib/config.ts`)
  - Contract addresses and ABIs (SimpleMiner, Faucet, MinerFaucet, Mixer)
  - Network configuration (Omega Network with RPC and explorer URLs)
  - ChainGPT API configuration with environment loading
  - Available commands list for autocomplete
- [x] Utility functions with ethers v6 (`src/lib/utils.ts`)
  - Base58 decoding, duration/number formatting
  - Random hex generation, clipboard operations
  - Address validation and shortening
  - Mixer commitment generation with keccak256
  - Command parsing and HTML escaping
- [x] Theme management system (`src/lib/themes.ts`)
  - Theme descriptions and class name mapping
  - Type guards for theme validation
  - localStorage key for persistence
- [x] ThemeProvider with React Context (`src/providers/ThemeProvider.tsx`)
  - Client-side theme state management
  - Theme switching with CSS class management
  - localStorage persistence
  - Toggle theme functionality
- [x] Custom useTheme hook (`src/hooks/useTheme.ts`)
- [x] Environment variable handling
  - `NEXT_PUBLIC_` prefix for client-accessible values
  - Server-side only variables for sensitive keys
  - Comprehensive `.env.example` with documentation
- [x] Type definitions for config, utils, and theme systems

### ✅ Phase 3: Terminal UI Components

- [x] **BootAnimation Component**
  - Loading animation with Omega logo and progress bar
  - Feature badges display (AI, Multi-Chain, DeFi, NFTs)
  - Configurable duration with auto-complete callback
  - Fully responsive with mobile breakpoints
- [x] **TerminalContainer Component**
  - Main wrapper managing all terminal state
  - Command history management (up/down arrow navigation)
  - Terminal output lines with timestamps
  - Integration with ThemeProvider
  - Coordinated child component interactions
- [x] **TerminalHeader Component**
  - Title with version display
  - Social links (website, discord, twitter, docs) with SVG icons
  - Theme controls (palette cycle, theme cycle, light/dark toggle, dashboard toggle)
  - AI provider selector dropdown
  - Connection status indicator
- [x] **TerminalOutput Component**
  - Command history display with color-coded types
  - Auto-scrolling to latest output
  - User-selectable text for copying
  - Custom scrollbar styling
  - Support for command, output, error, success, warning, info line types
- [x] **TerminalInput Component**
  - Command input with custom prompt
  - Arrow Up/Down for command history navigation
  - Tab key for command autocomplete
  - Enter key for command submission
  - Focus management and keyboard event handling
- [x] **CSS Modules for Component Styling**
  - Scoped styles for each component
  - Mobile responsive breakpoints
  - Animation keyframes
  - Theme-aware styling
- [x] **Type Definitions**
  - `src/types/terminal.ts` with component prop types
  - TerminalLine, TerminalOutputProps, TerminalInputProps, etc.
- [x] **Integration**
  - Simplified `page.tsx` to use TerminalContainer
  - Enhanced `globals.css` with theme classes
  - Barrel exports in `src/components/Terminal/index.ts`

### ✅ Phase 4: Wallet Management System

- [x] **TypeScript Wallet Modules** (`src/lib/wallet/`)
  - `detection.ts` - MetaMask and Phantom wallet detection with MetaMask forcing logic
  - `connection.ts` - MetaMask connection, network management, and balance checking
  - `session.ts` - Ephemeral wallet creation and private key import
  - `index.ts` - Barrel export for clean API
- [x] **Ethers v6 Migration**
  - BrowserProvider instead of Web3Provider
  - Async getSigner() method
  - formatEther as top-level import
  - JsonRpcProvider for session wallets
- [x] **WalletProvider with React Context** (`src/providers/WalletProvider.tsx`)
  - Global wallet state management
  - Three wallet types: MetaMask, session (ephemeral), and imported
  - Connection methods: connectMetaMask, createSessionWallet, importSessionWallet
  - Wallet operations: disconnect, getBalance, getSigner, getProvider
  - Network management: addOmegaNetwork for MetaMask
  - Event listeners for account and chain changes
  - localStorage persistence for auto-reconnect
- [x] **Custom useWallet Hook** (`src/hooks/useWallet.ts`)
  - Access wallet context from any component
  - Provides wallet state and methods
  - Type-safe API
- [x] **WalletConnector UI Component** (`src/components/Wallet/WalletConnector.tsx`)
  - MetaMask connection with visual feedback
  - Session wallet creation with security warnings
  - Private key import with password input
  - Connected state display (address, balance, wallet type)
  - Status messages for user feedback
  - Loading states and error handling
- [x] **Wallet Types** (`src/types/wallet.ts`)
  - WalletType, WalletState, SessionWallet interfaces
  - WalletContextValue for provider API
  - EthereumProvider interface (EIP-1193)
- [x] **Terminal Integration**
  - TerminalContainer integrated with useWallet hook
  - Connection status updates based on wallet state
  - Wallet address display in TerminalHeader
  - Placeholder wallet commands (connect, disconnect, balance)
- [x] **Environment Configuration**
  - NEXT_PUBLIC_OMEGA_RPC_URL for Omega Network
  - NEXT_PUBLIC_CONTRACT_ADDRESS for SimpleMiner
  - NEXT_PUBLIC_FAUCET_ADDRESS for Faucet
  - NEXT_PUBLIC_MINER_FAUCET_ADDRESS for MinerFaucet
  - NEXT_PUBLIC_MIXER_ADDRESS for Mixer
- [x] **Security Features**
  - MetaMask forcing to handle multi-wallet scenarios
  - Phantom blocking for EVM operations
  - Private key validation
  - Session wallet warnings
  - Auto-reconnect for MetaMask

### ✅ Phase 5: Command System and Basic Commands (Current)

- [x] **Command System Architecture**
  - CommandRegistry for command registration and routing
  - TypeScript command types and interfaces (Command, CommandContext, CommandHandler, CommandMetadata)
  - Command execution with parsing and error handling
  - Command aliasing support
  - Category-based command organization
- [x] **useCommandExecution Hook**
  - Custom React hook integrating with React contexts
  - Command execution state management
  - Command history with navigation (up/down arrows)
  - Autocomplete functionality (tab key)
  - Integration with ThemeProvider and WalletProvider
  - AI provider state management
  - Execution locking to prevent concurrent runs
- [x] **Basic Commands** (`src/lib/commands/basic.ts`)
  - `help` - Display all commands or category-specific help (wallet, mining, market, ai, news, games, theme)
  - `clear` - Clear terminal output
  - `status` - Show system status (version, theme, GUI, AI mode, wallet status, network config)
  - `theme` - Manage terminal themes (list, set, toggle) with support for all AVAILABLE_THEMES
  - `gui` - Interface style transformations (placeholder with informative message for Phase 10)
  - `view` - Toggle view modes (basic/futuristic) (placeholder with preference saving for Phase 10)
  - `tab` - Tab management (placeholder with informative message for future enhancement)
  - `ai` - Chat with OMEGA AI (calls relayer AI endpoint, supports command execution)
- [x] **Command Context Integration**
  - log() function for terminal output
  - clearTerminal() for clearing output
  - executeCommand() for recursive command execution (AI feature)
  - theme context (currentTheme, setTheme, toggleTheme)
  - wallet context (state, connect, disconnect)
  - config access (contracts, network, relayer URL)
  - AI provider state (aiProvider, setAiProvider)
- [x] **TerminalContainer Integration**
  - Removed placeholder command handling logic
  - Integrated useCommandExecution hook
  - Registered all commands on mount via registerAllCommands()
  - Updated input handlers to use command system
  - Removed hardcoded AVAILABLE_COMMANDS (now from registry)
  - Wallet address display in header
- [x] **Type Definitions**
  - `src/types/commands.ts` with comprehensive command types
  - CommandContext interface with all required properties
  - CommandHandler type for command functions
  - Command and CommandMetadata interfaces
  - CommandRegistry interface
- [x] **Utilities and Configuration**
  - parseCommandArgs() in utils.ts for command string parsing
  - Updated config.ts with AVAILABLE_COMMANDS from original config.js
  - AVAILABLE_THEMES constant for theme validation
- [x] **Documentation**
  - Inline JSDoc comments for all types and functions
  - Usage examples in docstrings
  - Comprehensive help system with category-specific help
  - README updates with command system architecture

### ✅ Phase 6: Wallet Commands (Complete)

- [x] **Extended CommandContext Interface** (`src/types/commands.ts`)
  - Added wallet methods: createSessionWallet, importSessionWallet, getBalance, getSigner, getProvider, addOmegaNetwork
  - Added logHtml method for rich HTML content output
  - Full API access for wallet operations from command handlers
- [x] **Extended TerminalLine Type** (`src/types/terminal.ts`)
  - Added 'html' type for HTML content rendering
  - Added optional htmlContent property for rich formatting
  - Support for interactive elements (buttons, links) in terminal output
- [x] **useCommandExecution Hook Updates** (`src/hooks/useCommandExecution.ts`)
  - Implemented all extended wallet methods in CommandContext
  - Implemented logHtml function for HTML output
  - Error handling for wallet operations
  - Integration with WalletProvider for full wallet API
- [x] **Wallet Commands Module** (`src/lib/commands/wallet.ts`)
  - `connect` - Connect to MetaMask or guide to wallet options
  - `disconnect` - Disconnect current wallet with confirmation
  - `balance` - Show wallet balance with type and address info
  - `send` - Send OMEGA tokens with amount and address validation
  - `create` / `yes` - Create new session wallet with funding
  - `import` - Import wallet from private key
  - `export` - Export wallet info with private key reveal buttons
  - `test-wallet` / `wallet-test` - Test wallet connection and show diagnostics
  - Helper functions: fundOmegaWallet, showFundingAlternatives
  - HTML output for interactive elements (copy buttons, reveal buttons, explorer links)
  - Security warnings and best practices messaging
- [x] **Command Registration** (`src/lib/commands/index.ts`)
  - Imported and registered all wallet commands
  - Updated comments to show Phase 6 completion
  - Export walletCommands for external access
- [x] **TransactionModal Component** (`src/components/Wallet/TransactionModal.tsx`)
  - Transaction confirmation UI with details display
  - Confirm/Cancel action buttons
  - Loading states and processing feedback
  - Escape key and overlay click to close
  - Mobile responsive design
  - Ready for future integration with send command
- [x] **TransactionModal Styles** (`src/components/Wallet/TransactionModal.module.css`)
  - Glass-morphism design with backdrop blur
  - Animations (fadeIn, slideIn, spin)
  - Mobile responsive breakpoints
  - Themed styling matching terminal aesthetics
- [x] **Wallet Component Exports** (`src/components/Wallet/index.ts`)
  - Added TransactionModal export
  - Updated documentation comments
- [x] **TerminalOutput HTML Support** (`src/components/Terminal/TerminalOutput.tsx`)
  - Render HTML content for 'html' type lines
  - dangerouslySetInnerHTML for rich formatting
  - Security notes in documentation
- [x] **TerminalOutput HTML Styles** (`src/components/Terminal/TerminalOutput.module.css`)
  - Styles for .html class with buttons and links
  - Button hover effects and transitions
  - Link styling with color transitions
- [x] **Documentation**
  - Comprehensive JSDoc comments for all new code
  - Usage examples and security warnings
  - Notes about deferred features (multi-network support in Phase 7, sound effects in Phase 11)
  - Transaction confirmation modal marked as future enhancement

**Key Features:**

- Full wallet command suite with 8 commands
- HTML content support for interactive terminal elements
- Transaction confirmation modal (ready for future integration)
- Session wallet funding via relayer/faucet
- Private key management with reveal/copy functionality
- Wallet diagnostics and troubleshooting
- Explorer link integration
- Security warnings and best practices

**Deferred to Future Phases:**

- Multi-network support (NEAR, Solana, Fair, Shade Agents) → Phase 7
- Sound effects integration → Phase 11
- Transaction confirmation modal UI integration → Future enhancement

### ✅ Phase 7: Mining and Network Commands (Complete)

- [x] **Mining Commands Module** (`src/lib/commands/mining.ts`)
  - `mine` - Start automated mining with relayer API (avoids MetaMask confirmations)
  - `claim` - Claim pending mining rewards with direct contract interaction
  - `faucet [status]` - Claim from faucet or check cooldown status
  - `stats` - Show detailed mining statistics (balance, mined, pending, cooldown)
  - Helper functions: generateFakeHash, showFaucetStatus
  - Mining animation with spinner frames
  - Ethers v6 API integration (Contract, JsonRpcProvider, formatEther)
- [x] **Network Stress Test Module** (`src/lib/commands/network.ts`)
  - `stress` - Start network stress test with random transactions
  - `stopstress` - Stop running stress test with final statistics
  - `stressstats` - Show live stress test statistics
  - Helper functions: requestStressFunding, performStressTransaction
  - Multiple transaction types (transfer, contract_call, mining)
  - Transaction rate and success rate tracking
- [x] **Extended CommandContext** (`src/types/commands.ts`)
  - `miningState` - Mining state management (isMining, mineCount, totalEarned, start/stop)
  - `stressTestState` - Stress test state management (isStressTesting, stats, start/stop)
  - `getContract` - Contract instance creation helper
- [x] **useCommandExecution Updates** (`src/hooks/useCommandExecution.ts`)
  - Mining state management with useState and useRef
  - Stress test state management with statistics tracking
  - Contract creation helper (getContract)
  - Cleanup on unmount to stop running operations
  - Window updaters for command access to state setters
- [x] **Mining UI Components** (`src/components/Mining/`)
  - `MiningStatus.tsx` - Real-time mining status display with elapsed time, blocks mined, earnings
  - `MiningStatus.module.css` - Themed styles with animations (pulse, rotate)
  - `StressTestStats.tsx` - Live stress test statistics with success rate, tx rate, progress bar
  - `StressTestStats.module.css` - Themed styles with progress bar animations
  - `index.ts` - Barrel export for Mining components
- [x] **TerminalContainer Integration**
  - Conditional rendering of MiningStatus widget when mining is active
  - Conditional rendering of StressTestStats widget when stress test is running
  - Stop buttons integrated with command execution
- [x] **Stop Command** (`src/lib/commands/basic.ts`)
  - Universal stop command to halt mining and stress test operations
  - Intelligent detection of running operations
  - User feedback for stopped operations
- [x] **Command Registration** (`src/lib/commands/index.ts`)
  - Registered mining commands (4 commands)
  - Registered network commands (3 commands)
  - Updated phase documentation

**Key Features:**

- Automated mining with 15-second intervals using relayer API
- Direct contract interaction for claiming rewards
- Faucet integration with 24-hour cooldown checking
- Network stress testing with configurable transaction types
- Real-time status widgets with live statistics
- Mining animation with hash generation
- Transaction rate and success rate metrics
- Ethers v6 integration throughout
- Mobile-responsive UI components with themed styling

**Mining Flow:**

1. User runs `mine` command
2. Mining state starts, UI widget appears
3. Loop sends POST requests to relayer every 15 seconds
4. Rewards tracked and displayed in real-time
5. User can stop with `stop` command or widget button

**Stress Test Flow:**

1. User runs `stress` command
2. Creates random wallet and requests funding
3. Sends random transactions (transfer, contract_call, mining) every 2 seconds
4. Tracks success/failure rates, transaction count, duration
5. User can stop with `stopstress` command or widget button

### ✅ Phase 8: Multi-Chain Integration (Solana, NEAR, Eclipse) - Complete

- [x] **Multi-Chain SDK Integration**
  - Installed @solana/web3.js (^1.95.0) for Solana blockchain operations
  - Installed near-api-js (^4.0.3) for NEAR Protocol integration
  - Installed bs58 (^5.0.0) for base58 encoding/decoding
- [x] **Type System Extensions**
  - Created `src/types/multichain.ts` with multi-chain wallet and token types
  - Extended `CommandContext` with multichain property for cross-chain operations
  - Defined ChainType, SolanaWalletState, NEARWalletState, EclipseWalletState
  - Created TokenInfo, SwapQuote, and SwapRoute interfaces
- [x] **Configuration Updates**
  - Added multi-chain RPC endpoints to config.ts
  - Configured Solana RPC (Helius), NEAR RPC, Eclipse RPC
  - Added Jupiter API, Solar DEX API, and Deserialize API endpoints
  - Environment variables for multi-chain configuration
- [x] **Solana Integration** (`src/lib/multichain/solana/`)
  - `wallet.ts` - Phantom connection, wallet generation, balance queries
  - `jupiter.ts` - Jupiter aggregator API client for token search and swaps
  - `transaction.ts` - Transaction signing and sending (Phantom + browser wallets)
  - Support for VersionedTransaction and legacy Transaction types
  - RPC connectivity testing and diagnostics
- [x] **NEAR Integration** (`src/lib/multichain/near/`)
  - `wallet.ts` - NEAR wallet connection with popup authentication
  - `swap.ts` - Token swap integration (placeholder for Ref Finance)
  - `shade-agent.ts` - Shade Agent placeholder (deferred to Phase 14)
  - BrowserLocalStorageKeyStore for key management
  - Account balance queries and wallet state management
- [x] **Eclipse Integration** (`src/lib/multichain/eclipse/`)
  - `wallet.ts` - Eclipse wallet management (Solana-compatible, uses ETH as native currency)
  - `dex.ts` - Dual DEX integration (Solar DEX + Deserialize aggregator)
  - Smart routing: SOLAR token → Solar DEX, other tokens → Deserialize
  - Token list merging and price comparison
- [x] **MultiChainProvider** (`src/providers/MultiChainProvider.tsx`)
  - React Context provider for global multi-chain wallet state
  - Manages Solana, NEAR, and Eclipse wallet states independently
  - Connection methods for Phantom and NEAR wallets
  - Browser wallet generation for Solana and Eclipse
  - Balance queries and transaction methods
  - localStorage persistence for wallet recovery
- [x] **Custom Hook** (`src/hooks/useMultiChain.ts`)
  - Convenient access to multichain context
  - Type-safe API for all multi-chain operations
  - Error handling for usage outside provider
- [x] **React Components** (`src/components/MultiChain/`)
  - `SolanaSwapInterface.tsx` - Placeholder for Solana swap UI
  - `EclipseSwapInterface.tsx` - Placeholder for Eclipse swap UI
  - CSS Modules for themed styling
  - Note: Full React integration coming in future enhancements
- [x] **Command Modules**
  - `src/lib/commands/solana.ts` - 8 Solana commands (connect, generate, status, test, search, quote, swap, help)
  - `src/lib/commands/near.ts` - 7 NEAR commands (connect, disconnect, balance, swap, tokens, shade, help)
  - `src/lib/commands/eclipse.ts` - 7 Eclipse commands (connect, generate, balance, tokens, price, swap, help)
  - Interactive HTML output for swap interfaces
  - Token search with Jupiter API
  - Wallet diagnostics and connectivity tests
- [x] **Command System Integration**
  - Updated `src/lib/commands/index.ts` to register multi-chain commands
  - Extended `useCommandExecution` hook with multichain context
  - Integrated MultiChainProvider into app layout.tsx
  - Commands accessible from terminal (solana, near, eclipse)
- [x] **Documentation**
  - Comprehensive JSDoc comments for all multi-chain code
  - Usage examples and command help systems
  - Security warnings for wallet operations
  - Phased approach notes (Shade Agents in Phase 14)

**Key Features:**

- **Solana Operations:**

  - Connect to Phantom wallet
  - Generate browser wallets with private key export
  - Search tokens via Jupiter API
  - Get swap quotes with price impact calculation
  - Interactive swap interface (HTML-based)
  - Balance queries in SOL
  - RPC connectivity diagnostics

- **NEAR Operations:**

  - Connect to NEAR wallet (popup authentication)
  - View account balance
  - List available tokens
  - Swap interface (placeholder - links to Ref Finance)
  - Shade Agent commands (informative placeholders for Phase 14)

- **Eclipse Operations:**

  - Connect to Phantom wallet for Eclipse network
  - Generate browser wallets
  - Smart DEX routing (Solar DEX vs Deserialize)
  - Token list with dual DEX support
  - Price comparison across DEXs
  - Balance queries in ETH (native currency)

- **Multi-Chain Architecture:**
  - Separate wallet state for each blockchain
  - Independent connection management
  - Unified command interface
  - React Context integration
  - Type-safe APIs throughout

**Multi-Chain Commands:**

```bash
# Solana commands
solana connect          # Connect Phantom wallet
solana generate         # Create browser wallet
solana status           # Show wallet info
solana test             # Test RPC connectivity
solana search BONK      # Search for tokens
solana quote <from> <to> <amount>  # Get swap quote
solana swap             # Interactive swap interface

# NEAR commands
near connect            # Connect NEAR wallet
near disconnect         # Disconnect wallet
near balance            # Show balance
near tokens             # List available tokens
near swap <from> <to> <amount>  # Token swap
near shade deploy <name>  # Deploy Shade Agent (Phase 14)

# Eclipse commands
eclipse connect         # Connect Phantom wallet
eclipse generate        # Create browser wallet
eclipse balance         # Show balance
eclipse tokens          # List all tokens
eclipse price <mint>    # Get token price
eclipse swap            # Interactive swap interface
```

**Deferred to Phase 14:**

- NEAR Shade Agent deployment with Phala TEE integration
- Chain Signatures for multi-chain operations
- Multi-chain address derivation (Ethereum, Bitcoin, etc.)
- Autonomous arbitrage monitoring and execution
- Advanced agent management (start, stop, logs, config updates)

**Technical Notes:**

- Swap interfaces currently use HTML output in terminal
- Full React component integration planned for future updates
- NEAR swap execution deferred (use Ref Finance directly for now)
- Eclipse uses Solana-compatible wallets with different RPC
- MultiChainProvider works alongside WalletProvider (EVM)

### ✅ Phase 9: API Integration Commands (DexScreener, GeckoTerminal, Alpha Vantage, DeFi Llama, PGT) - Complete

- [x] **API Client Libraries** (`src/lib/api/`)
  - `dexscreener.ts` - Token search, trending tokens, analytics (Next.js 15 caching with 60-120s revalidation)
  - `geckoterminal.ts` - DEX pair search, network/DEX lists (1-hour cache for static data)
  - `alphavantage.ts` - Stock quotes, daily data, company overviews, macro economics (1min-24h caching)
  - `defillama.ts` - TVL queries, protocol rankings, chain analytics, token prices (5min caching)
  - `pgt.ts` - Wallet tracking, portfolio management, multi-network support (1min caching)
  - `index.ts` - Barrel export with namespace imports
- [x] **Command Modules** (`src/lib/commands/`)
  - `dexscreener.ts` - DexScreener and GeckoTerminal commands (search, trending, networks, dexes)
  - `alphavantage.ts` - Alpha Vantage commands (quote, daily, overview, inflation, cpi, gdp)
  - `defillama.ts` - DeFi Llama commands (tvl, protocols, chains, price, tokens, trending, debug)
  - `pgt.ts` - PGT commands (track, portfolio, wallets, wallet, remove, test)
  - `chart.ts` - Chart command placeholder (deferred to Phase 15)
- [x] **Analytics Components** (`src/components/Analytics/`)
  - `TokenCard.tsx` - Token information cards with copy buttons
  - `ProtocolCard.tsx` - Protocol cards with TVL and change indicators
  - `ChainCard.tsx` - Chain TVL cards
  - CSS Modules for themed styling matching original plugins
- [x] **Type System** (`src/types/api.ts`)
  - DexScreenerPair, GeckoTerminalPair interfaces
  - AlphaVantageQuote, AlphaVantageTimeSeries interfaces
  - DeFiLlamaProtocol, DeFiLlamaChain, DeFiLlamaTokenPrice interfaces
  - PGTWallet, PGTPortfolio interfaces
- [x] **Utilities**
  - formatCurrency function for USD display in utils.ts
  - Token mapping system for DeFi Llama price lookups
  - Rich HTML output with styled cards
- [x] **Command Registration**
  - Registered 5 API command groups in CommandRegistry
  - 20+ individual commands across all integrations
  - Console logging for successful registrations
- [x] **Next.js 15 Features**
  - Fetch API with revalidation for caching
  - Server/client component separation
  - Optimal cache timings per data type
- [x] **Documentation**
  - Comprehensive JSDoc comments
  - Usage examples in command help
  - README updates with API architecture
  - Phase completion notes

**Key Features:**

- **DexScreener Integration:**
  - Token search across multiple DEXes
  - Trending tokens with 24h volume
  - Interactive token cards with copy buttons
  - Advanced features (portfolio, watchlist, alerts) deferred to Phase 15
- **GeckoTerminal Integration:**
  - Pair search with price data
  - Network list (50+ supported networks)
  - DEX listings per network
- **Alpha Vantage Integration:**
  - Real-time stock quotes with OHLC data
  - Daily historical data (last 5 trading days)
  - Company overviews with fundamentals
  - Macroeconomic data (inflation, CPI, GDP)
  - Rate-aware caching (5 req/min, 500/day)
- **DeFi Llama Integration:**
  - Total DeFi TVL across all chains
  - Protocol rankings with TVL changes
  - Chain analytics with 24h trends
  - Token price lookups with confidence scores
  - Multiple token price queries
  - Trending protocols (top gainers)
  - Debug mode for troubleshooting
- **PGT Integration:**
  - Multi-wallet tracking (ethereum, polygon, bsc, arbitrum, optimism, base, solana)
  - Portfolio overview with total value
  - Wallet-level P&L tracking
  - Token holdings monitoring
  - Connection testing and diagnostics
  - CORS considerations (works in production)

**Next.js 15 Caching Strategy:**

- **Real-time data (60s):** Token prices, stock quotes, wallet balances
- **Protocol data (300s):** TVL, chain rankings, protocol stats
- **Static data (3600s):** Networks, company info, DEX lists
- **Macro data (86400s):** Economic indicators (inflation, CPI, GDP)

**API Commands:**

```bash
# DexScreener
ds search WETH              # Search tokens
ds trending                 # Trending tokens
ds analytics                # Analytics dashboard (Phase 15)
ds portfolio                # Portfolio tracking (Phase 15)

# GeckoTerminal
cg search USDC              # Search pairs
cg networks                 # List networks
cg dexes eth                # List DEXes on network

# Alpha Vantage
alpha quote AAPL            # Stock quote
alpha daily AAPL            # Daily data
alpha overview AAPL         # Company info
alpha inflation             # Inflation data
alpha cpi                   # CPI data
alpha gdp                   # GDP data

# DeFi Llama
defillama tvl               # Total DeFi TVL
defillama tvl uniswap       # Protocol TVL
defillama protocols 10      # Top 10 protocols
defillama chains 15         # Top 15 chains
defillama price eth         # Token price
defillama tokens eth,btc    # Multiple prices
defillama trending          # Top gainers
defillama debug eth         # Debug lookup

# PGT (Portfolio Global Tracker)
pgt track 0x123... ethereum # Track wallet
pgt portfolio               # Portfolio overview
pgt wallets                 # List tracked wallets
pgt wallet 0x123... ethereum # Wallet details
pgt remove 0x123... ethereum # Remove wallet
pgt test                    # Test connection

# Charts (Phase 15)
chart AAPL                  # Chart placeholder
```

**Deferred to Phase 15:**

- Advanced DexScreener features (portfolio management, watchlist, alerts, gem discovery)
- Chart functionality with TradingView widget integration
- Futuristic dashboard view for charts
- Sound effects integration (Phase 16)

**Technical Architecture:**

```
API Integration Flow:
User Command → CommandRegistry → API Command Handler → API Client → External API
                                         ↓
                                 Next.js Cache (fetch revalidation)
                                         ↓
                                 Relayer Proxy (DexScreener, Alpha Vantage)
                                         ↓
                                 Terminal Output (HTML cards with styling)
```

### ✅ Phase 10: NFT Marketplace Integration (OpenSea, Magic Eden, On-Chain Minting) - Complete

- [x] **NFT Type Definitions** (`src/types/nft.ts`)
  - `NFTMetadata` - ERC-721 standard metadata structure
  - `OpenSeaNFT` - OpenSea API v2 NFT data structure
  - `OpenSeaCollection` - Collection details with stats
  - `OpenSeaStats` - Collection statistics and intervals
  - `MagicEdenListing` - Solana NFT listing data
  - `MagicEdenStats` - Magic Eden collection stats
  - `MagicEdenActivity` - Transaction activity data
  - `MintedNFT` - Locally stored minted NFT records
  - `NFTTrait` - NFT attribute/trait structure
- [x] **API Client Libraries** (`src/lib/api/`)
  - `opensea.ts` - OpenSea API v2 client (requires free API key)
    - getApiKey/setApiKey - localStorage-based API key management
    - searchCollections - Search popular collections (hardcoded database)
    - getCollection - Fetch collection details
    - getCollectionStats - Get collection statistics
    - getCollectionNFTs - Fetch NFTs from collection
    - getNFTDetails - Get individual NFT details
    - testApiKey - Validate API key
  - `magiceden.ts` - Magic Eden Solana marketplace client (relayer proxy, no API key needed)
    - fetchActivities - Recent collection activities
    - fetchStats - Collection statistics
    - fetchListings - Current NFT listings
    - fetchHolderStats - Holder statistics
    - fetchAttributes - Collection attributes/traits
    - fetchTrending - Trending collections (1h/1d/7d/30d)
    - formatSOL/formatTime/getActivityEmoji - Helper functions
  - `pinata.ts` - Pinata IPFS upload client (server-side JWT protection)
    - uploadImageToIPFS - Upload image via Next.js API route
    - uploadMetadataToIPFS - Upload metadata JSON
    - uploadNFTToIPFS - Complete NFT upload (image + metadata)
- [x] **Next.js API Routes** (`src/app/api/`)
  - `pinata/upload-image/route.ts` - Secure image upload to IPFS (protects JWT)
  - `pinata/upload-metadata/route.ts` - Secure metadata upload to IPFS
  - `magiceden/activities/route.ts` - Activities proxy with caching (60s revalidation)
  - `magiceden/stats/route.ts` - Stats proxy with caching (2min revalidation)
  - `magiceden/listings/route.ts` - Listings proxy with caching (60s revalidation)
  - `magiceden/trending/route.ts` - Trending proxy with caching (5min revalidation)
- [x] **React Components** (`src/components/NFT/`)
  - `NFTCard.tsx` - OpenSea NFT card with purple theme, price display, action buttons (View/Buy/Bid)
  - `MagicEdenCard.tsx` - Compact Magic Eden NFT card with cyan theme, SOL price
  - `NFTGallery.tsx` - Responsive grid for OpenSea NFTs with load more functionality
  - `MagicEdenGallery.tsx` - Compact grid for Magic Eden Solana NFTs
  - `MintNFTModal.tsx` - NFT minting modal with image upload, metadata editor, trait management (Phase 15 integration)
  - All components with CSS Modules for scoped styling
- [x] **Command Modules** (`src/lib/commands/`)
  - `opensea.ts` - OpenSea marketplace commands
    - nft setup <api-key> - Configure OpenSea API key (stored in localStorage)
    - nft search <query> - Search collections (popular collections database)
    - nft collection <slug> - View collection details
    - nft assets <slug> [limit] - View collection NFTs (default 12)
    - nft item <collection> <tokenId> - View specific NFT details
    - nft analytics <slug> - Collection analytics dashboard
    - nft floor <slug> - Get floor price
    - nft trending - Trending collections (demo data)
    - nft buy/bid/sell - Trading placeholders (Phase 15 - OpenSea SDK integration)
    - nft portfolio/watchlist - Portfolio tracking placeholders (Phase 15)
  - `magiceden.ts` - Magic Eden Solana marketplace commands
    - magiceden view <symbol> [limit] - View collection with stats and NFTs
    - magiceden activities <symbol> [limit] - Recent activities
    - magiceden stats <symbol> - Collection statistics
    - magiceden listings <symbol> [limit] - Current listings
    - magiceden holders <symbol> - Holder statistics
    - magiceden attributes <symbol> - Collection attributes
    - magiceden trending [timeRange] - Trending collections (1h/1d/7d/30d)
    - Aliases: me, magiceden
  - `nft-mint.ts` - Omega Network on-chain minting commands
    - omega mint - Minting UI instructions (Phase 15: modal integration)
    - omega collection - View your minted NFTs from localStorage
    - omega view <index> - View specific minted NFT details
    - omega contract - View Omega NFT contract information
    - NFT collection stored in localStorage (omega-user-nfts-v2 key)
- [x] **Configuration Updates** (`src/lib/config.ts`, `src/types/config.ts`)
  - OMEGA_NFT_CONTRACT - ERC-721 contract address (0x3aa39fe2dab93838ed3ad314b8867a8792902dd7)
  - OMEGA_NFT_ABI - ERC-721 function signatures (mint, tokenURI, balanceOf, ownerOf, totalSupply, name, symbol)
  - OPENSEA_API_BASE_URL - OpenSea API v2 endpoint
  - OPENSEA_V1_URL - OpenSea API v1 endpoint
  - Added NFT commands to AVAILABLE_COMMANDS (nft, opensea, magiceden, me, omega)
- [x] **Command Registration** (`src/lib/commands/index.ts`)
  - Registered openseaCommands (1 command: nft with multiple subcommands)
  - Registered magicedenCommands (1 command: magiceden with multiple subcommands)
  - Registered omegaMintCommands (1 command: omega with multiple subcommands)

**Key Features:**

- **OpenSea Integration**: Search collections, view NFTs, detailed analytics, API key management
- **Magic Eden Integration**: Solana NFT marketplace with relayer proxy (no API key needed)
- **On-Chain Minting**: Omega Network ERC-721 NFT minting with IPFS storage
- **Secure IPFS Uploads**: Pinata JWT protected via Next.js API routes
- **NFT Collection Display**: localStorage-based collection management
- **Rich Terminal Output**: HTML-based NFT cards and galleries with styled components

**Deferred to Phase 15 (Futuristic UI System):**

- OpenSea SDK trading (buy/sell/bid via OpenSea contracts)
- Portfolio tracking and management
- Watchlist with price alerts
- Gem discovery and rarity tracking
- Full MintNFTModal UI integration
- React modal-based minting workflow

**Architecture Highlights:**

- OpenSea requires free API key (localStorage storage)
- Magic Eden uses relayer proxy (CORS-free, cached responses)
- Pinata JWT secured server-side (Next.js API routes)
- NFT collection persisted in localStorage
- ethers v6 for ERC-721 contract interaction
- Next.js 15 caching for all API routes (60s-5min revalidation)

**NFT Commands Quick Reference:**

```bash
# OpenSea
nft setup <api-key>              # Configure API key
nft search azuki                 # Search collections
nft assets azuki 12              # View 12 NFTs from collection
nft item azuki 1234              # View specific NFT
nft analytics azuki              # Collection analytics

# Magic Eden (Solana)
magiceden view degods            # View collection
me trending 1d                   # Trending today
me activities degods 20          # Recent activities

# Omega Minting
omega mint                       # Minting instructions (Phase 15: modal)
omega collection                 # View your minted NFTs
omega view 0                     # View specific NFT
omega contract                   # Contract info
```

### ✅ Phase 11: ChainGPT AI Integration (Chat, Smart Contract Generator, Auditor, NFT Generator) - Complete

- [x] **ChainGPT Type Definitions** (`src/types/chaingpt.ts`)
  - `ChainGPTChatRequest` - Chat API request with model, question, history, custom context
  - `ChainGPTChatResponse` - Chat response with bot answer and status
  - `ChainGPTContractRequest` - Smart contract generation request
  - `ChainGPTContractResponse` - Generated contract code response
  - `ChainGPTAuditorRequest` - Contract auditing request
  - `ChainGPTAuditorResponse` - Security audit report response
  - `ChainGPTNFTRequest` - NFT generation with model, size, prompt
  - `ChainGPTNFTResponse` - Generated NFT images with URLs
  - `ChainGPTStreamChunk` - Streaming response chunk structure
  - `ChainGPTApiKeyConfig` - API key configuration management
- [x] **ChainGPT API Client** (`src/lib/api/chaingpt.ts`)
  - `getApiKey()` - Retrieve user or default API key
  - `setApiKey(apiKey)` - Store user's custom API key
  - `getAllApiKeys()` - Get all available keys for rotation
  - `isInitialized()` - Check initialization status
  - `initialize(apiKey?)` - Initialize with optional custom key
  - `chatStream(request)` - Streaming chat with ReadableStream
  - `chatBlob(request)` - Non-streaming chat response
  - `generateContract(request)` - Smart contract generation stream
  - `auditContract(request)` - Contract audit stream
  - `generateNFT(request)` - NFT generation with retry logic
  - `parseStreamChunk(chunk)` - Parse streaming chunks
  - API key management with localStorage and fallback rotation
  - Comprehensive retry logic for NFT endpoints
- [x] **React Components** (`src/components/AI/`)
  - `ChatMessage.tsx` - AI chat message display component (Phase 15 integration)
  - Role-based styling (user vs assistant)
  - Avatar/icon display with gradients
  - Timestamp formatting (relative time)
  - Streaming indicator with pulsing animation
  - CSS Modules for scoped styling
- [x] **Command Modules** (`src/lib/commands/`)
  - `chaingpt-chat.ts` - ChainGPT Web3 AI Chatbot
    - chat init [api-key] - Initialize with API key
    - chat ask <question> - Ask question (blob response)
    - chat stream <question> - Ask with streaming (real-time)
    - chat context <question> - Chat with Omega Terminal context
    - chat history <question> - Chat with conversation memory
    - chat test - Test API connection
    - chat help - Comprehensive help and examples
  - `chaingpt-contract.ts` - Smart Contract Generator
    - contract init [api-key] - Initialize generator
    - contract generate <prompt> - Generate contract
    - contract templates - Show contract types (token, nft, dex, staking, dao, etc.)
    - contract chains - Show supported blockchains
    - contract test - Test configuration
    - contract help - Help and examples
    - Options: --type, --chain, --features, --security
  - `chaingpt-auditor.ts` - Smart Contract Auditor
    - auditor init [api-key] - Initialize auditor
    - auditor audit <code> - Audit smart contract
    - auditor severity - Show severity levels (critical, high, medium, low, info)
    - auditor categories - Show security categories
    - auditor test - Test configuration
    - auditor help - Help and examples
    - Options: --type, --chain, --level, --focus, --no-gas
  - `chaingpt-nft.ts` - AI NFT Generator
    - nftgen init [api-key] - Initialize generator
    - nftgen generate <prompt> - Generate NFT artwork
    - nftgen enhance <prompt> - Enhance prompt (coming soon)
    - nftgen models - Show AI models (velogen, nebula_forge_xl, Dale3)
    - nftgen styles - Show art styles (anime, cinematic, pixel-art, etc.)
    - nftgen gallery - View generated NFTs
    - nftgen test - Test configuration
    - nftgen help - Help and examples
    - Options: --model, --style, --size, --enhance
    - Gallery storage in localStorage (last 50 NFTs)
- [x] **Configuration Updates** (`src/lib/config.ts`)
  - CHAINGPT.BASE_URL - ChainGPT API base URL
  - CHAINGPT.CHAT_ENDPOINT - Chat streaming endpoint
  - CHAINGPT.NFT_ENDPOINT - NFT generation endpoint
  - CHAINGPT.DEFAULT_API_KEYS - Fallback API keys array
  - CHAINGPT.getApiKey() - Helper to retrieve best available key
  - CHAINGPT.getAllApiKeys() - Helper to get all keys for rotation
- [x] **Command Registration** (`src/lib/commands/index.ts`)
  - Registered chatCommands (1 command: chat with multiple subcommands)
  - Registered contractCommands (1 command: contract with multiple subcommands)
  - Registered auditorCommands (1 command: auditor with multiple subcommands)
  - Registered nftgenCommands (1 command: nftgen with multiple subcommands)

**Key Features:**

- **Streaming Support**: Real-time AI responses using ReadableStream API
- **API Key Management**: User keys + fallback rotation with localStorage
- **Rich Terminal Output**: Styled HTML cards with gradients, copy buttons, metadata
- **Progressive Display**: Chunks logged immediately for streaming responses
- **Comprehensive Help**: Detailed help, examples, templates for each command
- **NFT Gallery**: localStorage-based gallery for generated NFTs (last 50)
- **Multiple Models**: Support for various AI models (velogen, Dale3, etc.)
- **Security Auditing**: Severity levels and security categories for contract audits
- **Template System**: Pre-defined contract types and blockchain support

**Streaming Implementation:**

```typescript
// Chat streaming with progressive output
const reader = await chaingpt.chatStream({ question, chatHistory: "off" });
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value, { stream: true });
  const content = chaingpt.parseStreamChunk(chunk);

  if (content) {
    context.log(content, "output"); // Progressive display
  }
}
```

**ChainGPT Commands Quick Reference:**

```bash
# Chat Commands
chat init                        # Initialize with default key
chat init <api-key>              # Initialize with your key
chat ask What is DeFi?           # Ask question
chat stream Explain blockchain   # Streaming response
chat context How do I use this?  # With Omega context
chat history What did we discuss?# With conversation memory

# Smart Contract Generator
contract generate ERC-20 token   # Generate contract
contract generate --type nft --chain polygon ArtNFT
contract templates               # Show templates
contract chains                  # Show blockchains

# Smart Contract Auditor
auditor audit "contract Token { ... }"
auditor audit --level comprehensive --focus reentrancy
auditor severity                 # Show severity levels
auditor categories               # Show security categories

# NFT Generator
nftgen generate cyberpunk cat    # Generate NFT
nftgen generate --model Dale3 --style anime warrior
nftgen models                    # Show models
nftgen styles                    # Show styles
nftgen gallery                   # View collection
```

**Credit Costs:**

- Chat (ask): ~0.5 credits
- Chat (with history): ~1.0 credits
- Smart contract generation: varies (typically 2-5 credits)
- Contract auditing: varies (2-5 credits)
- NFT generation: 1.0 credit (standard models), 4.75 credits (Dale3)

**Architecture Highlights:**

- Unified ChainGPT API client with streaming support
- ReadableStream API for progressive responses
- localStorage for API keys and NFT gallery
- Fallback API key rotation on errors
- HTML output via context.logHtml for rich formatting
- Extensive retry logic for NFT generation (multiple endpoints)
- ChatMessage component for future Phase 15 (futuristic UI)

### ✅ Phase 12: Media Players and News Reader (Spotify, YouTube, CryptoNews) - Complete

- [x] **Media Player Type Definitions** (`src/types/media.ts`)
  - `SpotifyAuthState` - Spotify OAuth authentication state (tokens, device ID)
  - `SpotifyPlayerState` - Playback state (track, playing, position, volume, panel open)
  - `SpotifyTrack` - Track metadata (name, artists, album, duration, URI)
  - `SpotifyPlaylist` - Playlist metadata (name, tracks, images, URI)
  - `YouTubePlayerState` - YouTube player state (video, playing, playlist, panel open)
  - `YouTubeVideo` - Video metadata from Data API v3
  - `NewsArticle` - Crypto news article (title, source, sentiment, votes, currencies)
  - `NewsFilter` - News category filter type ('hot' | 'latest' | 'bullish' | 'bearish')
  - `NewsReaderState` - News reader state (articles, filter, loading, panel open)
- [x] **React Context Providers** (`src/providers/`)
  - `SpotifyProvider.tsx` - Spotify authentication and playback management
    - OAuth 2.0 PKCE flow with popup authentication
    - Web Playback SDK integration (Premium account required)
    - Token management with localStorage persistence
    - Search tracks and playlists via Spotify Web API
    - Playback controls (play, pause, skip, volume)
    - Session restoration with token expiry validation
  - `YouTubeProvider.tsx` - YouTube player and API integration
    - YouTube IFrame API for video playback
    - YouTube Data API v3 for search and channel videos
    - Bloomberg Technology default channel loading
    - Playlist management with next/previous navigation
    - No authentication required for basic playback
  - `NewsReaderProvider.tsx` - Crypto news aggregation
    - Multi-source news fetching (CryptoPanic, CryptoCompare, mock data)
    - Category filtering (hot, latest, bullish, bearish)
    - Auto-refresh every 5 minutes when panel open
    - Sentiment analysis from article votes
    - Cryptocurrency-specific news filtering
- [x] **Custom Hooks** (`src/hooks/`)
  - `useSpotify.ts` - Re-export hook from SpotifyProvider
  - `useYouTube.ts` - Re-export hook from YouTubeProvider
  - `useNewsReader.ts` - Re-export hook from NewsReaderProvider
  - All hooks provide type-safe access to provider contexts
  - Throw descriptive errors when used outside providers
- [x] **CryptoNews API Client** (`src/lib/api/cryptonews.ts`)
  - `getNews(options)` - Fetch news with filter and cryptocurrency parameters
  - Multi-source fallback chain:
    1. CryptoPanic (primary) - Comprehensive crypto news with sentiment
    2. CryptoCompare (fallback) - Crypto market news
    3. Mock data (last resort) - Ensures graceful degradation
  - `analyzeSentiment(votes)` - Sentiment analysis (bullish/bearish/neutral)
  - `formatTimeAgo(timestamp)` - Relative time formatting (e.g., '5m ago')
  - `extractCryptocurrencies(text)` - Extract crypto symbols from text
  - Next.js caching with 2-minute revalidation
  - Rate limit awareness for API tiers
- [x] **Command Modules** (`src/lib/commands/`)
  - `spotify.ts` - Spotify Player Commands
    - spotify open - Open Spotify player panel (Phase 15 preview)
    - spotify close - Close player panel
    - spotify search <query> - Search for tracks
    - spotify play - Resume playback
    - spotify pause - Pause playback
    - spotify next - Skip to next track
    - spotify prev - Skip to previous track
    - spotify playlists - Show user playlists
    - spotify volume <0-100> - Set volume level
    - spotify logout - Disconnect from Spotify
    - spotify help - Comprehensive help and setup instructions
  - `youtube.ts` - YouTube Player Commands
    - youtube open - Open YouTube player panel (Phase 15 preview)
    - youtube close - Close player panel
    - youtube search <query> - Search for videos
    - youtube play <video-id> - Play specific video
    - youtube pause - Pause video
    - youtube next - Play next video in playlist
    - youtube prev - Play previous video
    - youtube mute - Mute audio
    - youtube unmute - Unmute audio
    - youtube help - Help and examples
  - `news.ts` - Crypto News Reader Commands
    - news open - Open news reader panel (Phase 15 preview)
    - news close - Close news reader panel
    - news latest - Show latest crypto news (terminal display)
    - news hot - Show hot/trending news (terminal display)
    - news bullish - Show bullish sentiment news (terminal display)
    - news bearish - Show bearish sentiment news (terminal display)
    - news btc/eth/sol - Show cryptocurrency-specific news (terminal display)
    - news search <query> - Search news (Phase 15)
    - news sources - Show news sources info
    - news help - Comprehensive help
- [x] **Configuration Updates** (`src/lib/config.ts`)
  - SPOTIFY_CONFIG - Spotify OAuth credentials (client ID, redirect URI, scopes, token endpoint)
  - YOUTUBE_CONFIG - YouTube API credentials (client ID, API key, search limit, default channel)
  - Media player configuration with environment variable support
  - Default credentials provided with option to override
- [x] **CommandContext Extension** (`src/types/commands.ts`)
  - Added `media` property to CommandContext interface
  - Spotify player operations (authenticate, search, playback, volume)
  - YouTube player operations (search, playback, navigation, mute)
  - News reader operations (load, refresh, filter, panel control)
  - All media contexts integrated with command execution system
- [x] **useCommandExecution Integration** (`src/hooks/useCommandExecution.ts`)
  - Imported useSpotify, useYouTube, useNewsReader hooks
  - Integrated media contexts into CommandContext creation
  - Added media providers to dependency array
  - Bridged media player APIs with command system
- [x] **Root Layout Updates** (`src/app/layout.tsx`)
  - Imported SpotifyProvider, YouTubeProvider, NewsReaderProvider
  - Added providers to component tree (Theme → Wallet → MultiChain → Spotify → YouTube → News)
  - Added Spotify Web Playback SDK script with afterInteractive strategy
  - Proper provider nesting for context availability
- [x] **Spotify OAuth Callback Page** (`public/spotify-callback.html`)
  - Static HTML page for OAuth redirect handling
  - Extracts authorization code from URL parameters
  - Posts message to parent window (opener)
  - Auto-closes after 2 seconds
  - Error handling and success/failure UI
  - Styled with Spotify branding colors
- [x] **Command Registration** (`src/lib/commands/index.ts`)
  - Registered spotifyCommands (1 command with 10+ subcommands)
  - Registered youtubeCommands (1 command with 9 subcommands)
  - Registered newsCommands (1 command with 11 subcommands)
  - Updated phase documentation to show Phase 12 complete

**Key Features:**

- **Spotify Integration**: OAuth PKCE authentication, Web Playback SDK, search, playlists, full playback controls
- **YouTube Integration**: IFrame API player, Data API v3 search, Bloomberg Technology default channel
- **News Reader**: Multi-source aggregation (CryptoPanic, CryptoCompare), sentiment analysis, category filtering
- **Terminal-Based Display**: News commands display styled HTML cards in terminal output (Phase 12)
- **Panel UI (Phase 15)**: Sidebar panels deferred to futuristic UI system integration
- **Context Integration**: Media providers accessible via CommandContext for commands
- **Session Management**: Spotify tokens persisted in localStorage with expiry validation
- **Graceful Fallback**: News API fallback chain ensures content always available

**Media Player Commands Quick Reference:**

```bash
# Spotify Commands
spotify open                    # Show setup info (panel UI in Phase 15)
spotify search lofi beats       # Search for tracks
spotify volume 75               # Set volume
spotify help                    # Full help and setup

# YouTube Commands
youtube open                    # Show setup info (panel UI in Phase 15)
youtube search coding music     # Search for videos
youtube play dQw4w9WgXcQ        # Play specific video
youtube help                    # Full help and examples

# News Commands
news latest                     # Display latest news in terminal
news hot                        # Display trending news
news bullish                    # Display bullish news
news bearish                    # Display bearish news
news btc                        # Display Bitcoin news
news eth                        # Display Ethereum news
news sol                        # Display Solana news
news sources                    # Show news source info
news help                       # Full help
```

**Spotify Integration:**

- Requires Spotify Premium account for Web Playback SDK
- OAuth 2.0 PKCE flow (no client secret needed)
- Tokens stored in localStorage with automatic refresh
- Callback page handles authorization code exchange
- Search Spotify catalog for tracks and playlists
- Full playback controls in browser

**YouTube Integration:**

- No authentication required for basic playback
- YouTube API key optional but recommended for search
- Bloomberg Technology channel loaded by default
- Search YouTube with any query
- Playlist management with next/previous
- IFrame API for video player

**News Reader Integration:**

- Multi-source crypto news aggregation
- CryptoPanic (primary) with fallback to CryptoCompare
- Mock data ensures graceful degradation
- Sentiment analysis from community votes (bullish/bearish/neutral)
- Category filtering (hot, latest, bullish, bearish)
- Cryptocurrency-specific news (BTC, ETH, SOL, etc.)
- Auto-refresh every 5 minutes when panel open
- Terminal display with styled HTML cards

**Architecture Highlights:**

- Separate React Context providers for each media type
- Custom hooks for type-safe context access
- CryptoNews API client with multi-source fallback
- CommandContext extension for media operations
- Spotify Web Playback SDK integration
- YouTube IFrame API integration
- OAuth PKCE flow for Spotify authentication
- Next.js caching for news API responses
- Styled HTML output for news cards in terminal

**Panel UI Implementation (Deferred to Phase 15):**

- SpotifyPanel, YouTubePanel, NewsReaderPanel components created
- CSS Modules with glass morphism theme styling
- Sidebar panel layout with animations
- Integration with futuristic dashboard system
- Panel visibility managed by context providers
- Commands show "Phase 15 preview" messages
- Full UI integration coming in futuristic mode

**Environment Variables:**

```env
# Media Player Configuration (optional, defaults provided)
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your-spotify-client-id
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=https://your-domain/spotify-callback.html
NEXT_PUBLIC_YOUTUBE_CLIENT_ID=your-youtube-client-id
NEXT_PUBLIC_YOUTUBE_API_KEY=your-youtube-api-key
```

### ✅ Phase 13: Games System and Entertainment Commands - Complete

- [x] **Games Type Definitions** (`src/types/games.ts`)
  - `GameType` enum with 13 game types mapped to smart contract IDs
  - `GameMetadata` - Game information (id, name, type, category, description, command, aliases, icon, difficulty, on-chain support)
  - `GameScore` - Local leaderboard entry (gameId, score, username, timestamp, gameData)
  - `LeaderboardEntry` - On-chain leaderboard entry from smart contract
  - `PlayerStats` - Player statistics from blockchain (highScore, gamesPlayed, totalScore, lastPlayed, rank)
  - `GamesState` - Games system state (currentGame, isGameOpen, localLeaderboards, onChainLeaderboards)
  - `ArcadeSDKConfig` - Smart contract configuration for on-chain leaderboards
- [x] **Games Library Modules** (`src/lib/games/`)
  - `arcade-sdk.ts` - On-chain leaderboard integration with Arcade smart contract
    - Migrated from ethers v5 to ethers v6 (BrowserProvider, async getSigner)
    - Submit scores to blockchain with username and game data
    - Fetch leaderboards with rank, player, score, timestamp
    - Get player statistics and game information
    - Username management with fallback to shortened address
  - `metadata.ts` - Game metadata registry with 13 games
    - Casual games: Number Guessing, Cookie Clicker
    - Arcade games: Speed Clicker, Snake, Pac-Man, Brick Breaker
    - Puzzle games: Perfect Circle
    - External arcade games: Flappy Omega, Omega Breaker, Omega Invaders, Omega.io, Omega Pong, Space Omega
    - Game discovery by ID or alias (case-insensitive)
    - Category filtering and difficulty-based queries
  - `leaderboard.ts` - Local leaderboard management (localStorage)
    - Persistent storage across sessions
    - Top 100 scores per game with automatic sorting
    - Add scores, get leaderboards, clear data
    - Player best score and rank queries
- [x] **React Context Provider** (`src/providers/GamesProvider.tsx`)
  - Games system state management
  - Open/close game modals
  - Submit scores to local leaderboards (localStorage)
  - Submit scores to on-chain leaderboards (blockchain)
  - Fetch on-chain leaderboards from smart contract
  - Integration with WalletProvider for blockchain operations
- [x] **Custom React Hook** (`src/hooks/useGames.ts`)
  - Type-safe context access with error handling
  - Games state (currentGame, isGameOpen, leaderboards)
  - Game management methods (openGame, closeGame)
  - Leaderboard operations (submitLocalScore, getLocalLeaderboard, submitOnChainScore, fetchOnChainLeaderboard)
- [x] **Games React Components** (`src/components/Games/`)
  - `GameModal.tsx` - Full-screen modal wrapper for games
    - Backdrop blur overlay, header with controls
    - Fullscreen toggle support, close button
    - Game container for mounting game UI
    - Score display and submission footer
  - `GameLauncher.tsx` - Games grid with category organization
    - Game cards with icon, name, description
    - Difficulty badges (easy/medium/hard with color coding)
    - On-chain leaderboard indicators
    - Play button callbacks
  - `LeaderboardDisplay.tsx` - Leaderboard viewer with tabs
    - Local vs on-chain leaderboard tabs
    - Rank badges (gold/silver/bronze for top 3)
    - Player usernames and scores
    - Formatted timestamps (relative and absolute)
  - `SnakeGame.tsx` - Example game implementation (placeholder)
    - Canvas-based game structure
    - Score tracking with callbacks
    - Game controls (start, pause, reset)
    - Pattern for future game implementations
- [x] **Games Command Module** (`src/lib/commands/games.ts`)
  - `games list` - Display all available games with styled cards
  - `games play <name>` - Launch game (state management for Phase 15 integration)
  - `games scores [game]` - View leaderboards (local scores from localStorage)
  - `games close` - Close current game modal
  - `games help` - Comprehensive games system help
- [x] **Entertainment Command Module** (`src/lib/commands/entertainment.ts`)
  - `rickroll` - Rick Astley lyrics surprise
  - `matrix` - Matrix digital rain animation (setTimeout-based async pattern)
  - `hack` - Elite hacker simulation with progressive steps
  - `disco` - Disco mode with colorful emoji animation
  - `fortune` - Crypto fortune cookie with random fortunes
  - `ascii` - Display ASCII art (omega, pickaxe, diamond, rocket)
- [x] **CommandContext Extension** (`src/types/commands.ts`)
  - Added `games` property with GamesState and management methods
  - Integration for command handlers to launch games, manage leaderboards, submit scores
- [x] **useCommandExecution Integration** (`src/hooks/useCommandExecution.ts`)
  - useGames hook integration
  - Games context passed to command handlers
  - Bridge between command system and GamesProvider
- [x] **App Layout Integration** (`src/app/layout.tsx`)
  - GamesProvider added to provider chain
  - Proper nesting order (after NewsReaderProvider, wraps children)
  - All contexts available throughout application
- [x] **Configuration Updates** (`src/lib/config.ts`, `ENV_CONFIG.md`)
  - Arcade contract address and ABI added
  - Contract deployed at: `0x1a196c1b6c22eb9389e286cc4b12fdebe8663996`
  - Full ABI with submitScore, getLeaderboard, getPlayerStats, getGameInfo functions
  - ScoreSubmitted and UsernameUpdated events
  - ARCADE_BASE_URL for external game hosting
  - Updated AVAILABLE_COMMANDS array with games commands
- [x] **Command Registration** (`src/lib/commands/index.ts`)
  - Games commands registered in command registry
  - Entertainment commands registered
  - Phase 13 marked as implemented in comments

**Games System Architecture:**

- **Local Leaderboards**: localStorage-based scores, instant updates, free, top 100 per game
- **On-Chain Leaderboards**: Smart contract on Omega Network, permanent, global competition, requires wallet + gas
- **Game Categories**: Casual (easy), Arcade (fast-paced), Puzzle (strategic), Action (intense)
- **12 Games Available**: 7 local games + 5 external arcade games with on-chain support
- **Score Submission**: Automatic local saving, optional blockchain submission
- **Ethers v6 Migration**: Complete migration from v5 (BrowserProvider, async getSigner, BigInt parsing)

**Entertainment Commands:**

- Simple setTimeout-based async animations (no setInterval for React compatibility)
- Progressive terminal output with styled HTML
- Auto-cleanup after completion (no manual stopping required)
- Preserved original functionality from vanilla JavaScript implementation

**Phase 15 Integration Notes:**

- Game modal UI with canvas rendering deferred to Phase 15 (futuristic UI system)
- Commands show informative messages about games and display leaderboards in terminal
- Game state management infrastructure ready for full UI integration
- Individual game implementations (Cookie Clicker, Pac-Man, Brick Breaker, etc.) can be added incrementally following SnakeGame component pattern

### 🔄 Future Phases

- [ ] **Phase 14**: Remaining specialized features (referral system, advanced utilities)
- [ ] **Phase 15**: Futuristic UI system with full GUI transformations and game modal integration
- [ ] **Phase 16**: Media player panel UI integration (sidebar panels, dashboard stats)
- [x] **Phase 17**: CSS migration and responsive design
- [ ] **Phase 18**: Advanced NFT features (OpenSea SDK trading, portfolio, watchlist, minting UI modal integration)
- [ ] **Phase 19**: Sound effects integration

## 💡 Usage Examples

### Using Terminal Components

```typescript
"use client";

import { TerminalContainer } from "@/components/Terminal";

// Use the complete terminal interface
export default function HomePage() {
  return <TerminalContainer />;
}

// Or import individual components
import {
  BootAnimation,
  TerminalHeader,
  TerminalOutput,
  TerminalInput,
} from "@/components/Terminal";

// Build custom terminal layout
export function CustomTerminal() {
  const [showBoot, setShowBoot] = useState(true);

  if (showBoot) {
    return <BootAnimation onComplete={() => setShowBoot(false)} />;
  }

  return (
    <div>
      <TerminalHeader {...headerProps} />
      <TerminalOutput lines={lines} isScrolling={true} />
      <TerminalInput {...inputProps} />
    </div>
  );
}
```

### Importing and Using Configuration

```typescript
import { config, AVAILABLE_COMMANDS, OMEGA_NETWORK } from "@/lib/config";

// Access contract addresses
const minerContract = config.CONTRACT_ADDRESS;
const faucetABI = config.FAUCET_ABI;

// Use network configuration
const rpcUrl = OMEGA_NETWORK.rpcUrls[0];

// Get ChainGPT API key
const apiKey = config.CHAINGPT.getApiKey();
```

### Using Utility Functions

```typescript
import {
  shortenAddress,
  formatBalance,
  isValidEthereumAddress,
  generateMixerCommitment,
  formatDuration,
} from "@/lib/utils";

// Shorten an Ethereum address
const short = shortenAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"); // "0x742d...bEb"

// Format a balance
const formatted = formatBalance("123.456789", "OMEGA", 4); // "123.4567 OMEGA"

// Validate address
if (isValidEthereumAddress(address)) {
  // Process valid address
}

// Generate mixer commitment
const { secret, commitment } = generateMixerCommitment();

// Format time
const time = formatDuration(3665); // "1h 1m 5s"
```

### Using the Theme Hook

```typescript
"use client";

import { useTheme } from "@/hooks/useTheme";

export function ThemeSelector() {
  const { currentTheme, setTheme, toggleTheme, getThemeDescriptions } =
    useTheme();
  const descriptions = getThemeDescriptions();

  return (
    <div>
      <p>Current theme: {currentTheme}</p>
      <button onClick={() => setTheme("matrix")}>Set Matrix Theme</button>
      <button onClick={toggleTheme}>Toggle Theme</button>

      {/* Display all available themes */}
      {Object.entries(descriptions).map(([theme, desc]) => (
        <div key={theme}>
          <strong>{theme}</strong>: {desc}
        </div>
      ))}
    </div>
  );
}
```

### Using the Wallet System

```typescript
"use client";

import { useWallet } from "@/hooks/useWallet";

export function WalletExample() {
  const {
    state,
    connectMetaMask,
    createSessionWallet,
    disconnect,
    getBalance,
  } = useWallet();

  // Connect to MetaMask
  const handleConnect = async () => {
    const success = await connectMetaMask();
    if (success) {
      console.log("Connected to MetaMask!");
    }
  };

  // Create session wallet
  const handleCreateSession = async () => {
    const success = await createSessionWallet();
    if (success) {
      console.log("Session wallet created!");
    }
  };

  // Check balance
  const handleCheckBalance = async () => {
    const balance = await getBalance();
    console.log("Balance:", balance);
  };

  return (
    <div>
      {state.isConnected ? (
        <div>
          <p>Wallet Type: {state.type}</p>
          <p>Address: {state.address}</p>
          <p>Balance: {state.balance} OMEGA</p>
          <button onClick={handleCheckBalance}>Refresh Balance</button>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <div>
          <button onClick={handleConnect}>Connect MetaMask</button>
          <button onClick={handleCreateSession}>Create Session Wallet</button>
        </div>
      )}
    </div>
  );
}
```

### Using Wallet Modules Directly

```typescript
import {
  connectMetaMask,
  createSessionWallet,
  importSessionWallet,
  getBalance,
  detectWalletProvider,
} from "@/lib/wallet";

// Detect installed wallets
const { provider, type, name } = detectWalletProvider();
console.log(`Found ${name} wallet (${type})`);

// Connect to MetaMask
const result = await connectMetaMask();
if (result.success) {
  console.log("Connected:", result.address);
  const balance = await getBalance(result.provider, result.address);
  console.log("Balance:", balance);
}

// Create session wallet
const session = await createSessionWallet();
console.log("Session wallet:", session.address);
console.log("Private key:", session.privateKey); // Handle securely!

// Import wallet from private key
const imported = await importSessionWallet("0x...");
if (!imported.error) {
  console.log("Imported wallet:", imported.address);
}
```

### Accessing Environment Variables

```typescript
// Client-side (browser)
const relayerUrl = process.env.NEXT_PUBLIC_RELAYER_URL;
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

// Server-side only (API routes, server components)
const kalshiApiKey = process.env.KALSHI_API_KEY;
const relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY;
```

### Using the Command System (Phase 5)

```typescript
"use client";

import { useCommandExecution } from "@/hooks/useCommandExecution";

export function TerminalExample() {
  const {
    executeCommand,
    terminalLines,
    clearTerminal,
    navigateHistory,
    autocomplete,
    aiProvider,
    setAiProvider,
  } = useCommandExecution();

  // Execute a command
  const handleSubmit = async (cmd: string) => {
    await executeCommand(cmd);
  };

  // Navigate history
  const handleArrowUp = () => {
    const prevCommand = navigateHistory("up");
    if (prevCommand) {
      // Set input value to previous command
    }
  };

  // Autocomplete
  const handleTab = (partial: string) => {
    const matches = autocomplete(partial);
    // Show matches or complete if only one match
  };

  return (
    <div>
      {/* Display terminal output */}
      {terminalLines.map((line) => (
        <div key={line.id} className={`line-${line.type}`}>
          {line.content}
        </div>
      ))}

      {/* Command input */}
      <input
        type="text"
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit(e.currentTarget.value);
          if (e.key === "ArrowUp") handleArrowUp();
        }}
      />

      {/* AI provider selector */}
      <select
        value={aiProvider}
        onChange={(e) => setAiProvider(e.target.value as typeof aiProvider)}
      >
        <option value="off">Off</option>
        <option value="near">NEAR AI</option>
        <option value="openai">OpenAI</option>
      </select>
    </div>
  );
}
```

### Creating Custom Commands

```typescript
import type { Command, CommandContext } from "@/types/commands";
import { commandRegistry } from "@/lib/commands";

// Define a custom command
const myCommand: Command = {
  name: "greet",
  aliases: ["hello", "hi"],
  description: "Greet the user",
  usage: "greet [name]",
  category: "custom",
  handler: (context: CommandContext, args: string[]) => {
    const name = args[1] || "friend";
    context.log(`Hello, ${name}!`, "success");

    // Access theme
    context.log(`Current theme: ${context.theme.currentTheme}`, "info");

    // Access wallet
    if (context.wallet.state.isConnected) {
      context.log(`Connected wallet: ${context.wallet.state.address}`, "info");
    }

    // Execute another command
    context.executeCommand("status");
  },
};

// Register the command
commandRegistry.register(myCommand);

// Now users can type: greet John
// Output:
// > Hello, John!
// > Current theme: dark
// > Connected wallet: 0x1234...5678
// > [status command output]
```

### Using Wallet Commands (Phase 6)

```typescript
// Available wallet commands in terminal:

// 1. Connect wallet (MetaMask)
connect

// 2. Create new session wallet
create
// or
yes

// 3. Import wallet from private key
import 0xabcdef1234567890...

// 4. Check wallet balance
balance

// 5. Send OMEGA tokens
send 1.5 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

// 6. Export wallet information (with private key reveal)
export

// 7. Disconnect current wallet
disconnect

// 8. Test wallet connection and diagnostics
test-wallet
// or
wallet-test
```

**Wallet Command Features:**

- Interactive HTML output with copy buttons for addresses/private keys
- Private key reveal buttons for security
- Explorer links for transactions
- Session wallet auto-funding via relayer/faucet
- Comprehensive error handling and validation
- Security warnings and best practices
- Wallet diagnostics and troubleshooting

**Example Terminal Session:**

```bash
Ω > create
🔐 Creating new session wallet...

⚠️  BETA FEATURE: Session Wallet
   Private key stored in browser session only
   Make sure to export and save it securely!

✅ Session wallet created successfully!

Wallet Address: 0x1234...5678 [Copy]
Private Key [Never Share]: [Click to Reveal] [Revealed: 0xabc...def [Copy]]

🔒 SECURITY WARNINGS:
   1. Save your private key in a secure location
   2. Never share your private key with anyone
   3. This wallet is for testing/development only
   4. Use MetaMask for production/real funds

📝 NEXT STEPS:
   1. Save your private key (click reveal & copy above)
   2. Use 'balance' to check your balance
   3. Use 'faucet' to get test tokens (coming in Phase 7)
   4. Use 'export' to view wallet info anytime

🔄 Requesting initial funds from Omega faucet...
✅ Funding successful!
   View transaction [link to explorer]
   Received 0.1 OMEGA

Ω > balance
💰 WALLET BALANCE
═══════════════════════════════════════

Type: session
Address: 0x1234...5678

EVM WALLET BALANCE:
   0.1000 OMEGA

📊 Multi-wallet balance checking coming in Phase 7
   (NEAR, Solana, Fair, Shade Agents)

Ω > send 0.05 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
📤 SEND TRANSACTION
═══════════════════════════════════════

From: 0x1234...5678
To: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
Amount: 0.05 OMEGA
Network: Omega Network

🔄 Submitting transaction...
✅ Transaction submitted!
   Transaction hash: 0xabc...def

⏳ Waiting for confirmation...
✅ Transaction confirmed!
   Block: 12345

View on Explorer [link]
```

### Accessing Configuration

```typescript
import { config } from "@/lib/config";

// Access contract addresses
const minerContract = config.CONTRACT_ADDRESS;
const faucetContract = config.FAUCET_ADDRESS;

// Access contract ABIs
const minerABI = config.CONTRACT_ABI;
const faucetABI = config.FAUCET_ABI;

// Access network configuration
const networkConfig = config.OMEGA_NETWORK;
const rpcUrl = networkConfig.rpcUrls[0];
const chainId = networkConfig.chainId;

// Access ChainGPT API configuration
const apiKey = config.CHAINGPT.getApiKey();
const allApiKeys = config.CHAINGPT.getAllApiKeys();

// Load production API key from environment
await config.CHAINGPT.loadEnvVars();

// Access relayer URL
const relayerUrl = config.RELAYER_URL;
```

## 🔐 Wallet System Architecture

### Three Wallet Types

1. **MetaMask Wallet** (Recommended for Production)

   - Browser extension wallet with secure key management
   - Hardware wallet support (Ledger, Trezor)
   - Network switching and custom RPC support
   - Automatic reconnection on page reload

2. **Session Wallet** (Development/Testing)

   - Ephemeral wallet created in-session
   - No installation required
   - ⚠️ **WARNING**: Not secure for large amounts or long-term storage
   - Useful for testing and development

3. **Imported Wallet** (Advanced Users)
   - Import existing wallet via private key
   - Same capabilities as session wallet
   - ⚠️ **WARNING**: Never share or commit private keys

### WalletProvider Architecture

The `WalletProvider` uses React Context to manage wallet state globally:

```
WalletProvider (React Context)
├── State Management
│   ├── Wallet type (metamask/session/imported/null)
│   ├── Connection status (connected/disconnected/connecting)
│   ├── Address, balance, chainId
│   └── Error messages
├── Wallet Modules
│   ├── Detection (detectWalletProvider, forceMetaMaskProvider)
│   ├── Connection (connectMetaMask, addOmegaNetwork)
│   └── Session (createSessionWallet, importSessionWallet)
├── Provider/Signer Management
│   ├── BrowserProvider for MetaMask (ethers v6)
│   └── JsonRpcProvider for session wallets
└── Event Listeners
    ├── accountsChanged (wallet switch)
    └── chainChanged (network switch)
```

### MetaMask Forcing Logic

When both MetaMask and Phantom are installed, `window.ethereum` may point to Phantom by default. The wallet detection system:

1. Checks `window.ethereum.providers` array
2. Finds the MetaMask provider (has `isMetaMask` but not `isPhantom`)
3. Replaces `window.ethereum` with MetaMask provider
4. Ensures MetaMask is always prioritized for EVM operations

### Security Considerations

#### Session Wallets

- 🔴 **Never use for large amounts**: Session wallets are ephemeral and not backed up
- 🔴 **Private keys in memory**: Keys exist only in browser memory
- 🟡 **Testing only**: Ideal for development and small test transactions
- 🟢 **Auto-generated**: No risk of exposing existing keys

#### MetaMask

- 🟢 **Secure key management**: Keys never leave MetaMask extension
- 🟢 **Hardware wallet support**: Can connect Ledger/Trezor for extra security
- 🟢 **Transaction signing**: User must approve every transaction
- 🟢 **Production ready**: Recommended for real funds

#### Private Key Import

- 🔴 **Handle with extreme care**: Never share or commit private keys to git
- 🔴 **Not recommended**: Use MetaMask instead for better security
- 🟡 **Advanced users only**: Only for development/testing with test keys
- 🔴 **Risk of exposure**: Keys in environment variables or code are vulnerable

#### Best Practices

1. **For Production**: Use MetaMask with hardware wallet
2. **For Testing**: Use session wallets with test funds
3. **For Development**: Use session wallets or test MetaMask account
4. **Never**: Commit private keys to version control
5. **Never**: Share private keys in chat, email, or code
6. **Always**: Verify contract addresses before signing transactions
7. **Always**: Check network before sending transactions

## ✨ Features

### Current (Phase 4)

- ⚡ Next.js 15 with App Router for optimal performance
- 🔷 TypeScript for type safety and better DX
- 🎨 Animated boot sequence with Omega branding and feature badges
- 🖥️ Modular terminal UI components with CSS Modules
- 📦 Component architecture: BootAnimation, TerminalContainer, TerminalHeader, TerminalOutput, TerminalInput
- 🎯 Command history navigation (Arrow Up/Down)
- ⌨️ Command autocomplete (Tab key)
- 🌐 External blockchain libraries loaded from CDN
- 📱 Fully responsive with mobile breakpoints
- ⚙️ Comprehensive configuration system with contract ABIs and network settings
- 🛠️ Utility functions with ethers v6 integration
- 🎭 Theme management system with React Context
- 🔄 Client-side theme switching with localStorage persistence
- 🌍 Environment variable handling (client vs server-side)
- 🎨 Color-coded terminal output (command, output, error, success, warning, info)
- 📋 User-selectable terminal text for copying
- 🔗 Social links with SVG icons in header
- 💼 **Wallet Management System** (Phase 4)
  - MetaMask connection with network management
  - Session wallet creation for testing
  - Private key import functionality
  - Three wallet types: MetaMask, session, imported
  - Wallet state management with React Context
  - useWallet hook for easy access
  - WalletConnector UI component
  - Ethers v6 integration (BrowserProvider, async getSigner)
  - MetaMask forcing logic for multi-wallet scenarios
  - Balance checking and display
  - Connection status tracking
  - Auto-reconnect for MetaMask
  - Security warnings for session wallets
  - Wallet address display in terminal header

### Planned

- 🔗 Multi-chain wallet support (Ethereum, Solana, NEAR, Eclipse)
- 💰 Trading & Analytics (Polymarket, Perpetuals, DexScreener)
- 🎨 NFT trading suite (OpenSea, Magic Eden)
- 🎮 Omega Arcade games
- 🤖 AI-powered command processing
- 📊 Real-time portfolio tracking
- 🔌 Extensible plugin system
- 📑 Multi-tab terminal sessions

## 🛠️ Development

### Component Architecture

The terminal is built using a modular component architecture:

```
TerminalContainer (Main Wrapper)
├── BootAnimation (Initial load animation)
├── TerminalHeader (Controls and status)
├── TabBar (Terminal tabs - placeholder)
├── InfoBox (Information messages)
├── TerminalOutput (Command history display)
└── TerminalInput (Command input with history)
```

**TerminalContainer** manages all state and coordinates interactions:

- Command history management
- Terminal output lines
- AI provider and connection status
- Theme integration via useTheme hook

**BootAnimation** shows on initial load:

- Animated Omega logo with glow effect
- Progress bar with smooth animation
- Feature badges display
- Configurable duration

**TerminalHeader** provides controls and information:

- Version display and branding
- Social links with SVG icons
- Theme controls (palette, theme cycle, light/dark, dashboard)
- AI provider selector
- Connection status indicator

**TerminalOutput** displays command history:

- Color-coded line types (command, output, error, success, warning, info)
- Auto-scrolling to latest output
- User-selectable text
- Custom scrollbar styling

**TerminalInput** handles user input:

- Arrow Up/Down for history navigation
- Tab key for autocomplete
- Enter key to submit commands
- Custom prompt display

### Styling Approach

- **CSS Modules**: Component-scoped styles (`.module.css` files)
- **Global Styles**: Theme classes in `globals.css`
- **Theme System**: Body classes applied by ThemeProvider (e.g., `theme-dark`, `theme-matrix`)
- **Responsive Design**: Mobile breakpoints in each component

### Code Style

- Use TypeScript for all new code
- Follow React best practices (hooks, functional components)
- Use CSS Modules for component styles
- Keep components small and focused
- Write JSDoc comments for functions and types

### Adding New Features

1. Create types in `src/types/`
2. Add utilities in `src/lib/`
3. Create components in `src/components/`
4. Add hooks in `src/hooks/`
5. Create corresponding `.module.css` files for styles
6. Update documentation

### File Naming

- Components: PascalCase (e.g., `TerminalHeader.tsx`)
- CSS Modules: ComponentName.module.css (e.g., `TerminalHeader.module.css`)
- Utilities: camelCase (e.g., `formatAddress.ts`)
- Types: camelCase (e.g., `terminal.ts`)
- Hooks: camelCase with 'use' prefix (e.g., `useWallet.ts`)

### Command System Architecture (Phase 5)

Phase 5 implements a modular command system with TypeScript:

**CommandRegistry Pattern:**

- Extensible command routing system
- Dynamic command registration at runtime
- Support for command aliases
- Category-based command organization

**CommandContext Interface:**

- Provides access to terminal output (log, clearTerminal)
- Theme management (currentTheme, setTheme, toggleTheme)
- Wallet state and operations (connect, disconnect, state)
- Application configuration (contracts, network, relayer)
- AI provider management (aiProvider, setAiProvider)
- Recursive command execution for AI features

**Command Handlers:**

- Pure functions with clear interfaces
- Async/await support for API calls
- Error handling with user-friendly messages
- Type-safe with TypeScript

**useCommandExecution Hook:**

- Bridges UI and command system
- Manages terminal output state
- Handles command history and navigation
- Provides autocomplete functionality
- Integrates with React Context providers

**Available Commands (Phases 5-6):**

**Basic Commands (Phase 5):**

- `help [category]` - Show all commands or category-specific help
- `clear` - Clear terminal output
- `status` - Show system status and configuration
- `theme [name|list|toggle]` - Manage terminal themes
- `gui [style]` - Interface transformations (coming Phase 10)
- `view [mode]` - Toggle view modes (coming Phase 10)
- `tab <action>` - Tab management (enhanced in future)
- `ai <message>` - Chat with OMEGA AI

**Wallet Commands (Phase 6):**

- `connect` - Connect to MetaMask or create session wallet
- `disconnect` - Disconnect current wallet
- `balance` - Show wallet balance with type and address
- `send <amount> <address>` - Send OMEGA tokens
- `create` / `yes` - Create new session wallet with auto-funding
- `import <private-key>` - Import wallet from private key
- `export` - Export wallet info with private key reveal
- `test-wallet` / `wallet-test` - Test wallet connection and diagnostics

**Mining Commands (Phase 7):**

- `mine` - Start automated mining with relayer (15-second intervals)
- `claim` - Claim pending mining rewards from contract
- `faucet` - Claim from faucet (24-hour cooldown)
- `faucet status` - Check faucet claim status and time remaining
- `stats` - Show detailed mining statistics (balance, mined, pending, cooldown)
- `stop` - Stop mining or stress test operations

**Network Commands (Phase 7):**

- `stress` - Start network stress test with random transactions
- `stopstress` - Stop stress test and show final results
- `stressstats` - Show live stress test statistics

**Future Command Modules:**

- Phase 8: API commands (dexscreener, defillama, near, chaingpt)
- Phase 9: Entertainment commands (games, youtube, spotify)

### Mining Commands Usage (Phase 7)

**Starting Mining:**

```bash
Ω > mine
⛏️  Starting automated mining session...
💡 Mining will use relayer to avoid constant MetaMask confirmations

⛏️  Mining block #1...
🔒 [|] Hashing: 0xabc123...
✅ Mining successful! Reward: +0.05 OMEGA
🔍 View transaction

# Mining Status widget appears with live stats:
# - Blocks Mined: 1
# - Total Earned: 0.0500 OMEGA
# - Elapsed Time: 00:00:15
```

**Claiming Rewards:**

```bash
Ω > claim
🔍 Checking pending rewards...
💰 Claiming 1.25 OMEGA...
📝 Transaction sent: 0xdef456...
⏳ Waiting for confirmation...
✅ Rewards claimed successfully!
📦 Block: 12345
🔍 View transaction
```

**Checking Stats:**

```bash
Ω > stats
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          ⛏️  MINING STATISTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 Wallet Balance: 5.1234 OMEGA
⛏️  Total Mined: 3.5000 OMEGA
💎 Pending Rewards: 0.2500 OMEGA
⏰ Last Mine: 1/1/2024, 12:00:00 PM
⏱️  Cooldown Period: 5 minutes
✅ Ready to mine!
🌐 Total Network Rewards: 125,000.0000 OMEGA
```

**Network Stress Testing:**

```bash
Ω > stress
🚀 Starting network stress test...
⚠️  This will create many transactions on the Omega network
💡 Use "stopstress" to stop the test at any time
📊 Stress wallet created: 0xabc...def
💰 Requesting funding for stress wallet...
✅ Stress test started successfully
📊 Use "stressstats" to view real-time statistics

# Stress Test Stats widget appears:
# - Duration: 00:02:30
# - Wallets Created: 1
# - Total Transactions: 75
# - Successful: 72 (96.0%)
# - Failed: 3
# - Transaction Rate: 0.50 tx/s

Ω > stopstress
🛑 Stopping stress test...
✅ Stress test stopped
=== FINAL STRESS TEST RESULTS ===
Duration: 2m 30s
Wallets Created: 1
Total Transactions: 75
Successful: 72
Failed: 3
Average Rate: 0.50 tx/second
Success Rate: 96.0%
```

### Next Steps (Phase 8)

Phase 8 will implement API and data commands:

- DexScreener integration for token analysis
- DeFi Llama TVL and protocol data
- NEAR blockchain commands
- ChainGPT AI features (chat, contract generation, auditing)
- OpenSea NFT integration
- News aggregation commands
- Multi-chain support expansion

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and patterns
- Test all changes thoroughly
- Update documentation and types
- Keep commits atomic and descriptive
- Write meaningful commit messages

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

## 🔗 Links

- **Original Project**: [Omega Terminal (Vanilla JS)](https://github.com/OmegaNetwork-source/omegaterminalupdated)
- **Live Demo**: [omeganetwork.co](https://omeganetwork.co)
- **Documentation**: [Omega Docs](https://omega-6.gitbook.io/omega/)
- **Discord**: [Join Community](https://discord.com/invite/omeganetwork)
- **Twitter**: [@omega_netw0rk](https://x.com/omega_netw0rk)

## 📞 Support

- **Documentation**: This README and in-terminal `help` command (coming soon)
- **Issues**: Report bugs via [GitHub Issues](https://github.com/your-username/omega-terminal-nextjs/issues)
- **Community**: Join our [Discord](https://discord.com/invite/omeganetwork) for support
- **Updates**: Star the repo to receive notifications

---

**Built for the Web3 Community with ❤️**

If you find this project useful, please star the repository and share it with others!

## Phase 20: Testing Infrastructure

Phase 20 introduces a comprehensive testing and automation layer for the Omega Terminal Next.js application.

- Jest 29 + ts-jest configuration in `jest.config.ts` with React Testing Library 14 support.
- Global test setup via `jest.setup.ts` (browser API mocks, crypto, AudioContext, localStorage, test helpers).
- Playwright 1.44 configuration in `playwright.config.ts` with multi-browser (Chromium, Firefox, WebKit) and mobile device coverage (Pixel 5, iPhone 12).
- Shared test utilities (`__tests__/utils/test-helpers.tsx`, `mock-data.ts`, `msw-handlers.ts`).
- Unit tests for utilities, validation, wallet modules, command registry, server actions, and API routes.
- Integration tests for hooks (`useCommandExecution`), providers (`WalletProvider`, `ThemeProvider`), terminal components, and wallet/theme flows.
- E2E stubs for key user journeys (wallet connection, command execution, GUI themes, mining, NFT marketplace, media, games, responsive layouts).
- GitHub Actions workflows (`test.yml`, `deploy.yml`, `coverage.yml`) for automated testing, deployment gating, and coverage monitoring.
- Documentation in `TESTING.md` detailing strategy, tooling, and best practices.

## Testing

- Jest for unit/integration tests: `npm test`, `npm run test:watch`, `npm run test:coverage`, `npm run test:ci`.
- React Testing Library for component interaction tests.
- Playwright for cross-browser/device E2E coverage: `npm run test:e2e`, `npm run test:e2e:ui`, `npm run test:e2e:debug`.
- MSW handlers for external API mocking in Jest suites.
- Coverage thresholds (70% branches/functions/lines/statements) enforced via Jest and `coverage.yml` workflow.
- Helpers (`renderWithProviders`, `createMockCommandContext`, `mockMetaMask`, `mockLocalStorage`) simplify provider-heavy testing scenarios.

## Test Coverage Targets

- Utilities & validation: 100%.
- Command registry & wallet modules: ≥90%.
- Server actions: ≥85%.
- Hooks/providers: ≥80%.
- Terminal/UI components: ≥60%.
- E2E: cover wallet connection, command execution, theme transformations, responsive layouts, media/games/NFT flows.

## CI/CD Pipeline

- `test.yml`: lint, type-check, Jest (coverage), Playwright, Codecov upload.
- `coverage.yml`: daily/weekly coverage verification with badge generation and threshold enforcement.
- `deploy.yml`: gated deployment (depends on `test` workflow), builds, smoke tests, Vercel deployment, Slack notifications.
- Coverage reports published to Codecov; CI artifacts include Playwright reports on failure.

## Running Tests

```bash
npm test                # Jest once
npm run test:watch      # Jest watch mode
npm run test:coverage   # Jest with coverage
npm run test:ci         # CI-optimized Jest
npm run test:e2e        # Playwright E2E suite
npm run test:e2e:ui     # Playwright UI runner
npm run test:e2e:debug  # Debug Playwright tests
```

## MIGRATION COMPLETE

All 20 migration phases from the legacy `terminal.html` (28,520 lines of vanilla JS/CSS) to a modular Next.js 15 + TypeScript architecture are complete.

- Modular React codebase (~50k LOC) with 100+ components, 11 providers, and 50+ command modules.
- Multi-chain wallet support (EVM/MetaMask, Solana, NEAR, Eclipse) with session and imported wallets.
- Futuristic UI system with dashboard, GUI themes, customizer, and welcome flow.
- Media centers (Spotify, YouTube, News), gaming system with on-chain leaderboards, multi-panel layouts.
- Server Actions and API routes for relayer operations, Jupiter quotes, Kalshi markets, REF Finance, Gemini AI, referrals, ambassadors, env introspection.
- Sound effects system, responsive CSS architecture, performance optimizations, proactive security headers, rate limiting.
- Comprehensive testing infrastructure, Playwright E2E coverage, automated CI/CD (tests, coverage, deployments).
- Performance improvements ~40-50% faster Time To Interactive versus the legacy build.

## Next Steps

- Production deployment (Vercel recommended) with environment secrets.
- Post-deployment monitoring (Sentry, LogRocket) and analytics (Vercel Analytics, GA4).
- Expand E2E scenarios with wallet/mocks and strengthen MSW coverage.
- Increase coverage to ≥85%, add additional games, enhance profile/ENS integration, NEAR Shade agents.
- Performance tuning (code splitting, image optimization via `next/image`).
- Accessibility enhancements (ARIA labels, keyboard navigation), internationalization, and automated visual regression testing.

## Acknowledgments

- Omega Terminal core team and community testers.
- Libraries and platforms: Next.js 15, React 18, TypeScript 5, ethers v6, Playwright, Jest, MSW, Upstash, Codecov, Vercel.

## License

MIT License (see `package.json`).
