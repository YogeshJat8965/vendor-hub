# 🗺️ PHASE 7: API INTEGRATION ROADMAP
**VendorHub Marketplace Platform**

> **Status:** Ready for Execution  
> **Total Duration:** 8-12 hours  
> **Integration Points:** 37 TODO comments resolved  
> **Backend Endpoints:** 21 available + 28 needed

---

## 📊 QUICK OVERVIEW

```
Phase 7 Sub-Phases:
├── 7.1 Foundation (Auth & Core)      [2-3 hrs] ⚠️ CRITICAL
├── 7.2 Public Pages (Explore)        [1.5-2 hrs]
├── 7.3 Customer Dashboard            [2-3 hrs]
├── 7.4 Vendor Dashboard              [2-3 hrs]
├── 7.5 Admin Panel                   [2-3 hrs]
├── 7.6 File Uploads                  [1.5-2 hrs]
└── 7.7 Polish & Optimization         [1-2 hrs]
```

---

## 🎯 INTEGRATION PRIORITIES

### 🔴 Critical (Must Complete First):
- **Sub-Phase 7.1** - Authentication system is foundation for everything
- Login/Signup/JWT handling
- Auth Context for role-based access
- Protected route guards

### 🟡 High Priority (Core Features):
- **Sub-Phase 7.2** - Vendor listing & search (public features)
- **Sub-Phase 7.3** - Customer dashboard (quote management)
- **Sub-Phase 7.4** - Vendor dashboard (lead management)

### 🟢 Medium Priority (Admin Features):
- **Sub-Phase 7.5** - Admin panel (platform moderation)

### 🔵 Lower Priority (Enhancements):
- **Sub-Phase 7.6** - File uploads (can use placeholders initially)
- **Sub-Phase 7.7** - Polish & optimization (incremental improvements)

---

## 📋 INTEGRATION CHECKLIST BY FILE

### 🔐 Authentication Files (Sub-Phase 7.1)
- [ ] `lib/auth-context.tsx` (NEW) - Auth state management
- [ ] `lib/api-client.ts` (MODIFY) - Token interceptors
- [ ] `components/auth/ProtectedRoute.tsx` (NEW) - Route guards
- [ ] `app/login/page.tsx` (MODIFY) - 2 TODOs
- [ ] `app/signup/page.tsx` (MODIFY) - 4 TODOs
- [ ] `components/layout/Header.tsx` (MODIFY) - 1 TODO
- [ ] `app/dashboard/customer/layout.tsx` (MODIFY) - 1 TODO (logout)
- [ ] `app/dashboard/vendor/layout.tsx` (MODIFY) - 1 TODO (logout)
- [ ] `app/dashboard/admin/layout.tsx` (MODIFY) - 1 TODO (logout)

### 🔍 Public Pages (Sub-Phase 7.2)
- [ ] `app/page.tsx` (MODIFY) - Load real vendors
- [ ] `app/explore/page.tsx` (MODIFY) - API integration
- [ ] `app/vendors/[slug]/page.tsx` (CREATE) - Vendor profile page

### 👤 Customer Dashboard (Sub-Phase 7.3)
- [ ] `app/dashboard/customer/page.tsx` (MODIFY) - Overview stats
- [ ] `app/dashboard/customer/quotes/page.tsx` (MODIFY) - 1 TODO
- [ ] `app/dashboard/customer/favorites/page.tsx` (MODIFY) - 2 TODOs
- [ ] `app/dashboard/customer/profile/page.tsx` (MODIFY) - 3 TODOs

### 🏪 Vendor Dashboard (Sub-Phase 7.4)
- [ ] `app/dashboard/vendor/page.tsx` (MODIFY) - Overview metrics
- [ ] `app/dashboard/vendor/quotes/page.tsx` (MODIFY) - 4 TODOs
- [ ] `app/dashboard/vendor/storefront/page.tsx` (MODIFY) - 4 TODOs
- [ ] `app/dashboard/vendor/reviews/page.tsx` (MODIFY) - API integration
- [ ] `app/dashboard/vendor/settings/page.tsx` (MODIFY) - 3 TODOs

