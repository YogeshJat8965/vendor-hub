# 🏛️ VendorHub Premium Frontend Redesign — Ultimate Master Plan

> Transform VendorHub from a generic tech app into a **world-class, premium interior design marketplace** with an Organic Luxury / Japandi aesthetic. Every pixel, every animation, every element — designed to WOW.

> **⚠️ IMPORTANT:** All existing functionality (login, signup, quotes, inbox, catalogues, etc.) will remain 100% untouched. We are ONLY changing the visual frontend — colors, fonts, layouts, images, and animations.

---

## 🎨 Finalized Design System

### Colors
| Token | Hex | Usage |
|---|---|---|
| `--color-bg` | `#FFFFFF` | Primary backgrounds |
| `--color-bg-warm` | `#EEDDCC` (Light Cream) | Section backgrounds, card fills |
| `--color-bg-muted` | `#E7DBCD` (Pale Beige) | Hover states, subtle fills |
| `--color-accent` | `#CDB79E` (Warm Beige) | Buttons, active states, highlights |
| `--color-accent-light` | `#CDC0B0` (Light Taupe) | Borders, dividers, outlines |
| `--color-accent-dark` | `#CFBCA5` (Sand Brown) | Secondary buttons, tags |
| `--color-text` | `#2C2621` (Deep Espresso) | Primary text |
| `--color-text-muted` | `#6B5E54` | Secondary/description text |
| `--color-text-light` | `#9C8E82` | Placeholder, timestamps |
| `--color-success` | `#5B8C5A` (Sage Green) | Success states |
| `--color-warning` | `#C4975A` (Warm Amber) | Warning/pending states |
| `--color-error` | `#B85C5C` (Muted Rose) | Error states |

### Typography
| Role | Font | Weight | Usage |
|---|---|---|---|
| Headings | `Playfair Display` | 600-700 | H1, H2, H3, Logo, Page Titles |
| Body | `Plus Jakarta Sans` | 400-600 | Paragraphs, buttons, inputs, labels |
| Accent | `Great Vibes` | 400 | Tags above headings, decorative labels, quotes |

### Design Tokens
- **Border Radius:** `rounded-xl` (12px) for cards, `rounded-2xl` (16px) for modals, `rounded-full` for avatars/badges
- **Shadows:** Warm-toned shadows: `shadow-[0_4px_24px_rgba(44,38,33,0.08)]`
- **Transitions:** All interactive elements: `transition-all duration-300 ease-out`
- **Spacing:** Generous whitespace — minimum `p-6` for cards, `py-24` for sections

---

## 🚀 Execution Phases (10 Phases)

---

## Phase 1: Foundation & Design System Setup
*Goal: Replace every global style variable, load new fonts, add new CSS utilities for animations, marquees, parallax, and carousels.*

### Step 1.1 — Font Integration (`layout.tsx`)
- **Remove:** `Manrope` and `Inter` font imports
- **Add:** `Playfair_Display`, `Plus_Jakarta_Sans`, and `Great_Vibes` from `next/font/google`
- **Set CSS variables:** `--font-heading`, `--font-body`, `--font-accent`
- **Apply:** `font-body` as default body font, `antialiased`

### Step 1.2 — Global CSS Variables & Animations (`globals.css`)
- **Remove:** All existing oklch/hex color variables (`--primary`, `--background`, etc.)
- **Add:** Complete earthy color system as CSS custom properties (see table above)
- **Redefine Shadcn variables:** Map `--primary` to Warm Beige, `--background` to White, `--foreground` to Deep Espresso, `--card` to Light Cream, `--border` to Light Taupe, `--ring` to Sand Brown
- **Replace** `.gradient-text` class: Change from blue-purple-pink to a subtle warm gradient (`#2C2621` to `#6B5E54`)
- **Replace** `.glass` class: Update to use warm-toned blur with beige tint
- **Add** `.font-heading` utility: `font-family: var(--font-heading)`
- **Add** `.font-accent` utility: `font-family: var(--font-accent)`
- **Add** `.text-accent-cursive` class: `font-family: Great Vibes; font-size: 1.25rem; color: var(--color-accent)`
- **Update** `.card-hover`: Change shadow to warm-toned shadow
- **Add** warm shadow utilities: `.shadow-warm-sm`, `.shadow-warm-md`, `.shadow-warm-lg`
- **Add** subtle background pattern class: `.bg-linen` with a very faint linen/paper texture using CSS
- **Add** Marquee animation keyframes: `@keyframes marquee` for smooth infinite horizontal scroll
- **Add** `.animate-marquee` class with `animation: marquee 30s linear infinite`
- **Add** Fade-in-up animation keyframes for scroll-triggered reveals
- **Add** Slide-in-left / Slide-in-right animation keyframes
- **Add** Image reveal clip-path animation (clips in from side)
- **Add** Custom scrollbar styling (earthy-toned scrollbar track and thumb)

