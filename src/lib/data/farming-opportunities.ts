/**
 * Farming Opportunities Data
 * Hardcoded list of testnet farming opportunities
 * Extensible for future API integration
 */

import type {
  FarmingOpportunity,
  FarmingNetwork,
  ContractTemplate,
  FarmingFlow,
} from "@/types/farming";

/**
 * Supported testnet networks for farming
 */
export const FARMING_NETWORKS: FarmingNetwork[] = [
  {
    id: "ethereum-testnet",
    name: "Ethereum Sepolia Testnet",
    type: "evm",
    rpcUrl: "https://rpc.sepolia.org",
    chainId: 11155111,
    explorerUrl: "https://sepolia.etherscan.io",
    faucetUrl: "https://sepoliafaucet.com",
    isTestnet: true,
    nativeToken: "ETH",
    metadata: {
      blockExplorerApiUrl: "https://api-sepolia.etherscan.io/api",
    },
  },
  {
    id: "bsc-testnet",
    name: "BSC Testnet",
    type: "evm",
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545",
    chainId: 97,
    explorerUrl: "https://testnet.bscscan.com",
    faucetUrl: "https://testnet.binance.org/faucet-smart",
    isTestnet: true,
    nativeToken: "BNB",
  },
  {
    id: "polygon-testnet",
    name: "Polygon Mumbai Testnet",
    type: "evm",
    rpcUrl: "https://matic-mumbai.chainstacklabs.com",
    chainId: 80001,
    explorerUrl: "https://mumbai.polygonscan.com",
    faucetUrl: "https://faucet.polygon.technology",
    isTestnet: true,
    nativeToken: "MATIC",
  },
  {
    id: "arbitrum-testnet",
    name: "Arbitrum Sepolia Testnet",
    type: "evm",
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    chainId: 421614,
    explorerUrl: "https://sepolia.arbiscan.io",
    faucetUrl: "https://faucet.quicknode.com/arbitrum/sepolia",
    isTestnet: true,
    nativeToken: "ETH",
  },
  {
    id: "optimism-testnet",
    name: "Optimism Sepolia Testnet",
    type: "evm",
    rpcUrl: "https://sepolia.optimism.io",
    chainId: 11155420,
    explorerUrl: "https://sepolia-optimism.etherscan.io",
    faucetUrl: "https://faucet.quicknode.com/optimism/sepolia",
    isTestnet: true,
    nativeToken: "ETH",
  },
  {
    id: "base-testnet",
    name: "Base Sepolia Testnet",
    type: "evm",
    rpcUrl: "https://sepolia.base.org",
    chainId: 84532,
    explorerUrl: "https://sepolia.basescan.org",
    faucetUrl: "https://www.coinbase.com/faucets/base-ethereum-goerli-faucet",
    isTestnet: true,
    nativeToken: "ETH",
    metadata: {
      blockExplorerApiUrl: "https://api-sepolia.basescan.org/api",
    },
  },
  {
    id: "solana-testnet",
    name: "Solana Devnet",
    type: "solana",
    rpcUrl: "https://api.devnet.solana.com",
    explorerUrl: "https://explorer.solana.com/?cluster=devnet",
    faucetUrl: "https://faucet.solana.com",
    isTestnet: true,
    nativeToken: "SOL",
  },
  {
    id: "near-testnet",
    name: "NEAR Testnet",
    type: "near",
    rpcUrl: "https://rpc.testnet.near.org",
    explorerUrl: "https://explorer.testnet.near.org",
    faucetUrl: "https://wallet.testnet.near.org",
    isTestnet: true,
    nativeToken: "NEAR",
  },
  {
    id: "aptos-testnet",
    name: "Aptos Testnet",
    type: "aptos",
    rpcUrl: "https://testnet.aptoslabs.com",
    explorerUrl: "https://explorer.aptoslabs.com/?network=testnet",
    faucetUrl: "https://faucet.testnet.aptoslabs.com",
    isTestnet: true,
    nativeToken: "APT",
  },
  {
    id: "rome-testnet",
    name: "ROME Network Testnet",
    type: "custom",
    rpcUrl: "https://testnet-rpc.rome.network",
    explorerUrl: "https://testnet-explorer.rome.network",
    faucetUrl: "https://faucet.rome.network",
    isTestnet: true,
    nativeToken: "ROME",
  },
  {
    id: "fair-testnet",
    name: "FAIR Blockchain Testnet",
    type: "evm",
    rpcUrl: "https://testnet-rpc.fair.cloud",
    chainId: 935,
    explorerUrl: "https://testnet-explorer.fair.cloud",
    faucetUrl: "https://faucet.fairchain.ai",
    isTestnet: true,
    nativeToken: "FAIR",
  },
  {
    id: "monad-testnet",
    name: "MONAD Testnet",
    type: "evm",
    rpcUrl: "https://testnet-rpc.monad.xyz",
    chainId: 10143,
    explorerUrl: "https://testnet-explorer.monad.xyz",
    faucetUrl: "https://faucet.monad.xyz",
    isTestnet: true,
    nativeToken: "MON",
  },
  {
    id: "eclipse-testnet",
    name: "Eclipse Testnet",
    type: "solana",
    rpcUrl: "https://api.testnet.eclipse.xyz",
    explorerUrl: "https://explorer.eclipse.xyz",
    faucetUrl: "https://faucet.eclipse.xyz",
    isTestnet: true,
    nativeToken: "SOL",
  },
];

