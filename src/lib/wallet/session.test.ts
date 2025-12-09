import {
  createSessionWallet,
  importSessionWallet,
  validatePrivateKey,
} from "./session";

jest.mock("@/lib/config", () => ({
  __esModule: true,
  default: {
    OMEGA_RPC_URL: "http://localhost:8545",
  },
}));

let mockProvider: any;
let createRandomMock: jest.Mock;
let walletConstructorMock: jest.Mock;

const walletFn = jest
  .fn()
  .mockImplementation((privateKey: string, provider: any) =>
    walletConstructorMock(privateKey, provider)
  );

walletFn.createRandom = (...args: unknown[]) => createRandomMock(...args);

jest.mock("ethers", () => ({
  Wallet: walletFn,
  JsonRpcProvider: jest.fn().mockImplementation(() => mockProvider),
}));

describe("Session Wallet", () => {
  const validPrivateKey = "0x" + "a".repeat(64);

  beforeEach(() => {
    mockProvider = { url: "http://localhost:8545" };
    createRandomMock = jest.fn();
    walletConstructorMock = jest.fn();
    jest.clearAllMocks();
  });

  describe("createSessionWallet", () => {
    it("creates and connects a session wallet", async () => {
      const connectedWallet = {
        getAddress: jest
          .fn()
          .mockResolvedValue("0x1234567890abcdef1234567890abcdef12345678"),
      };
      createRandomMock.mockReturnValue({
        connect: jest.fn().mockReturnValue(connectedWallet),
        privateKey: validPrivateKey,
      });

      const result = await createSessionWallet();

      expect(result.address).toMatch(/^0x[a-f0-9]{40}$/i);
      expect(result.privateKey).toBe(validPrivateKey);
      expect(result.wallet).toBe(connectedWallet);
      expect(result.provider).toBe(mockProvider);
    });

    it("throws when wallet creation fails", async () => {
      createRandomMock.mockImplementation(() => {
        throw new Error("creation failed");
      });

      await expect(createSessionWallet()).rejects.toThrow("creation failed");
    });
  });

  describe("importSessionWallet", () => {
    it("imports wallet with valid private key", async () => {
      walletConstructorMock.mockReturnValue({
        getAddress: jest
          .fn()
          .mockResolvedValue("0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"),
      });

      const result = await importSessionWallet(validPrivateKey);

      expect(result.error).toBeUndefined();
      expect(result.address).toMatch(/^0x[a-f0-9]{40}$/i);
      expect(result.wallet).toBeDefined();
      expect(result.provider).toBe(mockProvider);
    });

    it("returns error for invalid private key format", async () => {
      const result = await importSessionWallet("123");

      expect(result.error).toContain("Private key must start with 0x");
      expect(result.wallet).toBeNull();
    });

    it("handles constructor failures gracefully", async () => {
      walletConstructorMock.mockImplementation(() => {
        throw new Error("bad key");
      });

      const result = await importSessionWallet(validPrivateKey);

      expect(result.error).toContain("bad key");
      expect(result.wallet).toBeNull();
    });
  });

  describe("validatePrivateKey", () => {
    it("accepts valid private keys", () => {
      expect(validatePrivateKey(validPrivateKey)).toEqual({ valid: true });
    });

    it("rejects keys without 0x prefix", () => {
      expect(validatePrivateKey(validPrivateKey.slice(2))).toEqual({
        valid: false,
        error: "Private key must start with 0x",
      });
    });

    it("rejects keys with incorrect length", () => {
      expect(validatePrivateKey("0x1234")).toEqual({
        valid: false,
        error:
          "Private key must be 66 characters long (0x + 64 hex characters)",
      });
    });

    it("rejects non-hex characters", () => {
      expect(validatePrivateKey("0x" + "g".repeat(64))).toEqual({
        valid: false,
        error: "Private key must contain only valid hexadecimal characters",
      });
    });
  });
});
