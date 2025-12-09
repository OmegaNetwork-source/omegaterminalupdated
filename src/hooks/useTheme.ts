/**
 * useTheme Hook
 * Custom React hook for accessing theme context
 * Provides convenient access to theme state and methods
 */

import { useContext } from "react";
import { ThemeContext } from "@/providers/ThemeProvider";
import { ThemeContextValue } from "@/types/theme";

/**
 * Custom hook to access theme context
 * Must be used within a ThemeProvider
 *
 * @returns Theme context value with currentTheme, setTheme, toggleTheme, getThemeDescriptions
 * @throws Error if used outside ThemeProvider
 *
 * @example
 * function MyComponent() {
 *   const { currentTheme, setTheme } = useTheme();
 *
 *   return (
 *     <button onClick={() => setTheme('matrix')}>
 *       Current theme: {currentTheme}
 *     </button>
 *   );
 * }
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export default useTheme;
