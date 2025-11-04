# 🚀 Omega Terminal - Vercel Deployment Guide

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **ChainGPT API Key**: Get one from [api.chaingpt.org](https://api.chaingpt.org)
3. **GitHub Repository**: Fork or clone this repository

## 🔧 Deployment Steps

### 1. Fork/Clone the Repository
```bash
git clone https://github.com/your-username/omega-terminal.git
cd omega-terminal
```

### 2. Deploy to Vercel

#### Option A: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variable
vercel env add CHAINGPT_API_KEY
# Enter your ChainGPT API key when prompted
```

#### Option B: Deploy via Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables (see below)

### 3. Set Environment Variables

In your Vercel dashboard or via CLI:

```bash
# Set your ChainGPT API key
vercel env add CHAINGPT_API_KEY production
```

**Environment Variables:**
- `CHAINGPT_API_KEY`: Your ChainGPT API key from [api.chaingpt.org](https://api.chaingpt.org)

### 4. Configure Build Settings

Vercel will automatically detect this as a static site. The build process will:
1. Run `scripts/inject-env.js` to inject environment variables
2. Deploy the static files

## 🔑 API Key Configuration

### Production API Key (Recommended)
Set your ChainGPT API key as an environment variable in Vercel:
- **Variable Name**: `CHAINGPT_API_KEY`
- **Value**: Your ChainGPT API key
- **Environment**: Production, Preview, Development

### Fallback System
The system includes a robust fallback:
1. **Production API Key** (from Vercel env vars) - **Highest Priority**
2. **User Custom Keys** (set via commands) - **Medium Priority**  
3. **Default API Keys** (built-in) - **Fallback**

## 🎯 Features Available After Deployment

### ChainGPT AI Features
- ✅ **Chat**: AI-powered Web3 chatbot
- ✅ **NFT Generation**: Create AI-generated NFT images
- ✅ **Smart Contract Creator**: Generate Solidity contracts
- ✅ **Smart Contract Auditor**: Security analysis and auditing

### Commands That Work
```bash
# All these work with your production API key:
nft generate "cyberpunk city at night"
chat ask "What is DeFi?"
contract generate "ERC-20 token with minting"
auditor audit "contract MyToken { ... }"
```

## 🔧 Customization

### Custom Domain
1. Go to your Vercel project settings
2. Add your custom domain
3. Configure DNS settings

### Additional Environment Variables
You can add more environment variables in `vercel.json`:
```json
{
  "env": {
    "CHAINGPT_API_KEY": "@chaingpt_api_key",
    "CUSTOM_VAR": "@custom_var"
  }
}
```

## 🛠️ Development

### Local Development
```bash
# Install dependencies (if any)
npm install

# Start local server
npm run dev
# or
python -m http.server 8000
```

### Testing Environment Variables
```bash
# Set local environment variable
export CHAINGPT_API_KEY="your-api-key-here"

# Run build script
npm run build

# Start server
npm start
```

## 📊 Monitoring

### Vercel Analytics
- Enable Vercel Analytics in your dashboard
- Monitor usage and performance
- Track API key usage

### ChainGPT Usage
- Monitor your API key usage at [api.chaingpt.org](https://api.chaingpt.org)
- Set up usage alerts
- Manage billing and limits

## 🔒 Security Best Practices

1. **Never commit API keys** to your repository
2. **Use environment variables** for all sensitive data
3. **Enable Vercel's security features**
4. **Monitor API usage** regularly
5. **Rotate API keys** periodically

## 🆘 Troubleshooting

### Common Issues

#### API Key Not Working
```bash
# Check if environment variable is set
vercel env ls

# Redeploy after setting env var
vercel --prod
```

#### Build Failures
```bash
# Check build logs in Vercel dashboard
# Ensure all files are committed
git add .
git commit -m "Fix build issues"
git push
```

#### ChainGPT Features Not Loading
1. Check browser console for errors
2. Verify API key is correctly set
3. Check ChainGPT API status
4. Review network requests in DevTools

## 📞 Support

- **Vercel Support**: [vercel.com/help](https://vercel.com/help)
- **ChainGPT Support**: [docs.chaingpt.org](https://docs.chaingpt.org)
- **GitHub Issues**: Create an issue in this repository

## 🎉 Success!

Once deployed, your Omega Terminal will be available at:
- **Vercel URL**: `https://your-project.vercel.app`
- **Custom Domain**: `https://your-domain.com` (if configured)

All ChainGPT features will work with your production API key, and users can still override with their own keys if needed!
