// app/privacy/page-section-b.js
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Lock, Trash2, Users, AlertCircle, CheckCircle } from 'lucide-react';

const PrivacySectionB = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = [
    {
      id: 'data-retention',
      title: '8. Data Retention',
      content: (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">Data Type</th>
                  <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">Retention Period</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="border border-gray-300 dark:border-gray-700 p-3">Active member accounts</td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">Duration + 2 years</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="border border-gray-300 dark:border-gray-700 p-3">Donation records</td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">7 years (tax compliance)</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="border border-gray-300 dark:border-gray-700 p-3">Communication history</td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">3 years or consent withdrawal</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="border border-gray-300 dark:border-gray-700 p-3">Inactive accounts</td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">12 months, then anonymized</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="border border-gray-300 dark:border-gray-700 p-3">Volunteer applications</td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">2 years from application</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="border border-gray-300 dark:border-gray-700 p-3">Website analytics</td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">26 months (anonymized)</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="border border-gray-300 dark:border-gray-700 p-3">Security logs</td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">12 months</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            After retention periods, data is securely deleted or anonymized. You may request earlier deletion by contacting us (subject to legal obligations).
          </p>
        </div>
      ),
    },
    {
      id: 'cookies',
      title: '9. Cookies and Tracking Technologies',
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">9.1 Types of Cookies</h4>
            <div className="space-y-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border-l-4 border-blue-600 dark:border-blue-400">
                <div className="font-semibold text-gray-900 dark:text-white">Essential Cookies</div>
                <p className="text-sm text-gray-700 dark:text-gray-300">Enable authentication and security - Session or 1 year</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border-l-4 border-green-600 dark:border-green-400">
                <div className="font-semibold text-gray-900 dark:text-white">Functional Cookies</div>
                <p className="text-sm text-gray-700 dark:text-gray-300">Remember preferences and settings - 1 year</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded border-l-4 border-purple-600 dark:border-purple-400">
                <div className="font-semibold text-gray-900 dark:text-white">Analytics Cookies</div>
                <p className="text-sm text-gray-700 dark:text-gray-300">Understand site usage (anonymized) - 26 months</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded border-l-4 border-orange-600 dark:border-orange-400">
                <div className="font-semibold text-gray-900 dark:text-white">Performance Cookies</div>
                <p className="text-sm text-gray-700 dark:text-gray-300">Monitor and improve performance - Session</p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">9.2 Managing Cookies</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>Control cookies through your browser settings</li>
              <li>Use our cookie consent banner (opt in/out)</li>
              <li>Use third-party opt-out tools (e.g., Google Analytics)</li>
            </ul>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-3 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
              Note: Disabling essential cookies may affect portal functionality.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'user-rights',
      title: '10. Your Rights Under Kenyan Law',
      content: (
        <div className="space-y-3">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-600 dark:border-green-400">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-white">Right of Access</h5>
                <p className="text-sm text-gray-700 dark:text-gray-300">Request a copy of all personal data we hold about you.</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-600 dark:border-green-400">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-white">Right to Rectification</h5>
                <p className="text-sm text-gray-700 dark:text-gray-300">Correct inaccurate or incomplete personal information.</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-600 dark:border-green-400">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-white">Right to Erasure</h5>
                <p className="text-sm text-gray-700 dark:text-gray-300">Request deletion of your data (subject to legal retention requirements).</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-600 dark:border-green-400">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-white">Right to Restrict Processing</h5>
                <p className="text-sm text-gray-700 dark:text-gray-300">Limit how we use your data in certain circumstances.</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-600 dark:border-green-400">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-white">Right to Data Portability</h5>
                <p className="text-sm text-gray-700 dark:text-gray-300">Receive your data in a structured, machine-readable format.</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-600 dark:border-green-400">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-white">Right to Object</h5>
                <p className="text-sm text-gray-700 dark:text-gray-300">Object to processing based on legitimate interests or marketing.</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-600 dark:border-green-400">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-white">Right to Withdraw Consent</h5>
                <p className="text-sm text-gray-700 dark:text-gray-300">Withdraw consent anytime where processing is based on consent.</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border-l-4 border-red-600 dark:border-red-400">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-white">Right to Lodge a Complaint</h5>
                <p className="text-sm text-gray-700 dark:text-gray-300">File a complaint with the Office of the Data Protection Commissioner (www.odpc.go.ke)</p>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-600 dark:border-blue-400">
            <h5 className="font-semibold text-gray-900 dark:text-white mb-2">How to Exercise Your Rights</h5>
            <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>Email privacy@houseoftransformation.org</li>
              <li>Include your full name and registered email</li>
              <li>Specify which right(s) you wish to exercise</li>
              <li>We will respond within 30 days</li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: 'international-transfers',
      title: '11. International Data Transfers',
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Data Storage Locations</h4>
            <p className="text-gray-700 dark:text-gray-300 mb-2">Your data may be processed and stored:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>Within Kenya</li>
              <li>In data centers operated by service providers (Vercel, Supabase)</li>
              <li>United States (Privacy Shield compliant)</li>
              <li>European Union member states</li>
            </ul>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border-l-4 border-blue-600 dark:border-blue-400">
            <strong>Safeguards:</strong> Standard contractual clauses, GDPR compliance where applicable, and regular audits ensure adequate protection.
          </div>
        </div>
      ),
    },
    {
      id: 'children-privacy',
      title: '12. Children\'s Privacy',
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded border-l-4 border-yellow-600 dark:border-yellow-400">
            <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Age Requirements</h5>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              Our Services are not directed at children under 13. We do not knowingly collect data from children under 13 without parental consent. For ages 13-17, parental consent is required.
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded border-l-4 border-blue-600 dark:border-blue-400">
            <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Parental Rights</h5>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              Parents may review, modify, or delete their child's information. If we discover unauthorized collection from a child under 13, we delete immediately and notify the parent.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'special-category',
      title: '13. Special Category Data',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            We may process special category data with your explicit consent, including:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
            <li>Religious or philosophical beliefs</li>
            <li>Health information (for pastoral care)</li>
            <li>Biometric data (facial recognition for attendance)</li>
          </ul>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded border-l-4 border-purple-600 dark:border-purple-400">
            <strong>Additional Protections:</strong> Enhanced security, limited access, and separate consent requirements apply.
          </div>
        </div>
      ),
    },
    {
      id: 'automated-decision',
      title: '14. Automated Decision-Making',
      content: (
        <p className="text-gray-700 dark:text-gray-300">
          We do not use automated decision-making or profiling that produces legal effects. Automated processing is limited to technical optimization, service improvement, and non-consequential personalization.
        </p>
      ),
    },
    {
      id: 'third-party-links',
      title: '15. Third-Party Links',
      content: (
        <p className="text-gray-700 dark:text-gray-300">
          Our website may contain links to external sites not operated by us. We are not responsible for their privacy practices. We encourage you to review third-party privacy policies before providing information.
        </p>
      ),
    },
    {
      id: 'policy-changes',
      title: '16. Changes to This Privacy Policy',
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">When We Update</h4>
            <p className="text-gray-700 dark:text-gray-300">
              We may update this Policy to reflect changes in practices, new legal requirements, service improvements, or member feedback.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Notification</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>Updated "Last Updated" date</li>
              <li>Email or prominent website notice</li>
              <li>For significant changes, renewed consent may be requested</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'data-principles',
      title: '17. Data Protection Principles',
      content: (
        <div className="space-y-2">
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            We adhere to the following principles from the Data Protection Act, 2019:
          </p>
          <div className="space-y-2">
            <div className="flex gap-3">
              <span className="bg-blue-600 dark:bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">1</span>
              <p className="text-gray-700 dark:text-gray-300"><strong>Lawfulness, Fairness & Transparency</strong></p>
            </div>
            <div className="flex gap-3">
              <span className="bg-blue-600 dark:bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">2</span>
              <p className="text-gray-700 dark:text-gray-300"><strong>Purpose Limitation</strong></p>
            </div>
            <div className="flex gap-3">
              <span className="bg-blue-600 dark:bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">3</span>
              <p className="text-gray-700 dark:text-gray-300"><strong>Data Minimization</strong></p>
            </div>
            <div className="flex gap-3">
              <span className="bg-blue-600 dark:bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">4</span>
              <p className="text-gray-700 dark:text-gray-300"><strong>Accuracy</strong></p>
            </div>
            <div className="flex gap-3">
              <span className="bg-blue-600 dark:bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">5</span>
              <p className="text-gray-700 dark:text-gray-300"><strong>Storage Limitation</strong></p>
            </div>
            <div className="flex gap-3">
              <span className="bg-blue-600 dark:bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">6</span>
              <p className="text-gray-700 dark:text-gray-300"><strong>Integrity & Confidentiality</strong></p>
            </div>
            <div className="flex gap-3">
              <span className="bg-blue-600 dark:bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">7</span>
              <p className="text-gray-700 dark:text-gray-300"><strong>Accountability</strong></p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'contact-us',
      title: '18. Contact Us',
      content: (
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Privacy Questions</h5>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                Email: privacy@houseoftransformation.org
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                Phone: [Insert Church Phone Number]
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Address: House of Transformation, [Full Address], Busia, Kenya
              </p>
            </div>

            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Data Protection Officer</h5>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Email: dpo@houseoftransformation.org
              </p>
            </div>

            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">General Inquiries</h5>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                Email: info@houseoftransformation.org
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Website: houseoftransformation-nextjs.vercel.app
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'consent',
      title: '19. Consent & Final Note',
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-600 dark:border-green-400">
            <h5 className="font-semibold text-gray-900 dark:text-white mb-2">By Using Our Services, You Confirm:</h5>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>You have read and understood this Privacy Policy</li>
              <li>You consent to data collection and processing as described</li>
              <li>You are at least 13 years old (or have parental consent)</li>
              <li>All information provided is accurate and truthful</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-600 dark:border-blue-400">
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              <strong>Governance:</strong> This Privacy Policy is governed by the laws of Kenya. House of Transformation reserves the right to modify this policy in accordance with applicable law.
            </p>
          </div>

          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Last reviewed: January 17, 2026
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold">Privacy Policy - Continued</h1>
          <p className="text-blue-100">Sections 8-19</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
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

        {/* Footer */}
        <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Privacy Policy Complete</h3>
          <p className="text-gray-700 dark:text-gray-300">
            If you have any questions, please contact us at{' '}
            <a href="mailto:privacy@houseoftransformation.org" className="text-blue-600 dark:text-blue-400 hover:underline">
              privacy@houseoftransformation.org
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacySectionB;