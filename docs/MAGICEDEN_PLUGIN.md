# Magic Eden Plugin for Omega Terminal 🔮

NFT marketplace integration for tracking Solana NFT collections via Magic Eden API.

## 📁 Files Created

```
js/plugins/magiceden-plugin.js       - Core API integration
js/commands/magiceden-commands.js    - Terminal commands
styles/magiceden.css                 - Styling
```

## 🚀 Installation

### Step 1: Start the Relayer Server

The plugin requires the backend relayer to proxy Magic Eden API calls (to avoid CORS issues):

```bash
cd server
node relayer-faucet.js
```

The relayer will run on `http://localhost:4000` with these new endpoints:
- `GET /magiceden/activities?symbol=degods&limit=10`
- `GET /magiceden/stats?symbol=degods`
- `GET /magiceden/listings?symbol=degods&limit=10`

### Step 2: Add to `terminal.html`

Add these lines in the appropriate sections of `terminal.html`:

```html
<!-- In the CSS section, add: -->
<link rel="stylesheet" href="styles/magiceden.css">

<!-- In the plugins section, add: -->
<script src="js/plugins/magiceden-plugin.js"></script>

<!-- In the commands section, add: -->
<script src="js/commands/magiceden-commands.js"></script>
```

### Step 3: Test

Open `test-magiceden.html` in your browser or open terminal and type:
```
magiceden help
```

## 💻 Available Commands

### 1. Collection Activities
View recent buy/sell/list activities for a collection.

```bash
magiceden activities degods
magiceden activities okay_bears 20
me activities mad_lads
```

**Output:**
- Transaction type (buy, list, bid, etc.)
- Price in SOL
- Timestamp
- Buyer/Seller addresses
- Transaction signature

### 2. Collection Stats
View floor price, volume, and listing statistics.

```bash
magiceden stats degods
me stats okay_bears
```

**Output:**
- Floor Price
- Listed Count
- 24h Volume
- 24h Average Price

### 3. Collection Listings
View current listings for a collection.

```bash
magiceden listings degods
magiceden listings mad_lads 5
me listings okay_bears 15
```

**Output:**
- Listed price
- Seller address
- Token mint

## 🎯 Command Aliases

- `me` = `magiceden` (shorter to type!)

## 📊 API Endpoints Used

All data comes from Magic Eden's public API v2:

```
https://api-mainnet.magiceden.dev/v2/collections/{symbol}/activities
https://api-mainnet.magiceden.dev/v2/collections/{symbol}/stats
https://api-mainnet.magiceden.dev/v2/collections/{symbol}/listings
```

## 🎨 Features

✅ Real-time NFT activity tracking  
✅ Collection floor price & stats  
✅ Current listings with prices  
✅ Beautiful terminal-style output  
✅ Color-coded activity types  
✅ Timestamps (relative time)  
✅ SOL price formatting  
✅ Wallet address truncation  
✅ Hover effects on cards  
✅ Responsive design  

## 🔮 Future Enhancements (TODO)

- [ ] Collection search by name
- [ ] Popular collections list
- [ ] Trending collections (24h volume)
- [ ] Wallet portfolio tracking
- [ ] Price alerts
- [ ] Collection analytics/charts
- [ ] Rarity data integration
- [ ] Buy/sell direct from terminal (wallet integration)
- [ ] Watch list feature
- [ ] Historical price graphs

## 🐛 Troubleshooting

**Collection not found?**
- Make sure you're using the collection's symbol (e.g., `degods` not `DeGods`)
- Check spelling carefully
- Some collections use underscores: `okay_bears`, `mad_lads`

**API errors?**
- Magic Eden's API has rate limits
- Wait a few seconds between requests
- Check internet connection

**Styling issues?**
- Hard refresh: `Ctrl + Shift + R`
- Clear cache and reload
- Check that `magiceden.css` is loaded

## 📖 Popular Collections

Try these collection symbols:
- `degods` - DeGods
- `okay_bears` - Okay Bears
- `mad_lads` - Mad Lads
- `smb` - Solana Monkey Business
- `abc` - Okay Bears
- `frakt` - Frakt

## 🔗 Magic Eden API Docs

https://api.magiceden.dev/

## 📝 Notes

- This plugin uses the backend relayer to proxy Magic Eden API calls (avoids CORS)
- Relayer must be running on `localhost:4000`
- Data is cached to reduce API calls
- All prices are in SOL (Solana)
- Price format: Uses `priceInfo.solPrice.rawAmount` divided by decimals
- Activity types: list, delist, buyNow, bid, acceptBid, cancelBid, poolUpdate

## 🤝 Contributing

This plugin is modular and designed for easy expansion. To add new features:

1. Add new API methods to `window.MagicEdenAPI` in `magiceden-plugin.js`
2. Add new commands to `window.OmegaCommands.MagicEden` in `magiceden-commands.js`
3. Update help text in `showHelp()` function
4. Add new CSS classes to `magiceden.css` as needed

## 📄 License

Part of the Omega Terminal project.

