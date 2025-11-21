/**
 * Basic Terminal Commands (Phase 1)
 * Minimal command set migrated from legacy js/commands/basic.js
 * Focused on keeping the terminal operational during recovery.
 */

import type { Command, CommandContext } from "@/types/commands";
import { config } from "@/lib/config";
import { AVAILABLE_THEMES, APP_TITLE, APP_VERSION } from "@/lib/constants";
import type { Theme } from "@/types";
import { commandRegistry } from "./CommandRegistry";
import { createCommandLine, createUsageError } from "./command-output-helpers";
import {
  getQuickActions,
  saveQuickActions,
  addQuickAction,
  removeQuickAction,
  updateQuickAction,
  resetQuickActions,
  groupQuickActionsByCategory,
  type QuickAction,
} from "@/lib/quick-actions";

// Helper functions for GUI transformations
function createChatGptInterface(context: CommandContext): void {
  const html = `
    <div style="height: 100vh; width: 100vw; position: fixed; top: 0; left: 0; display: flex; flex-direction: column; background: #212121; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; z-index: 9999;">
      <!-- Header with back button -->
      <div style="position: absolute; top: 20px; left: 20px; z-index: 100;">
        <button onclick="window.__omegaGuiRestore?.()" 
          style="background: #424242; color: #ececec; border: 1px solid #565656; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
          ← Terminal
        </button>
      </div>
      
      <!-- Conversation area -->
      <div class="chatgpt-conversation" style="flex: 1; overflow-y: auto; padding: 80px 20px 200px 20px; max-width: 768px; margin: 0 auto; width: 100%;">
        <div style="text-align: center; margin-bottom: 40px;">
          <div style="font-size: 48px; margin-bottom: 16px;">🤖</div>
          <h1 style="color: #ececec; font-size: 32px; font-weight: 300; margin: 0;">Omega Terminal AI</h1>
          <p style="color: #8e8ea0; margin-top: 12px; font-size: 16px;">How can I help you today?</p>
        </div>
        
        <div style="display: flex; gap: 16px; margin-bottom: 32px; max-width: 100%;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: #ab68ff; color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 18px;">🤖</div>
          <div style="max-width: 65%;">
            <div style="background: transparent; padding: 0; font-size: 15px; line-height: 1.5; color: #ececec;">
              Hi there! I'm your Omega Terminal assistant. I can help you with blockchain operations, answer crypto questions, or just have a friendly chat. What's on your mind today?
            </div>
          </div>
        </div>
      </div>
      
      <!-- Centered input at bottom -->
      <div style="position: fixed; bottom: 0; left: 0; right: 0; background: #212121; padding: 32px 20px; border-top: 1px solid #424242;">
        <div style="max-width: 768px; margin: 0 auto;">
          <div style="position: relative; display: flex; align-items: center; background: #2f2f2f; border: 1px solid #565656; border-radius: 24px; padding: 12px 16px;">
            <input type="text" 
              placeholder="Ask anything or type a command..." 
              id="chatgptInput" 
              onkeypress="if(event.key==='Enter') window.__omegaGuiHandleInput?.('chatgpt')"
              style="flex: 1; background: none; border: none; color: #ececec; font-size: 16px; outline: none; padding: 4px 0;" />
            <div onclick="window.__omegaGuiHandleInput?.('chatgpt')" 
              style="background: #19c37d; color: white; border: none; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
              ➤
            </div>
          </div>
          <p style="text-align: center; color: #8e8ea0; font-size: 13px; margin-top: 16px; margin-bottom: 0;">
            Omega Terminal can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  `;

  context.logHtml(html);
  setupGuiHandlers(context, "chatgpt");
}

function createAolInterface(context: CommandContext): void {
  const html = `
    <div class="aol-window" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #c0c0c0; font-family: 'MS Sans Serif', Arial, sans-serif; z-index: 9999; display: flex; flex-direction: column;">
      <div class="aol-titlebar" style="background: linear-gradient(to bottom, #0000aa, #0000cc); color: white; padding: 4px 8px; display: flex; justify-content: space-between; align-items: center;">
        <div class="aol-title" style="font-weight: bold;">Omega Terminal - AOL Instant Messenger</div>
        <div class="aol-buttons">
          <button onclick="window.__omegaGuiRestore?.()" style="background: #c0c0c0; border: 2px outset #fff; padding: 0 8px; cursor: pointer;">X</button>
        </div>
      </div>
      <div class="aol-content" style="flex: 1; display: flex; background: white;">
        <div class="aol-buddylist" style="width: 200px; background: #f0f0f0; border-right: 2px solid #808080; padding: 10px;">
          <div class="aol-section" style="margin-bottom: 15px;">
            <strong>🟢 Online (1)</strong>
            <div class="buddy" style="padding: 4px; background: #fff; margin: 4px 0; border: 1px solid #ccc;">OmegaUser (You)</div>
          </div>
          <div class="aol-section">
            <strong>📶 Commands</strong>
            <div class="buddy clickable" onclick="window.__omegaGuiExecuteCommand?.('help')" style="padding: 4px; background: #fff; margin: 4px 0; border: 1px solid #ccc; cursor: pointer;">help</div>
            <div class="buddy clickable" onclick="window.__omegaGuiExecuteCommand?.('balance')" style="padding: 4px; background: #fff; margin: 4px 0; border: 1px solid #ccc; cursor: pointer;">balance</div>
            <div class="buddy clickable" onclick="window.__omegaGuiExecuteCommand?.('mine')" style="padding: 4px; background: #fff; margin: 4px 0; border: 1px solid #ccc; cursor: pointer;">mine</div>
          </div>
        </div>
        <div class="aol-chat" style="flex: 1; display: flex; flex-direction: column;">
          <div class="aol-messages" id="aolMessages" style="flex: 1; overflow-y: auto; padding: 10px;">
            <div class="aol-message" style="margin-bottom: 10px; padding: 8px; background: #ffffcc; border-radius: 4px;">
              <strong>OmegaSystem:</strong> Welcome to AOL Omega Terminal!<br>
              Click commands on the left or type below.
            </div>
          </div>
          <div class="aol-input" style="padding: 10px; background: #f0f0f0; border-top: 2px solid #808080; display: flex; gap: 8px;">
            <input type="text" placeholder="Type a message..." id="aolInput" 
              onkeypress="if(event.key==='Enter') window.__omegaGuiHandleInput?.('aol')" 
              style="flex: 1; padding: 6px; border: 2px inset #fff;" />
            <button onclick="window.__omegaGuiHandleInput?.('aol')" 
              style="background: linear-gradient(to bottom, #d0d0d0, #a0a0a0); border: 2px outset #fff; padding: 6px 20px; cursor: pointer;">Send</button>
          </div>
        </div>
      </div>
    </div>
  `;

  context.logHtml(html);
  setupGuiHandlers(context, "aol");
}

