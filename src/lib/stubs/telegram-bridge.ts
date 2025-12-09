/**
 * Stub module for @telegram-apps/bridge
 * This is only needed if using Identity Connect features, which we're not using.
 * We only use PetraWallet, so this stub prevents build errors.
 */

export function postEvent(...args: any[]): void {
  // Stub implementation - not used since we're not using Identity Connect
  // This function is only called when Identity Connect features are used
  if (process.env.NODE_ENV === 'development') {
    console.warn('@telegram-apps/bridge stub called - Identity Connect features are disabled');
  }
}

// Default export for compatibility
export default {
  postEvent,
};

