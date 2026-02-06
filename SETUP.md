# Marketplace Setup Guide

## Prerequisites
- Node.js 18+ and npm
- Java 21+ and Maven
- MongoDB (or Docker)

## Quick Start

### Option 1: Using Docker (Recommended)

1. **Install Docker** (if not already installed):
   ```bash
   sudo apt-get update
   sudo apt-get install -y docker.io docker-compose
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -aG docker $USER
   # Log out and back in for group changes to take effect
   ```

2. **Start MongoDB**:
   ```bash
   docker-compose up -d
   ```

3. **Verify MongoDB is running**:
   ```bash
   docker ps | grep marketplace-mongodb
   ```

### Option 2: Install MongoDB Natively

```bash
# Import MongoDB public GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd marketplace-backend
   ```

2. **Build the project**:
   ```bash
   mvn clean package -DskipTests
   ```

3. **Run the backend**:
   ```bash
   mvn spring-boot:run
   ```

   The backend will be available at `http://localhost:8080`

## Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd marketplace-frontend
   ```

2. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

## Testing the Application

### 1. Test Frontend Build
```bash
cd marketplace-frontend
npm run build
```
Should complete without errors.

### 2. Test Backend Connection
```bash
curl http://localhost:8080/api/health
```

### 3. Test Vendor Dashboard Flow

1. **Create a vendor account**:
   - Navigate to `http://localhost:3000/signup`
   - Select "Vendor" account type
   - Fill in the registration form
   - Submit

2. **Login as vendor**:
   - Navigate to `http://localhost:3000/login`
   - Use your vendor credentials
   - Should redirect to `/dashboard/vendor`

3. **Verify dashboard features**:
   - ✓ Dashboard stats should display without errors
   - ✓ Quotes tab should load vendor's quote requests
   - ✓ Storefront tab should show profile editor
   - ✓ Analytics tab should display charts
   - ✓ File uploads (logo, banner, gallery) should work

### 4. Test Admin Panel
1. Create an admin user (requires database modification or admin registration endpoint)
2. Login and verify admin dashboard features

## Common Issues

### MongoDB Connection Failed
**Error**: `com.mongodb.MongoTimeoutException: Timed out after 30000 ms`

**Solutions**:
- Ensure MongoDB is running: `docker ps | grep mongo` or `sudo systemctl status mongod`
- Check connection string in `marketplace-backend/src/main/resources/application.yml`
- Verify port 27017 is not blocked by firewall

### Frontend Build Errors
**Error**: "useSearchParams() should be wrapped in a suspense boundary"

**Solution**: Already fixed in signup page with Suspense wrapper.

### 403 Forbidden on Vendor Endpoints
**Error**: 403 when accessing `/api/vendor/**`

**Solution**: Already fixed - all vendor endpoints now accept email parameter and JWT authentication is properly configured.

### TypeError in Dashboard
**Error**: "Cannot read properties of undefined"

**Solution**: Already fixed - null safety added with `??` operators throughout vendor dashboard.

## Environment Variables

### Backend (`marketplace-backend/src/main/resources/application.yml`)
```yaml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/marketplace
server:
  port: 8080
jwt:
  secret: your-secret-key-here-must-be-at-least-256-bits-long
```

### Frontend (`marketplace-frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Development Status

### ✅ Completed Features
- Phase 7.1: Authentication (JWT, login, signup, protected routes)
- Phase 7.2: Public Pages (explore, vendor detail, search)
- Phase 7.3: Customer Dashboard (quotes, profile, favorites)
- Phase 7.4: Vendor Dashboard (quotes, reviews, analytics, storefront)
- Phase 7.5: Admin Panel (dashboard, vendors, users, categories, reviews)
- Phase 7.6: File Uploads (validation, compression, drag-drop)
- All vendor endpoint fixes (email-based operations)
- Frontend error fixes (parse errors, null safety, Suspense wrapper)

### 🔄 Ready for Testing
- All features implemented and bug-fixed
- Frontend builds successfully
- Backend compiles successfully
- Waiting for MongoDB to be started for end-to-end testing

## Architecture

### Backend
- **Framework**: Spring Boot 3.2.5
- **Database**: MongoDB
- **Authentication**: JWT with role-based access (VENDOR, CUSTOMER, ADMIN)
- **File Storage**: Local filesystem with validation and compression

### Frontend
- **Framework**: Next.js 16.1.6 with Turbopack
- **UI**: React 18, Tailwind CSS, Framer Motion
- **State**: React hooks with localStorage for auth tokens

### API Endpoints

#### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login and get JWT token

#### Vendor Dashboard
- GET `/api/vendor/dashboard/stats?email={email}` - Get dashboard statistics
- GET `/api/vendor/profile?email={email}` - Get vendor profile
- PUT `/api/vendor/profile?email={email}` - Update vendor profile
- GET `/api/quotes/vendor?email={email}` - Get vendor's quotes

#### Public
- GET `/api/vendors` - List all vendors
- GET `/api/vendors/{slug}` - Get vendor details by slug
- POST `/api/quotes` - Submit quote request

## Support
For issues or questions, check the error logs:
- Backend logs: Console output from `mvn spring-boot:run`
- Frontend logs: Browser console and terminal output from `npm run dev`
