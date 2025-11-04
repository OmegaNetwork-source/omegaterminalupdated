# OMEGA TERMINAL v2.0.1 - DETAILED ARCHITECTURE OUTLINE
## Quick Actions & Command System Deep Dive

## TABLE OF CONTENTS
1. [Quick Actions System Architecture](#quick-actions-system-architecture)
2. [Command Execution Pipeline](#command-execution-pipeline)
3. [Quick Action Button Types](#quick-action-button-types)
4. [Section Management System](#section-management-system)
5. [Sub-Actions Expandable System](#sub-actions-expandable-system)
6. [Command Routing & Dispatch](#command-routing--dispatch)
7. [Event Handler Architecture](#event-handler-architecture)
8. [State Persistence & Restoration](#state-persistence--restoration)
9. [Plugin Integration with Quick Actions](#plugin-integration-with-quick-actions)
10. [Error Handling & Fallbacks](#error-handling--fallbacks)

---

## QUICK ACTIONS SYSTEM ARCHITECTURE

### Overview
The Quick Actions system is the primary UI mechanism for executing commands without typing them manually. It consists of:
- **Sidebar sections** with organized command buttons
- **Expandable sub-sections** for nested command groups
- **Direct command execution** via `executeCommandDirect()`
- **Input-required commands** via `executeCommandWithInput()`
- **Plugin integration** for complex UI panels

### File Location
**Primary File**: `js/futuristic/futuristic-dashboard-transform.js`
- **Function**: `transformToDashboard()` - Creates entire sidebar HTML structure
- **Object**: `window.FuturisticDashboard` - Global namespace for all quick action functions
- **Initialization**: Called when dashboard mode is activated

### Sidebar Structure
```
.omega-sidebar (left panel, 280px wide)
├── .sidebar-section[data-section="system"]         # QUICK ACTIONS
│   ├── .sidebar-title                              # Section header with toggle
│   └── .sidebar-section-content                    # Button container
│       ├── .sidebar-button                         # Standard action button
│       ├── .sidebar-button.sidebar-expandable     # Button with sub-actions
│       └── .sub-actions[data-parent="..."]        # Hidden sub-action menu
├── .sidebar-section[data-section="crypto-news"]    # CRYPTO NEWS
├── .sidebar-section[data-section="nft-explorer"]   # NFT EXPLORER
├── .sidebar-section[data-section="trading-analytics"] # TRADING & ANALYTICS
├── .sidebar-section[data-section="portfolio-tracker"] # PORTFOLIO TRACKER
├── .sidebar-section[data-section="network"]        # NETWORK
├── .sidebar-section[data-section="transactions"]    # TRANSACTIONS
├── .sidebar-section[data-section="chaingpt-tools"] # CHAINGPT TOOLS
├── .sidebar-section[data-section="music-player"]    # MUSIC PLAYER
├── .sidebar-section[data-section="youtube-player"] # YOUTUBE PLAYER
├── .sidebar-section[data-section="mining-rewards"] # MINING & REWARDS
├── .sidebar-section[data-section="advanced-trading"] # ADVANCED TRADING
└── .sidebar-section[data-section="entertainment"]  # ENTERTAINMENT & GAMES
```

### Section HTML Template
Each section follows this structure:
```html
<div class="sidebar-section" data-section="section-name">
    <div class="sidebar-title">
        <span>SECTION NAME</span>
        <button class="section-toggle" 
                onclick="window.FuturisticDashboard.toggleSection('section-name')" 
                title="Minimize/Expand Section">
            <svg class="toggle-icon">...</svg>
        </button>
    </div>
    <div class="sidebar-section-content">
        <!-- Buttons go here -->
    </div>
</div>
```

### Section Data Attributes
- **`data-section`**: Unique identifier for the section (e.g., "system", "crypto-news")
- Used for:
  - Minimization/expansion state tracking
  - localStorage persistence key
  - Event delegation
  - State restoration

---

## COMMAND EXECUTION PIPELINE

### Flow Diagram
```
User Clicks Quick Action Button
    ↓
onclick Handler Triggered
    ↓
executeCommandDirect(command) OR executeCommandWithInput(command, prompt)
    ↓
FuturisticDashboard Method Executes
    ↓
Checks for window.terminal.executeCommand()
    ↓
terminal.executeCommand(command) Called
    ↓
Command Parsed & Routed
    ↓
OmegaCommands.{Module}.{function}(terminal, args)
    ↓
Command Handler Executes
    ↓
terminal.log() or terminal.logHtml() Output
    ↓
UI Updated with Results
```

### executeCommandDirect() - Detailed Implementation

**Location**: `js/futuristic/futuristic-dashboard-transform.js:1481-1533`

**Function Signature**:
```javascript
executeCommandDirect: function(cmd) {
  // cmd: String command to execute (e.g., "help", "clear", "theme executive")
}
```

**Execution Steps**:
1. **Increment command counter** (for dashboard stats)
2. **Check terminal availability**:
   ```javascript
   if (window.terminal && typeof window.terminal.executeCommand === "function") {
     window.terminal.executeCommand(cmd);
     return;
   }
   ```
3. **Fallback to input simulation** if terminal not available
4. **Error handling** with user feedback

**Example Usage**:
```html
<button onclick="window.FuturisticDashboard.executeCommandDirect('help')">
  System Help
</button>
```

**What Happens**:
- Button click triggers `onclick` handler
- `executeCommandDirect('help')` is called
- Method checks `window.terminal` exists
- Calls `terminal.executeCommand('help')`
- Command is routed to `OmegaCommands.Basic.help(terminal, [])`
- Help text is displayed in terminal output

### executeCommandWithInput() - Detailed Implementation

**Location**: `js/futuristic/futuristic-dashboard-transform.js:1320-1404`

**Function Signature**:
```javascript
executeCommandWithInput: function(command, promptText) {
  // command: Base command (e.g., "news search")
  // promptText: User prompt to display
}
```

**Execution Steps**:
1. **Display prompt** in terminal:
   ```javascript
   terminal.log(promptText, "info");
   ```
2. **Set up input listener** for next Enter key press
3. **Capture user input** when Enter is pressed
4. **Combine command + input**:
   ```javascript
   const fullCommand = `${command} ${userInput}`;
   terminal.executeCommand(fullCommand);
   ```
5. **Remove input listener** after execution

**Example Usage**:
```html
<button onclick="window.FuturisticDashboard.executeCommandWithInput('news search', 'Enter search query and press Enter:')">
  → 🔍 Search News
</button>
```

**What Happens**:
- Button click triggers handler
- Terminal displays: "Enter search query and press Enter:"
- Terminal awaits user input
- User types query (e.g., "bitcoin") and presses Enter
- Full command executed: `news search bitcoin`
- Results displayed

### Input Simulation Method

**Location**: `js/futuristic/futuristic-dashboard-transform.js:1343-1404`

**Function**: `sendCommandToTerminal(command)`

**How It Works**:
1. **Find command input field**:
   ```javascript
   const input = document.getElementById("commandInput");
   ```
2. **Set input value**:
   ```javascript
   input.value = command;
   ```
3. **Trigger keypress event** (Enter key):
   ```javascript
   const keypressEvent = new KeyboardEvent("keypress", {
     key: "Enter",
     code: "Enter",
     keyCode: 13,
     bubbles: true,
     cancelable: true,
   });
   input.dispatchEvent(keypressEvent);
   ```
4. **Terminal's normal input handler** processes the command

**Why This Method Exists**:
- Ensures command goes through normal validation
- Triggers command history
- Maintains consistency with typed commands
- Respects special input states (awaiting wallet choice, etc.)

---

## QUICK ACTION BUTTON TYPES

### Type 1: Direct Command Button
**Purpose**: Execute a command with no parameters

**HTML Structure**:
```html
<button class="sidebar-button" 
        onclick="window.FuturisticDashboard.executeCommandDirect('command')">
  <svg class="sidebar-icon">...</svg>
  <span>Button Label</span>
</button>
```

**Examples**:
- `executeCommandDirect('help')` - Shows help
- `executeCommandDirect('clear')` - Clears terminal
- `executeCommandDirect('balance')` - Checks balance
- `executeCommandDirect('news latest')` - Shows latest news
- `executeCommandDirect('theme executive')` - Changes theme

**Characteristics**:
- No user input required
- Immediate execution
- Single command string

### Type 2: Input-Required Command Button
**Purpose**: Execute a command that requires user input

**HTML Structure**:
```html
<button class="sub-action-button" 
        onclick="window.FuturisticDashboard.executeCommandWithInput('base-command', 'Prompt text:')">
  <span>→ Button Label</span>
</button>
```

**Examples**:
- `executeCommandWithInput('news search', 'Enter search query...')`
- `executeCommandWithInput('magiceden view', 'Enter collection symbol...')`
- `executeCommandWithInput('send', 'Enter amount and address...')`

**Characteristics**:
- Requires user input before execution
- Two-step process (prompt → input → execute)
- Command is combined with user input

### Type 3: Plugin Panel Button
**Purpose**: Open a plugin panel (not a terminal command)

**HTML Structure**:
```html
<button class="sidebar-button" 
        onclick="window.PluginNamespace && window.PluginNamespace.openPanel()">
  <svg class="sidebar-icon">...</svg>
  <span>Open Panel</span>
</button>
```

**Examples**:
- `window.OmegaNewsReader.openPanel()` - Opens news reader panel
- `window.OmegaSpotify.openPanel()` - Opens Spotify player
- `window.OmegaYouTube.createPanel()` - Creates YouTube player
- `window.OmegaPerpsViewer.openPanel()` - Opens perps trading panel

**Characteristics**:
- Directly calls plugin method
- Creates/opens UI panel in right sidebar
- No terminal command execution
- Panel-specific functionality

### Type 4: Dashboard Function Button
**Purpose**: Execute dashboard-specific functions (not terminal commands)

**HTML Structure**:
```html
<button class="sidebar-button" 
        onclick="window.FuturisticDashboard.dashboardFunction()">
  <span>Function Label</span>
</button>
```

**Examples**:
- `toggleViewMode()` - Switches Basic/Dashboard view
- `cycleTheme()` - Cycles through themes
- `cycleColorPalette()` - Cycles color palettes
- `toggleAI()` - Toggles AI mode
- `showChart('BTC')` - Shows chart panel

**Characteristics**:
- Dashboard-level functionality
- May not produce terminal output
- Often updates UI state directly

### Type 5: External Function Button
**Purpose**: Call functions from other global namespaces

**HTML Structure**:
```html
<button class="sidebar-button" 
        onclick="OtherGlobalNamespace.function(window.terminal)">
  <span>Function Label</span>
</button>
```

**Examples**:
- `MultiNetworkConnector.showNetworkSelector(window.terminal)` - Shows wallet selector

**Characteristics**:
- Integrates with external modules
- May require terminal instance as parameter
- Cross-module communication

---

## SECTION MANAGEMENT SYSTEM

### Section Toggle Mechanism

**Function**: `toggleSection(sectionId)`
**Location**: `js/futuristic/futuristic-dashboard-transform.js`

**How It Works**:
1. **Find section element**:
   ```javascript
   const section = document.querySelector(`[data-section="${sectionId}"]`);
   const content = section.querySelector('.sidebar-section-content');
   ```
2. **Check current state** (expanded/collapsed):
   ```javascript
   const isExpanded = content.style.display !== 'none';
   ```
3. **Toggle visibility**:
   ```javascript
   content.style.display = isExpanded ? 'none' : 'block';
   ```
4. **Update toggle icon** (rotate arrow):
   ```javascript
   const toggleBtn = section.querySelector('.section-toggle');
   toggleBtn.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
   ```
5. **Persist state** to localStorage:
   ```javascript
   const minimized = JSON.parse(localStorage.getItem('omega-minimized-sections') || '[]');
   if (isExpanded) {
     minimized.push(sectionId);
   } else {
     minimized = minimized.filter(id => id !== sectionId);
   }
   localStorage.setItem('omega-minimized-sections', JSON.stringify(minimized));
   ```

### Section State Restoration

**Function**: `restoreMinimizedSections()`
**Location**: `js/futuristic/futuristic-dashboard-transform.js`

**Critical Sections** (always expanded):
```javascript
const alwaysExpanded = [
  'mining-rewards',
  'advanced-trading',
  'entertainment'
];
```

**Restoration Process**:
1. **Load saved state** from localStorage:
   ```javascript
   const minimized = JSON.parse(localStorage.getItem('omega-minimized-sections') || '[]');
   ```
2. **Filter out critical sections**:
   ```javascript
   const toMinimize = minimized.filter(id => !alwaysExpanded.includes(id));
   ```
3. **Apply minimized state**:
   ```javascript
   toMinimize.forEach(sectionId => {
     const section = document.querySelector(`[data-section="${sectionId}"]`);
     const content = section.querySelector('.sidebar-section-content');
     content.style.display = 'none';
     // Rotate toggle icon
   });
   ```

**When Called**:
- On dashboard initialization
- After dashboard transform completes
- When switching between Basic/Dashboard views

---

## SUB-ACTIONS EXPANDABLE SYSTEM

### Expandable Button Structure

**HTML Template**:
```html
<button class="sidebar-button sidebar-expandable" 
        onclick="window.FuturisticDashboard.toggleSubActions(this, 'parent-id')">
  <svg class="sidebar-icon">...</svg>
  <span>Parent Action</span>
  <svg class="expand-icon">...</svg>
</button>
<div class="sub-actions" data-parent="parent-id" style="display: none;">
  <button class="sub-action-button" onclick="...">
    <span>→ Sub Action 1</span>
  </button>
  <button class="sub-action-button" onclick="...">
    <span>→ Sub Action 2</span>
  </button>
</div>
```

### Toggle Mechanism

**Function**: `toggleSubActions(buttonElement, parentId)`
**Location**: `js/futuristic/futuristic-dashboard-transform.js`

**Execution Steps**:
1. **Find sub-actions container**:
   ```javascript
   const subActions = document.querySelector(`.sub-actions[data-parent="${parentId}"]`);
   ```
2. **Check current state**:
   ```javascript
   const isExpanded = subActions.style.display !== 'none';
   ```
3. **Toggle visibility**:
   ```javascript
   subActions.style.display = isExpanded ? 'none' : 'block';
   ```
4. **Update expand icon** (rotate):
   ```javascript
   const expandIcon = buttonElement.querySelector('.expand-icon');
   expandIcon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
   ```
5. **Close other sub-actions** (optional - can keep multiple open):
   ```javascript
   // Only if single-expand behavior desired
   document.querySelectorAll('.sub-actions').forEach(sub => {
     if (sub !== subActions) {
       sub.style.display = 'none';
     }
   });
   ```

### Sub-Section Headers

**Structure**:
```html
<div class="sub-actions" data-parent="...">
  <div class="sub-section-header">
    <span>Subsection Name</span>
  </div>
  <button class="sub-action-button">...</button>
  <!-- More buttons -->
  
  <div class="sub-section-header">
    <span>Another Subsection</span>
  </div>
  <button class="sub-action-button">...</button>
</div>
```

**Purpose**:
- Organize sub-actions into logical groups
- Visual separation within expandable menu
- Better UX for complex command hierarchies

**Example**: Terminal Style section has:
- "Color Palettes" subsection (11 buttons)
- "Themes" subsection (7 buttons)

---

## COMMAND ROUTING & DISPATCH

### Terminal Core Routing

**Location**: `js/terminal-core.js:414-944`

### Command Parsing

**Step 1: Parse Command String**
```javascript
const args = OmegaUtils.parseCommandArgs(command);
// "news search bitcoin" → ["news", "search", "bitcoin"]
```

**Step 2: Extract Base Command**
```javascript
const cmd = args[0].toLowerCase();
// "news"
```

**Step 3: Check Special Input States**
```javascript
if (this.awaitingWalletChoice) {
  await OmegaCommands.Wallet.handleWalletChoice(this, cmd);
  return;
}
// ... other special states
```

**Step 4: Route to Command Handler**
```javascript
switch (cmd) {
  case "help":
    OmegaCommands.Basic.help(this);
    break;
  case "news":
    await OmegaCommands.News.news(this, args.slice(1));
    break;
  // ... more cases
  default:
    // AI mode or error handler
}
```

### Command Handler Structure

**Pattern**:
```javascript
window.OmegaCommands.ModuleName = {
  commandName: async function(terminal, args) {
    // terminal: OmegaMinerTerminal instance
    // args: Array of command arguments
    
    // 1. Validate input
    // 2. Make API calls if needed
    // 3. Process data
    // 4. Format output
    // 5. Display via terminal.log() or terminal.logHtml()
  }
};
```

**Example - News Command**:
```javascript
window.OmegaCommands.News = {
  news: async function(terminal, args) {
    if (!args || args.length === 0) {
      // Show help
      return;
    }
    
    const subCommand = args[0].toLowerCase();
    
    switch (subCommand) {
      case "latest":
        await this.getLatestNews(terminal);
        break;
      case "hot":
        await this.getHotNews(terminal);
        break;
      case "search":
        const query = args.slice(1).join(' ');
        await this.searchNews(terminal, query);
        break;
      // ... more cases
    }
  }
};
```

### Command Registration Flow

**1. Module Definition** (in command file):
```javascript
// js/commands/news-commands.js
window.OmegaCommands = window.OmegaCommands || {};
window.OmegaCommands.News = {
  news: async function(terminal, args) { ... }
};
```

**2. File Loaded** (in terminal.html):
```html
<script src="js/commands/news-commands.js"></script>
```

**3. Global Namespace Available**:
- `window.OmegaCommands.News.news()` is accessible
- Terminal core can call it via switch statement

**4. Command Execution**:
- User clicks quick action or types command
- `terminal.executeCommand('news latest')` called
- Routed to `OmegaCommands.News.news(terminal, ['latest'])`
- Handler executes and displays results

---

## EVENT HANDLER ARCHITECTURE

### Inline onclick Handlers

**Pattern Used**:
```html
onclick="window.FuturisticDashboard.executeCommandDirect('command')"
```

**Why Inline**:
- Simpler than event delegation for many buttons
- Direct connection between button and action
- No need for event listener cleanup
- Clear in HTML what each button does

**Limitations**:
- Harder to modify dynamically
- Cannot easily attach multiple handlers
- Global scope pollution risk (mitigated by namespace)

### Event Delegation Alternative

**If needed, could use**:
```javascript
document.querySelector('.omega-sidebar').addEventListener('click', (e) => {
  const button = e.target.closest('.sidebar-button');
  if (!button) return;
  
  const command = button.dataset.command;
  if (command) {
    window.FuturisticDashboard.executeCommandDirect(command);
  }
});
```

**Current system uses inline for clarity and simplicity**

### Sound Effects Integration

**Location**: `js/terminal-core.js:546-550`

**Triggered on Command Execution**:
```javascript
if (window.OmegaSoundEffects && window.OmegaSoundEffects.isSoundEnabled()) {
  window.OmegaSoundEffects.playSound('command-execute', {
    volume: 0.6
  });
}
```

**How It Works**:
- Sound effects checked before command execution
- Played if sound system enabled
- Volume controlled via parameter
- Non-blocking (doesn't wait for sound)

---

## STATE PERSISTENCE & RESTORATION

### localStorage Keys Used

**1. Minimized Sections**:
```javascript
Key: "omega-minimized-sections"
Value: JSON array of section IDs
Example: ["trading-analytics", "portfolio-tracker"]
```

**2. View Mode**:
```javascript
Key: "omega-view-mode"
Value: "basic" | "futuristic"
```

**3. AI Provider**:
```javascript
Key: "omega-ai-provider"
Value: "off" | "near" | "openai"
```

**4. Theme**:
```javascript
Key: "omega-terminal-theme"
Value: "dark" | "light" | "matrix" | "retro" | "powershell" | "executive" | "modern"
```

**5. GUI Style**:
```javascript
Key: "omega-gui-style"
Value: "terminal" | "ios" | "aol" | "discord" | "windows95" | "limewire"
```

### State Restoration Flow

**On Dashboard Load**:
1. **Restore minimized sections**:
   ```javascript
   restoreMinimizedSections();
   ```
2. **Restore AI provider state**:
   ```javascript
   const provider = localStorage.getItem("omega-ai-provider") || "off";
   terminal.setAIProvider(provider);
   ```
3. **Restore theme**:
   ```javascript
   const theme = localStorage.getItem("omega-terminal-theme");
   if (theme) {
     OmegaThemes.applyTheme(theme);
   }
   ```
4. **Restore view mode**:
   ```javascript
   const viewMode = localStorage.getItem("omega-view-mode");
   if (viewMode === "basic") {
     // Show basic view
   } else {
     // Show dashboard view
   }
   ```

### State Synchronization

**AI Toggle State Sync**:
```javascript
syncAIToggleState: function() {
  const provider = terminal.aiProvider || localStorage.getItem("omega-ai-provider");
  
  // Update sidebar label
  const sidebarToggle = document.getElementById("sidebar-ai-toggle");
  if (sidebarToggle) {
    sidebarToggle.textContent = `AI: ${provider.toUpperCase()}`;
  }
  
  // Update header select
  const headerSelect = document.getElementById("wrapperAiProviderSelect");
  if (headerSelect) {
    headerSelect.value = provider;
  }
}
```

**Called**:
- On dashboard initialization
- After AI provider changes
- Periodically (every 1 second) to catch external changes

---

## PLUGIN INTEGRATION WITH QUICK ACTIONS

### Plugin Panel Pattern

**Quick Action Button**:
```html
<button class="sidebar-button" 
        onclick="window.OmegaPlugin && window.OmegaPlugin.openPanel()">
  <svg class="sidebar-icon">...</svg>
  <span>Open Plugin Panel</span>
</button>
```

### Plugin Panel Creation

**Plugin Structure**:
```javascript
window.OmegaPlugin = {
  panelCreated: false,
  
  openPanel: function() {
    if (this.panelCreated) {
      // Show existing panel
      return;
    }
    
    // Create panel HTML
    const panel = document.createElement('div');
    panel.className = 'plugin-panel';
    panel.innerHTML = /* HTML */;
    
    // Append to right sidebar
    const rightPanel = document.querySelector('.omega-stats');
    rightPanel.appendChild(panel);
    
    // Set up event listeners
    this.setupPanelEvents();
    
    this.panelCreated = true;
  },
  
  closePanel: function() {
    const panel = document.querySelector('.plugin-panel');
    if (panel) {
      panel.remove();
      this.panelCreated = false;
    }
  }
};
```

### Panel Integration Points

**Right Sidebar** (`.omega-stats`):
- All plugin panels appended here
- Stacking: Multiple panels can exist simultaneously
- Each panel has close button
- Panels scroll independently

**Example Plugins with Quick Actions**:
1. **OmegaNewsReader**:
   - Button: "Open News Reader"
   - Method: `window.OmegaNewsReader.openPanel()`
   - Panel: News articles list with filtering

2. **OmegaSpotify**:
   - Button: "Open Spotify"
   - Method: `window.OmegaSpotify.openPanel()`
   - Panel: Music player with search

3. **OmegaYouTube**:
   - Button: "Open YouTube"
   - Method: `window.OmegaYouTube.createPanel()`
   - Panel: Video player with search

4. **OmegaPerpsViewer**:
   - Button: "Omega Perps"
   - Method: `window.OmegaPerpsViewer.openPanel()`
   - Panel: Trading interface

---

## ERROR HANDLING & FALLBACKS

### Command Execution Errors

**Error Handling in executeCommandDirect()**:
```javascript
try {
  window.terminal.executeCommand(cmd);
} catch (error) {
  console.error("❌ Error executing command:", error);
  window.terminal.log(
    `❌ Error executing command: ${error.message}`,
    "error"
  );
}
```

### Terminal Availability Checks

**Multiple Fallbacks**:
```javascript
// Method 1: Direct executeCommand
if (window.terminal && typeof window.terminal.executeCommand === "function") {
  window.terminal.executeCommand(cmd);
  return;
}

// Method 2: Log fallback
if (window.terminal && typeof window.terminal.log === "function") {
  window.terminal.log(`> ${cmd}`, "info");
  // Process command manually
  return;
}

// Method 3: Input simulation
this.sendCommandToTerminal(cmd);
```

### Plugin Availability Checks

**Safe Plugin Calls**:
```html
onclick="window.OmegaPlugin && window.OmegaPlugin.openPanel()"
```

**JavaScript Pattern**:
```javascript
if (window.OmegaPlugin && typeof window.OmegaPlugin.openPanel === "function") {
  window.OmegaPlugin.openPanel();
} else {
  terminal.log("❌ Plugin not loaded. Please refresh.", "error");
}
```

### State Validation

**Before State Restoration**:
```javascript
const minimized = JSON.parse(
  localStorage.getItem('omega-minimized-sections') || '[]'
);
// Validate array
if (!Array.isArray(minimized)) {
  minimized = [];
}
```

---

## COMPLETE QUICK ACTION REFERENCE

### QUICK ACTIONS Section
- **System Help**: `executeCommandDirect('help')`
- **Connect Wallet**: `MultiNetworkConnector.showNetworkSelector(window.terminal)`
- **Claim Faucet**: `executeCommandDirect('faucet')`
- **AI Assistant** (expandable):
  - AI Toggle: `toggleAI()`
  - Local AI Help: `executeCommandDirect('help')`
- **View Mode Toggle**: `toggleViewMode()`
- **Clear Terminal**: `executeCommandDirect('clear')`
- **Terminal Style** (expandable):
  - Cycle Palette: `cycleColorPalette()`
  - Color palettes: `executeCommandDirect('color {name}')`
  - Cycle Theme: `cycleTheme()`
  - Themes: `executeCommandDirect('theme {name}')`

### CRYPTO NEWS Section
- **Open News Reader**: `OmegaNewsReader.openPanel()`
- **Latest News**: `executeCommandDirect('news latest')`
- **Trending News**: `executeCommandDirect('news hot')`
- **Crypto News** (expandable):
  - Bitcoin News: `executeCommandDirect('news btc')`
  - Ethereum News: `executeCommandDirect('news eth')`
  - Solana News: `executeCommandDirect('news sol')`
  - Search News: `executeCommandWithInput('news search', 'Enter search query...')`
  - News Help: `executeCommandDirect('news help')`

### NFT EXPLORER Section
- **Solana NFTs** (expandable):
  - View Collection: `executeCommandWithInput('magiceden view', 'Enter collection symbol...')`
  - Trending NFTs: `executeCommandDirect('magiceden trending 7d')`
  - Collection Stats: `executeCommandWithInput('magiceden stats', 'Enter collection symbol...')`
  - Magic Eden Help: `executeCommandDirect('magiceden help')`

### TRADING & ANALYTICS Section
- **Omega Perps**: `OmegaPerpsViewer.openPanel()`
- **Live Charts** (expandable):
  - Bitcoin Chart: `showChart('BTC')`
  - Ethereum Chart: `showChart('ETH')`
  - Custom Chart: `executeCommandWithInput('chart', 'Enter symbol...')`
- **Market Analytics** (expandable):
  - BTC Analytics: `executeCommandDirect('dexscreener search BTC')`
  - Custom Token: `executeCommandWithInput('dexscreener', 'Enter token symbol...')`
- **DeFi Llama** (expandable):
  - Total DeFi TVL: `executeCommandDirect('defillama tvl')`
  - Top Protocols: `executeCommandDirect('defillama protocols 5')`

### MINING & REWARDS Section
- **Start Mining**: `executeCommandDirect('mine')`
- **Claim Rewards**: `executeCommandDirect('claim')`
- **Mining Status**: `executeCommandDirect('status')`
- **Mining Stats**: `executeCommandDirect('stats')`

### ADVANCED TRADING Section
- **Hyperliquid** (expandable):
  - Hyperliquid Help: `executeCommandDirect('hyperliquid help')`
  - Markets: `executeCommandDirect('hyperliquid markets')`
- **Polymarket** (expandable):
  - Active Markets: `executeCommandDirect('polymarket markets')`
  - Trending: `executeCommandDirect('polymarket trending')`
  - Search Markets: `executeCommandWithInput('polymarket search', 'Enter search query...')`
- **Kalshi** (expandable):
  - Kalshi Help: `executeCommandDirect('kalshi help')`
  - Markets: `executeCommandDirect('kalshi markets')`
  - Trending: `executeCommandDirect('kalshi trending')`

### ENTERTAINMENT & GAMES Section
- **Games** (expandable):
  - Game List: `executeCommandDirect('games')`
  - Snake: `executeCommandDirect('play snake')`
  - Pacman: `executeCommandDirect('play pacman')`
- **Fortune Cookie**: `executeCommandDirect('fortune')`
- **Matrix Effect**: `executeCommandDirect('matrix')`
- **Hack Effect**: `executeCommandDirect('hack')`
- **Disco Mode**: `executeCommandDirect('disco')`

---

## DEBUGGING QUICK ACTIONS

### Console Logging

**executeCommandDirect() Logs**:
```javascript
console.log("🚀 Executing command directly:", cmd);
console.log("🔍 Terminal object available:", !!window.terminal);
console.log("✅ Using terminal.executeCommand for:", cmd);
```

**Check These If Commands Don't Work**:
1. **Terminal instance exists**: `console.log(window.terminal)`
2. **Command method exists**: `console.log(typeof window.terminal.executeCommand)`
3. **FuturisticDashboard exists**: `console.log(window.FuturisticDashboard)`
4. **Button onclick properly set**: Inspect button in DevTools

### Common Issues & Fixes

**Issue**: Button click does nothing
- **Check**: `window.FuturisticDashboard` is defined
- **Check**: Button onclick attribute is set
- **Check**: No JavaScript errors in console

**Issue**: Command executes but shows error
- **Check**: Command handler exists in switch statement
- **Check**: Command module is loaded
- **Check**: Command arguments are correct format

**Issue**: Section doesn't minimize/expand
- **Check**: `toggleSection()` function exists
- **Check**: Section has correct `data-section` attribute
- **Check**: localStorage is accessible

**Issue**: Sub-actions don't expand
- **Check**: `toggleSubActions()` function exists
- **Check**: Sub-actions div has correct `data-parent` attribute
- **Check**: CSS display property is being toggled

---

**END OF DETAILED ARCHITECTURE OUTLINE**

