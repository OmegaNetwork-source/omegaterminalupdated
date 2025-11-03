/**
 * Omega NFT Minting Commands Module
 * Migrated from js/plugins/omega-nft-onchain.js to TypeScript
 * Includes: mint, collection, view, contract
 *
 * Note: MintNFTModal UI integration deferred to Phase 15 (futuristic UI system)
 * Note: For now, commands show instructions and display existing minted NFTs
 */

import type { Command, CommandContext } from "@/types/commands";
import { config } from "@/lib/config";
import { escapeHtml } from "@/lib/utils";
import type { MintedNFT, NFTMetadata } from "@/types/nft";
import { pinata } from "@/lib/api";
import { Contract } from "ethers";

// localStorage key for NFT collection
const NFT_STORAGE_KEY = "omega-user-nfts-v2";

/**
 * Get minted NFTs from localStorage
 */
function getMintedNFTs(): MintedNFT[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(NFT_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error loading minted NFTs:", error);
    return [];
  }
}

/**
 * Save minted NFT to localStorage
 */
function saveMintedNFT(nft: MintedNFT): void {
  if (typeof window === "undefined") return;

  try {
    const nfts = getMintedNFTs();
    nfts.push(nft);
    localStorage.setItem(NFT_STORAGE_KEY, JSON.stringify(nfts));
  } catch (error) {
    console.error("Error saving minted NFT:", error);
  }
}

/**
 * Helper function to create collection card HTML
 */
function createCollectionCardHTML(nft: MintedNFT, index: number): string {
  return `
    <div style="
      background: linear-gradient(135deg, rgba(52, 199, 89, 0.1), rgba(48, 209, 88, 0.1));
      border: 2px solid rgba(52, 199, 89, 0.3);
      border-radius: 16px;
      padding: 20px;
      margin: 12px 0;
      position: relative;
      overflow: hidden;
    ">
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, #34C759, #30D158, #34C759);
        background-size: 200% 100%;
        animation: shimmer 2s infinite;
      "></div>
      
      <div style="display: flex; gap: 20px; align-items: start;">
        <div style="
          width: 120px;
          height: 120px;
          border-radius: 12px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.2);
          flex-shrink: 0;
        ">
          <img 
            src="${escapeHtml(
              nft.ipfsUrl.replace(
                "ipfs://",
                "https://gateway.pinata.cloud/ipfs/"
              )
            )}" 
            alt="${escapeHtml(nft.name)}"
            style="width: 100%; height: 100%; object-fit: cover;"
            onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect fill=%22%2334C759%22 width=%22100%22 height=%22100%22/><text fill=%22%23fff%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2240%22>🎨</text></svg>'"
          />
        </div>
        
        <div style="flex: 1;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
            <div>
              <div style="font-size: 1.5em; font-weight: bold; color: #34C759; margin-bottom: 6px;">
                ${escapeHtml(nft.name)}
              </div>
              <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.9em;">
                Token ID: #${escapeHtml(nft.tokenId)}
              </div>
            </div>
            <div style="
              background: #34C759;
              color: #fff;
              border-radius: 50%;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
            ">${index}</div>
          </div>
          
          ${
            nft.description
              ? `
            <div style="
              color: rgba(255, 255, 255, 0.8);
              margin-bottom: 12px;
              line-height: 1.4;
            ">${escapeHtml(nft.description)}</div>
          `
              : ""
          }
          
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 12px;">
            <div style="background: rgba(0, 0, 0, 0.2); padding: 8px; border-radius: 8px; font-size: 0.85em;">
              <div style="color: rgba(255, 255, 255, 0.6); margin-bottom: 4px;">Contract</div>
              <div style="font-family: monospace; color: #34C759;">${escapeHtml(
                nft.contract.substring(0, 10)
              )}...</div>
            </div>
            <div style="background: rgba(0, 0, 0, 0.2); padding: 8px; border-radius: 8px; font-size: 0.85em;">
              <div style="color: rgba(255, 255, 255, 0.6); margin-bottom: 4px;">Minted</div>
              <div style="color: #34C759;">${new Date(
                nft.mintedAt
              ).toLocaleDateString()}</div>
            </div>
          </div>
          
          <div style="display: flex; gap: 8px;">
            <button onclick="terminal.executeCommand('omega view ${
              index - 1
            }')" style="
              background: #34C759;
              color: #fff;
              border: none;
              padding: 8px 16px;
              border-radius: 8px;
              cursor: pointer;
              font-weight: bold;
              font-size: 0.9em;
            ">View Details</button>
            <a href="${escapeHtml(
              nft.ipfsUrl.replace(
                "ipfs://",
                "https://gateway.pinata.cloud/ipfs/"
              )
            )}" target="_blank" style="
              background: rgba(0, 128, 255, 0.2);
              color: #0080FF;
              border: 1px solid #0080FF;
              padding: 8px 16px;
              border-radius: 8px;
              cursor: pointer;
              font-weight: bold;
              font-size: 0.9em;
              text-decoration: none;
              display: inline-block;
            ">View on IPFS</a>
            <a href="${escapeHtml(
              config.OMEGA_NETWORK.blockExplorerUrls[0]
            )}tx/${escapeHtml(nft.txHash)}" target="_blank" style="
              background: rgba(255, 149, 0, 0.2);
              color: #FF9500;
              border: 1px solid #FF9500;
              padding: 8px 16px;
              border-radius: 8px;
              cursor: pointer;
              font-weight: bold;
              font-size: 0.9em;
              text-decoration: none;
              display: inline-block;
            ">View TX</a>
          </div>
        </div>
      </div>
      
      <style>
        @keyframes shimmer {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }
      </style>
    </div>
  `;
}

