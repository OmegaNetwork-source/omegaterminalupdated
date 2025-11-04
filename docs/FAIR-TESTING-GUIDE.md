# FAIR Blockchain Integration - Testing Guide

## Overview
This document provides comprehensive testing flows for the FAIR blockchain integration including wallet management, token factory, FNS (FAIR Name Service), and NFT minting with IPFS upload.

---

## Prerequisites
- Terminal loaded at: http://localhost:8000
- Test images ready for NFT minting (PNG, JPG, etc.)
- Optional: MetaMask installed for wallet connection testing

---

## PHASE 1: WALLET SETUP

### Test 1.1: View FAIR Help
**Prompt:**
```
fair help
```

**Expected Results:**
- Display comprehensive help menu
- Show all FAIR commands: generate, connect, wallet, balance, faucet, send, send-token, create-token, my-tokens, token-info, mint-nft, my-nfts, nft-info, transfer-nft
- Show network information:
  - Chain ID: 935
  - RPC: https://testnet-rpc.fair.cloud
  - Explorer: https://testnet-explorer.fair.cloud
- Show deployed contract addresses:
  - Token Factory: 0x30a399891f44c2ee07134e248d0393e53286f5f4
  - NFT Contract: 0xe133cb4df4834c7e0b4aea5181ab40477c9fa30e
  - FNS Contract: 0x2d06d9568ae99f61f421ea99a46969878986fc2d
- Display helpful tips and command examples

---

### Test 1.2: Generate FAIR Wallet
**Prompt:**
```
fair generate
```

**Expected Results:**
- Display "FAIR Wallet Generated!"
- Show generated wallet address (starts with 0x)
- Show private key (starts with 0x)
- Display warning to keep private key secure
- Show balance: 0 FAIR
- Provide tip: "Get testnet tokens: fair faucet"
- Wallet data stored in browser localStorage (window.fairWallet)

---

### Test 1.3: Check Wallet Information
**Prompt:**
```
fair wallet
```

**Expected Results:**
- Display "FAIR Wallet" header
- Show wallet address (same as generated)
- Show private key
- Show current balance (0 FAIR initially)
- Provide clickable link to FAIR explorer with address

---

### Test 1.4: Check Balance
**Prompt:**
```
fair balance
```

**Expected Results:**
- Display "Checking balance..." message
- Show balance: "0 FAIR" (if no tokens yet)
- Show wallet address
- Provide link to FAIR explorer

---

## PHASE 2: GET TEST TOKENS

### Test 2.1: Use Faucet
**Prompt:**
```
fair faucet
```

**Expected Results:**
- Display "FAIR Testnet Faucet" header
- Message: "Your address has been copied to clipboard!"
- Show wallet address
- Open new browser tab to: https://faucet.fair.cloud/
- Display step-by-step instructions:
  1. Paste your address (already copied to clipboard)
  2. Complete the captcha
  3. Click 'Request Tokens'
  4. Wait approximately 30 seconds for tokens to arrive
- Provide tip: "After claiming, check balance: fair balance"

**Manual Action Required:**
- Navigate to faucet tab
- Paste address in form
- Complete captcha
- Click request button
- Wait 30-60 seconds for transaction

---

### Test 2.2: Verify Balance After Faucet
**Prompt:**
```
fair balance
```

**Expected Results:**
- Display updated balance (e.g., "100 FAIR" or faucet amount)
- Show wallet address
- Provide link to FAIR explorer

---

## PHASE 3: METAMASK CONNECTION

### Test 3.1: Connect MetaMask
**Prompt:**
```
fair connect
```

**Expected Results:**
- Display "Connecting to FAIR network..." message
- MetaMask popup appears requesting connection
- If FAIR network not in MetaMask:
  - Additional popup: "Add FAIR Testnet Beta network?"
  - Display network details (Chain ID: 935, RPC endpoint, etc.)
- After approval: "Connected to FAIR network!"
- Display connected MetaMask address
- Display current balance
- Message: "MetaMask is now connected to FAIR Testnet Beta"

---

## PHASE 4: FNS (FAIR NAME SERVICE)

### Test 4.1: View FNS Help
**Prompt:**
```
fns help
```

**Expected Results:**
- Display "FAIR Name Service (FNS)" header
- Show all FNS commands:
  - fns register <name> - Register a new FNS name
  - fns resolve <name> - Get address for FNS name
  - fns lookup <address> - Reverse lookup (address to name)
  - fns transfer <name> <address> - Transfer name ownership
  - fns search <term> - Search for names
  - fns help - Show help
