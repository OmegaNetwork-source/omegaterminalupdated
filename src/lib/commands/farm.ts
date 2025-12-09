/**
 * Farming Commands
 * Commands for testnet farming, contract deployment, and automated flows
 */

import type { Command } from "@/types/commands";
import { createCommandLine, createUsageError } from "./command-output-helpers";
import {
  isAwaitingStableTokenInput,
  handleStableTokenCreationInput,
  cancelStableTokenCreation,
} from "./stable-token";
import { handleStableTransactions } from "./stable-transactions";
import {
  FARMING_NETWORKS,
  CONTRACT_TEMPLATES,
  FARMING_FLOWS,
  getFarmingOpportunity,
  getFarmingNetwork,
  getContractTemplate,
  getFarmingFlow,
} from "@/lib/data/farming-opportunities";
import {
  fetchFarmingOpportunities,
  fetchOpportunitiesByNetwork,
  searchOpportunities,
} from "@/lib/services/farming-api";
import { deployContract } from "@/lib/services/contract-deployment";
import { escapeHtml } from "@/lib/utils";

const COMING_SOON_MESSAGE = `
🚧 This feature is coming soon!

We're building a comprehensive farming system that will allow you to:
- Discover testnet farming opportunities across multiple networks
- Deploy contracts automatically on various testnets
- Execute automated farming flows
- Track your farming activities

Stay tuned for updates!
`;

function showComingSoon(context: any, featureName: string, preview?: string) {
  context.log(`🚧 ${featureName} - Coming Soon`, "info");
  context.log(COMING_SOON_MESSAGE, "output");
  if (preview) {
    context.log(`\n📋 Preview: ${preview}`, "info");
  }
}

async function handleList(context: any) {
  context.log("🌾 Fetching farming opportunities...", "info");
  
  try {
    const opportunities = await fetchFarmingOpportunities();
    
    if (opportunities.length === 0) {
      context.log("No farming opportunities found.", "warning");
      return;
    }

    context.log(`\n📊 Found ${opportunities.length} Farming Opportunities:`, "info");
    context.log("═══════════════════════════════════════", "output");
    
    opportunities.forEach((opp, index) => {
      context.log(`\n${index + 1}. ${opp.name}`, "output");
      context.log(`   Network: ${opp.network}`, "output");
      context.log(`   Type: ${opp.type}`, "output");
      context.log(`   Status: ${opp.status}`, "output");
      if (opp.description) {
        context.log(`   Description: ${opp.description}`, "output");
      }
    });

    context.log(`\n💡 Use "farm info <id>" to see details about an opportunity`, "info");
  } catch (error: any) {
    context.log(`Error fetching opportunities: ${error.message}`, "error");
  }
}

async function handleSearch(context: any, args: string[]) {
  const query = args[2];
  if (!query) {
    const usageHtml = createUsageError("farm search", [
      "farm search ethereum-testnet",
      "farm search layerzero"
    ]);
    context.logHtml(usageHtml);
    context.log("", "output");
    return;
  }

  context.log(`🔍 Searching for: ${query}...`, "info");

  try {
    // Check if it's a network ID
    const network = getFarmingNetwork(query);
    let opportunities;

    if (network) {
      opportunities = await fetchOpportunitiesByNetwork(query);
    } else {
      // Search by keyword
      opportunities = await searchOpportunities(query);
    }

    if (opportunities.length === 0) {
      context.log(`No opportunities found for "${query}"`, "warning");
      return;
    }

    context.log(`\n📋 Found ${opportunities.length} opportunity/opportunities:`, "info");
    context.log("═══════════════════════════════════════", "output");
    
    opportunities.forEach((opp, index) => {
      context.log(`\n${index + 1}. ${opp.name}`, "output");
      context.log(`   ID: ${opp.id}`, "output");
      context.log(`   Network: ${opp.network}`, "output");
      context.log(`   Type: ${opp.type}`, "output");
      context.log(`   Status: ${opp.status}`, "output");
    });

    context.log(`\n💡 Use "farm info <id>" to see detailed information`, "info");
  } catch (error: any) {
    context.log(`Search error: ${error.message}`, "error");
  }
}

