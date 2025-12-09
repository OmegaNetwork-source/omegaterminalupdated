import "@testing-library/jest-dom";
import "whatwg-fetch";

const disableMsw = process.env.JEST_DISABLE_MSW === "true";

let closeMockServer: () => void;
let resetMockServer: () => void;
let setupMockServer: () => void;

if (!disableMsw) {
  // Load MSW handlers after polyfills to ensure required globals exist
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mswHandlers =
    require("./__tests__/utils/msw-handlers") as typeof import("./__tests__/utils/msw-handlers");

  closeMockServer = mswHandlers.closeMockServer;
  resetMockServer = mswHandlers.resetMockServer;
  setupMockServer = mswHandlers.setupMockServer;
} else {
  closeMockServer = jest.fn();
  resetMockServer = jest.fn();
  setupMockServer = jest.fn();
}

// --------------------------------------------------------------------------------
// Browser API mocks
// --------------------------------------------------------------------------------

if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;

  readonly rootMargin = "0px";

  readonly thresholds = [0];

  constructor(private readonly callback: IntersectionObserverCallback) {}

  disconnect(): void {
    // no-op
  }

  observe(target: Element): void {
    this.callback(
      [
        {
          isIntersecting: true,
          intersectionRatio: 1,
          target,
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRect: target.getBoundingClientRect(),
          rootBounds: null,
          time: Date.now(),
        },
      ],
      this
    );
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  unobserve(): void {
    // no-op
  }
}

class MockResizeObserver implements ResizeObserver {
  constructor(private readonly callback: ResizeObserverCallback) {}

  disconnect(): void {
    // no-op
  }

  observe(target: Element): void {
    this.callback(
      [
        {
          target,
          contentRect: target.getBoundingClientRect(),
          borderBoxSize: [],
          contentBoxSize: [],
          devicePixelContentBoxSize: [],
        },
      ],
      this
    );
  }

  unobserve(): void {
    // no-op
  }
}

if (!("IntersectionObserver" in window)) {
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    value: MockIntersectionObserver,
  });
}

if (!("ResizeObserver" in window)) {
  Object.defineProperty(window, "ResizeObserver", {
    writable: true,
    value: MockResizeObserver,
  });
}

const createStorageMock = () => {
  const store = new Map<string, string>();

  return {
    clear: jest.fn(() => store.clear()),
    getItem: jest.fn((key: string) =>
      store.has(key) ? store.get(key) ?? null : null
    ),
    key: jest.fn((index: number) => Array.from(store.keys())[index] ?? null),
    removeItem: jest.fn((key: string) => store.delete(key)),
    setItem: jest.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    get length() {
      return store.size;
    },
  } satisfies Storage;
};

Object.defineProperty(window, "localStorage", {
  value: createStorageMock(),
  writable: true,
});

Object.defineProperty(window, "sessionStorage", {
  value: createStorageMock(),
  writable: true,
});

Object.defineProperty(globalThis, "crypto", {
  value: {
    getRandomValues: (buffer: ArrayBufferView) => {
      const view = buffer as Uint8Array;
      for (let i = 0; i < view.length; i += 1) {
        view[i] = Math.floor(Math.random() * 256);
      }
      return view;
    },
    randomUUID: () =>
      "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }),
  },
  writable: true,
});

class MockAudioContext {
  public close = jest.fn();

  public createGain = jest.fn(() => ({ connect: jest.fn() }));

  public createBufferSource = jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  }));

  public resume = jest.fn();

  public suspend = jest.fn();
}

Object.defineProperty(window, "AudioContext", {
  writable: true,
  value: MockAudioContext,
});

Object.defineProperty(window, "webkitAudioContext", {
  writable: true,
  value: MockAudioContext,
});

// --------------------------------------------------------------------------------
// Environment variables for deterministic tests
// --------------------------------------------------------------------------------

process.env.NEXT_PUBLIC_OMEGA_RPC_URL =
  process.env.NEXT_PUBLIC_OMEGA_RPC_URL ?? "http://localhost:8545";
process.env.NEXT_PUBLIC_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ??
  "0x0000000000000000000000000000000000000000";
process.env.NEXT_PUBLIC_SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.testnet.solana.com";
process.env.NEXT_PUBLIC_NEAR_RPC_URL =
  process.env.NEXT_PUBLIC_NEAR_RPC_URL ?? "https://rpc.testnet.near.org";
process.env.NEXT_PUBLIC_GEMINI_API_KEY =
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? "test-gemini-key";
process.env.NEXT_PUBLIC_RELAY_ENDPOINT =
  process.env.NEXT_PUBLIC_RELAY_ENDPOINT ?? "https://relayer.test";

// --------------------------------------------------------------------------------
// Console noise suppression for expected error scenarios in tests
// --------------------------------------------------------------------------------

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {
    // Intentionally swallow expected React act() warnings & network errors in tests.
  });
  jest.spyOn(console, "warn").mockImplementation(() => {
    // Silence noisy warnings that are asserted in specific tests when needed.
  });
  setupMockServer();
});

afterEach(() => {
  resetMockServer();
});

afterAll(() => {
  closeMockServer();
  (console.error as jest.Mock).mockRestore();
  (console.warn as jest.Mock).mockRestore();
});

// --------------------------------------------------------------------------------
// Global test helpers for wallet and contract mocking
// --------------------------------------------------------------------------------

const createMockProvider = () => ({
  request: jest.fn(),
  getSigner: jest.fn(() => ({
    getAddress: jest
      .fn()
      .mockResolvedValue("0x0000000000000000000000000000000000000001"),
    sendTransaction: jest.fn(),
  })),
  getNetwork: jest.fn().mockResolvedValue({ chainId: 1 }),
  getBalance: jest.fn().mockResolvedValue({ toString: () => "0" }),
});

const createMockSigner = () => ({
  getAddress: jest
    .fn()
    .mockResolvedValue("0x0000000000000000000000000000000000000001"),
  sendTransaction: jest
    .fn()
    .mockResolvedValue({ hash: "0xhash", wait: jest.fn() }),
});

const createMockContract = () => ({
  functions: {},
  connect: jest.fn().mockReturnThis(),
});

Object.assign(globalThis, {
  createMockProvider,
  createMockSigner,
  createMockContract,
});
