"use server";

import { Contract, formatEther } from "ethers";
import config from "@/lib/config";
import { FaucetClaimSchema } from "@/lib/validation";
import {
  getFreshNonce,
  getGasPrice,
  getProvider,
  getRelayerSigner,
  withNetworkRetry,
  withNonceLock,
} from "@/lib/blockchain";
import { enforceLimit } from "@/lib/middleware";
import type { ActionResult } from "./wallet";

const { FAUCET_ADDRESS, FAUCET_ABI } = config as unknown as {
  FAUCET_ADDRESS: string;
  FAUCET_ABI: unknown;
};

function createFaucetContract(withSigner: boolean) {
  if (withSigner) {
    return new Contract(FAUCET_ADDRESS, FAUCET_ABI, getRelayerSigner());
  }

  return new Contract(FAUCET_ADDRESS, FAUCET_ABI, getProvider());
}

function createErrorResult(error: unknown): ActionResult<never> {
  if (error instanceof Error) {
    return { success: false, error: error.message };
  }

  return { success: false, error: "Unknown error" };
}

/**
 * Executes a faucet claim for the given wallet address, enforcing the relayer
 * cooldown logic to ensure each user can only claim once per 24-hour window.
 */
export async function claimFaucet(
  address: string
): Promise<
  ActionResult<{ txHash: string; amount: string; cooldownHours: number }>
> {
  const validation = FaucetClaimSchema.safeParse({ address });

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((issue) => issue.message).join(", "),
    };
  }

  try {
    const faucet = createFaucetContract(true);
    const signer = getRelayerSigner();
    const relayerAddress = await signer.getAddress();
    const status = (await faucet.getFaucetStatus(
      validation.data.address
    )) as unknown as {
      canClaimNow: boolean;
      lastClaim?: bigint;
      timeUntilNextClaim?: bigint;
      claimAmount?: bigint;
    };

    if (!status.canClaimNow) {
      const cooldownSeconds = Number(status.timeUntilNextClaim ?? 0n);
      const cooldownHours = Math.ceil(cooldownSeconds / 3600);
      return {
        success: false,
        error: `Faucet cooldown active. Try again in ~${cooldownHours} hour(s).`,
      };
    }

    await enforceLimit("FAUCET", validation.data.address);

    const gasPricePromise = getGasPrice();

    const tx = await withNonceLock(relayerAddress, async () => {
      const nonce = await getFreshNonce(relayerAddress);
      const gasPrice = await gasPricePromise;

      return withNetworkRetry(
        () =>
          faucet.claim({
            gasPrice,
            nonce,
          }),
        "claimFaucet:claim"
      );
    });

    const receipt = await tx.wait();
    const amount = status.claimAmount ? formatEther(status.claimAmount) : "0";

    return {
      success: true,
      data: {
        txHash: tx.hash,
        amount,
        cooldownHours: 24,
      },
    };
  } catch (error) {
    console.error("claimFaucet failed:", error);
    return createErrorResult(error);
  }
}

/**
 * Retrieves the current faucet state for the provided wallet address,
 * returning cooldown timings and the configured claim amount.
 */
export async function getFaucetStatus(address: string): Promise<
  ActionResult<{
    canClaimNow: boolean;
    lastClaim: number;
    timeUntilNextClaim: number;
    claimAmount: string;
    faucetBalance: string;
  }>
> {
  const validation = FaucetClaimSchema.safeParse({ address });

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((issue) => issue.message).join(", "),
    };
  }

  try {
    const faucet = createFaucetContract(false);
    const status = (await faucet.getFaucetStatus(
      validation.data.address
    )) as unknown as {
      canClaimNow: boolean;
      lastClaim: bigint;
      timeUntilNextClaim: bigint;
      claimAmount: bigint;
    };
    const balance = await faucet.provider.getBalance(FAUCET_ADDRESS);

    return {
      success: true,
      data: {
        canClaimNow: status.canClaimNow,
        lastClaim: Number(status.lastClaim),
        timeUntilNextClaim: Number(status.timeUntilNextClaim),
        claimAmount: formatEther(status.claimAmount),
        faucetBalance: formatEther(balance),
      },
    };
  } catch (error) {
    console.error("getFaucetStatus failed:", error);
    return createErrorResult(error);
  }
}
