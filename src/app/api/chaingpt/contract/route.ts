import { NextRequest } from "next/server";
import { proxyChainGptStream } from "@/lib/server/chaingpt";
import { config } from "@/lib/config";

export const revalidate = 0;

export async function POST(request: NextRequest) {
  return await proxyChainGptStream(
    request,
    config.CHAINGPT.SMART_CONTRACT_ENDPOINT,
    "contract generation"
  );
}
