/**
 * Parlay Trading Commands
 * 
 * Terminal commands for the prediction market parlay system.
 * Includes account connection, parlay building, and trade execution.
 */

import type { CommandDefinition, CommandContext } from '@/types/commands';

// =============================================================================
// Parlay Builder Command
// =============================================================================

export const parlayCommand: CommandDefinition = {
  name: 'parlay',
  aliases: ['parlays', 'parlay-builder', 'pb'],
  description: 'Open the Omega Parlay Builder for prediction market trading',
  category: 'trading',
  usage: 'parlay [subcommand]',
  examples: [
    'parlay',
    'parlay connect',
    'parlay list',
    'parlay create',
  ],
  execute: async (args: string[], context: CommandContext) => {
    const subcommand = args[0]?.toLowerCase();
    
    switch (subcommand) {
      case 'connect':
        // Open account connection modal
        window.dispatchEvent(new CustomEvent('omega:open-trading-accounts'));
        return {
          success: true,
          output: `
┌─────────────────────────────────────────────────────────────────┐
│  🔗 TRADING ACCOUNTS                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Opening account connection modal...                            │
│                                                                 │
│  Connect your prediction market accounts:                       │
│  • Kalshi - API key authentication                              │
│  • Polymarket - Wallet signature authentication                 │
│                                                                 │
│  Your credentials are stored locally and never sent             │
│  to our servers.                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
          `,
        };
        
      case 'list':
        return {
          success: true,
          output: `
┌─────────────────────────────────────────────────────────────────┐
│  📋 YOUR PARLAYS                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Active Parlays: Check the Parlay Builder for your lineups      │
│                                                                 │
│  Commands:                                                      │
│  • parlay         - Open builder                                │
│  • parlay connect - Connect trading accounts                    │
│  • parlay create  - Create new parlay                           │
│  • parlay pools   - View community pools                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
          `,
        };
        
      case 'pools':
        // Open builder to community pools tab
        window.dispatchEvent(new CustomEvent('omega:open-parlay-builder', {
          detail: { tab: 'community' },
        }));
        return {
          success: true,
          output: `
┌─────────────────────────────────────────────────────────────────┐
│  🏊 COMMUNITY POOLS                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Opening Community Pools in Parlay Builder...                   │
│                                                                 │
│  Features:                                                      │
│  • Join ambassador-curated parlays                              │
│  • Pool your funds with other traders                           │
│  • Tiered payout multipliers                                    │
│  • AI-powered pool insights                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
          `,
        };
        
      case 'create':
      default:
        // Open the parlay builder
        window.dispatchEvent(new CustomEvent('omega:open-parlay-builder'));
        return {
          success: true,
          output: `
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   ██████╗ ███╗   ███╗███████╗ ██████╗  █████╗                     ║
║  ██╔═══██╗████╗ ████║██╔════╝██╔════╝ ██╔══██╗                    ║
║  ██║   ██║██╔████╔██║█████╗  ██║  ███╗███████║                    ║
║  ██║   ██║██║╚██╔╝██║██╔══╝  ██║   ██║██╔══██║                    ║
║  ╚██████╔╝██║ ╚═╝ ██║███████╗╚██████╔╝██║  ██║                    ║
║   ╚═════╝ ╚═╝     ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝                    ║
║                                                                   ║
║   ██████╗  █████╗ ██████╗ ██╗      █████╗ ██╗   ██╗               ║
║   ██╔══██╗██╔══██╗██╔══██╗██║     ██╔══██╗╚██╗ ██╔╝               ║
║   ██████╔╝███████║██████╔╝██║     ███████║ ╚████╔╝                ║
║   ██╔═══╝ ██╔══██║██╔══██╗██║     ██╔══██║  ╚██╔╝                 ║
║   ██║     ██║  ██║██║  ██║███████╗██║  ██║   ██║                  ║
║   ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝                  ║
║                                                                   ║
║   BUILDER v2.0 - Cross-Platform Prediction Market Trading         ║
║                                                                   ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ✨ FEATURES:                                                     ║
║  • Trade on Kalshi & Polymarket simultaneously                   ║
║  • Build parlays with 2-10 market legs                           ║
║  • Leverage up to 5x on your positions                           ║
║  • Real-time odds calculations                                   ║
║  • AI-powered risk assessment                                    ║
║  • Community pools with tiered payouts                           ║
║                                                                   ║
║  💡 QUICK TIPS:                                                   ║
║  • Connect your accounts first: parlay connect                   ║
║  • Browse markets by category or search                          ║
║  • Click YES/NO buttons to add legs                              ║
║  • Higher leverage = higher risk & reward                        ║
║                                                                   ║
║  📊 MARKETS:                                                      ║
║  Politics • Crypto • Economics • Sports • Tech • Culture          ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
          `,
        };
    }
  },
};

