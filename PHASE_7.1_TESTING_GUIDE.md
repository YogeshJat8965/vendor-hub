# Phase 7.1 - Authentication System Testing Guide

## ✅ Implementation Status

All authentication infrastructure has been successfully implemented:

### Completed Components

1. **✅ JWT Token Management**
   - `jwt-decode` package installed (v4.0.0)
   - Token storage in localStorage
   - Automatic token validation on app load
   - Token expiration checks

2. **✅ Auth Context (`lib/auth-context.tsx`)**
   - `AuthProvider` wrapping entire app
   - `useAuth` hook for accessing auth state
   - Login function (stores token, decodes user data)
   - Logout function (clears storage, redirects)
   - User state management (name, email, role)

3. **✅ API Client Enhancement (`lib/api-client.ts`)**
   - Axios request interceptor adds Bearer token
   - Response interceptor with comprehensive error handling:
     - 401: Session expired toast
     - 403: Permission denied toast
     - 404: Not found toast
     - 500: Server error toast
     - Network errors: Connection issue toast

4. **✅ Protected Route Component (`components/auth/ProtectedRoute.tsx`)**
   - Role-based access control
   - Automatic redirects for unauthenticated users
   - Role mismatch redirects to correct dashboard
   - Loading spinner during authentication check

5. **✅ Login Page Integration (`app/login/page.tsx`)**
   - API endpoint: `POST /api/auth/login`
   - Role-based redirect after successful login
   - Auto-redirect if already authenticated
   - Error handling with toast notifications

6. **✅ Signup Pages Integration (`app/signup/page.tsx`)**
   - **Customer Signup**: `POST /api/auth/signup`
   - **Vendor Signup**: `POST /api/auth/vendor/signup`
   - Both with automatic login after registration
   - Vendor signup shows "pending approval" message
   - Auto-redirect if already authenticated

7. **✅ Header Component (`components/layout/Header.tsx`)**
   - Auth state integration with `useAuth`
   - User avatar with initials
   - Dropdown menu with role-based dashboard link
   - Logout functionality

8. **✅ Dashboard Layouts (customer/vendor/admin)**
   - All three layouts now use `useAuth` for logout
   - Confirmation dialog before logout
   - Protected with `ProtectedRoute` wrapper
   - Role-specific access control

9. **✅ Root Layout (`app/providers.tsx`)**
   - App wrapped with `AuthProvider`
   - Proper provider nesting: QueryClient → Auth → Toaster

---

## 🧪 Testing Checklist

### Prerequisites

1. **Start Backend Server**
   ```bash
   cd marketplace-backend
   ./start.sh
   ```
   Backend should be running on `http://localhost:8080`

2. **Start Frontend Server**
   ```bash
   cd marketplace-frontend
   npm run dev
   ```
   Frontend should be running on `http://localhost:3000`

---

### Test Suite 1: Customer Authentication Flow

#### Test 1.1: Customer Signup
1. Navigate to `http://localhost:3000/signup`
2. Select "Customer" tab
3. Fill in the form:
   - Full Name: "John Doe"
   - Email: "john@example.com"
   - Password: "password123"
   - Confirm Password: "password123"
   - Phone: "9876543210"
4. Click "Create Account"

**Expected Results:**
- ✅ Success toast: "Account created successfully"
- ✅ Automatic login (no need to go to login page)
- ✅ Redirect to `/dashboard/customer`
- ✅ Token stored in localStorage (key: `authToken`)
- ✅ No console errors

#### Test 1.2: Customer Login
1. If logged in, logout first
2. Navigate to `http://localhost:3000/login`
3. Enter credentials:
   - Email: "john@example.com"
   - Password: "password123"
4. Click "Sign In"

**Expected Results:**
- ✅ Success toast: "Login successful"
- ✅ Redirect to `/dashboard/customer`
- ✅ Header shows user avatar with "J" initial
- ✅ Dashboard displays correctly

#### Test 1.3: Customer Dashboard Access
1. While logged in as customer, verify:
   - Dashboard overview shows stats
   - Sidebar navigation works
   - Breadcrumbs display correctly

2. Click profile dropdown in header:
   - Should show "Dashboard" link
   - Should show "Logout" option

3. Try accessing vendor dashboard:
   - Navigate to `/dashboard/vendor`
   - **Expected:** Redirect to `/dashboard/customer`

4. Try accessing admin dashboard:
   - Navigate to `/dashboard/admin`
   - **Expected:** Redirect to `/dashboard/customer`

#### Test 1.4: Customer Logout
1. Click user avatar in header
2. Click "Logout"
3. Confirm in dialog

**Expected Results:**
- ✅ Redirect to `/login`
- ✅ localStorage cleared
- ✅ Header shows "Login" and "Sign Up" buttons
- ✅ Cannot access `/dashboard/customer` (redirects to `/login`)

