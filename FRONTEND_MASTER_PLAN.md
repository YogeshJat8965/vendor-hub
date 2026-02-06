# 🚀 MARKETPLACE FRONTEND - COMPLETE IMPLEMENTATION PLAN
## Premium, Mobile-First, Production-Ready

**Total Pages:** 28  
**Tech Stack:** Next.js 15 + React 18 + TypeScript + Tailwind CSS + Framer Motion  
**Estimated Time:** 5-7 days  
**Backend API:** http://localhost:8080

---

# 📋 PHASE 1: PROJECT SETUP & DESIGN SYSTEM
**Duration:** 1-2 hours  
**Goal:** Set up Next.js project with premium design system

## 1.1 Create Next.js Project

```bash
cd /home/yogesh/Desktop/freelance_Project/marketPlace
npx create-next-app@latest marketplace-frontend --typescript --tailwind --app --no-src-dir
cd marketplace-frontend
```

**Configuration:**
- ✅ TypeScript
- ✅ ESLint
- ✅ Tailwind CSS
- ✅ App Router
- ✅ No `/src` directory
- ✅ Import alias `@/*`

## 1.2 Install Dependencies

```bash
# UI & Animation
npm install framer-motion
npm install @radix-ui/react-slot @radix-ui/react-icons
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react

# Forms & Validation
npm install react-hook-form
npm install zod @hookform/resolvers

# State Management & API
npm install @tanstack/react-query
npm install axios

# Mobile Components
npm install vaul  # Bottom sheets
npm install sonner  # Toast notifications
npm install embla-carousel-react

# Utils
npm install react-intersection-observer
npm install date-fns
npm install react-hot-toast

# Development
npm install -D @types/node @types/react @types/react-dom
```

## 1.3 Initialize shadcn/ui

```bash
npx shadcn@latest init

# Configuration:
# Style: New York
# Base color: Blue
# CSS variables: Yes
```

**Install Components:**
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add dropdown-menu
npx shadcn@latest add dialog
npx shadcn@latest add avatar
npx shadcn@latest add badge
npx shadcn@latest add tabs
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add form
npx shadcn@latest add sheet
npx shadcn@latest add scroll-area
npx shadcn@latest add separator
npx shadcn@latest add slider
npx shadcn@latest add switch
npx shadcn@latest add table
```

## 1.4 Setup Premium Design System

### **app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Premium Color System */
    --primary: 221 83% 53%;        /* Blue #2563eb */
    --primary-dark: 221 83% 43%;
    --secondary: 25 95% 53%;       /* Orange #f97316 */
    --success: 142 71% 45%;        /* Green #10b981 */
    --danger: 0 84% 60%;
    --warning: 38 92% 50%;
    
    /* Neutral Scale */
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
    --border: 214 32% 91%;
    --ring: 221 83% 53%;
    
    /* Premium Shadows */
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
    --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
    
    /* Gradients */
    --gradient-primary: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
    --gradient-success: linear-gradient(135deg, #10b981 0%, #059669 100%);
    --gradient-warning: linear-gradient(135deg, #f97316 0%, #ef4444 100%);
    
    /* Spacing */
    --radius: 0.75rem;
  }

  .dark {
    --background: 222 47% 11%;
    --foreground: 210 40% 98%;
  }
}

@layer utilities {
  /* Premium Glass Effect */
  .glass {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .glass-dark {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* Gradient Text */
  .gradient-text {
    @apply bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600;
  }

  /* Touch Targets (Mobile) */
  .touch-target {
    min-height: 44px;
    min-width: 44px;
  }

  /* Card Hover */
  .card-hover {
    @apply transition-all duration-300 hover:shadow-xl hover:-translate-y-2;
  }

  /* Smooth Scroll */
  .smooth-scroll {
    scroll-behavior: smooth;
  }

  /* Hide Scrollbar */
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  /* Custom Scrollbar */
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
}
```

### **tailwind.config.ts**

```typescript
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "#ffffff",
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-in-out",
        "slide-up": "slide-up 0.5s ease-out",
        "slide-down": "slide-down 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
```

### **app/layout.tsx**

```typescript
import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const manrope = Manrope({ 
  subsets: ["latin"],
  variable: '--font-manrope',
  display: 'swap',
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "VendorHub - Find & Hire Local Service Providers",
  description: "Connect with verified vendors for home services, repairs, and more across India",
  keywords: "vendors, services, home repair, electrician, plumber, carpenter",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### **app/providers.tsx**

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
```

## 1.5 Setup API Client

### **lib/api-client.ts**

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### **.env.local**

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## ✅ Phase 1 Checklist
- [ ] Next.js project created
- [ ] All dependencies installed
- [ ] shadcn/ui configured
- [ ] Premium design system in globals.css
- [ ] Fonts configured (Manrope + Inter)
- [ ] API client setup
- [ ] React Query provider configured
- [ ] Toast notifications setup

---

# 📋 PHASE 2: CORE PUBLIC PAGES
**Duration:** 6-8 hours  
**Pages:** 6 (Homepage, Explore, Vendor Profile, Login, Signup, Search)

## 2.1 Shared Components

### **components/layout/Header.tsx**