/**
 * Available farming opportunities
 */
export const FARMING_OPPORTUNITIES: FarmingOpportunity[] = [
  {
    id: "layerzero-testnet",
    name: "LayerZero Testnet",
    description: "Bridge and interact with LayerZero testnet for potential airdrop",
    type: "airdrop",
    status: "active",
    network: "ethereum-testnet",
    contracts: {
      main: "0x0000000000000000000000000000000000000000",
    },
    discordUrl: "https://discord.gg/layerzero",
    telegramUrl: "https://t.me/layerzero",
    requirements: ["Bridge tokens", "Complete testnet transactions"],
    rewardInfo: {
      description: "Potential LayerZero token airdrop",
      estimatedValue: "TBD",
    },
    websiteUrl: "https://layerzero.network",
  },
  {
    id: "stargate-testnet",
    name: "Stargate Finance Testnet",
    description: "Liquidity farming on Stargate testnet",
    type: "liquidity",
    status: "active",
    network: "arbitrum-testnet",
    contracts: {
      main: "0x0000000000000000000000000000000000000000",
    },
    discordUrl: "https://discord.gg/stargate",
    telegramUrl: "https://t.me/stargatefinance",
    requirements: ["Provide liquidity", "Stake LP tokens"],
    rewardInfo: {
      description: "Testnet STG tokens",
      token: "STG",
    },
  },
  {
    id: "zksync-testnet",
    name: "zkSync Era Testnet",
    description: "Deploy contracts and interact with zkSync testnet",
    type: "general",
    status: "active",
    network: "ethereum-testnet",
    contracts: {
      main: "0x0000000000000000000000000000000000000000",
    },
    discordUrl: "https://discord.gg/zksync",
    telegramUrl: "https://t.me/zksync",
    requirements: ["Deploy contracts", "Make transactions"],
    rewardInfo: {
      description: "Potential zkSync airdrop",
    },
  },
  {
    id: "scroll-testnet",
    name: "Scroll Testnet",
    description: "Bridge and interact with Scroll L2 testnet",
    type: "airdrop",
    status: "active",
    network: "ethereum-testnet",
    contracts: {
      main: "0x0000000000000000000000000000000000000000",
    },
    discordUrl: "https://discord.gg/scroll",
    telegramUrl: "https://t.me/scroll",
    requirements: ["Bridge assets", "Deploy contracts"],
    rewardInfo: {
      description: "Potential Scroll token airdrop",
    },
  },
  {
    id: "linea-testnet",
    name: "Linea Testnet",
    description: "Interact with Linea zkEVM testnet",
    type: "general",
    status: "active",
    network: "ethereum-testnet",
    contracts: {
      main: "0x0000000000000000000000000000000000000000",
    },
    discordUrl: "https://discord.gg/linea",
    telegramUrl: "https://t.me/linea",
    requirements: ["Bridge tokens", "Use dApps"],
    rewardInfo: {
      description: "Potential Linea rewards",
    },
  },
  {
    id: "base-testnet-farming",
    name: "Base Testnet Activities",
    description: "Various farming activities on Base testnet",
    type: "general",
    status: "active",
    network: "base-testnet",
    contracts: {
      main: "0x0000000000000000000000000000000000000000",
    },
    discordUrl: "https://discord.gg/buildonbase",
    telegramUrl: "https://t.me/base",
    requirements: ["Complete testnet tasks"],
    rewardInfo: {
      description: "Base ecosystem rewards",
    },
  },
  {
    id: "aptos-testnet-farming",
    name: "Aptos Testnet Campaign",
    description: "Farming opportunities on Aptos testnet",
    type: "airdrop",
    status: "active",
    network: "aptos-testnet",
    contracts: {
      main: "0x0000000000000000000000000000000000000000",
    },
    discordUrl: "https://discord.gg/aptos",
    telegramUrl: "https://t.me/aptos",
    requirements: ["Deploy contracts", "Create tokens"],
    rewardInfo: {
      description: "APT testnet tokens",
      token: "APT",
    },
  },
  {
    id: "solana-testnet-farming",
    name: "Solana Devnet Activities",
    description: "Various farming activities on Solana devnet",
    type: "general",
    status: "active",
    network: "solana-testnet",
    contracts: {
      main: "11111111111111111111111111111111",
    },
    discordUrl: "https://discord.gg/solana",
    telegramUrl: "https://t.me/solana",
    requirements: ["Deploy programs", "Create tokens"],
    rewardInfo: {
      description: "SOL testnet tokens",
      token: "SOL",
    },
  },
];

