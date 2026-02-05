'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileText, Shield, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Terms & Conditions</h1>
          <p className="text-gray-600">Last updated: February 4, 2026</p>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                <p className="text-gray-700 leading-relaxed">
                  Welcome to VendorHub ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your access to and use of our marketplace platform, including our website, mobile applications, and services (collectively, the "Platform"). By accessing or using the Platform, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use the Platform.
                </p>
              </section>

              <Separator />

              {/* Definitions */}
              <section>
                <h2 className="text-2xl font-bold mb-4">2. Definitions</h2>
                <div className="space-y-3 text-gray-700">
                  <p><strong>"Customer"</strong> means any individual or entity seeking services through the Platform.</p>
                  <p><strong>"Vendor"</strong> means any service provider registered on the Platform to offer services.</p>
                  <p><strong>"Services"</strong> means home improvement, maintenance, repair, and related professional services offered by Vendors.</p>
                  <p><strong>"Quote"</strong> means a price estimate provided by a Vendor to a Customer for requested Services.</p>
                </div>
              </section>

              <Separator />

              {/* Eligibility */}
              <section>
                <h2 className="text-2xl font-bold mb-4">3. Eligibility</h2>
                <div className="space-y-3 text-gray-700">
                  <p>To use the Platform, you must:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Be at least 18 years of age</li>
                    <li>Have the legal capacity to enter into binding contracts</li>
                    <li>Provide accurate and complete registration information</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Comply with all applicable laws and regulations</li>
                  </ul>
                </div>
              </section>

              <Separator />

              {/* User Accounts */}
              <section>
                <h2 className="text-2xl font-bold mb-4">4. User Accounts</h2>
                <div className="space-y-3 text-gray-700">
                  <p><strong>4.1 Registration:</strong> You must create an account to access certain features. You agree to provide accurate, current, and complete information during registration.</p>
                  <p><strong>4.2 Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
                  <p><strong>4.3 Account Termination:</strong> We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent activities.</p>
                </div>
              </section>

              <Separator />

              {/* Vendor Obligations */}
              <section>
                <h2 className="text-2xl font-bold mb-4">5. Vendor Obligations</h2>
                <div className="space-y-3 text-gray-700">
                  <p>Vendors agree to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide accurate business information and credentials</li>
                    <li>Maintain required licenses, insurance, and certifications</li>
                    <li>Respond to quote requests in a timely manner</li>
                    <li>Provide quality services as described</li>
                    <li>Honor quoted prices and agreed-upon terms</li>
                    <li>Pay applicable platform fees and commissions</li>
                    <li>Comply with all local, state, and federal regulations</li>
                  </ul>
                </div>
              </section>

              <Separator />

              {/* Customer Obligations */}
              <section>
                <h2 className="text-2xl font-bold mb-4">6. Customer Obligations</h2>
                <div className="space-y-3 text-gray-700">
                  <p>Customers agree to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide accurate project information in quote requests</li>
                    <li>Respond to Vendor communications in a timely manner</li>
                    <li>Allow Vendors reasonable access to complete work</li>
                    <li>Pay agreed-upon fees for completed services</li>
                    <li>Leave honest and accurate reviews</li>
                    <li>Not misuse the Platform or engage in fraudulent activities</li>
                  </ul>
                </div>
              </section>

              <Separator />

              {/* Fees and Payments */}
              <section>
                <h2 className="text-2xl font-bold mb-4">7. Fees and Payments</h2>
                <div className="space-y-3 text-gray-700">
                  <p><strong>7.1 Platform Fees:</strong> We charge Vendors a commission on completed transactions. Current rates are disclosed during registration.</p>
                  <p><strong>7.2 Premium Subscriptions:</strong> Vendors may purchase premium subscriptions for enhanced visibility and features.</p>
                  <p><strong>7.3 Payment Processing:</strong> All payments are processed securely through our third-party payment processors.</p>
                  <p><strong>7.4 Refunds:</strong> Refund requests are handled on a case-by-case basis according to our refund policy.</p>
                </div>
              </section>

              <Separator />

              {/* Prohibited Conduct */}
              <section>
                <h2 className="text-2xl font-bold mb-4">8. Prohibited Conduct</h2>
                <div className="space-y-3 text-gray-700">
                  <p>Users may not:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Use the Platform for illegal purposes</li>
                    <li>Impersonate others or provide false information</li>
                    <li>Harass, threaten, or abuse other users</li>
                    <li>Circumvent Platform fees or payments</li>
                    <li>Post spam, malware, or malicious content</li>
                    <li>Scrape or harvest data from the Platform</li>
                    <li>Violate intellectual property rights</li>
                    <li>Interfere with Platform operations</li>
                  </ul>
                </div>
              </section>

              <Separator />

              {/* Disclaimers */}
              <section>
                <h2 className="text-2xl font-bold mb-4">9. Disclaimers</h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 space-y-3 text-gray-700">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-yellow-600 shrink-0 mt-1" />
                    <div className="space-y-3">
                      <p><strong>9.1 Platform Role:</strong> We provide a marketplace platform connecting Customers and Vendors. We are not a party to the actual service contracts and do not employ Vendors.</p>
                      <p><strong>9.2 Vendor Verification:</strong> While we verify basic Vendor credentials, we do not guarantee the quality, safety, or legality of services provided.</p>
                      <p><strong>9.3 "AS IS" Service:</strong> The Platform is provided "as is" without warranties of any kind, express or implied.</p>
                    </div>
                  </div>
                </div>
              </section>

              <Separator />

              {/* Limitation of Liability */}
              <section>
                <h2 className="text-2xl font-bold mb-4">10. Limitation of Liability</h2>
                <div className="space-y-3 text-gray-700">
                  <p>To the maximum extent permitted by law:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>We are not liable for damages arising from service quality issues</li>
                    <li>Our liability is limited to the fees paid by you in the 12 months prior to the claim</li>
                    <li>We are not responsible for indirect, incidental, or consequential damages</li>
                    <li>Users assume all risks associated with using the Platform</li>
                  </ul>
                </div>
              </section>

              <Separator />

              {/* Dispute Resolution */}
              <section>
                <h2 className="text-2xl font-bold mb-4">11. Dispute Resolution</h2>
                <div className="space-y-3 text-gray-700">
                  <p><strong>11.1 Customer-Vendor Disputes:</strong> Disputes between Customers and Vendors should be resolved directly. We may provide mediation assistance upon request.</p>
                  <p><strong>11.2 Arbitration:</strong> Any disputes with VendorHub shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.</p>
                  <p><strong>11.3 Class Action Waiver:</strong> You agree to resolve disputes individually and waive the right to participate in class actions.</p>
                </div>
              </section>

              <Separator />

              {/* Changes to Terms */}
              <section>
                <h2 className="text-2xl font-bold mb-4">12. Changes to Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify these Terms at any time. Changes will be effective upon posting to the Platform. Continued use of the Platform after changes constitutes acceptance of the modified Terms. Material changes will be communicated via email or Platform notification.
                </p>
              </section>

              <Separator />

              {/* Governing Law */}
              <section>
                <h2 className="text-2xl font-bold mb-4">13. Governing Law</h2>
                <p className="text-gray-700 leading-relaxed">
                  These Terms are governed by the laws of the State of New York, United States, without regard to conflict of law principles. You consent to the exclusive jurisdiction of courts in New York County, New York for any legal proceedings.
                </p>
              </section>

              <Separator />

              {/* Contact */}
              <section>
                <h2 className="text-2xl font-bold mb-4">14. Contact Information</h2>
                <div className="space-y-2 text-gray-700">
                  <p>For questions about these Terms, contact us at:</p>
                  <p><strong>Email:</strong> legal@vendorhub.com</p>
                  <p><strong>Address:</strong> VendorHub Inc., 123 Main Street, New York, NY 10001</p>
                  <p><strong>Phone:</strong> (555) 123-4567</p>
                </div>
              </section>

              {/* Footer Notice */}
              <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-blue-900 mb-2">Your Agreement</p>
                    <p className="text-sm text-blue-800">
                      By using VendorHub, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. Please read our{' '}
                      <Link href="/privacy" className="underline hover:text-blue-600">Privacy Policy</Link>{' '}
                      to understand how we collect and use your information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
