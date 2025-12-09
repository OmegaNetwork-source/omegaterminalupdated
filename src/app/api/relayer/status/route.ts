import { NextRequest } from "next/server";
import { formatEther } from "ethers";
import {
  createSecureResponse,
  handleApiError,
  withRateLimit,
} from "@/lib/middleware";
import {
  getRelayerSigner,
  getProvider,
  withNetworkRetry,
} from "@/lib/blockchain";

export const revalidate = 30;

/**
 * Provides operational insight into the relayer including balance, current
 * block height, and health indicators for the retry/nonce subsystems.
 */
async function handler(_request: NextRequest) {
  try {
    const signer = getRelayerSigner();
    const provider = getProvider();
    const relayerAddress = await signer.getAddress();

    const { balance, blockNumber } = await withNetworkRetry(async () => {
      const [relayerBalance, latestBlock] = await Promise.all([
        provider.getBalance(relayerAddress),
        provider.getBlockNumber(),
      ]);

      return { balance: relayerBalance, blockNumber: latestBlock };
    }, "relayerStatus");

    return createSecureResponse({
      success: true,
      data: {
        relayerAddress,
        balance: formatEther(balance),
        blockNumber,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        networkRetryEnabled: true,
        nonceManagement: "Fresh nonces per transaction",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withRateLimit(handler, "API_PROXY");
