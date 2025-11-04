# ChainGPT AI NFT Generator Integration

## Overview
Complete integration of [ChainGPT's AI NFT Generator](https://docs.chaingpt.org/dev-docs-b2b-saas-api-and-sdk/ai-nft-generator-api-and-sdk/javascript/quickstart-guide) into Omega Terminal, allowing users to generate AI-powered NFT images directly from the command line with uniform terminal styling.

## Implementation Date
October 17, 2025

## Features

### 🎨 AI NFT Generation
- Generate NFT images from text prompts using advanced AI models
- Multiple AI models: VeloGen, Nebula Forge XL, Visionary Forge, DALL-E 3
- 17+ art styles: neon-punk, anime, cinematic, 3d-model, photographic, etc.
- HD enhancement options (1x, 2x upscaling)
- AI-powered prompt enhancement

### ⛓️ Blockchain Support
- Multi-chain minting capabilities
- BNB Smart Chain (default)
- Support for multiple EVM chains
- IPFS metadata storage
- On-chain NFT creation

### 💰 Credit System
- Pay-per-use credit model
- Standard models: 1 credit per image
- DALL-E 3: 4.75 credits per image
- HD Enhance: +1 credit
- Prompt enhancement: 0.5 credits

## Commands

### Getting Started

#### Initialize API Key
```bash
nft init <api-key>
```
Set up your ChainGPT API key. Get yours at https://api.chaingpt.org

**Example:**
```bash
nft init sk_chaingpt_abc123xyz456
```

#### Check Status
```bash
nft status
```
View API configuration and connection status

### Image Generation

#### Generate NFT
```bash
nft generate "<prompt>" [options]
```

**Options:**
- `--model=<name>` - Choose AI model (velogen, nebula_forge_xl, Dale3)
- `--style=<name>` - Art style (neon-punk, anime, cinematic, etc.)
- `--enhance` - Enable HD upscaling (+1 credit)

**Examples:**
```bash
# Basic generation
nft generate "cyberpunk samurai warrior"

# With specific style
nft generate "cute robot friend" --style=3d-model

# Premium model with enhancement
nft generate "epic dragon breathing fire" --model=Dale3 --enhance

# Neon-punk style
nft generate "futuristic city skyline" --style=neon-punk

# Anime style
nft generate "magical girl with sword" --style=anime
```

#### Enhance Prompt
```bash
nft enhance "<prompt>"
```
Improve your prompt using AI for better results (0.5 credits)

**Example:**
```bash
nft enhance "cat wizard"
```
Output might be:
```
Original: cat wizard
Enhanced: A majestic wizard cat with flowing robes and magical staff, 
          casting spells in an ancient library, highly detailed, 
          fantasy art, magical atmosphere
```

### NFT Minting

#### Mint Generated NFT
```bash
nft mint <collection-id>
```
Mint your generated NFT image on-chain

**Example:**
```bash
# After generating an image, use the collection ID
nft mint abc123-collection-id
```

### Information Commands

#### List AI Models
```bash
nft models
```
Show all available AI models with descriptions

**Output:**
- `velogen` - VeloGen - Fast generation
- `nebula_forge_xl` - Nebula Forge XL - High quality
- `VisionaryForge` - Visionary Forge - Creative
- `Dale3` - DALL-E 3 - Premium (4.75 credits)

#### List Art Styles
```bash
nft styles
```
Show all available art styles

**Available Styles:**
- 3d-model
- analog-film
- anime
- cinematic
- comic-book
- digital-art
- enhance
- fantasy-art
- isometric
- line-art
- low-poly
- neon-punk
- origami
- photographic
- pixel-art
- texture
- craft-clay

#### Show Supported Chains
```bash
nft chains
```
List all supported blockchain networks for minting

#### Detailed Help
```bash
nft help
```
Show comprehensive help with all commands and examples

## Quick Actions

Access ChainGPT NFT features via the sidebar **NFT Tools** section:

### Quick Action Buttons
1. **🎨 Generate AI NFT** - Opens prompt input for generation
2. **🤖 AI Models** - Lists available models
3. **🎭 Art Styles** - Shows art style options
4. **✨ Enhance Prompt** - AI-powered prompt improvement
5. **📊 Trending NFTs** - Browse trending NFTs (OpenSea)
6. **❓ NFT Help** - Show help documentation

## Technical Implementation

### Files Created/Modified

#### 1. `js/commands/chaingpt-nft.js` (NEW)
- Complete command handler module
- API integration layer
- Error handling
- Terminal output formatting
- ~700 lines of code

**Key Functions:**
- `ChainGPTNFT.init()` - Initialize API
- `ChainGPTNFT.generateImage()` - Generate NFT
- `ChainGPTNFT.enhancePrompt()` - Enhance prompts
- `ChainGPTNFT.mintNFT()` - Mint on-chain
- `ChainGPTNFT.getChains()` - Get blockchain list
- `ChainGPTCommands.nft()` - Main command handler

#### 3. `js/terminal-core.js`
Updated NFT command routing:
```javascript
case 'nft':
    if (window.ChainGPTCommands && window.ChainGPTCommands.nft) {
        await window.ChainGPTCommands.nft(this, args);
    } else {
        await OmegaCommands.Remaining.createNFT(this, args);
    }
    break;
```

#### 4. `js/commands/basic.js`
Added NFT commands to help system:
- Updated help menu
- Added AI & NFT section
- Included quick examples

#### 5. `js/futuristic/futuristic-dashboard-transform.js`
Updated NFT Tools quick actions:
- 6 new quick action buttons
- Integrated with command system
- Terminal-styled UI

#### 6. `index.html`
Added script tag:
```html
<script src="js/commands/chaingpt-nft.js"></script>
```

## API Integration

### Authentication
All API calls use Bearer token authentication:
```javascript
headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
}
```

### Base URL
```
https://api.chaingpt.org
```

### Endpoints Used

#### Generate NFT
```
POST /api/v1/nft/generate-nft
```
Payload:
```json
{
  "prompt": "your prompt here",
  "model": "nebula_forge_xl",
  "num_images": 1,
  "height": 1024,
  "width": 1024,
  "guidance_scale": 7.5,
  "num_inference_steps": 30,
  "style": "photographic",
  "enhance": "1x"
}
```

#### Enhance Prompt
```
POST /api/v1/nft/enhancePrompt
```
Payload:
```json
{
  "prompt": "simple prompt"
}
```

#### Mint NFT
```
POST /api/v1/nft/mint-nft
```
Payload:
```json
{
  "collectionId": "collection-id",
  "name": "NFT Name",
  "description": "Description",
  "symbol": "SYMBOL",
  "chain": "BNB Smart Chain (Mainnet)",
  "ids": [1, 2, 3]
}
```

#### Get Chains
```
GET /api/v1/nft/get-chains
```

#### Get ABI
```
GET /api/v1/nft/abi
```

### Error Handling

The integration includes comprehensive error handling:

**Common Errors:**
- `401 Unauthorized` - Invalid API key or insufficient credits
- `400 Bad Request` - Invalid parameters or exceeded limits
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server-side issue

**Error Display:**
```javascript
terminal.log(`❌ Error: ${error.message}`, 'error');
if (error.message.includes('401')) {
    terminal.log('💡 Check your API key or credits at: https://api.chaingpt.org', 'info');
}
```

## Pricing & Credits

### Credit Costs

| Operation | Credits | Notes |
|-----------|---------|-------|
| Standard Generation | 1 | VeloGen, Nebula, VisionaryForge |
| DALL-E 3 Generation | 4.75 | Premium model |
| HD Enhancement (1x) | +1 | Additional upscaling |
| HD Enhancement (2x) | +1 | Maximum upscaling |
| Prompt Enhancement | 0.5 | AI prompt improvement |
| Mint NFT | 0 | Blockchain gas fees separate |
| View Models/Styles | 0 | Free information |

### Credit Management

**Check Credits:**
Visit https://api.chaingpt.org to view your balance

**Purchase Credits:**
Available through the ChainGPT dashboard

**API Dashboard:**
Monitor usage and manage API keys at https://api.chaingpt.org

## Terminal Styling

### Output Formatting

The integration uses terminal-consistent styling:

**Success Messages:**
```javascript
terminal.log('✅ NFT Generated Successfully!', 'success');
```

**Info Messages:**
```javascript
terminal.log('🎨 Generating NFT image...', 'info');
```

**Error Messages:**
```javascript
terminal.log('❌ Generation failed: error message', 'error');
```

**Image Display:**
```javascript
terminal.logHtml(`<img src="${imageUrl}" alt="Generated NFT" 
    style="max-width: 400px; border: 2px solid var(--cyber-blue); 
    border-radius: 8px; margin: 10px 0;">`, 'output');
```

### Theme Compatibility

The integration works seamlessly with all terminal themes:
- ✅ Dark Mode
- ✅ Light Mode
- ✅ Futuristic Theme
- ✅ Basic Terminal Mode
- ✅ Apple UI Theme
- ✅ Mobile Views

Images are styled to match the active theme using CSS variables.

## Usage Examples

### Example 1: Quick NFT Generation
```bash
# Initialize (first time only)
nft init sk_chaingpt_your_api_key

# Generate a simple NFT
nft generate "magical forest with glowing mushrooms"
```

### Example 2: Advanced Generation
```bash
# Generate with specific style and model
nft generate "cyberpunk street market at night" --style=neon-punk --model=nebula_forge_xl
```

### Example 3: Prompt Enhancement Workflow
```bash
# Start with basic prompt
nft enhance "space station"

# Use enhanced prompt for generation
nft generate "A detailed futuristic space station orbiting Earth, 
              with massive solar panels and docking bays, 
              sci-fi concept art, cinematic lighting" --style=cinematic
```

### Example 4: Premium Quality
```bash
# Use DALL-E 3 with HD enhancement
nft generate "fantasy castle on floating island" --model=Dale3 --enhance
```

### Example 5: Complete Workflow
```bash
# 1. Enhance prompt
nft enhance "dragon rider"

# 2. Generate with enhanced prompt
nft generate "Epic dragon rider soaring through stormy clouds..." --style=fantasy-art

# 3. Mint the generated NFT (use collection ID from generation)
nft mint collection-id-here
```

## Mobile Support

The NFT generator is fully optimized for mobile:
- ✅ Touch-friendly quick actions
- ✅ Responsive image display
- ✅ Mobile-optimized command input
- ✅ Proper scaling for small screens
- ✅ All commands work on mobile

## Troubleshooting

### API Key Issues

**Problem:** `401 Unauthorized`
**Solutions:**
1. Verify API key is correct
2. Check if key is active in dashboard
3. Ensure sufficient credits

**Problem:** Credits depleted
**Solutions:**
1. Visit https://api.chaingpt.org
2. Purchase additional credits
3. Check current balance in dashboard

### Generation Issues

**Problem:** Image quality poor
**Solutions:**
1. Use `nft enhance` to improve prompt
2. Try different AI models
3. Use `--enhance` flag for HD quality
4. Adjust art style with `--style`

**Problem:** Generation fails
**Solutions:**
1. Check prompt length (not too long/short)
2. Verify model name is correct
3. Try different parameters
4. Check API status

### Minting Issues

**Problem:** Mint fails
**Solutions:**
1. Verify collection ID is correct
2. Check blockchain network status
3. Ensure wallet has sufficient gas
4. Try different blockchain

## Best Practices

### Prompt Writing

**Good Prompts:**
- Be specific and descriptive
- Include style keywords
- Mention lighting/atmosphere
- Describe composition

**Example:**
```
"A majestic phoenix rising from flames, 
 vibrant red and gold feathers, 
 dramatic lighting, 
 fantasy art style, 
 detailed wings"
```

**Poor Prompts:**
- Too vague: "bird"
- Too generic: "cool picture"
- Too complex: multiple unrelated concepts

### Credit Optimization

1. **Start with standard models** - Test with 1-credit models first
2. **Use prompt enhancement** - 0.5 credits for better results
3. **Reserve DALL-E 3** - Use for final/important generations
4. **Batch similar prompts** - Generate variations efficiently

### Workflow Recommendations

1. **Explore → Enhance → Generate → Refine**
   - Browse styles with `nft styles`
   - Enhance prompts before generating
   - Generate with appropriate model
   - Refine based on results

2. **Test Before Minting**
   - Generate multiple variations
   - Choose best result
   - Then mint on-chain

## Resources

### Documentation
- **ChainGPT Docs:** https://docs.chaingpt.org
- **API Reference:** https://docs.chaingpt.org/dev-docs-b2b-saas-api-and-sdk/ai-nft-generator-api-and-sdk/javascript/api-reference
- **SDK Reference:** https://docs.chaingpt.org/dev-docs-b2b-saas-api-and-sdk/ai-nft-generator-api-and-sdk/javascript/sdk-reference

### Dashboards
- **API Dashboard:** https://api.chaingpt.org
- **ChainGPT Platform:** https://chaingpt.org

### Support
- **Discord:** https://discord.gg/chaingpt
- **Twitter:** https://twitter.com/ChainGPT
- **Telegram:** https://t.me/chaingpt

## Future Enhancements

Potential upcoming features:
- Batch generation support
- Custom model parameters
- NFT collection management
- Advanced minting options
- Image variation generation
- Style transfer capabilities
- Integration with wallet for gas-free minting
- NFT marketplace integration

## Version History

### v1.0.0 (October 17, 2025)
- ✅ Initial integration
- ✅ All core commands implemented
- ✅ Quick action buttons added
- ✅ Help system updated
- ✅ Full terminal styling
- ✅ Mobile support
- ✅ Error handling
- ✅ Multi-theme compatibility

## License

This integration uses the ChainGPT API and is subject to ChainGPT's terms of service. API usage requires a valid API key and credits.

## Contributing

To extend this integration:
1. Review `js/commands/chaingpt-nft.js`
2. Add new functions to `ChainGPTNFT` object
3. Create command handlers in `ChainGPTCommands`
4. Update help system
5. Add quick actions if needed
6. Update documentation

## Credits

- **ChainGPT:** AI NFT Generator API & SDK
- **Omega Terminal:** Terminal integration
- **Documentation:** ChainGPT official docs

---

**Status:** ✅ Production Ready

Last updated: October 17, 2025