### 👨‍💼 Admin Panel (Sub-Phase 7.5)
- [ ] `app/dashboard/admin/page.tsx` (MODIFY) - Platform stats
- [ ] `app/dashboard/admin/vendors/page.tsx` (MODIFY) - 3 TODOs
- [ ] `app/dashboard/admin/users/page.tsx` (MODIFY) - 2 TODOs
- [ ] `app/dashboard/admin/categories/page.tsx` (MODIFY) - 3 TODOs
- [ ] `app/dashboard/admin/reviews/page.tsx` (MODIFY) - 2 TODOs
- [ ] `app/dashboard/admin/settings/page.tsx` (MODIFY) - 1 TODO

### 📸 File Uploads (Sub-Phase 7.6)
- [ ] `lib/upload-service.ts` (NEW) - Upload handler
- [ ] Profile photo upload
- [ ] Vendor logo upload
- [ ] Vendor banner upload
- [ ] Vendor gallery upload

### ✨ Polish (Sub-Phase 7.7)
- [ ] `lib/error-handler.ts` (NEW) - Global error handling
- [ ] Add loading states to all pages
- [ ] Implement React Query caching
- [ ] Add toast notifications
- [ ] Accessibility improvements

---

## 🔌 BACKEND API MAPPING

### ✅ Available Endpoints (21 total)
```typescript
// Authentication
POST /api/auth/login
POST /api/auth/signup
POST /api/auth/vendor/signup

// Explore & Search
GET /api/explore
GET /api/explore/{slug}/profile
GET /api/explore/check-slug
GET /api/explore/search?city={city}&vendorType={type}

// Quotes
POST /api/quotes
GET /api/quotes/vendor/{vendorSlug}
GET /api/quotes/customer/{email}
PUT /api/quotes/{quoteId}/status

// Reviews
POST /api/reviews
GET /api/reviews/{vendorSlug}
PUT /api/reviews/{reviewId}/flag

// Vendor
GET /api/vendor/profile?slug={slug}
PUT /api/vendor/profile?slug={slug}
GET /api/vendor/dashboard/overview?slug={slug}

// Admin
GET /api/admin/dashboard
GET /api/admin/vendors
GET /api/admin/reviews/flagged
DELETE /api/admin/reviews/{reviewId}
```

### ❌ Missing Endpoints (28 total - Need Backend Work)

#### Customer APIs (6 endpoints)
```typescript
GET /api/customer/profile
PUT /api/customer/profile
POST /api/customer/change-password
POST /api/customer/favorites/{vendorId}
DELETE /api/customer/favorites/{vendorId}
GET /api/customer/favorites
```

#### Admin APIs (13 endpoints)
```typescript
PUT /api/admin/vendors/{id}/approve
PUT /api/admin/vendors/{id}/reject
PUT /api/admin/vendors/{id}/suspend
GET /api/admin/users
PUT /api/admin/users/{id}/ban
PUT /api/admin/users/{id}/unban
GET /api/admin/categories
POST /api/admin/categories
PUT /api/admin/categories/{id}
DELETE /api/admin/categories/{id}
PUT /api/admin/reviews/{id}/unflag
GET /api/admin/settings
PUT /api/admin/settings
```

#### Vendor APIs (2 endpoints)
```typescript
PUT /api/vendor/deactivate
DELETE /api/vendor/account
```

#### File Upload APIs (5 endpoints)
```typescript
POST /api/customer/upload/photo
POST /api/vendor/upload/logo
POST /api/vendor/upload/banner
POST /api/vendor/upload/gallery
DELETE /api/vendor/gallery/{imageId}
```

#### Collaboration APIs (2 endpoints)
```typescript
POST /api/collaboration/post
GET /api/collaboration/search
```

---

## 🚦 EXECUTION WORKFLOW

### Week 1: Foundation & Public Pages

**Day 1 - Sub-Phase 7.1 (2-3 hours)**
```
Morning:
✓ Create Auth Context
✓ Enhance API Client
✓ Create Protected Route component

Afternoon:
✓ Integrate Login page
✓ Integrate Signup pages
✓ Update Header component
✓ Test authentication flow

Evening:
✓ Add logout functionality
✓ Test token persistence
✓ Test role-based redirects
```

**Day 2 - Sub-Phase 7.2 (1.5-2 hours)**
```
Morning:
✓ Integrate Homepage vendor showcase
✓ Integrate Explore page
✓ Add search functionality
✓ Add category filtering

Afternoon:
✓ Create Vendor Profile page
✓ Load vendor reviews
✓ Test all public pages
```

### Week 1-2: Dashboard Integration

