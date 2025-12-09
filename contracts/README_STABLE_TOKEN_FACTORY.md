# Stable Token Factory - Deployment Instructions

## Overview
This is a token factory contract for creating ERC20 tokens on Stable Network testnet. Once deployed, users can create unlimited tokens through the terminal.

## Contract Files
- `StableTokenFactoryStandalone.sol` - Standalone version (no dependencies, ready for Remix)
- `StableTokenFactory.sol` - Version with OpenZeppelin imports (for local development)

## Deployment Steps (Remix)

### 1. Open Remix
Go to https://remix.ethereum.org/

### 2. Create New File
- Click "Create new file"
- Name it: `StableTokenFactory.sol`
- Copy the entire contents of `StableTokenFactoryStandalone.sol`

### 3. Compile
- Go to the "Solidity Compiler" tab
- Select compiler version: **0.8.20** or higher
- Click "Compile StableTokenFactory.sol"
- Ensure no errors

### 4. Deploy
- Go to the "Deploy & Run Transactions" tab
- Environment: Select "Injected Provider - MetaMask" (or your wallet)
- **IMPORTANT**: Make sure you're connected to **Stable Network Testnet**
  - Chain ID: **2201**
  - RPC URL: `https://rpc.testnet.stable.xyz`
  - If not added, add it to MetaMask:
    - Network Name: Stable Testnet
    - RPC URL: https://rpc.testnet.stable.xyz
    - Chain ID: 2201
    - Currency Symbol: gUSDT
    - Block Explorer: https://testnet.stablescan.xyz

### 5. Get Testnet Tokens
- Visit: https://faucet.stable.xyz
- Request testnet tokens (gUSDT) for gas fees

### 6. Deploy Contract
- In Remix, select "StableTokenFactory" from the contract dropdown
- Click "Deploy"
- Confirm the transaction in MetaMask
- Wait for deployment confirmation

### 7. Save Factory Address
- After deployment, copy the contract address
- Update `FACTORY_ADDRESS` in `omega-terminal-nextjs/src/lib/commands/stable-token.ts`
- Replace: `const FACTORY_ADDRESS = "0x0000000000000000000000000000000000000000";`
- With: `const FACTORY_ADDRESS = "YOUR_DEPLOYED_ADDRESS_HERE";`

## Usage in Terminal

### Command
```
stable token create
```

### Interactive Wizard
The command will prompt you for:
1. **Token Name** (e.g., "My Awesome Token")
2. **Token Symbol** (e.g., "MAT")
3. **Decimals** (default: 18)
4. **Initial Supply** (e.g., 1000000)
5. **Mintable?** (yes/no, default: yes)
6. **Pausable?** (yes/no, default: yes)
7. **Confirm** (yes/no)

### Quick Action Button
Users can also click the "Token Creator" button in the Farming section sidebar, which will automatically enter `stable token create` in the terminal.

## Contract Features

### Factory Contract
- `createToken()` - Creates a new ERC20 token
- Emits `TokenCreated` event with token address

### Token Contract
Each created token includes:
- Standard ERC20 functionality (transfer, approve, etc.)
- Optional minting (if `mintable` is true)
- Optional pausing (if `pausable` is true)
- Owner controls (mint, pause/unpause)

## Network Information

- **Network Name**: Stable Testnet
- **Chain ID**: 2201
- **RPC**: https://rpc.testnet.stable.xyz
- **WebSocket**: wss://rpc.testnet.stable.xyz
- **Explorer**: https://testnet.stablescan.xyz
- **Faucet**: https://faucet.stable.xyz
- **Currency**: gUSDT

## Notes

- The factory can be deployed once and used indefinitely
- Each token creation is a separate contract deployment
- Gas fees are paid in gUSDT (Stable Network's native token)
- All tokens are ERC20 compatible and can be used with standard wallets


