# Project Status Report: Interior Design Marketplace

## 1. How the Platform Works (User Flow)
- **Landing Page & Role Selection:** When users visit the website, they can join as a 'Customer' (to find a designer) or a 'Vendor' (to provide interior design services).
- **The Customer Journey:** 
  - A customer searches for vendors based on their city and required category (like Home Decor, Full Renovation, or Furniture).
  - They view the vendor's profile, including their past projects and shop details.
  - They send a direct "Quote Request" explaining what they need.
  - Customers have a personal dashboard to track the status of their quotes (Pending, Accepted, or Declined).
- **The Vendor Journey:** 
  - A vendor creates an account and sets up their online shop by uploading their shop logo, banner, and interior design photos.
  - Vendors get all quote requests directly on their dashboard.
  - They can read the customer's requirements and choose to Accept or Decline the project lead.
- **The Admin Journey:** The platform admin uses the master panel to verify and approve new vendors and manage the categories on the website.

## 2. Technology Stack Used
- **Frontend:** Next.js and React.js
- **Backend:** Java Spring Boot
- **Database:** MongoDB
- **Security:** JWT (JSON Web Tokens)

## 3. Features Developed So Far
- **Dual-Role System:** Built a secure login and signup system for both Customers and Vendors.
- **Search & Explore:** Customers can browse through the list of vendors without creating an account.
- **Vendor Profiles:** Built dynamic profile pages for vendors where they can show their shop details and work gallery.
- **Quote Request System:** Created the complete flow for customers to send specific design requirements to vendors.
- **Vendor Dashboard:** Built a dedicated dashboard for interior designers to update their shop details and manage incoming leads.
- **Master Admin Console:** Created a centralized admin panel to approve or block users and monitor the platform.

## 4. Ideas for Future Additions
To make this platform perfect for interior design, here are some features we can add next:
- **Shareable Profile Links:** Giving every vendor a custom URL (like `website.com/vendor-name`) so they can share it on WhatsApp or Instagram to get clients.
- **"Before & After" Portfolios:** Allowing vendors to upload Before and After photos of their interior projects to build trust with customers.
- **Customer 'Idea Boards':** A feature where customers can save design photos they like and share this board with their vendor to explain their vision.
- **Tiered Service Catalogs:** Allowing vendors to list both small services (like "Decor Consultation") and big projects (like "Full Room Design") with basic pricing.
- **In-App Direct Chat:** A simple chat system for customers and vendors to share reference photos and messages without sharing personal phone numbers.
- **Verified Badges:** Adding trust badges (like 'Verified Pro') to vendor profiles to help customers choose reliable designers.
