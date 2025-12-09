import { executeMine, claimRewards } from "./mining";

const formatEtherMock = jest.fn((value: bigint) =>
  (Number(value) / 1e18).toString()
);
const getRelayerSignerMock = jest.fn();
const getGasPriceMock = jest.fn();
const getFreshNonceMock = jest.fn();
const withNetworkRetryMock = jest.fn();
const withNonceLockMock = jest.fn();
const enforceLimitMock = jest.fn();

const contractInstance = {
  getMinerInfo: jest.fn(),
  claimTo: jest.fn(),
};

const originalFetch = global.fetch;

jest.mock("ethers", () => ({
  Contract: jest.fn().mockImplementation(() => contractInstance),
  formatEther: (...args: [bigint]) => formatEtherMock(...args),
}));

jest.mock("@/lib/blockchain", () => ({
  getRelayerSigner: (...args: unknown[]) => getRelayerSignerMock(...args),
  getGasPrice: (...args: unknown[]) => getGasPriceMock(...args),
  getFreshNonce: (...args: unknown[]) => getFreshNonceMock(...args),
  withNetworkRetry: (...args: unknown[]) => withNetworkRetryMock(...args),
  withNonceLock: (...args: unknown[]) => withNonceLockMock(...args),
}));

jest.mock("@/lib/middleware", () => ({
  enforceLimit: (...args: unknown[]) => enforceLimitMock(...args),
}));

describe("Mining Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getRelayerSignerMock.mockReturnValue({
      getAddress: jest
        .fn()
        .mockResolvedValue("0xrelayeraddress000000000000000000000000"),
    });
    getGasPriceMock.mockResolvedValue(1_000_000_000n);
    getFreshNonceMock.mockResolvedValue(10);
    withNetworkRetryMock.mockImplementation((fn: () => Promise<any>) => fn());
    withNonceLockMock.mockImplementation(
      (_address: string, fn: () => Promise<any>) => fn()
    );
    contractInstance.getMinerInfo.mockResolvedValue({
      pendingRewards: 1000000000000000000n,
    });
    contractInstance.claimTo.mockResolvedValue({
      hash: "0xtxhash",
      wait: jest.fn().mockResolvedValue({ status: 1 }),
    });
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe("executeMine", () => {
    it("validates address input", async () => {
      const result = await executeMine("bad");
      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid Ethereum address");
    });

    it("returns success payload from relayer", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(
          JSON.stringify({
            success: true,
            txHash: "0xminehash",
            reward: "5.0",
            blockNumber: 123,
          })
        ),
      });

      const result = await executeMine(
        "0x1111111111111111111111111111111111111111"
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toMatchObject({
          txHash: "0xminehash",
          reward: "5.0",
          blockNumber: 123,
        });
      }
    });

    it("handles relayer failures", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        text: jest.fn().mockResolvedValue("failed"),
      });

      const result = await executeMine(
        "0x1111111111111111111111111111111111111111"
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("failed");
    });
  });

  describe("claimRewards", () => {
    it("validates address", async () => {
      const result = await claimRewards("bad");
      expect(result.success).toBe(false);
    });

    it("returns error when no pending rewards", async () => {
      contractInstance.getMinerInfo.mockResolvedValueOnce({
        pendingRewards: 0n,
      });
      const result = await claimRewards(
        "0x2222222222222222222222222222222222222222"
      );
      expect(result.success).toBe(false);
      expect(result.error).toContain("No pending rewards");
    });

    it("claims rewards successfully", async () => {
      const txMock = {
        hash: "0xrewardhash",
        wait: jest.fn().mockResolvedValue({ status: 1 }),
      };
      contractInstance.claimTo.mockResolvedValueOnce(txMock);
      withNetworkRetryMock.mockImplementationOnce((fn: () => Promise<any>) =>
        fn()
      );

      const result = await claimRewards(
        "0x2222222222222222222222222222222222222222"
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.txHash).toBe("0xrewardhash");
        expect(result.data.amount).toBe(formatEtherMock(1000000000000000000n));
      }
      expect(enforceLimitMock).toHaveBeenCalled();
      expect(contractInstance.claimTo).toHaveBeenCalledWith(
        "0x2222222222222222222222222222222222222222",
        expect.objectContaining({ gasPrice: 1_000_000_000n, nonce: 10 })
      );
    });

    it("handles contract errors", async () => {
      withNetworkRetryMock.mockImplementationOnce(async () => {
        throw new Error("claim failed");
      });

      const result = await claimRewards(
        "0x2222222222222222222222222222222222222222"
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe("claim failed");
    });
  });
});
