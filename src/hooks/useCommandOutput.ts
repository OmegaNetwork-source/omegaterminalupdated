/**
 * Command Output Store
 * Stores the last command's JSON output for export functionality
 * Uses localStorage for persistence (no external dependencies)
 */
const STORAGE_KEY = "omega-command-output";

interface CommandOutputStore {
  lastJSONOutput: any;
  lastOutput: any;
}

function loadStore(): CommandOutputStore {
  if (typeof window === "undefined") {
    return { lastJSONOutput: null, lastOutput: null };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { lastJSONOutput: null, lastOutput: null };
  } catch {
    return { lastJSONOutput: null, lastOutput: null };
  }
}

function saveStore(store: CommandOutputStore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    console.error("Failed to save command output:", error);
  }
}

// Initialize store
let store: CommandOutputStore = loadStore();

export const useCommandOutput = {
  getState: () => store,
  setLastJSONOutput: (data: any) => {
    store.lastJSONOutput = data;
    saveStore(store);
  },
  setLastOutput: (data: any) => {
    store.lastOutput = data;
    saveStore(store);
  },
  clearOutput: () => {
    store = { lastJSONOutput: null, lastOutput: null };
    saveStore(store);
  },
};

