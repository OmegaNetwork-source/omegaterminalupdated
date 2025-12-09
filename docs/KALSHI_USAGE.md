# Kalshi Command Usage Guide

## ✅ Server Status

The unified relayer server is running on **port 4000** and includes both Polymarket and Kalshi proxy endpoints.

**Start server:** `npm run start:relayer` or `node server/relayer-faucet.js`

## 📋 Command Reference

### List Markets (Plural: "markets")

```bash
kalshi markets [limit] [status]
```

**Examples:**

- `kalshi markets` - List default markets
- `kalshi markets 10` - List 10 markets
- `kalshi markets 10 open` - List 10 open markets
- `kalshi markets 5 closed` - List 5 closed markets

**Status options:** `open`, `closed`, `settled`, `active`

### Get Market Details (Singular: "market")

```bash
kalshi market <ticker>
```

**Example:**

- `kalshi market KXNFLMENTION-25OCT28-BARB` - Get details for specific market

**Note:** You need the exact ticker from the `kalshi markets` command.

### View Order Book

```bash
kalshi orderbook <ticker> [depth]
```

**Example:**

- `kalshi orderbook KXNFLMENTION-25OCT28-BARB`
- `kalshi orderbook KXNFLMENTION-25OCT28-BARB 10`

### View Recent Trades

```bash
kalshi trades <ticker> [limit]
```

**Example:**

- `kalshi trades KXNFLMENTION-25OCT28-BARB`
- `kalshi trades KXNFLMENTION-25OCT28-BARB 20`

### Browse Events

```bash
kalshi events [status]
```

**Example:**

- `kalshi events` - List all events
- `kalshi events open` - List open events

### Get Event Details

```bash
kalshi event <ticker>
```

**Example:**

- `kalshi event KXNFLMENTION-25OCT28`

### Get Series Information

```bash
kalshi series <ticker>
```

**Example:**

- `kalshi series KXNFL`

## 🔧 Common Mistakes

### ❌ Wrong: `kalshi market 10 open`

This tries to get details for a market with ticker "10", which doesn't exist.

### ✅ Correct Workflow:

1. **First**, list markets: `kalshi markets 10 open`
2. **Then**, get details using a ticker from the list: `kalshi market KXNFLMENTION-25OCT28-BARB`

## 🔐 Authentication

All authentication is handled automatically on the server-side using credentials from `.env`:

- `KALSHI_API_KEY`
- `KALSHI_PRIVATE_KEY`

No frontend authentication is needed!

**Note:** Portfolio commands (balance, positions, orders, fills) and trading features have been removed from the frontend. The terminal now focuses on **public market data viewing only**.

## 📡 API Endpoint

The proxy automatically routes requests to: `https://demo-api.kalshi.co/trade-api/v2`

## 🎯 Testing

```bash
# Test via curl
curl 'https://terminal-v1-5-9.onrender.com/kalshi (or http://localhost:4000/kalshi in development)/markets?limit=5'

# Test in terminal
kalshi markets 5 open
kalshi market <ticker-from-above-list>
```

## 📊 Available Commands Summary

- **kalshi** - Show help menu
- **kalshi markets** - Browse all markets with filters
- **kalshi market** - View specific market details
- **kalshi orderbook** - View market order book
- **kalshi trades** - View recent trades
- **kalshi events** - Browse events
- **kalshi event** - View specific event details
- **kalshi series** - View series information
