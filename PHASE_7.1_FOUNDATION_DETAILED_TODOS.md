# 🔐 PHASE 7.1: FOUNDATION - DETAILED IMPLEMENTATION TODOS
**Authentication & Core Services**

> **Duration:** 2-3 hours  
> **Priority:** CRITICAL - All other phases depend on this  
> **Status:** Ready to Start

---

## 📋 DETAILED TASK BREAKDOWN

### ✅ TASK 1: Install Required Dependencies
**Duration:** 5 minutes  
**Priority:** HIGH  
**Status:** Not Started

#### Steps:
1. Navigate to frontend directory
   ```bash
   cd marketplace-frontend
   ```

2. Install jwt-decode package
   ```bash
   npm install jwt-decode
   npm install --save-dev @types/jsonwebtoken
   ```

3. Verify installation
   ```bash
   npm list jwt-decode
   ```

#### Acceptance Criteria:
- [ ] jwt-decode package installed successfully
- [ ] No dependency conflicts
- [ ] Package appears in package.json

#### Files Modified:
- `marketplace-frontend/package.json`

---

### ✅ TASK 2: Create Auth Context Service
**Duration:** 30 minutes  
**Priority:** HIGH  
**Status:** Not Started

#### Steps:

1. **Create auth context file**
   - Path: `marketplace-frontend/lib/auth-context.tsx`
   - Create new file if doesn't exist

2. **Implement AuthContext with following features:**
   ```typescript
   interface User {
     email: string;
     role: 'customer' | 'vendor' | 'admin';
     name: string;
     slug?: string; // For vendors
   }

   interface AuthContextType {
     user: User | null;
     isAuthenticated: boolean;
     login: (token: string) => void;
     logout: () => void;
     isLoading: boolean;
   }
   ```

3. **JWT Token Decode Function:**
   - Decode JWT token to extract user info
   - Handle token expiration check
   - Return user object with email, role, name

4. **Login Function:**
   - Store token in localStorage
   - Decode token to get user info
   - Update auth state
   - Handle errors gracefully

5. **Logout Function:**
   - Remove token from localStorage
   - Clear user state
   - Redirect to login page

6. **Initialize Auth on Mount:**
   - Check localStorage for existing token
   - Auto-login if valid token exists
   - Clear token if expired