---

### Test Suite 2: Vendor Authentication Flow

#### Test 2.1: Vendor Signup
1. Navigate to `http://localhost:3000/signup`
2. Select "Vendor" tab
3. Fill in the form:
   - Business Name: "ABC Services"
   - Email: "vendor@example.com"
   - Password: "password123"
   - Confirm Password: "password123"
   - Phone: "9876543211"
   - Category: "Electrician"
   - City: "Mumbai"
4. Click "Create Vendor Account"

**Expected Results:**
- ✅ Success toast: "Vendor account created! Pending admin approval"
- ✅ Toast duration: 5 seconds (longer to read)
- ✅ Automatic login
- ✅ Redirect to `/dashboard/vendor`
- ✅ Token stored in localStorage

#### Test 2.2: Vendor Login
1. Logout if logged in
2. Navigate to `http://localhost:3000/login`
3. Enter credentials:
   - Email: "vendor@example.com"
   - Password: "password123"
4. Click "Sign In"

**Expected Results:**
- ✅ Redirect to `/dashboard/vendor`
- ✅ Vendor dashboard displays correctly
- ✅ Header shows vendor name/avatar

#### Test 2.3: Vendor Dashboard Access
1. Verify sidebar navigation:
   - Overview, Quotes, Bookings, Calendar, Reviews, Profile
2. Test role-based access:
   - Cannot access `/dashboard/customer` (redirects back)
   - Cannot access `/dashboard/admin` (redirects back)

#### Test 2.4: Vendor Logout
1. Click sidebar "Logout" button
2. Confirm in dialog

**Expected Results:**
- ✅ Confirmation: "Are you sure you want to logout?"
- ✅ Redirect to `/login`
- ✅ Cannot access vendor dashboard

---

### Test Suite 3: Admin Authentication Flow

#### Test 3.1: Admin Login
*Note: Admin accounts are created by backend seeding, not through signup*

1. Navigate to `http://localhost:3000/login`
2. Enter admin credentials (check backend seed data):
   - Email: "admin@marketplace.com"
   - Password: "admin123"
3. Click "Sign In"

**Expected Results:**
- ✅ Redirect to `/dashboard/admin`
- ✅ Admin dashboard displays correctly
- ✅ Access to all admin features

#### Test 3.2: Admin Dashboard Access
1. Verify admin-specific features:
   - User management
   - Vendor approvals
   - System analytics
2. Test role restrictions:
   - Cannot access `/dashboard/customer`
   - Cannot access `/dashboard/vendor`

#### Test 3.3: Admin Logout
1. Click sidebar "Logout"
2. Confirm dialog

**Expected Results:**
- ✅ Redirect to `/login`
- ✅ Cannot access admin dashboard

---

### Test Suite 4: Protected Routes & Edge Cases

#### Test 4.1: Unauthenticated Access
1. Clear localStorage: `localStorage.clear()`
2. Try accessing:
   - `/dashboard/customer` → Redirects to `/login`
   - `/dashboard/vendor` → Redirects to `/login`
   - `/dashboard/admin` → Redirects to `/login`

**Expected:** All protected routes redirect to login

#### Test 4.2: Wrong Role Access
1. Login as customer
2. Try accessing:
   - `/dashboard/vendor` → Redirects to `/dashboard/customer`
   - `/dashboard/admin` → Redirects to `/dashboard/customer`

3. Login as vendor
4. Try accessing:
   - `/dashboard/customer` → Redirects to `/dashboard/vendor`
   - `/dashboard/admin` → Redirects to `/dashboard/vendor`

**Expected:** Automatic redirect to correct dashboard based on role

#### Test 4.3: Auto-Login on Page Refresh
1. Login as any user
2. Refresh the page (F5)

**Expected Results:**
- ✅ User stays logged in
- ✅ No redirect to login page
- ✅ Dashboard loads correctly
- ✅ Token persists from localStorage

#### Test 4.4: Token Expiration
*This requires backend to set short token expiration*

1. Login with valid credentials
2. Wait for token to expire (or manually edit token in localStorage)
3. Try making an API call

**Expected:**
- ✅ 401 error intercepted
- ✅ Toast: "Session expired. Please login again."
- ✅ Auto-redirect to `/login`

#### Test 4.5: Invalid Credentials
1. Navigate to `/login`
2. Enter wrong credentials:
   - Email: "wrong@example.com"
   - Password: "wrongpassword"
3. Click "Sign In"

**Expected Results:**
- ✅ Error toast from backend (e.g., "Invalid credentials")
- ✅ No redirect
- ✅ User stays on login page

