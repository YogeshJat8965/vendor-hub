# 📊 PHASE 7 INTEGRATION - QUICK REFERENCE
**Last Updated:** February 5, 2026

---

## 🎯 DEEP SCAN RESULTS

### Frontend Integration Points
- **Total TODO Comments:** 37
- **Total Pages Analyzed:** 28
- **Total Files to Modify:** 25+
- **New Files to Create:** 5+

### Backend API Status
- **Available Endpoints:** 21 ✅
- **Missing Endpoints:** 28 ❌
- **Total Backend Files:** 39 Java files

---

## 📁 FILE BREAKDOWN

### 🔐 Authentication (8 files) - SUB-PHASE 7.1
```
NEW FILES:
├── lib/auth-context.tsx
└── components/auth/ProtectedRoute.tsx

MODIFY FILES:
├── lib/api-client.ts
├── app/login/page.tsx (Lines 38, 44)
├── app/signup/page.tsx (Lines 70, 76, 88, 94)
├── components/layout/Header.tsx (Line 19)
├── app/dashboard/customer/layout.tsx (Line 57)
├── app/dashboard/vendor/layout.tsx (Line 67)
└── app/dashboard/admin/layout.tsx (Line 70)
```

### 🔍 Public Pages (3 files) - SUB-PHASE 7.2
```
MODIFY FILES:
├── app/page.tsx
└── app/explore/page.tsx

CREATE FILES:
└── app/vendors/[slug]/page.tsx
```

### 👤 Customer Dashboard (4 files) - SUB-PHASE 7.3
```
MODIFY FILES:
├── app/dashboard/customer/page.tsx
├── app/dashboard/customer/quotes/page.tsx (Line 105)
├── app/dashboard/customer/favorites/page.tsx (Lines 71, 77)
└── app/dashboard/customer/profile/page.tsx (Lines 72, 86, 99)
```

### 🏪 Vendor Dashboard (5 files) - SUB-PHASE 7.4
```
MODIFY FILES:
├── app/dashboard/vendor/page.tsx
├── app/dashboard/vendor/quotes/page.tsx (Lines 103, 107, 112, 117)
├── app/dashboard/vendor/storefront/page.tsx (Lines 65, 77, 82, 87)
├── app/dashboard/vendor/reviews/page.tsx
└── app/dashboard/vendor/settings/page.tsx (Lines 69, 87, 92)
```

### 👨‍💼 Admin Panel (6 files) - SUB-PHASE 7.5
```
MODIFY FILES:
├── app/dashboard/admin/page.tsx
├── app/dashboard/admin/vendors/page.tsx (Lines 141, 151, 162)
├── app/dashboard/admin/users/page.tsx (Lines 97, 107)
├── app/dashboard/admin/categories/page.tsx (Lines 71, 82, 91)
├── app/dashboard/admin/reviews/page.tsx (Lines 88, 98)
└── app/dashboard/admin/settings/page.tsx (Line 60)
```

### 📸 File Uploads (4 files) - SUB-PHASE 7.6
```
NEW FILES:
└── lib/upload-service.ts

MODIFY FILES (already counted above):
├── app/dashboard/customer/profile/page.tsx
└── app/dashboard/vendor/storefront/page.tsx
```

### ✨ Polish (2 files) - SUB-PHASE 7.7
```
NEW FILES:
├── lib/error-handler.ts
└── lib/react-query-setup.ts (optional)

MODIFY FILES:
└── All pages (add loading states & error handling)
```

---

## 🔌 BACKEND ENDPOINTS QUICK REFERENCE

### ✅ AVAILABLE (21 endpoints)

#### Auth (3)
```
POST /api/auth/login
POST /api/auth/signup
POST /api/auth/vendor/signup
```

#### Explore (4)
```
GET  /api/explore
GET  /api/explore/{slug}/profile
GET  /api/explore/check-slug
GET  /api/explore/search?city={city}&vendorType={type}
```

