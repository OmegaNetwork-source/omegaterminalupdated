import type { Command } from "@/types/commands";
import { commandRegistry } from "./CommandRegistry";
import { basicCommands } from "./basic";
import { walletCommands } from "./wallet";
import { miningCommands } from "./mining";
import { entertainmentCommands } from "./entertainment";
import { networkCommands } from "./network";
import { solanaCommands } from "./solana";
import { nearCommands } from "./near";
import { polygonCommands } from "./polygon";
import { ethereumCommands } from "./ethereum";
import { arbitrumCommands } from "./arbitrum";
import { optimismCommands } from "./optimism";
import { baseCommands } from "./base";
import { bnbCommands } from "./bnb";
import { uniswapCommands } from "./uniswap";
import { pancakeswapCommands } from "./pancakeswap";
import { eclipseCommands } from "./eclipse";
import { newsCommand } from "./news";
import { spotifyCommands } from "./spotify";
import { youtubeCommand } from "./youtube";
import { bluesCommands } from "./blues";
import { lofiCommands } from "./lofi";
import { techCommands } from "./tech";
import { funkyCommands } from "./funky";
import { tranceCommands } from "./trance";
import { melodiesCommands } from "./melodies";
import { screensaverCommands } from "./screensaver";
import { magicedenCommands } from "./magiceden";
import { profileCommand } from "./profile";
import { mixerCommands } from "./mixer";
import { chartCommand } from "./chart";
import { pgtCommands } from "./pgt";
import { apiCommands as dexscreenerCommands } from "./dexscreener";
import { alphaCommands } from "./alphavantage";
import { defillamaCommands } from "./defillama";
import { referralCommands } from "./referral";
import { perpsCommands } from "./perps";
import { emailCommands } from "./email";
import { ethCommands } from "./eth";
import { gamesCommand } from "./games";
import { kalshiCommand } from "./kalshi";
import { polymarketCommands } from "./polymarket";
import { tradeCommands } from "./trade";
import { colorCommands } from "./color";
import { hyperliquidCommands } from "./hyperliquid";
import { ensCommands } from "./ens";
import { chatCommands } from "./chaingpt-chat";
import { contractCommands } from "./chaingpt-contract";
import { nftgenCommands } from "./chaingpt-nft";
import { auditorCommands } from "./chaingpt-auditor";
import { omegaMintCommands } from "./nft-mint";
import { openseaCommands } from "./opensea";
import { tokenCommands } from "./token-factory";
import { romeCommands } from "./rome";
import { monadCommands } from "./monad";
import { fairCommands } from "./fair";
import { airdropCommands } from "./airdrop";
import { chatterCommands } from "./chatter";
import { terminalBuilderCommands } from "./terminal-builder";
import { marketsCommands } from "./markets";
import { alphaForecastCommands } from "./alpha";
import { portfolioCommands } from "./portfolio";
import { socialCommands } from "./social";
import { contextCommands } from "./context";
import { formatCommands } from "./format";
import { exportCommands } from "./export";
import { whoamiCommands } from "./whoami";
import { gameArenaCommands } from "./game-arena";
import { factionCommands } from "./faction";
import { aptosCommands } from "./aptos";
import { farmingCommands } from "./farm";
import { botCommands } from "./bot";
import { web3telegramCommands } from "./web3telegram";
import { rubicCommands } from "./rubic";

export interface CommandRegistrationResult {
  registeredGroups: string[];
  failedGroups: string[];
  failedCommands: Array<{
    group: string;
    command: string;
    reason?: string;
  }>;
}

const COMMAND_GROUPS: Array<{ label: string; commands: Command[] }> = [
  { label: "basic", commands: basicCommands },
  { label: "wallet", commands: walletCommands },
  { label: "token-factory", commands: tokenCommands },
  { label: "mining", commands: miningCommands },
  { label: "entertainment", commands: entertainmentCommands },
  { label: "network", commands: networkCommands },
  { label: "solana", commands: solanaCommands },
  { label: "near", commands: nearCommands },
  { label: "polygon", commands: polygonCommands },
  { label: "ethereum", commands: ethereumCommands },
  { label: "arbitrum", commands: arbitrumCommands },
  { label: "optimism", commands: optimismCommands },
  { label: "base", commands: baseCommands },
  { label: "bnb", commands: bnbCommands },
  { label: "uniswap", commands: uniswapCommands },
  { label: "pancakeswap", commands: pancakeswapCommands },
  { label: "eclipse", commands: eclipseCommands },
  { label: "news", commands: [newsCommand] },
  { label: "spotify", commands: spotifyCommands },
  { label: "youtube", commands: [youtubeCommand] },
  { label: "blues", commands: bluesCommands },
  { label: "lofi", commands: lofiCommands },
  { label: "tech", commands: techCommands },
  { label: "funky", commands: funkyCommands },
  { label: "trance", commands: tranceCommands },
  { label: "melodies", commands: melodiesCommands },
  { label: "screensaver", commands: screensaverCommands },
  { label: "magiceden", commands: magicedenCommands },
  { label: "profile", commands: [profileCommand] },
  { label: "mixer", commands: mixerCommands },
  { label: "chart", commands: [chartCommand] },
  { label: "pgt", commands: pgtCommands },
  { label: "dexscreener", commands: dexscreenerCommands },
  { label: "alphavantage", commands: alphaCommands },
  { label: "defillama", commands: defillamaCommands },
  { label: "referral", commands: referralCommands },
  { label: "perps", commands: perpsCommands },
  { label: "email", commands: emailCommands },
  { label: "web3telegram", commands: web3telegramCommands },
  { label: "eth", commands: ethCommands },
  { label: "games", commands: [gamesCommand] },
  { label: "kalshi", commands: [kalshiCommand] },
  { label: "polymarket", commands: polymarketCommands },
  { label: "trade", commands: tradeCommands },
  { label: "color", commands: colorCommands },
  { label: "hyperliquid", commands: hyperliquidCommands },
  { label: "ens", commands: ensCommands },
  { label: "chaingpt-chat", commands: chatCommands },
  { label: "chaingpt-contract", commands: contractCommands },
  { label: "chaingpt-nft", commands: nftgenCommands },
  { label: "chaingpt-auditor", commands: auditorCommands },
  { label: "nft-mint", commands: omegaMintCommands },
  { label: "opensea", commands: openseaCommands },
  { label: "rome", commands: romeCommands },
  { label: "monad", commands: monadCommands },
  { label: "fair", commands: fairCommands },
  { label: "airdrop", commands: airdropCommands },
  { label: "chatter", commands: chatterCommands },
  { label: "terminal-builder", commands: terminalBuilderCommands },
  { label: "markets", commands: marketsCommands },
  { label: "alpha-forecast", commands: alphaForecastCommands },
  { label: "portfolio", commands: portfolioCommands },
  { label: "social", commands: socialCommands },
  { label: "context", commands: contextCommands },
  { label: "format", commands: formatCommands },
  { label: "export", commands: exportCommands },
  { label: "whoami", commands: whoamiCommands },
  { label: "game-arena", commands: gameArenaCommands },
  { label: "faction", commands: factionCommands },
  { label: "aptos", commands: aptosCommands },
  { label: "farming", commands: farmingCommands },
  { label: "bots", commands: botCommands },
  { label: "rubic", commands: rubicCommands },
];

