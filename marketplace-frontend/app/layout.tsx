import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans, Great_Vibes } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: 'swap',
});

const greatVibes = Great_Vibes({
  weight: '400',
  variable: "--font-accent",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "VendorHub - Premium Interior Design & Home Services Marketplace",
  description: "Connect with India's finest interior designers, architects, and home service professionals. From concept to creation.",
  keywords: "interior design, architects, premium home services, home renovation, luxury interiors, vendorhub",
  openGraph: {
    title: "VendorHub - Premium Interior Design Marketplace",
    description: "Transform your space with expert designers and trusted professionals.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable} ${greatVibes.variable}`}>
      <body className="font-body antialiased text-[#2C2621] bg-white">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
