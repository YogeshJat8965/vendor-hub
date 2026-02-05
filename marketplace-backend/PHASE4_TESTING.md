# Phase 4 Testing Guide - Dashboard & Analytics

## Files Created in Phase 4 (6 files)

### Repositories (2 files):
1. **PageViewRepository.java** - Track vendor profile page views
   - `findByVendorSlug(slug)` - Get all views for a vendor
   - `countByVendorSlugAndViewedAtAfter(slug, after)` - Count views after date

2. **CollaborationRepository.java** - Manage vendor-to-vendor collaborations
   - `findByStatus(status)` - Get collaborations by status (OPEN/CLOSED)
   - `findByPostedByVendorSlug(slug)` - Get all collaborations posted by vendor

### DTOs (1 file):
3. **DashboardMetrics.java** - Analytics response structure
   - vendorName, slug, subscriptionPlan
   - totalViews, recentViews7d, recentViews30d
   - totalLeads, recentLeads7d
   - totalReviews, averageRating
   - conversionRate (calculated from views/leads)

### Controllers (3 files):
4. **VendorDashboardController.java** - Vendor analytics dashboard
   - GET `/api/vendor/dashboard/overview?slug={vendorSlug}`

5. **CollaborationController.java** - Vendor networking
   - POST `/api/collaboration/post`
   - GET `/api/collaboration/search`
   - GET `/api/collaboration/vendor/{vendorSlug}`

6. **AdminController.java** - Admin moderation panel
   - GET `/api/admin/dashboard`
   - GET `/api/admin/vendors`
   - GET `/api/admin/reviews/flagged`
   - DELETE `/api/admin/reviews/{reviewId}`

---

## Build Results

**Total Source Files: 37** (Phase 1-4 complete)

BUILD SUCCESS - All compilation successful!

---

## Testing Instructions

### Step 1: Start Server
```bash
cd /home/yogesh/Desktop/freelance_Project/marketPlace/marketplace-backend
bash start-server.sh
```

The server will start on `http://localhost:8080`

---

## API Testing

### 1. Vendor Dashboard Analytics

**Get Dashboard Overview:**
```bash
curl http://localhost:8080/api/vendor/dashboard/overview?slug=john-electricians
```

**Expected Response:**
```json
{
  "vendorName": "John's Electricians",
  "slug": "john-electricians",
  "subscriptionPlan": "PREMIUM",
  "totalViews": 0,
  "recentViews7d": 0,
  "recentViews30d": 0,
  "totalLeads": 2,
  "recentLeads7d": 1,
  "totalReviews": 3,
  "averageRating": 4.5,
  "conversionRate": 0.0
}
```

**Note:** Initially views will be 0. To test views tracking, you need to track page views when users visit vendor profiles.

---

### 2. Collaboration Board

**First, login as vendor to get JWT token:**
```bash
# Login as vendor (replace with your vendor credentials)
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@electricians.com",
    "password": "password123"
  }'
```

**Post a Collaboration Opportunity:**
```bash
curl -X POST http://localhost:8080/api/collaboration/post \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "postedByVendorSlug": "john-electricians",
    "postedByVendorName": "John'\''s Electricians",
    "title": "Looking for Plumber Partner for Commercial Projects",
    "description": "Seeking experienced plumber for ongoing collaboration on commercial building projects.",
    "requiredExpertise": ["Commercial Plumbing", "Industrial"],
    "budget": "Revenue Share",
    "location": "Mumbai"
  }'
```

**Expected Response:**
```json
{
  "collaboration": {
    "id": "123abc...",
    "postedByVendorSlug": "john-electricians",
    "title": "Looking for Plumber Partner for Commercial Projects",
    "status": "OPEN",
    "createdAt": "2024-..."
  },
  "message": "Posted successfully"
}
```

**Search Open Collaborations:**
```bash
curl http://localhost:8080/api/collaboration/search
```

**Get Vendor's Posted Collaborations:**
```bash
curl http://localhost:8080/api/collaboration/vendor/john-electricians
```

---

### 3. Admin Dashboard

**First, create an admin user (if not already created):**
```bash
# You'll need to manually update MongoDB to set role as "ADMIN"
# Or create a separate admin registration endpoint
```

**Get Admin Dashboard Stats:**
```bash
curl http://localhost:8080/api/admin/dashboard \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "totalUsers": 10,
  "totalVendors": 5,
  "totalReviews": 15
}
```

**Get All Vendors:**
```bash
curl http://localhost:8080/api/admin/vendors \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Get Flagged Reviews:**
```bash
curl http://localhost:8080/api/admin/reviews/flagged \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Delete Review:**
```bash
curl -X DELETE http://localhost:8080/api/admin/reviews/{reviewId} \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

---

## Manual Testing via MongoDB

### Track Page Views (for testing dashboard)
```javascript
// In MongoDB Compass or Shell, insert page views:
db.pageViews.insertMany([
  {
    vendorSlug: "john-electricians",
    userId: "customer123",
    ipAddress: "192.168.1.1",
    viewedAt: new Date()
  },
  {
    vendorSlug: "john-electricians",
    userId: "customer456",
    ipAddress: "192.168.1.2",
    viewedAt: new Date(Date.now() - 3*24*60*60*1000) // 3 days ago
  },
  {
    vendorSlug: "john-electricians",
    userId: null,
    ipAddress: "192.168.1.3",
    viewedAt: new Date(Date.now() - 15*24*60*60*1000) // 15 days ago
  }
])
```

After inserting page views, re-run dashboard overview to see updated stats.

---

## Security Notes

### Protected Endpoints:
- `/api/vendor/dashboard/**` - Requires VENDOR role
- `/api/collaboration/post` - Requires VENDOR role
- `/api/admin/**` - Requires ADMIN role

### Public Endpoints:
- `/api/collaboration/search` - Public (anyone can view open collaborations)
- `/api/collaboration/vendor/{slug}` - Public

Make sure to include `Authorization: Bearer <token>` header for protected endpoints.

---

## Common Issues & Solutions

### Issue: "Vendor not found"
- Make sure the vendor slug exists in database
- Check spelling of slug in URL

### Issue: 401 Unauthorized
- JWT token expired (tokens valid for 1 hour)
- Login again to get fresh token
- Make sure token is in Authorization header

### Issue: 403 Forbidden
- User role doesn't match endpoint requirement
- Vendor trying to access admin endpoints
- Customer trying to access vendor endpoints

### Issue: Empty dashboard metrics
- No data in database yet
- Create some page views, quotes, reviews first
- Use MongoDB Compass to verify data

---

## Phase 4 Completion Checklist

✅ PageViewRepository created with custom query methods  
✅ CollaborationRepository created with status and vendor filters  
✅ DashboardMetrics DTO with 11 fields  
✅ VendorDashboardController with analytics calculation  
✅ CollaborationController with 3 endpoints  
✅ AdminController with 4 moderation endpoints  
✅ All 37 source files compiled successfully  
✅ Build successful with no errors  

---

## Next Steps

Phase 4 is **COMPLETE**! 

**Remaining Backend Phase:**
- **Phase 5**: Subscription & Notifications (Final backend phase)
  - Subscription management
  - Payment integration hooks
  - Email notifications
  - Push notifications

After Phase 5, backend will be 100% complete!

Would you like to:
1. Test Phase 4 endpoints first?
2. Proceed directly to Phase 5?
3. Review any specific Phase 4 functionality?
