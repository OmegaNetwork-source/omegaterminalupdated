/**
 * URL Utility Functions
 * Helper functions for working with URL parameters
 */

/**
 * Checks if the application is running in mobile app mode
 * @returns true if the URL contains isApp=true parameter, false otherwise
 */
export function isAppMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const isApp = urlParams.get("isApp");
    
    // Case-insensitive check for 'true'
    return isApp?.toLowerCase() === "true";
  } catch (error) {
    console.error("[URL Utils] Error checking app mode:", error);
    return false;
  }
}

/**
 * Gets the value of a URL parameter
 * @param paramName - The name of the URL parameter to retrieve
 * @returns The parameter value or null if not found
 */
export function getUrlParam(paramName: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(paramName);
  } catch (error) {
    console.error(`[URL Utils] Error getting URL parameter ${paramName}:`, error);
    return null;
  }
}
