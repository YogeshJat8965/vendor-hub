# End-to-End Implementation Plan: Catalogue & Real-Time Messaging

Based on the requirement for the fastest, most stable, and deeply integrated architecture, we will use **Spring WebSockets (STOMP)** instead of a 3rd-party Socket.IO wrapper for Java. STOMP is natively supported by Spring Boot and integrates perfectly with our existing Spring Security JWT filters, ensuring maximum security and zero bugs.

This plan is broken down into granular phases and steps to ensure a flawless execution and testing cycle.

## Phase 1: Database Models & Architecture Setup
**Goal:** Create the core data structures for Catalogues and Messaging.

- **Step 1.1: Catalogue Models**
  - Create `Catalogue` model (id, vendorId, name, type: Basic/Premium, description, coverImage, createdAt, updatedAt).
  - Create `CatalogueItem` embedded document (title, description, startingPrice, priceRange, images array, materialsDetails, projectTimeline, beforeAfterImages, videoUrl, pdfBrochureUrl).
  - *Verification:* Ensure classes compile and are mapped to MongoDB properly.
- **Step 1.2: Messaging Models**
  - Create `Conversation` model (id, quoteRequestId, customerId, vendorId, lastMessage, lastMessageTime, createdAt, updatedAt).
  - Create `Message` model (id, conversationId, senderId, senderRole, content, type: TEXT/IMAGE/PDF, timestamp, readStatus).
  - *Verification:* Check for proper field types (e.g., `Instant` for timestamps).
- **Step 1.3: Update Existing Models**
  - Update `QuoteRequest` to include `catalogueId` and `catalogueItemId` (optional) to link quotes to specific designs.
  - Update `Vendor` plan details to properly handle limits (Max 5 vs 7 catalogues, 10 vs 30 items per catalogue).

## Phase 2: Catalogue Backend APIs & File Handling
**Goal:** Build the CRUD operations for catalogues with strict Basic vs Premium validation.

- **Step 2.1: File Handling Expansion**
  - Modify `UploadController` and cloud storage service to accept `.pdf` (Brochures) and `.mp4` (Videos).
  - Enforce size limits (e.g., 5MB for images, 25MB for videos).
- **Step 2.2: Catalogue Service Logic**
  - Create `CatalogueService` with methods for Create, Read, Update, Delete.
  - Implement business logic: Block video/PDF uploads for Basic vendors. Enforce 5 catalogue / 10 items limit for Basic vendors.
- **Step 2.3: Catalogue REST Endpoints**
  - Create `CatalogueController`.
  - Secure endpoints: `POST /api/vendor/catalogues`, `PUT /api/vendor/catalogues/{id}`, `DELETE ...`.
  - Public endpoints: `GET /api/catalogues/vendor/{vendorId}` for customers to browse.
- **Step 2.4: Phase 2 Backend Verification**
  - *Testing:* Write manual or cURL test scripts to test creation of a catalogue. Verify that a Basic vendor attempting to add an 6th catalogue gets a 400 Bad Request.

## Phase 3: Real-Time Messaging Backend (STOMP WebSockets)
**Goal:** Establish secure, real-time bidirectional communication.

- **Step 3.1: WebSocket Configuration**
  - Create `WebSocketConfig.java` extending `WebSocketMessageBrokerConfigurer`.
  - Register STOMP endpoints (e.g., `/ws`).
  - Configure message broker (`/topic`, `/queue`).
- **Step 3.2: WebSocket JWT Security**
  - Implement a `ChannelInterceptor` in WebSocket config to intercept the connection `CONNECT` frame.
  - Extract the JWT token from the native headers, validate it using `JwtAuthFilter` logic, and set the `Principal` for the WebSocket session.
- **Step 3.3: Messaging Service & Controllers**
  - Create `MessageService` to save messages to MongoDB and update `Conversation.lastMessageTime`.
  - Create REST endpoints to fetch chat history (`GET /api/messages/conversations/{id}`).
  - Create `@MessageMapping` in `MessageController` to handle incoming STOMP messages, save them to DB, and route them to the specific user's queue using `SimpMessagingTemplate`.
- **Step 3.4: Phase 3 Backend Verification**
  - *Testing:* Since STOMP testing requires a client, I will write a small Node.js/HTML test script to connect to the `/ws` endpoint, authenticate via JWT, and verify message echoing before touching the main frontend.

## Phase 4: Frontend - Vendor Catalogue Management
**Goal:** Allow vendors to easily manage their showcase.

- **Step 4.1: Catalogue Dashboard UI**
  - Build `app/dashboard/vendor/catalogues/page.tsx`.
  - Create a grid layout showing existing catalogues with "Edit" and "Delete" actions.
- **Step 4.2: Catalogue Builder Form**
  - Build `app/dashboard/vendor/catalogues/[id]/page.tsx` for adding/editing items.
  - Integrate drag-and-drop file upload for images/videos.
  - Add dynamic UI locks: If the vendor is Basic, gray out the "Upload Video" and "PDF Brochure" buttons with an "Upgrade to Premium" lock icon.
- **Step 4.3: Phase 4 Frontend Verification**
  - *Testing:* Launch frontend dev server. Log in as a vendor. Create a catalogue. Add items. Ensure the UI reflects the data saved in the backend correctly.

## Phase 5: Frontend - Customer Experience & Quote Integration
**Goal:** Display catalogues to customers and seamlessly link them to quote requests.

- **Step 5.1: Public Vendor Profile Update**
  - Update `app/vendor/[slug]/page.tsx` to include a "Catalogues" tab.
  - Design a beautiful gallery view for Catalogue Items.
- **Step 5.2: "Get Quote" Integration**
  - Add "Get Quote" button to Catalogue Items.
  - When clicked, open the existing Quote Request modal but pre-fill the context (e.g., "Requesting quote for: Modular Kitchen - L Shape").
  - Send the `catalogueId` and `catalogueItemId` in the API payload.
- **Step 5.3: Phase 5 Frontend Verification**
  - *Testing:* Log in as a customer. Visit a vendor profile. View catalogues. Submit a quote request from a catalogue. Verify the quote appears in the Vendor's dashboard with the catalogue context.

## Phase 6: Frontend - Real-Time Inbox UI
**Goal:** A polished, WhatsApp/Slack-like messaging interface.

- **Step 6.1: Shared Inbox Layout**
  - Build `app/dashboard/messages/page.tsx`.
  - Left Sidebar: List of Conversations (sorted by `lastMessageTime`).
  - Right Pane: Active Chat window.
  - Top Banner: Details of the linked Quote Request (Status, Budget, Service).
- **Step 6.2: STOMP Client Integration**
  - Install `@stomp/stompjs` and `sockjs-client`.
  - Create a React Context or custom hook (`useWebSocket`) to manage the STOMP connection lifecycle (connect on mount, subscribe to `/user/queue/messages`, disconnect on unmount).
- **Step 6.3: Message Sending & Receiving**
  - Implement the chat input box.
  - Send messages via STOMP `client.publish()`.
  - Append incoming messages to the React state immediately.
- **Step 6.4: Entry Points**
  - Add "Message Vendor" buttons on Customer Quote pages.
  - Add "Message Customer" buttons on Vendor Quote pages.
- **Step 6.5: End-to-End System Verification**
  - *Testing:* Open two browser windows (Customer and Vendor). Click "Message" from a quote request. Send messages back and forth. Verify instantaneous delivery and correct persistence in MongoDB on page refresh.
