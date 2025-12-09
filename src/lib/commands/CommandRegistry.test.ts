import { CommandRegistry } from "./CommandRegistry";
import type { Command, CommandContext } from "@/types/commands";

const createMockContext = (): CommandContext => ({
  log: jest.fn(),
  logHtml: jest.fn(),
  clearTerminal: jest.fn(),
  executeCommand: jest.fn(),
  theme: {
    currentTheme: "omega" as any,
    setTheme: jest.fn(),
    toggleTheme: jest.fn(),
  },
  wallet: {
    state: {
      type: null,
      address: null,
      isConnected: false,
      isConnecting: false,
      balance: null,
      chainId: null,
      error: null,
    },
    connect: jest.fn(),
    disconnect: jest.fn(),
    createSessionWallet: jest.fn(),
    importSessionWallet: jest.fn(),
    getBalance: jest.fn(),
    getSigner: jest.fn(),
    getProvider: jest.fn(),
    addOmegaNetwork: jest.fn(),
  },
  config: {
    version: "test",
    chains: [],
    features: {},
  } as any,
  aiProvider: "gemini",
  setAiProvider: jest.fn(),
});

const createCommand = (overrides: Partial<Command> = {}): Command => ({
  name: "test",
  description: "Test command",
  handler: jest.fn(),
  ...overrides,
});

describe("CommandRegistry", () => {
  let registry: CommandRegistry;

  beforeEach(() => {
    registry = new CommandRegistry();
  });

  it("registers a command", () => {
    const command = createCommand();
    registry.register(command);

    expect(registry.getCommand("test")).toBe(command);
  });

  it("registers command with aliases", () => {
    const command = createCommand({ name: "help", aliases: ["?", "h"] });
    registry.register(command);

    expect(registry.getCommand("?")).toBe(command);
    expect(registry.getCommand("h")).toBe(command);
  });

  it("unregisters command and aliases", () => {
    const command = createCommand({ name: "wallet", aliases: ["w"] });
    registry.register(command);

    registry.unregister("wallet");

    expect(registry.getCommand("wallet")).toBeUndefined();
    expect(registry.getCommand("w")).toBeUndefined();
  });

  it("executes a registered command", async () => {
    const context = createMockContext();
    const handler = jest.fn();
    const command = createCommand({ name: "connect", handler });
    registry.register(command);

    await registry.execute("connect metamask", context);

    expect(handler).toHaveBeenCalledWith(context, ["connect", "metamask"]);
  });

  it("handles unknown command gracefully", async () => {
    const context = createMockContext();

    await registry.execute("unknown", context);

    expect(context.log).toHaveBeenCalledWith(
      "Unknown command: unknown",
      "error"
    );
    expect(context.log).toHaveBeenCalledWith(
      "Type 'help' to see available commands",
      "info"
    );
  });

  it("retrieves command by name", () => {
    const command = createCommand({ name: "balance" });
    registry.register(command);

    expect(registry.getCommand("balance")).toBe(command);
  });

  it("returns all unique commands", () => {
    const help = createCommand({ name: "help", aliases: ["?"] });
    const connect = createCommand({ name: "connect" });
    registry.register(help);
    registry.register(connect);

    expect(registry.getAllCommands()).toEqual(
      expect.arrayContaining([help, connect])
    );
  });

  it("filters commands by category", () => {
    const walletCommand = createCommand({
      name: "connect",
      category: "wallet",
    });
    const themeCommand = createCommand({
      name: "theme",
      category: "appearance",
    });
    registry.register(walletCommand);
    registry.register(themeCommand);

    const walletCommands = registry.getCommandsByCategory("wallet");
    expect(walletCommands).toHaveLength(1);
    expect(walletCommands[0]).toBe(walletCommand);
  });

  it("returns command names for autocomplete", () => {
    const command = createCommand({ name: "connect", aliases: ["login"] });
    registry.register(command);

    expect(registry.getCommandNames()).toEqual(
      expect.arrayContaining(["connect", "login"])
    );
  });

  it("returns unique command names without aliases", () => {
    const command = createCommand({ name: "connect", aliases: ["login"] });
    registry.register(command);

    expect(registry.getUniqueCommandNames()).toEqual(["connect"]);
  });
});