#### Code Structure:
```typescript
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

// Define interfaces
interface User { ... }
interface AuthContextType { ... }
interface JWTPayload { ... }

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth on mount
  useEffect(() => { ... });

  // Login function
  const login = (token: string) => { ... };

  // Logout function
  const logout = () => { ... };

  // Value object
  const value = { user, isAuthenticated: !!user, login, logout, isLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

#### Acceptance Criteria:
- [ ] File created at `lib/auth-context.tsx`
- [ ] AuthContext created with proper TypeScript types
- [ ] AuthProvider component exports children
- [ ] useAuth hook throws error if used outside provider
- [ ] login() stores token and decodes user info
- [ ] logout() clears token and redirects
- [ ] Auto-initialization on page load works
- [ ] Token expiration is checked
- [ ] No console errors

#### Testing:
```typescript
// Test in browser console after implementation:
localStorage.setItem('authToken', 'test-token');
// Refresh page - should attempt to decode token
```

#### Files Created:
- `marketplace-frontend/lib/auth-context.tsx` (NEW)

---

### ✅ TASK 3: Enhance API Client
**Duration:** 20 minutes  
**Priority:** HIGH  
**Status:** Not Started

#### Steps:

1. **Open existing API client**
   - Path: `marketplace-frontend/lib/api-client.ts`

2. **Add toast notifications import**
   ```typescript
   import { toast } from 'sonner';
   ```

3. **Enhance response interceptor error handling**
   - Show user-friendly error messages
   - Handle 401 (Unauthorized) - redirect to login
   - Handle 403 (Forbidden) - show permission error
   - Handle 404 (Not Found) - show not found message
   - Handle 500 (Server Error) - show server error message
   - Handle network errors

4. **Add request interceptor enhancement**
   - Already has Bearer token logic ✅
   - Verify it's working correctly

5. **Add helper functions**
   - `extractErrorMessage(error)` - Get user-friendly message
   - `isTokenExpired(token)` - Check token validity

#### Code Changes:
```typescript
// Enhanced response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      toast.error('Session expired. Please login again.');
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
    } else if (error.response?.status === 404) {
      toast.error('Resource not found.');
    } else if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.');
    } else if (!error.response) {
      toast.error('Network error. Please check your connection.');
    } else {
      const message = error.response?.data?.error || error.response?.data?.message || 'An error occurred';
      toast.error(message);
    }
    return Promise.reject(error);
  }
);
```

#### Acceptance Criteria:
- [ ] Toast notifications show for all error types
- [ ] 401 errors redirect to login page
- [ ] Error messages are user-friendly
- [ ] Request interceptor adds Bearer token correctly
- [ ] No breaking changes to existing functionality
- [ ] TypeScript types are correct

#### Testing:
```bash
# Test different error scenarios:
# 1. Login with wrong credentials (should show error toast)
# 2. Access protected route without token (should redirect)
# 3. Make request with expired token (should redirect)
```

#### Files Modified:
- `marketplace-frontend/lib/api-client.ts` (MODIFY)

---

### ✅ TASK 4: Create Protected Route Component
**Duration:** 20 minutes  
**Priority:** HIGH  
**Status:** Not Started

#### Steps:

1. **Create directory structure**
   ```bash
   mkdir -p marketplace-frontend/components/auth
   ```

2. **Create ProtectedRoute component**
   - Path: `marketplace-frontend/components/auth/ProtectedRoute.tsx`

3. **Implement protection logic:**
   - Check if user is authenticated
   - Verify user has correct role (customer/vendor/admin)
   - Show loading state while checking auth
   - Redirect to login if not authenticated
   - Redirect to home if wrong role

4. **Component interface:**
   ```typescript
   interface ProtectedRouteProps {
     children: React.ReactNode;
     requiredRole?: 'customer' | 'vendor' | 'admin';
     allowedRoles?: Array<'customer' | 'vendor' | 'admin'>;
   }
   ```

#### Code Structure:
```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'customer' | 'vendor' | 'admin';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!isLoading && requiredRole && user?.role !== requiredRole) {
      // Wrong role - redirect to appropriate dashboard
      if (user?.role === 'customer') router.push('/dashboard/customer');
      else if (user?.role === 'vendor') router.push('/dashboard/vendor');
      else if (user?.role === 'admin') router.push('/dashboard/admin');
      else router.push('/');
    }
  }, [isAuthenticated, user, isLoading, requiredRole, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
```

#### Acceptance Criteria:
- [ ] File created at `components/auth/ProtectedRoute.tsx`
- [ ] Redirects to login if not authenticated
- [ ] Redirects to correct dashboard if wrong role
- [ ] Shows loading spinner while checking auth
- [ ] Works with TypeScript strict mode
- [ ] No flash of wrong content (FOUC)

#### Testing:
```typescript
// Test scenarios:
// 1. Access /dashboard/customer without login → redirect to /login
// 2. Access /dashboard/vendor as customer → redirect to /dashboard/customer
// 3. Access /dashboard/admin as vendor → redirect to /dashboard/vendor
```

#### Files Created:
- `marketplace-frontend/components/auth/ProtectedRoute.tsx` (NEW)

---

### ✅ TASK 5: Integrate Login Page
**Duration:** 25 minutes  
**Priority:** HIGH  
**Status:** Not Started

#### Steps:

1. **Open login page**
   - Path: `marketplace-frontend/app/login/page.tsx`

2. **Import required dependencies**
   ```typescript
   import { useAuth } from '@/lib/auth-context';
   import { apiClient } from '@/lib/api-client';
   import { toast } from 'sonner';
   import { useRouter } from 'next/navigation';
   ```

3. **Add state for loading**
   ```typescript
   const [isLoading, setIsLoading] = useState(false);
   const { login } = useAuth();
   const router = useRouter();
   ```

4. **Replace TODO at Line 38** - API Integration
   ```typescript
   // Current: TODO: Integrate with backend API
   // Replace with:
   const onSubmit = async (data: LoginFormData) => {
     setIsLoading(true);
     try {
       const response = await apiClient.post('/api/auth/login', {
         email: data.email,
         password: data.password,
       });
       
       // Success - got token
       const token = response.data.token;
       // TODO at line 44 will handle this
     } catch (error: any) {
       const message = error.response?.data?.error || 'Login failed';
       toast.error(message);
     } finally {
       setIsLoading(false);
     }
   };
   ```

5. **Replace TODO at Line 44** - Store JWT and Redirect
   ```typescript
   // Current: TODO: Store JWT token in localStorage
   // Replace with:
   
   // Store token and decode user info
   login(token);
   
   toast.success('Login successful!');
   
   // Decode token to get user role for redirect
   const decoded = jwtDecode<any>(token);
   const userRole = decoded.role;
   
   // Redirect based on role
   if (userRole === 'customer') {
     router.push('/dashboard/customer');
   } else if (userRole === 'vendor') {
     router.push('/dashboard/vendor');
   } else if (userRole === 'admin') {
     router.push('/dashboard/admin');
   } else {
     router.push('/');
   }
   ```

6. **Update submit button to show loading state**
   ```typescript
   <Button type="submit" disabled={isLoading}>
     {isLoading ? 'Logging in...' : 'Login'}
   </Button>
   ```

7. **Add redirect if already logged in**
   ```typescript
   const { isAuthenticated, user } = useAuth();
   
   useEffect(() => {
     if (isAuthenticated && user) {
       // Already logged in, redirect to dashboard
       if (user.role === 'customer') router.push('/dashboard/customer');
       else if (user.role === 'vendor') router.push('/dashboard/vendor');
       else if (user.role === 'admin') router.push('/dashboard/admin');
     }
   }, [isAuthenticated, user, router]);
   ```

#### Acceptance Criteria:
- [ ] POST request to /api/auth/login works
- [ ] Token is stored in localStorage
- [ ] User is redirected based on role
- [ ] Error messages display via toast
- [ ] Loading state shows on button
- [ ] Already logged-in users redirect automatically
- [ ] Form validation works (email format, required fields)
- [ ] No console errors

#### Testing Scenarios:
```bash
# Test with backend running:
1. Login with customer credentials → redirect to /dashboard/customer
2. Login with vendor credentials → redirect to /dashboard/vendor
3. Login with admin credentials → redirect to /dashboard/admin
4. Login with wrong password → show error toast
5. Login with non-existent email → show error toast
6. Try to access /login while already logged in → auto redirect
```

#### Backend Endpoint:
```
POST /api/auth/login
Body: { email: string, password: string }
Response: { token: string, message: string }
```

#### Files Modified:
- `marketplace-frontend/app/login/page.tsx` (MODIFY - Lines 38, 44)

---

### ✅ TASK 6: Integrate Customer Signup
**Duration:** 25 minutes  
**Priority:** HIGH  
**Status:** Not Started

#### Steps:

1. **Open signup page**
   - Path: `marketplace-frontend/app/signup/page.tsx`

2. **Import required dependencies**
   ```typescript
   import { useAuth } from '@/lib/auth-context';
   import { apiClient } from '@/lib/api-client';
   import { toast } from 'sonner';
   import { useRouter } from 'next/navigation';
   ```

3. **Add state for loading**
   ```typescript
   const [isLoading, setIsLoading] = useState(false);
   const { login } = useAuth();
   const router = useRouter();
   ```

4. **Replace TODO at Line 70** - Customer Signup API
   ```typescript
   // Current: TODO: Integrate with backend API
   // Replace with:
   const onCustomerSubmit = async (data: SignupFormData) => {
     setIsLoading(true);
     try {
       const response = await apiClient.post('/api/auth/signup', {
         name: data.name,
         email: data.email,
         password: data.password,
         phone: data.phone || '',
       });
       
       const token = response.data.token;
       // TODO at line 76 will handle this
     } catch (error: any) {
       const message = error.response?.data?.error || 'Signup failed';
       toast.error(message);
     } finally {
       setIsLoading(false);
     }
   };
   ```

5. **Replace TODO at Line 76** - Store JWT and Redirect
   ```typescript
   // Current: TODO: Store JWT token and redirect
   // Replace with:
   
   login(token);
   toast.success('Account created successfully! Welcome!');
   
   // Customer signup - redirect to customer dashboard
   router.push('/dashboard/customer');
   ```

6. **Replace TODO at Line 88** - Vendor Signup API
   ```typescript
   // Current: TODO: Integrate with backend API
   // Replace with:
   const onVendorSubmit = async (data: VendorSignupFormData) => {
     setIsLoading(true);
     try {
       const response = await apiClient.post('/api/auth/vendor/signup', {
         name: data.ownerName,
         email: data.email,
         password: data.password,
         phone: data.phone || '',
         businessName: data.businessName,
         category: data.category,
         city: data.city,
         state: data.state || '',
       });
       
       const token = response.data.token;
       // TODO at line 94 will handle this
     } catch (error: any) {
       const message = error.response?.data?.error || 'Vendor signup failed';
       toast.error(message);
     } finally {
       setIsLoading(false);
     }
   };
   ```

7. **Replace TODO at Line 94** - Store JWT and Show Approval Message
   ```typescript
   // Current: TODO: Store JWT token and redirect
   // Replace with:
   
   login(token);
   
   toast.success('Vendor registration successful!', {
     description: 'Your account is pending approval. You will be notified once approved.',
     duration: 5000,
   });
   
   // Note: Vendor might be pending approval, but can still login
   // Backend should handle approval status
   router.push('/dashboard/vendor');
   ```

8. **Update submit buttons to show loading state**
   ```typescript
   // Customer form button:
   <Button type="submit" disabled={isLoading}>
     {isLoading ? 'Creating Account...' : 'Create Customer Account'}
   </Button>

   // Vendor form button:
   <Button type="submit" disabled={isLoading}>
     {isLoading ? 'Registering...' : 'Register as Vendor'}
   </Button>
   ```

9. **Add redirect if already logged in** (same as login page)
   ```typescript
   const { isAuthenticated, user } = useAuth();
   
   useEffect(() => {
     if (isAuthenticated && user) {
       if (user.role === 'customer') router.push('/dashboard/customer');
       else if (user.role === 'vendor') router.push('/dashboard/vendor');
       else if (user.role === 'admin') router.push('/dashboard/admin');
     }
   }, [isAuthenticated, user, router]);
   ```

#### Acceptance Criteria:
- [ ] Customer signup POST request works
- [ ] Vendor signup POST request works
- [ ] Token is stored after signup
- [ ] User is auto-logged in after signup
- [ ] Customer redirects to /dashboard/customer
- [ ] Vendor redirects to /dashboard/vendor with approval notice
- [ ] Error messages display via toast
- [ ] Loading states show on buttons
- [ ] Form validation works (email format, password strength, required fields)
- [ ] Tab switching between customer/vendor works
- [ ] No console errors

#### Testing Scenarios:
```bash
# Test with backend running:
1. Signup as customer → create account → auto-login → redirect to customer dashboard
2. Signup as vendor → create account → auto-login → show "pending approval" → redirect to vendor dashboard
3. Signup with existing email → show error toast
4. Signup with weak password → show validation error
5. Switch between customer/vendor tabs → correct form shows
```

#### Backend Endpoints:
```
POST /api/auth/signup
Body: { name: string, email: string, password: string, phone?: string }
Response: { token: string, message: string }

POST /api/auth/vendor/signup
Body: { name, email, password, phone, businessName, category, city, state }
Response: { token: string, message: string }
```

#### Files Modified:
- `marketplace-frontend/app/signup/page.tsx` (MODIFY - Lines 70, 76, 88, 94)

---

### ✅ TASK 7: Update Header Component
**Duration:** 15 minutes  
**Priority:** MEDIUM  
**Status:** Not Started

#### Steps:

1. **Open Header component**
   - Path: `marketplace-frontend/components/layout/Header.tsx`

2. **Import useAuth hook**
   ```typescript
   import { useAuth } from '@/lib/auth-context';
   ```

3. **Replace TODO at Line 19** - Get auth state from context
   ```typescript
   // Current: const isLoggedIn = false; // TODO: Get from auth context
   // Replace with:
   const { isAuthenticated, user, logout } = useAuth();
   ```

4. **Update conditional rendering to use isAuthenticated**
   ```typescript
   {isAuthenticated ? (
     // Show user menu
     <DropdownMenu>
       <DropdownMenuTrigger asChild>
         <Button variant="ghost" className="flex items-center gap-2">
           <Avatar className="h-8 w-8">
             <AvatarFallback>
               {user?.name?.charAt(0).toUpperCase() || 'U'}
             </AvatarFallback>
           </Avatar>
           <span className="hidden md:inline">{user?.name || 'User'}</span>
         </Button>
       </DropdownMenuTrigger>
       <DropdownMenuContent align="end">
         <DropdownMenuItem onClick={() => {
           if (user?.role === 'customer') router.push('/dashboard/customer');
           else if (user?.role === 'vendor') router.push('/dashboard/vendor');
           else if (user?.role === 'admin') router.push('/dashboard/admin');
         }}>
           Dashboard
         </DropdownMenuItem>
         <DropdownMenuItem onClick={() => router.push('/profile')}>
           Profile
         </DropdownMenuItem>
         <DropdownMenuSeparator />
         <DropdownMenuItem onClick={logout}>
           Logout
         </DropdownMenuItem>
       </DropdownMenuContent>
     </DropdownMenu>
   ) : (
     // Show login/signup buttons
     <div className="flex items-center gap-2">
       <Button variant="ghost" onClick={() => router.push('/login')}>
         Login
       </Button>
       <Button onClick={() => router.push('/signup')}>
         Sign Up
       </Button>
     </div>
   )}
   ```

5. **Import required components if not present**
   ```typescript
   import { Avatar, AvatarFallback } from '@/components/ui/avatar';
   import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuSeparator,
     DropdownMenuTrigger,
   } from '@/components/ui/dropdown-menu';
   import { useRouter } from 'next/navigation';
   ```

#### Acceptance Criteria:
- [ ] Header shows "Login/Signup" when not authenticated
- [ ] Header shows user avatar and name when authenticated
- [ ] Dropdown menu shows Dashboard link
- [ ] Dropdown menu shows Profile link
- [ ] Dropdown menu shows Logout link
- [ ] Dashboard link redirects to correct dashboard based on role
- [ ] Logout clears auth and redirects to login
- [ ] Avatar shows first letter of user's name
- [ ] No console errors
- [ ] Works on mobile (responsive)

#### Testing:
```bash
# Test scenarios:
1. Visit homepage without login → see "Login/Signup" buttons
2. Login as customer → see user avatar and name
3. Click avatar → see dropdown menu
4. Click Dashboard → redirect to /dashboard/customer
5. Click Logout → redirect to /login and clear token
6. Refresh page → still authenticated (token persists)
```

#### Files Modified:
- `marketplace-frontend/components/layout/Header.tsx` (MODIFY - Line 19)

---

### ✅ TASK 8: Add Logout to Customer Dashboard
**Duration:** 10 minutes  
**Priority:** MEDIUM  
**Status:** Not Started

#### Steps:

1. **Open Customer Dashboard Layout**
   - Path: `marketplace-frontend/app/dashboard/customer/layout.tsx`

2. **Import useAuth hook**
   ```typescript
   import { useAuth } from '@/lib/auth-context';
   ```

3. **Get logout function**
   ```typescript
   const { logout } = useAuth();
   ```

4. **Replace TODO at Line 57** - Implement logout logic
   ```typescript
   // Current: // TODO: Implement logout logic
   // Replace with:
   const handleLogout = () => {
     if (confirm('Are you sure you want to logout?')) {
       logout();
     }
   };
   ```

5. **Update logout button onClick**
   ```typescript
   <Button
     variant="ghost"
     className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
     onClick={handleLogout}
   >
     <LogOut className="mr-2 h-4 w-4" />
     Logout
   </Button>
   ```

#### Acceptance Criteria:
- [ ] Logout button shows confirmation dialog
- [ ] Clicking "OK" logs out and redirects to login
- [ ] Clicking "Cancel" keeps user logged in
- [ ] Token is cleared from localStorage
- [ ] Auth context is updated
- [ ] No console errors

#### Testing:
```bash
# Test in customer dashboard:
1. Click logout button → confirmation dialog appears
2. Click OK → redirect to /login
3. Check localStorage → authToken removed
4. Try to access /dashboard/customer → redirect to /login
```

#### Files Modified:
- `marketplace-frontend/app/dashboard/customer/layout.tsx` (MODIFY - Line 57)

---

### ✅ TASK 9: Add Logout to Vendor Dashboard
**Duration:** 10 minutes  
**Priority:** MEDIUM  
**Status:** Not Started

#### Steps:

1. **Open Vendor Dashboard Layout**
   - Path: `marketplace-frontend/app/dashboard/vendor/layout.tsx`

2. **Import useAuth hook**
   ```typescript
   import { useAuth } from '@/lib/auth-context';
   ```

3. **Get logout function**
   ```typescript
   const { logout } = useAuth();
   ```

4. **Replace TODO at Line 67** - Implement logout logic
   ```typescript
   // Current: // TODO: Implement logout logic
   // Replace with:
   const handleLogout = () => {
     if (confirm('Are you sure you want to logout?')) {
       logout();
     }
   };
   ```

5. **Update logout button onClick**
   ```typescript
   <Button
     variant="ghost"
     className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
     onClick={handleLogout}
   >
     <LogOut className="mr-2 h-4 w-4" />
     Logout
   </Button>
   ```

#### Acceptance Criteria:
- [ ] Same as Task 8, but for vendor dashboard
- [ ] Logout confirmation works
- [ ] Redirects to login page
- [ ] Token cleared
- [ ] No console errors

#### Testing:
```bash
# Same test as Task 8, but in vendor dashboard
```

#### Files Modified:
- `marketplace-frontend/app/dashboard/vendor/layout.tsx` (MODIFY - Line 67)

---

### ✅ TASK 10: Add Logout to Admin Dashboard
**Duration:** 10 minutes  
**Priority:** MEDIUM  
**Status:** Not Started

#### Steps:

1. **Open Admin Dashboard Layout**
   - Path: `marketplace-frontend/app/dashboard/admin/layout.tsx`

2. **Import useAuth hook**
   ```typescript
   import { useAuth } from '@/lib/auth-context';
   ```

3. **Get logout function**
   ```typescript
   const { logout } = useAuth();
   ```

4. **Replace TODO at Line 70** - Call logout API
   ```typescript
   // Current: // TODO: Call logout API
   // Replace with:
   const handleLogout = () => {
     if (confirm('Are you sure you want to logout?')) {
       logout();
     }
   };
   ```

5. **Update logout button onClick**
   ```typescript
   <Button
     variant="ghost"
     className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
     onClick={handleLogout}
   >
     <LogOut className="mr-2 h-4 w-4" />
     Logout
   </Button>
   ```

#### Acceptance Criteria:
- [ ] Same as Task 8, but for admin dashboard
- [ ] Logout confirmation works
- [ ] Redirects to login page
- [ ] Token cleared
- [ ] No console errors

#### Testing:
```bash
# Same test as Task 8, but in admin dashboard
```

#### Files Modified:
- `marketplace-frontend/app/dashboard/admin/layout.tsx` (MODIFY - Line 70)

---

### ✅ TASK 11: Wrap App with AuthProvider
**Duration:** 10 minutes  
**Priority:** HIGH  
**Status:** Not Started

#### Steps:

1. **Open root layout**
   - Path: `marketplace-frontend/app/layout.tsx`

2. **Import AuthProvider**
   ```typescript
   import { AuthProvider } from '@/lib/auth-context';
   ```

3. **Wrap children with AuthProvider**
   ```typescript
   export default function RootLayout({ children }) {
     return (
       <html lang="en">
         <body className={inter.className}>
           <QueryClientProvider client={queryClient}>
             <AuthProvider>
               <Toaster richColors position="top-right" />
               {children}
             </AuthProvider>
           </QueryClientProvider>
         </body>
       </html>
     );
   }
   ```

4. **Ensure correct nesting order:**
   - QueryClientProvider (outermost)
   - AuthProvider (inside QueryClient)
   - Toaster (inside Auth)
   - children (innermost)

#### Acceptance Criteria:
- [ ] AuthProvider wraps entire app
- [ ] No provider nesting errors
- [ ] useAuth hook works in all pages
- [ ] Auth state persists across route changes
- [ ] No console errors
- [ ] App still renders correctly

#### Testing:
```bash
# Test that auth works across entire app:
1. Login → auth state available everywhere
2. Navigate between pages → auth state persists
3. Refresh page → auth state rehydrates from localStorage
4. Logout → auth state clears everywhere
```

#### Files Modified:
- `marketplace-frontend/app/layout.tsx` (MODIFY)

---

### ✅ TASK 12: Protect Dashboard Routes
**Duration:** 15 minutes  
**Priority:** MEDIUM  
**Status:** Not Started

#### Steps:

1. **Wrap Customer Dashboard Layout**
   - Path: `marketplace-frontend/app/dashboard/customer/layout.tsx`
   ```typescript
   import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
   
   export default function CustomerLayout({ children }) {
     return (
       <ProtectedRoute requiredRole="customer">
         {/* existing layout code */}
       </ProtectedRoute>
     );
   }
   ```

2. **Wrap Vendor Dashboard Layout**
   - Path: `marketplace-frontend/app/dashboard/vendor/layout.tsx`
   ```typescript
   import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
   
   export default function VendorLayout({ children }) {
     return (
       <ProtectedRoute requiredRole="vendor">
         {/* existing layout code */}
       </ProtectedRoute>
     );
   }
   ```

3. **Wrap Admin Dashboard Layout**
   - Path: `marketplace-frontend/app/dashboard/admin/layout.tsx`
   ```typescript
   import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
   
   export default function AdminLayout({ children }) {
     return (
       <ProtectedRoute requiredRole="admin">
         {/* existing layout code */}
       </ProtectedRoute>
     );
   }
   ```

#### Acceptance Criteria:
- [ ] Unauthenticated users redirect to /login
- [ ] Customers can't access vendor/admin dashboards
- [ ] Vendors can't access customer/admin dashboards
- [ ] Admins can't access customer/vendor dashboards
- [ ] Role-based redirection works correctly
- [ ] Loading state shows while checking auth
- [ ] No flash of unauthorized content

#### Testing:
```bash
# Test protection scenarios:
1. Try to access /dashboard/customer without login → redirect to /login
2. Login as vendor, try /dashboard/customer → redirect to /dashboard/vendor
3. Login as customer, try /dashboard/admin → redirect to /dashboard/customer
4. Login as admin, access /dashboard/admin → success
```

#### Files Modified:
- `marketplace-frontend/app/dashboard/customer/layout.tsx` (MODIFY)
- `marketplace-frontend/app/dashboard/vendor/layout.tsx` (MODIFY)
- `marketplace-frontend/app/dashboard/admin/layout.tsx` (MODIFY)

---

### ✅ TASK 13: End-to-End Testing
**Duration:** 30 minutes  
**Priority:** CRITICAL  
**Status:** Not Started

#### Comprehensive Test Scenarios:

1. **Customer Journey:**
   ```bash
   ✓ Visit homepage → not logged in
   ✓ Click "Login" → navigate to /login
   ✓ Submit login form with customer credentials
   ✓ Verify redirect to /dashboard/customer
   ✓ Check localStorage has authToken
   ✓ Verify header shows user name and avatar
   ✓ Click avatar → see dropdown menu
   ✓ Navigate to different pages → auth persists
   ✓ Refresh page → still authenticated
   ✓ Click logout → redirect to /login
   ✓ Verify token removed from localStorage
   ```

2. **Vendor Journey:**
   ```bash
   ✓ Visit /signup
   ✓ Switch to "Vendor" tab
   ✓ Fill vendor signup form
   ✓ Submit form → account created
   ✓ Verify auto-login and redirect to /dashboard/vendor
   ✓ See "pending approval" message
   ✓ Verify header shows vendor name
   ✓ Try to access /dashboard/customer → redirect back to /dashboard/vendor
   ✓ Logout → token cleared
   ```

3. **Admin Journey:**
   ```bash
   ✓ Login with admin credentials
   ✓ Redirect to /dashboard/admin
   ✓ Verify admin dashboard loads
   ✓ Header shows admin name
   ✓ Try to access /dashboard/vendor → redirect back to /dashboard/admin
   ✓ Logout works
   ```

4. **Edge Cases:**
   ```bash
   ✓ Login with wrong password → error toast shows
   ✓ Login with non-existent email → error toast shows
   ✓ Signup with existing email → error toast shows
   ✓ Try to access protected route without login → redirect to /login
   ✓ Token expires → auto-logout on next API call
   ✓ Network error → user-friendly error message
   ```

5. **Cross-Browser Testing:**
   ```bash
   ✓ Chrome → all features work
   ✓ Firefox → all features work
   ✓ Safari → all features work
   ✓ Edge → all features work
   ```

6. **Mobile Testing:**
   ```bash
   ✓ Login on mobile → works
   ✓ Header menu on mobile → accessible
   ✓ Dashboard on mobile → responsive
   ✓ Logout on mobile → works
   ```

#### Acceptance Criteria:
- [ ] All customer test scenarios pass
- [ ] All vendor test scenarios pass
- [ ] All admin test scenarios pass
- [ ] All edge cases handled gracefully
- [ ] No console errors in any scenario
- [ ] No broken links
- [ ] No infinite redirects
- [ ] Token persistence works
- [ ] Role-based access control works
- [ ] Cross-browser compatible
- [ ] Mobile responsive

#### Debugging Checklist:
```bash
✓ Check Network tab in DevTools
✓ Verify API endpoints return correct data
✓ Check localStorage for authToken
✓ Decode JWT token to verify payload
✓ Check console for errors
✓ Verify MongoDB has user data
✓ Test with backend running on localhost:8080
```

---

## 📊 PROGRESS TRACKING

### Completion Checklist:
- [ ] Task 1: Dependencies installed
- [ ] Task 2: Auth Context created
- [ ] Task 3: API Client enhanced
- [ ] Task 4: Protected Route created
- [ ] Task 5: Login page integrated
- [ ] Task 6: Signup pages integrated
- [ ] Task 7: Header updated
- [ ] Task 8: Customer logout added
- [ ] Task 9: Vendor logout added
- [ ] Task 10: Admin logout added
- [ ] Task 11: AuthProvider wrapped
- [ ] Task 12: Routes protected
- [ ] Task 13: Testing completed

### Files Summary:
**Created (3 files):**
- `lib/auth-context.tsx`
- `components/auth/ProtectedRoute.tsx`
- `package.json` (dependencies added)

**Modified (8 files):**
- `lib/api-client.ts`
- `app/login/page.tsx`
- `app/signup/page.tsx`
- `components/layout/Header.tsx`
- `app/dashboard/customer/layout.tsx`
- `app/dashboard/vendor/layout.tsx`
- `app/dashboard/admin/layout.tsx`
- `app/layout.tsx`

**Total Files Touched:** 11 files
**Total TODO Comments Resolved:** 10 comments

---

## 🎯 SUCCESS CRITERIA

**Phase 7.1 is complete when:**
- ✅ All 13 tasks are checked off
- ✅ Users can login with email/password
- ✅ Customers, vendors, and admins can signup
- ✅ JWT token is stored and persists
- ✅ Role-based redirection works
- ✅ Protected routes work correctly
- ✅ Logout functionality works
- ✅ Header shows correct auth state
- ✅ No console errors
- ✅ All tests pass

**Ready to move to Phase 7.2 when:**
- ✅ Authentication system is solid
- ✅ No blocking bugs
- ✅ Team is confident in auth implementation

---

**🚀 START WITH TASK 1: Install Dependencies**

_Detailed Todos Created: February 5, 2026_
