/**
 * usePerps Hook
 *
 * Custom React hook for accessing Omega Perps trading interface context.
 * Provides access to panel state and trading controls.
 *
 * @returns Perps context value with:
 *   - playerState: Current panel state (open, pair, URL)
 *   - openPanel: Function to open panel with optional pair
 *   - closePanel: Function to close panel
 *   - setPair: Function to change trading pair
 *   - refresh: Function to refresh iframe
 *
 * @throws Error if used outside PerpsProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { playerState, openPanel, setPair } = usePerps();
 *
 *   const handleOpen = () => {
 *     openPanel('BTC_USDC');
 *   };
 *
 *   return (
 *     <div>
 *       {playerState.isPanelOpen && (
 *         <p>Trading: {playerState.currentPair}</p>
 *       )}
 *       <button onClick={handleOpen}>Open Perps</button>
 *     </div>
 *   );
 * }
 * ```
 */

export { usePerps } from "@/providers/PerpsProvider";

