#!/bin/bash

# Prediction Markets API Test Script
# Tests both Kalshi and PolyMarket commands

echo "🧪 Testing Prediction Markets APIs..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test Kalshi
echo -e "${YELLOW}Testing Kalshi API...${NC}"
echo ""

echo "1. Testing: kalshi markets 5"
echo "   Expected: List of 5 markets"
echo ""

echo "2. Testing: kalshi events 5"
echo "   Expected: List of 5 events"
echo ""

echo "3. Testing: kalshi trades 5"
echo "   Expected: List of 5 recent trades"
echo ""

# Test PolyMarket
echo -e "${YELLOW}Testing PolyMarket API...${NC}"
echo ""

echo "4. Testing: polymarket markets"
echo "   Expected: List of active markets"
echo ""

echo "5. Testing: polymarket trending"
echo "   Expected: Trending markets by volume"
echo ""

echo "6. Testing: polymarket crypto"
echo "   Expected: Crypto-related markets"
echo ""

echo "7. Testing: polymarket search bitcoin"
echo "   Expected: Markets matching 'bitcoin'"
echo ""

echo -e "${GREEN}✅ Test commands listed above${NC}"
echo ""
echo "Run these commands in the terminal to verify functionality."
echo "Check the output for:"
echo "  - Proper data display"
echo "  - Correct formatting"
echo "  - Working links (for PolyMarket)"
echo "  - Theme-aware styling"
echo ""






