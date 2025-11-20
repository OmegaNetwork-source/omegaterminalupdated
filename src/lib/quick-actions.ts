/**
 * Quick Actions System
 * Manages user's custom favorite commands that appear in the welcome message
 */

export interface QuickAction {
  id: string;
  command: string;
  label: string;
  description?: string;
  category?: string;
}

const QUICK_ACTIONS_KEY = "omega-quick-actions";

/**
 * Default quick actions (shown if user hasn't customized)
 */
const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  { id: "1", command: "connect", label: "Connect Wallet", description: "Connect MetaMask wallet", category: "Wallet & Connection" },
  { id: "2", command: "help", label: "System Help", description: "View all available commands", category: "Wallet & Connection" },
];

/**
 * Get all quick actions (custom or default)
 */
export function getQuickActions(): QuickAction[] {
  if (typeof window === "undefined") {
    return DEFAULT_QUICK_ACTIONS;
  }

  try {
    const saved = localStorage.getItem(QUICK_ACTIONS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as QuickAction[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Failed to load quick actions:", error);
  }

  return DEFAULT_QUICK_ACTIONS;
}

/**
 * Save quick actions to localStorage
 */
export function saveQuickActions(actions: QuickAction[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(QUICK_ACTIONS_KEY, JSON.stringify(actions));
    // Dispatch event to notify welcome message to update
    window.dispatchEvent(new CustomEvent("omega-quick-actions-updated"));
  } catch (error) {
    console.error("Failed to save quick actions:", error);
  }
}

/**
 * Add a quick action
 */
export function addQuickAction(action: Omit<QuickAction, "id">): QuickAction {
  const actions = getQuickActions();
  const newAction: QuickAction = {
    ...action,
    id: Date.now().toString(),
  };
  actions.push(newAction);
  saveQuickActions(actions);
  return newAction;
}

/**
 * Remove a quick action by ID
 */
export function removeQuickAction(id: string): boolean {
  const actions = getQuickActions();
  const filtered = actions.filter((a) => a.id !== id);
  if (filtered.length === actions.length) {
    return false; // Not found
  }
  saveQuickActions(filtered);
  return true;
}

/**
 * Update a quick action
 */
export function updateQuickAction(id: string, updates: Partial<QuickAction>): boolean {
  const actions = getQuickActions();
  const index = actions.findIndex((a) => a.id === id);
  if (index === -1) {
    return false;
  }
  actions[index] = { ...actions[index], ...updates };
  saveQuickActions(actions);
  return true;
}

/**
 * Reset to default quick actions
 */
export function resetQuickActions(): void {
  saveQuickActions(DEFAULT_QUICK_ACTIONS);
}

/**
 * Group quick actions by category
 */
export function groupQuickActionsByCategory(actions: QuickAction[]): Record<string, QuickAction[]> {
  const grouped: Record<string, QuickAction[]> = {};
  
  actions.forEach((action) => {
    const category = action.category || "Other";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(action);
  });

  return grouped;
}

