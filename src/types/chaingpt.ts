/**
 * ChainGPT API Type Definitions
 *
 * Type definitions for ChainGPT AI integration including:
 * - Chat API requests and responses
 * - Smart contract generation
 * - Contract auditing
 * - NFT generation
 * - Streaming responses
 */

/**
 * ChainGPT chat request configuration
 */
export interface ChainGPTChatRequest {
  /** Model to use for chat (e.g., 'gpt-4', 'smart_contract_generator') */
  model: string;
  /** Question or prompt for the AI */
  question: string;
  /** Whether to use chat history ('on' | 'off') */
  chatHistory: "on" | "off";
  /** SDK unique identifier for session tracking */
  sdkUniqueId?: string;
  /** Whether to use custom context injection */
  useCustomContext?: boolean;
  /** Custom context injection configuration */
  contextInjection?: {
    companyName?: string;
    companyDescription?: string;
    aiTone?: string;
    selectedTone?: string;
  };
}

/**
 * ChainGPT chat response
 */
export interface ChainGPTChatResponse {
  /** Success status flag */
  status?: boolean;
  /** Response data */
  data?: {
    /** Bot response text */
    bot: string;
    /** Alternative answer field */
    answer?: string;
  };
  /** Alternative success flag */
  success?: boolean;
  /** Direct answer field */
  answer?: string;
}

/**
 * ChainGPT smart contract generation request
 */
export interface ChainGPTContractRequest {
  /** Model to use (should be 'smart_contract_generator') */
  model: string;
  /** Contract generation prompt */
  question: string;
  /** Whether to use chat history */
  chatHistory: "on" | "off";
  /** SDK unique identifier */
  sdkUniqueId?: string;
}

/**
 * ChainGPT smart contract generation response
 */
export interface ChainGPTContractResponse {
  /** Success status */
  success: boolean;
  /** Response data */
  data: {
    /** Generated contract code */
    contract: string;
    /** Full response text */
    fullResponse: string;
  };
}

/**
 * ChainGPT smart contract auditor request
 */
export interface ChainGPTAuditorRequest {
  /** Model to use (should be 'smart_contract_auditor') */
  model: string;
  /** Contract code and audit instructions */
  question: string;
  /** Whether to use chat history */
  chatHistory: "on" | "off";
  /** SDK unique identifier */
  sdkUniqueId?: string;
}

/**
 * ChainGPT smart contract auditor response
 */
export interface ChainGPTAuditorResponse {
  /** Success status */
  success: boolean;
  /** Response data */
  data: {
    /** Audit report */
    audit: string;
    /** Full response text */
    fullResponse: string;
  };
}

/**
 * ChainGPT NFT generation request
 */
export interface ChainGPTNFTRequest {
  /** NFT generation prompt */
  prompt: string;
  /** AI model to use for generation */
  model: string;
  /** Image height in pixels */
  height: number;
  /** Image width in pixels */
  width: number;
  /** Wallet address for NFT minting */
  walletAddress: string;
  /** Number of NFTs to generate */
  amount: number;
  /** Blockchain chain ID */
  chainId: number;
  /** Enhancement instructions (optional) */
  enhance?: string;
}

/**
 * ChainGPT NFT generation response
 */
export interface ChainGPTNFTResponse {
  /** Success status */
  success: boolean;
  /** Response data */
  data?: {
    /** Array of generated NFT images */
    images: Array<{
      /** Image URL */
      url: string;
      /** Generation prompt */
      prompt: string;
      /** Model used */
      model: string;
      /** Generation timestamp */
      timestamp: string;
      /** Optional notes */
      note?: string;
    }>;
  };
  /** Error or status message */
  message?: string;
}

/**
 * Streaming response chunk structure
 */
export interface ChainGPTStreamChunk {
  /** Direct content field */
  content?: string;
  /** Data object with content */
  data?: {
    /** Content text */
    content: string;
    /** Bot response */
    bot?: string;
  };
  /** Text field */
  text?: string;
  /** Message field */
  message?: string;
  /** Answer field */
  answer?: string;
  /** Bot field */
  bot?: string;
}

/**
 * ChainGPT capability flags exposed to the client
 */
export interface ChainGPTCapabilities {
  /** Whether the ChainGPT integration is enabled */
  enabled: boolean;
  /** True when the server-side has a configured API key */
  hasServerKey: boolean;
  /** Feature availability map */
  features: {
    /** Chat and general Q&A support */
    chat: boolean;
    /** Streaming chat responses */
    stream: boolean;
    /** Smart contract generation support */
    contract: boolean;
    /** Contract auditing support */
    auditor: boolean;
    /** NFT generation support */
    nft: boolean;
  };
  /** Optional status or diagnostic message */
  message?: string;
}
