import { addCacheHeaders, createSecureResponse } from "@/lib/middleware";

export const revalidate = 0;

const SAFE_ENV_KEYS = [
  "NEXT_PUBLIC_RELAYER_URL",
  "NEXT_PUBLIC_OMEGA_RPC_URL",
  "NEXT_PUBLIC_SOLANA_RPC_URL",
  "NEXT_PUBLIC_NEAR_RPC_URL",
  "NEXT_PUBLIC_ECLIPSE_RPC_URL",
];

function collectSafeEnvVars(): Record<string, string | null> {
  return SAFE_ENV_KEYS.reduce<Record<string, string | null>>((acc, key) => {
    acc[key] = process.env[key] ?? null;
    return acc;
  }, {});
}

export async function GET() {
  console.info(
    "Env route requested - returning non-sensitive environment metadata"
  );

  const response = createSecureResponse({
    success: true,
    data: {
      envVars: collectSafeEnvVars(),
    },
  });

  return addCacheHeaders(response, 0);
}
