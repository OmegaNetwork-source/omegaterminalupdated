import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";

import { WalletProvider } from "./WalletProvider";
import { useWallet } from "@/hooks/useWallet";

const connectMetaMaskMock = jest.fn();
const createSessionWalletMock = jest.fn();
const importSessionWalletMock = jest.fn();
const getBalanceMock = jest.fn();
const addOmegaNetworkMock = jest.fn();
const getEthereumProviderMock = jest.fn();

const ethereumProvider = {
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
};

jest.mock("@/lib/wallet", () => ({
  connectMetaMask: (...args: unknown[]) => connectMetaMaskMock(...args),
  createSessionWallet: (...args: unknown[]) => createSessionWalletMock(...args),
  importSessionWallet: (...args: unknown[]) => importSessionWalletMock(...args),
  getBalance: (...args: unknown[]) => getBalanceMock(...args),
  addOmegaNetwork: (...args: unknown[]) => addOmegaNetworkMock(...args),
  getEthereumProvider: () => getEthereumProviderMock(),
}));

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <WalletProvider>{children}</WalletProvider>
);

describe("WalletProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    getEthereumProviderMock.mockReturnValue(ethereumProvider);
    ethereumProvider.request.mockResolvedValue([]);
    (window.location as any).reload = jest.fn();
  });

  it("initializes with disconnected state", () => {
    const { result } = renderHook(() => useWallet(), { wrapper });
    expect(result.current.state.isConnected).toBe(false);
  });

  it("connects MetaMask successfully", async () => {
    connectMetaMaskMock.mockResolvedValue({
      success: true,
      address: "0x1111111111111111111111111111111111111111",
      provider: {
        getSigner: jest.fn().mockResolvedValue({
          getAddress: jest
            .fn()
            .mockResolvedValue("0x1111111111111111111111111111111111111111"),
        }),
        getNetwork: jest.fn().mockResolvedValue({ chainId: 1 }),
        getBalance: jest.fn(),
      },
    });

    const { result } = renderHook(() => useWallet(), { wrapper });

    await act(async () => {
      const response = await result.current.connectMetaMask();
      expect(response.success).toBe(true);
    });

    expect(result.current.state.isConnected).toBe(true);
    expect(result.current.state.address).toBe(
      "0x1111111111111111111111111111111111111111"
    );
    expect(localStorage.getItem("walletType")).toBe("metamask");
    expect(ethereumProvider.on).toHaveBeenCalledWith(
      "accountsChanged",
      expect.any(Function)
    );
    expect(ethereumProvider.on).toHaveBeenCalledWith(
      "chainChanged",
      expect.any(Function)
    );
  });

  it("handles MetaMask connection error", async () => {
    connectMetaMaskMock.mockResolvedValue({
      success: false,
      error: "Failed to connect",
    });

    const { result } = renderHook(() => useWallet(), { wrapper });

    await act(async () => {
      const response = await result.current.connectMetaMask();
      expect(response.success).toBe(false);
    });

    expect(result.current.state.error).toBe("Failed to connect");
  });

  it("creates session wallet", async () => {
    createSessionWalletMock.mockResolvedValue({
      wallet: {},
      address: "0x2222222222222222222222222222222222222222",
      privateKey: "0x" + "a".repeat(64),
      provider: {},
    });

    const { result } = renderHook(() => useWallet(), { wrapper });

    await act(async () => {
      const success = await result.current.createSessionWallet();
      expect(success).toBe(true);
    });

    expect(result.current.state.type).toBe("session");
    expect(result.current.state.address).toBe(
      "0x2222222222222222222222222222222222222222"
    );
    expect(sessionStorage.getItem("omega-session-wallet-key")).toBeTruthy();
  });

  it("imports session wallet", async () => {
    importSessionWalletMock.mockResolvedValue({
      wallet: {},
      address: "0x3333333333333333333333333333333333333333",
      provider: {},
    });

    const { result } = renderHook(() => useWallet(), { wrapper });

    await act(async () => {
      const success = await result.current.importSessionWallet(
        "0x" + "b".repeat(64)
      );
      expect(success).toBe(true);
    });

    expect(result.current.state.type).toBe("imported");
    expect(result.current.state.address).toBe(
      "0x3333333333333333333333333333333333333333"
    );
  });

  it("disconnects wallet and clears storage", async () => {
    connectMetaMaskMock.mockResolvedValue({
      success: true,
      address: "0x4444444444444444444444444444444444444444",
      provider: {
        getSigner: jest.fn().mockResolvedValue({
          getAddress: jest
            .fn()
            .mockResolvedValue("0x4444444444444444444444444444444444444444"),
        }),
        getNetwork: jest.fn().mockResolvedValue({ chainId: 1 }),
      },
    });

    const { result } = renderHook(() => useWallet(), { wrapper });

    await act(async () => {
      await result.current.connectMetaMask();
      await result.current.disconnect();
    });

    expect(result.current.state.isConnected).toBe(false);
    expect(localStorage.getItem("walletType")).toBeNull();
    expect(sessionStorage.getItem("omega-session-wallet-key")).toBeNull();
    expect(ethereumProvider.removeListener).toHaveBeenCalledWith(
      "accountsChanged",
      expect.any(Function)
    );
  });

  it("retrieves balance", async () => {
    connectMetaMaskMock.mockResolvedValue({
      success: true,
      address: "0x5555555555555555555555555555555555555555",
      provider: {
        getSigner: jest.fn().mockResolvedValue({
          getAddress: jest
            .fn()
            .mockResolvedValue("0x5555555555555555555555555555555555555555"),
        }),
        getNetwork: jest.fn().mockResolvedValue({ chainId: 1 }),
      },
    });
    getBalanceMock.mockResolvedValue("1.0");

    const { result } = renderHook(() => useWallet(), { wrapper });

    await act(async () => {
      await result.current.connectMetaMask();
    });

    await act(async () => {
      const balance = await result.current.getBalance();
      expect(balance).toBe("1.0");
    });
  });

  it("adds Omega Network", async () => {
    addOmegaNetworkMock.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useWallet(), { wrapper });

    await act(async () => {
      const success = await result.current.addOmegaNetwork();
      expect(success).toBe(true);
    });

    expect(addOmegaNetworkMock).toHaveBeenCalledWith(ethereumProvider);
  });

  it("responds to accountsChanged events", async () => {
    connectMetaMaskMock.mockResolvedValue({
      success: true,
      address: "0x6666666666666666666666666666666666666666",
      provider: {
        getSigner: jest.fn().mockResolvedValue({
          getAddress: jest
            .fn()
            .mockResolvedValue("0x6666666666666666666666666666666666666666"),
        }),
        getNetwork: jest.fn().mockResolvedValue({ chainId: 1 }),
      },
    });

    const { result } = renderHook(() => useWallet(), { wrapper });

    await act(async () => {
      await result.current.connectMetaMask();
    });

    const handler = ethereumProvider.on.mock.calls.find(
      ([event]) => event === "accountsChanged"
    )?.[1] as (accounts: string[]) => void;
    handler?.(["0x7777777777777777777777777777777777777777"]);

    await waitFor(() =>
      expect(result.current.state.address).toBe(
        "0x7777777777777777777777777777777777777777"
      )
    );
  });

  it("responds to chainChanged events by reloading", async () => {
    connectMetaMaskMock.mockResolvedValue({
      success: true,
      address: "0x8888888888888888888888888888888888888888",
      provider: {
        getSigner: jest.fn().mockResolvedValue({
          getAddress: jest
            .fn()
            .mockResolvedValue("0x8888888888888888888888888888888888888888"),
        }),
        getNetwork: jest.fn().mockResolvedValue({ chainId: 1 }),
      },
    });

    const { result } = renderHook(() => useWallet(), { wrapper });

    await act(async () => {
      await result.current.connectMetaMask();
    });

    const handler = ethereumProvider.on.mock.calls.find(
      ([event]) => event === "chainChanged"
    )?.[1] as (chainId: string) => void;
    handler?.("0x2a");

    expect(window.location.reload).toHaveBeenCalled();
  });

  it("restores session from localStorage", async () => {
    localStorage.setItem("walletType", "metamask");
    ethereumProvider.request.mockResolvedValue([
      "0x9999999999999999999999999999999999999999",
    ]);
    connectMetaMaskMock.mockResolvedValue({
      success: true,
      address: "0x9999999999999999999999999999999999999999",
      provider: {
        getSigner: jest.fn().mockResolvedValue({
          getAddress: jest
            .fn()
            .mockResolvedValue("0x9999999999999999999999999999999999999999"),
        }),
        getNetwork: jest.fn().mockResolvedValue({ chainId: 1 }),
      },
    });

    renderHook(() => useWallet(), { wrapper });

    await waitFor(() => expect(connectMetaMaskMock).toHaveBeenCalled());
  });
});