// =============================================================================
// Connect Accounts Command
// =============================================================================

export const connectTradingCommand: CommandDefinition = {
  name: 'connect-trading',
  aliases: ['trading-connect', 'tc'],
  description: 'Connect your Kalshi or Polymarket trading accounts',
  category: 'trading',
  usage: 'connect-trading',
  examples: ['connect-trading'],
  execute: async () => {
    window.dispatchEvent(new CustomEvent('omega:open-trading-accounts'));
    return {
      success: true,
      output: `
┌─────────────────────────────────────────────────────────────────┐
│  🔐 CONNECT TRADING ACCOUNTS                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Opening account connection...                                  │
│                                                                 │
│  SUPPORTED PLATFORMS:                                           │
│                                                                 │
│  🟢 KALSHI                                                      │
│     • API Key Authentication                                    │
│     • Get keys: kalshi.com/settings/api                         │
│     • Real-time balance & positions                             │
│                                                                 │
│  🟣 POLYMARKET                                                  │
│     • Wallet Signature Authentication                           │
│     • Uses your existing CLOB wallet                            │
│     • Full orderbook access                                     │
│                                                                 │
│  🔒 SECURITY NOTE:                                              │
│  Your credentials are encrypted and stored locally.             │
│  Never shared with external servers.                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
      `,
    };
  },
};

// =============================================================================
// Kalshi Markets Command
// =============================================================================

export const kalshiCommand: CommandDefinition = {
  name: 'kalshi',
  aliases: ['ks'],
  description: 'Browse Kalshi prediction markets',
  category: 'trading',
  usage: 'kalshi [search term]',
  examples: [
    'kalshi',
    'kalshi bitcoin',
    'kalshi fed rate',
  ],
  execute: async (args: string[]) => {
    const searchTerm = args.join(' ');
    
    // Open parlay builder with Kalshi filter
    window.dispatchEvent(new CustomEvent('omega:open-parlay-builder', {
      detail: { venue: 'kalshi', search: searchTerm },
    }));
    
    return {
      success: true,
      output: `
┌─────────────────────────────────────────────────────────────────┐
│  📈 KALSHI MARKETS                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Opening Kalshi markets${searchTerm ? ` for "${searchTerm}"` : ''}...
│                                                                 │
│  POPULAR CATEGORIES:                                            │
│  • Economics - Fed rates, GDP, inflation                        │
│  • Politics - Elections, policy decisions                       │
│  • Climate - Weather events, temperatures                       │
│  • Tech - Company earnings, product launches                    │
│                                                                 │
│  Trade directly in the Parlay Builder!                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
      `,
    };
  },
};

// =============================================================================
// Polymarket Markets Command
// =============================================================================

export const polymarketCommand: CommandDefinition = {
  name: 'polymarket',
  aliases: ['pm', 'poly'],
  description: 'Browse Polymarket prediction markets',
  category: 'trading',
  usage: 'polymarket [search term]',
  examples: [
    'polymarket',
    'polymarket election',
    'polymarket crypto',
  ],
  execute: async (args: string[]) => {
    const searchTerm = args.join(' ');
    
    // Open parlay builder with Polymarket filter
    window.dispatchEvent(new CustomEvent('omega:open-parlay-builder', {
      detail: { venue: 'polymarket', search: searchTerm },
    }));
    
    return {
      success: true,
      output: `
┌─────────────────────────────────────────────────────────────────┐
│  🟣 POLYMARKET                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Opening Polymarket${searchTerm ? ` for "${searchTerm}"` : ''}...
│                                                                 │
│  POPULAR CATEGORIES:                                            │
│  • Politics - US & global elections                             │
│  • Crypto - Bitcoin, Ethereum, DeFi                             │
│  • Sports - Major league predictions                            │
│  • Culture - Entertainment & media                              │
│                                                                 │
│  Build parlays across multiple markets!                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
      `,
    };
  },
};

// =============================================================================
// Export All Commands
// =============================================================================

export const parlayTradingCommands = [
  parlayCommand,
  connectTradingCommand,
  kalshiCommand,
  polymarketCommand,
];

