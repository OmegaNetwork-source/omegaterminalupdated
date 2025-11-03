"use server";

import { parseEther } from "ethers";
import { FundWalletSchema } from "@/lib/validation";
import {
  getGasPrice,
  getFreshNonce,
  getRelayerSigner,
  withNetworkRetry,
  withNonceLock,
} from "@/lib/blockchain";
import { enforceLimit } from "@/lib/middleware";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function createErrorResult(error: unknown): ActionResult<never> {
  if (error instanceof Error) {
    return { success: false, error: error.message };
  }

  return { success: false, error: "Unknown error" };
}

/**
 * Funds a user wallet from the relayer. Intended for onboarding flows where a
 * small amount of OMEGA is required to cover initial transactions.
 */
export async function fundWallet(
  address: string,
  amount?: string
): Promise<ActionResult<{ txHash: string; responseTime: number }>> {
  const validation = FundWalletSchema.safeParse({ address, amount });

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((issue) => issue.message).join(", "),
    };
  }

  try {
    const { address: destination, amount: amountInput } = validation.data;
    await enforceLimit("BLOCKCHAIN", destination);
    const signer = getRelayerSigner();
    const relayerAddress = await signer.getAddress();
    const value = parseEther(amountInput ?? "0.1");
    const gasPricePromise = getGasPrice();

    const { tx, responseTime } = await withNonceLock(
      relayerAddress,
      async () => {
        const nonce = await getFreshNonce(relayerAddress);
        const gasPrice = await gasPricePromise;
        const startTime = Date.now();

        const txResponse = await withNetworkRetry(
          () =>
            signer.sendTransaction({
              to: destination,
              value,
              gasLimit: 21_000n,
              gasPrice,
              nonce,
            }),
          "fundWallet:sendTransaction"
        );

        return {
          tx: txResponse,
          responseTime: Date.now() - startTime,
        };
      }
    );

    return {
      success: true,
      data: {
        txHash: tx.hash,
        responseTime,
      },
    };
  } catch (error) {
    console.error("fundWallet failed:", error);
    return createErrorResult(error);
  }
}

/**
 * High-value wallet funding action used for stress testing and QA scenarios.
 */
export async function fundStressWallet(
  address: string,
  amount = "1.0"
): Promise<ActionResult<{ txHash: string }>> {
  const validation = FundWalletSchema.safeParse({ address, amount });

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((issue) => issue.message).join(", "),
    };
  }

  try {
    const signer = getRelayerSigner();
    const relayerAddress = await signer.getAddress();
    const destination = validation.data.address;

    await enforceLimit("BLOCKCHAIN", destination);

    const value = parseEther(validation.data.amount ?? "1.0");
    const gasPricePromise = getGasPrice();

    const tx = await withNonceLock(relayerAddress, async () => {
      const nonce = await getFreshNonce(relayerAddress);
      const gasPrice = await gasPricePromise;

      return withNetworkRetry(
        () =>
          signer.sendTransaction({
            to: destination,
            value,
            gasLimit: 21_000n,
            gasPrice,
            nonce,
          }),
        "fundStressWallet:sendTransaction"
      );
    });

    return {
      success: true,
      data: {
        txHash: tx.hash,
      },
    };
  } catch (error) {
    console.error("fundStressWallet failed:", error);
    return createErrorResult(error);
  }
}