- Show FNS contract address: 0x2d06d9568ae99f61f421ea99a46969878986fc2d
- Display usage examples and tips

---

### Test 4.2: Register FNS Name
**Prompt:**
```
fns register myname
```

**Expected Results:**
- Display "Registering FNS name: myname.fns..."
- Show transaction hash
- Display "Waiting for confirmation..." message
- After 5-10 seconds: "FNS name registered successfully!"
- Show registered name: "myname.fns"
- Show owner address (your wallet address)
- Provide link to explorer transaction
- Tip: "Use: fns resolve myname to check"

---

### Test 4.3: Resolve FNS Name
**Prompt:**
```
fns resolve myname
```

**Expected Results:**
- Display "Resolving: myname.fns"
- Show resolution: "myname.fns -> [your wallet address]"
- Address should be clickable/copyable

---

### Test 4.4: Lookup Address (Reverse Resolution)
**Prompt:**
```
fns lookup [your wallet address]
```

**Expected Results:**
- Display "Looking up address..." message
- Show "Primary Name: myname.fns"
- Show address
- If no name registered: "No FNS name found for this address"

---

### Test 4.5: Search FNS Names
**Prompt:**
```
fns search my
```

**Expected Results:**
- Display "Searching FNS registry for: my"
- Show matching names (e.g., "myname.fns")
- Display owner addresses for each match
- If multiple results, list up to 10
- If no results: "No names found matching 'my'"

---

### Test 4.6: Register Additional FNS Name
**Prompt:**
```
fns register testname
```

**Expected Results:**
- Same flow as Test 4.2
- Successfully registers "testname.fns"
- Shows transaction confirmation

---

## PHASE 5: TOKEN CREATION

### Test 5.1: Create Simple Token
**Prompt:**
```
fair create-token
```

**Interactive Flow:**

**Step 1 - Token Name:**
```
Enter token name:
> TestToken
```

**Step 2 - Token Symbol:**
```
Enter token symbol:
> TEST
```

**Step 3 - Initial Supply:**
```
Enter initial supply (in tokens):
> 1000000
```

**Step 4 - Burnable Option:**
```
Make token burnable? (yes/no):
> no
```

**Step 5 - Mintable Option:**
```
Make token mintable? (yes/no):
> no
```

**Step 6 - Pausable Option:**
```
Make token pausable? (yes/no):
> no
```

**Expected Results:**
- Display "Token Configuration" summary showing all entered details
- Display "Creating token..." message
- Show transaction hash
- Display "Waiting for confirmation..." message
- After confirmation: "Token Created Successfully!"
- Show token contract address
- Display token details:
  - Name: TestToken
  - Symbol: TEST
  - Total Supply: 1,000,000 TEST
  - Decimals: 18
  - Burnable: No
  - Mintable: No
  - Pausable: No
- Provide link to FAIR explorer
- Tip: "Use: fair token-info [address] to view details"

---

### Test 5.2: Create Advanced Token (All Features Enabled)
**Prompt:**
```
fair create-token
```

**Interactive Flow:**
```
Token name: AdvancedToken
Symbol: ADV
Supply: 500000
Burnable: yes
Mintable: yes
Pausable: yes
```

**Expected Results:**
- Same flow as Test 5.1
- Token created with features enabled:
  - Burnable: Yes
  - Mintable: Yes
  - Pausable: Yes
- All other confirmations same as simple token

---

### Test 5.3: View Your Created Tokens
**Prompt:**
```
fair my-tokens
```

**Expected Results:**
- Display "Your Created Tokens (2)"
- Show both tokens created in previous tests:
  
  **Token 1:**
  - Name: TestToken (TEST)
  - Total Supply: 1,000,000 TEST
  - Token Address: [contract address]
  - Explorer link
  
  **Token 2:**
  - Name: AdvancedToken (ADV)
  - Total Supply: 500,000 ADV
  - Token Address: [contract address]
  - Explorer link

- If more than 10 tokens exist: "... and X more"

---

### Test 5.4: Get Token Information
**Prompt:**
```
fair token-info [TestToken address from Test 5.1]
```

**Expected Results:**
- Display "Getting token info..." message
- Show "Token Information" header
- Display complete token details:
  - Name: TestToken
  - Symbol: TEST
  - Total Supply: 1,000,000 TEST
  - Decimals: 18
  - Contract Address: [address]
