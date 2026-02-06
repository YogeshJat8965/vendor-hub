# Phase 7.4 - Vendor Dashboard Testing Checklist

## Test Environment Setup
- [ ] Backend API running on http://localhost:8080
- [ ] Frontend running on http://localhost:3000
- [ ] Valid vendor account credentials available
- [ ] Test database with sample data

## Task 1: Vendor Dashboard Overview
- [ ] Navigate to /dashboard/vendor
- [ ] Verify stats cards display correctly (totalViews, quoteRequests, pendingQuotes, acceptedQuotes, completedQuotes, averageRating, totalReviews)
- [ ] Check recent quotes display with correct data
- [ ] Verify status icons for different quote statuses (Pending, Accepted, Rejected, Completed)
- [ ] Test getTimeAgo() formatting (e.g., "2 days ago", "1 hour ago")
- [ ] Verify empty state displays when no quotes exist
- [ ] Check loading state with spinner during API fetch
- [ ] Test error handling if API fails
- [ ] Verify stats update in real-time when data changes

## Task 2-4: Vendor Quotes Management
- [ ] Navigate to /dashboard/vendor/quotes
- [ ] Verify quotes fetch from /quotes/vendor?email={email}
- [ ] Test status filtering tabs (All, Pending, Accepted, Completed, Rejected)
- [ ] Verify quote counts display correctly in each tab
- [ ] Test search functionality (by serviceType, customerEmail, description)
- [ ] Test sort options (newest first, oldest first)
- [ ] Verify quote cards display all required fields:
  - [ ] Customer email
  - [ ] Service type
  - [ ] Description
  - [ ] Status badge with correct color
  - [ ] Budget and timeline
  - [ ] Location and contact phone
  - [ ] Created date with getTimeAgo()
- [ ] Test Accept Quote button:
  - [ ] Click Accept on a pending quote
  - [ ] Verify PUT request to /quotes/{id}/status with status: 'ACCEPTED'
  - [ ] Check toast notification displays
  - [ ] Verify quote status updates in UI
- [ ] Test Decline Quote button:
  - [ ] Click Decline on a pending quote
  - [ ] Verify PUT request to /quotes/{id}/status with status: 'REJECTED'
  - [ ] Check toast notification displays
  - [ ] Verify quote status updates in UI
- [ ] Test Respond to Quote:
  - [ ] Click "Respond" button on a quote
  - [ ] Verify quote response dialog opens
  - [ ] Enter amount (number input validation)
  - [ ] Enter message (textarea)
  - [ ] Submit response
  - [ ] Verify POST to /quotes/{id}/respond with {amount, message}
  - [ ] Check success toast notification
  - [ ] Verify dialog closes and data refreshes
- [ ] Test loading states during all actions
- [ ] Verify error handling for failed API calls
- [ ] Test empty state when no quotes match filters

## Task 5: Vendor Profile/Storefront Edit
- [ ] Navigate to /dashboard/vendor/storefront
- [ ] Verify loading state displays while fetching data
- [ ] Check GET /vendor/profile?email={email} fetches profile data
- [ ] Verify form populates with existing data:
  - [ ] businessName
  - [ ] category (vendorType)
  - [ ] description
  - [ ] longDescription
  - [ ] phone, email, website
  - [ ] address, city, state, zipCode
  - [ ] yearsInBusiness
- [ ] Test form validation (Zod schema):
  - [ ] Required fields show errors when empty
  - [ ] Email format validation
  - [ ] Phone number format validation
  - [ ] Website URL format validation
- [ ] Test profile update:
  - [ ] Modify form fields
  - [ ] Click "Save Changes"
  - [ ] Verify PUT /vendor/profile with updated data
  - [ ] Check success toast notification
  - [ ] Verify data refreshes after update
- [ ] Test business logo display (first letter of businessName)
- [ ] Test preview button (opens /vendors/{slug})

## Task 6: Service Management
- [ ] Verify services array displays from profile API
- [ ] Test add service:
  - [ ] Enter service name in input
  - [ ] Click Add button or press Enter
  - [ ] Verify service added to local state
  - [ ] Check PUT /vendor/profile with updated services array
  - [ ] Verify success toast
- [ ] Test remove service:
  - [ ] Click X button on a service chip
  - [ ] Verify service removed from UI
  - [ ] Check PUT /vendor/profile with updated services array
  - [ ] Verify success toast
- [ ] Test error handling:
  - [ ] Simulate API failure
  - [ ] Verify service reverts to previous state
  - [ ] Check error toast displays

## Task 7: Portfolio/Gallery Management
- [ ] Verify gallery displays from profile API
- [ ] Test gallery empty state (no images)
- [ ] Test add gallery button:
  - [ ] Click "Upload Photos" or "Add Photos" button
  - [ ] Verify toast info message (coming soon feature)
- [ ] Test remove gallery image:
  - [ ] Click Trash icon on image
  - [ ] Verify image removed from UI
  - [ ] Check PUT /vendor/profile with updated gallery array
  - [ ] Verify success toast
- [ ] Test error handling for image removal
- [ ] Verify gallery grid layout (responsive 2/4 columns)

## Task 8: Reviews Display Integration
- [ ] Navigate to /dashboard/vendor/reviews
- [ ] Verify loading state displays during fetch
- [ ] Check GET /reviews/vendor?email={email} fetches reviews
- [ ] Verify stats overview displays:
  - [ ] Average rating (calculated correctly)
  - [ ] Total reviews count
  - [ ] Rating distribution (5-star breakdown with percentages)
