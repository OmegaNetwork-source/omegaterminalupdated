/**
 * Pinata Image Upload API Route
 *
 * Handles secure server-side image uploads to IPFS via Pinata.
 * Protects Pinata JWT from client exposure.
 *
 * POST /api/pinata/upload-image
 * Body: FormData with 'file' field containing image
 *
 * Note: PINATA_JWT should be added to .env.local for production
 */

import type { NextRequest } from "next/server";
import { createSecureResponse } from "@/lib/middleware";

/**
 * GET handler - not supported
 */
export async function GET() {
  return createSecureResponse(
    { error: "Method not allowed. Use POST to upload images." },
    405,
    undefined,
    { maxAge: 0 }
  );
}

/**
 * POST handler - upload image to Pinata IPFS
 */
export async function POST(request: NextRequest) {
  try {
    // Check for required environment variable
    const PINATA_JWT = process.env.PINATA_JWT;
    if (!PINATA_JWT) {
      console.error("PINATA_JWT environment variable is not set");
      return createSecureResponse(
        {
          error:
            "Server configuration error: PINATA_JWT is not configured. Please set the PINATA_JWT environment variable.",
          success: false,
        },
        500,
        undefined,
        { maxAge: 0 }
      );
    }
    // Extract FormData from request
    const formData = await request.formData();
    const file = formData.get("file");

    // Validate file exists and is File type
    if (!file || !(file instanceof File)) {
      return createSecureResponse(
        { error: "No file provided or invalid file type" },
        400,
        undefined,
        { maxAge: 0 }
      );
    }

    // Create FormData for Pinata
    const pinataFormData = new FormData();
    pinataFormData.append("file", file);

    // Upload to Pinata
    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: pinataFormData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinata API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const ipfsHash = data.IpfsHash;

    return createSecureResponse(
      {
        ipfsHash,
        ipfsUrl: `ipfs://${ipfsHash}`,
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
        success: true,
      },
      200,
      undefined,
      { maxAge: 0 }
    );
  } catch (error) {
    console.error("Pinata image upload error:", error);
    return createSecureResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload image to IPFS",
        success: false,
      },
      500,
      undefined,
      { maxAge: 0 }
    );
  }
}
