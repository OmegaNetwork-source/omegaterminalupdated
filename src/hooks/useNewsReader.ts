/**
 * useNewsReader Hook
 *
 * Custom React hook for accessing News Reader context.
 * Provides access to crypto news state and content management functions.
 *
 * @returns NewsReader context value with:
 *   - readerState: Current news reader state
 *     - articles: Array of news articles
 *     - currentFilter: Active category filter (hot, latest, bullish, bearish)
 *     - isPanelOpen: Whether panel is visible
 *     - isLoading: Whether news is currently loading
 *   - loadNews: Function to load news with specific filter
 *   - refreshNews: Function to reload current news
 *   - setFilter: Function to change category filter
 *   - openPanel: Function to show news reader panel and start auto-refresh
 *   - closePanel: Function to hide news reader panel and stop auto-refresh
 *
 * @throws Error if used outside NewsReaderProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { readerState, loadNews, setFilter } = useNewsReader();
 *
 *   useEffect(() => {
 *     loadNews('hot', 10);
 *   }, []);
 *
 *   return (
 *     <div>
 *       <button onClick={() => setFilter('bullish')}>Bullish News</button>
 *       {readerState.isLoading ? (
 *         <p>Loading...</p>
 *       ) : (
 *         <ul>
 *           {readerState.articles.map(article => (
 *             <li key={article.id}>{article.title}</li>
 *           ))}
 *         </ul>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * Note: News articles are fetched from CryptoPanic with fallback to CryptoCompare and mock data.
 * Auto-refresh occurs every 5 minutes when panel is open.
 */

export { useNewsReader } from "@/providers/NewsReaderProvider";
