/**
 * Web3Telegram Integration Types
 *
 * Type definitions for iExec Web3Telegram integration including:
 * - Contact management for Telegram messaging
 * - Protected data handling for Chat IDs
 * - Message sending with price confirmation
 * - Access control and granting
 *
 * This integration relies on the iExec Web3Telegram SDK and DataProtector SDK
 * to enable secure, decentralized Telegram messaging through blockchain infrastructure.
 * Users protect their Telegram Chat IDs on-chain and grant specific addresses
 * permission to send them messages through secure computation.
 */

/**
 * Telegram contact information
 *
 * Represents a contact that can receive Web3Telegram messages.
 * Each contact is identified by their protected data address, which contains
 * their encrypted Telegram Chat ID stored on the iExec infrastructure.
 */
export interface TelegramContact {
  /** The iExec protected data address containing the recipient's Telegram Chat ID */
  protectedDataAddress: string;
  /** User-friendly label for the contact */
  label: string;
  /** Optional wallet address of the contact owner */
  walletAddress?: string;
  /** ISO timestamp when contact was added */
  addedAt: string;
  /** ISO timestamp of last message sent to this contact */
  lastMessageSent?: string;
}

/**
 * Protected data information for user's Telegram Chat ID
 *
 * Contains metadata about the user's protected Telegram Chat ID stored on-chain.
 * This protected data is created using the DataProtector SDK and can be used
 * by authorized addresses to send Telegram messages to the user.
 */
export interface ProtectedDataInfo {
  /** Protected data address on-chain */
  address: string;
  /** Name/label for the protected data */
  name: string;
  /** Wallet address of the owner */
  owner: string;
  /** ISO timestamp of creation */
  createdAt: string;
  /** Optional schema information */
  schema?: object;
  /** Number of addresses granted access */
  grantedAccessCount: number;
}

/**
 * Granted access information
 *
 * Represents simplified authorization grant metadata allowing a specific address
 * to send messages to the user's Telegram account. This is a subset of the full
 * DataProtector GrantedAccess object, containing only the essential fields.
 *
 * Note: This differs from the full GrantedAccess type returned by DataProtector SDK,
 * which includes additional fields like apprestrict, datasetrestrict, workerpoolrestrict,
 * requesterrestrict, salt, sign, and other order details.
 */
export interface GrantedAccessInfo {
  /** App address authorized to process the data */
  authorizedApp: string;
  /** User address authorized to send messages */
  authorizedUser: string;
  /** ISO timestamp when access was granted */
  grantedAt: string;
  /** Number of times access can be used */
  numberOfAccess: number;
}

/**
 * Parameters for sending a Telegram message
 *
 * Specifies all required and optional parameters for sending a message through
 * Web3Telegram. Price parameters allow control over the maximum cost of message
 * delivery through the iExec infrastructure.
 */
export interface SendMessageParams {
  /** Recipient's protected data address */
  protectedData: string;
  /** Message content to send */
  telegramContent: string;
  /** Display name of sender */
  senderName: string;
  /** Optional tracking label */
  label?: string;
  /** Maximum price for data (in nRLC) */
  dataMaxPrice?: number;
  /** Maximum price for app execution (in nRLC) */
  appMaxPrice?: number;
  /** Maximum price for workerpool (in nRLC) */
  workerpoolMaxPrice?: number;
}

/**
 * Result of sending a message
 *
 * Contains the outcome of a message send operation, including task tracking
 * information for monitoring delivery. Note: sendTelegram() returns only a
 * taskId, not a transaction hash.
 */
export interface SendMessageResult {
  /** Whether message was sent successfully */
  success: boolean;
  /** iExec task ID for tracking */
  taskId?: string;
  /** Error message if failed */
  error?: string;
}

/**
 * User configuration for Web3Telegram
 *
 * Stores user preferences for message sending including default values
 * for sender name, pricing, and automatic price confirmation settings.
 */
export interface TelegramConfig {
  /** Default sender name for messages */
  defaultSenderName: string;
  /** Default maximum price for sending (in nRLC) */
  defaultMaxPrice: number;
  /** Whether to auto-confirm prices below threshold */
  autoConfirmPrice: boolean;
  /** Threshold for auto-confirmation (in nRLC) */
  priceConfirmThreshold: number;
}

/**
 * Global state for Web3Telegram system
 *
 * Represents the complete state of the Web3Telegram integration including
 * initialization status, user data, contacts, access grants, configuration,
 * and operation status.
 */
export interface TelegramState {
  /** Whether SDK is initialized */
  isInitialized: boolean;
  /** User's protected Chat ID data */
  userProtectedData: ProtectedDataInfo | null;
  /** Array of saved contacts */
  contacts: TelegramContact[];
  /** Array of addresses with access to message user */
  grantedAccess: GrantedAccessInfo[];
  /** User configuration */
  config: TelegramConfig;
  /** Whether an operation is in progress */
  isLoading: boolean;
  /** Current error message */
  error: string | null;
}

/**
 * Parameters for creating protected data
 *
 * Specifies the required information to create a new protected data entry
 * containing the user's Telegram Chat ID on the iExec infrastructure.
 */
export interface CreateProtectedDataParams {
  /** Telegram Chat ID from @IExecWeb3TelegramBot */
  chatId: string;
  /** Name/label for the protected data */
  name: string;
}

/**
 * Result of creating protected data
 *
 * Contains the outcome of a protected data creation operation including
 * the address where the data was stored and transaction details.
 */
export interface CreateProtectedDataResult {
  /** Whether creation succeeded */
  success: boolean;
  /** Address of created protected data */
  protectedDataAddress?: string;
  /** Transaction hash */
  txHash?: string;
  /** Error message if failed */
  error?: string;
}

