# Chat Init Troubleshooting Guide

**Command**: `chat init`  
**Module**: ChainGPT Web3 AI Chatbot  
**Status**: Investigating why it's not working

---

## Command Structure

The `chat` command is **properly implemented** in Next.js:

### Command Definition

**File**: `src/lib/commands/chaingpt-chat.ts` (Line 648-692)

```typescript
export const chatCommand: Command = {
  name: "chat",
  description: "ChainGPT Web3 AI Chatbot",
  usage: "chat <init|ask|stream|context|history|test|help> [params]",
  category: "ai",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    switch (subcommand) {
      case "init":
        await handleInit(context, args); // ← Handles 'chat init'
        break;
      // ... other subcommands
    }
  },
};
```

✅ **Command is registered and exported**

---

## What Happens When You Type `chat init`

### 1. Command Execution Flow

```
User: "chat init"
  ↓
CommandRegistry.execute("chat init", context)
  ↓
Parse args: ["chat", "init"]
  ↓
Look up command: "chat"
  ↓
Execute handler: chatCommand.handler(context, ["chat", "init"])
  ↓
Subcommand: args[1] = "init"
  ↓
Call: handleInit(context, ["chat", "init"])
```

### 2. handleInit Function

**File**: `src/lib/commands/chaingpt-chat.ts` (Line 23-57)

```typescript
async function handleInit(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const apiKey = args[2]; // Optional API key from user

  try {
    const result = await chaingpt.initialize(apiKey);

    if (result.success) {
      context.log("✅ ChainGPT initialized successfully!", "success");
      // ... show next steps
    } else {
      context.log(`❌ Initialization failed: ${result.error}`, "error");
    }
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}
```

### 3. chaingpt.initialize Function

**File**: `src/lib/api/chaingpt.ts` (Line 148-195)

```typescript
export async function initialize(
  apiKey?: string
): Promise<InitializationResult> {
  try {
    if (apiKey) {
      // User provided API key
      setApiKey(apiKey);
      return {
        success: true,
        message: `ChainGPT initialized with custom API key: ${maskApiKey(
          apiKey
        )}`,
      };
    }

    // Try to use server-side key
    const capabilities = await fetchCapabilities(true);

    if (!capabilities.enabled) {
      return {
        success: false,
        error:
          capabilities.message ??
          "ChainGPT services are disabled for this deployment.",
      };
    }

    if (!capabilities.hasServerKey) {
      return {
        success: false,
        error:
          "No server-side ChainGPT key is configured. Provide your own key with 'chat init <api-key>'.",
      };
    }

    setInitializedFlag();
    return {
      success: true,
      message: "ChainGPT server integration ready.",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to initialize ChainGPT.",
    };
  }
}
```

---

## Potential Issues & Debugging

### Issue 1: ChainGPT Server Key Not Configured

**Symptom**: Error message "No server-side ChainGPT key is configured"

**Cause**: The server doesn't have a ChainGPT API key configured

**Check**:

1. Open browser console
2. Type: `chat init`
3. Look for error message

**Solution**:

```bash
# Option 1: Use your own API key
> chat init YOUR_API_KEY_HERE

# Option 2: Configure server-side key (requires env var)
# Add to .env.local:
CHAINGPT_API_KEY=your_server_key_here
```

---

### Issue 2: ChainGPT Services Disabled

**Symptom**: Error message "ChainGPT services are disabled for this deployment"

**Cause**: The `config.CHAINGPT.loadCapabilities()` returns `enabled: false`

**Check** (`src/lib/config.ts`):

```typescript
CHAINGPT: {
  AUTO_INITIALIZE: true,  // Should be true
  loadCapabilities: async () => {
    // ... check if this returns enabled: true
  }
}
```

**Solution**: Ensure ChainGPT is enabled in configuration

---

### Issue 3: Command Not Registered

**Symptom**: "Unknown command: chat"

**Cause**: Command not properly imported in index.ts

**Check** (`src/lib/commands/index.ts`):

```typescript
import { chatCommands } from "./chaingpt-chat"; // ✅ Should be present

const commandGroups: CommandGroup[] = [
  // ...
  { label: "chaingpt-chat", commands: chatCommands }, // ✅ Should be present
];
```

**Status**: ✅ **Already verified - command IS registered**

---

### Issue 4: API Endpoint Not Working

**Symptom**: Request fails or times out

**Cause**: ChainGPT API proxy endpoint has issues

**Check**:

1. Open browser console
2. Type: `chat init`
3. Look at Network tab
4. Find request to `/api/chaingpt/capabilities` or similar
5. Check if it returns 200 OK

**Endpoints** (`src/lib/api/chaingpt.ts`):

```typescript
const API_BASE = "/api/chaingpt";
const CHAT_ENDPOINT = `${API_BASE}/chat`;
```

**Server Route**: `src/app/api/chaingpt/chat/route.ts`

---

## Debugging Steps

### Step 1: Test Command Registration

Open browser console and type:

```javascript
// Check if command is registered
window.__COMMAND_REGISTRY__.getCommand("chat");
```

**Expected**: Should return the command object  
**If null**: Command not registered (check index.ts)

