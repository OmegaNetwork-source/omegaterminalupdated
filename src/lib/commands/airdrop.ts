/**
 * Airdrop Command
 * Display airdrop modal with Easter egg
 */

import type { Command, CommandContext } from "@/types/commands";

/**
 * Airdrop Command
 */
export const airdropCommand: Command = {
  name: "airdrop",
  description: "Check for airdrops",
  usage: "airdrop",
  category: "fun",
  handler: async (context: CommandContext) => {
    context.log("🎁 Incoming airdrop!", "info");

    // Create modal HTML
    const modalHtml = `
      <div id="airdropModal" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
      " onclick="this.remove()">
        <div style="
          position: relative;
          width: 80%;
          max-width: 600px;
          height: 60%;
          max-height: 400px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: #111;
          border-radius: 10px;
          box-shadow: 0 0 30px #00bcf2;
          padding: 20px;
        " onclick="event.stopPropagation()">
          <button onclick="document.getElementById('airdropModal').remove()" style="
            position: absolute;
            top: -40px;
            right: 0;
            background: #ff3333;
            color: white;
            border: none;
            font-size: 24px;
            width: 40px;
            height: 40px;
            cursor: pointer;
            border-radius: 50%;
            z-index: 10001;
          ">×</button>
          
          <img 
            src="https://i.postimg.cc/g08SBcPg/Metal-Pole-Bang-for-nearly-15-minutes-crazy-art-dance.gif" 
            alt="Airdrop" 
            style="max-width:100%; max-height:100%; border-radius:10px;" 
          />
          
          <div style="
            color:#fff; 
            text-align:center; 
            font-size:1.5em; 
            margin-top:28px; 
            font-weight:bold;
          ">Roy says not yet</div>
        </div>
      </div>
    `;

    context.logHtml(modalHtml);

    // Auto-close after 30 seconds
    if (typeof window !== "undefined") {
      setTimeout(() => {
        const modal = document.getElementById("airdropModal");
        if (modal) {
          modal.remove();
        }
      }, 30000);
    }

    context.log("", "output");
    context.log("💡 Click anywhere outside the modal to close it", "info");
  },
};

export const airdropCommands: Command[] = [airdropCommand];
