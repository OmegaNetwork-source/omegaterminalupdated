import type { Command } from "@/types/commands";
import { commandRegistry } from "./CommandRegistry";
import { basicCommands } from "./basic";
import { walletCommands } from "./wallet";
import { miningCommands } from "./mining";
import { entertainmentCommands } from "./entertainment";
import { networkCommands } from "./network";
import { solanaCommands } from "./solana";
import { nearCommands } from "./near";
import { eclipseCommands } from "./eclipse";
import { newsCommand } from "./news";
import { spotifyCommand } from "./spotify";
import { youtubeCommand } from "./youtube";
import { magicedenCommand } from "./magiceden";
import { profileCommand } from "./profile";
import { mixerCommand } from "./mixer";
import { chartCommand } from "./chart";
import { pgtCommand } from "./pgt";
import { dexscreenerCommands } from "./dexscreener";
import { alphavantageCommand } from "./alphavantage";
import { defillamaCommand } from "./defillama";
import { referralCommand } from "./referral";
import { perpsCommand } from "./perps";
import { gamesCommand } from "./games";
import { kalshiCommand } from "./kalshi";
import { chaingptChatCommand } from "./chaingpt-chat";
import { chaingptContractCommand } from "./chaingpt-contract";
import { chaingptNftCommand } from "./chaingpt-nft";
import { chaingptAuditorCommand } from "./chaingpt-auditor";
import { nftMintCommand } from "./nft-mint";
import { openseaCommand } from "./opensea";

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
  { label: "mining", commands: miningCommands },
  { label: "entertainment", commands: entertainmentCommands },
  { label: "network", commands: networkCommands },
  { label: "solana", commands: solanaCommands },
  { label: "near", commands: nearCommands },
  { label: "eclipse", commands: eclipseCommands },
  { label: "news", commands: [newsCommand] },
  { label: "spotify", commands: [spotifyCommand] },
  { label: "youtube", commands: [youtubeCommand] },
  { label: "magiceden", commands: [magicedenCommand] },
  { label: "profile", commands: [profileCommand] },
  { label: "mixer", commands: [mixerCommand] },
  { label: "chart", commands: [chartCommand] },
  { label: "pgt", commands: [pgtCommand] },
  { label: "dexscreener", commands: dexscreenerCommands },
  { label: "alphavantage", commands: [alphavantageCommand] },
  { label: "defillama", commands: [defillamaCommand] },
  { label: "referral", commands: [referralCommand] },
  { label: "perps", commands: [perpsCommand] },
  { label: "games", commands: [gamesCommand] },
  { label: "kalshi", commands: [kalshiCommand] },
  { label: "chaingpt-chat", commands: [chaingptChatCommand] },
  { label: "chaingpt-contract", commands: [chaingptContractCommand] },
  { label: "chaingpt-nft", commands: [chaingptNftCommand] },
  { label: "chaingpt-auditor", commands: [chaingptAuditorCommand] },
  { label: "nft-mint", commands: [nftMintCommand] },
  { label: "opensea", commands: [openseaCommand] },
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
  eclipseCommands,
  newsCommand,
  spotifyCommand,
  youtubeCommand,
  magicedenCommand,
  profileCommand,
  mixerCommand,
  chartCommand,
  pgtCommand,
  dexscreenerCommands,
  alphavantageCommand,
  defillamaCommand,
  referralCommand,
  perpsCommand,
  gamesCommand,
  kalshiCommand,
  chaingptChatCommand,
  chaingptContractCommand,
  chaingptNftCommand,
  chaingptAuditorCommand,
  nftMintCommand,
  openseaCommand,
};
export default commandRegistry;
