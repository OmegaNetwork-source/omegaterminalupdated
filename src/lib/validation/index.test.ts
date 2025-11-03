import {
  ethereumAddressSchema,
  amountSchema,
  FundWalletSchema,
  CreateReferralSchema,
  SubmitArcadeScoreSchema,
  validateRequest,
} from "./index";

describe("Validation Schemas", () => {
  describe("ethereumAddressSchema", () => {
    it("accepts valid Ethereum addresses", () => {
      expect(() =>
        ethereumAddressSchema.parse(
          "0x1111111111111111111111111111111111111111"
        )
      ).not.toThrow();
    });

    it("rejects invalid addresses", () => {
      expect(() => ethereumAddressSchema.parse("0x123")).toThrow(
        "Invalid Ethereum address"
      );
      expect(() => ethereumAddressSchema.parse("invalid")).toThrow(
        "Invalid Ethereum address"
      );
    });
  });

  describe("amountSchema", () => {
    it("validates numeric strings", () => {
      expect(() => amountSchema.parse("10")).not.toThrow();
      expect(() => amountSchema.parse("10.5")).not.toThrow();
    });

    it("rejects zero or negative amounts", () => {
      expect(() => amountSchema.parse("0")).toThrow(
        "Amount must be greater than zero"
      );
      expect(() => amountSchema.parse("-1")).toThrow(
        "Amount must be a positive number"
      );
    });
  });

  describe("FundWalletSchema", () => {
    it("validates correct payload", () => {
      const payload = {
        address: "0x2222222222222222222222222222222222222222",
        amount: "5",
      };

      expect(() => FundWalletSchema.parse(payload)).not.toThrow();
    });

    it("rejects missing address", () => {
      expect(() => FundWalletSchema.parse({ amount: "1" })).toThrow();
    });
  });

  describe("CreateReferralSchema", () => {
    it("requires valid Ethereum address and formats", () => {
      const payload = {
        walletAddress: "0x3333333333333333333333333333333333333333",
        twitterHandle: "@omega",
      };

      expect(() => CreateReferralSchema.parse(payload)).not.toThrow();
    });

    it("rejects invalid wallet address", () => {
      expect(() =>
        CreateReferralSchema.parse({ walletAddress: "invalid" })
      ).toThrow("Invalid Ethereum address");
    });
  });

  describe("SubmitArcadeScoreSchema", () => {
    it("validates game score payload", () => {
      const payload = {
        gameType: 1,
        score: 100,
        username: "omega-player",
      };

      expect(() => SubmitArcadeScoreSchema.parse(payload)).not.toThrow();
    });

    it("rejects invalid username", () => {
      expect(() =>
        SubmitArcadeScoreSchema.parse({
          gameType: 1,
          score: 100,
          username: "x",
        })
      ).toThrow("Username must be at least 3 characters");
    });
  });
});

describe("validateRequest helper", () => {
  it("returns success for valid data", () => {
    const payload = {
      address: "0x4444444444444444444444444444444444444444",
    };

    const result = validateRequest(FundWalletSchema, payload);

    expect(result).toMatchObject({ success: true, data: payload });
  });

  it("returns error message for invalid data", () => {
    const result = validateRequest(FundWalletSchema, { address: "invalid" });

    expect(result.success).toBe(false);
    expect(result).toHaveProperty("error");
  });
});
