"use server";

import { Contract, formatEther } from "ethers";
import config from "@/lib/config";
import { ClaimRewardsSchema, MineBlockSchema } from "@/lib/validation";
import {
  getFreshNonce,
  getGasPrice,
  getRelayerSigner,
  withNetworkRetry,
  withNonceLock,
} from "@/lib/blockchain";
import { enforceLimit } from "@/lib/middleware";
import type { ActionResult } from "./wallet";

const { CONTRACT_ADDRESS, CONTRACT_ABI } = config as unknown as {
  CONTRACT_ADDRESS: string;
  CONTRACT_ABI: unknown;
};

function createMiningContract() {
  const signer = getRelayerSigner();
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

function createErrorResult(error: unknown): ActionResult<never> {
  if (error instanceof Error) {
    return { success: false, error: error.message };
  }

  return { success: false, error: "Unknown error" };
}

/**
 * Executes the Omega Network mining transaction through the relayer and
 * returns the transaction hash alongside the reward amount (if available).
 */
export async function executeMine(
  address: string
): Promise<
  ActionResult<{ txHash: string; reward: string; blockNumber?: number }>
> {
  const validation = MineBlockSchema.safeParse({ address });

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((issue) => issue.message).join(", "),
    };
  }

  try {
    const minerAddress = validation.data.address;
    await enforceLimit("BLOCKCHAIN", minerAddress);

    const relayerUrl = (config.RELAYER_URL || "").replace(/\/$/, "");

    if (!relayerUrl) {
      return {
        success: false,
        error: "Relayer endpoint is not configured",
      };
    }

    const response = await fetch(`${relayerUrl}/mine`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address: minerAddress }),
    });

    const rawBody = await response.text();
    let payload: any = null;

    try {
      payload = rawBody ? JSON.parse(rawBody) : null;
    } catch (parseError) {
      console.warn("Failed to parse relayer mining response:", parseError);
    }

    if (!response.ok || !payload?.success) {
      const fallbackMessage =
        "Relayer mining request failed. Please retry later via the relayer service.";
      const message =
        payload?.error || payload?.message || rawBody || fallbackMessage;
      return { success: false, error: message };
    }

    const txHash: string | undefined =
      payload.txHash ?? payload.transactionHash;

    if (!txHash) {
      return {
        success: false,
        error:
          "Relayer did not return a transaction hash. Please retry later via the relayer service.",
      };
    }

    const rewardValue = payload.reward ?? payload.data?.reward ?? 0;
    const reward =
      typeof rewardValue === "string" ? rewardValue : String(rewardValue ?? 0);
    const rawBlockNumber =
      payload.blockNumber ?? payload.data?.blockNumber ?? undefined;
    const blockNumber =
      typeof rawBlockNumber === "number" ? rawBlockNumber : undefined;

    return {
      success: true,
      data: {
        txHash,
        reward,
        blockNumber,
      },
    };
  } catch (error) {
    console.error("executeMine failed:", error);
    return createErrorResult(error);
  }
}

/**
 * Claims pending mining rewards for the specified address by calling the
 * Omega Network mining contract through the relayer signer.
 */
export async function claimRewards(
  address: string
): Promise<ActionResult<{ txHash: string; amount: string }>> {
  const validation = ClaimRewardsSchema.safeParse({ address });

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((issue) => issue.message).join(", "),
    };
  }

  try {
    const contract = createMiningContract();
    const signer = getRelayerSigner();
    const relayerAddress = await signer.getAddress();

    const minerInfo = (await contract.getMinerInfo(
      validation.data.address
    )) as unknown as {
      pendingRewards?: bigint;
      reward?: bigint;
    };

    const pending = minerInfo?.pendingRewards ?? minerInfo?.reward ?? 0n;

    if (pending === 0n) {
      return { success: false, error: "No pending rewards available to claim" };
    }

    await enforceLimit("BLOCKCHAIN", validation.data.address);

    const gasPricePromise = getGasPrice();

    const tx = await withNonceLock(relayerAddress, async () => {
      const nonce = await getFreshNonce(relayerAddress);
      const gasPrice = await gasPricePromise;

      return withNetworkRetry(
        () =>
          contract.claimTo(validation.data.address, {
            gasPrice,
            nonce,
          }),
        "claimRewards:claimTo"
      );
    });

    const receipt = await tx.wait();

    return {
      success: true,
      data: {
        txHash: tx.hash,
        amount: formatEther(pending),
      },
    };
  } catch (error) {
    console.error("claimRewards failed:", error);
    return createErrorResult(error);
  }
}