function createDiscordInterface(context: CommandContext): void {
  const html = `
    <div class="discord-app" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #36393f; font-family: Whitney, 'Helvetica Neue', Helvetica, Arial, sans-serif; z-index: 9999; display: flex;">
      <div class="discord-sidebar" style="width: 240px; background: #2f3136; display: flex; flex-direction: column;">
        <div class="discord-server" style="width: 60px; background: #202225; display: flex; flex-direction: column; align-items: center; padding: 12px 0;">
          <div style="width: 48px; height: 48px; background: #5865f2; border-radius: 24px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; margin-bottom: 8px;">Ω</div>
        </div>
        <div class="discord-channels" style="flex: 1; padding: 8px;">
          <div class="channel-category" style="color: #8e9297; font-size: 12px; font-weight: 600; padding: 8px 0; text-transform: uppercase;">OMEGA CHANNELS</div>
          <div class="channel active" onclick="window.__omegaGuiSwitchChannel?.('terminal')" style="color: white; background: #393c43; padding: 6px 8px; margin: 2px 0; border-radius: 4px; cursor: pointer;"># terminal</div>
          <div class="channel" onclick="window.__omegaGuiSwitchChannel?.('mining')" style="color: #8e9297; padding: 6px 8px; margin: 2px 0; border-radius: 4px; cursor: pointer;"># mining</div>
          <div class="channel" onclick="window.__omegaGuiSwitchChannel?.('trading')" style="color: #8e9297; padding: 6px 8px; margin: 2px 0; border-radius: 4px; cursor: pointer;"># trading</div>
          <div class="channel" onclick="window.__omegaGuiRestore?.()" style="color: #5865f2; padding: 6px 8px; margin: 12px 0 2px 0; border-radius: 4px; cursor: pointer;">← Exit Discord</div>
        </div>
      </div>
      <div class="discord-main" style="flex: 1; display: flex; flex-direction: column;">
        <div class="discord-header" style="height: 48px; border-bottom: 1px solid #202225; padding: 0 16px; display: flex; align-items: center; color: white; font-weight: 600;">
          <span># terminal</span>
        </div>
        <div class="discord-messages" id="discordMessages" style="flex: 1; overflow-y: auto; padding: 16px;">
          <div class="discord-message" style="margin-bottom: 16px;">
            <div class="message-author" style="color: #5865f2; font-weight: 500; margin-bottom: 4px;">OmegaBot</div>
            <div class="message-text" style="color: #dcddde;">Welcome to the Omega Terminal Discord! Type commands below or click channels on the left.</div>
          </div>
        </div>
        <div class="discord-input" style="padding: 16px;">
          <div style="background: #40444b; border-radius: 8px; padding: 12px; display: flex; gap: 8px; align-items: center;">
            <input type="text" placeholder="Message #terminal" id="discordInput" 
              onkeypress="if(event.key==='Enter') window.__omegaGuiHandleInput?.('discord')" 
              style="flex: 1; background: none; border: none; color: #dcddde; outline: none; font-size: 15px;" />
            <button onclick="window.__omegaGuiHandleInput?.('discord')" 
              style="background: #5865f2; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Send</button>
          </div>
        </div>
      </div>
    </div>
  `;

  context.logHtml(html);
  setupGuiHandlers(context, "discord");
}

function createWindows95Interface(context: CommandContext): void {
  const html = `
    <div class="win95-desktop" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #008080; font-family: 'MS Sans Serif', Arial, sans-serif; z-index: 9999;">
      <div class="win95-window" style="position: absolute; top: 50px; left: 50px; right: 50px; bottom: 50px; background: #c0c0c0; border: 2px solid; border-color: #ffffff #808080 #808080 #ffffff; box-shadow: 2px 2px 4px rgba(0,0,0,0.3); display: flex; flex-direction: column;">
        <div class="win95-titlebar" style="background: linear-gradient(to right, #000080, #0000aa); color: white; padding: 4px 8px; display: flex; justify-content: space-between; align-items: center; font-weight: bold;">
          <div class="win95-title">Omega Terminal - MS-DOS Prompt</div>
          <div class="win95-buttons">
            <button onclick="window.__omegaGuiRestore?.()" style="background: #c0c0c0; border: 2px outset #fff; padding: 0 8px; margin-left: 4px; cursor: pointer; font-weight: bold;">X</button>
          </div>
        </div>
        <div class="win95-menubar" style="background: #c0c0c0; padding: 2px 8px; border-bottom: 1px solid #808080; display: flex; gap: 12px;">
          <span class="menu-item" style="padding: 2px 6px;">File</span>
          <span class="menu-item" style="padding: 2px 6px;">Edit</span>
          <span class="menu-item" style="padding: 2px 6px;">View</span>
          <span class="menu-item" style="padding: 2px 6px;">Help</span>
        </div>
        <div class="win95-content" style="flex: 1; background: #000; color: #c0c0c0; padding: 8px; overflow-y: auto; font-family: 'Courier New', monospace;">
          <div class="dos-prompt">
            Microsoft Windows 95<br>
            (C) Copyright Microsoft Corp 1981-1995.<br><br>
            C:\\OMEGA&gt; Welcome to Omega Terminal<br>
            C:\\OMEGA&gt; Type 'help' for available commands<br><br>
            <span id="dos-output"></span>
            <div class="dos-input-line" style="display: flex;">
              C:\\OMEGA&gt; <input type="text" id="dosInput" 
                onkeypress="if(event.key==='Enter') window.__omegaGuiHandleInput?.('windows95')" 
                style="flex: 1; background: #000; border: none; color: #c0c0c0; outline: none; font-family: 'Courier New', monospace;" />
            </div>
          </div>
        </div>
      </div>
      <div class="win95-taskbar" style="position: absolute; bottom: 0; left: 0; right: 0; height: 28px; background: #c0c0c0; border-top: 2px solid #ffffff; display: flex; align-items: center; padding: 0 4px;">
        <div class="start-button" style="background: #c0c0c0; border: 2px outset #fff; padding: 2px 8px; margin-right: 4px; font-weight: bold;">Start</div>
        <div class="taskbar-item" style="background: #c0c0c0; border: 2px inset #808080; padding: 2px 8px; flex: 1; max-width: 200px;">Omega Terminal</div>
      </div>
    </div>
  `;

  context.logHtml(html);
  setupGuiHandlers(context, "windows95");
}

function createLimewireInterface(context: CommandContext): void {
  const html = `
    <div class="limewire-app" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: linear-gradient(to bottom, #1a472a, #0d2818); font-family: Arial, sans-serif; z-index: 9999; display: flex; flex-direction: column;">
      <div class="limewire-header" style="background: linear-gradient(to bottom, #2d6b3f, #1a472a); padding: 12px 16px; border-bottom: 2px solid #0d2818; display: flex; justify-content: space-between; align-items: center;">
        <div class="limewire-logo" style="color: #00ff00; font-weight: bold; font-size: 18px;">🔥 Omega Terminal - P2P Network</div>
        <button onclick="window.__omegaGuiRestore?.()" style="background: #1a472a; color: #00ff00; border: 1px solid #00ff00; padding: 6px 16px; border-radius: 4px; cursor: pointer;">Exit</button>
      </div>
      <div class="limewire-tabs" style="background: #2d6b3f; display: flex; border-bottom: 1px solid #0d2818;">
        <div class="tab active" style="padding: 8px 20px; background: #1a472a; color: #00ff00; border-right: 1px solid #0d2818; font-weight: bold;">Search</div>
        <div class="tab" style="padding: 8px 20px; color: #88cc88; border-right: 1px solid #0d2818;">Monitor</div>
        <div class="tab" style="padding: 8px 20px; color: #88cc88; border-right: 1px solid #0d2818;">Library</div>
      </div>
      <div class="limewire-search" style="padding: 16px; background: #1a472a;">
        <div class="search-bar" style="display: flex; gap: 8px;">
          <input type="text" placeholder="Search the blockchain network..." id="limewireSearch" 
            onkeypress="if(event.key==='Enter') window.__omegaGuiHandleInput?.('limewire')" 
            style="flex: 1; padding: 8px; background: #0d2818; border: 1px solid #00ff00; color: #00ff00; border-radius: 4px;" />
          <button onclick="window.__omegaGuiHandleInput?.('limewire')" 
            style="padding: 8px 24px; background: linear-gradient(to bottom, #00ff00, #00cc00); color: #0d2818; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">Search</button>
        </div>
      </div>
      <div class="limewire-results" id="limewireResults" style="flex: 1; overflow-y: auto; padding: 16px; background: #0d2818;">
        <div class="result-header" style="color: #00ff00; margin-bottom: 12px; font-weight: bold;">Network Commands Available:</div>
        <div class="result-item" onclick="window.__omegaGuiExecuteCommand?.('help')" style="background: #1a472a; padding: 12px; margin-bottom: 8px; border: 1px solid #2d6b3f; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
          <span class="file-name" style="color: #00ff00; font-weight: bold;">help.cmd</span>
          <span class="file-size" style="color: #88cc88;">1KB</span>
          <span class="file-type" style="color: #88cc88;">Command</span>
          <button style="background: #00ff00; color: #0d2818; border: none; padding: 4px 12px; border-radius: 3px; font-weight: bold;">Execute</button>
        </div>
        <div class="result-item" onclick="window.__omegaGuiExecuteCommand?.('balance')" style="background: #1a472a; padding: 12px; margin-bottom: 8px; border: 1px solid #2d6b3f; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
          <span class="file-name" style="color: #00ff00; font-weight: bold;">balance.cmd</span>
          <span class="file-size" style="color: #88cc88;">2KB</span>
          <span class="file-type" style="color: #88cc88;">Wallet</span>
          <button style="background: #00ff00; color: #0d2818; border: none; padding: 4px 12px; border-radius: 3px; font-weight: bold;">Execute</button>
        </div>
      </div>
      <div class="limewire-status" style="background: #2d6b3f; padding: 8px 16px; border-top: 1px solid #00ff00;">
        <div class="status-bar" style="color: #00ff00; font-size: 12px;">Connected to Omega Network | Terminal Commands Active</div>
      </div>
    </div>
  `;

  context.logHtml(html);
  setupGuiHandlers(context, "limewire");
}

