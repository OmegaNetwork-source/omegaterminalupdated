import React from "react";
import { act, renderHook } from "@testing-library/react";

import { ThemeProvider } from "./ThemeProvider";
import { useTheme } from "@/hooks/useTheme";
import { THEME_DESCRIPTIONS, THEME_STORAGE_KEY } from "@/lib/themes";

const playModernThemeSound = jest.fn();

jest.mock("@/hooks/useSoundEffects", () => ({
  useSoundEffects: () => ({
    playModernUIThemeSound: playModernThemeSound,
    state: { isEnabled: true },
    playSound: jest.fn(),
    stopSound: jest.fn(),
    stopAllSounds: jest.fn(),
    setVolume: jest.fn(),
    setEnabled: jest.fn(),
  }),
}));

const wrapper: React.FC<{
  children: React.ReactNode;
  initialTheme?: string;
}> = ({ children, initialTheme }) => (
  <ThemeProvider initialTheme={initialTheme as any}>{children}</ThemeProvider>
);

describe("ThemeProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    document.body.className = "";
  });

  it("initializes with default theme", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.currentTheme).toBe("dark");
  });

  it("loads saved theme from localStorage", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "modern");
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.currentTheme).toBe("modern");
  });

  it("sets theme and updates body classes", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme("matrix");
    });

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("matrix");
    expect(document.body.classList.contains("theme-matrix")).toBe(true);
  });

  it("toggles through themes", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      const next = result.current.toggleTheme();
      expect(next).toBe("light");
    });

    expect(result.current.currentTheme).toBe("light");
  });

  it("returns theme descriptions", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.getThemeDescriptions()).toBe(THEME_DESCRIPTIONS);
  });

  it("plays sound when switching to modern theme", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme("modern");
    });

    expect(playModernThemeSound).toHaveBeenCalled();
  });

  it("ignores invalid themes gracefully", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme("invalid" as any);
    });

    expect(result.current.currentTheme).toBe("dark");
  });
});
