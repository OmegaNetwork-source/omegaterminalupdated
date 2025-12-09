# Spotify Redirect URI Setup Guide

**Issue:** "Invalid redirect URI" error when connecting to Spotify  
**Solution:** Add all redirect URIs to your Spotify app settings

---

## 🎯 **Your Redirect URIs**

You need to add **ALL** of these redirect URIs to your Spotify app:

### **Production (Vercel):**
```
https://omegaterminalupdated-rose.vercel.app/pages/spotify-callback.html
```

### **Local Development:**
```
http://localhost:3000/pages/spotify-callback.html
http://localhost:5500/pages/spotify-callback.html
http://localhost:8080/pages/spotify-callback.html
http://127.0.0.1:3000/pages/spotify-callback.html
http://127.0.0.1:5500/pages/spotify-callback.html
http://127.0.0.1:8080/pages/spotify-callback.html
```

**Note:** Add the port numbers you actually use for local development.

---

## 📝 **Step-by-Step Instructions**

### **Step 1: Go to Spotify Dashboard**
1. Visit: https://developer.spotify.com/dashboard
2. Log in with your Spotify account
3. Click on your app: **"Omega Terminal"** (or whatever you named it)

### **Step 2: Open Settings**
1. Click the **"Settings"** button in the top right
2. Scroll down to **"Redirect URIs"**

### **Step 3: Add ALL Redirect URIs**

**Add your PRODUCTION URL:**
```
https://omegaterminalupdated-rose.vercel.app/pages/spotify-callback.html
```
- Click **"Add"** button
- Paste the URL
- Press Enter or click the checkmark ✓

**Add LOCAL DEVELOPMENT URLs:**
```
http://localhost:5500/pages/spotify-callback.html
```
- Click **"Add"** button
- Paste the URL
- Press Enter or click the checkmark ✓

Repeat for each localhost port you might use (3000, 5500, 8080, etc.)

### **Step 4: Save**
- Scroll to the bottom
- Click **"Save"** button
- ✅ Done!

---

## 🔍 **How It Works**

The Omega Terminal automatically detects which domain it's running on and uses the correct redirect URI:

- **On Vercel:** Uses `https://omegaterminalupdated-rose.vercel.app/pages/spotify-callback.html`
- **On localhost:5500:** Uses `http://localhost:5500/pages/spotify-callback.html`
- **On localhost:3000:** Uses `http://localhost:3000/pages/spotify-callback.html`

This is done with: `window.location.origin + '/pages/spotify-callback.html'`

---

## ✅ **Verification**

After adding the redirect URIs, test both environments:

### **Test Production:**
1. Go to: https://omegaterminalupdated-rose.vercel.app/
2. Run: `spotify connect`
3. ✅ Should open Spotify login without errors
4. ✅ After login, should return to terminal successfully

### **Test Local:**
1. Run your local dev server
2. Go to: `http://localhost:PORT/`
3. Run: `spotify connect`
4. ✅ Should work the same way

---

## 🐛 **Troubleshooting**

### **Still getting "Invalid redirect URI" error?**

**Check these:**

1. **Exact URL match:** The redirect URI must match EXACTLY (including http vs https, port number, and path)

2. **Saved changes:** Make sure you clicked "Save" in Spotify Dashboard

3. **Wait a moment:** Sometimes changes take 1-2 minutes to propagate

4. **Check console:** Open browser DevTools → Console → Look for:
   ```
   🎵 Spotify Redirect URI: [your-url]
   ```
   This shows what URI the terminal is using

5. **Clear cache:** Clear browser cache and reload the page

6. **Verify in Dashboard:** Go back to Spotify Dashboard → Settings → Check that your URLs are listed under "Redirect URIs"

---

## 📋 **Quick Copy-Paste List**

Copy and paste these one by one into Spotify Dashboard:

```
https://omegaterminalupdated-rose.vercel.app/pages/spotify-callback.html
http://localhost:3000/pages/spotify-callback.html
http://localhost:5500/pages/spotify-callback.html
http://localhost:8080/pages/spotify-callback.html
http://127.0.0.1:3000/pages/spotify-callback.html
http://127.0.0.1:5500/pages/spotify-callback.html
http://127.0.0.1:8080/pages/spotify-callback.html
```

---

## 🎯 **Visual Guide**

Your Spotify Dashboard should look like this:

```
╔════════════════════════════════════════════════════════════╗
║ Omega Terminal - Settings                                 ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║ Redirect URIs                                              ║
║ ┌────────────────────────────────────────────────────────┐ ║
║ │ https://omegaterminalupdated-rose.vercel.app/...     ✓│ ║
║ │ http://localhost:3000/pages/spotify-callback.html   ✓│ ║
║ │ http://localhost:5500/pages/spotify-callback.html   ✓│ ║
║ │ http://localhost:8080/pages/spotify-callback.html   ✓│ ║
║ │ [+ Add]                                                │ ║
║ └────────────────────────────────────────────────────────┘ ║
║                                                            ║
║ [Save]                                                     ║
╚════════════════════════════════════════════════════════════╝
```

---

## 🚀 **After Setup**

Once all redirect URIs are added:

1. **Reload your terminal page** (both local and production)
2. Run: `spotify connect`
3. ✅ Should work perfectly on both!

---

**Your Spotify integration will now work seamlessly in both development and production! 🎵✨**

Reference: [Spotify Web API Authorization Guide](https://developer.spotify.com/documentation/web-api/tutorials/code-flow)