### Step 1.3 — Install Required Dependencies
- **Install** `embla-carousel-react` — for premium, smooth carousels
- **Install** `embla-carousel-autoplay` — for auto-sliding carousel
- **No other dependencies needed** — we will use CSS + Framer Motion (already installed) for all other effects

### Step 1.4 — SEO & Metadata (`layout.tsx`)
- **Update** page title: "VendorHub — Premium Interior Design & Home Services Marketplace"
- **Update** meta description to reflect luxury positioning

---

## Phase 2: Shadcn UI Component Overhaul
*Goal: Every base component feels premium — buttons glow, inputs feel soft, cards feel like paper.*

### Step 2.1 — Button Component (`components/ui/button.tsx`)
- **Default variant:** `bg-[#2C2621]` (Deep Espresso) text white, `rounded-xl`, `font-body font-semibold`
- **Hover:** Subtle scale (`scale-[1.02]`) + warm shadow glow
- **Secondary variant:** `bg-[#CDB79E]` (Warm Beige) text espresso
- **Outline variant:** Border `#CDC0B0` (Light Taupe), text espresso, hover fill `#E7DBCD`
- **Ghost variant:** Transparent, hover `bg-[#E7DBCD]/50`
- **Destructive:** `bg-[#B85C5C]` (Muted Rose)
- **All sizes:** Increase padding slightly for more breathing room
- **Add** `transition-all duration-300` to all variants

### Step 2.2 — Input Component (`components/ui/input.tsx`)
- **Background:** `bg-[#EEDDCC]/30` (very subtle cream tint)
- **Border:** `border-[#CDC0B0]`
- **Focus:** `focus:border-[#CDB79E] focus:ring-2 focus:ring-[#CDB79E]/20`
- **Border radius:** `rounded-xl`
- **Font:** `font-body`
- **Placeholder color:** `#9C8E82`

### Step 2.3 — Card Component (`components/ui/card.tsx`)
- **Background:** `bg-white`
- **Border:** `border-[#CDC0B0]/50` (very subtle)
- **Shadow:** `shadow-[0_4px_24px_rgba(44,38,33,0.06)]`
- **Border radius:** `rounded-2xl`
- **CardTitle:** Apply `font-heading` (Playfair Display)
- **CardDescription:** `text-[#6B5E54]` with `font-body`

### Step 2.4 — Badge Component (`components/ui/badge.tsx`)
- **Default:** `bg-[#EEDDCC] text-[#2C2621] border-[#CDC0B0]`, `rounded-full`, `font-body font-medium`
- **Secondary:** `bg-[#E7DBCD] text-[#6B5E54]`
- **Premium badge:** `bg-[#2C2621] text-[#EEDDCC]`
- **Success:** `bg-[#5B8C5A]/10 text-[#5B8C5A]`
- **Warning:** `bg-[#C4975A]/10 text-[#C4975A]`

### Step 2.5 — Other UI Components
- **Avatar:** Default fallback gradient replaced with `bg-[#CDB79E]` with espresso text initial
- **Dialog/Sheet:** Background white, overlay `bg-[#2C2621]/40` (warm tint), `rounded-2xl`
- **Select:** Match input styling (cream bg, taupe border, xl radius)
- **Tabs:** Active tab `bg-[#2C2621] text-white`, inactive `text-[#6B5E54] hover:bg-[#E7DBCD]`
- **Separator:** Color `#CDC0B0`
- **Table:** Header `bg-[#EEDDCC]`, rows alternate `bg-white` and `bg-[#E7DBCD]/30`

---

## Phase 3: Layout Components — Header, Footer, Sidebars
*Goal: Navigation feels like walking into a luxury interior design showroom.*

