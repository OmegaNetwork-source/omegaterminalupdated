# Testing Strategy

This document describes the end-to-end testing strategy for the Omega Terminal Next.js application. It covers unit, integration, component, and end-to-end (E2E) testing practices along with automation, coverage, and tooling details.

## Testing Overview

- **Unit tests** validate pure utilities, validation schemas, wallet helpers, and server actions.
- **Integration tests** cover command execution hooks, providers, wallet flows, and theme switching.
- **Component tests** focus on terminal input/output widgets and other isolated UI pieces.
- **E2E tests** (Playwright) verify critical user journeys including wallet connection, command execution, view mode switching, and responsive layouts.
- **Coverage goals**: minimum 70% branches, functions, lines, and statements across the codebase.

## Tooling

- **Jest 29** with **ts-jest** for unit and integration tests.
- **React Testing Library** for component-level tests.
- **Mock Service Worker (MSW)** for API mocking in tests.
- **Playwright 1.44** for cross-browser E2E testing.
- **Codecov** for coverage reporting.

## Running Tests

- `npm test` – run Jest test suite once.
- `npm run test:watch` – watch mode for Jest.
- `npm run test:coverage` – Jest tests with coverage reporting.
- `npm run test:e2e` – run Playwright E2E tests.
- `npm run test:e2e:ui` – Playwright E2E tests with UI mode.
- `npm run test:e2e:debug` – debug mode for Playwright tests.
- `npm run test:ci` – CI-friendly Jest execution with coverage and limited workers.

## Unit Test Coverage

- `src/lib/utils.test.ts` – validations and formatting helpers.
- `src/lib/commands/CommandRegistry.test.ts` – command registration and execution.
- `src/lib/wallet/connection.test.ts`, `session.test.ts` – wallet connection and session utilities.
- `src/lib/validation/index.test.ts` – schema validations (`zod`).
- `src/actions/wallet.test.ts`, `src/actions/mining.test.ts` – server actions with mocked blockchain interactions.
- `src/app/api/jupiter/quote/route.test.ts`, `src/app/api/kalshi/markets/route.test.ts` – API route handlers.

## Integration Tests

- `src/hooks/useCommandExecution.test.tsx` – command execution hook behaviour, history, and autocomplete.
- `src/components/Terminal/TerminalInput.test.tsx` / `TerminalOutput.test.tsx` – terminal UI interactions.
- `src/providers/WalletProvider.test.tsx`, `ThemeProvider.test.tsx` – provider logic and side effects.
- `__tests__/integration/command-execution.test.tsx` – Terminal container interactions.
- `__tests__/integration/wallet-flow.test.tsx` – Wallet connector experiences.
- `__tests__/integration/theme-switching.test.tsx` – Theme cycling with `ThemeProvider`.

## End-to-End Tests (Playwright)

Located under `e2e/`:

- `wallet-connection.spec.ts` – terminal loading and wallet UI.
- `command-execution.spec.ts` – input to output flow.
- `view-mode-switching.spec.ts` – terminal layout rendering.
- `gui-theme-transformation.spec.ts` – GUI theme routes.
- `mining-flow.spec.ts` – mining status placeholder.
- `nft-marketplace.spec.ts` – NFT route smoke test.
- `media-players.spec.ts` – page title load.
- `games-system.spec.ts` – games route.
- `responsive-design.spec.ts` – viewport checks.

> **Note:** Some E2E scenarios require mock providers or fixtures for blockchain interactions when running in CI.

## Test Helpers & Utilities

- `__tests__/utils/test-helpers.tsx` – `renderWithProviders`, mock context creators, MetaMask/localStorage mocks.
- `__tests__/utils/mock-data.ts` – mock data generators using `@faker-js/faker`.
- `__tests__/utils/msw-handlers.ts` – MSW handlers for external APIs (Jupiter, Kalshi, NFT APIs, etc.).

## Mocking Strategies

- Browser APIs (`AudioContext`, `matchMedia`, `localStorage`) are mocked in `jest.setup.ts`.
- Wallet provider functions are mocked in provider tests and integration tests.
- External API calls use MSW or jest mocks.
- Blockchain interactions stubbed via jest mocks of `ethers` exports.

## Coverage

- Minimum thresholds enforced via Jest config and `coverage.yml` workflow: 70% for branches, functions, lines, and statements.
- Developers should aim for:
  - Utilities: 100%
  - Command registry & wallet modules: ≥90%
  - Server actions: ≥85%
  - Hooks/providers: ≥80%
  - Components: ≥60%

## CI/CD

- `.github/workflows/test.yml` runs linting, type checks, Jest tests, Playwright E2E, and publishes coverage.
- `.github/workflows/coverage.yml` monitors coverage on pushes and weekly schedule.
- `.github/workflows/deploy.yml` deploys to production after tests pass.

## Best Practices

- Write tests alongside new features.
- Test behaviours, not implementation details.
- Use descriptive test names and group related cases with `describe`.
- Apply `beforeEach`/`afterEach` for setup/cleanup.
- Mock external services and side effects.
- Cover error paths and edge cases.
- Maintain test isolation—avoid shared mutable state.
- Use `waitFor` when asserting async UI updates.
- Keep E2E tests deterministic and fast by stubbing external dependencies when possible.