- Provide link to FAIR explorer
- Tip: "Add to MetaMask: Import token using this address"

---

## PHASE 6: TOKEN SENDING

### Test 6.1: Send FAIR to Address
**Prompt:**
```
fair send 1 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
```
(Use any valid Ethereum address or generate a second wallet)

**Expected Results:**
- Display "Sending 1 FAIR to 0x742d35Cc..."
- Show transaction hash
- Display "Waiting for confirmation..." message
- After confirmation: "FAIR sent successfully!"
- Show amount sent: 1 FAIR
- Show recipient address
- Provide link to explorer transaction

---

### Test 6.2: Send FAIR to FNS Name
**Prompt:**
```
fair send 0.5 myname
```
(Can use "myname" or "myname.fns")

**Expected Results:**
- Display "Resolving FNS name: myname.fns..."
- Show "Resolved to: [address]"
- Display "Sending 0.5 FAIR to myname.fns..."
- Show transaction hash
- After confirmation: "FAIR sent successfully!"
- Show "To: myname.fns ([resolved address])"
- Provide link to explorer transaction

---

### Test 6.3: Send ERC20 Token to Address
**Prompt:**
```
fair send-token [TestToken address] 100 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
```

**Expected Results:**
- Display "Sending 100 tokens to 0x742d35Cc..."
- Show transaction hash
- After confirmation: "Tokens sent successfully!"
- Show amount and token address
- Show recipient address
- Provide link to explorer transaction

---

### Test 6.4: Send ERC20 Token to FNS Name
**Prompt:**
```
fair send-token [TestToken address] 50 myname.fns
```

**Expected Results:**
- Display FNS resolution message
- Show resolved address
- Display token sending confirmation
- Show transaction hash
- After confirmation: Success message with FNS name and resolved address
- Provide link to explorer

---

## PHASE 7: NFT MINTING

### Test 7.1: Mint NFT with Image Upload
**Prompt:**
```
fair mint-nft
```

**Interactive Flow:**

**Step 1 - NFT Name:**
```
Enter NFT name:
> My First FAIR NFT
```

**Step 2 - NFT Description:**
```
Enter NFT description:
> This is a test NFT minted on FAIR blockchain
```

**Step 3 - Image Upload:**
```
Click to select an image to upload...
```
[File picker dialog opens - select an image file]

**Expected Results:**
- Display "Selected: [filename] (X.XX MB)"
- Display "Uploading image to IPFS via Pinata..."
- After upload: "Image uploaded to IPFS: [IPFS hash]"
- Display "Uploading metadata to IPFS..."
- After upload: "Metadata uploaded to IPFS: [IPFS hash]"
- Show "NFT Details":
  - Name: My First FAIR NFT
  - Description: This is a test NFT minted on FAIR blockchain
  - Image: https://gateway.pinata.cloud/ipfs/[hash]
  - Metadata: https://gateway.pinata.cloud/ipfs/[hash]
- Display "Minting NFT..." message
- Show transaction hash
- Display "Waiting for confirmation..." message
- After confirmation: "NFT Minted Successfully!"
- Show Token ID: #0 (or next available ID)
- Show Owner: [your wallet address]
- Provide link to explorer transaction
- Tip: "Use: fair my-nfts to see all your NFTs"

---

### Test 7.2: View Your NFTs
**Prompt:**
```
fair my-nfts
```

**Expected Results:**
- Display "Fetching your NFTs..." message
- Show "Your FAIR NFTs (1):"
- Display NFT information:
  - Token #0 - My First FAIR NFT
  - Description: This is a test NFT minted on FAIR blockchain
  - Image: View (clickable link to IPFS)
  - Explorer: View NFT (clickable link to FAIR explorer)
- If more than 10 NFTs: "... and X more"
- If no NFTs owned: "You don't own any FAIR NFTs yet. Mint one with: fair mint-nft"

---

### Test 7.3: Get NFT Information
**Prompt:**
```
fair nft-info 0
```

**Expected Results:**
- Display "Getting info for NFT #0..."
- Show "FAIR NFT #0" header
- Display complete NFT details:
  - Name: My First FAIR NFT
  - Description: This is a test NFT minted on FAIR blockchain
  - Owner: [your wallet address] (clickable/copyable)
  - Image: View Image (clickable link to IPFS)
  - Attributes:
    - Network: FAIR
    - Blockchain: FAIR Testnet
  - Explorer: View on FAIR Explorer (clickable link)