**Day 3 - Sub-Phase 7.3 (2-3 hours)**
```
Morning:
✓ Customer dashboard overview
✓ Quotes page integration
✓ Quote details dialog

Afternoon:
✓ Favorites page (localStorage fallback)
✓ Profile settings
✓ Password change
✓ Test customer workflows
```

**Day 4 - Sub-Phase 7.4 (2-3 hours)**
```
Morning:
✓ Vendor dashboard metrics
✓ Quotes management
✓ Accept/decline quotes

Afternoon:
✓ Storefront editor
✓ Reviews page
✓ Settings page
✓ Test vendor workflows
```

**Day 5 - Sub-Phase 7.5 (2-3 hours)**
```
Morning:
✓ Admin dashboard stats
✓ Vendor management
✓ User management

Afternoon:
✓ Category CRUD
✓ Review moderation
✓ Platform settings
✓ Test admin workflows
```

### Week 2: Polish & Launch

**Day 6 - Sub-Phase 7.6 (1.5-2 hours)**
```
Morning:
✓ Create upload service
✓ Profile photo upload
✓ Logo/banner uploads

Afternoon:
✓ Gallery uploads
✓ Test all upload flows
```

**Day 7 - Sub-Phase 7.7 (1-2 hours)**
```
Morning:
✓ Global error handling
✓ Loading states
✓ React Query setup

Afternoon:
✓ Toast notifications
✓ Accessibility fixes
✓ Final testing
✓ Production deployment
```

---

## 🧪 TESTING STRATEGY

### After Each Sub-Phase:
1. **Manual Testing**
   - Test all features in that sub-phase
   - Check browser console for errors
   - Verify Network tab shows correct API calls
   
2. **Data Verification**
   - Check MongoDB for data persistence
   - Verify data structure matches expectations
   
3. **Edge Cases**
   - Test with empty data
   - Test with invalid inputs
   - Test error scenarios

### Full System Test (After 7.7):
- [ ] End-to-end customer journey (signup → explore → request quote)
- [ ] End-to-end vendor journey (signup → setup storefront → respond to quote)
- [ ] End-to-end admin journey (login → approve vendor → moderate review)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile responsive testing
- [ ] Performance testing (page load <2s)
- [ ] Accessibility testing (Lighthouse >90)

---

## 📈 PROGRESS TRACKING

### Daily Standup Questions:
1. What sub-phase did I complete yesterday?
2. What sub-phase am I working on today?
3. Are there any blockers?
   - Missing backend endpoints?
   - API errors?
   - Data structure mismatches?

### Completion Criteria:
- ✅ All 37 TODO comments resolved
- ✅ All available backend APIs integrated
- ✅ Workarounds for missing backend APIs documented
- ✅ All user flows tested and working
- ✅ No console errors in production
- ✅ Loading states on all async operations
- ✅ Error handling on all API calls

---

## 🆘 TROUBLESHOOTING GUIDE

### Common Issues:

**Issue:** Login returns 401 Unauthorized
```
Solution:
1. Check MongoDB connection in backend
2. Verify user credentials in database
3. Check JWT secret configuration
4. Test API endpoint directly in Postman
```

**Issue:** Token not persisting after refresh
```
Solution:
1. Verify localStorage.setItem('authToken', token)
2. Check Auth Context initialization
3. Ensure token is decoded correctly
```

**Issue:** CORS errors
```
Solution:
1. Add CORS configuration in Spring Boot
2. Allow localhost:3000 in backend
3. Include credentials in axios config
```

**Issue:** Data not displaying
```
Solution:
1. Check Network tab for API response
2. Verify data structure matches frontend expectations
3. Check for null/undefined values
4. Add console.logs to debug data flow
```

---

## 🎉 SUCCESS METRICS

### Technical Metrics:
- 0 TODO comments remaining
- 0 mock data in production
- <2s average page load time
- >90 Lighthouse score
- 0 console errors

### User Experience Metrics:
- Smooth animations during data loading
- Instant feedback on all actions
- Clear error messages
- Mobile-responsive on all devices

### Business Metrics:
- Users can complete full signup flow
- Vendors can manage their profiles
- Customers can request quotes
- Admin can moderate platform
- All critical features working

---

**🚀 READY TO START PHASE 7.1 - FOUNDATION!**

_Document created: February 5, 2026_  
_Last updated: February 5, 2026_
