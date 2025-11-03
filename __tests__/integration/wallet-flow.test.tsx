import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { WalletConnector } from "@/components/Wallet/WalletConnector";

type WalletState = {
  type: "metamask" | "session" | "imported" | null;
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string | null;
  chainId: number | null;
  error: string | null;
};

let walletState: WalletState = {
  type: null,
  address: null,
  isConnected: false,
  isConnecting: false,
  balance: null,
  chainId: null,
  error: null,
};

const connectMetaMaskMock = jest.fn(async () => {
  walletState = {
    ...walletState,
    isConnected: true,
    type: "metamask",
    address: "0x1111111111111111111111111111111111111111",
    balance: "1.25",
    error: null,
  };
  return true;
});

const createSessionWalletMock = jest.fn(async () => {
  walletState = {
    ...walletState,
    isConnected: true,
    type: "session",
    address: "0x2222222222222222222222222222222222222222",
    balance: "0.50",
    error: null,
  };
  return true;
});

const importSessionWalletMock = jest.fn(async (key: string) => {
  if (!key.startsWith("0x")) {
    walletState = { ...walletState, error: "Invalid key" };
    return false;
  }
  walletState = {
    ...walletState,
    isConnected: true,
    type: "imported",
    address: "0x3333333333333333333333333333333333333333",
    balance: "2.00",
    error: null,
  };
  return true;
});

const disconnectMock = jest.fn(async () => {
  walletState = {
    type: null,
    address: null,
    isConnected: false,
    isConnecting: false,
    balance: null,
    chainId: null,
    error: null,
  };
});

jest.mock("@/hooks/useWallet", () => ({
  useWallet: () => ({
    state: walletState,
    connectMetaMask: connectMetaMaskMock,
    createSessionWallet: createSessionWalletMock,
    importSessionWallet: importSessionWalletMock,
    disconnect: disconnectMock,
  }),
}));

describe("Wallet Flow Integration", () => {
  const resetState = () => {
    walletState = {
      type: null,
      address: null,
      isConnected: false,
      isConnecting: false,
      balance: null,
      chainId: null,
      error: null,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    resetState();
  });

  it("connects MetaMask wallet", async () => {
    const { rerender } = render(<WalletConnector />);

    await userEvent.click(screen.getByText("Connect MetaMask"));
    rerender(<WalletConnector />);

    await waitFor(() =>
      expect(screen.getByText("MetaMask")).toBeInTheDocument()
    );
    expect(screen.getByText("1.2500 OMEGA")).toBeInTheDocument();
  });

  it("creates session wallet", async () => {
    const { rerender } = render(<WalletConnector />);

    await userEvent.click(screen.getByText("Create New Wallet"));
    rerender(<WalletConnector />);

    await waitFor(() =>
      expect(screen.getByText("Session Wallet")).toBeInTheDocument()
    );
    expect(screen.getByText("0.5000 OMEGA")).toBeInTheDocument();
  });

  it("imports wallet from private key", async () => {
    const { rerender } = render(<WalletConnector />);

    await userEvent.click(screen.getByText("Show Import Options"));
    await userEvent.type(
      screen.getByPlaceholderText("0x..."),
      "0x" + "a".repeat(64)
    );
    await userEvent.click(screen.getByText("Import Wallet"));

    rerender(<WalletConnector />);

    await waitFor(() =>
      expect(screen.getByText("Imported Wallet")).toBeInTheDocument()
    );
  });

  it("disconnects wallet", async () => {
    walletState = {
      type: "metamask",
      address: "0x1111111111111111111111111111111111111111",
      isConnected: true,
      isConnecting: false,
      balance: "1.0",
      chainId: 1,
      error: null,
    };

    const { rerender } = render(<WalletConnector />);
    await userEvent.click(screen.getByText("Disconnect"));
    rerender(<WalletConnector />);

    await waitFor(() =>
      expect(screen.getByText("Connect Wallet")).toBeInTheDocument()
    );
  });
});