---

### Test 7.4: Mint Second NFT
**Prompt:**
```
fair mint-nft
```

**Interactive Flow:**
```
NFT Name: FAIR Art #2
Description: Another beautiful NFT on FAIR
Image: [select different image file]
```

**Expected Results:**
- Same upload and minting flow as Test 7.1
- Image uploaded to IPFS successfully
- Metadata uploaded to IPFS successfully
- Token ID: #1
- Minting successful
- All confirmations and links provided

---

### Test 7.5: Transfer NFT to Address
**Prompt:**
```
fair transfer-nft 0 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
```

**Expected Results:**
- Display "Transferring NFT #0 to 0x742d35Cc..."
- Show transaction hash
- Display "Waiting for confirmation..." message
- After confirmation: "NFT #0 transferred!"
- Show recipient address
- Provide link to explorer transaction

---

### Test 7.6: Transfer NFT to FNS Name
**Prompt:**
```
fair transfer-nft 1 myname.fns
```

**Expected Results:**
- Display "Resolving FNS name: myname.fns..."
- Show "Resolved to: [address]"
- Display "Transferring NFT #1 to myname.fns..."
- Show transaction hash
- After confirmation: "NFT #1 transferred!"
- Show "To: myname.fns ([resolved address])"
- Provide link to explorer transaction

---

### Test 7.7: Verify NFT Ownership After Transfer
**Prompt:**
```
fair my-nfts
```

**Expected Results:**
- Show "Your FAIR NFTs (0)" or remaining count
- NFT #0 and #1 should NOT appear (transferred to other address)
- If no NFTs remaining: "You don't own any FAIR NFTs yet."

---

### Test 7.8: Check Transferred NFT Information
**Prompt:**
```
fair nft-info 0
```

**Expected Results:**
- Display NFT #0 information
- Owner field should show: 0x742d35Cc... (the recipient address)
- All other details (name, description, image, metadata) remain unchanged

---

## PHASE 8: ERROR HANDLING & EDGE CASES

### Test 8.1: Command Without Wallet
**Setup:** Clear localStorage or use incognito mode

**Prompt:**
```
fair send 1 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
```

**Expected Results:**
- Display error: "No wallet connected. Use: fair generate or fair connect"

---

### Test 8.2: Resolve Non-Existent FNS Name
**Prompt:**
```
fns resolve nonexistentname
```

**Expected Results:**
- Display "Resolving: nonexistentname.fns"
- Show error: "FNS name 'nonexistentname' not registered"
- Tip: "Register it with: fns register nonexistentname"

---

### Test 8.3: Send to Invalid FNS Name
**Prompt:**
```
fair send 1 badname
```

**Expected Results:**
- Attempt to resolve "badname.fns"
- Display error: "FNS name 'badname.fns' not found"

---

### Test 8.4: Insufficient Balance
**Prompt:**
```
fair send 999999 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
```

**Expected Results:**
- Transaction fails
- Display error: "Failed to send FAIR: insufficient funds" or similar blockchain error

---

### Test 8.5: Get Information for Non-Existent NFT
**Prompt:**
```
fair nft-info 999
```

**Expected Results:**
- Display "Getting info for NFT #999..."
- Show error: "Failed to get NFT info: [error details]"
- Tip: "This token may not exist yet"

---

### Test 8.6: Register Duplicate FNS Name
**Prompt:**
```
fns register myname
```
(myname already registered in Test 4.2)

**Expected Results:**
- Transaction may fail or revert
- Display error about name already being registered

---

