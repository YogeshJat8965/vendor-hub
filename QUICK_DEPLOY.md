# 🚀 Quick Deployment Guide

## One-Command Build

```bash
npm run build
```

This will:
1. ✅ Build backend (Spring Boot JAR)
2. ✅ Build frontend (Next.js production build)

## OR Use the Script

```bash
./build-and-deploy.sh
```

---

## Available NPM Scripts

```json
npm run dev:frontend      // Start frontend dev server
npm run dev:backend       // Start backend dev server
npm run build:frontend    // Build frontend only
npm run build:backend     // Build backend only  
npm run build             // Build both (backend → frontend)
npm run deploy:vercel     // Deploy frontend to Vercel
npm run deploy            // Build + Deploy frontend
```

---

## 🎯 Fastest Deployment (10 minutes)

### 1️⃣ Build Everything
```bash
npm run build
```

### 2️⃣ Deploy Frontend (Vercel)
**Option A - CLI:**
```bash
cd marketplace-frontend
npm install -g vercel
vercel login
vercel --prod
```

**Option B - Web Dashboard:**
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel auto-detects Next.js
4. Click "Deploy" ✅

**You'll get a URL like:** `https://vendorhub.vercel.app`

---

### 3️⃣ Deploy Backend (Railway)
**Option A - CLI:**
```bash
cd marketplace-backend
npm install -g @railway/cli
railway login
railway init
railway up
```

**Option B - Web Dashboard (Easiest):**
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Choose `marketplace-backend` folder
6. Railway auto-detects Spring Boot
7. Click "Deploy" ✅

**You'll get a URL like:** `https://vendorhub-backend.railway.app`

---

### 4️⃣ Connect Frontend to Backend

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. Add this variable:
   ```
   NEXT_PUBLIC_API_URL = https://your-backend-url.railway.app
   ```

3. Go to **Deployments** tab → Click "..." → **Redeploy**

---

### 5️⃣ Setup Database (Optional - If using MongoDB)

**MongoDB Atlas (Free):**
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free M0 cluster (512MB)
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (all IPs for demo)
5. Get connection string
6. Add to **Railway** → Your Service → **Variables**:
   ```
   SPRING_DATA_MONGODB_URI = mongodb+srv://user:pass@cluster.mongodb.net/dbname
   ```

---

## ✅ Verification Checklist

- [ ] Backend builds successfully: `npm run build:backend`
- [ ] Frontend builds successfully: `npm run build:frontend`
- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Environment variable set in Vercel
- [ ] Frontend redeployed after env variable
- [ ] Website loads and works!

---

## 📦 What Gets Deployed

**Backend:**
- JAR file: `marketplace-backend/target/marketplace-backend-1.0.0.jar`
- Size: ~50-60MB
- Includes all dependencies

**Frontend:**
- Build folder: `marketplace-frontend/.next/`
- Optimized production bundle
- Static assets included

---

## 🔥 Pro Tips

1. **Use Web Dashboards** (easiest for first deployment)
   - No CLI installation needed
   - One-click deploy
   - Auto-detects project type

2. **Railway Config Files** (already created):
   - `railway.yaml` - Railway configuration
   - `render.yaml` - Render alternative
   - `Procfile` - Universal config

3. **Vercel Config** (already created):
   - `vercel.json` - Vercel configuration
   - Auto-deploys on git push (if connected)

4. **Free Tier Limits:**
   - Vercel: Unlimited deployments
   - Railway: $5 monthly credit (~500 hours)
   - MongoDB Atlas: 512MB free storage

---

## 🆘 Troubleshooting

**Backend build fails?**
```bash
cd marketplace-backend
mvn clean install
```

**Frontend build fails?**
```bash
cd marketplace-frontend
rm -rf node_modules .next
npm install
npm run build
```

**CORS errors after deployment?**
- Check backend allows your Vercel domain
- Update `application.yml` CORS settings

**API calls not working?**
- Verify `NEXT_PUBLIC_API_URL` in Vercel
- Must include `https://` protocol
- No trailing slash

---

## 📞 Quick Help

**View build output:**
```bash
npm run build 2>&1 | tee build.log
```

**Check backend JAR:**
```bash
ls -lh marketplace-backend/target/*.jar
```

**Test backend locally:**
```bash
java -jar marketplace-backend/target/marketplace-backend-1.0.0.jar
```

**Test frontend locally:**
```bash
cd marketplace-frontend
npm run build
npm start
```

---

## ⏱️ Timeline

- Build (both): ~1-2 minutes
- Frontend deploy: ~2-3 minutes  
- Backend deploy: ~5-7 minutes
- **Total: ~10 minutes** 🎉

---

## 🎉 You're Done!

Your VendorHub marketplace is now live and ready for the client demo!

**Share these URLs with your client:**
- Frontend: `https://your-project.vercel.app`
- Backend API: `https://your-project.railway.app`

---

For detailed deployment instructions, see: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
