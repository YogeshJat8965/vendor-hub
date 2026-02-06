# VendorHub Deployment Guide

## Frontend Deployment (Vercel - Free & Fast)

### Option 1: Using Vercel CLI (Fastest)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Navigate to frontend directory:**
   ```bash
   cd marketplace-frontend
   ```

3. **Login to Vercel:**
   ```bash
   vercel login
   ```

4. **Deploy:**
   ```bash
   vercel --prod
   ```
   - Follow the prompts
   - Select your project settings
   - Vercel will give you a live URL

### Option 2: Using Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel auto-detects Next.js
6. Click "Deploy"
7. Your site will be live in 2-3 minutes!

**Important:** Update environment variables in Vercel:
- Go to Project Settings → Environment Variables
- Add: `NEXT_PUBLIC_API_URL` = your backend URL (see below)

---

## Backend Deployment (Railway - Free & Fast)

### Option 1: Railway (Recommended)

1. **Go to [railway.app](https://railway.app)**
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will detect Spring Boot automatically
6. Add environment variables:
   - `PORT=8080`
   - `SPRING_PROFILES_ACTIVE=prod`
   - MongoDB connection string (if using MongoDB Atlas)

### Option 2: Render

1. **Go to [render.com](https://render.com)**
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository
5. Settings:
   - **Environment:** Java
   - **Build Command:** `./mvnw clean package -DskipTests`
   - **Start Command:** `java -jar target/*.jar`
   - **Port:** 8080
6. Add environment variables

---

## MongoDB Deployment (MongoDB Atlas - Free)

1. **Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)**
2. Sign up for free
3. Create a free cluster (M0 - Free tier)
4. Create a database user
5. Whitelist all IPs: `0.0.0.0/0` (for demo)
6. Get connection string
7. Add to backend environment variables

---

## Quick Commands

### Frontend (Vercel)
```bash
cd marketplace-frontend
vercel --prod
```

### Backend (Local test before deployment)
```bash
cd marketplace-backend
./mvnw clean package
java -jar target/*.jar
```

---

## After Deployment

1. **Update Frontend API URL:**
   - In Vercel dashboard → Environment Variables
   - Set `NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app`
   - Redeploy frontend

2. **Update Backend CORS:**
   - Add your Vercel URL to allowed origins
   - Redeploy backend

3. **Test the demo:**
   - Visit your Vercel URL
   - Test all features

---

## Free Tier Limits

- **Vercel:** Unlimited deployments, 100GB bandwidth/month
- **Railway:** $5 free credit monthly, ~500 hours
- **Render:** 750 hours/month free tier
- **MongoDB Atlas:** 512MB storage free

---

## Estimated Deployment Time
- Frontend: 2-3 minutes
- Backend: 5-7 minutes
- Total: ~10 minutes for complete demo!