### Step 3.1 — Header Redesign (`components/layout/Header.tsx`)
- **Background:** `bg-white/95 backdrop-blur-xl` with very subtle bottom border `border-[#CDC0B0]/30`
- **Logo:** Change from gradient text to `font-heading` (Playfair Display) in Deep Espresso `#2C2621`, with a small `Great Vibes` accent beside it (e.g., tiny italic "marketplace" in cursive)
- **Nav links:** `font-body font-medium text-[#6B5E54]`, hover text-[#2C2621] with smooth underline animation
- **Active nav:** Instead of gradient bg, use a subtle bottom underline/dot indicator in `#CDB79E`
- **"Get Started" button:** `bg-[#2C2621] text-white rounded-xl` with hover scale
- **Login button:** Ghost style, `text-[#2C2621]`
- **Mobile menu:** Sheet bg white, nav items styled same as desktop
- **Add** subtle scroll-triggered transparency change

### Step 3.2 — Footer Redesign (`components/layout/Footer.tsx`)
- **REMOVE** dark `bg-gray-900` background
- **New background:** `bg-[#EEDDCC]` (Light Cream)
- **Brand section:** Logo in `font-heading`, tagline in `font-body text-[#6B5E54]`
- **Add** a decorative `Great Vibes` text element (e.g., *"Where design meets home"*)
- **Link headings:** `font-heading text-[#2C2621] font-semibold`
- **Links:** `text-[#6B5E54] hover:text-[#2C2621]` with underline-on-hover animation
- **Social icons:** `text-[#9C8E82] hover:text-[#2C2621]`
- **Bottom copyright bar:** Thin `border-[#CDC0B0]` separator, `text-[#9C8E82]`

### Step 3.3 — Vendor Dashboard Sidebar (`dashboard/vendor/layout.tsx`)
- **Sidebar bg:** `bg-[#EEDDCC]` (Light Cream) instead of plain white
- **Logo:** `font-heading` Playfair Display in espresso
- **Vendor info section:** Fetch real vendor data from API (remove hardcoded mock)
- **Avatar fallback:** `bg-[#CDB79E] text-[#2C2621]`
- **Premium badge:** `bg-[#2C2621] text-[#EEDDCC]` with subtle shine animation
- **Nav items - inactive:** `text-[#6B5E54]`, hover `bg-[#E7DBCD]`
- **Nav items - active:** `bg-[#2C2621] text-[#EEDDCC]` (solid espresso, not gradient)
- **Badge counts:** `bg-[#C4975A] text-white` (warm amber)
- **Logout button:** `text-[#B85C5C] hover:bg-[#B85C5C]/10`
- **Top bar:** `bg-white border-b border-[#CDC0B0]/30`
- **Main content area bg:** `bg-[#E7DBCD]/20`

### Step 3.4 — Customer Dashboard Sidebar (`dashboard/customer/layout.tsx`)
- Apply identical styling as vendor sidebar (Step 3.3)
- **Fix:** Remove hardcoded mock user data, fetch from auth context

---

## Phase 4: Homepage — The Grand Entrance
*Goal: The homepage should feel like flipping open a luxury interior design magazine. Rich images, smooth scrolling, carousels, marquees, and 3D depth.*

### Step 4.1 — Hero Section Complete Overhaul (`page.tsx`)
- **Remove:** Blue-purple-pink gradient background blobs and grid pattern
- **New layout:** Split hero — Left side text, Right side a large interior design image placeholder
- **Background:** Clean `bg-white` with subtle `bg-[#E7DBCD]/10` tint
- **Add** above main heading: A `Great Vibes` cursive tag (e.g., *"Crafting Beautiful Spaces"*) in `text-[#CDB79E]` with fade-in animation
- **Main heading:** `font-heading` (Playfair Display), `text-[#2C2621]`, large and elegant — "Transform Your Space with Expert Designers"
- **REMOVE** blue-purple gradient from heading text — use solid espresso
- **Subtitle:** `font-body text-[#6B5E54]` — "Connect with India's finest interior designers, architects, and home service professionals."
- **CTA buttons:**
  - Primary: `bg-[#2C2621] text-white rounded-xl` — "Explore Designers"
  - Secondary: `bg-transparent border-2 border-[#CDB79E] text-[#2C2621] rounded-xl` — "I'm a Professional"
- **Hero Image Placeholder (RIGHT SIDE):**
  - `PLACEHOLDER: A large, high-quality image of a stunning modern living room with warm tones, natural wood furniture, and soft lighting. Japandi/Scandinavian aesthetic.`
  - Image container: `rounded-2xl overflow-hidden shadow-warm-lg` with subtle parallax on scroll
  - Image reveal animation on load (clip-path animation left-to-right)

### Step 4.2 — Trust Indicators Strip (Below Hero)
- **Remove** the 3 trust cards with blue/purple/yellow circles
- **Replace with** a clean horizontal strip of trust stats
- **Background:** `bg-[#EEDDCC]/50` with thin top/bottom borders
- **Layout:** Flex row, evenly spaced, with thin vertical dividers
- **Numbers:** `font-heading text-4xl text-[#2C2621]` with animated count-up
- **Labels:** `font-body text-sm text-[#6B5E54]`

### Step 4.3 — Interior Design Showcase Carousel (NEW SECTION)
*Brand new section — a stunning full-width image carousel showcasing interior design work.*
- **Position:** After trust indicators
- **Section heading:** `Great Vibes` cursive tag *"Inspiring Spaces"* + `font-heading` H2: "Discover Stunning Interiors"
- **Carousel implementation:** Using `embla-carousel-react` with autoplay
- **6 Carousel slides with image placeholders:**
  - SLIDE 1: Modern minimalist living room with neutral tones and large windows
  - SLIDE 2: Luxury master bedroom with warm wood accents and soft lighting
  - SLIDE 3: Contemporary kitchen with marble countertops and brass fixtures
  - SLIDE 4: Cozy reading nook with built-in bookshelves and earthy textiles
  - SLIDE 5: Elegant dining room with statement chandelier and natural materials
  - SLIDE 6: Serene bathroom spa with stone tiles and indoor plants
- **Each slide:** Semi-transparent warm gradient overlay at bottom with category label in `Great Vibes` cursive and title in `font-heading text-white`
- **Navigation:** Dot indicators in `#CDB79E`, prev/next arrows with hover effect
- **Auto-play:** 5 second interval, pause on hover
- **Card styling:** `rounded-2xl overflow-hidden shadow-warm-lg`

### Step 4.4 — Marquee/Ticker Strip (NEW SECTION)
*Continuously scrolling horizontal strip of design-related keywords — very trendy and premium.*
- **Position:** After carousel section
- **Background:** `bg-[#2C2621]` (Deep Espresso) — dramatic contrast strip
- **Text:** `font-heading text-[#EEDDCC] text-2xl tracking-widest uppercase`
- **Content:** Repeating phrases separated by decorative dots:
  - "Interior Design • Architecture • Home Renovation • Kitchen & Bath • Living Spaces • Landscape Design • Lighting Design • Custom Furniture •"
- **Animation:** CSS `animate-marquee` — smooth infinite horizontal scroll
- **Duplicated content for seamless loop**
- **Height:** Thin strip, `py-4`
- **Hover:** Pause animation on hover

### Step 4.5 — How It Works Section (Redesigned)
- **Background:** `bg-white`
- **Add** `Great Vibes` cursive tag: *"Simple & Elegant"*
- **Heading:** `font-heading` H2: "How VendorHub Works"
- **3 Steps Layout:** Horizontal on desktop, vertical on mobile
- **Each step:** Large watermark step number `font-heading text-6xl text-[#CDB79E]/30`, icon in `bg-[#EEDDCC] rounded-2xl p-4`, title in `font-heading`, description in `font-body`
  - Step 1: "Browse & Discover" — Explore verified interior designers and service providers
  - Step 2: "Request a Quote" — Describe your project and get personalized quotes
  - Step 3: "Bring It to Life" — Collaborate with your chosen professional
- **Connecting line:** Subtle dashed line `border-[#CDC0B0]` connecting steps horizontally
- **3D scroll effect:** Steps scale from 0.9 to 1.0 as they enter viewport (Framer Motion `useInView`)

### Step 4.6 — Interior Design Gallery with 3D Parallax (NEW SECTION)
*Stunning masonry-style image gallery with parallax depth effect on scroll.*
- **Position:** After How It Works
- **Background:** `bg-[#E7DBCD]/20`
- **Section heading:** `Great Vibes` cursive *"Portfolio"* + `font-heading` H2: "Spaces That Inspire"
- **Layout:** CSS Grid masonry-style (2 cols mobile, 3 cols desktop, varying heights)
- **8 Image placeholders:**
  1. (tall) Floor-to-ceiling window living room with cream sofa
  2. (wide) Panoramic kitchen island with pendant lighting
  3. (square) Close-up of textured wall with framed art
  4. (tall) Staircase with wooden steps and glass railing
  5. (wide) Open-plan office space with biophilic design
  6. (square) Bathroom vanity with terrazzo countertop
  7. (tall) Bookshelf wall with warm LED lighting
  8. (wide) Outdoor patio with wooden deck and lounge furniture
- **3D Parallax Effect:** Each image moves at different speed on scroll (Framer Motion `useScroll` + `useTransform`)
- **Hover Effect:** Image scales up `scale-[1.05]` + warm shadow appears
- **Image Reveal:** Each image clips in from the side as it enters viewport
- **Category tag on each image:** Small pill badge at bottom-left

### Step 4.7 — Stats Section (Redesigned)
- **REMOVE** dark navy/purple background entirely
- **New background:** `bg-[#EEDDCC]` (Light Cream)
- **Heading:** `Great Vibes` cursive *"By the Numbers"* + `font-heading` H2: "Trusted by Thousands"
- **Stat cards:** `bg-white/80 border-[#CDC0B0]/50 shadow-warm rounded-2xl`
- **Numbers:** `font-heading text-5xl text-[#2C2621]` with animated count-up
- **Labels:** `font-body text-[#6B5E54]`
- **Icons:** Earthy tones in `bg-[#CDB79E]/20 rounded-xl`

### Step 4.8 — Testimonial Carousel (NEW SECTION)
*Customer testimonials in a beautiful auto-sliding carousel.*
- **Position:** After stats section
- **Background:** `bg-white`
- **Section heading:** `Great Vibes` cursive *"What Our Clients Say"* + `font-heading` H2: "Stories of Transformation"
- **Carousel:** `embla-carousel-react` with autoplay
- **Each testimonial card:**
  - Large opening quote mark in `font-heading text-6xl text-[#CDB79E]/40`
  - Testimonial text in `font-body text-lg italic text-[#2C2621]`
  - Customer name: `font-heading font-semibold text-[#2C2621]`
  - Project type: `font-body text-sm text-[#6B5E54]`
  - Star rating: `text-[#C4975A]` 5 stars
  - Avatar placeholder
- **4 testimonials:**
  1. "VendorHub connected us with an incredible designer who transformed our 2BHK into a dream home." — Priya Sharma, Living Room Makeover
  2. "Finding a reliable interior designer was always stressful until VendorHub. Our kitchen renovation was flawless." — Rahul Mehta, Kitchen Renovation
  3. "The quality of professionals on VendorHub is unmatched. Our office redesign was on time and within budget." — Ananya Patel, Office Redesign
  4. "From the first quote to the final reveal, VendorHub made our bathroom renovation an absolute joy." — Vikram Singh, Bathroom Renovation
- **3 cards visible on desktop, 1 on mobile**
- **Navigation:** Dot indicators + auto-play

### Step 4.9 — Category Marquee (NEW SECTION)
*Second marquee — scrolling category cards with icons.*
- **Position:** After testimonials
- **Background:** `bg-[#E7DBCD]/30`
- **Content:** Horizontally scrolling cards, each with icon + category name
- **Categories:** Interior Design, Kitchen & Bath, Living Room, Bedroom, Office Space, Landscape, Lighting, Furniture, Painting, Flooring, Plumbing, Electrical
- **Each card:** `bg-white rounded-xl px-6 py-3 shadow-warm-sm border-[#CDC0B0]/30`
- **Animation:** CSS marquee, smooth infinite scroll, pause on hover

### Step 4.10 — CTA Section (Redesigned)
- **REMOVE** blue-purple gradient background
- **New design:** `bg-[#2C2621]` (Deep Espresso) — dramatic dark section
- **Add** `Great Vibes` cursive accent: *"Begin Your Journey"* in `text-[#CDB79E]`
- **Heading:** `font-heading text-white text-4xl` — "Ready to Transform Your Space?"
- **Subtitle:** `font-body text-[#CDB79E]`
- **CTA button:** `bg-[#CDB79E] text-[#2C2621] hover:bg-[#CDC0B0] rounded-xl`
- **Add** decorative background: Very subtle, blurred interior design image as texture (opacity 5-10%)
  - PLACEHOLDER: Subtle blurred interior image for CTA background

---

## Phase 5: Explore Page — The Design Gallery
*Goal: Browsing vendors feels like walking through an art gallery.*

### Step 5.1 — Explore Hero Section (`explore/page.tsx`)
- **Hero section bg:** `bg-[#EEDDCC]/50` with subtle linen texture
- **Add** `Great Vibes` cursive tag: *"Discover & Connect"*
- **Heading:** `font-heading text-[#2C2621]` — "Find Your Perfect Designer"
- **Search bar:** `bg-white rounded-2xl shadow-warm border-[#CDC0B0]/50`
- **Search input bg:** `bg-[#E7DBCD]/30`, Search button: `bg-[#2C2621] text-white`

### Step 5.2 — Explore Filters & Grid
- **Filter bar:** Earthy styling with cream dropdowns
- **Vendor grid:** All cards use redesigned PremiumVendorCard (Phase 9)
- **Cards stagger-animate** into view on scroll
- **Empty state:** Elegant with Playfair heading + cursive accent

---

## Phase 6: Auth Pages — Login & Signup
*Goal: Auth pages feel welcoming and premium, like entering a boutique.*

### Step 6.1 — Login Page (`login/page.tsx`)
- **Left side:** Clean white bg, logo in `font-heading`, heading in Playfair, earthy inputs
- **Submit button:** `bg-[#2C2621] text-white rounded-xl`
- **Right panel:** REMOVE blue-purple gradient, replace with:
  - `bg-[#EEDDCC]` with large interior design image placeholder
  - PLACEHOLDER: Beautiful interior shot — cozy living room with warm light, earthy tones, indoor plants
  - Image with warm overlay `bg-[#2C2621]/40` for text readability
  - `font-heading text-white` heading: "Where Design Meets Home"
  - `Great Vibes text-[#CDB79E]` cursive accent
  - Feature cards: `bg-white/15 backdrop-blur-md rounded-xl`

### Step 6.2 — Signup Page (`signup/page.tsx`)
- Same treatment as Login page with different right panel image
- **Tab triggers:** Active `bg-[#2C2621] text-white`, inactive `border-[#CDC0B0] text-[#6B5E54]`
- **Right panel image placeholder:** Overhead shot of architect's desk with blueprints and swatches

---

## Phase 7: Customer Dashboard
*Goal: Customer feels like they're using a bespoke personal design concierge.*

### Step 7.1 — Customer Dashboard Home (`dashboard/customer/page.tsx`)
- **Welcome heading:** `font-heading` with `Great Vibes` accent: *"Your design journey continues"*
- **Stat cards:** Warm-toned with earthy icon backgrounds
- **Quick action cards:** `bg-[#EEDDCC]/50 hover:bg-[#EEDDCC] rounded-2xl`
- **Add** "Design Inspiration" section: Horizontal scroll strip with interior design thumbnails
  - PLACEHOLDER: 4-5 small interior design inspiration images (kitchen, living, bedroom, bath, office)
  - Each image: `rounded-xl overflow-hidden` with category label overlay

### Step 7.2 — Customer Quotes (`dashboard/customer/quotes/page.tsx`)
- `font-heading` for page title, earthy status badges (sage/amber/rose), warm card styling

### Step 7.3 — Customer Favorites (`dashboard/customer/favorites/page.tsx`)
- Warm-toned styling, heart icon `text-[#B85C5C]`, elegant empty state

### Step 7.4 — Customer Inbox — Uses shared InboxUI (Phase 9)

### Step 7.5 — Customer Profile (`dashboard/customer/profile/page.tsx`)
- Earthy inputs, `font-heading` section headings, espresso save button

---

## Phase 8: Vendor Dashboard — The Design Studio
*Goal: Vendor feels like they're managing a high-end design studio.*

### Step 8.1 — Vendor Dashboard Home (`dashboard/vendor/page.tsx`)
- **Welcome section:** `font-heading` with cursive accent: *"Your studio, your way"*
- **Stats cards:** Earthy tones for each stat type
- **Quick actions:** Warm hover effects
- **Performance card:** Replace blue-purple gradient with `bg-[#2C2621]` espresso + cream text
- **Add** visual banner with interior design image placeholder:
  - PLACEHOLDER: Elegant workspace/studio image — designer at work, material swatches, mood board

### Step 8.2 — Vendor Quotes (`dashboard/vendor/quotes/page.tsx`)
- Earthy tab styling, premium invoice-style cards, sage/amber/rose status badges

### Step 8.3 — Vendor Reviews (`dashboard/vendor/reviews/page.tsx`)
- Stars `text-[#C4975A]`, warm review cards

### Step 8.4 — Catalogues Page Redesign (`dashboard/vendor/catalogues/page.tsx`)
- **Page heading:** `font-heading` with cursive accent: *"Showcase your finest work"*
- **Create button:** `bg-[#2C2621] text-white rounded-xl shadow-warm`
- **Catalogue cards:** Large image area (h-56) with zoom hover, earthy styling throughout
  - Image placeholder: `bg-[#EEDDCC]` with taupe icon — PLACEHOLDER: Interior design mood board
  - Premium badge: `bg-[#2C2621] text-[#EEDDCC]`
  - Title: `font-heading`, Description: `font-body text-[#6B5E54]`
- **Empty state:** Elegant with Playfair + cursive accent
- **Fix:** Replace raw `fetch()` calls with `apiClient`

### Step 8.5 — Catalogue Detail (`dashboard/vendor/catalogues/[id]/page.tsx`)
- Earthy form inputs, image upload areas with `bg-[#EEDDCC] border-dashed border-[#CDC0B0] rounded-2xl`

### Step 8.6 — Storefront (`dashboard/vendor/storefront/page.tsx`)
- Magazine-style layout, earthy styling
- PLACEHOLDER: Storefront banner — wide shot of completed project
- PLACEHOLDER: Logo upload area

### Step 8.7 — Analytics (`dashboard/vendor/analytics/page.tsx`)
- Earthy chart colors, warm stat cards, `font-heading` for sections

### Step 8.8 — Settings (`dashboard/vendor/settings/page.tsx`)
- Clean white cards, earthy borders, danger zone `border-[#B85C5C]/30 bg-[#B85C5C]/5`

---

## Phase 9: Shared Components & Cards
*Goal: Every reusable component is a polished jewel.*

### Step 9.1 — Inbox UI Complete Redesign (`components/inbox/InboxUI.tsx`)
- **Conversation sidebar:** `bg-[#EEDDCC]`, header `font-heading`, items `bg-white/80`, active `border-l-4 border-l-[#2C2621]`
- **REMOVE** raw "Vendor ID: xxx" — show actual name/email in readable format
- **Add** timestamps, unread dots `bg-[#CDB79E]`, last message preview
- **Chat header:** Clean white, avatar `bg-[#CDB79E]`, name `font-heading`
- **Chat messages:** My messages `bg-[#2C2621] text-[#EEDDCC]`, their messages `bg-white`
- **Input area:** Earthy input, send button `bg-[#2C2621] text-white rounded-xl`
- **Empty state:** Elegant with `font-heading` + cursive accent

### Step 9.2 — PremiumVendorCard (`components/cards/PremiumVendorCard.tsx`)
- Warm card styling, banner fallback `from-[#CDB79E] to-[#CDC0B0]`, `font-heading` names
- Stars `text-[#C4975A]`, CTA `bg-[#2C2621] text-white rounded-xl`
- Hover: lift + warm shadow glow

### Step 9.3 — QuoteCard (`components/cards/QuoteCard.tsx`)
- Earthy status colors, `font-heading` for service title, warm borders

### Step 9.4 — IncomingQuoteCard (`components/cards/IncomingQuoteCard.tsx`)
- Accept `bg-[#5B8C5A] text-white`, Reject `text-[#B85C5C] border-[#B85C5C]`

### Step 9.5 — FavoriteVendorCard (`components/cards/FavoriteVendorCard.tsx`)
- Earthy styling, heart `text-[#B85C5C]` when favorited

### Step 9.6 — QuoteRequestDialog (`components/dialogs/QuoteRequestDialog.tsx`)
- Dialog overlay `bg-[#2C2621]/40`, white bg `rounded-2xl`, `font-heading` title, cursive accent, earthy inputs

### Step 9.7 — QuoteDetailDialog (`components/dialogs/QuoteDetailDialog.tsx`)
- Same warm treatment, invoice-style layout, earthy status labels

### Step 9.8 — Skeleton Loaders (`components/ui/skeletons.tsx`)
- Skeleton color `bg-[#E7DBCD]` with Pale Beige shimmer animation

---

## Phase 10: Final Polish, 3D Effects & Micro-Interactions
*Goal: The finishing touches that make it feel alive, expensive, and interactive.*

### Step 10.1 — 3D Scroll Depth Effects (Homepage)
- **Hero image:** Moves slower than text on scroll (parallax depth illusion) using Framer Motion `useScroll` + `useTransform`
- **Gallery images:** Move at 3 different speeds (foreground, midground, background)
- **Stats numbers:** Grow slightly on scroll-into-view
- **How-it-works steps:** Scale from 0.9 to 1.0 as they enter viewport
- **Testimonial cards:** Slight rotation change on scroll (3D tilt)

### Step 10.2 — Smooth Page Transitions
- All pages: `framer-motion` fade-in on mount
- Cards stagger-animate into view
- Dashboard page content fades in on route change

### Step 10.3 — Hover & Focus States Audit
- Every button: `scale-[1.02]` on hover + warm shadow
- Every card: `translateY(-4px)` + shadow-warm-lg on hover
- Every link: Smooth underline animation `duration-300`
- Every input: Warm glow on focus `ring-[#CDB79E]/20`

### Step 10.4 — Image Hover Interactions
- All interior design images: `scale-[1.05]` zoom on hover inside `overflow-hidden`
- Category label fades in on hover
- Warm shadow appears on hover

### Step 10.5 — Empty States Redesign (All Pages)
- All "No data" states: `font-heading` title + `font-body text-[#6B5E54]` description + `Great Vibes` cursive accent + earthy icon

### Step 10.6 — Loading States
- Spinner: `border-[#CDB79E]`, Skeletons: Pale Beige shimmer, Loading text: `font-body text-[#6B5E54]`

### Step 10.7 — Scroll-Triggered Reveal Animations
- Every section on every page: Content fades/slides in as user scrolls (Framer Motion `whileInView` with `once: true`)
- Stagger children for lists/grids

### Step 10.8 — Custom Scrollbar
- Track: `#EEDDCC`, Thumb: `#CDB79E`, Hover: `#CDC0B0`, Width: `8px`, `border-radius: 4px`

### Step 10.9 — Final Responsive Audit
- Test at mobile (375px), tablet (768px), desktop (1280px+)
- Ensure carousels work with touch/swipe
- Ensure marquees are smooth on all devices
- Ensure touch targets min 44px
- Ensure fonts scale properly

---

## Complete File Modification List

| # | File | Changes |
|---|---|---|
| 1 | `app/layout.tsx` | Fonts, metadata, CSS variables |
| 2 | `app/globals.css` | Complete color system, animations, marquee, parallax, scrollbar |
| 3 | `app/page.tsx` | Homepage — hero, carousel, marquee, gallery, testimonials, stats, CTA |
| 4 | `app/explore/page.tsx` | Explore page — colors, fonts, search bar |
| 5 | `app/login/page.tsx` | Login — colors, fonts, right panel image |
| 6 | `app/signup/page.tsx` | Signup — colors, fonts, tabs, right panel image |
| 7 | `app/vendors/[slug]/page.tsx` | Vendor public profile — colors, fonts |
| 8 | `app/about/page.tsx` | About — colors, fonts, content |
| 9 | `app/how-it-works/page.tsx` | How it works — colors, fonts |
| 10 | `app/dashboard/vendor/layout.tsx` | Vendor sidebar — colors, fonts, fix mock data |
| 11 | `app/dashboard/vendor/page.tsx` | Vendor dashboard — colors, fonts, studio image |
| 12 | `app/dashboard/vendor/quotes/page.tsx` | Vendor quotes — colors, fonts |
| 13 | `app/dashboard/vendor/reviews/page.tsx` | Vendor reviews — colors, fonts |
| 14 | `app/dashboard/vendor/inbox/page.tsx` | Vendor inbox — uses InboxUI |
| 15 | `app/dashboard/vendor/catalogues/page.tsx` | Catalogues list — complete redesign |
| 16 | `app/dashboard/vendor/catalogues/[id]/page.tsx` | Catalogue detail — colors, fonts |
| 17 | `app/dashboard/vendor/storefront/page.tsx` | Storefront — colors, fonts, image placeholders |
| 18 | `app/dashboard/vendor/analytics/page.tsx` | Analytics — chart colors, fonts |
| 19 | `app/dashboard/vendor/settings/page.tsx` | Settings — colors, fonts |
| 20 | `app/dashboard/customer/layout.tsx` | Customer sidebar — colors, fonts, fix mock data |
| 21 | `app/dashboard/customer/page.tsx` | Customer dashboard — colors, inspiration strip |
| 22 | `app/dashboard/customer/quotes/page.tsx` | Customer quotes — colors, fonts |
| 23 | `app/dashboard/customer/favorites/page.tsx` | Favorites — colors, fonts |
| 24 | `app/dashboard/customer/inbox/page.tsx` | Customer inbox — uses InboxUI |
| 25 | `app/dashboard/customer/profile/page.tsx` | Profile — colors, fonts |
| 26 | `components/layout/Header.tsx` | Global header — colors, fonts, logo |
| 27 | `components/layout/Footer.tsx` | Global footer — light bg, fonts, cursive |
| 28 | `components/inbox/InboxUI.tsx` | Chat UI — complete visual overhaul |
| 29 | `components/cards/PremiumVendorCard.tsx` | Vendor card — warm colors |
| 30 | `components/cards/QuoteCard.tsx` | Quote card — earthy colors |
| 31 | `components/cards/IncomingQuoteCard.tsx` | Incoming quote — earthy colors |
| 32 | `components/cards/FavoriteVendorCard.tsx` | Favorite card — earthy colors |
| 33 | `components/dialogs/QuoteRequestDialog.tsx` | Quote dialog — warm styling |
| 34 | `components/dialogs/QuoteDetailDialog.tsx` | Detail dialog — warm styling |
| 35 | `components/ui/button.tsx` | Button variants |
| 36 | `components/ui/input.tsx` | Input styling |
| 37 | `components/ui/card.tsx` | Card styling |
| 38 | `components/ui/badge.tsx` | Badge variants |
| 39 | `components/ui/skeletons.tsx` | Skeleton colors |
| 40 | `package.json` | Add embla-carousel dependencies |

> **Total: 40 files across 10 phases, 60+ individual steps**

---

## Image Placeholder Summary

All images will be left as empty placeholder containers with descriptive labels. You can add real images later.

| # | Location | Placeholder Description |
|---|---|---|
| 1 | Homepage Hero (right side) | Stunning modern living room, Japandi aesthetic, warm tones |
| 2 | Homepage Carousel Slide 1 | Modern minimalist living room with neutral tones |
| 3 | Homepage Carousel Slide 2 | Luxury master bedroom with wood accents |
| 4 | Homepage Carousel Slide 3 | Contemporary kitchen with marble and brass |
| 5 | Homepage Carousel Slide 4 | Cozy reading nook with bookshelves |
| 6 | Homepage Carousel Slide 5 | Elegant dining room with statement chandelier |
| 7 | Homepage Carousel Slide 6 | Serene bathroom spa with stone and plants |
| 8 | Homepage Gallery Image 1 (tall) | Floor-to-ceiling window living room |
| 9 | Homepage Gallery Image 2 (wide) | Panoramic kitchen island |
| 10 | Homepage Gallery Image 3 (square) | Textured wall with framed art |
| 11 | Homepage Gallery Image 4 (tall) | Wooden staircase with glass railing |
| 12 | Homepage Gallery Image 5 (wide) | Biophilic office space |
| 13 | Homepage Gallery Image 6 (square) | Terrazzo bathroom vanity |
| 14 | Homepage Gallery Image 7 (tall) | Bookshelf wall with LED lighting |
| 15 | Homepage Gallery Image 8 (wide) | Outdoor patio with wooden deck |
| 16 | Homepage CTA Background | Subtle blurred interior (very low opacity) |
| 17 | Login Right Panel | Cozy living room with warm light |
| 18 | Signup Right Panel | Architect's desk with blueprints and swatches |
| 19 | Customer Dashboard Inspiration 1-5 | Small interior thumbnails (kitchen, living, bedroom, bath, office) |
| 20 | Vendor Dashboard Banner | Designer workspace with mood board |
| 21 | Catalogue Card Placeholder | Interior design mood board or collage |
| 22 | Storefront Banner Placeholder | Wide shot of completed project |
| 23 | Testimonial Avatars 1-4 | Professional headshots |

---

## Verification Plan

### After Each Phase
- Visually inspect all affected pages in browser
- Ensure no broken styles or missing colors
- Confirm fonts render correctly
- Test all interactive elements (hover, focus, click)

### After All Phases Complete
- Full walkthrough: Home to Explore to Vendor Profile to Login to Signup to Customer Dashboard to Vendor Dashboard to Catalogues to Inbox
- Test carousels (auto-play, manual navigation, touch swipe)
- Test marquees (smooth scrolling, pause on hover)
- Test 3D parallax effects (smooth scroll depth)
- Test scroll-triggered animations
- Mobile responsive check (375px, 768px, 1280px)
- Confirm NO lingering blue/purple/pink colors remain ANYWHERE
- Confirm ALL functionality still works as before
