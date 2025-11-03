import { NextResponse } from "next/server";
import { getChainGptCapabilities } from "@/lib/server/chaingpt";

export const revalidate = 0;

export async function GET() {
  const capabilities = getChainGptCapabilities();
  return NextResponse.json(capabilities, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