async function handleInfo(context: any, args: string[]) {
  const opportunityId = args[2]?.toLowerCase();
  if (!opportunityId) {
    const usageHtml = createUsageError("farm info", [
      "farm info layerzero-testnet"
    ]);
    context.logHtml(usageHtml);
    context.log("", "output");
    return;
  }

  try {
    // Try to get from fetched opportunities first
    const allOpportunities = await fetchFarmingOpportunities();
    let opportunity = allOpportunities.find((opp) => opp.id === opportunityId);
    
    // Fallback to hardcoded data
    if (!opportunity) {
      opportunity = getFarmingOpportunity(opportunityId);
    }

    if (!opportunity) {
      context.log(`Opportunity '${opportunityId}' not found`, "error");
      context.log("Use 'farm list' to see available opportunities", "info");
      return;
    }

    context.log(`\n📋 ${opportunity.name}`, "info");
    context.log("═══════════════════════════════════════", "output");
    context.log(`  Description: ${opportunity.description}`, "output");
    context.log(`  Network: ${opportunity.network}`, "output");
    context.log(`  Type: ${opportunity.type}`, "output");
    context.log(`  Status: ${opportunity.status}`, "output");
    
    if (opportunity.contracts.main) {
      context.log(`  Main Contract: ${opportunity.contracts.main}`, "output");
    }
    
    if (opportunity.requirements.length > 0) {
      context.log(`\n  Requirements:`, "info");
      opportunity.requirements.forEach((req) => {
        context.log(`    - ${req}`, "output");
      });
    }
    
    if (opportunity.rewardInfo) {
      context.log(`\n  Rewards:`, "info");
      context.log(`    ${opportunity.rewardInfo.description}`, "output");
      if (opportunity.rewardInfo.token) {
        context.log(`    Token: ${opportunity.rewardInfo.token}`, "output");
      }
      if (opportunity.rewardInfo.estimatedValue) {
        context.log(`    Estimated Value: ${opportunity.rewardInfo.estimatedValue}`, "output");
      }
    }

    if (opportunity.discordUrl || opportunity.telegramUrl || opportunity.websiteUrl) {
      context.log(`\n  Links:`, "info");
      if (opportunity.discordUrl) {
        context.log(`    Discord: ${opportunity.discordUrl}`, "output");
      }
      if (opportunity.telegramUrl) {
        context.log(`    Telegram: ${opportunity.telegramUrl}`, "output");
      }
      if (opportunity.websiteUrl) {
        context.log(`    Website: ${opportunity.websiteUrl}`, "output");
      }
    }

    if (opportunity.explorerUrl) {
      context.log(`\n  Explorer: ${opportunity.explorerUrl}`, "output");
    }

    context.log(`\n💡 Use "farm links ${opportunityId}" for community links`, "info");
    if (opportunity.contracts.main) {
      context.log(`💡 Use "farm flow <flow-id>" to execute automated flows`, "info");
    }
  } catch (error: any) {
    context.log(`Error fetching opportunity info: ${error.message}`, "error");
  }
}