let registrationAttempted = false;
let cachedResult: CommandRegistrationResult | null = null;

function registerCommandGroup(
  label: string,
  commands: Command[]
): {
  succeeded: string[];
  failed: Array<{ command: string; error: unknown }>;
} {
  const succeeded: string[] = [];
  const failed: Array<{ command: string; error: unknown }> = [];

  for (const command of commands) {
    try {
      commandRegistry.register(command);
      succeeded.push(command.name);
    } catch (error) {
      // Check if error is due to duplicate registration (already exists)
      const errorMessage =
        error instanceof Error ? error.message : String(error ?? "");
      if (errorMessage.includes("already in use")) {
        // Command already registered (likely from HMR or double registration) - skip silently
        succeeded.push(command.name);
        continue;
      }
      // Otherwise it's a real error
      console.error(
        `[Command System] Failed to register command '${command.name}' from ${label}:`,
        error
      );
      failed.push({ command: command.name, error });
    }
  }

  return { succeeded, failed };
}

export async function registerAllCommands(): Promise<CommandRegistrationResult> {
  if (registrationAttempted && cachedResult) {
    return cachedResult;
  }

  registrationAttempted = true;
  const result: CommandRegistrationResult = {
    registeredGroups: [],
    failedGroups: [],
    failedCommands: [],
  };

  for (const group of COMMAND_GROUPS) {
    const { succeeded, failed } = registerCommandGroup(
      group.label,
      group.commands
    );

    if (succeeded.length > 0) {
      result.registeredGroups.push(group.label);
    }

    if (failed.length > 0) {
      failed.forEach(({ command, error }) => {
        result.failedCommands.push({
          group: group.label,
          command,
          reason:
            error instanceof Error ? error.message : String(error ?? "error"),
        });
      });
    }

    if (succeeded.length === 0) {
      result.failedGroups.push(group.label);
    }
  }

  if (result.failedCommands.length === 0) {
    console.log("[Command System] ✅ Minimal command set registered");
  } else if (result.registeredGroups.length > 0) {
    console.warn(
      "[Command System] ⚠️ Some commands failed to register:",
      result.failedCommands
    );
  } else {
    console.error(
      "[Command System] ❌ Failed to register commands:",
      result.failedCommands
    );
  }

  cachedResult = result;
  return result;
}

export { commandRegistry };
export {
  basicCommands,
  walletCommands,
  miningCommands,
  entertainmentCommands,
  networkCommands,
  solanaCommands,
  nearCommands,
  polygonCommands,
  ethereumCommands,
  arbitrumCommands,
  optimismCommands,
  baseCommands,
  bnbCommands,
  uniswapCommands,
  pancakeswapCommands,
  eclipseCommands,
  newsCommand,
  spotifyCommands,
  youtubeCommand,
  magicedenCommands,
  profileCommand,
  mixerCommands,
  chartCommand,
  pgtCommands,
  dexscreenerCommands,
  alphaCommands,
  defillamaCommands,
  referralCommands,
  perpsCommands,
  emailCommands,
  ethCommands,
  gamesCommand,
  kalshiCommand,
  polymarketCommands,
  colorCommands,
  hyperliquidCommands,
  ensCommands,
  chatCommands,
  contractCommands,
  nftgenCommands,
  auditorCommands,
  omegaMintCommands,
  openseaCommands,
  romeCommands,
  monadCommands,
  fairCommands,
  airdropCommands,
  chatterCommands,
  terminalBuilderCommands,
  marketsCommands,
  alphaForecastCommands,
  portfolioCommands,
  socialCommands,
  contextCommands,
  formatCommands,
  exportCommands,
  whoamiCommands,
  gameArenaCommands,
  factionCommands,
  aptosCommands,
  farmingCommands,
  botCommands,
};
export default commandRegistry;