/**
 * Available contract templates for deployment
 */
export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: "erc20-basic",
    name: "Basic ERC20 Token",
    description: "Standard ERC20 token contract with basic functionality",
    type: "erc20",
    supportedNetworks: [
      "ethereum-testnet",
      "bsc-testnet",
      "polygon-testnet",
      "arbitrum-testnet",
      "optimism-testnet",
      "base-testnet",
      "fair-testnet",
      "monad-testnet",
    ],
    deploymentParams: [
      {
        name: "name",
        type: "string",
        required: true,
        description: "Token name",
      },
      {
        name: "symbol",
        type: "string",
        required: true,
        description: "Token symbol",
      },
      {
        name: "decimals",
        type: "uint8",
        required: false,
        defaultValue: "18",
        description: "Number of decimals",
      },
      {
        name: "initialSupply",
        type: "uint256",
        required: false,
        defaultValue: "0",
        description: "Initial token supply",
      },
    ],
    estimatedGas: "~150000",
  },
  {
    id: "erc721-basic",
    name: "Basic ERC721 NFT",
    description: "Standard ERC721 NFT contract",
    type: "erc721",
    supportedNetworks: [
      "ethereum-testnet",
      "bsc-testnet",
      "polygon-testnet",
      "arbitrum-testnet",
      "optimism-testnet",
      "base-testnet",
    ],
    deploymentParams: [
      {
        name: "name",
        type: "string",
        required: true,
        description: "NFT collection name",
      },
      {
        name: "symbol",
        type: "string",
        required: true,
        description: "NFT collection symbol",
      },
      {
        name: "baseURI",
        type: "string",
        required: false,
        description: "Base URI for token metadata",
      },
    ],
    estimatedGas: "~200000",
  },
  {
    id: "simple-storage",
    name: "Simple Storage Contract",
    description: "Basic storage contract for testing",
    type: "simple",
    supportedNetworks: [
      "ethereum-testnet",
      "bsc-testnet",
      "polygon-testnet",
      "arbitrum-testnet",
      "optimism-testnet",
      "base-testnet",
    ],
    deploymentParams: [
      {
        name: "initialValue",
        type: "uint256",
        required: false,
        defaultValue: "0",
        description: "Initial stored value",
      },
    ],
    estimatedGas: "~50000",
  },
];

/**
 * Available automated farming flows
 */
export const FARMING_FLOWS: FarmingFlow[] = [
  {
    id: "layerzero-bridge-flow",
    name: "LayerZero Bridge Flow",
    description: "Automated flow for LayerZero testnet bridging",
    network: "ethereum-testnet",
    automationLevel: "semi-automated",
    estimatedTime: "5-10 minutes",
    requiredBalance: "0.01 ETH",
    opportunityId: "layerzero-testnet",
    steps: [
      {
        stepNumber: 1,
        name: "Approve Token",
        description: "Approve tokens for bridging",
        actionType: "approve",
        contractAddress: "0x...",
        functionName: "approve",
      },
      {
        stepNumber: 2,
        name: "Bridge Tokens",
        description: "Bridge tokens to target chain",
        actionType: "interact",
        contractAddress: "0x...",
        functionName: "bridge",
      },
      {
        stepNumber: 3,
        name: "Verify Bridge",
        description: "Verify bridge transaction",
        actionType: "custom",
      },
    ],
  },
  {
    id: "token-deployment-flow",
    name: "Token Deployment Flow",
    description: "Deploy ERC20 token on testnet",
    network: "ethereum-testnet",
    automationLevel: "manual",
    estimatedTime: "2-3 minutes",
    requiredBalance: "0.005 ETH",
    steps: [
      {
        stepNumber: 1,
        name: "Deploy Contract",
        description: "Deploy ERC20 token contract",
        actionType: "deploy",
      },
      {
        stepNumber: 2,
        name: "Verify Contract",
        description: "Verify contract on block explorer",
        actionType: "custom",
      },
    ],
  },
];

/**
 * Get farming opportunity by ID
 */
export function getFarmingOpportunity(id: string): FarmingOpportunity | undefined {
  return FARMING_OPPORTUNITIES.find((opp) => opp.id === id);
}

/**
 * Get farming opportunities by network
 */
export function getFarmingOpportunitiesByNetwork(
  networkId: string
): FarmingOpportunity[] {
  return FARMING_OPPORTUNITIES.filter((opp) => opp.network === networkId);
}

/**
 * Get network by ID
 */
export function getFarmingNetwork(id: string): FarmingNetwork | undefined {
  return FARMING_NETWORKS.find((net) => net.id === id);
}

/**
 * Get contract template by ID
 */
export function getContractTemplate(id: string): ContractTemplate | undefined {
  return CONTRACT_TEMPLATES.find((template) => template.id === id);
}

/**
 * Get farming flow by ID
 */
export function getFarmingFlow(id: string): FarmingFlow | undefined {
  return FARMING_FLOWS.find((flow) => flow.id === id);
}

