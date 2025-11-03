import { TextDecoder, TextEncoder } from "util";

if (!globalThis.TextEncoder) {
  Object.defineProperty(globalThis, "TextEncoder", {
    configurable: true,
    writable: true,
    value: TextEncoder,
  });
}

if (!globalThis.TextDecoder) {
  Object.defineProperty(globalThis, "TextDecoder", {
    configurable: true,
    writable: true,
    value: TextDecoder,
  });
}

if (!globalThis.BroadcastChannel) {
  class MockBroadcastChannel {
    public readonly name: string;

    public onmessage: ((event: MessageEvent) => void) | null = null;

    public onmessageerror: ((event: MessageEvent) => void) | null = null;

    constructor(name: string) {
      this.name = name;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    postMessage(_message: unknown): void {
      // no-op
    }

    close(): void {
      // no-op
    }

    addEventListener(): void {
      // no-op
    }

    removeEventListener(): void {
      // no-op
    }
  }

  Object.defineProperty(globalThis, "BroadcastChannel", {
    configurable: true,
    writable: true,
    value: MockBroadcastChannel,
  });

  (
    globalThis as unknown as { BroadcastChannel: typeof MockBroadcastChannel }
  ).BroadcastChannel = MockBroadcastChannel;
}
