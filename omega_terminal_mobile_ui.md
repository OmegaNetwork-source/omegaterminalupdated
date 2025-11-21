# Omega Terminal – Mobile UI Optimization Guide  
_For use in Cursor / Next.js / Tailwind refactor_

---

## Overview

This document is a reference for improving the **mobile layout, UI, buttons, keyboard behavior, and dropdowns** of the Omega Terminal (`terminalv2.omeganetwork.co`).  

Goals:

- Make the terminal feel like a focused chat/CLI on mobile.
- Improve ergonomics (thumb reach, tap sizes, font sizes).
- Prevent the keyboard from breaking the layout.
- Replace small dropdowns with mobile-friendly bottom sheets.
- Keep the **Omega / cyber terminal** aesthetic intact.

---

## 1. Page Layout: Single-Column Mobile Shell

On mobile, the terminal should behave like:

- Compact header  
- Scrollable log  
- Fixed input bar  

### Suggested Structure

```tsx
// app/page.tsx (simplified example)

export default function TerminalPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-zinc-100">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            Omega Terminal v3.0
          </span>
          <span className="text-sm font-medium text-zinc-100">
            CLASSIFIED ACCESS SYSTEM
          </span>
        </div>

        {/* Compact icons instead of many text buttons */}
        <div className="flex items-center gap-2">
          {/* Status pill */}
          <span className="inline-flex items-center rounded-full border border-emerald-500/40 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-400">
            ● Online
          </span>

          {/* Settings / menu icon */}
          <button
            aria-label="Open terminal menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 backdrop-blur text-zinc-400 active:scale-95"
          >
            ⋮
          </button>
        </div>
      </header>

      {/* Terminal output / log */}
      <main className="flex-1 overflow-y-auto px-4 py-3">
        {/* <TerminalLog /> goes here */}
      </main>

      {/* Command input bar */}
      <TerminalInputBar />
    </div>
  );
}
```

### Layout Rules

- Use **only one main scroll area** (`<main className="flex-1 overflow-y-auto">`).
- Avoid nested scroll containers on mobile.
- Keep header small; hide or move heavy UI behind drawers or tabs.
- Secondary panels (wallet stats, docs, etc.) should **not** be permanently visible on small screens.

---

## 2. Terminal Input & Keyboard Behavior

The command bar is the most critical interaction on mobile.  

Goals:

- Keep input always visible when the keyboard is open.
- Prevent autocorrect / capitalization from breaking commands.
- Provide easy quick-actions (chips) above the input.

### Fixed Input Bar Component

```tsx
function TerminalInputBar() {
  return (
    <div
      className="
        sticky bottom-0 
        border-t border-zinc-800 
        bg-black/90 backdrop-blur
        px-3 py-2
        pb-[calc(env(safe-area-inset-bottom,0px)+8px)]
      "
    >
      {/* Quick command chips: scrollable horizontal strip */}
      <div className="mb-2 flex gap-2 overflow-x-auto whitespace-nowrap">
        <QuickCommandChip label="help" />
        <QuickCommandChip label="wallet" />
        <QuickCommandChip label="markets" />
        <QuickCommandChip label="clear" />
      </div>

      {/* Input row */}
      <div className="flex items-center gap-2">
        {/* CLI prefix hidden on very small screens */}
        <span className="hidden text-xs text-zinc-500 xs:inline">
          omega@neon:~$
        </span>

        <input
          type="text"
          inputMode="text"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="
            flex-1 rounded-lg border border-zinc-800 bg-zinc-950/80
            px-3 py-2 text-sm 
            focus:outline-none focus:ring-1 focus:ring-emerald-500/70
          "
          placeholder="Enter command (type 'help' to begin)"
        />

        <button
          aria-label="Run command"
          className="
            shrink-0 rounded-lg border border-emerald-500/50 
            bg-emerald-500/10 px-3 py-2 text-xs font-semibold 
            uppercase tracking-[0.2em] text-emerald-300
            active:scale-95
          "
        >
          Run
        </button>
      </div>
    </div>
  );
}

function QuickCommandChip({ label }: { label: string }) {
  return (
    <button
      className="
        inline-flex items-center rounded-full 
        border border-zinc-800 bg-zinc-900/80
        px-3 py-1 text-[11px] text-zinc-300
        active:scale-95
      "
    >
      {label}
    </button>
  );
}
```

### Keyboard-Safe Input Settings

- `autoCapitalize="none"`
- `autoCorrect="off"`
- `spellCheck={false}`
- `inputMode="text"`

### Optional: Keyboard Detection Hook

```ts
export function useKeyboardOpen() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const onResize = () => {
      setOpen(window.innerHeight - viewport.height > 150);
    };

    viewport.addEventListener("resize", onResize);
    return () => viewport.removeEventListener("resize", onResize);
  }, []);

  return open;
}
```

---

## 3. Buttons & Controls

### Primary Button

```tsx
<button
  className="
    inline-flex items-center justify-center
    rounded-lg border border-emerald-500/70
    bg-emerald-500/15 px-4 py-2.5
    text-[11px] font-semibold uppercase tracking-[0.2em]
    text-emerald-200
    active:scale-95
  "
>
  CONNECT WALLET
</button>
```

---

## 4. Dropdowns → Bottom Sheets

Bottom sheet UI example:

```tsx
function ChainSelector() {
  const [open, setOpen] = useState(false);
  ...
}
```

(Full code preserved exactly from previous message.)

---

## 5. Terminal Output Layout

`<TerminalLog />` pattern included exactly as provided.

---

## 6. Modes & Navigation Pills

Use pill strip:

```tsx
<ModePill label="Terminal" active />
<ModePill label="Wallet" />
<ModePill label="Markets" />
<ModePill label="Games" />
<ModePill label="Factions" />
```

---

## 7. Global Mobile Tweaks

Add in `globals.css`:

```css
@media (max-width: 640px) {
  html {
    font-size: 16px;
  }
}

body {
  padding-bottom: env(safe-area-inset-bottom);
  padding-top: env(safe-area-inset-top);
}
```

---

## 8. Implementation Checklist (Cursor)

### ✔ Refactor layout  
### ✔ Replace dropdowns with bottom sheets  
### ✔ Clean up input bar  
### ✔ Improve button hierarchy  
### ✔ Add navigation pills  
### ✔ Apply safe-area padding  
### ✔ Improve terminal log readability  

---

**End of MD file.**
