# Firebase Analytics Setup Guide

This guide will help you set up Firebase Analytics for the Omega Terminal application.

## Prerequisites

- A Google account
- Access to [Firebase Console](https://console.firebase.google.com)

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., "Omega Terminal")
4. (Optional) Enable Google Analytics for the project - **Recommended**
5. Click **"Create project"** and wait for it to be created

## Step 2: Add a Web App to Your Project

1. In your Firebase project dashboard, click the **Web icon** (`</>`) to add a web app
2. Enter an app nickname (e.g., "Omega Terminal Web")
3. **Check the box** for "Also set up Firebase Hosting" if you want (optional)
4. Click **"Register app"**

## Step 3: Get Your Firebase Configuration

After registering your app, you'll see a configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-XXXXXXXXXX"
};
```

## Step 4: Add Configuration to Your App

1. Copy the `.env.firebase.template` file to `.env.local` (if you don't have one yet)
2. Or add these lines to your existing `.env.local` file:

```bash
# Firebase Analytics Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

3. Replace the placeholder values with your actual Firebase configuration values

## Step 5: Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Start it again
npm run dev
```

## Step 6: Verify Analytics is Working

1. Open your app in the browser
2. Open the browser console (F12 or Cmd+Option+I)
3. Look for these messages:
   - `[Firebase] Firebase app initialized successfully`
   - `[Firebase] Analytics initialized successfully`
   - `[Analytics] Provider initialized successfully`

4. Execute some commands in the terminal (e.g., `help`, `connect`, `balance`)

5. Go to Firebase Console → Analytics → Events
   - Click on "View events in DebugView" for real-time events
   - Or wait 24-48 hours for events to appear in the main Analytics dashboard

## Viewing Analytics Data

### Real-Time Events (DebugView)

1. In Firebase Console, go to **Analytics → DebugView**
2. This shows events in real-time as they occur
3. You should see `command_executed` events when you run commands

### Event Dashboard

1. Go to **Analytics → Events**
2. You'll see a list of all events tracked
3. Click on `command_executed` to see:
   - Total event count
   - Users who triggered the event
   - Event parameters (command_name, success, execution_time_ms, etc.)

### User Analytics

1. Go to **Analytics → Users**
2. See unique user counts
3. View user demographics and interests (if enabled)

### Most Used Commands

1. Go to **Analytics → Events**
2. Click on `command_executed`
3. Go to the **Parameters** tab
4. Click on `command_name` to see a breakdown of which commands are used most frequently

## Tracked Events

The app tracks the following events:

- **command_executed** - Every command execution
  - `command_name`: Name of the command
  - `command_category`: Category of the command
  - `success`: Whether the command succeeded
  - `execution_time_ms`: How long the command took to execute
  - `error_message`: Error message (if failed)

- **user_session_start** - When a user starts a new session
  - `timestamp`: Session start time

- **wallet_connected** - When a user connects a wallet
  - `wallet_type`: Type of wallet (MetaMask, WalletConnect, etc.)
  - `network`: Network name
  - `chain_id`: Chain ID

- **page_view** - Page navigation
  - `page_path`: URL path
  - `page_title`: Page title

## Troubleshooting

### No events showing up

1. **Check console for errors**
   - Open browser console and look for Firebase errors
   
2. **Verify environment variables**
   - Make sure all `NEXT_PUBLIC_FIREBASE_*` variables are set correctly
   - Restart the dev server after changing `.env.local`

3. **Check Firebase project settings**
   - Ensure Analytics is enabled for your project
   - Verify the measurementId is correct

4. **Use DebugView**
   - DebugView shows events in real-time (within seconds)
   - Main Analytics dashboard can take 24-48 hours to update

### Events not appearing in Firebase Console

- Enable DebugView for real-time tracking
- Make sure you're viewing the correct Firebase project
- Check that the `measurementId` in your config matches Firebase Console

### Analytics not initializing

- Check browser console for error messages
- Verify all environment variables are set
- Make sure you're testing in a browser (not server-side)
- Some ad blockers may block Firebase Analytics

## Privacy Considerations

The analytics implementation:

- ✅ Does NOT track personally identifiable information (PII)
- ✅ Uses anonymous user IDs generated by Firebase
- ✅ Only tracks command names and usage patterns
- ✅ Respects user privacy and GDPR guidelines

If you need to be GDPR compliant, you may want to:
- Add a cookie consent banner
- Allow users to opt-out of analytics
- Update your privacy policy

## Additional Resources

- [Firebase Analytics Documentation](https://firebase.google.com/docs/analytics)
- [Firebase Console](https://console.firebase.google.com)
- [Google Analytics 4 Documentation](https://support.google.com/analytics/answer/9304153)