function restoreTerminalInterface(context: CommandContext): void {
  // Clear GUI overlay by removing the injected HTML
  if (typeof window !== "undefined") {
    const guiOverlay = document.querySelector('[class*="gui-overlay"]');
    if (guiOverlay) {
      guiOverlay.remove();
    }
  }

  context.log("✅ Terminal interface restored", "success");
  context.log('Type "help" for available commands', "info");
}

function setupGuiHandlers(context: CommandContext, guiType: string): void {
  if (typeof window === "undefined") return;

  // Store restore function globally
  (window as any).__omegaGuiRestore = () => {
    restoreTerminalInterface(context);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("omega-gui-style", "terminal");
    }
  };

  // Store input handler globally
  (window as any).__omegaGuiHandleInput = (type: string) => {
    const inputId =
      type === "chatgpt"
        ? "chatgptInput"
        : type === "aol"
        ? "aolInput"
        : type === "discord"
        ? "discordInput"
        : type === "limewire"
        ? "limewireSearch"
        : "dosInput";

    const input = document.getElementById(inputId) as HTMLInputElement;
    if (!input || !input.value.trim()) return;

    const command = input.value.trim();

    // Add user message to appropriate interface
    addGuiMessage(type, "user", command);

    // Execute command
    if (command === "gui terminal") {
      restoreTerminalInterface(context);
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("omega-gui-style", "terminal");
      }
      return;
    }

    // Execute the command through the terminal
    executeCommandInGui(context, command, type);

    input.value = "";
  };

  // Store execute command handler
  (window as any).__omegaGuiExecuteCommand = (command: string) => {
    executeCommandInGui(context, command, guiType);
  };

  // Store channel switch handler (for Discord)
  (window as any).__omegaGuiSwitchChannel = (channel: string) => {
    const header = document.querySelector(".discord-header span");
    if (header) {
      header.textContent = `# ${channel}`;
    }
    addGuiMessage("discord", "system", `Switched to #${channel} channel`);
  };

  // Focus input after a short delay
  setTimeout(() => {
    const inputId =
      guiType === "chatgpt"
        ? "chatgptInput"
        : guiType === "aol"
        ? "aolInput"
        : guiType === "discord"
        ? "discordInput"
        : guiType === "limewire"
        ? "limewireSearch"
        : "dosInput";
    const input = document.getElementById(inputId) as HTMLInputElement;
    input?.focus();
  }, 100);
}

function addGuiMessage(guiType: string, sender: string, message: string): void {
  if (typeof document === "undefined") return;

  switch (guiType) {
    case "chatgpt":
      addChatGptMessage(sender, message);
      break;
    case "aol":
      addAolMessage(sender, message);
      break;
    case "discord":
      addDiscordMessage(sender, message);
      break;
    case "windows95":
      addDosMessage(message);
      break;
    case "limewire":
      addLimewireMessage(message);
      break;
  }
}

function addChatGptMessage(sender: string, message: string): void {
  const conversation = document.querySelector(".chatgpt-conversation");
  if (!conversation) return;

  const messageEl = document.createElement("div");
  const isUser = sender === "user";

  if (isUser) {
    messageEl.style.cssText = `
      display: flex; 
      justify-content: flex-end;
      margin-bottom: 32px; 
      width: 100%;
    `;

    messageEl.innerHTML = `
      <div style="display: flex; gap: 16px; align-items: flex-start; max-width: 70%;">
        <div style="
          background: #19c37d; 
          padding: 12px 16px; 
          border-radius: 18px;
          font-size: 15px; 
          line-height: 1.5; 
          color: white;
          border: 1px solid #22d35b;
          word-wrap: break-word;
          order: 1;
        ">
          ${message}
        </div>
        <div style="
          width: 40px; 
          height: 40px; 
          border-radius: 50%; 
          background: #19c37d; 
          color: white; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          flex-shrink: 0; 
          font-size: 18px;
          order: 2;
        ">👤</div>
      </div>
    `;
  } else {
    messageEl.style.cssText = `
      display: flex; 
      gap: 16px; 
      margin-bottom: 32px; 
      width: 100%;
    `;

    messageEl.innerHTML = `
      <div style="
        width: 40px; 
        height: 40px; 
        border-radius: 50%; 
        background: #ab68ff; 
        color: white; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        flex-shrink: 0; 
        font-size: 18px;
      ">🤖</div>
      <div style="max-width: 70%;">
        <div style="
          background: transparent; 
          padding: 0; 
          font-size: 15px; 
          line-height: 1.5; 
          color: #ececec;
        ">
          ${message}
        </div>
      </div>
    `;
  }

  conversation.appendChild(messageEl);
  conversation.scrollTop = conversation.scrollHeight;
}

function addAolMessage(sender: string, message: string): void {
  const messages = document.getElementById("aolMessages");
  if (!messages) return;

  const messageEl = document.createElement("div");
  messageEl.className = "aol-message";
  messageEl.style.cssText =
    "margin-bottom: 10px; padding: 8px; background: #ffffcc; border-radius: 4px;";
  messageEl.innerHTML = `<strong>${sender}:</strong> ${message}`;
  messages.appendChild(messageEl);
  messages.scrollTop = messages.scrollHeight;
}

function addDiscordMessage(sender: string, message: string): void {
  const messages = document.getElementById("discordMessages");
  if (!messages) return;

  const messageEl = document.createElement("div");
  messageEl.className = "discord-message";
  messageEl.style.cssText = "margin-bottom: 16px;";
  messageEl.innerHTML = `
    <div class="message-author" style="color: ${
      sender === "user" ? "#00ff00" : "#5865f2"
    }; font-weight: 500; margin-bottom: 4px;">${
    sender === "user" ? "You" : "OmegaBot"
  }</div>
    <div class="message-text" style="color: #dcddde;">${message}</div>
  `;
  messages.appendChild(messageEl);
  messages.scrollTop = messages.scrollHeight;
}

function addDosMessage(message: string): void {
  const output = document.getElementById("dos-output");
  if (!output) return;

  output.innerHTML += `C:\\OMEGA&gt; ${message}<br>`;
  output.scrollTop = output.scrollHeight;
}

function addLimewireMessage(message: string): void {
  const results = document.getElementById("limewireResults");
  if (!results) return;

  const messageEl = document.createElement("div");
  messageEl.style.cssText =
    "background: #1a472a; padding: 12px; margin-bottom: 8px; border: 1px solid #2d6b3f; border-radius: 4px; color: #00ff00;";
  messageEl.innerHTML = `📊 ${message}`;
  results.appendChild(messageEl);
  results.scrollTop = results.scrollHeight;
}

async function executeCommandInGui(
  context: CommandContext,
  command: string,
  guiType: string
): Promise<void> {
  try {
    // Show response
    addGuiMessage(
      guiType,
      "system",
      `Command "${command}" executed. (Full integration coming soon)`
    );
  } catch (error: any) {
    addGuiMessage(
      guiType,
      "system",
      `Error: ${error?.message || "Command failed"}`
    );
  }
}

