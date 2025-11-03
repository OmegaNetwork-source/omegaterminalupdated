import { BrowserProvider, JsonRpcProvider } from "ethers";

import * as connection from "./connection";
import { waitForWalletProvider } from "./detection";

jest.mock("./detection", () => ({
  waitForWalletProvider: jest.fn(),
}));

let mockBrowserProvider: any;

jest.mock("ethers", () => {
  const actual = jest.requireActual("ethers");
  return {
    ...actual,
    BrowserProvider: jest.fn().mockImplementation(() => mockBrowserProvider),
    JsonRpcProvider: class {
      constructor(public readonly url: string) {}
    },
  };
});

const waitForWalletProviderMock = waitForWalletProvider as jest.MockedFunction<
  typeof waitForWalletProvider
>;

describe("Wallet Connection", () => {
  const address = "0x1111111111111111111111111111111111111111";

  beforeEach(() => {
    jest.clearAllMocks();
    mockBrowserProvider = {
      getSigner: jest.fn().mockResolvedValue({
        getAddress: jest.fn().mockResolvedValue(address),
      }),
      getNetwork: jest.fn().mockResolvedValue({ chainId: 1 }),
    };
  });

  describe("connectMetaMask", () => {
    it("connects successfully to MetaMask", async () => {
      const metamaskProvider = {
        request: jest
          .fn()
          .mockImplementation(({ method }: { method: string }) => {
            if (method === "eth_requestAccounts") {
              return Promise.resolve([address]);
            }
            if (method === "wallet_switchEthereumChain") {
              return Promise.resolve(true);
            }
            return Promise.resolve(true);
          }),
      };

      waitForWalletProviderMock.mockResolvedValue({
        provider: metamaskProvider as any,
        type: "metamask",
        name: "MetaMask",
        timedOut: false,
      });

      const result = await connection.connectMetaMask();

      expect(result.success).toBe(true);
      expect(result.address).toBe(address);
      expect(result.provider).toBe(mockBrowserProvider);
      expect(BrowserProvider).toHaveBeenCalledWith(metamaskProvider);
    });

    it("rejects Phantom EVM providers", async () => {
      waitForWalletProviderMock.mockResolvedValue({
        provider: {} as any,
        type: "phantom",
        name: "Phantom",
        timedOut: false,
      });

      const result = await connection.connectMetaMask();

      expect(result.success).toBe(false);
      expect(result.error).toContain("Phantom");
    });

    it("returns error when no wallet is detected", async () => {
      waitForWalletProviderMock.mockResolvedValue({
        provider: null,
        type: null,
        name: "None",
        timedOut: false,
      });

      const result = await connection.connectMetaMask();

      expect(result.success).toBe(false);
      expect(result.error).toContain("No EVM wallet");
    });

    it("adds Omega Network when switch returns 4902", async () => {
      const addOmegaNetworkSpy = jest
        .spyOn(connection, "addOmegaNetwork")
        .mockResolvedValue({ success: true });

      const metamaskProvider = {
        request: jest
          .fn()
          .mockImplementation(
            ({ method }: { method: string; params?: any[] }) => {
              if (method === "eth_requestAccounts") {
                return Promise.resolve([address]);
              }
              if (method === "wallet_switchEthereumChain") {
                return Promise.reject({ code: 4902 });
              }
              return Promise.resolve(true);
            }
          ),
      };

      waitForWalletProviderMock.mockResolvedValue({
        provider: metamaskProvider as any,
        type: "metamask",
        name: "MetaMask",
        timedOut: false,
      });

      const result = await connection.connectMetaMask();

      expect(result.success).toBe(true);
      expect(addOmegaNetworkSpy).toHaveBeenCalledWith(metamaskProvider);
      addOmegaNetworkSpy.mockRestore();
    });

    it("propagates error when network addition fails", async () => {
      const addOmegaNetworkSpy = jest
        .spyOn(connection, "addOmegaNetwork")
        .mockResolvedValue({ success: false, error: "Failed" });

      const metamaskProvider = {
        request: jest
          .fn()
          .mockImplementation(({ method }: { method: string }) => {
            if (method === "eth_requestAccounts") {
              return Promise.resolve([address]);
            }
            if (method === "wallet_switchEthereumChain") {
              return Promise.reject({ code: 4902 });
            }
            return Promise.resolve(true);
          }),
      };

      waitForWalletProviderMock.mockResolvedValue({
        provider: metamaskProvider as any,
        type: "metamask",
        name: "MetaMask",
        timedOut: false,
      });

      const result = await connection.connectMetaMask();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed");
      addOmegaNetworkSpy.mockRestore();
    });

    it("returns failure message on unexpected errors", async () => {
      const metamaskProvider = {
        request: jest
          .fn()
          .mockImplementation(() => Promise.reject(new Error("User rejected"))),
      };

      waitForWalletProviderMock.mockResolvedValue({
        provider: metamaskProvider as any,
        type: "metamask",
        name: "MetaMask",
        timedOut: false,
      });

      const result = await connection.connectMetaMask();

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "MetaMask connection request rejected by user."
      );
    });

    it("advises when a connection request is already pending", async () => {
      const metamaskProvider = {
        request: jest.fn().mockImplementation(() =>
          Promise.reject({
            code: -32002,
            message:
              "Request of type 'eth_requestAccounts' already pending for origin.",
          })
        ),
      };

      waitForWalletProviderMock.mockResolvedValue({
        provider: metamaskProvider as any,
        type: "metamask",
        name: "MetaMask",
        timedOut: false,
      });

      const result = await connection.connectMetaMask();

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "MetaMask connection request already pending. Open the MetaMask extension and complete the request."
      );
    });
  });

  describe("addOmegaNetwork", () => {
    it("successfully adds network", async () => {
      const provider = {
        request: jest.fn().mockResolvedValue(true),
      };

      const result = await connection.addOmegaNetwork(provider);

      expect(result.success).toBe(true);
      expect(provider.request).toHaveBeenCalledWith(
        expect.objectContaining({ method: "wallet_addEthereumChain" })
      );
    });

    it("handles rejection with error message", async () => {
      const provider = {
        request: jest.fn().mockRejectedValue(new Error("Rejected")),
      };

      const result = await connection.addOmegaNetwork(provider);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Rejected");
    });
  });

  describe("getBalance", () => {
    it("retrieves balance using BrowserProvider", async () => {
      const provider = {
        getBalance: jest.fn().mockResolvedValue(BigInt("1000000000000000000")),
      } as unknown as BrowserProvider;

      const balance = await connection.getBalance(provider, address);

      expect(balance).toBe("1.0");
    });

    it("retrieves balance using JsonRpcProvider", async () => {
      const provider = {
        getBalance: jest.fn().mockResolvedValue(BigInt("2500000000000000000")),
      } as unknown as JsonRpcProvider;

      const balance = await connection.getBalance(provider, address);

      expect(balance).toBe("2.5");
    });

    it("throws on provider error", async () => {
      const provider = {
        getBalance: jest.fn().mockRejectedValue(new Error("Network error")),
      } as unknown as BrowserProvider;

      await expect(connection.getBalance(provider, address)).rejects.toThrow(
        "Network error"
      );
    });
  });
});
