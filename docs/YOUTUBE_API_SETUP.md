# 🎥 YouTube API Setup - Configuration Guide

## API Credentials Configured ✅

Your YouTube integration is now set up with official Google API credentials.

---

## Configuration Details

### API Key
```
AIzaSyCpz49l79hdPYN1VmREpPjylwlHmfki3S0
```
**Purpose:** YouTube Data API v3 - Video search and metadata
**Documentation:** https://developers.google.com/youtube/v3/getting-started

### Client ID
```
119481701339-b4fm5sujtt2mjupu2rk1s2v749cess44.apps.googleusercontent.com
```
**Purpose:** OAuth 2.0 authentication for advanced features (future use)
**Documentation:** https://developers.google.com/youtube/iframe_api_reference

---

## What Works Now

### Basic Features (No Auth Required) ✅
Using the API Key, users can:
- ✅ Search YouTube videos
- ✅ View search results with thumbnails
- ✅ Play videos in embedded player
- ✅ Navigate playlist (next/prev)
- ✅ Control playback (play/pause/mute)

### Advanced Features (OAuth - Future)
With Client ID, we can add:
- [ ] Access user's playlists
- [ ] View user's subscriptions
- [ ] Save to watch later
- [ ] Like/unlike videos
- [ ] View watch history
- [ ] Access private videos

**For now:** Basic features work perfectly without authentication! 🎉

---

## API Usage

### YouTube Data API v3
**Endpoint:** `https://www.googleapis.com/youtube/v3/search`

**Used For:**
- Video search
- Metadata retrieval
- Thumbnail URLs
- Channel information

**Example Request:**
```javascript
const url = `https://www.googleapis.com/youtube/v3/search?
  part=snippet
  &maxResults=10
  &q=${query}
  &type=video
  &key=${API_KEY}`;
```

**Response:**
```json
{
  "items": [
    {
      "id": { "videoId": "..." },
      "snippet": {
        "title": "Video Title",
        "channelTitle": "Channel Name",
        "thumbnails": { "default": { "url": "..." } }
      }
    }
  ]
}
```

### YouTube IFrame Player API
**Endpoint:** `https://www.youtube.com/iframe_api`

**Used For:**
- Embedded video player
- Playback controls
- Player events
- Quality selection

**Example Usage:**
```javascript
player = new YT.Player('player-id', {
  height: '200',
  width: '100%',
  videoId: 'dQw4w9WgXcQ'
});
```

---

## Quota Information

