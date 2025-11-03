import type { TerminalLine } from "@/types";
import type { CommandContext } from "@/types/commands";

export const NETWORK_SELECTOR_EVENT = "omega:open-network-selector";

export type NetworkSelectorWalletBridge = Pick<
  CommandContext["wallet"],
  "initializeExternalConnection" | "addOmegaNetwork" | "getBalance" | "state"
>;

export type NetworkSelectorSoundBridge =
  CommandContext["sound"] extends undefined
    ? undefined
    : Pick<NonNullable<CommandContext["sound"]>, "playWalletConnectSound">;

export interface NetworkSelectorRequest {
  log: (message: string, type: TerminalLine["type"]) => void;
  logHtml?: (html: string) => void;
  wallet: NetworkSelectorWalletBridge;
  sound?: NetworkSelectorSoundBridge;
  source?: "command" | "ui";
}

export function openNetworkSelector(request: NetworkSelectorRequest): void {
  if (typeof window === "undefined") {
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    try {
      // eslint-disable-next-line no-console
      console.warn("[NetworkSelector][debug] openNetworkSelector invoked", {
        source: request.source,
        hasLogHtml: Boolean(request.logHtml),
        callerStack: new Error().stack,
      });
    } catch {
      // ignore logging errors
    }
  }

  window.dispatchEvent(
    new CustomEvent<NetworkSelectorRequest>(NETWORK_SELECTOR_EVENT, {
      detail: request,
    })
  );
}
