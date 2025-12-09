/**
 * Firebase Configuration
 * Initializes Firebase app and analytics for the Omega Terminal
 */

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics, isSupported } from "firebase/analytics";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate that required config is present
function validateConfig(): boolean {
  const required = [
    "apiKey",
    "authDomain",
    "projectId",
    "appId",
  ] as const;

  const missing = required.filter(
    (key) => !firebaseConfig[key]
  );

  if (missing.length > 0) {
    console.warn(
      `[Firebase] Missing configuration: ${missing.join(", ")}. Analytics will be disabled.`
    );
    return false;
  }

  return true;
}

let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;
let analyticsInitialized = false;

/**
 * Initialize Firebase app
 * Safe to call multiple times - will reuse existing instance
 */
export function initializeFirebase(): FirebaseApp | null {
  if (typeof window === "undefined") {
    // Firebase Analytics only works on client-side
    return null;
  }

  if (app) {
    return app;
  }

  if (!validateConfig()) {
    return null;
  }

  try {
    // Check if Firebase app is already initialized
    const apps = getApps();
    if (apps.length > 0) {
      app = apps[0] ?? null;
    } else {
      app = initializeApp(firebaseConfig);
    }

    console.log("[Firebase] Firebase app initialized successfully");
    return app;
  } catch (error) {
    console.error("[Firebase] Error initializing Firebase:", error);
    return null;
  }
}

/**
 * Initialize Firebase Analytics
 * Must be called on client-side only
 */
export async function initializeAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") {
    return null;
  }

  if (analytics) {
    return analytics;
  }

  if (analyticsInitialized) {
    return analytics;
  }

  analyticsInitialized = true;

  try {
    // Check if analytics is supported
    const supported = await isSupported();
    if (!supported) {
      console.warn("[Firebase] Analytics is not supported in this environment");
      return null;
    }

    const firebaseApp = initializeFirebase();
    if (!firebaseApp) {
      return null;
    }

    analytics = getAnalytics(firebaseApp);
    console.log("[Firebase] Analytics initialized successfully");
    return analytics;
  } catch (error) {
    console.error("[Firebase] Error initializing Analytics:", error);
    return null;
  }
}

/**
 * Get the Firebase app instance
 */
export function getFirebaseApp(): FirebaseApp | null {
  return app;
}

/**
 * Get the Analytics instance
 * Returns null if not initialized or unavailable
 */
export function getFirebaseAnalytics(): Analytics | null {
  return analytics;
}

/**
 * Check if Firebase Analytics is ready
 */
export function isAnalyticsReady(): boolean {
  return analytics !== null;
}