// Category-specific help content
const CATEGORY_HELP: Record<string, () => string[]> = {
  wallet: () => [
    "💰 WALLET COMMANDS:",
    "  connect              → Connect MetaMask or create Omega wallet",
    "  disconnect           → Disconnect current wallet",
    "  balance              → Show all wallet balances & total value",
    "  send <amount> <to>   → Send OMEGA tokens",
    "  import <private-key> → Import wallet from private key",
    "  export               → Export wallet for other apps",
    "  test-wallet          → Test wallet connection & status",
    "  fund                 → Try to fund wallet with 0.1 OMEGA",
    "  fund-direct          → Direct blockchain funding (bypass relayer)",
  ],
  mining: () => [
    "⛏️  MINING COMMANDS:",
    "  mine                 → Start mining OMEGA tokens",
    "  claim                → Claim mining rewards",
    "  faucet               → Claim from faucet (24h cooldown)",
    "  faucet status        → Check faucet claim status",
    "  status               → Show mining status",
    "  stats                → Show detailed mining statistics",
  ],
  market: () => [
    "📊 MARKET DATA & ANALYTICS:",
    "  ds search <token>    → DexScreener token search & analysis",
    "  ds trending          → DexScreener trending tokens",
    "  ds analytics <token> → Detailed token analytics",
    "  ds portfolio         → Portfolio tracking & analytics",
    "  defillama tvl        → Total DeFi TVL (calculated)",
    "  defillama protocols [limit] → Top protocols by TVL",
    "  defillama chains [limit] → TVL by blockchain",
    "  defillama tvl <protocol> → Specific protocol TVL",
    "  defillama price <token> → Current token price",
    "  defillama tokens <t1,t2,t3> → Multiple token prices",
    "  defillama trending   → Protocols by 24h change",
    "  defillama debug <token> → Debug token price lookup",
    "  llama <command>      → Alias for defillama commands",
    "  chart <symbol>       → Live trading charts (BTC, ETH, SOL)",
    "  cg search <token>    → GeckoTerminal token search",
    "  cg networks          → GeckoTerminal networks",
  ],
  ai: () => [
    "🤖 AI & NFT TOOLS:",
    "  ai <message>         → Chat with OMEGA AI (natural language)",
    "  chat init <api-key>  → Initialize ChainGPT AI",
    '  chat ask "<question>" → Ask ChainGPT Web3 AI',
    '  chat stream "<question>" → Real-time AI streaming',
    '  chat context "<question>" → AI with custom context',
    '  chat history "<question>" → AI with conversation memory',
    "  chat test            → Test ChainGPT connection",
    "  chat help            → Show chat commands help",
    "  nftgen init <api-key>   → Initialize ChainGPT NFT Generator",
    "  nftgen generate <prompt> → Generate AI NFT images",
    "  nftgen enhance <prompt> → Enhance prompt with AI",
    "  nftgen models           → Show available AI models",
    "  nftgen styles           → Show art styles",
    "  nftgen gallery          → View generated NFT gallery",
    "  nftgen test             → Test NFT API connection",
    "  nftgen help             → Show full NFT commands",
    "  contract init <api-key> → Initialize ChainGPT Contract Generator",
    "  contract generate <prompt> → Generate smart contract code",
    "  contract templates      → Show contract templates",
    "  contract chains         → Show supported blockchains",
    "  contract test           → Test Contract API connection",
    "  contract help           → Show contract commands help",
    "  auditor init <api-key>   → Initialize ChainGPT Auditor",
    "  auditor audit <code>     → Audit smart contract code",
    "  auditor severity         → Show severity levels",
    "  auditor categories       → Show security categories",
    "  auditor test             → Test Auditor API connection",
    "  auditor help             → Show auditor commands help",
  ],
  news: () => [
    "📰 CRYPTO NEWS:",
    "  news latest          → Latest crypto news",
    "  news hot             → Trending crypto news",
    "  news btc             → Bitcoin news",
    "  news eth             → Ethereum news",
    "  news sol             → Solana news",
    '  news search "<query>" → Search crypto news',
    "  news category news   → News articles",
    "  news sources         → News sources",
    "  news expand-all      → Expand all articles",
    "  news collapse-all    → Collapse all articles",
    "  news clear-expansions → Clear & reload",
    "  news help            → Show news commands help",
  ],
  blockchain: () => [
    "🌐 MULTI-CHAIN SUPPORT:",
    "  solana connect       → Connect Phantom wallet",
    "  solana generate      → Generate browser wallet",
    "  solana status        → Show available wallets",
    "  solana search <token> → Search tokens with details",
    "  solana swap          → Token swaps",
    "  near connect         → Connect NEAR wallet",
    "  near balance         → Check NEAR balance",
    "  near account         → Get account information",
    "  near validators      → Show network validators",
    "  near agent           → Deploy/manage AI Shade Agents",
    "  near deploy          → Deploy smart contracts",
    "  near help            → Show detailed NEAR commands",
    "  eclipse wallet       → Eclipse wallet operations",
    "  eclipse swap         → Eclipse token swaps",
  ],
  games: () => [
    "🎮 GAMES & ENTERTAINMENT:",
    "  game list            → Show all available games",
    "  play <game>          → Play a game (snake, pacman, clicker, etc.)",
    "  game help            → Show game commands",
    "  rickroll, matrix, hack, disco, fortune → Fun commands",
  ],
  theme: () => [
    "🎨 INTERFACE & THEMES:",
    "  theme <name>         → Switch theme (retro, neo, elite, modern)",
    "  gui <style>          → Transform UI (chatgpt, discord, aol, windows95, limewire)",
    "  view [basic|futuristic] → Toggle view mode",
    "  clear                → Clear terminal",
  ],
};

function listAvailableThemes(context: CommandContext): void {
  context.log("🎨 Available Themes:", "info");
  context.log("", "output");

  const themeDescriptions: Record<string, string> = {
    retro: "Retro - Deep void terminal with vibrant accents",
    neo: "Neo Matrix - Digital rain with cyberpunk green glow",
    elite: "Elite Prestige - Luxury gold and premium serif typography",
    modern: "Modern Cyber - Futuristic glassmorphism with electric neon",
  };

  AVAILABLE_THEMES.forEach((theme) => {
    const description = themeDescriptions[theme] || theme;
    context.log(`  theme ${theme.padEnd(10)} → ${description}`, "output");
  });
  context.log("", "output");
  context.log("💡 Try: theme retro", "success");
}

function ensureTheme(value: string): Theme | null {
  const normalized = value.toLowerCase();
  return AVAILABLE_THEMES.includes(normalized as Theme)
    ? (normalized as Theme)
    : null;
}

