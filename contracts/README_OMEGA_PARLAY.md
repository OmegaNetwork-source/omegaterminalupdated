# OmegaParlay Smart Contract

## Overview

The OmegaParlay smart contract is a comprehensive prediction market parlay system that supports:

- **Individual Parlays**: Create parlays with 2-10 legs across Kalshi and Polymarket
- **Leverage**: Up to 5x leverage on positions
- **Community Pools**: Join forces with other traders in shared parlays
- **Tier-based Payouts**: Higher contributors get better multipliers
- **Early Cashout**: Exit positions before resolution
- **Oracle Integration**: Automated market resolution

## Deployment Guide (Remix IDE)

### Prerequisites

1. MetaMask wallet connected to your target network
2. Sufficient ETH/MATIC for gas fees
3. USDC/USDT for the collateral token

### Step 1: Open Remix IDE

Navigate to [remix.ethereum.org](https://remix.ethereum.org)

### Step 2: Create Contract File

1. In the File Explorer, create a new file: `OmegaParlay.sol`
2. Copy the entire contract code from `contracts/OmegaParlay.sol`

### Step 3: Install OpenZeppelin Dependencies

In the Remix terminal, run:
```
npm install @openzeppelin/contracts
```

Or use Remix's built-in package manager to import OpenZeppelin contracts.

### Step 4: Compile Contract

1. Go to the **Solidity Compiler** tab (left sidebar)
2. Select compiler version: `0.8.20`
3. Enable optimization: `200 runs`
4. Click **Compile OmegaParlay.sol**

### Step 5: Deploy Contract

1. Go to the **Deploy & Run Transactions** tab
2. Select environment: **Injected Provider - MetaMask**
3. Select contract: `OmegaParlay`
4. Enter constructor arguments:
   - `_collateralToken`: USDC address (e.g., `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174` on Polygon)
   - `_treasury`: Your treasury wallet address
   - `_maxLeverageExposure`: Maximum leverage exposure (e.g., `1000000000000` for $1M in 6 decimals)
5. Click **Deploy**
6. Confirm the transaction in MetaMask

### Step 6: Verify Contract (Optional)

On Polygonscan or Etherscan:
1. Go to Contract tab → Verify & Publish
2. Select "Solidity (Single file)"
3. Upload flattened contract or use plugin

## Contract Addresses (Example Deployments)

| Network | Address | Status |
|---------|---------|--------|
| Polygon Mainnet | `TBD` | Pending |
| Polygon Mumbai | `TBD` | Pending |
| Base Mainnet | `TBD` | Pending |

## Key Functions

### Creating a Parlay

```solidity
function createParlay(
    string calldata name,
    uint256 stake,
    uint8 leverage,
    bytes32[] calldata marketIds,
    MarketVenue[] calldata venues,
    MarketSide[] calldata sides,
    uint256[] calldata entryOdds
) external returns (bytes32 parlayId)
```

**Parameters:**
- `name`: Parlay name (e.g., "Crypto Bull Run")
- `stake`: Base stake in collateral tokens (6 decimals for USDC)
- `leverage`: 1-5x leverage multiplier
- `marketIds`: Array of keccak256 hashed market identifiers
- `venues`: Array of market venues (0 = Polymarket, 1 = Kalshi)
- `sides`: Array of prediction sides (0 = Yes, 1 = No)
- `entryOdds`: Array of entry odds (scaled by 1e6, e.g., 1500000 = 1.5x)

### Creating a Community Pool

```solidity
function createPool(
    string calldata name,
    uint256 minEntry,
    uint256 maxEntry,
    uint256 maxParticipants,
    uint256 resolutionDate,
    uint256 initialLiquidity,
    uint256 tier1Threshold,
    uint256 tier2Threshold,
    bytes32[] calldata marketIds,
    MarketVenue[] calldata venues,
    MarketSide[] calldata sides,
    uint256[] calldata entryOdds
) external returns (bytes32 poolId)
```

### Joining a Pool

```solidity
function joinPool(bytes32 poolId, uint256 contribution) external
```

### Cashing Out

```solidity
function cashout(bytes32 parlayId) external
```

### Resolving Markets

```solidity
function resolveMarket(
    bytes32 marketId,
    MarketVenue venue,
    LegStatus resolution
) external
```

## Fee Structure

| Fee Type | Rate | Description |
|----------|------|-------------|
| Platform Fee | 2% | Applied to stake |
| Leverage Fee | 1% per level | Additional fee for leverage above 1x |
| Cashout Fee | 5% | Applied to early exits |

## Events

```solidity
event ParlayCreated(bytes32 indexed parlayId, address indexed creator, ...);
event ParlayResolved(bytes32 indexed parlayId, ParlayStatus status, uint256 payout, ...);
event PoolCreated(bytes32 indexed poolId, address indexed creator, ...);
event PoolJoined(bytes32 indexed poolId, address indexed user, uint256 contribution, ...);
event MarketResolved(bytes32 indexed marketId, MarketVenue venue, LegStatus resolution);
```

## Security Considerations

1. **Reentrancy Protection**: All external calls use ReentrancyGuard
2. **Pausable**: Contract can be paused by owner in emergencies
3. **Access Control**: Oracle functions restricted to authorized addresses
4. **Leverage Limits**: Maximum exposure limits enforced

## Integration with Frontend

### Market ID Generation

```typescript
// Generate market ID from external identifier
const marketId = ethers.keccak256(
  ethers.toUtf8Bytes(`${venue}:${externalMarketId}`)
);
```

### Reading Parlay Data

```typescript
const [parlay, legs] = await contract.getParlay(parlayId);
console.log('Total Odds:', parlay.totalOdds / 1e6);
console.log('Potential Payout:', ethers.formatUnits(parlay.potentialPayout, 6));
```

### Subscribing to Events

```typescript
contract.on('ParlayCreated', (parlayId, creator, stake, leverage) => {
  console.log(`New parlay created: ${parlayId}`);
});
```

## Testing

Run the test suite:

```bash
npx hardhat test test/OmegaParlay.test.ts
```

## License

MIT License - see LICENSE file for details.

## Support

For questions or issues:
- GitHub Issues: [omega-terminal/issues](https://github.com/omega-terminal/issues)
- Discord: [Omega Terminal Discord](https://discord.gg/omega-terminal)

