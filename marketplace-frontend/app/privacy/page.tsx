'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, Lock, Eye, Cookie, Users, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: February 4, 2026</p>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                <p className="text-gray-700 leading-relaxed">
                  VendorHub ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Platform. Please read this policy carefully. If you do not agree with the terms of this privacy policy, please do not access the Platform.
                </p>
              </section>

              <Separator />

              {/* Information We Collect */}
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Eye className="w-6 h-6 text-blue-600" />
                  2. Information We Collect
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">2.1 Personal Information</h3>
                    <p className="text-gray-700 mb-2">We collect information you provide directly:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li><strong>Account Information:</strong> Name, email address, phone number, password</li>
                      <li><strong>Profile Information:</strong> Profile photo, business name, bio, service categories</li>
                      <li><strong>Location Data:</strong> Address, city, state, ZIP code, service area</li>
                      <li><strong>Payment Information:</strong> Credit card details, billing address (processed by third-party providers)</li>
                      <li><strong>Communications:</strong> Messages, reviews, quote requests, support inquiries</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">2.2 Automatically Collected Information</h3>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                      <li><strong>Usage Data:</strong> Pages viewed, features used, time spent, click patterns</li>
                      <li><strong>Cookies & Tracking:</strong> Session data, preferences, analytics information</li>
                      <li><strong>Location Information:</strong> Approximate location based on IP address</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">2.3 Information from Third Parties</h3>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>Social media profile information (if you connect accounts)</li>
                      <li>Background check results for vendors</li>
                      <li>Payment processor transaction data</li>
                      <li>Analytics and advertising partner data</li>
                    </ul>
                  </div>
                </div>
              </section>

              <Separator />

              {/* How We Use Your Information */}
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-purple-600" />
                  3. How We Use Your Information
                </h2>
                <div className="space-y-3 text-gray-700">
                  <p>We use your information to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Create and manage your account</li>
                    <li>Connect customers with vendors and facilitate transactions</li>
                    <li>Process payments and prevent fraud</li>
                    <li>Send service updates, quotes, and communications</li>
                    <li>Provide customer support and respond to inquiries</li>
                    <li>Improve and personalize Platform features</li>
                    <li>Conduct analytics and research</li>
                    <li>Send marketing communications (with your consent)</li>
                    <li>Comply with legal obligations</li>
                    <li>Enforce our Terms and Conditions</li>
                  </ul>
                </div>
              </section>

              <Separator />

              {/* Information Sharing */}
              <section>
                <h2 className="text-2xl font-bold mb-4">4. How We Share Your Information</h2>
                <div className="space-y-4 text-gray-700">
                  <p><strong>4.1 With Other Users:</strong> When you request a quote, we share your contact information and project details with vendors. Vendors' business information is visible to customers.</p>
                  
                  <p><strong>4.2 Service Providers:</strong> We share information with third parties who perform services on our behalf:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Payment processors (Stripe, PayPal)</li>
                    <li>Cloud hosting providers (AWS, Google Cloud)</li>
                    <li>Email service providers</li>
                    <li>Analytics providers (Google Analytics)</li>
                    <li>Customer support tools</li>
                  </ul>

                  <p><strong>4.3 Business Transfers:</strong> In connection with mergers, acquisitions, or sale of assets, your information may be transferred.</p>
                  
                  <p><strong>4.4 Legal Requirements:</strong> We may disclose information to comply with laws, regulations, legal processes, or government requests.</p>
                  
                  <p><strong>4.5 With Your Consent:</strong> We may share information for other purposes with your explicit consent.</p>
                </div>
              </section>

              <Separator />

              {/* Data Security */}
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Lock className="w-6 h-6 text-green-600" />
                  5. Data Security
                </h2>
                <div className="space-y-3 text-gray-700">
                  <p>We implement appropriate security measures to protect your information:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Encryption of data in transit (SSL/TLS) and at rest</li>
                    <li>Secure authentication and access controls</li>
                    <li>Regular security audits and vulnerability assessments</li>
                    <li>Employee training on data protection</li>
                    <li>Incident response and breach notification procedures</li>
                  </ul>
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                      <p className="text-sm">
                        <strong>Note:</strong> No method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <Separator />

              {/* Cookies */}
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Cookie className="w-6 h-6 text-orange-600" />
                  6. Cookies and Tracking Technologies
                </h2>
                <div className="space-y-3 text-gray-700">
                  <p>We use cookies and similar technologies to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Remember your preferences and settings</li>
                    <li>Authenticate your account</li>
                    <li>Analyze Platform usage and performance</li>
                    <li>Deliver targeted advertising</li>
                    <li>Prevent fraud and enhance security</li>
                  </ul>
                  <p className="mt-3">You can control cookies through your browser settings. Disabling cookies may limit Platform functionality.</p>
                </div>
              </section>

              <Separator />

              {/* Your Rights */}
              <section>
                <h2 className="text-2xl font-bold mb-4">7. Your Privacy Rights</h2>
                <div className="space-y-3 text-gray-700">
                  <p>You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Access:</strong> Request a copy of your personal information</li>
                    <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                    <li><strong>Deletion:</strong> Request deletion of your information (subject to legal obligations)</li>
                    <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
                    <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                    <li><strong>Object:</strong> Object to certain processing activities</li>
                    <li><strong>Restrict:</strong> Request restriction of processing in certain circumstances</li>
                  </ul>
                  <p className="mt-3">To exercise these rights, contact us at <a href="mailto:privacy@vendorhub.com" className="text-blue-600 hover:underline">privacy@vendorhub.com</a></p>
                </div>
              </section>

              <Separator />

              {/* Data Retention */}
              <section>
                <h2 className="text-2xl font-bold mb-4">8. Data Retention</h2>
                <p className="text-gray-700 leading-relaxed">
                  We retain your personal information for as long as necessary to provide services, comply with legal obligations, resolve disputes, and enforce agreements. Account information is retained while your account is active. After account deletion, we may retain certain information for legal and business purposes (e.g., transaction records, fraud prevention).
                </p>
              </section>

              <Separator />

              {/* Children's Privacy */}
              <section>
                <h2 className="text-2xl font-bold mb-4">9. Children's Privacy</h2>
                <p className="text-gray-700 leading-relaxed">
                  Our Platform is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately, and we will delete it.
                </p>
              </section>

              <Separator />

              {/* International Users */}
              <section>
                <h2 className="text-2xl font-bold mb-4">10. International Data Transfers</h2>
                <p className="text-gray-700 leading-relaxed">
                  Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. By using the Platform, you consent to the transfer of your information to the United States and other countries where we operate.
                </p>
              </section>

              <Separator />

              {/* GDPR & CCPA */}
              <section>
                <h2 className="text-2xl font-bold mb-4">11. GDPR & CCPA Compliance</h2>
                <div className="space-y-3 text-gray-700">
                  <p><strong>For EU Users (GDPR):</strong></p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>We process data based on consent, contract, legal obligation, or legitimate interest</li>
                    <li>You have enhanced rights including data portability and right to be forgotten</li>
                    <li>You may lodge complaints with supervisory authorities</li>
                  </ul>
                  
                  <p className="mt-4"><strong>For California Residents (CCPA):</strong></p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Right to know what personal information is collected</li>
                    <li>Right to delete personal information</li>
                    <li>Right to opt-out of sale of personal information (we do not sell your data)</li>
                    <li>Right to non-discrimination for exercising privacy rights</li>
                  </ul>
                </div>
              </section>

              <Separator />

              {/* Changes to Policy */}
              <section>
                <h2 className="text-2xl font-bold mb-4">12. Changes to This Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy periodically. Changes will be posted on this page with an updated "Last Updated" date. Material changes will be communicated via email or Platform notification. Continued use after changes constitutes acceptance of the updated policy.
                </p>
              </section>

              <Separator />

              {/* Contact */}
              <section>
                <h2 className="text-2xl font-bold mb-4">13. Contact Us</h2>
                <div className="space-y-2 text-gray-700">
                  <p>For privacy-related questions or to exercise your rights:</p>
                  <p><strong>Email:</strong> privacy@vendorhub.com</p>
                  <p><strong>Address:</strong> VendorHub Inc., 123 Main Street, New York, NY 10001</p>
                  <p><strong>Phone:</strong> (555) 123-4567</p>
                  <p><strong>Data Protection Officer:</strong> dpo@vendorhub.com</p>
                </div>
              </section>

              {/* Footer Notice */}
              <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-green-900 mb-2">Your Privacy Matters</p>
                    <p className="text-sm text-green-800">
                      We are committed to protecting your privacy and handling your data responsibly. By using VendorHub, you acknowledge that you have read and understood this Privacy Policy. For more information about our platform, please review our{' '}
                      <Link href="/terms" className="underline hover:text-green-600">Terms & Conditions</Link>.
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