```typescript
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const isLoggedIn = false; // TODO: Get from auth context

  const navLinks = [
    { label: 'Explore', href: '/explore' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'For Vendors', href: '/for-vendors' },
    { label: 'About', href: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold gradient-text"
            >
              VendorHub
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar>
                      <AvatarFallback>YJ</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <nav className="flex flex-col space-y-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors py-2"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="pt-4 border-t space-y-2">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600" asChild>
                      <Link href="/signup">Get Started</Link>
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
```

### **components/layout/Footer.tsx**

```typescript
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-white text-xl font-bold mb-4">VendorHub</h3>
            <p className="text-sm text-gray-400">
              Connecting customers with trusted service providers across India.
            </p>
            <div className="flex space-x-4 mt-4">
              <Link href="#" className="hover:text-blue-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="hover:text-blue-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="hover:text-pink-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="hover:text-blue-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/explore" className="hover:text-white transition-colors">Explore Vendors</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/for-vendors" className="hover:text-white transition-colors">For Vendors</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>Email: support@vendorhub.com</li>
              <li>Phone: +91 123 456 7890</li>
              <li>Address: Mumbai, India</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; 2026 VendorHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
```

### **components/ui/skeletons.tsx**

```typescript
export function VendorCardSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-2xl overflow-hidden shadow">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/3" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  );
}
```

## 2.2 Homepage - `app/page.tsx`

