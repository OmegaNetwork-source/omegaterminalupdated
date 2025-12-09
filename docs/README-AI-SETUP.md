# 🤖 OMEGA TERMINAL AI SETUP GUIDE

## **🚀 NEW AI FEATURES ADDED!**

Your Omega Terminal now includes **intelligent AI command execution** powered by OpenAI GPT-4!

---

## **⚡ WHAT'S NEW**

### **🧠 AI Command System**
- **Smart Command Execution**: AI can run terminal commands for you
- **Natural Language**: Talk to your terminal like a human assistant
- **Safety First**: Financial commands require explicit confirmation
- **Conversational**: Maintains context throughout your session

### **💬 Example Conversations**
```
You: "Check my wallet balance"
AI: 🤖 I'll check your wallet balance for you.
AI: 🚀 Executing: balance
[Shows your current OMEGA balance]

You: "Help me mine some tokens"  
AI: ⚠️ This command requires confirmation: Mine OMEGA tokens using the relayer system
AI: Type "yes" to proceed with: mine
You: yes
AI: 🤖 Confirmed! Executing: mine
[Starts mining process]
```

---

## **🔧 SETUP INSTRUCTIONS**

### **1. Get OpenAI API Key**
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-...`)

### **2. Create Environment File**
Create a `.env` file in your project root with:

```env
# 🤖 AI CONFIGURATION
OPENAI_API_KEY=sk-your_openai_api_key_here

# 🔑 BLOCKCHAIN CONFIGURATION  
RELAYER_PRIVATE_KEY=0x_your_relayer_private_key_here

# 📈 OTHER APIs
ALPHA_VANTAGE_API_KEY=Y4N6LC9U5OH8Q4MQ
GEMINI_API_KEY=your_gemini_api_key_here

# 🌐 SERVER
PORT=4000
NODE_ENV=production
```

### **3. Install Dependencies** 
```bash
npm install
```

### **4. Start the Server**
```bash
npm start
```

---

## **🎯 HOW TO USE THE AI**

### **Basic AI Commands**
- `ai help` - Show AI help and examples
- `ai on` - Enable AI command execution mode  
- `ai off` - Disable command execution (info only)
- `ai clear` - Clear conversation history

### **Natural Language Examples**
- "Check my wallet balance"
- "Mine some OMEGA tokens for me"
- "Find Bitcoin price on DexScreener"
- "Show trending tokens on GeckoTerminal"  
- "What's the current stock price of Tesla?"
- "Connect my wallet and check my balance"

### **Safety Features**
- 🛡️ **Confirmation Required**: Financial commands need explicit "yes"
- ⚡ **Command Validation**: AI can only run safe, approved commands
- 💬 **Clear Explanations**: AI explains what it's about to do
- 🔒 **User Control**: You can enable/disable command execution anytime

---

## **📊 AVAILABLE AI COMMANDS**

| **Category** | **Commands** | **AI Can Execute** |
|--------------|--------------|-------------------|
| **Wallet** | connect, balance, disconnect | ✅ Safe |
| **Market Data** | dexscreener, geckoterminal, stock | ✅ Safe |
| **Blockchain** | faucet, mine, claim, send | ⚠️ Requires Confirmation |
| **Utility** | help, clear, status, theme | ✅ Safe |
| **Advanced** | solana, eclipse, hyperliquid | ✅ Safe |

---

## **🔥 EXAMPLE WORKFLOWS**

### **Trading Research**
```
You: "Show me trending crypto on DexScreener and find SOL price"
AI: 🚀 I'll check trending tokens and SOL price for you
[Executes both commands automatically]
```

### **Mining Setup**  
```
You: "Connect my wallet, check balance, and start mining"
AI: 🚀 I'll help you set up mining - connecting wallet first
[Walks through each step with confirmations]
```

### **Portfolio Check**
```
You: "Check my OMEGA balance and show me current market data"
AI: 🚀 Checking your portfolio and getting market updates
[Shows complete portfolio overview]
```

---

## **⚠️ IMPORTANT NOTES**

1. **API Costs**: OpenAI charges per API call (~$0.01-0.03 per conversation)
2. **Rate Limits**: OpenAI has daily usage limits for new accounts  
3. **Privacy**: Conversations are sent to OpenAI (not stored permanently)
4. **Fallback**: If OpenAI is unavailable, terminal commands still work manually

---

## **🔧 TROUBLESHOOTING**

### **"AI API Error"**
- Check your OpenAI API key is correct
- Verify you have API credits in your OpenAI account
- Ensure your internet connection is stable

### **"Failed to query AI"**  
- Your API key might be invalid
- You may have exceeded rate limits
- OpenAI service might be temporarily down

### **Commands Not Executing**
- Make sure AI mode is enabled: `ai on`  
- Check that you've confirmed dangerous commands with "yes"
- Verify the command exists: `help` to see available commands

---

## **🎉 ENJOY YOUR AI-POWERED TERMINAL!**

Your Omega Terminal is now **10x smarter**! Talk to it naturally and let the AI handle the complex commands while you focus on trading and building.

**Need help?** Type `ai help` in your terminal for interactive guidance! 