#### Quotes (4)
```
POST /api/quotes
GET  /api/quotes/vendor/{vendorSlug}
GET  /api/quotes/customer/{email}
PUT  /api/quotes/{quoteId}/status
```

#### Reviews (3)
```
POST /api/reviews
GET  /api/reviews/{vendorSlug}
PUT  /api/reviews/{reviewId}/flag
```

#### Vendor (3)
```
GET  /api/vendor/profile?slug={slug}
PUT  /api/vendor/profile?slug={slug}
GET  /api/vendor/dashboard/overview?slug={slug}
```

#### Admin (4)
```
GET    /api/admin/dashboard
GET    /api/admin/vendors
GET    /api/admin/reviews/flagged
DELETE /api/admin/reviews/{reviewId}
```

---

### ❌ MISSING (28 endpoints - Need Backend Work)

#### Customer (6)
```
GET    /api/customer/profile
PUT    /api/customer/profile
POST   /api/customer/change-password
POST   /api/customer/favorites/{vendorId}
DELETE /api/customer/favorites/{vendorId}
GET    /api/customer/favorites
```

#### Admin - Vendors (3)
```
PUT /api/admin/vendors/{id}/approve
PUT /api/admin/vendors/{id}/reject
PUT /api/admin/vendors/{id}/suspend
```

#### Admin - Users (3)
```
GET /api/admin/users
PUT /api/admin/users/{id}/ban
PUT /api/admin/users/{id}/unban
```

#### Admin - Categories (4)
```
GET    /api/admin/categories
POST   /api/admin/categories
PUT    /api/admin/categories/{id}
DELETE /api/admin/categories/{id}
```

#### Admin - Other (3)
```
PUT /api/admin/reviews/{id}/unflag
GET /api/admin/settings
PUT /api/admin/settings
```

#### Vendor - Account (2)
```
PUT    /api/vendor/deactivate
DELETE /api/vendor/account
```

#### File Uploads (5)
```
POST   /api/customer/upload/photo
POST   /api/vendor/upload/logo
POST   /api/vendor/upload/banner
POST   /api/vendor/upload/gallery
DELETE /api/vendor/gallery/{imageId}
```

#### Collaboration (2)
```
POST /api/collaboration/post
GET  /api/collaboration/search
```

---

## ⏱️ TIME ESTIMATES

| Sub-Phase | Duration | Complexity | Dependencies |
|-----------|----------|------------|--------------|
| 7.1 Foundation | 2-3 hours | HIGH | None (START HERE) |
| 7.2 Public Pages | 1.5-2 hours | LOW | 7.1 |
| 7.3 Customer | 2-3 hours | MEDIUM | 7.1, 7.2 |
| 7.4 Vendor | 2-3 hours | MEDIUM | 7.1 |
| 7.5 Admin | 2-3 hours | HIGH | 7.1 |
| 7.6 File Uploads | 1.5-2 hours | MEDIUM | 7.1, 7.3, 7.4 |
| 7.7 Polish | 1-2 hours | LOW | 7.1-7.6 |
| **TOTAL** | **8-12 hours** | | |

---

## 🎯 INTEGRATION PATTERNS

### Pattern 1: Simple Data Fetch
```typescript
// Use in: Homepage, Explore, Dashboard overview pages
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await apiClient.get('/api/endpoint');
      setData(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  fetchData();
}, []);
```

### Pattern 2: Form Submission
```typescript
// Use in: Login, Signup, Profile update, Settings
const handleSubmit = async (formData) => {
  setIsLoading(true);
  try {
    const response = await apiClient.post('/api/endpoint', formData);
    toast.success('Success!');
    // Handle success (redirect, update state, etc.)
  } catch (error) {
    const message = error.response?.data?.error || 'Error occurred';
    toast.error(message);
  } finally {
    setIsLoading(false);
  }
};
```

### Pattern 3: File Upload
```typescript
// Use in: Profile photo, Logo, Banner, Gallery
const handleFileUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await apiClient.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setImageUrl(response.data.url);
  } catch (error) {
    toast.error('Upload failed');
  }
};
```