/**
 * Omega command - main NFT minting command
 */
const omegaMintCommand: Command = {
  name: "omega",
  description: "Omega Network NFT minting",
  usage: "omega <mint|collection|view|contract|help> [params]",
  category: "nft",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    if (!subcommand || subcommand === "mint") {
      // Mint handler
      await handleMint(context, args);
      return;
    }

    switch (subcommand) {
      case "collection":
        await handleCollection(context, args);
        break;
      case "view":
        await handleView(context, args);
        break;
      case "contract":
        await handleContract(context, args);
        break;
      case "help":
        showHelp(context);
        break;
      default:
        showHelp(context);
        break;
    }
  },
};

/**
 * Mint handler - actual on-chain NFT minting
 * For now, accepts image URL and metadata as parameters (UI coming in Phase 15)
 */
async function handleMint(
  context: CommandContext,
  args: string[]
): Promise<void> {
  // Check if contract is configured
  if (!config.OMEGA_NFT_CONTRACT) {
    context.log("❌ NFT contract not configured", "error");
    context.log(
      "   Please set NEXT_PUBLIC_OMEGA_NFT_CONTRACT in environment variables",
      "info"
    );
    return;
  }

  // For now, since there's no UI, check if we have sufficient args for a test mint
  // Args format: omega mint <name> <description> <imageUrl>
  const name = args[2];
  const description = args[3];
  const imageUrl = args[4];

  // If no args provided, show instructions
  if (!name) {
    context.logHtml(`
      <div style="
        background: linear-gradient(135deg, rgba(52, 199, 89, 0.1), rgba(48, 209, 88, 0.1));
        border: 2px solid rgba(52, 199, 89, 0.3);
        border-radius: 16px;
        padding: 24px;
        margin: 16px 0;
      ">
        <div style="font-size: 2em; margin-bottom: 16px;">🎨 Mint NFT on Omega Network</div>
        
        <div style="background: rgba(52, 199, 89, 0.2); padding: 16px; border-radius: 12px; margin-bottom: 20px;">
          <div style="font-size: 1.3em; font-weight: bold; margin-bottom: 12px;">
            ✅ On-Chain Minting Available
          </div>
          <div style="line-height: 1.6;">
            NFT minting is now fully functional! You can mint NFTs on-chain immediately.
            The enhanced UI with image upload and trait editor is coming in Phase 15.
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <div style="font-size: 1.3em; font-weight: bold; margin-bottom: 12px; color: #34C759;">
            🚀 Quick Start Minting
          </div>
          <div style="background: rgba(0, 0, 0, 0.2); padding: 16px; border-radius: 8px; margin-bottom: 12px;">
            <div style="font-family: monospace; font-size: 0.9em; line-height: 1.8;">
              <strong>Usage:</strong> omega mint &lt;name&gt; &lt;description&gt; &lt;imageUrl&gt;<br/><br/>
              <strong>Example:</strong><br/>
              omega mint "My First NFT" "A beautiful digital artwork" "https://example.com/image.png"
            </div>
          </div>
          <div style="color: rgba(255, 255, 255, 0.8); font-size: 0.95em; line-height: 1.6;">
            <strong>Note:</strong> Image must be already uploaded to IPFS or accessible via URL.
            The full UI with built-in IPFS upload will be available in Phase 15.
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <div style="font-size: 1.3em; font-weight: bold; margin-bottom: 12px; color: #34C759;">
            🔄 Minting Process
          </div>
          <ol style="margin-left: 24px; line-height: 1.8;">
            <li>Connect your wallet (if not already connected)</li>
            <li>Prepare your image URL (IPFS recommended)</li>
            <li>Run mint command with name, description, and image URL</li>
            <li>Metadata will be uploaded to IPFS automatically</li>
            <li>Transaction will be sent to Omega Network</li>
            <li>NFT will be saved to your collection</li>
          </ol>
        </div>

        <div style="margin-bottom: 20px;">
          <div style="font-size: 1.3em; font-weight: bold; margin-bottom: 12px; color: #34C759;">
            📋 Contract Information
          </div>
          <div style="background: rgba(0, 0, 0, 0.2); padding: 12px; border-radius: 8px; font-family: monospace;">
            <div><strong>Contract:</strong> ${escapeHtml(
              config.OMEGA_NFT_CONTRACT || "Not configured"
            )}</div>
            <div><strong>Network:</strong> ${escapeHtml(
              config.OMEGA_NETWORK.chainName
            )}</div>
            <div><strong>Chain ID:</strong> ${
              config.OMEGA_NETWORK.chainId
            }</div>
          </div>
        </div>

        <div style="display: flex; gap: 8px;">
          <button onclick="terminal.executeCommand('omega collection')" style="
            background: #34C759;
            color: #fff;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            flex: 1;
          ">View My Collection</button>
          <button onclick="terminal.executeCommand('omega contract')" style="
            background: rgba(0, 128, 255, 0.8);
            color: #fff;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            flex: 1;
          ">Contract Info</button>
        </div>
      </div>
    `);
    return;
  }

  // Proceed with minting
  context.log("🎨 Starting NFT minting process...", "info");

  // Step 1: Check wallet connection
  const signer = await context.wallet.getSigner();
  if (!signer) {
    context.log("❌ Wallet not connected", "error");
    context.log('   Please connect your wallet first with: "connect"', "info");
    return;
  }

  try {
    context.log("📝 Preparing metadata...", "info");

    // Step 2: Create metadata
    const metadata: NFTMetadata = {
      name: name,
      description: description || "Minted on Omega Terminal",
      image: imageUrl || "",
      attributes: [],
    };

    // Validate metadata
    if (!metadata.image) {
      context.log("❌ Image URL is required", "error");
      return;
    }

    // Step 3: Upload metadata to IPFS
    context.log("☁️ Uploading metadata to IPFS...", "info");
    const metadataResult = await pinata.uploadMetadataToIPFS(metadata);

    if (!metadataResult.success) {
      context.log(
        `❌ Failed to upload metadata: ${metadataResult.error}`,
        "error"
      );
      return;
    }

    const metadataUrl = metadataResult.ipfsUrl;
    context.log(`✅ Metadata uploaded: ${metadataUrl}`, "success");

    // Step 4: Get user address
    const userAddress = await signer.getAddress();
    context.log(`📍 Minting to: ${userAddress}`, "info");

    // Step 5: Instantiate contract
    context.log("📜 Preparing contract call...", "info");
    const contract = new Contract(
      config.OMEGA_NFT_CONTRACT,
      config.OMEGA_NFT_ABI,
      signer
    );

    // Step 6: Call mint function
    context.log("⛏️ Sending mint transaction...", "info");
    const tx = await contract.mint(userAddress, metadataUrl);
    context.log(`🔄 Transaction sent: ${tx.hash}`, "info");

    // Step 7: Wait for confirmation
    context.log("⏳ Waiting for confirmation...", "info");
    const receipt = await tx.wait();

    // Step 8: Extract token ID from events
    let tokenId = "0";
    if (receipt.logs && receipt.logs.length > 0) {
      // Try to parse Transfer event to get token ID
      try {
        const transferEvent = receipt.logs.find((log: any) =>
          log.topics.includes(
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
          )
        );
        if (transferEvent && transferEvent.topics[3]) {
          tokenId = BigInt(transferEvent.topics[3]).toString();
        }
      } catch (error) {
        console.error("Error parsing token ID:", error);
      }
    }

    context.log(`✅ NFT Minted Successfully! Token ID: #${tokenId}`, "success");

    // Step 9: Save to collection
    const mintedNFT: MintedNFT = {
      tokenId,
      name: metadata.name,
      description: metadata.description,
      contract: config.OMEGA_NFT_CONTRACT,
      ipfsUrl: metadataUrl,
      txHash: tx.hash,
      mintedAt: new Date().toISOString(),
    };

    saveMintedNFT(mintedNFT);
    context.log("💾 NFT saved to your collection", "success");

    // Show success card
    context.logHtml(`
      <div style="
        background: linear-gradient(135deg, rgba(52, 199, 89, 0.2), rgba(48, 209, 88, 0.2));
        border: 2px solid rgba(52, 199, 89, 0.4);
        border-radius: 16px;
        padding: 24px;
        margin: 16px 0;
      ">
        <div style="font-size: 2em; margin-bottom: 16px;">✅ Minting Complete!</div>
        <div style="background: rgba(0, 0, 0, 0.2); padding: 16px; border-radius: 12px; margin-bottom: 16px;">
          <div style="margin-bottom: 12px;">
            <strong>Name:</strong> ${escapeHtml(metadata.name)}
          </div>
          <div style="margin-bottom: 12px;">
            <strong>Token ID:</strong> #${escapeHtml(tokenId)}
          </div>
          <div style="margin-bottom: 12px; word-break: break-all;">
            <strong>Transaction:</strong> ${escapeHtml(tx.hash)}
          </div>
          <div style="word-break: break-all;">
            <strong>Metadata:</strong> ${escapeHtml(metadataUrl)}
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button onclick="terminal.executeCommand('omega collection')" style="
            background: #34C759;
            color: #fff;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            flex: 1;
          ">View Collection</button>
          <a href="${escapeHtml(
            config.OMEGA_NETWORK.blockExplorerUrls[0]
          )}tx/${escapeHtml(tx.hash)}" target="_blank" style="
            background: rgba(0, 128, 255, 0.8);
            color: #fff;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            text-decoration: none;
            display: inline-block;
            flex: 1;
            text-align: center;
          ">View TX</a>
        </div>
      </div>
    `);
  } catch (error) {
    context.log(
      `❌ Minting failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      "error"
    );
    console.error("Minting error:", error);
  }
}

/**
 * Collection handler - display user's minted NFTs
 */
async function handleCollection(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const nfts = getMintedNFTs();

  if (nfts.length === 0) {
    context.logHtml(`
      <div style="
        background: rgba(255, 149, 0, 0.1);
        border: 2px solid rgba(255, 149, 0, 0.3);
        border-radius: 12px;
        padding: 24px;
        margin: 16px 0;
        text-align: center;
      ">
        <div style="font-size: 3em; margin-bottom: 16px;">🎨</div>
        <div style="font-size: 1.5em; font-weight: bold; margin-bottom: 12px;">
          Your NFT Collection is Empty
        </div>
        <div style="margin-bottom: 20px; line-height: 1.6;">
          Start minting your first NFT on Omega Network!
        </div>
        <button onclick="terminal.executeCommand('omega mint')" style="
          background: #34C759;
          color: #fff;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          font-size: 1.1em;
        ">Mint Your First NFT</button>
      </div>
    `);
    return;
  }

  context.log(`🎨 Your NFT Collection (${nfts.length} NFTs)`, "success");
  context.log("", "output");

  // Display NFTs
  for (let i = 0; i < nfts.length; i++) {
    context.logHtml(createCollectionCardHTML(nfts[i], i + 1));
  }
}

/**
 * View handler - display individual NFT details
 */
async function handleView(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const index = parseInt(args[2]);

  if (isNaN(index)) {
    context.log("❌ Please provide a valid NFT index", "error");
    context.log("   Usage: omega view <index>", "info");
    context.log(
      '   Use "omega collection" to see your NFTs with indices',
      "info"
    );
    return;
  }

  const nfts = getMintedNFTs();

  if (index < 0 || index >= nfts.length) {
    context.log(`❌ NFT index ${index} not found`, "error");
    context.log(
      `   You have ${nfts.length} NFTs (indices 0-${nfts.length - 1})`,
      "info"
    );
    return;
  }

  const nft = nfts[index];
  const imageUrl = nft.ipfsUrl.replace(
    "ipfs://",
    "https://gateway.pinata.cloud/ipfs/"
  );

  context.logHtml(`
    <div style="
      background: linear-gradient(135deg, rgba(52, 199, 89, 0.1), rgba(48, 209, 88, 0.1));
      border: 2px solid rgba(52, 199, 89, 0.3);
      border-radius: 16px;
      padding: 24px;
      margin: 16px 0;
    ">
      <div style="display: flex; gap: 24px; align-items: start;">
        <div style="flex: 0 0 300px;">
          <img 
            src="${escapeHtml(imageUrl)}" 
            alt="${escapeHtml(nft.name)}"
            style="
              width: 100%;
              border-radius: 12px;
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
            "
            onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22><rect fill=%22%2334C759%22 width=%22300%22 height=%22300%22/><text fill=%22%23fff%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2280%22>🎨</text></svg>'"
          />
        </div>
        
        <div style="flex: 1;">
          <div style="font-size: 2.2em; font-weight: bold; color: #34C759; margin-bottom: 16px;">
            ${escapeHtml(nft.name)}
          </div>
          
          ${
            nft.description
              ? `
            <div style="
              color: rgba(255, 255, 255, 0.8);
              margin-bottom: 20px;
              line-height: 1.6;
              font-size: 1.1em;
            ">${escapeHtml(nft.description)}</div>
          `
              : ""
          }
          
          <div style="
            background: rgba(0, 0, 0, 0.2);
            padding: 16px;
            border-radius: 12px;
            margin-bottom: 20px;
          ">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
              <div>
                <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.9em; margin-bottom: 6px;">Token ID</div>
                <div style="font-family: monospace; color: #34C759; font-weight: bold;">
                  #${escapeHtml(nft.tokenId)}
                </div>
              </div>
              <div>
                <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.9em; margin-bottom: 6px;">Minted</div>
                <div style="color: #34C759; font-weight: bold;">
                  ${new Date(nft.mintedAt).toLocaleString()}
                </div>
              </div>
              <div style="grid-column: 1 / -1;">
                <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.9em; margin-bottom: 6px;">Contract</div>
                <div style="font-family: monospace; color: #34C759; word-break: break-all;">
                  ${escapeHtml(nft.contract)}
                </div>
              </div>
              <div style="grid-column: 1 / -1;">
                <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.9em; margin-bottom: 6px;">IPFS URL</div>
                <div style="font-family: monospace; color: #34C759; word-break: break-all;">
                  ${escapeHtml(nft.ipfsUrl)}
                </div>
              </div>
            </div>
          </div>
          
          <div style="display: flex; gap: 8px;">
            <a href="${escapeHtml(imageUrl)}" target="_blank" style="
              background: #34C759;
              color: #fff;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              cursor: pointer;
              font-weight: bold;
              text-decoration: none;
              display: inline-block;
              flex: 1;
              text-align: center;
            ">View on IPFS</a>
            <a href="${escapeHtml(
              config.OMEGA_NETWORK.blockExplorerUrls[0]
            )}tx/${escapeHtml(nft.txHash)}" target="_blank" style="
              background: rgba(0, 128, 255, 0.8);
              color: #fff;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              cursor: pointer;
              font-weight: bold;
              text-decoration: none;
              display: inline-block;
              flex: 1;
              text-align: center;
            ">View Transaction</a>
          </div>
        </div>
      </div>
    </div>
  `);
}

/**
 * Contract handler - display contract information
 */
async function handleContract(
  context: CommandContext,
  args: string[]
): Promise<void> {
  context.logHtml(`
    <div style="
      background: linear-gradient(135deg, rgba(0, 128, 255, 0.1), rgba(0, 212, 255, 0.1));
      border: 2px solid rgba(0, 128, 255, 0.3);
      border-radius: 16px;
      padding: 24px;
      margin: 16px 0;
    ">
      <div style="font-size: 2em; margin-bottom: 16px;">📋 Omega NFT Contract</div>
      
      <div style="
        background: rgba(0, 0, 0, 0.2);
        padding: 20px;
        border-radius: 12px;
        margin-bottom: 20px;
        font-family: monospace;
      ">
        <div style="margin-bottom: 16px;">
          <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.9em; margin-bottom: 8px;">Contract Address</div>
          <div style="color: #0080FF; font-size: 1.2em; word-break: break-all;">
            ${escapeHtml(config.OMEGA_NFT_CONTRACT || "Not configured")}
          </div>
        </div>
        
        <div style="margin-bottom: 16px;">
          <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.9em; margin-bottom: 8px;">Network</div>
          <div style="color: #0080FF; font-size: 1.2em;">
            ${escapeHtml(config.OMEGA_NETWORK.chainName)}
          </div>
        </div>
        
        <div style="margin-bottom: 16px;">
          <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.9em; margin-bottom: 8px;">Chain ID</div>
          <div style="color: #0080FF; font-size: 1.2em;">
            ${config.OMEGA_NETWORK.chainId}
          </div>
        </div>
        
        <div>
          <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.9em; margin-bottom: 8px;">RPC URL</div>
          <div style="color: #0080FF; font-size: 1.2em; word-break: break-all;">
            ${escapeHtml(config.OMEGA_NETWORK.rpcUrls[0])}
          </div>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <div style="font-size: 1.3em; font-weight: bold; margin-bottom: 12px;">Contract Functions</div>
        <div style="background: rgba(0, 0, 0, 0.2); padding: 16px; border-radius: 8px; font-family: monospace; line-height: 1.8; font-size: 0.9em;">
          <div>• <strong>mint(address to, string tokenURI)</strong> - Mint new NFT</div>
          <div>• <strong>tokenURI(uint256 tokenId)</strong> - Get token metadata URI</div>
          <div>• <strong>balanceOf(address owner)</strong> - Get owner's NFT count</div>
          <div>• <strong>ownerOf(uint256 tokenId)</strong> - Get token owner</div>
          <div>• <strong>totalSupply()</strong> - Get total minted NFTs</div>
        </div>
      </div>

      <div style="display: flex; gap: 8px;">
        <a href="${escapeHtml(
          config.OMEGA_NETWORK.blockExplorerUrls[0]
        )}address/${escapeHtml(
    config.OMEGA_NFT_CONTRACT || ""
  )}" target="_blank" style="
          background: #0080FF;
          color: #fff;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          text-decoration: none;
          display: inline-block;
          flex: 1;
          text-align: center;
        ">View on Explorer</a>
        <button onclick="terminal.executeCommand('omega collection')" style="
          background: #34C759;
          color: #fff;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          flex: 1;
        ">My Collection</button>
      </div>
    </div>
  `);
}

/**
 * Show help message
 */
function showHelp(context: CommandContext): void {
  context.logHtml(`
    <div style="
      background: linear-gradient(135deg, rgba(52, 199, 89, 0.1), rgba(48, 209, 88, 0.1));
      border: 2px solid rgba(52, 199, 89, 0.3);
      border-radius: 16px;
      padding: 24px;
      margin: 16px 0;
    ">
      <div style="font-size: 2em; margin-bottom: 16px;">🎨 Omega NFT Commands</div>
      
      <div style="margin-bottom: 20px;">
        <strong style="color: #34C759;">Minting:</strong><br/>
        <code>omega mint</code> - Mint new NFT (UI coming in Phase 15)<br/>
        <code>omega contract</code> - View contract information
      </div>

      <div style="margin-bottom: 20px;">
        <strong style="color: #34C759;">Collection:</strong><br/>
        <code>omega collection</code> - View your minted NFTs<br/>
        <code>omega view &lt;index&gt;</code> - View specific NFT details
      </div>

      <div style="background: rgba(52, 199, 89, 0.1); padding: 12px; border-radius: 8px; margin-top: 16px;">
        <strong>💡 Quick Start:</strong><br/>
        1. Connect wallet: <code>connect</code><br/>
        2. View minting info: <code>omega mint</code><br/>
        3. View your collection: <code>omega collection</code>
      </div>
    </div>
  `);
}

/**
 * Mint Command - Shortcut for omega mint
 */
const mintCommand: Command = {
  name: "mint",
  description: "Mint NFT on Omega Network (shortcut for omega mint)",
  usage: "mint",
  category: "nft",
  handler: async (context: CommandContext, args: string[]) => {
    context.log("🎨 Opening Omega NFT Minting Interface...", "info");
    // Call omega mint handler
    await omegaMintCommand.handler(context, [
      "omega",
      "mint",
      ...args.slice(1),
    ]);
  },
};

/**
 * Export Omega NFT minting commands
 */
export const omegaMintCommands: Command[] = [omegaMintCommand, mintCommand];
