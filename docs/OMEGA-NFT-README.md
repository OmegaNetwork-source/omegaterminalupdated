# 🎨 Omega NFT Minting System

Complete NFT minting functionality integrated into the Omega Terminal, allowing users to mint $1 USD NFTs directly via terminal commands.

## 🚀 Features

### ✅ **Terminal Integration**
- **Command:** `mint` - Mint NFT for $1 USD 
- **Price Check:** `mint price` - Check current ETH cost
- **Contract Info:** `mint info` - View contract details
- **Supply Stats:** `mint supply` - Check total minted
- **Help:** `mint help` - Full command documentation

### ✅ **Smart Contract (`OmegaMintNFT.sol`)**
- **Standard:** ERC-721 (OpenZeppelin)
- **Supply:** Unlimited minting
- **Price:** Fixed $1 USD (dynamic ETH pricing)
- **Network:** Ethereum Mainnet
- **Oracle:** Chainlink ETH/USD price feed
- **Features:** Auto-refund excess ETH, bulk minting

### ✅ **Dynamic Pricing**
- **Fixed USD Price:** Always $1.00 USD
- **Live ETH Conversion:** Real-time price via CoinGecko API
- **Price Oracle:** Chainlink ETH/USD feed for contract
- **Auto-refund:** Returns excess ETH sent

### ✅ **Metadata System**
- **Unified Design:** All NFTs have same artwork
- **Rich Metadata:** Name, description, attributes, rarity
- **IPFS Ready:** Metadata structure for decentralized hosting
- **OpenSea Compatible:** Full marketplace integration

## 📋 Files Created

| File | Purpose |
|------|---------|
| `OmegaMintNFT.sol` | Main NFT smart contract |
| `deploy-omega-nft.js` | Deployment configuration & instructions |
| `omega-nft-metadata.json` | NFT metadata template |
| `OMEGA-NFT-README.md` | Documentation (this file) |

## 🎮 Terminal Commands

```bash
# Basic minting
mint                    # Mint 1 NFT for $1 USD

# Information commands  
mint price              # Check current mint price in ETH
mint info               # Show contract details
mint supply             # Check total NFTs minted
mint help               # Full command documentation

# Examples
mint                    # Mint an NFT
mint price              # See: "Mint Cost: 0.000345 ETH ($1.00 USD)"
```

## 🔧 Deployment Steps

### **Step 1: Deploy Contract**
1. Open [Remix IDE](https://remix.ethereum.org)
2. Create `OmegaMintNFT.sol` with the contract code
3. Compile with Solidity 0.8.19+
4. Deploy to Ethereum Mainnet with parameters:
   - `name`: "Omega NFT Collection"
   - `symbol`: "OMEGA"
   - `baseTokenURI`: "https://omega-assets.vercel.app/metadata/"
   - `priceFeedAddress`: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"

### **Step 2: Set Up Metadata**
1. Host `omega-nft-metadata.json` on IPFS or web server
2. Update `baseTokenURI` in contract to your metadata URL
3. Create the NFT artwork image (same for all tokens)
4. Update image URL in metadata file

### **Step 3: Update Terminal**
1. Replace `CONTRACT_DEPLOYMENT_NEEDED` with actual deployment
2. Add deployed contract address to terminal
3. Test minting functionality

## 💰 Economics

- **Mint Price:** Fixed $1.00 USD
- **Payment:** ETH (amount varies with ETH price)
- **Gas Fees:** ~$10-50 (varies with network congestion)
- **Total Cost:** ~$11-51 USD per mint
- **Revenue:** 100% to contract owner (withdrawal function)

## 🎯 User Experience

### **Simple Minting Flow:**
1. **Type:** `mint` in terminal
2. **Connect:** MetaMask prompts for Ethereum connection
3. **Switch:** Auto-switch to Ethereum Mainnet
4. **Confirm:** See price and confirm transaction
5. **Mint:** Transaction processes on-chain
6. **Receive:** NFT appears in wallet immediately

### **Price Transparency:**
- Shows current ETH price from CoinGecko
- Calculates exact ETH cost for $1 USD
- Confirms price before transaction
- Auto-refunds any excess ETH sent

## 🔐 Security Features

- **OpenZeppelin:** Battle-tested ERC-721 implementation
- **Chainlink Oracle:** Reliable price data from decentralized network
- **Overflow Protection:** SafeMath and Solidity 0.8+ built-ins
- **Access Control:** Owner-only functions for configuration
- **Emergency Withdrawal:** Owner can withdraw funds if needed

## 🌟 NFT Features

- **Standard:** Full ERC-721 compliance
- **Marketplaces:** Compatible with OpenSea, Blur, LooksRare
- **Metadata:** Rich attributes and descriptions
- **Unlimited Supply:** No cap on total minting
- **Same Artwork:** Unified design across all tokens
- **Community Access:** Represents Omega ecosystem membership

## 🚀 Next Steps

1. **Deploy the contract** on Ethereum Mainnet
2. **Create NFT artwork** (Omega-themed design)
3. **Set up metadata hosting** (IPFS recommended)
4. **Test minting** with small amounts first
5. **Announce to community** via Omega channels

## 💡 Advanced Features (Future)

- **Batch Minting:** `mintMultiple()` for bulk purchases
- **Dynamic Metadata:** Different traits based on mint number
- **Utility Integration:** NFT holder benefits in Omega ecosystem
- **Staking Rewards:** Earn tokens by holding NFTs
- **Governance:** NFT voting in Omega DAO decisions

---

**Ready to launch!** 🚀 Deploy the contract and update the terminal with the contract address to enable live NFT minting. 