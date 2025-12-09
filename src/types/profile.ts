/**
 * Profile system type definitions
 * Stored in localStorage under key 'omega-profile-data'
 */

export interface ProfileContact {
  name: string;
  address: string;
  network: string;
  notes?: string;
}

export interface ProfileApiKey {
  service: string;
  key: string;
  isActive: boolean;
}

export interface ProfileScript {
  name: string;
  code: string;
  language: string;
  createdAt: string;
}

export interface ProfileData {
  userInfo: {
    username: string;
    bio: string;
    profilePicture: string;
    ensName: string;
    walletAddress: string;
  };
  addressBook: ProfileContact[];
  apiKeys: ProfileApiKey[];
  scripts: ProfileScript[];
  preferences: {
    theme: string;
    chatEnabled: boolean;
    fullscreenMode: boolean;
    notifications: boolean;
  };
  stats: {
    commandsExecuted: number;
    sessionsCount: number;
    lastActive: string;
  };
}

export interface ENSRegistration {
  name: string;
  address: string;
  status: "pending" | "registered" | "failed";
  txHash?: string;
}

export {};
