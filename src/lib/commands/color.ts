/**
 * Color Palette Commands
 * Dynamic color scheme system for Omega Terminal
 * Based on vanilla js/commands/color-commands.js
 */

import type { Command, CommandContext } from "@/types/commands";

// Available color palettes
const COLOR_PALETTES: Record<string, string> = {
  red: "Crimson - Fierce and bold red tones",
  crimson: "Crimson - Fierce and bold red tones",
  anime: "Anime - Vibrant pink, purple and cyan",
  ocean: "Ocean - Deep blue and teal waves",
  blue: "Ocean - Deep blue and teal waves",
  forest: "Forest - Emerald green nature",
  green: "Forest - Emerald green nature",
  sunset: "Sunset - Orange, pink and purple sky",
  purple: "Purple - Royal violet mystique",
  violet: "Purple - Royal violet mystique",
  cyber: "Cyber - Neon cyan and magenta electric",
  neon: "Cyber - Neon cyan and magenta electric",
  gold: "Gold - Opulent gold and bronze luxury",
  luxury: "Gold - Opulent gold and bronze luxury",
  ice: "Ice - Glacial blue and silver frost",
  frost: "Ice - Glacial blue and silver frost",
  fire: "Fire - Blazing red, orange and yellow flames",
  flame: "Fire - Blazing red, orange and yellow flames",
  mint: "Mint - Fresh turquoise and teal",
  turquoise: "Mint - Fresh turquoise and teal",
  rose: "Rose - Soft pink and rose gold",
  pink: "Rose - Soft pink and rose gold",
  amber: "Amber - Warm amber and honey",
  honey: "Amber - Warm amber and honey",
  slate: "Slate - Cool gray and silver tech",
  silver: "Slate - Cool gray and silver tech",
  lavender: "Lavender - Soft purple and lilac",
  lilac: "Lavender - Soft purple and lilac",
  toxic: "Toxic - Radioactive lime green",
  radioactive: "Toxic - Radioactive lime green",
  light: "Light - White background with dark text and accents",
};

/**
 * Color command - Change color palette
 */
export const colorCommand: Command = {
  name: "color",
  aliases: ["palette"],
  description: "Change terminal color palette",
  usage: "color <palette-name|list|current|reset>",
  category: "theme",
  handler: (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    if (
      !subcommand ||
      subcommand === "list" ||
      subcommand === "all" ||
      subcommand === "help"
    ) {
      listPalettes(context);
      return;
    }

    switch (subcommand) {
      case "current":
      case "show":
        showCurrent(context);
        break;
      case "reset":
      case "default":
        resetPalette(context);
        break;
      default:
        // Try to set the palette
        setColorPalette(context, subcommand);
        break;
    }
  },
};

function setColorPalette(context: CommandContext, paletteName: string): void {
  const palette = paletteName.toLowerCase();

  // Validate palette
  if (!COLOR_PALETTES[palette]) {
    context.log(`❌ Invalid color palette: ${paletteName}`, "error");
    context.log('💡 Type "color list" to see available palettes', "info");
    return;
  }

  // Apply palette to body
  if (typeof document !== "undefined") {
    document.body.setAttribute("data-color-palette", palette);
  }

  // Store in localStorage
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("omega-color-palette", palette);
  }

  // Get palette description
  const description = COLOR_PALETTES[palette];

  context.log(`✅ Color palette changed to: ${palette}`, "success");
  context.log(`${description}`, "info");
  context.log("💡 Color palette works with all themes!", "info");
}

function getCurrentPalette(): string {
  if (typeof localStorage !== "undefined") {
    return localStorage.getItem("omega-color-palette") || "default";
  }
  return "default";
}

function listPalettes(context: CommandContext): void {
  context.log("", "output");
  context.log("═══════════════════════════════════════════════", "output");
  context.log("       OMEGA TERMINAL - COLOR PALETTES", "info");
  context.log("═══════════════════════════════════════════════", "output");
  context.log("", "output");

  const current = getCurrentPalette();

  context.log("VIBRANT COLORS:", "info");
  context.log("  color red          Crimson - Fierce red tones", "output");
  context.log(
    "  color anime        Anime - Vibrant pink/purple/cyan",
    "output"
  );
  context.log("  color cyber        Cyber - Neon cyan/magenta", "output");
  context.log("  color fire         Fire - Blazing flames", "output");
  context.log("  color toxic        Toxic - Radioactive lime", "output");
  context.log("", "output");

  context.log("COOL TONES:", "info");
  context.log("  color ocean        Ocean - Deep blue/teal", "output");
  context.log("  color ice          Ice - Glacial frost", "output");
  context.log("  color mint         Mint - Fresh turquoise", "output");
  context.log("  color slate        Slate - Cool gray/silver", "output");
  context.log("", "output");

  context.log("LIGHT MODE:", "info");
  context.log("  color light        Light - White background with dark text", "output");
  context.log("", "output");

  context.log("WARM TONES:", "info");
  context.log("  color sunset       Sunset - Orange/pink/purple", "output");
  context.log("  color rose         Rose - Soft pink/rose gold", "output");
  context.log("  color amber        Amber - Warm honey", "output");
  context.log("  color gold         Gold - Luxury gold/bronze", "output");
  context.log("", "output");

  context.log("MYSTICAL:", "info");
  context.log("  color purple       Purple - Royal violet", "output");
  context.log("  color lavender     Lavender - Soft lilac", "output");
  context.log("", "output");

  context.log("NATURE:", "info");
  context.log("  color forest       Forest - Emerald green", "output");
  context.log("", "output");

  context.log("COMMANDS:", "info");
  context.log("  color list         Show this list", "output");
  context.log("  color reset        Reset to default colors", "output");
  context.log("  color current      Show current palette", "output");
  context.log("", "output");

  if (current && current !== "default") {
    context.log(
      `Current palette: ${current} - ${COLOR_PALETTES[current] || ""}`,
      "success"
    );
  } else {
    context.log("Current palette: Default (Cyber Blue)", "info");
  }
  context.log("", "output");
  context.log("Color palettes work with ALL themes!", "success");
  context.log("Try: color anime, then theme executive", "info");
  context.log("", "output");
}

function showCurrent(context: CommandContext): void {
  const current = getCurrentPalette();

  if (current && current !== "default" && COLOR_PALETTES[current]) {
    context.log(`Current color palette: ${current}`, "success");
    context.log(`${COLOR_PALETTES[current]}`, "info");
  } else {
    context.log("Current color palette: Default (Cyber Blue)", "info");
  }
}

function resetPalette(context: CommandContext): void {
  if (typeof document !== "undefined") {
    document.body.removeAttribute("data-color-palette");
  }

  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("omega-color-palette");
  }

  context.log("✅ Color palette reset to default", "success");
  context.log("💡 Default is Cyber Blue theme", "info");
}

export const colorCommands: Command[] = [colorCommand];
