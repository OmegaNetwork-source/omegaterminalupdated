# Firebase Analytics - Quick Reference

## 🎯 What Was Implemented

Firebase Analytics tracking for:
- ✅ Every command execution
- ✅ Unique users and sessions
- ✅ Command success/failure rates
- ✅ Execution times
- ✅ Most popular commands

## 📁 Files Created

### Core Implementation
- `src/lib/firebase/firebase-config.ts` - Firebase initialization
- `src/lib/firebase/analytics.ts` - Analytics utilities
- `src/providers/AnalyticsProvider.tsx` - React provider
- `src/types/analytics.d.ts` - TypeScript types

### Configuration & Documentation
- `.env.firebase.template` - Environment variable template
- `FIREBASE_ANALYTICS_SETUP.md` - Complete setup guide
- `walkthrough.md` - Implementation walkthrough

### Modified Files
- `src/lib/commands/CommandRegistry.ts` - Added command tracking
- `src/app/layout.tsx` - Added AnalyticsProvider
- `package.json` - Added Firebase SDK

## 🚀 Quick Start

1. **Create Firebase project:**
   ```
   → Go to https://console.firebase.google.com
   → Create new project → Enable Analytics
   → Add web app → Copy config
   ```

2. **Add to `.env.local`:**
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=your-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

3. **Restart server:**
   ```bash
   npm run dev
   ```

4. **Verify in browser console:**
   - Look for: `[Firebase] Firebase app initialized successfully`
   - Run commands: `help`, `connect`, `balance`
   - Check Firebase Console → Analytics → DebugView

## 📊 View Analytics Data

### Real-Time Events (DebugView)
```
Firebase Console → Analytics → DebugView
```
Shows events instantly as they occur.

### Command Usage
```
Firebase Console → Analytics → Events → command_executed
→ Parameters → command_name
```
See which commands are used most.

### User Metrics
```
Firebase Console → Analytics → Users
```
See unique users, sessions, engagement.

### Performance
```
Firebase Console → Analytics → Events → command_executed
→ Parameters → execution_time_ms
```
See command execution times.

## 🔧 Tracked Events

### command_executed
```typescript
{
  command_name: "help",
  command_category: "basic",
  success: true,
  execution_time_ms: 42,
  error_message: "..." // if failed
}
```

### user_session_start
```typescript
{
  timestamp: 1702123456789
}
```

### wallet_connected
```typescript
{
  wallet_type: "metamask",
  network: "ethereum",
  chain_id: "1"
}
```

## 💡 Usage Examples

### Track Custom Events
```typescript
import { trackEvent } from "@/lib/firebase/analytics";

trackEvent("custom_event", {
  parameter1: "value",
  parameter2: 123
});
```

### Track Command (Already Integrated)
```typescript
import { trackCommand } from "@/lib/firebase/analytics";

trackCommand("my_command", {
  category: "trading",
  success: true,
  executionTimeMs: 150
});
```

### Set User Properties
```typescript
import { setAnalyticsUserProperties } from "@/lib/firebase/analytics";

setAnalyticsUserProperties({
  theme: "dark",
  viewMode: "futuristic",
  walletConnected: true
});
```

## 🐛 Troubleshooting

### No events showing
- ✅ Check `.env.local` has all Firebase variables
- ✅ Restart dev server after env changes
- ✅ Use DebugView for real-time events
- ✅ Check browser console for errors

### Analytics not initializing
- ✅ Verify `NEXT_PUBLIC_` prefix on all env vars
- ✅ Check measurementId is correct
- ✅ Disable ad blockers
- ✅ Check Firebase project has Analytics enabled

### Events delayed
- ✅ Main dashboard updates in 24-48 hours
- ✅ Use DebugView for real-time (seconds)
- ✅ Real-time reports show within minutes

## 🔒 Privacy

What we track:
- ✅ Command names (no arguments)
- ✅ Anonymous user IDs
- ✅ Usage patterns

What we DON'T track:
- ❌ Personal information
- ❌ Wallet addresses
- ❌ Command arguments
- ❌ Transaction details

## 📚 Documentation

- [`FIREBASE_ANALYTICS_SETUP.md`](file:///Users/abubakeryounis/Desktop/Projects/omega-terminal-nextjs/FIREBASE_ANALYTICS_SETUP.md) - Complete setup guide
- [`walkthrough.md`](file:///Users/abubakeryounis/.gemini/antigravity/brain/45916619-1830-496b-8a43-7f547921d5df/walkthrough.md) - Implementation details
- [Firebase Analytics Docs](https://firebase.google.com/docs/analytics)

## ✅ Next Steps

1. Create Firebase project
2. Add credentials to `.env.local`
3. Restart dev server
4. Test in browser
5. Verify in Firebase Console
6. Monitor usage patterns!
