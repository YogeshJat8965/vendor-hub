#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 VendorHub - One-Click Build & Deploy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Build Backend
echo -e "${BLUE}📦 Step 1/3: Building Backend...${NC}"
echo ""
cd marketplace-backend
mvn clean package -DskipTests

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend built successfully!${NC}"
    echo "   📁 JAR file: marketplace-backend/target/marketplace-backend-1.0.0.jar"
    echo ""
else
    echo -e "${RED}❌ Backend build failed!${NC}"
    exit 1
fi

cd ..

# Step 2: Build Frontend
echo -e "${BLUE}📦 Step 2/3: Building Frontend...${NC}"
echo ""
cd marketplace-frontend
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend built successfully!${NC}"
    echo "   📁 Output: marketplace-frontend/.next/"
    echo ""
else
    echo -e "${RED}❌ Frontend build failed!${NC}"
    exit 1
fi

cd ..

# Step 3: Ready to Deploy
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Build Complete! Ready to Deploy${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}📋 Next Steps for Deployment:${NC}"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Option 1: Deploy via CLI (Fastest)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Deploy Frontend:"
echo "   cd marketplace-frontend"
echo "   vercel --prod"
echo ""
echo "🔧 Deploy Backend:"
echo "   cd marketplace-backend"
echo "   railway up"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Option 2: Deploy via Web (No CLI needed)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Frontend (Vercel):"
echo "   1. Go to: https://vercel.com"
echo "   2. Click 'Import Project'"
echo "   3. Select: marketplace-frontend folder"
echo "   4. Click Deploy"
echo ""
echo "🔧 Backend (Railway):"
echo "   1. Go to: https://railway.app"
echo "   2. Click 'New Project' → GitHub"
echo "   3. Select: marketplace-backend folder"
echo "   4. Click Deploy"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 After Deployment:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Copy Backend URL from Railway"
echo "2. Update Vercel Environment Variable:"
echo "   NEXT_PUBLIC_API_URL = <backend-url>"
echo "3. Redeploy Frontend"
echo "4. Demo is LIVE! 🎉"
echo ""

echo "⏱️  Estimated deployment time: ~10 minutes"
echo ""