### YouTube Data API Quotas
According to [Google's documentation](https://developers.google.com/youtube/v3/getting-started):

**Default Quota:** 10,000 units per day

**Operation Costs:**
- **Search:** 100 units per request
- **Video List:** 1 unit per request
- **Channel List:** 1 unit per request

**Your Usage:**
- Each search = 100 units
- 10 results per search
- ~100 searches per day with default quota

**Note:** This is more than enough for normal usage. You can request quota increases if needed.

---

## Configuration in Code

### File: `js/plugins/omega-youtube-player.js`

**Configuration Object:**
```javascript
const YOUTUBE_CONFIG = {
    CLIENT_ID: '119481701339-b4fm5sujtt2mjupu2rk1s2v749cess44.apps.googleusercontent.com',
    API_KEY: 'AIzaSyCpz49l79hdPYN1VmREpPjylwlHmfki3S0',
    PLAYER_ID: 'omega-youtube-player',
    SEARCH_RESULTS_LIMIT: 10,
    SCOPES: [
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/youtube.force-ssl'
    ].join(' ')
};
```

---

## Security Considerations

### API Key Security
✅ **Client-Side Usage is Safe**
- API key is intended for client-side use
- Protected by HTTP referrer restrictions
- Set up restrictions in Google Cloud Console

### Recommended Restrictions
In your Google Cloud Console:
1. Go to Credentials
2. Select your API Key
3. Add **Application restrictions:**
   - HTTP referrers (websites)
   - Add your domain: `*.omeganetwork.co/*`
   - Add localhost for testing: `http://localhost:*/*`

4. Add **API restrictions:**
   - Restrict key to: YouTube Data API v3

### Best Practices
- ✅ API key in client code is OK for YouTube
- ✅ Restrict by referrer
- ✅ Restrict to specific APIs
- ✅ Monitor usage in Cloud Console
- ❌ Don't use API key for server-side operations requiring user data

---

## OAuth Setup (Future Enhancement)

### When You Need OAuth
For features like:
- Accessing user's playlists
- Uploading videos
- Managing subscriptions
- Accessing private content

### OAuth Flow (Not Yet Implemented)
```javascript
// Future implementation
1. User clicks "Connect YouTube Account"
2. Redirect to Google OAuth consent screen
3. User grants permissions
4. Receive access token
5. Make authorized API calls
```

**For now:** Basic features work without OAuth! ✅

---

## Testing Your Setup

### Test 1: Search Videos
```bash
youtube open
youtube search test video
```
**Expected:** Results appear with thumbnails ✅

### Test 2: Play Video
```bash
youtube play dQw4w9WgXcQ
```
**Expected:** Video plays in panel ✅

### Test 3: Controls
```bash
youtube pause
youtube next
youtube mute
```
**Expected:** All controls work ✅

---

## Troubleshooting

### If Search Fails

**Check 1: API Key Valid**
```bash
# In browser console:
console.log('API Key:', window.YOUTUBE_CONFIG?.API_KEY);
```

**Check 2: Quota Not Exceeded**
- Visit Google Cloud Console
- Check quota usage
- Default: 10,000 units/day

**Check 3: Network Connection**
```bash
# Test API directly:
fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&key=YOUR_KEY')
```

### If Player Won't Load

**Check 1: IFrame API Loaded**
```bash
# In console:
console.log('YT API:', window.YT);
```

**Check 2: CORS Issues**
- YouTube IFrame API should work from any domain
- No CORS restrictions

**Check 3: Browser Console**
- Press F12
- Look for error messages
- Check Network tab

---

## API Monitoring

### Track Usage
1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to **APIs & Services** > **Dashboard**
4. View YouTube Data API v3 usage

### Quota Details
- **Searches performed:** Shows count
- **Units consumed:** Shows total
- **Quota remaining:** Shows available
- **Reset:** Daily at midnight Pacific Time

---

## Rate Limiting

### API Limits
- **Per-user quota:** 10,000 units/day (default)
- **Search cost:** 100 units
- **List cost:** 1 unit

### Client-Side Limits
- **Built-in:** No client-side rate limiting yet
- **Recommendation:** Add if quota issues occur

### Increasing Quota
If you need more:
1. Go to Google Cloud Console
2. Request quota increase
3. Explain your use case
4. Usually approved quickly

---

## Future Enhancements

### With OAuth (Client ID)
When we implement OAuth, users will be able to:

1. **Access Personal Content**
   - View their playlists
   - See subscriptions
   - Access watch history
   - View liked videos

2. **Interactive Features**
   - Like/unlike videos
   - Subscribe to channels
   - Save to playlists
   - Comment on videos

3. **Upload & Manage**
   - Upload videos
   - Edit video details
   - Manage playlists
   - Analytics access

### Implementation Plan
```javascript
// Future OAuth implementation
async connectAccount() {
    // 1. Generate OAuth URL with CLIENT_ID
    // 2. Redirect to Google consent screen
    // 3. Handle callback with auth code
    // 4. Exchange for access token
    // 5. Store token securely
    // 6. Enable advanced features
}
```

---

## Current Setup Summary

### What's Configured ✅
- ✅ API Key for search
- ✅ Client ID for future OAuth
- ✅ IFrame Player API for playback
- ✅ Search endpoint configured
- ✅ Quota tracking available

### What Works Now ✅
- ✅ Video search (unlimited topics)
- ✅ Play videos in panel
- ✅ Playlist navigation
- ✅ Playback controls
- ✅ Theme integration
- ✅ No authentication required

### What's Next 🔮
- [ ] OAuth implementation (optional)
- [ ] User playlists access
- [ ] Advanced features
- [ ] Upload capability

---

## API References

### Documentation Links
- **YouTube Data API v3:** https://developers.google.com/youtube/v3/getting-started
- **IFrame Player API:** https://developers.google.com/youtube/iframe_api_reference
- **Search API:** https://developers.google.com/youtube/v3/docs/search/list
- **Quota Costs:** https://developers.google.com/youtube/v3/determine_quota_cost

### Console Links
- **Google Cloud Console:** https://console.cloud.google.com
- **API Dashboard:** https://console.cloud.google.com/apis/dashboard
- **Credentials:** https://console.cloud.google.com/apis/credentials

---

## Testing Checklist

### Basic Functionality ✅
- [x] Search returns results
- [x] Videos play correctly
- [x] Controls work
- [x] Panel displays
- [x] Themes apply
- [x] Mobile responsive

### API Integration ✅
- [x] API key configured
- [x] Search endpoint working
- [x] IFrame API loaded
- [x] Player initialized
- [x] Events handled

### Error Handling ✅
- [x] Invalid searches handled
- [x] API errors caught
- [x] Network failures managed
- [x] Quota exceeded handling

---

## Quick Test Commands

```bash
# Test search
youtube search test

# Test playback  
youtube play dQw4w9WgXcQ

# Test controls
youtube pause
youtube next
youtube mute

# Test help
youtube help

# All should work! ✅
```

---

## Status

🟢 **Fully Configured & Ready!**

**Your YouTube integration is:**
- ✅ Configured with correct API key
- ✅ Set up for future OAuth features
- ✅ Ready for production use
- ✅ Documented completely
- ✅ Zero errors

---

## Try It Now!

```bash
youtube open
youtube search your favorite topic
# Click and watch! 🎥✨
```

---

*API configured. Credentials set. Ready for users.* 🎥🚀