async function handleDeploy(context: any, args: string[]) {
  const templateId = args[2]?.toLowerCase();
  const networkId = args[3]?.toLowerCase();
  
  if (!templateId) {
    const usageHtml = createUsageError("farm deploy", [
      "farm deploy erc20-basic ethereum-testnet"
    ]) + `
      <div style="
        margin-top: 12px;
        padding: 12px;
        background: color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent);
        border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
        border-radius: 6px;
        font-size: 12px;
        color: var(--palette-text, #ccd4e0);
      ">
        <div style="margin-bottom: 8px;">
          <span style="color: var(--palette-primary, #00d4ff);">💡</span>
          <span style="margin-left: 8px;">Use <span class="omega-help-command" data-command="farm templates" style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; text-decoration: underline; padding: 2px 4px; border-radius: 3px; transition: all 0.2s ease;" onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)';" onmouseout="this.style.background = 'transparent';" title="Click to add 'farm templates' to terminal input">farm templates</span> to see available templates</span>
        </div>
        <div>
          <span style="color: var(--palette-primary, #00d4ff);">💡</span>
          <span style="margin-left: 8px;">Use <span class="omega-help-command" data-command="farm networks" style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; text-decoration: underline; padding: 2px 4px; border-radius: 3px; transition: all 0.2s ease;" onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)';" onmouseout="this.style.background = 'transparent';" title="Click to add 'farm networks' to terminal input">farm networks</span> to see available networks</span>
        </div>
      </div>
    `;
    context.logHtml(usageHtml);
    context.log("", "output");
    return;
  }

  const template = getContractTemplate(templateId);
  if (!template) {
    context.log(`Template '${templateId}' not found`, "error");
    context.log("Use 'farm templates' to see available templates", "info");
    return;
  }

  // If network specified, validate it
  let network;
  if (networkId) {
    network = getFarmingNetwork(networkId);
    if (!network) {
      context.log(`Network '${networkId}' not found`, "error");
      return;
    }
    
    // Check if template supports this network
    if (!template.supportedNetworks.includes(networkId as any)) {
      context.log(`Template ${template.name} does not support ${network.name}`, "error");
      context.log(`Supported networks: ${template.supportedNetworks.join(", ")}`, "output");
      return;
    }
  } else {
    // Show interactive selection
    context.log(`📋 ${template.name}`, "info");
    context.log(`  Description: ${template.description}`, "output");
    context.log(`  Type: ${template.type}`, "output");
    context.log(`  Supported Networks: ${template.supportedNetworks.length}`, "output");
    if (template.estimatedGas) {
      context.log(`  Estimated Gas: ${template.estimatedGas}`, "output");
    }
    context.log("\n⚠️  Please specify a network: farm deploy <template-id> <network-id>", "warning");
    const usageHtml = createUsageError("farm deploy", [
      "farm deploy erc20-basic ethereum-testnet"
    ]);
    context.logHtml(usageHtml);
    context.log("", "output");
    return;
  }

  // Collect deployment parameters
  context.log(`\n📝 Deployment Parameters:`, "info");
  const params: Record<string, any> = {};
  
  // For now, show what parameters would be needed
  // In production, this would prompt for each parameter
  template.deploymentParams.forEach((param) => {
    if (param.required) {
      context.log(`  ${param.name} (${param.type}): [required]`, "output");
      params[param.name] = param.defaultValue || "";
    }
  });

  try {
    context.log(`\n🚀 Deploying ${template.name} to ${network.name}...`, "info");
    
    // Attempt deployment (will show appropriate message based on implementation state)
    const result = await deployContract(network, template, params, context);
    
    context.log(`\n✅ Contract deployed successfully!`, "success");
    context.log(`  Address: ${result.address}`, "output");
    context.log(`  Transaction: ${result.txHash}`, "output");
    context.log(`  Explorer: ${network.explorerUrl}/tx/${result.txHash}`, "output");
  } catch (error: any) {
    // Error already logged by deployContract
    context.log(`\n💡 Deployment requires contract compilation.`, "info");
    context.log(`   This feature is being enhanced with full contract deployment support.`, "output");
  }
}

async function handleFlow(context: any, args: string[]) {
  const flowId = args[2]?.toLowerCase();
  if (!flowId) {
    const usageHtml = createUsageError("farm flow", [
      "farm flow layerzero-bridge-flow"
    ]);
    context.logHtml(usageHtml);
    context.log("", "output");
    return;
  }

  showComingSoon(
    context,
    "Automated Farming Flow",
    "This will execute an automated or semi-automated farming flow with step-by-step guidance."
  );

  // Preview flow info
  const flow = getFarmingFlow(flowId);
  if (flow) {
    context.log(`\n📋 ${flow.name} (Preview):`, "info");
    context.log(`  Description: ${flow.description}`, "output");
    context.log(`  Network: ${flow.network}`, "output");
    context.log(`  Automation: ${flow.automationLevel}`, "output");
    context.log(`  Steps: ${flow.steps.length}`, "output");
    if (flow.estimatedTime) {
      context.log(`  Estimated Time: ${flow.estimatedTime}`, "output");
    }
  } else {
    context.log(`Flow '${flowId}' not found`, "error");
  }
}

