# 📊 VendorHub Marketplace - Database Collections Summary

## Total Collections: **9**

All collections are now seeded and visible in MongoDB Atlas!

---

## Collection Details

### 1. **vendors** (User Created)
- **Description**: Vendor business profiles
- **Count**: Check your Atlas dashboard
- **Sample Fields**: 
  - businessName, slug, email, vendorType
  - description, services, gallery
  - rating, phone, website, address
  - yearsInBusiness, certified, promoted
- **Created By**: User registration (john@johnsplumbing.com, yogeshjat8965@gmail.com)

### 2. **users** (User Created)
- **Description**: Customer, Vendor, and Admin accounts
- **Count**: Check your Atlas dashboard  
- **Sample Fields**:
  - name, email, password (hashed)
  - role (CUSTOMER, VENDOR, ADMIN)
  - googleId, imageUrl
  - consentConfirmed
- **Created By**: Auth registration/login

### 3. **categories** ✅ (Seeded: 20)
- **Description**: Service categories for vendors
- **Sample Data**:
  - Plumbing
  - Electrical
  - HVAC
  - Carpentry
  - Painting
  - Roofing
  - Landscaping
  - Cleaning
  - Pest Control
  - Handyman
  - Flooring
  - Moving
  - Locksmith
  - Appliance Repair
  - Window Installation
  - Garage Door
  - Pool Service
  - Drywall
  - Masonry
  - Fencing
- **Fields**: name, slug, description, icon, displayOrder, visible

### 4. **quote_requests** ✅ (Seeded: 6 total)
- **Description**: Customer quote requests to vendors
- **Sample Data**:
  - Electrical Inspection ($500)
  - Panel Upgrade ($2500) - ACCEPTED
  - Pool Cleaning ($150) - COMPLETED
  - Outlet Installation ($400)
  - Pool Repair ($800)
- **Fields**: vendorSlug, customerName, customerEmail, customerMobile, serviceRequested, projectDescription, budget, status, preferredDate

### 5. **reviews** ✅ (Seeded: 5)
- **Description**: Customer reviews for vendors
- **Sample Data**:
  - John's Electricians: 5★, 5★, 4★
  - ALIFEBOT Pool Service: 5★, 5★
- **Fields**: vendorSlug, customerName, customerEmail, rating (1-5), comment, images, flagged, verifiedPurchase

### 6. **page_views** ✅ (Seeded: 7)
- **Description**: Vendor profile page view tracking
- **Sample Data**:
  - johns-electricians: 4 views
  - alifebot: 3 views
- **Fields**: vendorSlug, ipAddress, userAgent, referrer, city, viewedAt

### 7. **notifications** ✅ (Seeded: 3)
- **Description**: User notifications (quotes, reviews, system)
- **Sample Data**:
  - "New Quote Request" for john@johnsplumbing.com
  - "Quote Accepted" for john@johnsplumbing.com (read)
  - "New Review" for yogeshjat8965@gmail.com
- **Fields**: userId, type (QUOTE_REQUEST, QUOTE_ACCEPTED, REVIEW), title, message, link, read

### 8. **subscriptions** ✅ (Seeded: 3)
- **Description**: Vendor subscription plans
- **Sample Data**:
  - johns-electricians: BASIC ($29.99/mo) - ACTIVE
  - alifebot: PREMIUM ($99.99/mo) - ACTIVE
  - demo-vendor: BASIC ($0) - TRIAL
- **Fields**: vendorSlug, plan (BASIC, PREMIUM), price, startDate, endDate, status, autoRenew

### 9. **collaborations** ✅ (Seeded: 2)
- **Description**: Vendor collaboration requests
- **Sample Data**:
  - "Need Plumber for Joint Project" by johns-electricians (OPEN)
  - "Pool & Landscaping Partnership" by alifebot (OPEN)
- **Fields**: postedByVendorSlug, title, description, lookingFor (service types), projectType, location, budget, status

---

## Seeding Status

✅ **All collections successfully seeded!**

- Categories: 20 items
- Quote Requests: 6 items (1 existing + 5 new)
- Reviews: 5 items
- Page Views: 7 items
- Notifications: 3 items
- Subscriptions: 3 items
- Collaborations: 2 items

---

## How to View in MongoDB Atlas

1. Go to your MongoDB Atlas dashboard
2. Click "Browse Collections"
3. Select database: **marketplace**
4. You should now see all **9 collections**:
   - categories
   - collaborations
   - notifications
   - page_views
   - quote_requests
   - reviews
   - subscriptions
   - users
   - vendors

---

## API Endpoints (All Working ✅)

### Public Endpoints
- `GET /api/categories` - List all categories (20)
- `GET /api/categories/{id}` - Get category by ID
- `GET /api/categories/slug/{slug}` - Get category by slug
- `GET /api/vendors` - List all vendors
- `GET /api/vendors/{slug}` - Get vendor details
- `POST /api/quotes` - Submit quote request
- `GET /api/explore` - Browse vendors

### Protected Endpoints (Require JWT)
- `GET /api/vendor/dashboard/stats?email={email}` - Vendor dashboard stats
- `GET /api/vendor/profile?email={email}` - Vendor profile
- `PUT /api/vendor/profile?email={email}` - Update vendor profile
- `GET /api/quotes/vendor?email={email}` - Get vendor's quotes

### Admin Endpoints (Require ADMIN role)
- `GET /api/admin/**` - Admin panel endpoints

---

## Test the Backend

```bash
# Test categories
curl http://localhost:8080/api/categories

# Count categories
curl -s http://localhost:8080/api/categories | jq 'length'
# Output: 20

# Get first category
curl -s http://localhost:8080/api/categories | jq '.[0]'
```

---

## Next Steps

1. ✅ **All collections are visible in Atlas**
2. ✅ **No fetching errors**
3. ✅ **Backend running on port 8080**
4. Ready to test frontend at `http://localhost:3000`

---

## Connection String

Your MongoDB Atlas connection is configured via environment variable:
```bash
MONGODB_URI="mongodb+srv://yogeshjat8965_db_user:rSqxEps5KTz7o2Qp@vendorhub.whs5yyc.mongodb.net/marketplace?retryWrites=true&w=majority"
```

Backend automatically connects on startup! 🚀