#### Test 4.6: Duplicate Email Signup
1. Try signing up with existing email
2. Fill form with already registered email

**Expected:**
- ✅ Error toast: "Email already registered" (from backend)
- ✅ No redirect
- ✅ Form stays on signup page

#### Test 4.7: Password Mismatch
1. Go to signup page
2. Enter different passwords in "Password" and "Confirm Password"

**Expected:**
- ✅ Client-side validation error
- ✅ Cannot submit form
- ✅ Error message displayed

#### Test 4.8: Network Error Handling
1. Stop backend server
2. Try logging in

**Expected:**
- ✅ Toast: "Network error. Please check your connection."
- ✅ No console crash
- ✅ Graceful error handling

---

### Test Suite 5: Browser DevTools Verification

#### Test 5.1: localStorage Inspection
1. Login as any user
2. Open DevTools → Application → Local Storage
3. Check for `authToken` key

**Expected:**
- ✅ Token is a valid JWT (3 parts separated by dots)
- ✅ Token format: `eyJhbGci...`

#### Test 5.2: JWT Token Decoding
1. Copy token from localStorage
2. Paste in [jwt.io](https://jwt.io)
3. Inspect payload

**Expected Payload:**
```json
{
  "sub": "user@example.com",
  "role": "customer",
  "name": "John Doe",
  "iat": 1234567890,
  "exp": 1234567890
}
```

#### Test 5.3: API Request Headers
1. Login as any user
2. Open DevTools → Network tab
3. Make any API call (e.g., navigate to dashboard)
4. Inspect request headers

**Expected:**
- ✅ Header present: `Authorization: Bearer eyJhbGci...`
- ✅ Token matches localStorage token

#### Test 5.4: Console Error Check
1. Complete entire authentication flow
2. Check browser console (F12)

**Expected:**
- ✅ No React errors
- ✅ No 404 errors
- ✅ No authentication errors
- ✅ Clean console throughout

---

## 🐛 Known Issues

### Minor Type Warning (Non-Critical)
**File:** `app/dashboard/vendor/quotes/page.tsx` (Line 128)  
**Issue:** Type comparison mismatch for quote status  
**Impact:** No runtime issues, just TypeScript warning  
**Priority:** Low (fix in Phase 7.2)

### Backend Java Warning (Unrelated)
**File:** Backend Vendor.java  
**Issue:** Unused import `java.util.List`  
**Impact:** None (backend compilation warning)  
**Priority:** Low

---

## 🎯 Success Criteria

### All Tests Must Pass:
- ✅ Customer can signup, login, and logout
- ✅ Vendor can signup, login, and logout
- ✅ Admin can login and logout
- ✅ Protected routes redirect correctly
- ✅ Role-based access control works
- ✅ Token persists after page refresh
- ✅ Logout clears session completely
- ✅ Error messages display correctly
- ✅ No console errors throughout flow

### Code Quality:
- ✅ No TypeScript errors (1 warning acceptable)
- ✅ No React warnings in console
- ✅ All imports resolved correctly
- ✅ Proper error handling with toasts

---

## 📊 Testing Summary Template

After completing all tests, fill out:

```
## Test Results

**Date:** _____________
**Tester:** _____________
**Environment:** Frontend (localhost:3000) + Backend (localhost:8080)

| Test Suite | Status | Notes |
|------------|--------|-------|
| Customer Auth Flow | ✅ / ❌ | |
| Vendor Auth Flow | ✅ / ❌ | |
| Admin Auth Flow | ✅ / ❌ | |
| Protected Routes | ✅ / ❌ | |
| Edge Cases | ✅ / ❌ | |
| DevTools Verification | ✅ / ❌ | |

**Critical Issues Found:** _____________
**Minor Issues Found:** _____________
**Ready for Phase 7.2:** YES / NO
```

---

## 🚀 Next Steps (After Testing)

Once all tests pass:

1. **✅ Mark Phase 7.1 as Complete**
2. **🎯 Proceed to Sub-Phase 7.2: Public Pages**
   - Integrate vendor listing with search/filters
   - Integrate vendor detail page with booking
   - Integrate homepage with featured vendors

3. **📝 Update Progress Files:**
   - Mark authentication tasks complete in `PHASE_7_INTEGRATION_ROADMAP.md`
   - Update progress in `FRONTEND_MASTER_PLAN.md`

4. **🔄 Git Commit:**
   ```bash
   cd marketplace-frontend
   git add .
   git commit -m "Phase 7.1: Complete authentication system integration"
   git push origin main
   ```

---

## 📞 Support

If any test fails:
1. Check backend server is running
2. Verify backend endpoints match frontend calls
3. Check browser console for detailed errors
4. Review localStorage for token issues
5. Test in incognito mode (clear cache)

**Happy Testing! 🎉**
