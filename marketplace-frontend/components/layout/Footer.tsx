import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#EEDDCC] text-[#6B5E54]">
      <div className="container mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-[#2C2621] text-2xl font-heading font-bold">VendorHub</h3>
            <p className="font-accent text-xl text-[#CDB79E]">Where design meets home</p>
            <p className="text-sm font-body leading-relaxed pt-2">
              Connecting you with India's finest interior designers, architects, and premium home service professionals.
            </p>
            <div className="flex space-x-4 pt-4">
              <Link href="#" className="text-[#9C8E82] hover:text-[#2C2621] transition-colors touch-target">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-[#9C8E82] hover:text-[#2C2621] transition-colors touch-target">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-[#9C8E82] hover:text-[#2C2621] transition-colors touch-target">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-[#9C8E82] hover:text-[#2C2621] transition-colors touch-target">
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[#2C2621] font-heading font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3 font-body text-sm">
              <li><Link href="/explore" className="hover:text-[#2C2621] transition-colors hover:underline underline-offset-4">Explore Designers</Link></li>
              <li><Link href="/how-it-works" className="hover:text-[#2C2621] transition-colors hover:underline underline-offset-4">How It Works</Link></li>
              <li><Link href="/for-vendors" className="hover:text-[#2C2621] transition-colors hover:underline underline-offset-4">For Professionals</Link></li>
              <li><Link href="/about" className="hover:text-[#2C2621] transition-colors hover:underline underline-offset-4">Our Story</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-[#2C2621] font-heading font-semibold mb-6">Support</h4>
            <ul className="space-y-3 font-body text-sm">
              <li><Link href="/contact" className="hover:text-[#2C2621] transition-colors hover:underline underline-offset-4">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-[#2C2621] transition-colors hover:underline underline-offset-4">FAQ</Link></li>
              <li><Link href="/privacy" className="hover:text-[#2C2621] transition-colors hover:underline underline-offset-4">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[#2C2621] transition-colors hover:underline underline-offset-4">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[#2C2621] font-heading font-semibold mb-6">Contact</h4>
            <ul className="space-y-4 font-body text-sm">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 text-[#CDB79E] flex-shrink-0" />
                <span>concierge@vendorhub.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 text-[#CDB79E] flex-shrink-0" />
                <span>+91 123 456 7890</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-[#CDB79E] flex-shrink-0" />
                <span>Mumbai, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#CDC0B0]/50 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm font-body text-[#9C8E82]">
          <p>&copy; 2026 VendorHub. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-accent text-lg">Crafting beautiful spaces</p>
        </div>
      </div>
    </footer>
  );
}
