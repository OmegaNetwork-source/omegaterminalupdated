/**
 * Pinata IPFS API Client
 *
 * Handles secure server-side IPFS uploads via Next.js API routes.
 * Client calls API routes which handle actual Pinata API requests with JWT.
 * This replaces client-side Pinata calls to protect JWT.
 */

import { NFTMetadata } from "@/types/nft";

/**
 * Upload image to IPFS via Pinata
 */
export async function uploadImageToIPFS(imageFile: File): Promise<{
  ipfsHash: string;
  ipfsUrl: string;
  gatewayUrl: string;
  success: boolean;
  error?: string;
}> {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);

    const response = await fetch("/api/pinata/upload-image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to upload image");
    }

    const data = await response.json();

    return {
      ipfsHash: data.ipfsHash,
      ipfsUrl: data.ipfsUrl,
      gatewayUrl: data.gatewayUrl,
      success: true,
    };
  } catch (error) {
    return {
      ipfsHash: "",
      ipfsUrl: "",
      gatewayUrl: "",
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to upload image to IPFS",
    };
  }
}

/**
 * Upload metadata JSON to IPFS via Pinata
 */
export async function uploadMetadataToIPFS(metadata: NFTMetadata): Promise<{
  ipfsHash: string;
  ipfsUrl: string;
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch("/api/pinata/upload-metadata", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to upload metadata");
    }

    const data = await response.json();

    return {
      ipfsHash: data.ipfsHash,
      ipfsUrl: data.ipfsUrl,
      success: true,
    };
  } catch (error) {
    return {
      ipfsHash: "",
      ipfsUrl: "",
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to upload metadata to IPFS",
    };
  }
}

/**
 * Upload complete NFT (image + metadata) to IPFS
 * Uploads image first, then creates and uploads metadata with image URL
 */
export async function uploadNFTToIPFS(
  imageFile: File,
  metadata: NFTMetadata
): Promise<{
  metadataUrl: string;
  imageUrl: string;
  gatewayUrl: string;
  success: boolean;
  error?: string;
}> {
  try {
    // Step 1: Upload image
    const imageResult = await uploadImageToIPFS(imageFile);

    if (!imageResult.success) {
      throw new Error(imageResult.error || "Failed to upload image");
    }

    // Step 2: Create metadata with image IPFS URL
    const completeMetadata: NFTMetadata = {
      ...metadata,
      image: imageResult.ipfsUrl,
    };

    // Step 3: Upload metadata
    const metadataResult = await uploadMetadataToIPFS(completeMetadata);

    if (!metadataResult.success) {
      throw new Error(metadataResult.error || "Failed to upload metadata");
    }

    return {
      metadataUrl: metadataResult.ipfsUrl,
      imageUrl: imageResult.ipfsUrl,
      gatewayUrl: imageResult.gatewayUrl,
      success: true,
    };
  } catch (error) {
    return {
      metadataUrl: "",
      imageUrl: "",
      gatewayUrl: "",
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to upload NFT to IPFS",
    };
  }
}