async function handleLinks(context: any, args: string[]) {
  const opportunityId = args[2]?.toLowerCase();
  if (!opportunityId) {
    const usageHtml = createUsageError("farm links", [
      "farm links layerzero-testnet"
    ]);
    context.logHtml(usageHtml);
    context.log("", "output");
    return;
  }

  try {
    const allOpportunities = await fetchFarmingOpportunities();
    let opportunity = allOpportunities.find((opp) => opp.id === opportunityId);
    
    if (!opportunity) {
      opportunity = getFarmingOpportunity(opportunityId);
    }

    if (!opportunity) {
      context.log(`Opportunity '${opportunityId}' not found`, "error");
      return;
    }

    context.log(`\n🔗 ${opportunity.name} - Community Links`, "info");
    context.log("═══════════════════════════════════════", "output");
    
    let hasLinks = false;
    
    if (opportunity.discordUrl) {
      context.log(`\n  💬 Discord:`, "info");
      context.log(`     ${opportunity.discordUrl}`, "output");
      hasLinks = true;
    }
    
    if (opportunity.telegramUrl) {
      context.log(`\n  📱 Telegram:`, "info");
      context.log(`     ${opportunity.telegramUrl}`, "output");
      hasLinks = true;
    }
    
    if (opportunity.websiteUrl) {
      context.log(`\n  🌐 Website:`, "info");
      context.log(`     ${opportunity.websiteUrl}`, "output");
      hasLinks = true;
    }

    if (opportunity.explorerUrl) {
      context.log(`\n  🔍 Explorer:`, "info");
      context.log(`     ${opportunity.explorerUrl}`, "output");
      hasLinks = true;
    }

    if (!hasLinks) {
      context.log("  No community links available for this opportunity", "warning");
    }
  } catch (error: any) {
    context.log(`Error fetching links: ${error.message}`, "error");
  }
}

async function handleNetworks(context: any) {
  showComingSoon(
    context,
    "Supported Networks",
    "This will list all supported testnet networks with their configurations."
  );

  context.log("\n🌐 Supported Testnet Networks (Preview):", "info");
  context.log("═══════════════════════════════════", "output");
  FARMING_NETWORKS.forEach((network) => {
    context.log(`\n${network.name}`, "output");
    context.log(`  ID: ${network.id}`, "output");
    context.log(`  Type: ${network.type}`, "output");
    context.log(`  Native Token: ${network.nativeToken}`, "output");
    if (network.faucetUrl) {
      context.log(`  Faucet: ${network.faucetUrl}`, "output");
    }
  });
}

async function handleTemplates(context: any) {
  showComingSoon(
    context,
    "Contract Templates",
    "This will list all available contract templates for deployment."
  );

  context.log("\n📄 Available Contract Templates (Preview):", "info");
  context.log("═══════════════════════════════════", "output");
  CONTRACT_TEMPLATES.forEach((template) => {
    context.log(`\n${template.name}`, "output");
    context.log(`  ID: ${template.id}`, "output");
    context.log(`  Type: ${template.type}`, "output");
    context.log(`  Description: ${template.description}`, "output");
    context.log(`  Supported Networks: ${template.supportedNetworks.length}`, "output");
  });
}