```typescript
'use client';

import { motion } from 'framer-motion';
import { Search, Shield, Zap, Star, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

export default function HomePage() {
  return (
    <>
      <Header />
      
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-20 sm:py-32">
          {/* Decorative Blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto text-center"
            >
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Find Trusted Local Service Providers
              </motion.h1>
              
              <motion.p
                className="text-lg sm:text-xl lg:text-2xl text-blue-100 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Connect with verified professionals for all your needs
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 touch-target"
                  asChild
                >
                  <Link href="/explore">
                    <Search className="mr-2 h-5 w-5" />
                    Explore Vendors
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6 touch-target"
                  asChild
                >
                  <Link href="/signup?type=vendor">
                    Become a Vendor
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-12 flex flex-wrap justify-center gap-8 text-white/90"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>500+ Verified Vendors</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>10,000+ Happy Customers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-300 text-yellow-300" />
                  <span>4.8/5 Average Rating</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Why Choose <span className="gradient-text">VendorHub</span>
              </motion.h2>
              <motion.p variants={itemVariants} className="text-lg text-gray-600 max-w-2xl mx-auto">
                Your trusted platform for finding and hiring local service providers
              </motion.p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {[
                {
                  icon: Shield,
                  title: 'Verified Professionals',
                  description: 'All vendors are thoroughly vetted and verified for your safety',
                  color: 'text-blue-600',
                  bgColor: 'bg-blue-100',
                },
                {
                  icon: Zap,
                  title: 'Quick & Easy',
                  description: 'Get quotes within minutes and hire the best vendor for your needs',
                  color: 'text-orange-600',
                  bgColor: 'bg-orange-100',
                },
                {
                  icon: Star,
                  title: 'Top Rated',
                  description: 'Read genuine reviews from real customers before making a decision',
                  color: 'text-green-600',
                  bgColor: 'bg-green-100',
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow"
                >
                  <div className={`${feature.bgColor} ${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6`}>
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            >
              Ready to Get Started?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto"
            >
              Join thousands of satisfied customers finding the perfect vendors for their needs
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6"
                asChild
              >
                <Link href="/explore">
                  Start Exploring
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
```

## 2.3 Explore Page - `app/explore/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PremiumVendorCard } from '@/components/vendor/PremiumVendorCard';
import { VendorCardSkeleton } from '@/components/ui/skeletons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ExplorePage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // TODO: Fetch vendors from API
    setTimeout(() => {
      setVendors([]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Search */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Find Your Perfect Service Provider
              </h1>
              <p className="text-lg text-blue-100 mb-8">
                Browse 500+ verified professionals across India
              </p>

              {/* Search Bar */}
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search by name, service, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-14 pl-14 pr-32 text-lg text-gray-900 rounded-2xl shadow-2xl border-0"
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 bg-blue-600 hover:bg-blue-700"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Vendors Grid */}
        <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <VendorCardSkeleton key={i} />
              ))}
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No vendors found. Try adjusting your search.</p>
            </div>
          ) : (
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {vendors.map(vendor => (
                <motion.div
                  key={vendor.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <PremiumVendorCard vendor={vendor} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
```

## 2.4 Premium Vendor Card Component

### **components/vendor/PremiumVendorCard.tsx**

```typescript
'use client';

import { motion } from 'framer-motion';
import { Star, MapPin, BadgeCheck, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface VendorCardProps {
  vendor: {
    id: string;
    slug: string;
    storeName: string;
    vendorType: string;
    city?: string;
    bannerUrl?: string;
    logoUrl?: string;
    rating?: number;
    reviewCount?: number;
    certified?: boolean;
    promoted?: boolean;
    subscriptionPlan?: string;
  };
}

export function PremiumVendorCard({ vendor }: VendorCardProps) {
  return (
    <Link href={`/vendor/${vendor.slug}`}>
      <motion.div
        whileHover={{ 
          y: -12,
          transition: { duration: 0.3, ease: 'easeOut' }
        }}
        className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-shadow"
      >
        {/* Banner */}
        <div className="relative h-44 sm:h-56 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
          {vendor.bannerUrl ? (
            <Image
              src={vendor.bannerUrl}
              alt={vendor.storeName}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl font-bold text-gray-400">
                {vendor.storeName.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-3 right-3 flex gap-2">
            {vendor.certified && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-blue-500 text-white p-2 rounded-full shadow-lg"
              >
                <BadgeCheck className="w-4 h-4" />
              </motion.div>
            )}
            {vendor.promoted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg"
              >
                ⭐ Featured
              </motion.div>
            )}
          </div>

          {/* Vendor Info */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center gap-2">
              {vendor.logoUrl && (
                <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-lg">
                  <Image
                    src={vendor.logoUrl}
                    alt={vendor.storeName}
                    width={48}
                    height={48}
                    className="rounded-lg object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg line-clamp-1">
                  {vendor.storeName}
                </h3>
                <p className="text-white/90 text-sm">{vendor.vendorType}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 space-y-3">
          {/* Location & Rating */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{vendor.city || 'Multiple Cities'}</span>
            </div>
            
            {vendor.rating && (
              <div className="flex items-center gap-1.5 bg-yellow-50 px-2 py-1 rounded-lg">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-gray-900">
                  {vendor.rating.toFixed(1)}
                </span>
                <span className="text-gray-500 text-xs">
                  ({vendor.reviewCount || 0})
                </span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>{vendor.subscriptionPlan || 'Basic'}</span>
            </div>
            {(vendor.reviewCount || 0) > 0 && (
              <span>• {vendor.reviewCount} reviews</span>
            )}
          </div>

          {/* CTA Button */}
          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Open quote modal
            }}
          >
            Get Quote
          </Button>
        </div>
      </motion.div>
    </Link>
  );
}
```

## ✅ Phase 2 Checklist
- [ ] Header component with mobile navigation
- [ ] Footer component
- [ ] Loading skeletons
- [ ] Homepage with hero, features, CTA
- [ ] Explore page with search & filters
- [ ] Premium Vendor Card component
- [ ] Vendor Profile page (detailed view)
- [ ] Login page with form validation
- [ ] Signup page (Customer & Vendor)
- [ ] Search results page

---

# 📋 PHASE 3: CUSTOMER DASHBOARD
**Duration:** 3-4 hours  
**Pages:** 4 (Dashboard, Quotes, Reviews, Profile)

## 3.1 Customer Dashboard - `app/customer/dashboard/page.tsx`

```typescript
'use client';

import { motion } from 'framer-motion';
import { FileText, Star, User, TrendingUp } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CustomerDashboard() {
  const stats = [
    { label: 'Active Quotes', value: '3', icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { label: 'Reviews Given', value: '12', icon: Star, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    { label: 'Vendors Hired', value: '8', icon: TrendingUp, color: 'text-green-600', bgColor: 'bg-green-100' },
  ];

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
            <p className="text-gray-600 mb-8">Here's what's happening with your quotes</p>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`${stat.bgColor} ${stat.color} p-3 rounded-xl`}>
                          <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stat.value}</p>
                          <p className="text-sm text-gray-600">{stat.label}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Quote Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">No recent quotes. Start exploring vendors!</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
}
```

## ✅ Phase 3 Checklist
- [ ] Customer Dashboard overview
- [ ] My Quotes page with status tracking
- [ ] My Reviews page
- [ ] Customer Profile edit page

---

# 📋 PHASE 4: VENDOR DASHBOARD
**Duration:** 5-6 hours  
**Pages:** 8 (Dashboard, Profile, Subscription, Quotes, Reviews, Collaborations, Gallery, Settings)

## 4.1 Vendor Dashboard

_Full implementation details..._

## ✅ Phase 4 Checklist
- [ ] Vendor Dashboard with analytics
- [ ] Edit Storefront page
- [ ] Subscription management
- [ ] Quote requests management
- [ ] Reviews management
- [ ] Collaborations page
- [ ] Gallery upload
- [ ] Settings page

---

# 📋 PHASE 5: ADMIN DASHBOARD
**Duration:** 4-5 hours  
**Pages:** 5 (Dashboard, Vendors, Users, Categories, Reviews)

## ✅ Phase 5 Checklist
- [ ] Admin Dashboard
- [ ] Manage Vendors
- [ ] Manage Users
- [ ] Manage Categories
- [ ] Moderate Flagged Reviews

---

# 📋 PHASE 6: UTILITY PAGES & POLISH
**Duration:** 2-3 hours  
**Pages:** 5 (About, Terms, Privacy, 404, 500)

## ✅ Phase 6 Checklist
- [ ] About Us page
- [ ] Terms & Conditions
- [ ] Privacy Policy
- [ ] Custom 404 page
- [ ] Custom 500 error page

---

# 📋 PHASE 7: TESTING & OPTIMIZATION
**Duration:** 3-4 hours

## 7.1 Testing Checklist
- [ ] All API endpoints tested
- [ ] Mobile responsiveness (320px - 1920px)
- [ ] Animations at 60fps
- [ ] Form validations working
- [ ] Error handling in place
- [ ] Authentication flow complete
- [ ] Image optimization
- [ ] SEO meta tags
- [ ] Loading states everywhere

## 7.2 Performance Optimization
- [ ] Lazy load images with Next.js Image
- [ ] Code splitting for routes
- [ ] Bundle size under 200KB
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals optimized

---

# 🎯 FINAL DELIVERABLES

## Project Structure
```
marketplace-frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── customer/
│   │   ├── dashboard/
│   │   ├── quotes/
│   │   ├── reviews/
│   │   └── profile/
│   ├── vendor/
│   │   ├── dashboard/
│   │   ├── profile/
│   │   ├── subscription/
│   │   ├── quotes/
│   │   ├── reviews/
│   │   ├── collaborations/
│   │   ├── gallery/
│   │   └── settings/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── vendors/
│   │   ├── users/
│   │   ├── categories/
│   │   └── reviews/
│   ├── explore/
│   ├── search/
│   ├── vendor/[slug]/
│   ├── about/
│   ├── privacy/
│   ├── terms/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── layout/
│   ├── vendor/
│   ├── customer/
│   ├── admin/
│   ├── ui/
│   └── mobile/
├── lib/
│   ├── api-client.ts
│   ├── utils.ts
│   └── hooks/
├── public/
└── package.json
```

## Success Metrics
✅ 28 pages fully functional  
✅ Mobile-first responsive design  
✅ 60fps animations with Framer Motion  
✅ Form validations with Zod  
✅ Complete API integration  
✅ Premium UI that doesn't look like AI template  
✅ Loading states & error handling  
✅ SEO optimized

---

# 📡 PHASE 7: BACKEND API INTEGRATION
**Duration:** 8-12 hours  
**Goal:** Complete end-to-end integration with Spring Boot backend

## 🔍 INTEGRATION SCOPE ANALYSIS

**Total Integration Points Identified:** 37 TODO comments  
**Backend API Endpoints Available:** 21+ REST endpoints  
**File Upload Requirements:** 5 locations (profile photo, logo, banner, gallery)  
**Authentication Dependencies:** All features require JWT implementation first

---

## 📋 PHASE 7 SUB-PHASES BREAKDOWN

### **Sub-Phase 7.1: FOUNDATION - Authentication & Core Services** ⚙️
**Duration:** 2-3 hours  
**Priority:** CRITICAL - All other features depend on this  
**Files Modified:** 8 files

#### Integration Points:
1. **Auth Context & JWT Management** (NEW SERVICE)
   - Create `lib/auth-context.tsx` for global auth state
   - Implement JWT token decode to extract user info
   - Store user data (email, role, name) in context
   - Auto-refresh on page load from localStorage
   
2. **API Client Enhancement** (MODIFY)
   - File: `lib/api-client.ts`
   - Add token refresh logic
   - Improve error handling with toast notifications
   - Add loading state management
   
3. **Protected Route Guards** (NEW COMPONENT)
   - Create `components/auth/ProtectedRoute.tsx`
   - Check authentication status
   - Redirect to login if unauthenticated
   - Verify role-based access (customer/vendor/admin)

4. **Login Page Integration** (MODIFY)
   - File: `app/login/page.tsx`
   - Endpoint: `POST /api/auth/login`
   - Store JWT token in localStorage
   - Decode token to get user role
   - Redirect based on role: customer → /dashboard/customer, vendor → /dashboard/vendor, admin → /dashboard/admin
   - Display error messages from API
   - **Lines 38, 44:** Replace TODO with API calls

5. **Customer Signup Integration** (MODIFY)
   - File: `app/signup/page.tsx`
   - Endpoint: `POST /api/auth/signup`
   - Same JWT handling as login
   - Auto-login after successful signup
   - **Lines 70, 76:** Replace TODO with API calls

6. **Vendor Signup Integration** (MODIFY)
   - File: `app/signup/page.tsx`
   - Endpoint: `POST /api/auth/vendor/signup`
   - Additional fields: business name, category, city
   - Pending approval message
   - **Lines 88, 94:** Replace TODO with API calls

7. **Header Component Authentication** (MODIFY)
   - File: `components/layout/Header.tsx`
   - Use auth context to check login state
   - Show user menu if logged in
   - Display "Login/Signup" buttons if not logged in
   - **Line 19:** Replace TODO with auth context

8. **Logout Functionality** (MODIFY)
   - Files: 
     - `app/dashboard/customer/layout.tsx` (Line 57)
     - `app/dashboard/vendor/layout.tsx` (Line 67)
     - `app/dashboard/admin/layout.tsx` (Line 70)
   - Clear localStorage token
   - Clear auth context
   - Redirect to login page

#### Backend Endpoints:
```
POST /api/auth/login
POST /api/auth/signup
POST /api/auth/vendor/signup
```

#### Testing Checklist:
- [ ] Login with customer credentials works
- [ ] Login with vendor credentials works
- [ ] Login with admin credentials works
- [ ] Customer signup creates account and logs in
- [ ] Vendor signup creates account (pending approval)
- [ ] Invalid credentials show error message
- [ ] Token persists after page refresh
- [ ] Logout clears token and redirects
- [ ] Protected routes redirect when not authenticated
- [ ] Header shows correct state (logged in/out)

---

### **Sub-Phase 7.2: PUBLIC PAGES - Explore & Search** 🔍
**Duration:** 1.5-2 hours  
**Depends On:** 7.1 (for favorites/quote features)  
**Files Modified:** 3 files

#### Integration Points:

1. **Homepage Vendor Showcase** (MODIFY)
   - File: `app/page.tsx`
   - Endpoint: `GET /api/explore` (get all vendors)
   - Display top 6 premium/promoted vendors
   - Remove mock data, use real vendors
   - Link to explore page

2. **Explore Page - Vendor Listing** (MODIFY)
   - File: `app/explore/page.tsx`
   - Endpoint: `GET /api/explore`
   - Load all active vendors on mount
   - Implement search: `GET /api/explore/search?city={city}`
   - Implement filter by category: `GET /api/explore/search?vendorType={type}`
   - Real-time search with debouncing (500ms)
   - Loading skeleton while fetching
   - Empty state if no vendors found

3. **Vendor Profile Page** (MODIFY)
   - File: `app/vendors/[slug]/page.tsx` (currently missing, needs creation)
   - Endpoint: `GET /api/explore/{slug}/profile`
   - Load vendor details by slug
   - Endpoint: `GET /api/reviews/{slug}` (get vendor reviews)
   - Display reviews with ratings
   - Show quote request button (requires auth)
   - Add to favorites button (requires auth)

#### Backend Endpoints:
```
GET /api/explore
GET /api/explore/{slug}/profile
GET /api/explore/search?city={city}&vendorType={type}
GET /api/reviews/{vendorSlug}
```

#### Testing Checklist:
- [ ] Homepage displays real vendors
- [ ] Explore page loads all vendors
- [ ] Search by city filters correctly
- [ ] Filter by category works
- [ ] Vendor profile page loads data
- [ ] Reviews display on vendor profile
- [ ] Loading states show during API calls
- [ ] Error handling for failed requests
- [ ] Empty states display when no results

---

### **Sub-Phase 7.3: CUSTOMER DASHBOARD** 👤
**Duration:** 2-3 hours  
**Depends On:** 7.1, 7.2  
**Files Modified:** 4 files

#### Integration Points:

1. **Customer Dashboard Overview** (MODIFY)
   - File: `app/dashboard/customer/page.tsx`
   - Endpoint: `GET /api/quotes/customer/{email}` (get customer's quotes)
   - Calculate stats from real data (active quotes, total spent)
   - Display recent quote activity
   - Get email from auth context

2. **Customer Quotes Page** (MODIFY)
   - File: `app/dashboard/customer/quotes/page.tsx`
   - Endpoint: `GET /api/quotes/customer/{email}`
   - Display all customer quotes with status
   - Filter by status (pending/accepted/declined)
   - Implement quote details dialog
   - **Line 105:** Replace TODO with dialog implementation

3. **Customer Favorites Page** (MODIFY)
   - File: `app/dashboard/customer/favorites/page.tsx`
   - **NEW BACKEND NEEDED:** Favorites feature not in backend yet
   - Option 1: Store favorites in localStorage (temporary)
   - Option 2: Request backend to add favorites API
   - Remove favorite functionality
   - **Line 71:** Implement remove from favorites
   - Request quote from favorite vendor
   - **Line 77:** Open quote request modal

4. **Customer Profile Settings** (MODIFY)
   - File: `app/dashboard/customer/profile/page.tsx`
   - Endpoint: `GET /api/customer/profile` (NEW - need backend)
   - Endpoint: `PUT /api/customer/profile` (NEW - need backend)
   - Load current profile data
   - Update profile (name, email, phone, address)
   - **Line 72:** Replace TODO with API call
   - Change password functionality
   - **Line 86:** Replace TODO with API call
   - Profile photo upload
   - **Line 99:** Implement photo upload (Sub-Phase 7.6)

#### Backend Endpoints (Available):
```
GET /api/quotes/customer/{email}
```

#### Backend Endpoints (MISSING - Need to Add):
```
GET /api/customer/profile
PUT /api/customer/profile
POST /api/customer/change-password
POST /api/customer/favorites/{vendorId}
DELETE /api/customer/favorites/{vendorId}
GET /api/customer/favorites
```

#### Testing Checklist:
- [ ] Dashboard loads customer's real quote data
- [ ] Stats calculated correctly from API data
- [ ] Quotes page displays all customer quotes
- [ ] Quote status filtering works
- [ ] Quote details dialog shows full information
- [ ] Favorites functionality works (even if localStorage)
- [ ] Profile data loads correctly
- [ ] Profile update saves successfully
- [ ] Password change works with validation
- [ ] Error messages display for failed operations

---

### **Sub-Phase 7.4: VENDOR DASHBOARD** 🏪
**Duration:** 2-3 hours  
**Depends On:** 7.1  
**Files Modified:** 4 files

#### Integration Points:

1. **Vendor Dashboard Overview** (MODIFY)
   - File: `app/dashboard/vendor/page.tsx`
   - Endpoint: `GET /api/vendor/dashboard/overview?slug={slug}`
   - Load real metrics: views, leads, revenue, rating
   - Display conversion rate
   - Show recent activity feed
   - Get vendor slug from auth context

2. **Vendor Quotes Management** (MODIFY)
   - File: `app/dashboard/vendor/quotes/page.tsx`
   - Endpoint: `GET /api/quotes/vendor/{vendorSlug}`
   - Display incoming quote requests
   - Filter by status (new/accepted/declined/completed)
   - Quote response dialog with pricing
   - Accept quote: `PUT /api/quotes/{quoteId}/status` (status: "accepted")
   - Decline quote: `PUT /api/quotes/{quoteId}/status` (status: "declined")
   - **Lines 103, 107, 112, 117:** Replace TODO with API calls

3. **Vendor Storefront Editor** (MODIFY)
   - File: `app/dashboard/vendor/storefront/page.tsx`
   - Endpoint: `GET /api/vendor/profile?slug={slug}`
   - Load current storefront data
   - Endpoint: `PUT /api/vendor/profile?slug={slug}`
   - Update business info (name, description, services, hours)
   - **Line 65:** Replace TODO with API call
   - Logo upload
   - **Line 77:** Implement upload (Sub-Phase 7.6)
   - Banner upload
   - **Line 82:** Implement upload (Sub-Phase 7.6)
   - Gallery upload
   - **Line 87:** Implement upload (Sub-Phase 7.6)

4. **Vendor Reviews Page** (MODIFY)
   - File: `app/dashboard/vendor/reviews/page.tsx`
   - Endpoint: `GET /api/reviews/{vendorSlug}`
   - Display all reviews for vendor
   - Show rating distribution
   - Flag review: `PUT /api/reviews/{reviewId}/flag`
   - Calculate average rating from reviews

5. **Vendor Settings** (MODIFY)
   - File: `app/dashboard/vendor/settings/page.tsx`
   - Endpoint: `PUT /api/vendor/profile?slug={slug}`
   - Update business settings
   - **Line 69:** Replace TODO with API call
   - Account deactivation
   - **Line 87:** Implement deactivation (NEW backend endpoint)
   - Account deletion
   - **Line 92:** Implement deletion (NEW backend endpoint)

#### Backend Endpoints (Available):
```
GET /api/vendor/dashboard/overview?slug={slug}
GET /api/vendor/profile?slug={slug}
PUT /api/vendor/profile?slug={slug}
GET /api/quotes/vendor/{vendorSlug}
PUT /api/quotes/{quoteId}/status
GET /api/reviews/{vendorSlug}
PUT /api/reviews/{reviewId}/flag
```

#### Backend Endpoints (MISSING):
```
PUT /api/vendor/deactivate
DELETE /api/vendor/account
```

#### Testing Checklist:
- [ ] Dashboard loads vendor's real metrics
- [ ] Views, leads, revenue display correctly
- [ ] Conversion rate calculates accurately
- [ ] Quotes page shows incoming requests
- [ ] Accept quote functionality works
- [ ] Decline quote functionality works
- [ ] Quote response saves with pricing
- [ ] Storefront loads current vendor data
- [ ] Storefront updates save successfully
- [ ] Reviews page displays all reviews
- [ ] Rating distribution shows correctly
- [ ] Flag review functionality works
- [ ] Settings update successfully
- [ ] Account deactivation works

---

### **Sub-Phase 7.5: ADMIN PANEL** 👨‍💼
**Duration:** 2-3 hours  
**Depends On:** 7.1  
**Files Modified:** 6 files

#### Integration Points:

1. **Admin Dashboard Overview** (MODIFY)
   - File: `app/dashboard/admin/page.tsx`
   - Endpoint: `GET /api/admin/dashboard`
   - Load platform stats (users, vendors, revenue, rating)
   - Display pending actions count
   - Show recent activity feed

2. **Admin Vendor Management** (MODIFY)
   - File: `app/dashboard/admin/vendors/page.tsx`
   - Endpoint: `GET /api/admin/vendors`
   - Display all vendors with approval status
   - Filter by status (pending/approved/rejected/suspended)
   - Search vendors by name
   - Approve vendor (NEW backend endpoint needed)
   - **Line 141:** Implement approve vendor
   - Reject vendor with reason (NEW)
   - **Line 151:** Implement reject vendor
   - Suspend vendor (NEW)
   - **Line 162:** Implement suspend vendor

3. **Admin User Management** (MODIFY)
   - File: `app/dashboard/admin/users/page.tsx`
   - Endpoint: `GET /api/admin/users` (NEW - need backend)
   - Display all users (customers + vendors)
   - Filter by role and status
   - Ban user (NEW)
   - **Line 97:** Implement ban user
   - Unban user (NEW)
   - **Line 107:** Implement unban user

4. **Admin Category Management** (MODIFY)
   - File: `app/dashboard/admin/categories/page.tsx`
   - Endpoint: `GET /api/admin/categories` (NEW)
   - Endpoint: `POST /api/admin/categories` (NEW)
   - Endpoint: `PUT /api/admin/categories/{id}` (NEW)
   - Endpoint: `DELETE /api/admin/categories/{id}` (NEW)
   - Full CRUD for categories
   - **Lines 71, 82, 91:** Replace TODO with API calls

5. **Admin Review Moderation** (MODIFY)
   - File: `app/dashboard/admin/reviews/page.tsx`
   - Endpoint: `GET /api/admin/reviews/flagged`
   - Display flagged reviews by severity
   - Approve/unflag review (NEW)
   - **Line 88:** Implement approve review
   - Delete review: `DELETE /api/admin/reviews/{reviewId}`
   - **Line 98:** Replace TODO with API call

6. **Admin Platform Settings** (MODIFY)
   - File: `app/dashboard/admin/settings/page.tsx`
   - Endpoint: `GET /api/admin/settings` (NEW)
   - Endpoint: `PUT /api/admin/settings` (NEW)
   - Load platform configuration
   - Update settings (commission, features, notifications)
   - **Line 60:** Replace TODO with API call

#### Backend Endpoints (Available):
```
GET /api/admin/dashboard
GET /api/admin/vendors
GET /api/admin/reviews/flagged
DELETE /api/admin/reviews/{reviewId}
```

#### Backend Endpoints (MISSING):
```
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

#### Testing Checklist:
- [ ] Dashboard loads platform statistics
- [ ] Pending actions display correctly
- [ ] Vendor management page loads all vendors
- [ ] Vendor approval/rejection works
- [ ] Vendor suspension works
- [ ] User management displays all users
- [ ] Ban/unban functionality works
- [ ] Category CRUD operations work
- [ ] Flagged reviews display correctly
- [ ] Review approval/deletion works
- [ ] Platform settings load correctly
- [ ] Settings update saves successfully

---

### **Sub-Phase 7.6: FILE UPLOADS & MEDIA** 📸
**Duration:** 1.5-2 hours  
**Depends On:** 7.1, 7.3, 7.4  
**Files Modified:** 3 files + New upload service

#### Integration Points:

1. **Upload Service** (NEW)
   - Create `lib/upload-service.ts`
   - Handle multipart/form-data requests
   - Support image compression before upload
   - Progress tracking for large files
   - Error handling for file size/type restrictions

2. **Customer Profile Photo Upload** (MODIFY)
   - File: `app/dashboard/customer/profile/page.tsx`
   - Endpoint: `POST /api/customer/upload/photo` (NEW backend)
   - Image preview before upload
   - Crop/resize functionality
   - **Line 99:** Replace TODO with upload implementation

3. **Vendor Logo Upload** (MODIFY)
   - File: `app/dashboard/vendor/storefront/page.tsx`
   - Endpoint: `POST /api/vendor/upload/logo` (NEW)
   - Square aspect ratio enforcement
   - Max 2MB size
   - **Line 77:** Replace TODO with upload implementation

4. **Vendor Banner Upload** (MODIFY)
   - File: `app/dashboard/vendor/storefront/page.tsx`
   - Endpoint: `POST /api/vendor/upload/banner` (NEW)
   - 16:9 aspect ratio preferred
   - Max 5MB size
   - **Line 82:** Replace TODO with upload implementation

5. **Vendor Gallery Upload** (MODIFY)
   - File: `app/dashboard/vendor/storefront/page.tsx`
   - Endpoint: `POST /api/vendor/upload/gallery` (NEW)
   - Multiple file upload (max 10 images)
   - Drag & drop support
   - Reorder gallery images
   - Delete gallery images
   - **Line 87:** Replace TODO with upload implementation

#### Backend Endpoints (MISSING - All Need to be Added):
```
POST /api/customer/upload/photo
POST /api/vendor/upload/logo
POST /api/vendor/upload/banner
POST /api/vendor/upload/gallery
DELETE /api/vendor/gallery/{imageId}
```

#### Implementation Notes:
- Use `FormData` for file uploads
- Consider using AWS S3 or local storage in backend
- Return image URLs after successful upload
- Implement file validation in frontend AND backend
- Show upload progress with loading bar

#### Testing Checklist:
- [ ] Profile photo upload works
- [ ] Image preview displays before upload
- [ ] Logo upload saves correctly
- [ ] Banner upload saves correctly
- [ ] Gallery multiple upload works
- [ ] Gallery drag & drop works
- [ ] Gallery reorder functionality works
- [ ] Gallery delete works
- [ ] File size validation works
- [ ] File type validation works
- [ ] Upload progress displays
- [ ] Error messages show for failed uploads

---

### **Sub-Phase 7.7: POLISH & OPTIMIZATION** ✨
**Duration:** 1-2 hours  
**Depends On:** 7.1-7.6  
**Files Modified:** All pages + new services

#### Integration Points:

1. **Global Error Handling** (NEW)
   - Create `lib/error-handler.ts`
   - Centralized error message formatting
   - Toast notifications for errors
   - Log errors to console in dev mode
   - User-friendly error messages

2. **Loading States** (MODIFY ALL PAGES)
   - Add loading skeletons to all data fetches
   - Disable buttons during submission
   - Show loading spinner for file uploads
   - Implement optimistic UI updates where appropriate

3. **React Query Integration** (ENHANCE)
   - Wrap all API calls in React Query hooks
   - Implement caching with 60s staleTime
   - Add refetch on window focus
   - Implement pagination for large lists
   - Add infinite scroll for explore page

4. **Form Validation Enhancement** (MODIFY)
   - Client-side validation with Zod schemas
   - Server-side error display
   - Field-level error messages
   - Disable submit during validation

5. **Real-time Features** (OPTIONAL)
   - WebSocket connection for notifications
   - Real-time quote status updates
   - Live vendor approval notifications
   - Badge counters update automatically

6. **Performance Optimization**
   - Lazy load images with next/image
   - Code splitting for dashboard routes
   - Prefetch data on hover
   - Memoize expensive computations

7. **Accessibility & UX Polish**
   - Add aria-labels to all interactive elements
   - Keyboard navigation for all features
   - Focus management in dialogs
   - Success toast notifications
   - Confirmation dialogs for destructive actions

#### Testing Checklist:
- [ ] All API errors display user-friendly messages
- [ ] Loading states show during all operations
- [ ] Forms validate before submission
- [ ] Server errors display field-level messages
- [ ] React Query caching works correctly
- [ ] Refetch on window focus works
- [ ] All images lazy load properly
- [ ] No console errors in production
- [ ] Accessibility score >90 in Lighthouse
- [ ] All actions have success/error feedback

---

## 🔧 BACKEND ENHANCEMENTS NEEDED

### Critical (Must Have):
1. **Customer Profile API**
   - `GET /api/customer/profile`
   - `PUT /api/customer/profile`
   - `POST /api/customer/change-password`

2. **Favorites API**
   - `POST /api/customer/favorites/{vendorId}`
   - `DELETE /api/customer/favorites/{vendorId}`
   - `GET /api/customer/favorites`

3. **Vendor Approval Workflow**
   - `PUT /api/admin/vendors/{id}/approve`
   - `PUT /api/admin/vendors/{id}/reject`
   - `PUT /api/admin/vendors/{id}/suspend`

4. **User Management**
   - `GET /api/admin/users`
   - `PUT /api/admin/users/{id}/ban`
   - `PUT /api/admin/users/{id}/unban`

5. **Category Management**
   - `GET /api/admin/categories`
   - `POST /api/admin/categories`
   - `PUT /api/admin/categories/{id}`
   - `DELETE /api/admin/categories/{id}`

6. **File Upload Endpoints**
   - `POST /api/customer/upload/photo`
   - `POST /api/vendor/upload/logo`
   - `POST /api/vendor/upload/banner`
   - `POST /api/vendor/upload/gallery`
   - `DELETE /api/vendor/gallery/{imageId}`

### Nice to Have:
7. **Admin Settings**
   - `GET /api/admin/settings`
   - `PUT /api/admin/settings`

8. **Review Unflagging**
   - `PUT /api/admin/reviews/{id}/unflag`

9. **Vendor Account Actions**
   - `PUT /api/vendor/deactivate`
   - `DELETE /api/vendor/account`

---

## 📊 INTEGRATION EXECUTION STRATEGY

### Step-by-Step Approach:

1. **Start with Sub-Phase 7.1 (Foundation)**
   - This is the most critical phase
   - All other features depend on authentication
   - Test thoroughly before moving forward

2. **Move to Sub-Phase 7.2 (Public Pages)**
   - Low complexity, good for building confidence
   - Tests the basic API integration pattern
   - No auth required for most features

3. **Tackle Sub-Phase 7.3 (Customer)**
   - Medium complexity
   - Good practice for form submissions
   - Identify missing backend endpoints

4. **Implement Sub-Phase 7.4 (Vendor)**
   - Similar patterns to customer dashboard
   - More complex business logic
   - Quote management workflow

5. **Complete Sub-Phase 7.5 (Admin)**
   - Most complex CRUD operations
   - Requires many new backend endpoints
   - May need to add backend features first

6. **Add Sub-Phase 7.6 (File Uploads)**
   - Completely separate concern
   - Can be done in parallel if needed
   - Requires backend file handling setup

7. **Finish with Sub-Phase 7.7 (Polish)**
   - Apply learnings from all previous phases
   - Consistent error handling everywhere
   - Performance and UX improvements

### Testing Between Sub-Phases:
- ✅ Test each sub-phase immediately after completion
- ✅ Don't move to next sub-phase if current one has blocking issues
- ✅ Use manual testing + console logs to verify API calls
- ✅ Check Network tab in DevTools for request/response
- ✅ Verify data persistence in MongoDB

---

## 🎯 SUCCESS METRICS

### Technical Goals:
- ✅ All 37 TODO comments resolved
- ✅ Zero hardcoded mock data
- ✅ All forms submit to real APIs
- ✅ Proper error handling on all requests
- ✅ Loading states on all async operations
- ✅ JWT authentication working end-to-end
- ✅ Role-based access control implemented

### User Experience Goals:
- ✅ Smooth, no-jank animations during data loading
- ✅ Instant feedback on all user actions
- ✅ No broken links or 404 errors
- ✅ Responsive on mobile devices
- ✅ Fast page load times (<2s)

### Business Goals:
- ✅ Users can signup and login
- ✅ Vendors can manage their storefront
- ✅ Customers can request quotes
- ✅ Admin can moderate platform
- ✅ Reviews and ratings work correctly
- ✅ All critical user flows functional

---

## 📝 IMPLEMENTATION NOTES

### Conventions to Follow:
1. **API Error Handling:**
   ```typescript
   try {
     const response = await apiClient.post('/endpoint', data);
     toast.success('Operation successful!');
   } catch (error) {
     const message = error.response?.data?.error || 'Something went wrong';
     toast.error(message);
   }
   ```

2. **Loading States:**
   ```typescript
   const [isLoading, setIsLoading] = useState(false);
   
   const handleSubmit = async () => {
     setIsLoading(true);
     try {
       // API call
     } finally {
       setIsLoading(false);
     }
   };
   ```

3. **Auth Context Usage:**
   ```typescript
   const { user, isAuthenticated, logout } = useAuth();
   ```

4. **React Query Pattern:**
   ```typescript
   const { data, isLoading, error } = useQuery({
     queryKey: ['vendors'],
     queryFn: () => apiClient.get('/api/explore'),
     staleTime: 60000,
   });
   ```

### Common Pitfalls to Avoid:
- ❌ Don't forget to handle loading states
- ❌ Don't show raw error objects to users
- ❌ Don't forget to clear forms after successful submission
- ❌ Don't make API calls in render functions
- ❌ Don't forget to validate data before sending to API
- ❌ Don't hardcode URLs - use environment variables
- ❌ Don't forget to handle token expiration

---

**🚀 PHASE 7 READY FOR EXECUTION!**

---

**🚀 READY TO START? Follow each phase sequentially for best results!**