- [ ] Verify review cards display:
  - [ ] Customer name with avatar (first letter)
  - [ ] Rating stars (filled/unfilled correctly)
  - [ ] Service type
  - [ ] Comment text
  - [ ] Formatted date
- [ ] Test search functionality:
  - [ ] Search by customer name
  - [ ] Search by comment text
  - [ ] Search by service type
- [ ] Test rating filter buttons:
  - [ ] Click "All" - shows all reviews
  - [ ] Click "5★" - shows only 5-star reviews
  - [ ] Click "4★", "3★", "2★", "1★" - filters correctly
- [ ] Test sort dropdown:
  - [ ] Newest First - sorts by date descending
  - [ ] Oldest First - sorts by date ascending
  - [ ] Highest Rating - sorts by rating descending
  - [ ] Lowest Rating - sorts by rating ascending
- [ ] Test empty state (no reviews or no matches)
- [ ] Verify error handling if API fails

## Task 9: Analytics Charts
- [ ] Navigate to /dashboard/vendor/analytics
- [ ] Verify loading state displays during fetch
- [ ] Check GET /vendor/analytics?email={email}&period=30 fetches data
- [ ] Verify stats cards display:
  - [ ] Total Quotes with trending icon
  - [ ] Profile Views with trending icon
  - [ ] Average Rating with correct decimal
  - [ ] Total Reviews count
- [ ] Test period selector buttons:
  - [ ] Click 7D - fetches 7-day data
  - [ ] Click 30D - fetches 30-day data
  - [ ] Click 90D - fetches 90-day data
  - [ ] Click 1Y - fetches 365-day data
  - [ ] Verify active button styling
- [ ] Test Quote Requests Trend chart:
  - [ ] Verify bar chart renders with correct heights
  - [ ] Hover over bars to see tooltip with count
  - [ ] Check date labels (month/day format)
  - [ ] Verify "No data available" displays if empty
- [ ] Test Profile Views Trend chart:
  - [ ] Verify purple bars render correctly
  - [ ] Hover tooltips show view counts
  - [ ] Date labels formatted correctly
- [ ] Test Rating Trend chart:
  - [ ] Verify yellow bars show rating heights (0-5 scale)
  - [ ] Hover tooltips show rating (e.g., "4.5 ★")
  - [ ] Spans full width (lg:col-span-2)
- [ ] Verify responsive layout (1/2 columns on desktop)
- [ ] Test error handling if analytics API fails
- [ ] Check animation transitions when changing periods

## Task 10: Comprehensive Testing
### Cross-Feature Integration
- [ ] Update profile → verify changes reflect in dashboard header
- [ ] Accept quote → verify pending count decreases in navigation badge
- [ ] Receive new review → verify average rating updates in all pages
- [ ] Check analytics after quote actions → verify trends update

### Navigation & Routing
- [ ] Test all sidebar navigation links
- [ ] Verify active route highlighting works
- [ ] Test breadcrumb navigation (if applicable)
- [ ] Verify Analytics link added to sidebar with TrendingUp icon

### Authentication & Authorization
- [ ] Test protected routes (redirect to login if not authenticated)
- [ ] Verify vendor-only access (customers can't access vendor dashboard)
- [ ] Test logout functionality from vendor dashboard
- [ ] Verify JWT token refresh on long sessions

### Performance
- [ ] Check API call efficiency (no duplicate requests)
- [ ] Verify loading states prevent multiple clicks
- [ ] Test pagination if quote/review lists are large
- [ ] Monitor network tab for API response times

### Mobile Responsiveness
- [ ] Test all pages on mobile viewport (375px)
- [ ] Verify sidebar becomes mobile menu (Sheet component)
- [ ] Check form inputs have touch-target class (44px min)
- [ ] Test horizontal scrolling on charts/tables
- [ ] Verify all buttons are tappable on mobile

### Error Scenarios
- [ ] Backend API down → verify error toasts and fallback UI
- [ ] Invalid API responses → check error handling
- [ ] Network timeout → verify timeout handling
- [ ] 401 Unauthorized → redirect to login
- [ ] 403 Forbidden → show access denied message

### Browser Compatibility
- [ ] Test on Chrome (latest)
- [ ] Test on Firefox (latest)
- [ ] Test on Safari (latest)
- [ ] Test on Edge (latest)
- [ ] Verify CSS animations work across browsers

### Accessibility
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Form labels properly associated with inputs
- [ ] Error messages readable by screen readers
- [ ] Sufficient color contrast ratios
- [ ] Focus indicators visible on interactive elements

## Final Verification
- [ ] All 10 Phase 7.4 tasks completed
- [ ] No TypeScript compilation errors
- [ ] No console errors in browser
- [ ] All API endpoints tested and working
- [ ] User experience smooth and intuitive
- [ ] Documentation updated (if needed)
- [ ] Ready to proceed to next phase

## Bugs Found
_(Document any bugs discovered during testing)_

1. 

2. 

3. 

## Notes
_(Additional observations or improvements)_

---
**Test Date:** _______________  
**Tested By:** _______________  
**Status:** ⬜ Not Started | ⬜ In Progress | ⬜ Completed
