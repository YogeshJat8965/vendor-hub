# Phase 2 Testing Guide

## ✅ What's Been Built

All Phase 2 components are complete:
- ✅ UserRepository & VendorRepository
- ✅ JWT Service with token generation/validation
- ✅ AuthService with customer & vendor signup + login
- ✅ Security configuration with JWT filter
- ✅ AuthController with 3 endpoints
- ✅ SlugGenerator utility
- ✅ BCrypt password hashing

## ⚠️ Current Issue: MongoDB Atlas SSL

There's a known SSL handshake issue between Java 17/21 and MongoDB Atlas that needs fixing in Atlas settings.

### Fix in MongoDB Atlas:
1. Go to your cluster in Atlas (https://cloud.mongodb.com)
2. Click "Network Access" → "IP Access List"
3. Add: `0.0.0.0/0` (allows all IPs for testing)
4. Go to "Database Access"
5. Verify user `yogeshjat8965_db_user` has "Atlas Admin" or "Read and write to any database"
6. Wait 2-3 minutes for changes to propagate

### Alternative: Use Standard MongoDB Connection

If SSL issues persist, switch to standard connection (not srv):
```
mongodb://yogeshjat8965_db_user:rSqxEps5KTz7o2Qp@ac-odflv1h-shard-00-00.whs5yyc.mongodb.net:27017,ac-odflv1h-shard-00-01.whs5yyc.mongodb.net:27017,ac-odflv1h-shard-00-02.whs5yyc.mongodb.net:27017/marketplace?ssl=true&replicaSet=atlas-18ega7-shard-0&authSource=admin&retryWrites=true&w=majority
```

## 🧪 Test Commands (Once MongoDB is Working)

### 1. Customer Signup
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@test.com",
    "password": "SecurePass123!",
    "consentConfirmed": true
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "message": "Signup successful"
}
```

### 2. Vendor Signup
```bash
curl -X POST http://localhost:8080/api/auth/vendor/signup \
  -H "Content-Type: application/json" \
  -d '{
    "storeName": "Premium Interiors",
    "businessName": "Premium Interiors Pvt Ltd",
    "email": "vendor@test.com",
    "password": "SecurePass123!",
    "vendorType": "Carpenter",
    "mobile": "9876543210",
    "city": "Mumbai",
    "pincode": "400001",
    "consentConfirmed": true
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "message": "Vendor registration successful"
}
```

### 3. Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@test.com",
    "password": "SecurePass123!"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "message": "Login successful"
}
```

### 4. Test Duplicate Email
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "john@test.com",
    "password": "AnotherPass123!",
    "consentConfirmed": true
  }'
```

**Expected Response:**
```json
{
  "error": "Email already in use"
}
```

### 5. Test Invalid Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrong@test.com",
    "password": "WrongPass123!"
  }'
```

**Expected Response:**
```json
{
  "error": "Invalid credentials"
}
```

## ✅ Code Quality Checks

- ✅ Passwords are encrypted with BCrypt
- ✅ JWT tokens contain userId, email, and role
- ✅ Vendor slugs are auto-generated from store names
- ✅ Duplicate emails are prevented
- ✅ Security filter validates JWT on protected routes
- ✅ CORS configured for frontend (localhost:3000)

## Next Steps

Once MongoDB connection is fixed:
1. Run all test commands above
2. Verify tokens are generated correctly
3. Check MongoDB Atlas to see created users/vendors
4. Then we proceed to Phase 3!