---

### Step 2: Test ChainGPT API Module

Open browser console and type:

```javascript
// Check if module is loaded
import("/lib/api/chaingpt").then((m) => console.log("ChainGPT API:", m));
```

**Expected**: Should show the chaingpt module  
**If error**: Module not loading properly

---

### Step 3: Test Initialization Directly

Open browser console and type:

```javascript
// Import and test directly
import("/lib/api/chaingpt").then(async (chaingpt) => {
  const result = await chaingpt.initialize();
  console.log("Init result:", result);
});
```

**Expected**: `{success: true, message: "..."}` or `{success: false, error: "..."}`

---

### Step 4: Check Console Logs

Type `chat init` in terminal and look for console output:

**Expected logs**:

```
[DEBUG] Chat command detected: init
[DEBUG] handleInit called with args: ["chat", "init"]
[DEBUG] API Key received: Using default
```

**If missing**: Handler not being called

---

### Step 5: Check localStorage

Open browser console and type:

```javascript
localStorage.getItem("chaingpt-initialized");
localStorage.getItem("chaingpt-api-key");
```

**Expected after successful init**:

- `chaingpt-initialized`: `"true"`
- `chaingpt-api-key`: (your API key if provided)

---

## Common Error Messages

### 1. "ChainGPT not initialized"

```
❌ ChainGPT not initialized

💡 Initialize first:
   chat init              (use default key)
   chat init <api-key>    (use your own key)
```

**Solution**: This is shown by `chat ask` or `chat stream` when you haven't run `chat init` yet. Run `chat init` first.

---

### 2. "No server-side ChainGPT key is configured"

```
❌ Initialization failed: No server-side ChainGPT key is configured. Provide your own key with 'chat init <api-key>'.
```

**Solution**: Either:

- Provide your own key: `chat init YOUR_API_KEY`
- Or configure server key in `.env.local`

---

### 3. "ChainGPT services are disabled"

```
❌ Initialization failed: ChainGPT services are disabled for this deployment.
```

**Solution**: Check `config.CHAINGPT.AUTO_INITIALIZE` and capabilities loader

---

## Quick Test Procedure

1. **Open browser console**
2. **Clear localStorage** (to start fresh):

   ```javascript
   localStorage.removeItem("chaingpt-initialized");
   localStorage.removeItem("chaingpt-api-key");
   ```

3. **Type in terminal**:

   ```
   chat init
   ```

4. **Check output**:

   - ✅ Success: "ChainGPT initialized successfully!"
   - ❌ Error: Note the exact error message

5. **If successful, test a question**:
   ```
   chat ask What is DeFi?
   ```

---

## Comparison with Vanilla

### Vanilla Implementation

**File**: `js/commands/chaingpt-chat.js` (Line 282-310)

```javascript
handleInit: async function(terminal, args) {
    const apiKey = args.length >= 2 ? args[1] : null;

    try {
        ChainGPTChat.init(apiKey);

        if (apiKey) {
            terminal.log('[+] ChainGPT Chat initialized with your API key!', 'success');
        } else {
            terminal.log('[+] ChainGPT Chat initialized with default API key!', 'success');
        }
        terminal.log('[+] Try: chat ask "What is ChainGPT?"', 'info');
    } catch (error) {
        terminal.log(`❌ Initialization failed: ${error.message}`, 'error');
    }
}
```

### Next.js Implementation

**File**: `src/lib/commands/chaingpt-chat.ts` (Line 23-57)

```typescript
async function handleInit(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const apiKey = args[2]; // ← Different index!

  try {
    const result = await chaingpt.initialize(apiKey);

    if (result.success) {
      context.log("✅ ChainGPT initialized successfully!", "success");
      // ... more detailed output
    } else {
      context.log(`❌ Initialization failed: ${result.error}`, "error");
    }
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}
```

### ⚠️ FOUND THE BUG!

**Issue**: API key index is wrong!

**Vanilla**: `args[1]` (args = ["init", "YOUR_KEY"])  
**Next.js**: `args[2]` (args = ["chat", "init", "YOUR_KEY"]) ✅ Correct!

Actually, Next.js is **correct** because:

- Vanilla: `window.ChainGPTChatCommands.chat(terminal, ["init", "key"])`
- Next.js: Command handler gets `["chat", "init", "key"]`

So Next.js is using `args[2]` which is correct! ✅

---

## Summary

**Command is properly implemented** ✅

The most likely issues are:

1. **Server-side API key not configured** (most common)

   - Solution: Use `chat init YOUR_API_KEY`

2. **ChainGPT capabilities endpoint failing**

   - Solution: Check browser console for network errors

3. **ChainGPT services disabled in config**
   - Solution: Check `src/lib/config.ts`

---

## Next Steps

To diagnose the exact issue:

1. Run `chat init` in the terminal
2. Open browser console (F12)
3. Look for:

   - Console logs (any errors?)
   - Network requests (any failed requests?)
   - Error messages in terminal output

4. Share the exact error message to identify the specific issue

---

_ChainGPT Chat command structure is correct. Issue is likely in API configuration or network layer._ 🔍
