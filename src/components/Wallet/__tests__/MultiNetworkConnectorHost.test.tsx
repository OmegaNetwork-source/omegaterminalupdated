import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MultiNetworkConnectorHost } from "@/components/Wallet/MultiNetworkConnectorHost";
import { NETWORK_SELECTOR_EVENT } from "@/lib/wallet/networkSelector";

jest.mock("@/lib/wallet/detection", () => {
  const actual = jest.requireActual("@/lib/wallet/detection");
  return {
    ...actual,
    waitForWalletProvider: jest.fn(),
    forceMetaMaskProvider: jest.fn(),
    getEthereumProvider: jest.fn(),
  };
});

jest.mock("ethers", () => {
  const actual = jest.requireActual("ethers");
  return {
    ...actual,
    BrowserProvider: jest.fn(),
    formatEther: jest.fn(() => "0.0000"),
  };
});

describe("MultiNetworkConnectorHost", () => {
  const waitForWalletProvider = jest.requireMock("@/lib/wallet/detection")
    .waitForWalletProvider as jest.Mock;
  const forceMetaMaskProvider = jest.requireMock("@/lib/wallet/detection")
    .forceMetaMaskProvider as jest.Mock;
  const getEthereumProvider = jest.requireMock("@/lib/wallet/detection")
    .getEthereumProvider as jest.Mock;
  const BrowserProvider = jest.requireMock("ethers")
    .BrowserProvider as jest.Mock;

  const ethereumRequest = jest.fn(async ({ method }: { method: string }) => {
    if (method === "eth_requestAccounts") {
      return ["0xabc"];
    }
    if (method === "eth_chainId") {
      return "0x1";
    }
    return null;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    (window as typeof window & { ethereum?: any }).ethereum = {
      request: ethereumRequest,
    };

    waitForWalletProvider.mockResolvedValue({
      provider: (window as typeof window & { ethereum?: any }).ethereum,
      type: "metamask",
      name: "MetaMask",
      timedOut: false,
    });

    forceMetaMaskProvider.mockReturnValue(null);
    getEthereumProvider.mockReturnValue(
      (window as typeof window & { ethereum?: any }).ethereum
    );

    const signer = {
      getAddress: jest.fn().mockResolvedValue("0xabc"),
    };

    BrowserProvider.mockImplementation(() => ({
      getSigner: jest.fn().mockResolvedValue(signer),
      getBalance: jest.fn().mockResolvedValue(0n),
    }));
  });

  it("invokes ethereum provider when clicking an EVM network", async () => {
    render(<MultiNetworkConnectorHost />);

    const initializeExternalConnection = jest.fn().mockResolvedValue(undefined);

    await act(async () => {
      window.dispatchEvent(
        new CustomEvent(NETWORK_SELECTOR_EVENT, {
          detail: {
            log: jest.fn(),
            wallet: {
              initializeExternalConnection,
              addOmegaNetwork: jest.fn(),
              getBalance: jest.fn().mockResolvedValue("1.0"),
              state: {
                type: null,
                address: null,
                isConnected: false,
                isConnecting: false,
                balance: null,
                chainId: null,
                error: null,
              },
            },
            sound: undefined,
          },
        })
      );
    });

    expect(
      await screen.findByRole("button", { name: /Ethereum/i })
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Ethereum/i }));

    await waitFor(() => {
      expect(ethereumRequest).toHaveBeenCalledWith({
        method: "eth_requestAccounts",
      });
      expect(initializeExternalConnection).toHaveBeenCalled();
    });
  });
});
