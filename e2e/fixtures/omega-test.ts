import { test as base, expect } from "@playwright/test";

const TEST_WALLET_ADDRESS = "0x1234567890ABCDEF1234567890ABCDEF12345678";
const RELAYER_URL = "https://terminal-v1-5-9.onrender.com";
const RPC_URL = "https://0x4e454228.rpc.aurora-cloud.dev";
const CHAIN_ID_HEX = "0x4e454228";
const CHAIN_ID_DECIMAL = 1_313_161_256;

type Fixtures = {
  e2eSetup: void;
};

const encodeUint256 = (value: bigint) => value.toString(16).padStart(64, "0");

const minerInfoResponse = `0x${encodeUint256(5n)}${encodeUint256(
  1700000000n
)}${encodeUint256(500000000000000000n)}`;

export const test = base.extend<Fixtures>({
  e2eSetup: [
    async ({ page }, use) => {
      await page.addInitScript(
        ({
          address,
          relayerUrl,
          rpcUrl,
          chainIdHex,
          chainIdDecimal,
          minerInfo,
        }) => {
          const listeners = new Map<string, Set<(...args: any[]) => void>>();

          const ethereum = {
            isMetaMask: true,
            request: async ({
              method,
              params,
            }: {
              method: string;
              params?: any[];
            }) => {
              switch (method) {
                case "eth_requestAccounts":
                case "eth_accounts":
                  return [address];
                case "wallet_switchEthereumChain":
                case "wallet_addEthereumChain":
                  return null;
                case "eth_chainId":
                  return chainIdHex;
                case "net_version":
                  return String(chainIdDecimal);
                case "eth_blockNumber":
                  return "0x64";
                case "eth_getBalance":
                  return "0x3635c9adc5dea0000"; // 100 OMEGA
                case "eth_gasPrice":
                  return "0x3b9aca00"; // 1 Gwei
                case "eth_estimateGas":
                  return "0x5208"; // 21000
                case "eth_sendTransaction":
                case "eth_sendRawTransaction":
                  return "0x" + "ab".repeat(32);
                case "eth_getTransactionReceipt":
                  return {
                    transactionHash: params?.[0] ?? "0x" + "ab".repeat(32),
                    status: "0x1",
                    blockNumber: "0x64",
                    cumulativeGasUsed: "0x5208",
                    gasUsed: "0x5208",
                  };
                default:
                  return null;
              }
            },
            on: (event: string, handler: (...args: any[]) => void) => {
              if (!listeners.has(event)) {
                listeners.set(event, new Set());
              }
              listeners.get(event)!.add(handler);
            },
            removeListener: (
              event: string,
              handler: (...args: any[]) => void
            ) => {
              listeners.get(event)?.delete(handler);
            },
          } as const;

          Object.defineProperty(window, "ethereum", {
            value: ethereum,
            configurable: true,
          });

          const originalFetch = window.fetch.bind(window);

          const jsonResponse = (body: unknown, init?: ResponseInit) =>
            new Response(JSON.stringify(body), {
              status: init?.status ?? 200,
              headers: {
                "Content-Type": "application/json",
              },
              ...init,
            });

          window.fetch = async (
            input: RequestInfo | URL,
            init?: RequestInit
          ) => {
            const url =
              typeof input === "string"
                ? input
                : input instanceof URL
                ? input.href
                : input.url;

            if (url.startsWith(relayerUrl)) {
              const { pathname } = new URL(url);

              if (pathname.endsWith("/mine")) {
                return jsonResponse({
                  success: true,
                  reward: "0.25",
                  txHash: "0x" + "de".repeat(32),
                });
              }

              if (pathname.endsWith("/fund")) {
                return jsonResponse({
                  success: true,
                  txHash: "0x" + "cd".repeat(32),
                });
              }

              if (pathname.endsWith("/claim")) {
                return jsonResponse({
                  success: true,
                  txHash: "0x" + "ef".repeat(32),
                });
              }

              if (pathname.includes("/magiceden")) {
                return jsonResponse({
                  success: true,
                  results: Array.from({ length: 4 }).map((_, index) => ({
                    token: {
                      name: `Omega Artifact #${index + 1}`,
                      image: `https://picsum.photos/seed/omega${
                        index + 1
                      }/400/400`,
                    },
                    price: 1.5 + index,
                  })),
                });
              }

              if (pathname.includes("/news")) {
                return jsonResponse({
                  success: true,
                  items: [
                    {
                      title: "Omega Terminal launches AI-assisted trading",
                      url: "https://omega.network/news/ai",
                      source: "Omega Network",
                      publishedAt: new Date().toISOString(),
                    },
                  ],
                });
              }

              if (pathname.includes("/ai")) {
                return jsonResponse({
                  type: "message",
                  response: "Mock AI response",
                });
              }

              // Default relayer response
              return jsonResponse({ success: true });
            }

            if (
              url.startsWith("https://www.googleapis.com/youtube/v3/search")
            ) {
              return jsonResponse({
                items: Array.from({ length: 3 }).map((_, index) => ({
                  id: { videoId: `omega-video-${index}` },
                  snippet: {
                    title: `Omega Network Showcase ${index + 1}`,
                    channelTitle: "Omega Broadcast",
                    thumbnails: {
                      medium: {
                        url: `https://picsum.photos/seed/omegayt${index}/320/180`,
                      },
                    },
                  },
                })),
              });
            }

            if (url.startsWith(rpcUrl)) {
              try {
                const body = init?.body ? JSON.parse(init.body as string) : {};
                const { method, id } = body;

                const rpcResult = (() => {
                  switch (method) {
                    case "eth_chainId":
                      return chainIdHex;
                    case "net_version":
                      return String(chainIdDecimal);
                    case "eth_blockNumber":
                      return "0x64";
                    case "eth_getBalance":
                      return "0x3635c9adc5dea0000";
                    case "eth_gasPrice":
                      return "0x3b9aca00";
                    case "eth_estimateGas":
                      return "0x5208";
                    case "eth_sendTransaction":
                    case "eth_sendRawTransaction":
                      return "0x" + "ab".repeat(32);
                    case "eth_getTransactionReceipt":
                      return {
                        transactionHash:
                          body.params?.[0] ?? "0x" + "ab".repeat(32),
                        status: "0x1",
                        blockNumber: "0x64",
                      };
                    case "eth_call":
                      return minerInfo;
                    default:
                      return "0x1";
                  }
                })();

                return jsonResponse({ jsonrpc: "2.0", id, result: rpcResult });
              } catch (error) {
                console.error("E2E RPC stub error", error);
                return jsonResponse(
                  { jsonrpc: "2.0", id: null, error: "stub-error" },
                  { status: 500 }
                );
              }
            }

            return originalFetch(input, init);
          };
        },
        {
          address: TEST_WALLET_ADDRESS,
          relayerUrl: RELAYER_URL,
          rpcUrl: RPC_URL,
          chainIdHex: CHAIN_ID_HEX,
          chainIdDecimal: CHAIN_ID_DECIMAL,
          minerInfo: minerInfoResponse,
        }
      );

      await use();
    },
    { auto: true },
  ],
});

export { expect };
