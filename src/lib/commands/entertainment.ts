/**
 * Entertainment Commands Module
 *
 * Fun and interactive terminal animations and commands
 * Migrated from js/commands/entertainment.js to TypeScript
 *
 * Commands:
 * - rickroll: Rick Astley lyrics surprise
 * - matrix: Matrix digital rain animation
 * - hack: Elite hacker simulation
 * - disco: Disco mode animation
 * - fortune: Crypto fortune cookie
 * - ascii: Display ASCII art
 */

import type { Command, CommandContext } from "@/types/commands";
import { createUsageError } from "./command-output-helpers";

/**
 * Rick Roll Command
 * Never gonna give you up!
 */
export const rickrollCommand: Command = {
  name: "rickroll",
  description: "Never gonna give you up",
  category: "entertainment",
  handler: async (context: CommandContext): Promise<void> => {
    context.log("🎵 Never gonna give you up...", "info");
    context.log("🎵 Never gonna let you down...", "info");
    context.log("🎵 Never gonna run around and desert you...", "info");
    context.log("🎵 Never gonna make you cry...", "info");
    context.log("🎵 Never gonna say goodbye...", "info");
    context.log("🎵 Never gonna tell a lie and hurt you...", "info");
    context.log("", "info");
    context.logHtml(
      '<span style="color:#ff6699">💖 You just got Rick Rolled! 💖</span>'
    );
    context.log("🕺 Thanks for being a good sport!", "info");
  },
};

/**
 * Matrix Command
 * Digital rain animation
 */
export const matrixCommand: Command = {
  name: "matrix",
  description: "Matrix digital rain animation",
  category: "entertainment",
  handler: async (context: CommandContext): Promise<void> => {
    context.log("🔰 Initializing Matrix simulation...", "info");

    const matrixChars = ["0", "1", "Ω", "⛏️", "🔰", "💎", "⚡"];
    const maxLines = 15;

    // Use setTimeout loop instead of setInterval for better React compatibility
    for (let lineCount = 0; lineCount < maxLines; lineCount++) {
      await new Promise((resolve) => setTimeout(resolve, 150));

      let line = "";
      for (let i = 0; i < 60; i++) {
        line +=
          matrixChars[Math.floor(Math.random() * matrixChars.length)] + " ";
      }

      context.logHtml(
        `<span style="color:#00ff00;font-family:monospace">${line}</span>`
      );
    }

    context.log(
      "🔰 Matrix simulation complete. Welcome to the real world.",
      "success"
    );
  },
};

/**
 * Hack Command
 * Elite hacker simulation
 */
export const hackCommand: Command = {
  name: "hack",
  description: "Elite hacker simulation",
  category: "entertainment",
  handler: async (context: CommandContext): Promise<void> => {
    context.log("🏴‍☠️ Initiating elite hacker sequence...", "info");

    const hackSteps = [
      "🔍 Scanning network for vulnerabilities...",
      "🔓 Bypassing firewall (strength: VERY HIGH)...",
      "💾 Accessing mainframe database...",
      "🔐 Cracking encryption (4096-bit RSA)...",
      "📊 Extracting transaction data...",
      "⚡ Uploading mining virus to the blockchain...",
      "💰 Redirecting all OMEGA tokens to our wallet...",
      "🎭 Covering digital tracks...",
      "🚨 ALERT: Omega Terminal Security detected!",
      "🏃‍♂️ Initiating emergency disconnect...",
    ];

    for (let stepIndex = 0; stepIndex < hackSteps.length; stepIndex++) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      context.log(hackSteps[stepIndex], stepIndex < 8 ? "info" : "warning");
    }

    context.log("", "info");
    context.logHtml(
      '<span style="color:#ff3333">❌ HACK FAILED: Just kidding! This terminal is secure! 😄</span>'
    );
    context.log("💡 Remember: Always practice ethical hacking!", "info");
  },
};

/**
 * Disco Command
 * Disco mode animation
 */
export const discoCommand: Command = {
  name: "disco",
  description: "Disco mode animation",
  category: "entertainment",
  handler: async (context: CommandContext): Promise<void> => {
    context.log("🕺 DISCO MODE ACTIVATED! 🕺", "success");
    context.log("💃 Let's boogie! 💃", "info");

    const colors = [
      "#ff0000",
      "#00ff00",
      "#0000ff",
      "#ffff00",
      "#ff00ff",
      "#00ffff",
    ];
    const discoText = ["🕺", "💃", "🎵", "🎶", "✨", "🌟", "💫", "🎉"];
    const maxDisco = 20;

    for (let discoCount = 0; discoCount < maxDisco; discoCount++) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      let line = "";
      for (let i = 0; i < 40; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const char = discoText[Math.floor(Math.random() * discoText.length)];
        line += `<span style="color:${color}">${char}</span> `;
      }

      context.logHtml(line);
    }

    context.log("🎉 Disco mode complete! Thanks for dancing!", "success");
  },
};

