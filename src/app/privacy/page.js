// app/privacy/page.js
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Shield, Mail, MapPin, Phone } from 'lucide-react';

const PrivacyPolicy = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = [
    {
      id: 'introduction',
      title: '1. Introduction',
      content: 'House of Transformation is committed to protecting your privacy and handling your personal data responsibly in compliance with the Data Protection Act, 2019 (Kenya). This Privacy Policy explains how we collect, use, store, share, and protect your personal information.',
    },
    {
      id: 'data-controller',
      title: '2. Data Controller Information',
      content: (
        <div className="space-y-3">
          <p><strong>Data Controller:</strong> House of Transformation, Busia, Kenya</p>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>privacy@houseoftransformation.org</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>[Insert Church Phone Number]</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>[Insert Church Address], Busia, Kenya</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">For any data protection queries, contact our Data Protection Officer at the above email.</p>
        </div>
      ),
    },
    {
      id: 'personal-data',
      title: '3. Personal Data We Collect',
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">3.1 Information You Provide Directly</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>Identity Information:</strong> Full name, date of birth, gender, profile photograph</li>
              <li><strong>Contact Information:</strong> Email, phone number, postal address</li>
              <li><strong>Account Information:</strong> Username, encrypted password, membership ID</li>
              <li><strong>Financial Information:</strong> Donation history, pledge records, payment details</li>
              <li><strong>Ministry Participation:</strong> Volunteer applications, service attendance</li>
              <li><strong>Communication Data:</strong> Messages, prayer requests, feedback, testimonies</li>
              <li><strong>Special Category Data:</strong> Religious beliefs, health information (with consent)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">3.2 Information Collected Automatically</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>Technical Data:</strong> IP address, browser type, device type, operating system</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent, click patterns, session duration</li>
              <li><strong>Location Data:</strong> General geographic location based on IP</li>
              <li><strong>Cookies:</strong> Tracking technologies for improved service</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'data-usage',
      title: '4. How We Use Your Personal Data',
      content: (
        <div className="space-y-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border-l-4 border-blue-600 dark:border-blue-400">
            <strong>Service Provision:</strong> Account creation, member portal access, donation processing, event registration
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border-l-4 border-green-600 dark:border-green-400">
            <strong>Communication:</strong> Announcements, newsletters, church updates, pastoral care
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded border-l-4 border-purple-600 dark:border-purple-400">
            <strong>Ministry Operations:</strong> Volunteer management, activity coordination, membership records
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded border-l-4 border-orange-600 dark:border-orange-400">
            <strong>Improvement:</strong> Analytics, user experience optimization, feedback gathering
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border-l-4 border-red-600 dark:border-red-400">
            <strong>Legal & Compliance:</strong> Legal obligations, fraud protection, security threats
          </div>
        </div>
      ),
    },
    {
      id: 'legal-basis',
      title: '5. Legal Basis for Processing',
      content: (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">Purpose</th>
                <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">Legal Basis</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="border border-gray-300 dark:border-gray-700 p-3">Account management, donations</td>
                <td className="border border-gray-300 dark:border-gray-700 p-3">Contract - Services you requested</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="border border-gray-300 dark:border-gray-700 p-3">Communications, newsletters</td>
                <td className="border border-gray-300 dark:border-gray-700 p-3">Consent - Explicit agreement</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="border border-gray-300 dark:border-gray-700 p-3">Legal compliance, records</td>
                <td className="border border-gray-300 dark:border-gray-700 p-3">Legal Obligation - Required by law</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="border border-gray-300 dark:border-gray-700 p-3">Service improvement, security</td>
                <td className="border border-gray-300 dark:border-gray-700 p-3">Legitimate Interests</td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
    },
    {
      id: 'data-sharing',
      title: '6. Data Sharing and Disclosure',
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">6.1 Service Providers</h4>
            <p className="text-gray-700 dark:text-gray-300 mb-2">We share data with trusted third-party service providers:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>Hosting:</strong> Vercel, Supabase</li>
              <li><strong>Payment Processing:</strong> M-Pesa, Paystack (or your provider)</li>
              <li><strong>Email Services:</strong> Your email provider</li>
              <li><strong>Analytics:</strong> Google Analytics (anonymized)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">6.2 Legal Requirements</h4>
            <p className="text-gray-700 dark:text-gray-300">We may disclose information when required by law, including court orders, subpoenas, and lawful government requests.</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border-l-4 border-yellow-600 dark:border-yellow-400">
            <strong>Important:</strong> We do NOT sell, rent, or lease your data to third parties for marketing purposes.
          </div>
        </div>
      ),
    },
    {
      id: 'data-security',
      title: '7. Data Security',
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              Technical Safeguards
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>Encryption in transit (TLS/SSL) and at rest (AES-256)</li>
              <li>Secure password hashing and multi-factor authentication</li>
              <li>Role-based access controls</li>
              <li>SOC 2 compliant infrastructure</li>
              <li>Supabase Row Level Security (RLS) policies</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Organizational Measures</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>Regular security audits and vulnerability assessments</li>
              <li>Staff data protection training</li>
              <li>Confidentiality agreements with all personnel</li>
              <li>Incident response and breach notification procedures</li>
              <li>Secure encrypted backups</li>
            </ul>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border-l-4 border-blue-600 dark:border-blue-400">
            <strong>Breach Notification:</strong> In case of a breach, we will notify you within 72 hours and report to the Office of the Data Protection Commissioner.
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-blue-100 text-lg">House of Transformation - Busia, Kenya</p>
          <p className="text-blue-200 text-sm mt-2">Last Updated: January 17, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <p className="text-gray-800 dark:text-gray-200">
            By using our Services, you acknowledge that you have read and understood this Privacy Policy and consent to the collection and processing of your personal data as described herein.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 px-6 py-4 flex items-center justify-between transition-colors"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-left">
                  {section.title}
                </h2>
                {expandedSection === section.id ? (
                  <ChevronUp className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                )}
              </button>

              {expandedSection === section.id && (
                <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 space-y-3">
                  {section.content}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Continue to Section B Notice */}
        <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Continue reading the rest of the Privacy Policy
          </p>
          <Link href="#section-b" className="inline-block bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            View Section B (Sections 8-19)
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;