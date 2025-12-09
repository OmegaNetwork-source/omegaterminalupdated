import * as Utils from "./utils";

const {
  parseCommandArgs,
  base58Decode,
  formatDuration,
  formatNumber,
  generateMixerCommitment,
  escapeHtml,
  formatBalance,
  formatCurrency,
  isValidEthereumAddress,
  isValidPrivateKey,
  shortenAddress,
} = Utils;

describe("Utility Functions", () => {
  describe("parseCommandArgs", () => {
    it("splits command into arguments", () => {
      expect(parseCommandArgs("connect wallet")).toEqual(["connect", "wallet"]);
    });

    it("handles quoted arguments as single entries", () => {
      expect(parseCommandArgs("send '0xabc' 10")).toEqual([
        "send",
        "0xabc",
        "10",
      ]);
    });

    it("handles empty string", () => {
      expect(parseCommandArgs("")).toEqual([]);
    });

    it("condenses multiple spaces", () => {
      expect(parseCommandArgs("  mine   start  now ")).toEqual([
        "mine",
        "start",
        "now",
      ]);
    });
  });

  describe("base58Decode", () => {
    it("decodes known base58 value", () => {
      const decoded = base58Decode("StV1DL6CwTryKyV");
      expect(Array.from(decoded)).toEqual([26, 200, 16, 113, 73, 52, 44]);
    });

    it("throws on invalid characters", () => {
      expect(() => base58Decode("0OIl")).toThrow("Invalid base58 character");
    });
  });

  describe("formatDuration", () => {
    it("formats seconds only", () => {
      expect(formatDuration(45)).toBe("45s");
    });

    it("formats minutes and seconds", () => {
      expect(formatDuration(125)).toBe("2m 5s");
    });

    it("formats hours, minutes, and seconds", () => {
      expect(formatDuration(3_725)).toBe("1h 2m 5s");
    });
  });

  describe("formatNumber", () => {
    it("returns small numbers without suffix", () => {
      expect(formatNumber(950)).toBe("950");
    });

    it("formats thousands with K suffix", () => {
      expect(formatNumber(12_300)).toBe("12.3K");
    });

    it("formats millions with M suffix", () => {
      expect(formatNumber(5_600_000)).toBe("5.6M");
    });

    it("formats billions with B suffix", () => {
      expect(formatNumber(7_800_000_000)).toBe("7.8B");
    });
  });

  describe("Ethereum validation helpers", () => {
    it("validates proper Ethereum addresses", () => {
      expect(
        isValidEthereumAddress("0x0000000000000000000000000000000000000000")
      ).toBe(true);
    });

    it("rejects malformed Ethereum addresses", () => {
      expect(isValidEthereumAddress("0x123")).toBe(false);
      expect(isValidEthereumAddress("1234567890")).toBe(false);
    });

    it("validates private keys", () => {
      expect(isValidPrivateKey("0x" + "a".repeat(64))).toBe(true);
    });

    it("rejects invalid private keys", () => {
      expect(isValidPrivateKey("0x" + "g".repeat(64))).toBe(false);
      expect(isValidPrivateKey("0x1234")).toBe(false);
    });
  });

  describe("shortenAddress", () => {
    const address = "0x1234567890abcdef1234567890abcdef12345678";

    it("shortens address with default characters", () => {
      expect(shortenAddress(address)).toBe("0x1234...5678");
    });

    it("shortens address with custom characters", () => {
      expect(shortenAddress(address, 6)).toBe("0x123456...345678");
    });

    it("handles empty string", () => {
      expect(shortenAddress("")).toBe("");
    });
  });

  describe("generateMixerCommitment", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("generates secret and commitment pairs", () => {
      const commitment = generateMixerCommitment();
      expect(commitment.secret).toMatch(/^0x[0-9a-f]+$/);
      expect(commitment.commitment).toMatch(/^0x[0-9a-f]{64}$/i);
    });

    it("produces deterministic commitment for mocked secret", () => {
      jest.spyOn(Utils, "randomHex").mockReturnValue("0x" + "ab".repeat(32));
      const first = generateMixerCommitment();
      const second = generateMixerCommitment();
      expect(first.secret).toBe("0x" + "ab".repeat(32));
      expect(second.secret).toBe(first.secret);
      expect(second.commitment).toBe(first.commitment);
    });

    it("secret has expected length", () => {
      jest.spyOn(Utils, "randomHex").mockReturnValue("0x" + "cd".repeat(32));
      const { secret } = generateMixerCommitment();
      expect(secret).toHaveLength(2 + 64);
    });
  });

  describe("escapeHtml", () => {
    it("escapes special HTML characters", () => {
      expect(escapeHtml('<script>alert("x")</script>')).toBe(
        "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;"
      );
    });
  });

  describe("formatBalance", () => {
    it("formats balance with default symbol", () => {
      expect(formatBalance("12.345678")).toBe("12.3457 OMEGA");
    });

    it("formats balance with custom symbol and decimals", () => {
      expect(formatBalance(123.456789, "ETH", 2)).toBe("123.46 ETH");
    });
  });

  describe("formatCurrency", () => {
    it("formats large values using suffixes", () => {
      expect(formatCurrency(1_500_000)).toBe("1.5M");
    });

    it("formats small values with decimals", () => {
      expect(formatCurrency(1234.567, 2)).toBe("1,234.57");
    });
  });
});