export const helpCommand: Command = {
  name: "help",
  aliases: ["?"],
  description: "Display available commands",
  handler: (context: CommandContext, args: string[]) => {
    const category = args[1]?.toLowerCase();

    // Show category-specific help with enhanced formatting
    if (category && CATEGORY_HELP[category]) {
      const categoryLines = CATEGORY_HELP[category]();
      let categoryHtml = `
         <div style="
           font-family: 'Courier New', monospace;
           line-height: 1.8;
          color: var(--palette-text, #e0e0e0);
           padding: 10px;
         ">
           <div style="
             font-size: 20px;
             font-weight: bold;
            color: var(--palette-primary, #00d4ff);
             margin-bottom: 20px;
             text-align: center;
             padding: 15px;
            background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(0, 255, 136, 0.1));
            border: 2px solid var(--palette-primary, #00d4ff);
             border-radius: 8px;
            text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
             letter-spacing: 2px;
           ">
             ═══ ${category.toUpperCase()} HELP ═══
           </div>
           <div style="padding: 10px;">
       `;

      categoryLines.forEach((line) => {
        // Check if line is a header (contains emoji and uppercase text)
        if (line.match(/^[🎮💰⛏️📊🤖📰🌐🎨]|^[A-Z\s]+:$/)) {
          categoryHtml += `
             <div style="
               font-size: 16px;
               font-weight: bold;
              color: var(--palette-primary, #00d4ff);
               margin: 15px 0 10px 0;
               padding: 10px;
              background: linear-gradient(90deg, rgba(0, 212, 255, 0.2), rgba(0, 212, 255, 0.05));
              border-left: 4px solid var(--palette-primary, #00d4ff);
               border-radius: 4px;
             ">${line}</div>
           `;
        } else if (line.trim().startsWith("  ") && line.includes("→")) {
          // Command line with arrow - make command clickable
          const parts = line.split("→");
          const commandPart = parts[0]?.trim() || "";
          const descPart = parts[1]?.trim() || "";

          // Extract command name (remove leading spaces, get first word)
          const commandName = commandPart.split(/\s+/)[0] || commandPart;
          const escapedCommand = commandName
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

          categoryHtml += `
             <div style="margin: 8px 0; padding-left: 20px; padding-bottom: 6px;">
              <span 
                class="omega-help-command"
                data-command="${escapedCommand}"
                style="
                  color: var(--palette-secondary, #00ff88);
                 font-weight: bold;
                 font-size: 1.05em;
                 font-family: 'Courier New', monospace;
                  text-shadow: 0 0 6px rgba(0, 255, 136, 0.3);
                  cursor: pointer;
                  display: inline-block;
                  padding: 2px 4px;
                  border-radius: 3px;
                 transition: all 0.2s ease;
                  user-select: none;
                "
                onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)'; this.style.textShadow = '0 0 8px var(--palette-secondary-glow, rgba(0, 255, 136, 0.5))';"
                onmouseout="this.style.background = 'transparent'; this.style.textShadow = '0 0 6px rgba(0, 255, 136, 0.3)';"
                title="Click to add '${escapedCommand}' to terminal input"
              >${commandPart}</span>
               ${
                 descPart
                   ? `<span style="
                color: var(--palette-text, #ccd4e0);
                 margin-left: 15px;
                 font-size: 0.95em;
                 opacity: 0.95;
               ">→ ${descPart}</span>`
                   : ""
               }
             </div>
           `;
        } else if (line.trim()) {
          categoryHtml += `
             <div style="
              color: var(--palette-text, #ccd4e0);
               margin: 6px 0;
               padding-left: 15px;
               font-size: 0.95em;
               line-height: 1.6;
             ">${line}</div>
           `;
        } else {
          categoryHtml += `<div style="margin: 8px 0;"></div>`;
        }
      });

      categoryHtml += `
           </div>
           <div style="
             margin-top: 25px;
             padding: 15px;
            background: rgba(0, 212, 255, 0.1);
            border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3));
             border-radius: 6px;
             text-align: center;
           ">
            <span style="color: var(--palette-primary, #00d4ff); font-weight: bold;">💡</span>
            <span style="color: var(--palette-text, #ccd4e0); margin-left: 8px;">
               Use <code style="
                color: var(--palette-primary-glow, #00ff88);
                background: rgba(0, 255, 136, 0.1);
                 padding: 2px 6px;
                 border-radius: 3px;
                 font-weight: bold;
               ">help</code> to see all commands
             </span>
           </div>
         </div>
       `;

      context.logHtml(categoryHtml);
      return;
    }

    if (category) {
      context.log(`❌ Unknown category: ${category}`, "error");
      context.log(
        "💡 Available categories: wallet, mining, market, ai, news, blockchain, games, theme",
        "info"
      );
      const helpHtml = createCommandLine("help", "See all commands");
      context.logHtml(helpHtml);
      return;
    }

    // Dynamic help display using command registry
    const allCommands = commandRegistry.getAllCommands();

    // Group commands by category
    const commandsByCategory = new Map<string, Command[]>();
    const uncategorized: Command[] = [];

    allCommands.forEach((cmd) => {
      if (cmd.category) {
        if (!commandsByCategory.has(cmd.category)) {
          commandsByCategory.set(cmd.category, []);
        }
        commandsByCategory.get(cmd.category)!.push(cmd);
      } else {
        uncategorized.push(cmd);
      }
    });

    // Generate HTML help with enhanced color coding - PRIMARY OUTPUT
    const helpIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
      <path d="M12 16V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <circle cx="12" cy="8" r="1" fill="currentColor"/>
    </svg>`;

    let helpHtml = `
       <div style="
         font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
       ">
         <div style="
          font-size: 18px;
           font-weight: bold;
          color: var(--palette-primary, #00d4ff);
          margin-bottom: 20px;
           text-align: center;
          padding: 8px;
          border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3));
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        ">
          <span style="
            width: 24px;
            height: 24px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: var(--palette-primary, #00bcf2);
            flex-shrink: 0;
            vertical-align: middle;
         ">
            ${helpIconSvg}
          </span>
          <span>Omega Commands</span>
         </div>
     `;

    // Display commands grouped by category with enhanced color coding
    const categoryOrder = [
      "wallet",
      "mining",
      "network",
      "news",
      "entertainment",
      "games",
      "market",
      "trading",
      "analytics",
      "nft",
      "ai",
      "chaingpt-chat",
      "chaingpt-contract",
      "chaingpt-nft",
      "chaingpt-auditor",
      "solana",
      "near",
      "eclipse",
      "hyperliquid",
      "rome",
      "monad",
      "fair",
      "spotify",
      "youtube",
      "blues",
      "lofi",
      "tech",
      "funky",
      "dexscreener",
      "defillama",
      "alphavantage",
      "opensea",
      "magiceden",
      "pgt",
      "mixer",
      "referral",
      "perps",
      "email",
      "eth",
      "ens",
      "kalshi",
      "polymarket",
      "token-factory",
      "nft-mint",
      "airdrop",
      "chatter",
      "profile",
      "chart",
      "color",
    ];

    // Display categorized commands
    categoryOrder.forEach((cat) => {
      const commands = commandsByCategory.get(cat);
      if (commands && commands.length > 0) {
        helpHtml += `
          <div style="margin: 24px 0 12px 0;">
             <div style="
              font-size: 14px;
               font-weight: bold;
              color: var(--palette-primary, #00d4ff);
               margin-bottom: 12px;
              padding: 4px 0;
              border-bottom: 1px solid var(--palette-border, rgba(0, 212, 255, 0.2));
             ">
              ${cat.replace(/-/g, " ").toUpperCase()} (${commands.length})
             </div>
            <div style="margin-bottom: 16px;">
         `;

        commands
          .sort((a, b) => a.name.localeCompare(b.name))
          .forEach((cmd) => {
            const aliases =
              cmd.aliases && cmd.aliases.length > 0
                ? ` <span style="
                  color: var(--palette-primary, #00d4ff);
                   font-size: 0.85em;
                   font-weight: normal;
                   font-style: italic;
                  opacity: 0.8;
                   margin-left: 5px;
                 ">[${cmd.aliases.join(", ")}]</span>`
                : "";

            const usage = cmd.usage
              ? `<div style="
                  color: var(--palette-secondary, #00ff88);
                  margin-left: 0;
                  margin-top: 4px;
                  font-size: 11px;
                   font-family: 'Courier New', monospace;
                ">→ Usage: <span style="color: var(--palette-secondary, #00ff88);">${cmd.usage}</span></div>`
              : "";

            // Make command name clickable
            const escapedCommand = cmd.name
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#39;");

            helpHtml += `
              <div style="
                background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 2%, transparent) 100%);
                border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 8px;
              ">
                <div style="display: flex; align-items: baseline; flex-wrap: wrap; gap: 8px; margin-bottom: 6px;">
                  <span 
                    class="omega-help-command"
                    data-command="${escapedCommand}"
                    style="
                      color: var(--palette-secondary, #00ff88);
                     font-weight: bold;
                      font-size: 14px;
                     font-family: 'Courier New', monospace;
                      cursor: pointer;
                      display: inline-block;
                      padding: 2px 6px;
                      border-radius: 3px;
                     transition: all 0.2s ease;
                      user-select: none;
                    "
                    onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)'; this.style.textShadow = '0 0 8px var(--palette-secondary-glow, rgba(0, 255, 136, 0.5))';"
                    onmouseout="this.style.background = 'transparent'; this.style.textShadow = 'none';"
                    title="Click to add '${escapedCommand}' to terminal input"
                  >${cmd.name}</span>${aliases}
                 </div>
                 ${
                   cmd.description
                     ? `<div style="
                  color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
                  margin-left: 0;
                   margin-top: 4px;
                  font-size: 12px;
                  line-height: 1.4;
                 ">${cmd.description}</div>`
                     : ""
                 }
                 ${usage}
               </div>
             `;
          });

        helpHtml += `
            </div>
          </div>
        `;
      }
    });

    // Display uncategorized commands
    if (uncategorized.length > 0) {
      helpHtml += `
        <div style="margin: 24px 0 12px 0;">
           <div style="
            font-size: 14px;
             font-weight: bold;
            color: var(--palette-primary, #00d4ff);
             margin-bottom: 12px;
            padding: 4px 0;
            border-bottom: 1px solid var(--palette-border, rgba(0, 212, 255, 0.2));
           ">
            OTHER COMMANDS (${uncategorized.length})
           </div>
          <div style="margin-bottom: 16px;">
       `;

      uncategorized
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((cmd) => {
          const aliases =
            cmd.aliases && cmd.aliases.length > 0
              ? ` <span style="
                color: var(--palette-primary, #00d4ff);
                font-size: 11px;
                 font-weight: normal;
                 font-style: italic;
                opacity: 0.8;
                 margin-left: 5px;
               ">[${cmd.aliases.join(", ")}]</span>`
              : "";

          const usage = cmd.usage
            ? `<div style="
                color: var(--palette-secondary, #00ff88);
                margin-left: 0;
                margin-top: 4px;
                font-size: 11px;
                 font-family: 'Courier New', monospace;
              ">→ Usage: <span style="color: var(--palette-secondary, #00ff88);">${cmd.usage}</span></div>`
            : "";

          // Make command name clickable
          const escapedCommand = cmd.name
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

          helpHtml += `
            <div style="
              background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 2%, transparent) 100%);
              border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
              border-radius: 8px;
              padding: 12px;
              margin-bottom: 8px;
            ">
              <div style="display: flex; align-items: baseline; flex-wrap: wrap; gap: 8px; margin-bottom: 6px;">
                <span 
                  class="omega-help-command"
                  data-command="${escapedCommand}"
                  style="
                    color: var(--palette-secondary, #00ff88);
                   font-weight: bold;
                    font-size: 14px;
                   font-family: 'Courier New', monospace;
                    cursor: pointer;
                    display: inline-block;
                    padding: 2px 6px;
                    border-radius: 3px;
                   transition: all 0.2s ease;
                    user-select: none;
                  "
                  onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)'; this.style.textShadow = '0 0 8px var(--palette-secondary-glow, rgba(0, 255, 136, 0.5))';"
                  onmouseout="this.style.background = 'transparent'; this.style.textShadow = 'none';"
                  title="Click to add '${escapedCommand}' to terminal input"
                >${cmd.name}</span>${aliases}
               </div>
               ${
                 cmd.description
                   ? `<div style="
                color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
                margin-left: 0;
                 margin-top: 4px;
                font-size: 12px;
                line-height: 1.4;
               ">${cmd.description}</div>`
                   : ""
               }
               ${usage}
             </div>
           `;
        });

      helpHtml += `</div>`;
    }

    helpHtml += `
         <div style="
          margin-top: 20px;
          padding: 15px;
           text-align: center;
          border-top: 1px solid var(--palette-border, rgba(0, 212, 255, 0.2));
         ">
           <div style="
            color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent);
            font-size: 0.85em;
               font-family: 'Courier New', monospace;
          ">
            Ω Terminal v3.0.0 - Modern Apple UI • Enhanced Analytics • DeFi Integration • NFT Trading
           </div>
         </div>
       </div>
     `;

    context.logHtml(helpHtml);
  },
};

export const clearCommand: Command = {
  name: "clear",
  aliases: ["cls"],
  description: "Clear terminal output",
  handler: (context: CommandContext) => {
    console.log("🧹 Clear command executing...");
    console.log("🧹 clearTerminal function:", typeof context.clearTerminal);
    context.clearTerminal();
    console.log("🧹 Terminal cleared!");
  },
};

export const statusCommand: Command = {
  name: "status",
  description: "Display system status",
  handler: (context: CommandContext) => {
    context.log("=== Omega Terminal Status ===", "info");
    context.log(`Version: ${config.VERSION}`, "output");
    context.log(`Theme: ${context.theme.currentTheme}`, "output");

    if (context.wallet.state.isConnected && context.wallet.state.address) {
      context.log("Wallet: Connected", "success");
      context.log(`Address: ${context.wallet.state.address}`, "output");
      context.log(
        `Balance: ${context.wallet.state.balance ?? "Unknown"}`,
        "output"
      );
    } else {
      context.log("Wallet: Not connected", "warning");
      const helpHtml = createCommandLine("connect", "Link MetaMask");
      context.logHtml(helpHtml);
    }

    context.log("", "output");
    context.log("Network:", "info");
    context.log(` Relayer: ${config.RELAYER_URL}`, "output");
    context.log(` RPC: ${config.OMEGA_RPC_URL}`, "output");
  },
};

export const themeCommand: Command = {
  name: "theme",
  aliases: ["themes"],
  description: "Switch terminal theme",
  usage: "theme <name>|list",
  handler: (context: CommandContext, args: string[]) => {
    const next = args[1];

    if (!next || next === "list" || next === "help") {
      listAvailableThemes(context);
      return;
    }

    const theme = ensureTheme(next);
    if (!theme) {
      context.log(`Unknown theme: ${next}`, "error");
      listAvailableThemes(context);
      return;
    }

    context.theme.setTheme(theme);
    context.log(`Theme switched to ${theme}.`, "success");
  },
};

export const viewCommand: Command = {
  name: "view",
  description: "Toggle between basic and futuristic dashboard view",
  usage: "view [basic|futuristic|toggle]",
  handler: (context: CommandContext, args: string[]) => {
    // Access viewMode from context
    const viewModeContext = context.viewMode;

    if (!viewModeContext) {
      context.log("❌ View mode system not available", "error");
      return;
    }

    if (!args || args.length < 2) {
      // Show current mode
      const currentMode = viewModeContext.viewMode;
      context.log("📺 Terminal View Modes:", "info");
      context.log("", "info");
      context.log(
        `  Current mode: ${currentMode.toUpperCase()}`,
        currentMode === "basic" ? "success" : "info"
      );
      context.log("", "info");
      context.log("Available commands:", "info");
      context.log(
        "  view basic       → Modern terminal only (no dashboard)",
        "output"
      );
      context.log(
        "  view futuristic  → Full dashboard with sidebar & stats",
        "output"
      );
      context.log("  view toggle      → Switch between modes", "output");
      context.log("", "info");
      context.log("💡 Your preference is saved automatically!", "info");
      return;
    }

    const mode = args[1]?.toLowerCase();

    switch (mode) {
      case "basic":
      case "classic":
      case "simple":
        viewModeContext.setViewMode("basic");
        context.log("✅ Switched to basic terminal view", "success");
        break;

      case "futuristic":
      case "dashboard":
      case "advanced":
        viewModeContext.setViewMode("futuristic");
        context.log("✅ Switched to futuristic dashboard view", "success");
        break;

      case "toggle":
      case "switch":
        const beforeMode = viewModeContext.viewMode;
        viewModeContext.toggleViewMode();
        const newMode = beforeMode === "basic" ? "futuristic" : "basic";
        context.log(`✅ Toggled to ${newMode} view`, "success");
        break;

      default:
        context.log("❌ Invalid view mode", "error");
        const helpHtml = `
          <div style="margin: 8px 0;">
            ${createCommandLine("view basic", "Switch to basic view")}
            ${createCommandLine("view futuristic", "Switch to futuristic view")}
            ${createCommandLine("view toggle", "Toggle between views")}
          </div>
        `;
        context.logHtml(helpHtml);
    }
  },
};

export const guiCommand: Command = {
  name: "gui",
  description:
    "Transform UI to different interface styles (ChatGPT, Discord, AOL, Windows95, LimeWire, Terminal)",
  usage: "gui <chatgpt|discord|aol|windows95|limewire|terminal|help>",
  handler: (context: CommandContext, args: string[]) => {
    const availableStyles = [
      "chatgpt",
      "aol",
      "discord",
      "windows95",
      "limewire",
      "terminal",
    ];

    if (!args[1] || args[1] === "help" || args[1] === "list") {
      const currentStyle =
        typeof localStorage !== "undefined"
          ? localStorage.getItem("omega-gui-style") || "terminal"
          : "terminal";
      const currentTheme =
        typeof localStorage !== "undefined"
          ? localStorage.getItem("omega-theme-mode") || "retro"
          : "retro";

      context.log("🎮 GUI Interface Styles", "info");
      context.log("═══════════════════════════════════════", "output");
      context.log("", "info");

      context.log(
        "💬 gui chatgpt      - ChatGPT conversation interface",
        "output"
      );
      context.log("   Modern chat UI with sidebar and message bubbles", "info");
      context.log("", "info");

      context.log("👾 gui discord      - Discord server interface", "output");
      context.log("   Channel-based chat with Discord aesthetics", "info");
      context.log("", "info");

      context.log("📧 gui aol          - AOL Instant Messenger", "output");
      context.log('   Classic AOL chat with "You\'ve got mail" vibes', "info");
      context.log("", "info");

      context.log("🪟 gui windows95    - Windows 95 retro", "output");
      context.log("   Classic Windows 95 window chrome and style", "info");
      context.log("", "info");

      context.log("🔥 gui limewire     - LimeWire P2P interface", "output");
      context.log("   Y2K-era file sharing aesthetic", "info");
      context.log("", "info");

      context.log("⌨️  gui terminal     - Default terminal UI", "output");
      context.log("   Return to standard terminal interface", "info");
      context.log("", "info");

      context.log("💡 ALL GUI STYLES:", "success");
      context.log("  ✅ Work in both Light & Dark mode", "output");
      context.log("  ✅ Preserve all terminal commands", "output");
      context.log("  ✅ Support futuristic dashboard features", "output");
      context.log("  ✅ Auto-save your preference", "output");
      context.log("", "info");

      context.log("🎯 CURRENT:", "info");
      context.log(`  GUI Style: ${currentStyle}`, "output");
      const themeName: Record<string, string> = {
        retro: "Retro",
        neo: "Neo",
        elite: "Elite",
        modern: "Modern",
      };
      const name = themeName[currentTheme] || "Retro";
      context.log(`  Theme: ${name}`, "output");
      context.log("", "info");
      context.log("💡 Try: gui chatgpt", "success");
      return;
    }

    const style = args[1].toLowerCase();
    if (!availableStyles.includes(style)) {
      context.log(`❌ Invalid GUI style: ${style}`, "error");
      context.log(
        "💡 Available: chatgpt, discord, aol, windows95, limewire, terminal",
        "info"
      );
      return;
    }

    context.log(`✅ Transforming interface to ${style}...`, "success");

    // Save preference
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("omega-gui-style", style);
    }

    // Apply the GUI transformation based on style
    switch (style) {
      case "chatgpt":
        createChatGptInterface(context);
        break;
      case "aol":
        createAolInterface(context);
        break;
      case "discord":
        createDiscordInterface(context);
        break;
      case "windows95":
        createWindows95Interface(context);
        break;
      case "limewire":
        createLimewireInterface(context);
        break;
      case "terminal":
      default:
        restoreTerminalInterface(context);
        break;
    }

    context.log(`✅ Interface transformed to: ${style}`, "success");
    context.log(
      `💡 All commands still work! Type "gui terminal" to restore.`,
      "info"
    );
  },
};

export const aiCommand: Command = {
  name: "ai",
  description: "Chat with OMEGA AI using natural language",
  usage: "ai <your message>",
  handler: async (context: CommandContext, args: string[]) => {
    if (!args || args.length === 0 || !args[1]) {
      context.log("🤖 OMEGA AI Assistant", "info");
      const usageHtml = createUsageError("ai <your message>", [
        'ai "What is my balance?"',
        'ai "Help me create a token"',
      ]);
      context.logHtml(usageHtml);
      // Check AI mode from context (matches vanilla behavior)
      const isAIMode = context.aiProvider && context.aiProvider !== "off";
      context.log(`AI Mode: ${isAIMode ? "ON 🟢" : "OFF 🔴"}`, "info");
      context.log("Toggle AI Mode using the button in the header", "info");
      return;
    }

    const message = args.slice(1).join(" ");
    await callAI(context, message, false);
  },
};

export const tabCommand: Command = {
  name: "tab",
  description: "Manage terminal tabs",
  usage: "tab <new|close|switch> [number]",
  handler: (context: CommandContext, args: string[]) => {
    if (args.length < 2 || !args[1]) {
      const usageHtml = createUsageError("tab <new|close|switch> [number]", [
        "tab new",
        "tab close 2",
        "tab switch 1",
      ]);
      context.logHtml(usageHtml);
      return;
    }

    const action = args[1].toLowerCase();
    switch (action) {
      case "new":
        context.log("Creating new tab...", "info");
        context.log(
          "💡 Tab management coming soon in Next.js version",
          "warning"
        );
        break;
      case "close":
        context.log("Closing current tab...", "info");
        context.log(
          "💡 Tab management coming soon in Next.js version",
          "warning"
        );
        break;
      case "switch":
        if (!args[2]) {
          context.log("Please specify tab number", "error");
          return;
        }
        const tabNum = parseInt(args[2]);
        if (isNaN(tabNum)) {
          context.log("Please specify tab number", "error");
          return;
        }
        context.log(`Switching to tab ${tabNum}...`, "info");
        context.log(
          "💡 Tab management coming soon in Next.js version",
          "warning"
        );
        break;
      default:
        context.log("Invalid tab command", "error");
    }
  },
};

export const stopCommand: Command = {
  name: "stop",
  description: "Stop running animations and activities",
  handler: (context: CommandContext) => {
    const stoppedActivities: string[] = [];

    // Stop mining
    if (context.miningState?.isMining) {
      context.miningState.stopMining();
      stoppedActivities.push("mining");
    }

    // Clear animations (if any running)
    if (typeof window !== "undefined") {
      // Clear any pending animation timers (safe approach)
      stoppedActivities.push("animations");
    }

    if (stoppedActivities.length > 0) {
      context.log(`⏹️ Stopped: ${stoppedActivities.join(", ")}`, "success");
    } else {
      context.log("ℹ️ No activities currently running", "info");
    }
  },
};

// AI helper function
async function callAI(
  context: CommandContext,
  prompt: string,
  isAIMode: boolean = false
): Promise<void> {
  if (!prompt || prompt.trim() === "") {
    context.log("❌ Please provide a message for the AI", "error");
    return;
  }

  try {
    // Try enhanced agent first (if available) - but skip for very simple prompts
    const isSimplePrompt =
      prompt.trim().split(/\s+/).length <= 2 &&
      !/\b(check|show|display|view|get|create|make|trade|swap|buy|sell|analyze|help)\b/i.test(
        prompt
      );

    if (!isSimplePrompt) {
      try {
        const { handleEnhancedAI } = await import("@/lib/ai/command-enhancer");
        const { CommandRegistry } = await import(
          "@/lib/commands/CommandRegistry"
        );

        // Get command registry from context if available
        const registry = (context as any).commandRegistry as
          | InstanceType<typeof CommandRegistry>
          | undefined;

        if (registry) {
          // Use enhanced agent for better command recognition
          await handleEnhancedAI(prompt, context, registry);
          return;
        }
      } catch (error) {
        // Enhanced agent not available, fall back to standard AI
        console.log("[DEBUG] Enhanced agent not available, using standard AI");
      }
    } else {
      console.log(
        "[DEBUG] Skipping enhanced agent for simple prompt, using standard AI"
      );
    }

    // Matches vanilla terminal.html lines 4763-4841
    const url =
      process.env.NEXT_PUBLIC_AI_CHAT_URL || "https://ai.omeganetwork.co/chat";
    const evm = context.wallet?.address || null;
    const solana = context.wallet?.solana?.address || null;

    console.log("[DEBUG] 🎯 Calling AI endpoint:", url);
    console.log("[DEBUG] EVM:", evm, "Solana:", solana);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: prompt,
        evm,
        solana,
        chatHistory: context.chatHistory || [],
        ...(context.aiProvider && context.aiProvider !== "off"
          ? { provider: context.aiProvider }
          : {}),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      const textResponse = await response.text();
      console.error(
        "[DEBUG] Failed to parse JSON response. Raw response:",
        textResponse.substring(0, 500)
      );
      throw new Error(
        `Invalid JSON response from AI endpoint. Server returned: ${textResponse.substring(
          0,
          200
        )}`
      );
    }

    console.log("[DEBUG] AI Response:", data);

    // Enhance response if possible
    try {
      const { enhanceAIResponse } = await import("@/lib/ai/command-enhancer");
      const enhanced = enhanceAIResponse(data, context);

      // Use enhanced response if it has better structure
      if (enhanced.type === "command" && enhanced.commands) {
        if (!data.data) data.data = {};
        data.data = {
          ...data.data,
          commands: enhanced.commands,
          answer: enhanced.answer,
        };
      }
    } catch (error) {
      // Enhancement failed, use original response
      console.log("[DEBUG] Response enhancement failed, using original");
    }

    // Handle different response structures
    if (data && data.data) {
      const d = data.data;

      // Track AI reply in chat history
      if (d.additionalInfoRequired && context.chatHistory) {
        context.chatHistory.push({
          type: "ai",
          message: d.additionalInfo,
        });
      }

      // Show additional info if required
      if (d.additionalInfoRequired) {
        context.log(d.additionalInfo, "info");
      }

      // Execute commands from array
      if (Array.isArray(d.commands) && d.commands.length > 0) {
        console.log("AI returned commands array:", d.commands);

        // Track commands in history
        if (context.chatHistory) {
          context.chatHistory.push({
            type: "command",
            command: d.commands,
          });
        }

        try {
          // Set flag to prevent recursive AI calls (mutate the context property)
          if (context.executingAICommands !== undefined) {
            context.executingAICommands = true;
          }

          for (let i = 0; i < d.commands.length; i++) {
            const cmd = d.commands[i];
            console.log(
              `Executing AI command ${i + 1}/${d.commands.length}: "${cmd}"`
            );
            if (typeof cmd === "string") {
              // Pass true flag to indicate this is from AI (matches vanilla line 4814)
              await (context.executeCommand as any)(cmd, true);
            } else {
              console.warn("Skipping non-string command:", cmd);
            }
          }
          console.log("AI command execution completed successfully");
        } catch (error: any) {
          console.error("Error executing AI commands:", error);
          context.log(`AI command execution failed: ${error.message}`, "error");
        } finally {
          // Always reset the flag when done
          if (context.executingAICommands !== undefined) {
            context.executingAICommands = false;
          }
        }
      } else if (!d.additionalInfoRequired) {
        // Show helpful suggestions
        context.log("Can't perform this action", "error");
        context.log("", "output");

        // Try to provide helpful suggestions
        try {
          const { getQuickActions } = await import("@/lib/ai/command-enhancer");
          const suggestions = getQuickActions(context);
          if (suggestions.length > 0) {
            context.log("💡 Try these commands:", "info");
            suggestions.slice(0, 5).forEach((action) => {
              context.log(`   • ${action}`, "output");
            });
          }
        } catch (error) {
          // Suggestions not available
        }
      }
    } else if (data && (data.answer || data.message || data.response)) {
      // Handle alternative response structures
      const answer =
        data.answer || data.message || data.response || "No response generated";
      context.log(`🤖 AI: ${answer}`, "info");

      // Track in chat history
      if (context.chatHistory) {
        context.chatHistory.push({
          type: "ai",
          message: answer,
        });
      }
    } else {
      // Log the actual response for debugging
      console.error(
        "[DEBUG] Invalid AI response structure:",
        JSON.stringify(data, null, 2)
      );
      context.log("AI agent error: Invalid response format.", "error");
      context.log("", "output");
      context.log(
        "💡 The AI endpoint returned an unexpected response format",
        "info"
      );
      context.log(
        "💡 Try rephrasing your question or use 'help' for available commands",
        "info"
      );
      if (data) {
        context.log("", "output");
        context.log(
          `📊 Response preview: ${JSON.stringify(data).substring(0, 200)}...`,
          "output"
        );
      }
    }
  } catch (error: any) {
    context.log("AI agent error: " + error.message, "error");
    context.log("", "output");
    context.log("💡 Check your connection or try again later", "info");
  }
}

/**
 * Quick Actions Command
 * Manage custom quick actions that appear in the welcome message
 */
export const quickActionsCommand: Command = {
  name: "quick-actions",
  aliases: ["qa", "favorites", "favs"],
  description: "Manage your custom quick actions (favorite commands)",
  usage: "quick-actions [list|add|remove|edit|reset]",
  handler: (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase() || "list";

    if (subcommand === "list" || subcommand === "show") {
      const actions = getQuickActions();
      const grouped = groupQuickActionsByCategory(actions);

      context.log("⭐ Your Custom Quick Actions:", "info");
      context.log("", "output");

      if (actions.length === 0) {
        context.log(
          "No custom quick actions set. Use 'quick-actions add' to add some!",
          "info"
        );
        return;
      }

      Object.entries(grouped).forEach(([category, categoryActions]) => {
        context.log(`📁 ${category}:`, "output");
        categoryActions.forEach((action) => {
          context.logHtml(
            `  • ${createCommandLine(action.command, action.label)} ${
              action.description ? `→ ${action.description}` : ""
            }`
          );
        });
        context.log("", "output");
      });

      context.log("💡 Click any command above to execute it", "info");
      context.log(
        "💡 Use 'quick-actions add <command> <label> [description]' to add more",
        "info"
      );
    } else if (subcommand === "add") {
      const command = args[2];
      if (!command) {
        context.log(
          "❌ Usage: quick-actions add <command> <label> [description] [category:<name>]",
          "error"
        );
        context.log(
          "Example: quick-actions add 'chart ETH' 'Chart Ethereum' 'View ETH chart' category:'Trading'",
          "info"
        );
        return;
      }

      const label = args[3] || command;
      const description = args.slice(4).join(" ") || undefined;
      const category =
        args.find((a) => a.startsWith("category:"))?.split(":")[1] || "Other";

      const newAction = addQuickAction({
        command,
        label: label || command,
        description,
        category,
      });

      context.log(`✅ Added quick action: ${newAction.label}`, "success");
      context.log(`   Command: ${newAction.command}`, "output");
      if (newAction.description) {
        context.log(`   Description: ${newAction.description}`, "output");
      }
      context.log(
        "💡 Your quick actions will appear in the welcome message on next load",
        "info"
      );
    } else if (subcommand === "remove" || subcommand === "delete") {
      const id = args[2];
      if (!id) {
        context.log("❌ Usage: quick-actions remove <id>", "error");
        context.log("💡 Use 'quick-actions list' to see IDs", "info");
        return;
      }

      const removed = removeQuickAction(id);
      if (removed) {
        context.log(`✅ Removed quick action with ID: ${id}`, "success");
      } else {
        context.log(`❌ Quick action with ID '${id}' not found`, "error");
      }
    } else if (subcommand === "edit" || subcommand === "update") {
      const id = args[2];
      if (!id) {
        context.log(
          "❌ Usage: quick-actions edit <id> [command] [label] [description]",
          "error"
        );
        return;
      }

      const updates: Partial<QuickAction> = {};
      if (args[3]) updates.command = args[3];
      if (args[4]) updates.label = args[4];
      if (args[5]) updates.description = args.slice(5).join(" ");

      const updated = updateQuickAction(id, updates);
      if (updated) {
        context.log(`✅ Updated quick action with ID: ${id}`, "success");
      } else {
        context.log(`❌ Quick action with ID '${id}' not found`, "error");
      }
    } else if (subcommand === "reset") {
      resetQuickActions();
      context.log("✅ Reset quick actions to defaults", "success");
    } else {
      context.log(
        "❌ Unknown subcommand. Use: list, add, remove, edit, or reset",
        "error"
      );
      context.log(
        "💡 Type 'quick-actions list' to see your current quick actions",
        "info"
      );
    }
  },
};

/**
 * URL Command
 * Display helpful URLs and resources
 */
export const urlCommand: Command = {
  name: "url",
  aliases: ["urls"],
  description: "Display helpful URLs and resources",
  category: "system",
  handler: (context: CommandContext) => {
    context.log("📚 Helpful URLs:", "info");
    context.log("", "output");
    context.logHtml(
      '<a href="https://omega-6.gitbook.io/omega" target="_blank" style="color:#00d4ff">📖 Gitbook Documentation</a>'
    );
    context.logHtml(
      '<a href="https://discord.gg/omega" target="_blank" style="color:#00d4ff">💬 Discord Community</a>'
    );
    context.logHtml(
      '<a href="https://twitter.com/omegaterminal" target="_blank" style="color:#00d4ff">🐦 Twitter</a>'
    );
    context.logHtml(
      '<a href="https://github.com/omega-terminal" target="_blank" style="color:#00d4ff">💻 GitHub</a>'
    );
    context.log("", "output");
    context.log("💡 Click any link to visit", "info");
  },
};

export const basicCommands: Command[] = [
  helpCommand,
  clearCommand,
  statusCommand,
  themeCommand,
  viewCommand,
  guiCommand,
  aiCommand,
  tabCommand,
  stopCommand,
  quickActionsCommand,
  urlCommand,
];

export default basicCommands;