/**
 * Fortune Command
 * Crypto fortune cookie
 */
export const fortuneCommand: Command = {
  name: "fortune",
  description: "Crypto fortune cookie",
  category: "entertainment",
  handler: async (context: CommandContext): Promise<void> => {
    const fortunes = [
      "🔮 Your mining rewards will multiply like rabbits in spring.",
      "🔮 A wise investor once said: 'HODL tight and mine right.'",
      "🔮 The blockchain reveals: great wealth comes to those who mine patiently.",
      "🔮 Your future holds many successful transactions and profitable trades.",
      "🔮 Beware of the paper hands - diamond hands bring diamond rewards.",
      "🔮 The stars align for your next big mining score this week.",
      "🔮 A generous faucet will soon overflow with unexpected tokens.",
      "🔮 Your wallet address will be blessed by the crypto gods.",
      "🔮 Smart contracts favor the bold - make that brave transaction.",
      "🔮 The blockchain whispers: 'Omega Terminal users are destined for greatness.'",
      "🔮 Your private key is safe, but your gains will be very public.",
      "🔮 Gas fees will bow before your transaction prowess.",
      "🔮 A mysterious airdrop approaches your horizon.",
      "🔮 The mining difficulty will decrease just when you need it most.",
      "🔮 Your seed phrase contains the seeds of future prosperity.",
    ];

    const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];

    context.log("🥠 Opening fortune cookie...", "info");

    await new Promise((resolve) => setTimeout(resolve, 1000));

    context.log("✨ Your fortune reveals:", "info");
    context.logHtml(
      `<span style="color:#ffd700;font-style:italic">${randomFortune}</span>`
    );
    context.log(
      "🥠 May your mining be fruitful and your HODLing strong!",
      "info"
    );
  },
};

/**
 * ASCII Command
 * Display ASCII art
 */
export const asciiCommand: Command = {
  name: "ascii",
  description: "Display ASCII art",
  usage: "ascii <omega|pickaxe|diamond|rocket>",
  category: "entertainment",
  handler: async (context: CommandContext, args: string[]): Promise<void> => {
    if (!args || args.length < 2) {
      context.log(
        "Available ASCII art: omega, pickaxe, diamond, rocket",
        "info"
      );
      const usageHtml = createUsageError("ascii <name>", [
        "ascii omega",
        "ascii rocket",
      ]);
      context.logHtml(usageHtml);
      return;
    }

    const artName = args[1].toLowerCase();
    let art = "";

    switch (artName) {
      case "omega":
        art = `
     ███████╗███╗   ███╗███████╗ ██████╗  █████╗ 
     ██╔════╝████╗ ████║██╔════╝██╔════╝ ██╔══██╗
     ███████╗██╔████╔██║█████╗  ██║  ███╗███████║
     ╚════██║██║╚██╔╝██║██╔══╝  ██║   ██║██╔══██║
     ███████║██║ ╚═╝ ██║███████╗╚██████╔╝██║  ██║
     ╚══════╝╚═╝     ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝`;
        break;

      case "pickaxe":
        art = `
                    ⛏️
                  ⛏️⛏️⛏️
                ⛏️⛏️⛏️⛏️⛏️
              ⛏️⛏️⛏️⛏️⛏️⛏️⛏️
                  ║║║
                  ║║║
                  ║║║
                  ║║║
        ⛏️ MINING IN PROGRESS ⛏️`;
        break;

      case "diamond":
        art = `
            💎
          💎💎💎
        💎💎💎💎💎
      💎💎💎💎💎💎💎
    💎💎💎💎💎💎💎💎💎
      💎💎💎💎💎💎💎
        💎💎💎💎💎
          💎💎💎
            💎`;
        break;

      case "rocket":
        art = `
           /\\
          /  \\
         / 🚀 \\
        /      \\
       /________\\
       |  OMEGA  |
       |  TO THE |
       |  MOON!  |
       |________|
         ||  ||
         ||  ||
        /||  ||\\
       /_||  ||_\\`;
        break;

      default:
        context.log(`Unknown ASCII art: ${artName}`, "error");
        context.log("Available: omega, pickaxe, diamond, rocket", "info");
        return;
    }

    context.logHtml(
      `<pre style="color:#00ffff;font-family:monospace;line-height:1.2">${art}</pre>`
    );
  },
};

/**
 * Export entertainment commands array
 */
export const entertainmentCommands: Command[] = [
  rickrollCommand,
  matrixCommand,
  hackCommand,
  discoCommand,
  fortuneCommand,
  asciiCommand,
];
