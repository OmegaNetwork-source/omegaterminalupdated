/**
 * Central export for Omega Terminal Server Actions used across the Next.js
 * application. Server Actions are executed exclusively on the server and
 * leverage the new relayer infrastructure introduced in Phase 18.
 */
export * from "./wallet";
export * from "./mining";
export * from "./faucet";
export type { ActionResult } from "./wallet";