async function handleStableNetwork(context: any, args: string[] = []) {
  const subcommand = args[2]?.toLowerCase();
  
  if (subcommand === "token-creator") {
    const tokenCreatorHtml = `
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent), color-mix(in srgb, var(--palette-secondary, #00ff88) 10%, transparent));
        border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
        border-radius: 12px;
        padding: 20px;
        margin: 10px 0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      ">
        <div style="
          font-size: 18px;
          font-weight: 600;
          color: var(--palette-primary, #00d4ff);
          margin-bottom: 16px;
          text-shadow: 0 0 8px color-mix(in srgb, var(--palette-primary, #00d4ff) 40%, transparent);
        ">🪙 TOKEN CREATOR</div>
        
        <div style="
          font-size: 13px;
          color: var(--palette-text, #ccd4e0);
          line-height: 1.8;
          margin-bottom: 12px;
        ">
          <div style="margin-bottom: 12px;">Create and deploy tokens on Stable Network testnet.</div>
          <div style="margin-bottom: 8px;"><strong style="color: var(--palette-primary, #00d4ff);">Network:</strong> Stable Testnet (Chain ID: 2201)</div>
          <div style="margin-bottom: 8px;"><strong style="color: var(--palette-primary, #00d4ff);">Gas Token:</strong> gUSDT</div>
          <div style="margin-bottom: 8px;"><strong style="color: var(--palette-primary, #00d4ff);">Standard:</strong> ERC-20 (EVM Compatible)</div>
        </div>
        
        <div style="
          margin-top: 20px;
          padding: 12px;
          background: color-mix(in srgb, var(--palette-warning, #ffaa00) 10%, transparent);
          border: 1px solid color-mix(in srgb, var(--palette-warning, #ffaa00) 30%, transparent);
          border-radius: 6px;
          font-size: 12px;
          color: var(--palette-text, #ccd4e0);
        ">
          <span style="color: var(--palette-warning, #ffaa00);">🚧</span>
          <span style="margin-left: 8px;">Token Creator feature coming soon. Use the deploy command to create tokens.</span>
        </div>
      </div>
    `;
    context.logHtml(tokenCreatorHtml);
    context.log("", "output");
    return;
  }
  
  if (subcommand === "transactions") {
    // Delegate to stable transactions handler
    await handleStableTransactions(context, args);
    return;
  }
  
  // Default: Show network information
  const stableNetworkHtml = `
    <div style="
      background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent), color-mix(in srgb, var(--palette-secondary, #00ff88) 10%, transparent));
      border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
      border-radius: 12px;
      padding: 20px;
      margin: 10px 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    ">
      <div style="
        font-size: 18px;
        font-weight: 600;
        color: var(--palette-primary, #00d4ff);
        margin-bottom: 16px;
        text-shadow: 0 0 8px color-mix(in srgb, var(--palette-primary, #00d4ff) 40%, transparent);
      ">🌐 STABLE NETWORK</div>
      
      <div style="
        font-size: 14px;
        font-weight: 600;
        color: var(--palette-secondary, #00ff88);
        margin: 16px 0 12px 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      ">Network Information</div>
      
      <div style="
        font-size: 13px;
        color: var(--palette-text, #ccd4e0);
        line-height: 1.8;
        margin-bottom: 12px;
      ">
        <div style="margin-bottom: 8px;"><strong style="color: var(--palette-primary, #00d4ff);">Network Name:</strong> Stable Testnet</div>
        <div style="margin-bottom: 8px;"><strong style="color: var(--palette-primary, #00d4ff);">Chain ID:</strong> 2201</div>
        <div style="margin-bottom: 8px;"><strong style="color: var(--palette-primary, #00d4ff);">Currency Symbol:</strong> gUSDT</div>
        <div style="margin-bottom: 8px;"><strong style="color: var(--palette-primary, #00d4ff);">Genesis Hash:</strong> 66afbb6e57e6faf019b3021de299125cddab61d433f28894db751252f5b8eaf2</div>
        <div style="margin-bottom: 8px;"><strong style="color: var(--palette-primary, #00d4ff);">Block Time:</strong> ~0.7 seconds</div>
        <div style="margin-bottom: 8px;"><strong style="color: var(--palette-primary, #00d4ff);">Address Format:</strong> 0x... (EVM)</div>
        <div style="margin-bottom: 8px;"><strong style="color: var(--palette-primary, #00d4ff);">Gas Token:</strong> gUSDT</div>
        <div style="margin-bottom: 8px;"><strong style="color: var(--palette-primary, #00d4ff);">Decimals:</strong> 18</div>
      </div>
      
      <div style="
        font-size: 14px;
        font-weight: 600;
        color: var(--palette-secondary, #00ff88);
        margin: 20px 0 12px 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      ">Endpoints & Links</div>
      
      <div style="
        font-size: 13px;
        color: var(--palette-text, #ccd4e0);
        line-height: 1.8;
        margin-bottom: 12px;
      ">
        <div style="margin-bottom: 8px;"><strong style="color: var(--palette-primary, #00d4ff);">RPC Endpoint:</strong> <a href="https://rpc.testnet.stable.xyz" target="_blank" style="color: var(--palette-secondary, #00ff88); text-decoration: none;">https://rpc.testnet.stable.xyz</a></div>
        <div style="margin-bottom: 8px;"><strong style="color: var(--palette-primary, #00d4ff);">WebSocket:</strong> <a href="wss://rpc.testnet.stable.xyz" target="_blank" style="color: var(--palette-secondary, #00ff88); text-decoration: none;">wss://rpc.testnet.stable.xyz</a></div>
        <div style="margin-bottom: 8px;"><strong style="color: var(--palette-primary, #00d4ff);">Block Explorer:</strong> <a href="https://testnet.stablescan.xyz" target="_blank" style="color: var(--palette-secondary, #00ff88); text-decoration: none;">Stablescan</a></div>
        <div style="margin-bottom: 8px;"><strong style="color: var(--palette-primary, #00d4ff);">Faucet:</strong> <a href="https://faucet.stable.xyz" target="_blank" style="color: var(--palette-secondary, #00ff88); text-decoration: none;">https://faucet.stable.xyz</a></div>
      </div>
    </div>
  `;
  
  context.logHtml(stableNetworkHtml);
  context.log("", "output");
}

