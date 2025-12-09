import { fundWallet, fundStressWallet } from "./wallet";

const parseEtherMock = jest.fn((value: string) =>
  BigInt(Math.floor(Number(value) * 1e18))
);
const enforceLimitMock = jest.fn();
const getGasPriceMock = jest.fn();
const getFreshNonceMock = jest.fn();
const getRelayerSignerMock = jest.fn();
const withNetworkRetryMock = jest.fn();
const withNonceLockMock = jest.fn();

jest.mock("ethers", () => ({
  parseEther: (...args: [string]) => parseEtherMock(...args),
}));

jest.mock("@/lib/blockchain", () => ({
  enforceLimit: (...args: unknown[]) => enforceLimitMock(...args),
  getGasPrice: (...args: unknown[]) => getGasPriceMock(...args),
  getFreshNonce: (...args: unknown[]) => getFreshNonceMock(...args),
  getRelayerSigner: (...args: unknown[]) => getRelayerSignerMock(...args),
  withNetworkRetry: (...args: unknown[]) => withNetworkRetryMock(...args),
  withNonceLock: (...args: unknown[]) => withNonceLockMock(...args),
}));

describe("Wallet Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    parseEtherMock.mockImplementation((value: string) =>
      BigInt(Math.floor(Number(value || "0") * 1e18))
    );
    getGasPriceMock.mockResolvedValue(1_000_000_000n);
    getFreshNonceMock.mockResolvedValue(5);
    const signer = {
      getAddress: jest
        .fn()
        .mockResolvedValue("0xrelayeraddress000000000000000000000000"),
      sendTransaction: jest.fn().mockResolvedValue({ hash: "0xtxhash" }),
    };
    getRelayerSignerMock.mockReturnValue(signer);
    withNetworkRetryMock.mockImplementation((fn: () => Promise<any>) => fn());
    withNonceLockMock.mockImplementation(
      (_address: string, fn: () => Promise<any>) => fn()
    );
  });

  describe("fundWallet", () => {
    it("validates Ethereum address", async () => {
      const result = await fundWallet("invalid");
      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid Ethereum address");
    });

    it("sends transaction successfully", async () => {
      const result = await fundWallet(
        "0x1111111111111111111111111111111111111111",
        "0.2"
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.txHash).toBe("0xtxhash");
        expect(typeof result.data.responseTime).toBe("number");
      }
      expect(parseEtherMock).toHaveBeenCalledWith("0.2");
      expect(enforceLimitMock).toHaveBeenCalledWith(
        "BLOCKCHAIN",
        "0x1111111111111111111111111111111111111111"
      );
      expect(getRelayerSignerMock).toHaveBeenCalled();
    });

    it("handles network errors gracefully", async () => {
      withNetworkRetryMock.mockImplementationOnce(async () => {
        throw new Error("network failure");
      });

      const result = await fundWallet(
        "0x1111111111111111111111111111111111111111",
        "0.1"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("network failure");
    });
  });

  describe("fundStressWallet", () => {
    it("validates address input", async () => {
      const result = await fundStressWallet("bad-address");
      expect(result.success).toBe(false);
    });

    it("funds wallet with larger amount", async () => {
      const result = await fundStressWallet(
        "0x2222222222222222222222222222222222222222",
        "2.5"
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.txHash).toBe("0xtxhash");
      }
      expect(parseEtherMock).toHaveBeenCalledWith("2.5");
      expect(withNonceLockMock).toHaveBeenCalled();
    });

    it("returns error when signer throws", async () => {
      getRelayerSignerMock.mockImplementation(() => {
        throw new Error("Signer missing");
      });

      const result = await fundStressWallet(
        "0x2222222222222222222222222222222222222222"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Signer missing");
    });
  });
});
