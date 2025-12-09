import { NextRequest } from "next/server";
import { proxyChainGptJson } from "@/lib/server/chaingpt";
import { config } from "@/lib/config";

export const revalidate = 0;

export async function POST(request: NextRequest) {
  return await proxyChainGptJson(request, config.CHAINGPT.NFT_ENDPOINT);
}
