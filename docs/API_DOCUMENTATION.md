# Omega Network API Documentation

## Base URL
```
https://omeganetwork.co/api
```

## Authentication
Most endpoints require a wallet address as a parameter. Some endpoints may require additional authentication in the future.

---

## 🔗 User Management APIs

### Get User Profile
**GET** `/v1/users/{walletAddress}/profile`

Retrieves user profile information and discover interactions.

**Parameters:**
- `walletAddress` (path): User's wallet address

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "walletAddress": "0x...",
      "username": "user_133d",
      "displayName": "User 133D",
      "bio": "User bio",
      "avatar": "avatar_url",
      "location": "Location",
      "website": "website_url",
      "twitter": "twitter_handle",
      "discord": "discord_id",
      "github": "github_username",
      "telegram": "telegram_username",
      "email": "email@example.com",
      "isPublic": true
    },
    "discoverInteractions": [...]
  }
}
```

### Update User Profile
**POST** `/v1/users/{walletAddress}/profile`

Updates user profile information.

**Body:**
```json
{
  "username": "new_username",
  "displayName": "New Display Name",
  "bio": "Updated bio",
  "location": "New location",
  "website": "https://example.com",
  "twitter": "twitter_handle",
  "discord": "discord_id",
  "github": "github_username",
  "telegram": "telegram_username",
  "email": "email@example.com"
}
```

### Get User Activity
**GET** `/v1/users/{walletAddress}/activity`

Retrieves user activity history.

**Query Parameters:**
- `limit` (optional): Number of activities to return (default: 10)
- `offset` (optional): Number of activities to skip (default: 0)

### Get User Tasks
**GET** `/v1/users/{walletAddress}/tasks`

Retrieves user's task completion status.

### Get User Faucet Status
**GET** `/v1/users/{walletAddress}/faucet-status`

Retrieves user's faucet claim status and history.

### Get User Faucet Activities
**GET** `/v1/users/{walletAddress}/faucet-activities`

Retrieves user's faucet claim activities.

### Get User Blockchain Claims
**GET** `/v1/users/{walletAddress}/blockchain-claims`

Retrieves user's blockchain claim history.

### Get User Aggregated Claims
**GET** `/v1/users/{walletAddress}/aggregated-claims`

Retrieves aggregated claim statistics for the user.

### Get User Aggregated Achievements
**GET** `/v1/users/{walletAddress}/aggregated-achievements`

Retrieves user's achievement statistics.

---

## 🎯 Referral System APIs

### Generate Referral Code
**POST** `/v1/referrals/generate-code`

Generates a unique referral code for a user.

**Body:**
```json
{
  "walletAddress": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "referralCode": "ABC123",
    "alreadyExists": false
  }
}
```

### Validate Referral Code
**GET** `/v1/referrals/validate/{code}`

Validates a referral code and returns referrer information.

**Response:**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "referrerAddress": "0x...",
    "referrerUsername": "user_133d",
    "referrerDisplayName": "User 133D"
  }
}
```

### Complete Referral
**POST** `/v1/referrals/complete`

Completes a referral process when a new user signs up.

**Body:**
```json
{
  "referralCode": "ABC123",
  "referredAddress": "0x..."
}
```

### Track Referral Visit
**POST** `/v1/referrals/track-visit`

Tracks when someone visits using a referral link.

**Body:**
```json
{
  "referralCode": "ABC123",
  "visitorAddress": "0x..." // optional
}
```

### Award Referral Achievements
**POST** `/v1/achievements/referral-achievements`

Awards achievements to both referrer and referred user.

**Body:**
```json
{
  "referrerAddress": "0x...",
  "referredAddress": "0x...",
  "referralCode": "ABC123"
}
```

---

## 🏆 Ambassador System APIs

### Get Ambassador Leaderboard
**GET** `/v1/ambassadors/leaderboard`

Retrieves the ambassador leaderboard.