### Test 8.7: Transfer NFT You Don't Own
**Prompt:**
```
fair transfer-nft 0 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
```
(After already transferring NFT #0)

**Expected Results:**
- Transaction fails
- Display error: "Failed to transfer NFT: Not authorized"
- Tip: "You must own this NFT to transfer it"

---

### Test 8.8: Create Token Without Wallet
**Setup:** Clear localStorage

**Prompt:**
```
fair create-token
```

**Expected Results:**
- Display error: "No wallet connected. Use: fair generate or fair connect"

---

### Test 8.9: Mint NFT Without Selecting Image
**Prompt:**
```
fair mint-nft
```

**Interactive Flow:**
```
Name: Test NFT
Description: Test description
Image: [Click cancel on file picker]
```

**Expected Results:**
- Display error: "No image selected"
- Minting process cancelled

---

## PHASE 9: UI/UX VERIFICATION

### Test 9.1: Cursor Visibility
**Action:** Type in terminal input field

**Expected Results:**
- Blinking cursor visible after last character
- Cursor follows text as typing occurs
- Cursor visible in default theme
- Cursor visible in Modern UI (Apple) theme
- Cursor blinks (appears and disappears periodically)

---

### Test 9.2: Input Field Width
**Action:** Type long command in terminal

**Expected Results:**
- Input field does not get cut off on right edge
- Text wraps or scrolls appropriately
- Full command remains visible or accessible

---

### Test 9.3: Tab Completion for FAIR
**Action:** Type "fai" then press TAB key

**Expected Results:**
- Autocompletes to "fair "

---

### Test 9.4: Tab Completion for FNS
**Action:** Type "fn" then press TAB key

**Expected Results:**
- Autocompletes to "fns "

---

### Test 9.5: Explorer Links
**Action:** Click any "View on explorer" link

**Expected Results:**
- Opens in new browser tab
- Navigates to correct FAIR explorer page
- Shows relevant transaction/address/token/NFT

---

### Test 9.6: Copy to Clipboard
**Action:** Click on copyable address/hash

**Expected Results:**
- Address/hash copied to system clipboard
- Can paste value successfully

---

## PHASE 10: COMPREHENSIVE WORKFLOW TEST

### Full Integration Test
Execute complete workflow from start to finish:

1. Generate wallet (fair generate)
2. Get testnet tokens (fair faucet)
3. Verify balance (fair balance)
4. Register FNS name (fns register testuser)
5. Resolve FNS name (fns resolve testuser)
6. Create token (fair create-token)
   - Name: WorkflowToken
   - Symbol: WORK
   - Supply: 100000
   - All features: no
7. View created tokens (fair my-tokens)
8. Send FAIR to FNS name (fair send 1 testuser.fns)
9. Send token to address (fair send-token [token-address] 50 [address])
10. Mint NFT (fair mint-nft)
    - Name: Workflow Test NFT
    - Description: Complete workflow test
    - Image: Upload test image
11. View NFTs (fair my-nfts)
12. Get NFT info (fair nft-info 0)

**Expected Results:**
- All steps complete successfully
- No errors or crashes
- All transactions confirm on blockchain
- All data displays correctly
- All links functional

---

## TESTING SUMMARY

### Commands to Test

**FAIR Commands:**
- fair help
- fair generate
- fair wallet
- fair balance
- fair connect
- fair faucet
- fair send <amount> <address|fns>
- fair send-token <token> <amount> <address|fns>
- fair create-token
- fair my-tokens
- fair token-info <address>
- fair mint-nft
- fair my-nfts
- fair nft-info <tokenId>
- fair transfer-nft <tokenId> <address|fns>

**FNS Commands:**
- fns help
- fns register <name>
- fns resolve <name>
- fns lookup <address>
- fns transfer <name> <address>
- fns search <term>

### Key Features to Verify

1. Wallet Generation and Management
2. MetaMask Integration
3. Balance Checking
4. Faucet Integration
5. FNS Name Registration
6. FNS Name Resolution
7. FNS Reverse Lookup
8. FNS Name Search
9. Token Factory (Simple)
10. Token Factory (Advanced with features)
11. Token Information Display
12. FAIR Token Sending (address)
13. FAIR Token Sending (FNS)
14. ERC20 Token Sending (address)
15. ERC20 Token Sending (FNS)
16. NFT Minting with IPFS Upload
17. NFT Viewing
18. NFT Information Display
19. NFT Transfer (address)
20. NFT Transfer (FNS)
21. Error Handling
22. UI/UX Elements

### Contract Addresses

**Token Factory:**
0x30a399891f44c2ee07134e248d0393e53286f5f4

**NFT Contract:**
0xe133cb4df4834c7e0b4aea5181ab40477c9fa30e

**FNS Contract:**
0x2d06d9568ae99f61f421ea99a46969878986fc2d

### Network Information

**Network Name:** FAIR Testnet Beta
**Chain ID:** 935
**RPC URL:** https://testnet-rpc.fair.cloud
**Explorer URL:** https://testnet-explorer.fair.cloud
**Gas Symbol:** FAIR
**Faucet URL:** https://faucet.fair.cloud/

---

## End of Testing Guide

