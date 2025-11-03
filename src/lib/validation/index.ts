import { z } from "zod";

/**
 * Common schema definitions shared across Server Actions and API routes.
 * These schemas ensure consistent validation for blockchain addresses, amounts,
 * referral codes, pagination parameters, and user identifiers.
 */
export const ethereumAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/u, "Invalid Ethereum address");

export const amountSchema = z
  .string()
  .regex(/^(?:\d+)(?:\.\d+)?$/u, "Amount must be a positive number")
  .refine((value) => Number(value) > 0, "Amount must be greater than zero");

export const walletAddressSchema = z
  .string()
  .min(1, "Wallet address is required")
  .regex(/^[A-Za-z0-9_:-]+$/u, "Wallet address contains invalid characters");

export const referralCodeSchema = z
  .string()
  .regex(/^OMEGA[A-Z0-9]{6}$/u, "Invalid referral code format");

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/u,
    "Username may only contain letters, numbers, underscores, and hyphens"
  );

export const limitSchema = z.number().int().min(1).max(100).default(10);

export const offsetSchema = z.number().int().min(0).default(0);

export const FundWalletSchema = z.object({
  address: ethereumAddressSchema,
  amount: amountSchema.optional(),
});

export const MineBlockSchema = z.object({
  address: ethereumAddressSchema,
});

export const ClaimRewardsSchema = z.object({
  address: ethereumAddressSchema,
});

export const FaucetClaimSchema = z.object({
  address: ethereumAddressSchema,
});

export const CreateReferralSchema = z.object({
  walletAddress: ethereumAddressSchema,
  twitterHandle: z.string().optional(),
  discordId: z.string().optional(),
});

export const CompleteReferralSchema = z.object({
  referralCode: referralCodeSchema,
  referredAddress: ethereumAddressSchema,
});

export const SubmitArcadeScoreSchema = z.object({
  gameType: z.number().int().min(0).max(12),
  score: z.number().int().min(0),
  username: usernameSchema,
  gameData: z.string().optional(),
});

/**
 * Validates an arbitrary payload against a Zod schema and returns
 * a typed result that can be used in downstream logic without
 * repeating try/catch blocks.
 *
 * @example
 * const validation = validateRequest(FundWalletSchema, body);
 * if (!validation.success) {
 *   return NextResponse.json({ error: validation.error }, { status: 400 });
 * }
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map((issue) => issue.message).join(", "),
    };
  }

  return {
    success: true,
    data: parsed.data,
  };
}

/**
 * Utility type that extracts the inferred type from a given schema.
 * Helpful when building strongly-typed handlers that rely on shared
 * validation definitions.
 */
export type InferSchema<T extends z.ZodTypeAny> = z.infer<T>;
