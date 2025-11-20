import { Command, CommandContext } from "@/types/commands";
import { escapeHtml } from "@/lib/utils";
import type { ProfileData } from "@/types/profile";

const PROFILE_STORAGE_KEY = "omega-profile-data";

function defaultProfile(address: string | null): ProfileData {
  return {
    userInfo: {
      username: "",
      bio: "",
      profilePicture: "",
      ensName: "",
      walletAddress: address || "",
    },
    addressBook: [],
    apiKeys: [],
    scripts: [],
    preferences: {
      theme: "void",
      chatEnabled: true,
      fullscreenMode: false,
      notifications: true,
    },
    stats: {
      commandsExecuted: 0,
      sessionsCount: 0,
      lastActive: new Date().toISOString(),
    },
  };
}

function loadProfile(address?: string | null): ProfileData {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultProfile(address || null);
}

function saveProfile(profile: ProfileData): void {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

function handleOpen(ctx: CommandContext): void {
  ctx.log("Profile sidebar UI will be available in Phase 15.");
  ctx.log("Use 'profile view' to inspect your current profile data.");
}

function handleClose(ctx: CommandContext): void {
  ctx.log("Profile panel close is coming in Phase 15.");
}

function handleSet(ctx: CommandContext, args: string[]): void {
  const field = args[2];
  const value = args.slice(3).join(" ");
  if (!field || !value) {
    ctx.log("Usage: profile set <field> <value>", "error");
    return;
  }
  const address = ctx.wallet.state.address || null;
  const profile = loadProfile(address);
  if (field === "username") profile.userInfo.username = value;
  else if (field === "bio") profile.userInfo.bio = value;
  else if (field === "theme") profile.preferences.theme = value;
  else if (field === "ens") profile.userInfo.ensName = value;
  else {
    ctx.log("Unknown field. Supported: username, bio, theme, ens", "warn");
  }
  saveProfile(profile);
  ctx.log("Profile updated.");
}

function handleView(ctx: CommandContext): void {
  const address = ctx.wallet.state.address || null;
  const p = loadProfile(address);
  ctx.log("── Profile ──");
  ctx.log(`Username: ${p.userInfo.username || "(not set)"}`);
  ctx.log(`Bio: ${p.userInfo.bio || ""}`);
  ctx.log(`ENS: ${p.userInfo.ensName || ""}`);
  ctx.log(`Wallet: ${p.userInfo.walletAddress || address || "(none)"}`);
  ctx.log(
    `Contacts: ${p.addressBook.length} | API keys: ${p.apiKeys.length} | Scripts: ${p.scripts.length}`
  );
  ctx.log(
    `Preferences: theme=${p.preferences.theme}, chat=${
      p.preferences.chatEnabled ? "on" : "off"
    }, fullscreen=${p.preferences.fullscreenMode ? "on" : "off"}`
  );
}

function handleExport(ctx: CommandContext): void {
  const address = ctx.wallet.state.address || null;
  const p = loadProfile(address);
  const clone = {
    ...p,
    apiKeys: p.apiKeys.map((k) => ({ ...k, key: "********" })),
  };
  const json = JSON.stringify(clone, null, 2);
  // Safely embed the JSON into HTML and copy handler
  const safeForAttr = json.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  const html = `<div><button onclick="navigator.clipboard.writeText('${safeForAttr}')">Copy</button><pre>${escapeHtml(
    json
  )}</pre></div>`;
  ctx.logHtml(html);
}

function handleENS(ctx: CommandContext): void {
  ctx.log("ENS registry integration coming in Phase 15.");
}

function handleContacts(ctx: CommandContext): void {
  ctx.log("Address book management coming in Phase 15.");
}

function handleApiKeys(ctx: CommandContext): void {
  ctx.log("API key management coming in Phase 15.");
}

function handleScripts(ctx: CommandContext): void {
  ctx.log("Python script management coming in Phase 15.");
}

function handleHelp(ctx: CommandContext): void {
  ctx.log(
    "profile <open|close|set|view|export|ens|contacts|apikeys|scripts|help> — basic profile with localStorage"
  );
}

async function handler(ctx: CommandContext, args: string[]): Promise<void> {
  const sub = (args[1] || "").toLowerCase();
  switch (sub) {
    case "open":
      handleOpen(ctx);
      break;
    case "close":
      handleClose(ctx);
      break;
    case "set":
      handleSet(ctx, args);
      break;
    case "view":
      handleView(ctx);
      break;
    case "export":
      handleExport(ctx);
      break;
    case "ens":
      handleENS(ctx);
      break;
    case "contacts":
      handleContacts(ctx);
      break;
    case "apikeys":
      handleApiKeys(ctx);
      break;
    case "scripts":
      handleScripts(ctx);
      break;
    case "help":
    default:
      handleHelp(ctx);
  }
}

export const profileCommand: Command = {
  name: "profile",
  description: "User profile management",
  usage:
    "profile <open|close|set|view|export|ens|contacts|apikeys|scripts|help>",
  category: "user",
  handler,
};

export const profileCommands: Command[] = [profileCommand];