async function handleHelp(context: any) {
  const helpHtml = `
    <div style="
      background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent), color-mix(in srgb, var(--palette-secondary, #00ff88) 10%, transparent));
      border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
      border-radius: 12px;
      padding: 20px;
      margin: 10px 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    ">
      <div style="
        font-size: 18px;
        font-weight: 600;
        color: var(--palette-primary, #00d4ff);
        margin-bottom: 16px;
        text-shadow: 0 0 8px color-mix(in srgb, var(--palette-primary, #00d4ff) 40%, transparent);
      ">🌾 FARMING COMMANDS</div>
      
      <div style="
        font-size: 14px;
        font-weight: 600;
        color: var(--palette-secondary, #00ff88);
        margin: 16px 0 12px 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      ">📋 Available Commands</div>
      
      ${createCommandLine("farm list", "List all farming opportunities")}
      ${createCommandLine("farm search <network>", "Search opportunities by network")}
      ${createCommandLine("farm info <id>", "Show detailed opportunity info")}
      ${createCommandLine("farm deploy <template>", "Deploy contract template")}
      ${createCommandLine("farm flow <id>", "Execute automated farming flow")}
      ${createCommandLine("farm links <id>", "Show Discord/Telegram links")}
      ${createCommandLine("farm networks", "List supported testnet networks")}
      ${createCommandLine("farm templates", "List available contract templates")}
      ${createCommandLine("farm help", "Show this help message")}
      
      <div style="
        font-size: 14px;
        font-weight: 600;
        color: var(--palette-secondary, #00ff88);
        margin: 20px 0 12px 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      ">🎯 Examples</div>
      
      ${createCommandLine("farm list", "List all opportunities")}
      ${createCommandLine("farm search ethereum-testnet", "Search by network")}
      ${createCommandLine("farm info layerzero-testnet", "Get opportunity details")}
      ${createCommandLine("farm deploy erc20-basic", "Deploy ERC20 token")}
      ${createCommandLine("farm flow layerzero-bridge-flow", "Execute farming flow")}
      ${createCommandLine("farm links layerzero-testnet", "Get community links")}
      
      <div style="
        margin-top: 20px;
        padding: 12px;
        background: color-mix(in srgb, var(--palette-warning, #ffaa00) 10%, transparent);
        border: 1px solid color-mix(in srgb, var(--palette-warning, #ffaa00) 30%, transparent);
        border-radius: 6px;
        font-size: 12px;
        color: var(--palette-text, #ccd4e0);
      ">
        <span style="color: var(--palette-warning, #ffaa00);">🚧</span>
        <span style="margin-left: 8px;">NOTE: All features are currently in development. Commands will show preview data and 'coming soon' messages.</span>
      </div>
    </div>
  `;
  
  context.logHtml(helpHtml);
  context.log("", "output");
}


export const farmCommand: Command = {
  name: "farm",
  aliases: ["farming", "crypto-farm"],
  description: "Testnet farming, contract deployment, and automated flows",
  usage: "farm <list|search|info|deploy|flow|links|networks|templates|help>",
  category: "farming",
  handler: async (context, args) => {
    const subcommand = (args[1] || "help").toLowerCase();

    switch (subcommand) {
      case "list":
        await handleList(context);
        break;
      case "search":
        await handleSearch(context, args);
        break;
      case "info":
        await handleInfo(context, args);
        break;
      case "deploy":
        await handleDeploy(context, args);
        break;
      case "flow":
        await handleFlow(context, args);
        break;
      case "links":
        await handleLinks(context, args);
        break;
      case "networks":
        await handleNetworks(context);
        break;
      case "templates":
        await handleTemplates(context);
        break;
      case "stable-network":
      case "stable":
        await handleStableNetwork(context, args);
        break;
      case "help":
      default:
        await handleHelp(context);
        break;
    }
  },
};

export const farmingCommands: Command[] = [farmCommand];