**Query Parameters:**
- `limit` (optional): Number of ambassadors to return (default: 10)
- `offset` (optional): Number of ambassadors to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "walletAddress": "0x...",
      "username": "user_133d",
      "displayName": "User 133D",
      "totalReferrals": 25,
      "activeReferrals": 20,
      "totalPoints": 1500,
      "level": 5,
      "tier": "GOLD",
      "tierProgress": 75,
      "rank": 1,
      "lastActivity": "2024-01-01T00:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 100
  }
}
```

### Get Ambassador Profile
**GET** `/v1/ambassadors/{address}/profile`

Retrieves ambassador profile information.

### Get Ambassador Referrals
**GET** `/v1/ambassadors/{address}/referrals`

Retrieves ambassador's referral list.

### Get Ambassador Stats
**GET** `/v1/ambassadors/{address}/stats`

Retrieves ambassador's statistics.

### Generate Ambassador Referral Code
**POST** `/v1/ambassadors/generate-referral-code`

Generates a referral code for an ambassador.

### Get Ambassador Directory
**GET** `/v1/ambassadors/directory`

Retrieves the ambassador directory.

---

## 🎮 Arcade System APIs

### Get Arcade Leaderboard
**GET** `/v1/arcade/leaderboard`

Retrieves the arcade game leaderboard.

**Query Parameters:**
- `game` (optional): Specific game filter
- `limit` (optional): Number of entries to return
- `offset` (optional): Number of entries to skip

---

## 🚰 Faucet System APIs

### Get Faucet Status
**GET** `/api/faucet/status`

Retrieves faucet status and user claim eligibility.

**Query Parameters:**
- `walletAddress`: User's wallet address

**Response:**
```json
{
  "success": true,
  "data": {
    "canClaim": true,
    "faucetBalance": "1000000000000000000000",
    "claimAmount": "100000000000000000000",
    "cooldownPeriod": 86400,
    "timeUntilNextClaim": 0,
    "lastClaimTime": "0",
    "totalUserClaims": 5,
    "totalUserRewards": "500000000000000000000",
    "recentClaims": [...],
    "globalStats": {
      "totalClaims": 1000,
      "totalRewards": "100000000000000000000000",
      "successRate": 95.5,
      "uniqueUsers": 800
    },
    "network": {
      "chainId": "0x4e454228",
      "rpcUrl": "https://rpc.omeganetwork.co",
      "explorerUrl": "https://explorer.omeganetwork.co"
    }
  }
}
```

### Claim from Faucet
**POST** `/api/faucet/claim`

Submits a faucet claim request.

**Body:**
```json
{
  "walletAddress": "0x...",
  "signature": "0x..."
}
```

### Complete Faucet Claim
**POST** `/api/faucet/claim/complete`

Completes a faucet claim process.

### Get Faucet Claims
**GET** `/api/faucet/claims`

Retrieves faucet claim history.

**Query Parameters:**
- `walletAddress` (optional): Filter by wallet address
- `limit` (optional): Number of claims to return
- `offset` (optional): Number of claims to skip

### Bulk Faucet Claims
**GET** `/api/faucet/claims/bulk`

Retrieves bulk faucet claim data.

### Sync Faucet Data
**POST** `/api/faucet/sync`

Synchronizes faucet data with blockchain.

---

## 🏅 Achievement System APIs

### Track Achievement
**POST** `/api/achievements/track`

Tracks an achievement event.

**Body:**
```json
{
  "walletAddress": "0x...",
  "achievementId": "first_claim",
  "action": "faucet_claim",
  "details": {...}
}
```

### Track Social Achievement
**POST** `/api/achievements/track-social`

Tracks social media related achievements.

**Body:**
```json
{
  "walletAddress": "0x...",
  "platform": "twitter",
  "action": "follow",
  "details": {...}
}
```

---

## 🔐 Authentication APIs

### Discord Authentication
**GET** `/api/discord/auth`
**GET** `/api/discord/callback`

### GitHub Authentication
**GET** `/api/github/auth`
**GET** `/api/github/callback`

### Google Authentication
**GET** `/api/google/auth`
**GET** `/api/google/callback`

### Twitter Authentication
**GET** `/api/twitter/auth`
**GET** `/api/twitter/callback`

### Telegram Authentication
**GET** `/api/telegram/auth`
**GET** `/api/telegram/callback`

---

## 🛠️ Utility APIs

### Wallet Verification
**POST** `/v1/wallet-verification`

Verifies wallet ownership through signature.

**Body:**
```json
{
  "walletAddress": "0x...",
  "message": "Sign this message to verify your wallet",
  "signature": "0x..."
}
```

### Health Check
**GET** `/api/health/liveness`
**GET** `/api/health/readiness`

### Popup Submission
**POST** `/api/popup-submission`

Submits popup form data.

### Reset Progress
**POST** `/api/reset-progress`

Resets user progress (admin only).

### Cleanup Activities
**POST** `/api/cleanup-activities`

Cleans up old user activities.

---

## 📊 Data Models

### User Profile
```typescript
interface UserProfile {
  walletAddress: string;
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  location?: string;
  website?: string;
  twitter?: string;
  discord?: string;
  github?: string;
  telegram?: string;
  email?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### User Progress
```typescript
interface UserProgress {
  walletAddress: string;
  userId: string;
  totalPoints: number;
  level: number;
  rank: string;
  achievements: string[];
  referralsCount: number;
  profile?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Referral
```typescript
interface Referral {
  id: string;
  referralCode: string;
  referrerAddress: string;
  referredAddress?: string;
  status: 'PENDING' | 'COMPLETED';
  createdAt: Date;
  completedAt?: Date;
}
```

### Achievement
```typescript
interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  points: number;
  requirements: object;
  icon?: string;
}
```

---

## 🔒 Rate Limiting

- **Standard endpoints**: 100 requests per minute per IP
- **Authentication endpoints**: 10 requests per minute per IP
- **Faucet endpoints**: 5 requests per minute per wallet address

---

## 📝 Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message description",
  "status": 400
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error

---

## 🚀 Integration Examples

### JavaScript/TypeScript
```javascript
// Get user profile
const response = await fetch('https://omeganetwork.co/api/v1/users/0x1234.../profile');
const data = await response.json();

// Generate referral code
const referralResponse = await fetch('https://omeganetwork.co/api/v1/referrals/generate-code', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    walletAddress: '0x1234...'
  })
});

// Get faucet status
const faucetStatus = await fetch('https://omeganetwork.co/api/faucet/status?walletAddress=0x1234...');
```

### Python
```python
import requests

# Get ambassador leaderboard
response = requests.get('https://omeganetwork.co/api/v1/ambassadors/leaderboard?limit=10')
data = response.json()

# Track achievement
requests.post('https://omeganetwork.co/api/achievements/track', json={
    'walletAddress': '0x1234...',
    'achievementId': 'first_claim',
    'action': 'faucet_claim'
})
```

---

## 📞 Support

For API support and questions:
- **Documentation**: This file
- **GitHub Issues**: [Omega Network Repository](https://github.com/omeganetwork)
- **Discord**: [Omega Network Discord](https://discord.gg/omeganetwork)

---

*Last updated: January 2024*
