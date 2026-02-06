# VendorHub Marketplace Quick Start Commands

## Add these aliases to your ~/.zshrc or ~/.bashrc file:

```bash
# VendorHub Backend
alias backend-start='cd ~/Desktop/freelance_Project/marketPlace/marketplace-backend && ./start-backend.sh'
alias backend-stop='lsof -ti:8080 | xargs kill -9 2>/dev/null && echo "Backend stopped"'
alias backend-logs='tail -f ~/Desktop/freelance_Project/marketPlace/marketplace-backend/backend.log'
alias backend-test='curl -s http://localhost:8080/api/categories | jq length'

# VendorHub Frontend  
alias frontend-start='cd ~/Desktop/freelance_Project/marketPlace/marketplace-frontend && npm run dev'
alias frontend-build='cd ~/Desktop/freelance_Project/marketPlace/marketplace-frontend && npm run build'
```

## After adding, reload your shell:
```bash
source ~/.zshrc
```

## Then you can simply run:
```bash
backend-start     # Start backend
backend-stop      # Stop backend
backend-logs      # View logs
backend-test      # Test if backend is running
frontend-start    # Start frontend
```

---

## Alternative: Use the scripts directly

**Start Backend:**
```bash
cd ~/Desktop/freelance_Project/marketPlace/marketplace-backend
./start-backend.sh
```

**Start Backend in Background:**
```bash
cd ~/Desktop/freelance_Project/marketPlace/marketplace-backend
./start-backend.sh > backend.log 2>&1 &
```

**Stop Backend:**
```bash
lsof -ti:8080 | xargs kill -9
```

---

## Why we were using the long command:

Previously, the environment variables (MongoDB URI) were not being loaded properly, so we had to:
1. Export MONGODB_URI manually
2. Then run mvn spring-boot:run

**Now fixed!** The `start-backend.sh` script automatically loads from `.env` file, so you just run:
```bash
./start-backend.sh
```

No more typing long MongoDB connection strings! 🎉