### Pattern 4: Auth Context
```typescript
// Use in: All protected pages
const { user, isAuthenticated, logout } = useAuth();

if (!isAuthenticated) {
  router.push('/login');
  return null;
}
```

---

## 🧪 TESTING CHECKLIST

### After Sub-Phase 7.1 (Foundation):
- [ ] Customer can login
- [ ] Vendor can login
- [ ] Admin can login
- [ ] Customer signup works
- [ ] Vendor signup works
- [ ] Token persists after refresh
- [ ] Logout clears token
- [ ] Protected routes redirect when unauthenticated
- [ ] Header shows login state

### After Sub-Phase 7.2 (Public):
- [ ] Homepage displays vendors from API
- [ ] Explore page loads vendors
- [ ] Search by city works
- [ ] Filter by category works
- [ ] Vendor profile page displays correctly

### After Sub-Phase 7.3 (Customer):
- [ ] Customer dashboard shows real data
- [ ] Quotes page displays customer's quotes
- [ ] Profile update saves
- [ ] Password change works

### After Sub-Phase 7.4 (Vendor):
- [ ] Vendor dashboard shows real metrics
- [ ] Quotes page displays incoming requests
- [ ] Accept/decline quote works
- [ ] Storefront update saves

### After Sub-Phase 7.5 (Admin):
- [ ] Admin dashboard shows platform stats
- [ ] Vendor approval/rejection works
- [ ] User ban/unban works
- [ ] Category CRUD works

### After Sub-Phase 7.6 (Uploads):
- [ ] Profile photo upload works
- [ ] Logo upload works
- [ ] Banner upload works
- [ ] Gallery upload works

### After Sub-Phase 7.7 (Polish):
- [ ] All errors show user-friendly messages
- [ ] All forms validate before submission
- [ ] Loading states show during operations
- [ ] No console errors

---

## 📌 PRIORITY WORKAROUNDS

### If Backend Endpoints Missing:

**Customer Favorites (Missing API):**
```typescript
// Temporary: Use localStorage
const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
```

**Admin Categories (Missing API):**
```typescript
// Temporary: Use static categories
const categories = [
  { id: '1', name: 'Plumbing', icon: 'Wrench' },
  { id: '2', name: 'Electrical', icon: 'Zap' },
  // ... hardcoded list
];
```

**File Uploads (Missing API):**
```typescript
// Temporary: Use placeholder images
const logoUrl = '/placeholder-logo.png';
```

---

## 🚀 EXECUTION ORDER

```
START HERE
    ↓
7.1 Foundation (CRITICAL - DO NOT SKIP)
    ↓
    ├─→ 7.2 Public Pages (Independent)
    │
    ├─→ 7.3 Customer (Depends on 7.1, 7.2)
    │
    ├─→ 7.4 Vendor (Depends on 7.1)
    │
    ├─→ 7.5 Admin (Depends on 7.1)
    │
    └─→ 7.6 File Uploads (Depends on 7.1, 7.3, 7.4)
            ↓
        7.7 Polish (Final step)
            ↓
        DONE ✅
```

---

## 💡 PRO TIPS

1. **Start Backend Server First**
   ```bash
   cd marketplace-backend
   ./start.sh
   # Server runs on http://localhost:8080
   ```

2. **Check MongoDB Connection**
   ```bash
   # Verify data in MongoDB Atlas
   # Check VendorHub cluster
   ```

3. **Use Browser DevTools**
   - Network tab: See all API calls
   - Console: Check for errors
   - Application tab: Check localStorage token

4. **Test API Endpoints First**
   - Use Postman/Thunder Client
   - Verify response format
   - Check error handling

5. **Work in Order**
   - Don't skip Sub-Phase 7.1
   - Test after each sub-phase
   - Fix bugs before moving forward

---

**🎯 FOCUS: Complete one sub-phase at a time, test thoroughly, then move to next!**

_Quick Reference Guide - February 5, 2026_
