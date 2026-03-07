//"use client";

import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, ChevronRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Terms and Conditions | House of Transformation Church",
  description:
    "Read the Terms and Conditions governing your use of the House of Transformation Church digital platform, including membership portal, donations, and event registration.",
  keywords: ["terms and conditions", "House of Transformation", "church platform", "legal", "Busia Kenya"],
  openGraph: {
    title: "Terms and Conditions | House of Transformation Church",
    description: "Terms and conditions for the HOT Church digital platform.",
    url: "https://houseoftransformation-nextjs.vercel.app/terms",
  },
};

const LAST_UPDATED = "January 1, 2025";
const EFFECTIVE_DATE = "January 1, 2025";
const CHURCH_NAME = "House of Transformation Church";
const CHURCH_LOCATION = "Busia County, Kenya";
const PLATFORM_URL = "https://houseoftransformation-nextjs.vercel.app";
const CONTACT_EMAIL = "info@houseoftransformation.org";

const TOC = [
  { id: "introduction", label: "Introduction" },
  { id: "definitions", label: "Definitions" },
  { id: "acceptance", label: "Acceptance of Terms" },
  { id: "platform-description", label: "Platform Description" },
  { id: "user-responsibilities", label: "User Responsibilities" },
  { id: "acceptable-use", label: "Acceptable Use Policy" },
  { id: "account-security", label: "Account Registration & Security" },
  { id: "donations-payments", label: "Donations & Payments" },
  { id: "content-ownership", label: "Content Ownership" },
  { id: "intellectual-property", label: "Intellectual Property" },
  { id: "privacy-reference", label: "Privacy Reference" },
  { id: "limitation-liability", label: "Limitation of Liability" },
  { id: "termination", label: "Termination of Access" },
  { id: "changes-terms", label: "Changes to Terms" },
  { id: "governing-law", label: "Governing Law" },
  { id: "contact", label: "Contact Information" },
];

function SectionHeading({ id, children }) {
  return (
    <h2
      id={id}
      className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mt-10 mb-4 scroll-mt-24 flex items-center gap-2"
    >
      <span className="w-1 h-5 bg-red-700 rounded-full inline-block shrink-0" />
      {children}
    </h2>
  );
}

function SubHeading({ children }) {
  return (
    <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200 mt-6 mb-2">
      {children}
    </h3>
  );
}

function Prose({ children }) {
  return (
    <p className="text-[15px] leading-7 text-neutral-600 dark:text-neutral-400 mb-4">
      {children}
    </p>
  );
}

function UList({ items }) {
  return (
    <ul className="mb-4 space-y-1.5 ml-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-[15px] leading-7 text-neutral-600 dark:text-neutral-400">
          <ChevronRight className="w-3.5 h-3.5 mt-1.5 shrink-0 text-red-700" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Hero */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-red-700" />
            </div>
            <Badge variant="outline" className="text-xs text-neutral-500 border-neutral-300">
              Legal Document
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight mb-3">
            Terms &amp; Conditions
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            Last updated: <span className="font-medium text-neutral-700 dark:text-neutral-300">{LAST_UPDATED}</span>
            &nbsp;&middot;&nbsp;
            Effective: <span className="font-medium text-neutral-700 dark:text-neutral-300">{EFFECTIVE_DATE}</span>
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">

          {/* Table of Contents */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Card className="border-neutral-200 dark:border-neutral-800 shadow-none">
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3 px-1">
                  Table of Contents
                </p>
                <ScrollArea className="h-auto max-h-[70vh]">
                  <nav className="space-y-0.5">
                    {TOC.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-colors"
                      >
                        <ChevronRight className="w-3 h-3 shrink-0 text-neutral-300 dark:text-neutral-600" />
                        {item.label}
                      </a>
                    ))}
                  </nav>
                </ScrollArea>
              </CardContent>
            </Card>
          </aside>

          {/* Content */}
          <main>
            <Card className="border-neutral-200 dark:border-neutral-800 shadow-none">
              <CardContent className="p-6 sm:p-8">

                {/* Introduction */}
                <SectionHeading id="introduction">Introduction</SectionHeading>
                <Prose>
                  Welcome to the {CHURCH_NAME} digital platform (the &quot;Platform&quot;), operated by {CHURCH_NAME}, a Christian ministry based in {CHURCH_LOCATION}. These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of our website located at{" "}
                  <a href={PLATFORM_URL} className="text-red-700 underline underline-offset-2">
                    {PLATFORM_URL}
                  </a>
                  , including all related services, features, content, and functionality offered by the Platform.
                </Prose>
                <Prose>
                  By accessing or using the Platform, you agree to be bound by these Terms in their entirety. If you do not agree with any part of these Terms, please discontinue use of the Platform immediately. These Terms constitute a legally binding agreement between you and {CHURCH_NAME}.
                </Prose>

                <Separator className="my-6" />

                {/* Definitions */}
                <SectionHeading id="definitions">Definitions</SectionHeading>
                <Prose>
                  For the purposes of these Terms, the following definitions apply:
                </Prose>
                <UList items={[
                  '"Platform" refers to the House of Transformation Church website, member portal, and all associated digital services.',
                  '"Church" or "We" or "Us" refers to House of Transformation Church, Busia County, Kenya.',
                  '"User", "You", or "Member" refers to any individual accessing or using the Platform.',
                  '"Portal" refers to the authenticated member area accessible at /portal, providing access to management and ministry features.',
                  '"Content" refers to all text, images, sermons, blog posts, videos, testimonies, and other materials available on the Platform.',
                  '"Account" refers to the registered user profile created using Supabase authentication (email/password or Google OAuth).',
                  '"Donation" refers to any financial contribution made through the Platform, including tithes, offerings, and campaign pledges.',
                  '"M-Pesa" refers to the mobile money payment service provided by Safaricom, integrated into the Platform for donation processing.',
                  '"Role" refers to the assigned permission tier (e.g., member, admin, usher) that governs a user\'s access level on the Platform.',
                ]} />

                <Separator className="my-6" />

                {/* Acceptance */}
                <SectionHeading id="acceptance">Acceptance of Terms</SectionHeading>
                <Prose>
                  By creating an account, registering for events, submitting forms, making donations, or otherwise using the Platform, you confirm that:
                </Prose>
                <UList items={[
                  "You are at least 18 years of age, or are accessing the Platform under the supervision of a parent or guardian.",
                  "You have the legal capacity to enter into a binding agreement.",
                  "You have read, understood, and agree to be bound by these Terms and our Privacy Policy.",
                  "You will comply with all applicable local, national, and international laws and regulations.",
                  "The information you provide during registration or form submission is accurate, current, and complete.",
                ]} />
                <Prose>
                  These Terms apply in addition to any specific terms applicable to individual services, campaigns, or features of the Platform.
                </Prose>

                <Separator className="my-6" />

                {/* Platform Description */}
                <SectionHeading id="platform-description">Platform Description</SectionHeading>
                <Prose>
                  The House of Transformation Church Platform is a comprehensive church engagement and management system designed to serve both public visitors and authenticated church members. The Platform provides the following services:
                </Prose>
                <SubHeading>Public Services</SubHeading>
                <UList items={[
                  "Sermon archive with text and media content, including likes and bookmarks.",
                  "Event listings and online seat registration for church services and programs.",
                  "Donation campaigns with M-Pesa STK Push, Paybill/Till payment options, and bank transfer details.",
                  "Church gallery with photo browsing and category filtering.",
                  "Blog posts covering ministry news, devotionals, and church updates.",
                  "Livestream integration (YouTube and Facebook) with live/offline detection.",
                  "Volunteer application portal for ministry departments.",
                  "Feedback and testimony submission across five categories: Sermon, Service Experience, Testimony, Suggestion, and Prayer Request.",
                  "AI-powered chatbot for visitor assistance and navigation.",
                  "Service areas and ministry directory.",
                ]} />
                <SubHeading>Member Portal Services</SubHeading>
                <UList items={[
                  "Role-based access to content management tools (blog, sermons, events, gallery, livestream).",
                  "Analytics dashboard covering user engagement, content performance, financial, and system data.",
                  "Donation management including campaign creation, pledge tracking, M-Pesa payment verification, and donation analytics.",
                  "Feedback moderation: view, respond, archive, publish testimonies.",
                  "Announcement system with real-time delivery via Server-Sent Events (SSE).",
                  "Role and permission management for church administrators.",
                  "Email notification system for targeted or broadcast communications.",
                  "Profile management with avatar upload and account settings.",
                ]} />

                <Separator className="my-6" />

                {/* User Responsibilities */}
                <SectionHeading id="user-responsibilities">User Responsibilities</SectionHeading>
                <Prose>
                  As a user of the Platform, you agree to assume the following responsibilities:
                </Prose>
                <SubHeading>Account Integrity</SubHeading>
                <UList items={[
                  "You are solely responsible for all activity that occurs under your account.",
                  "You must immediately notify the Church of any unauthorized use of your account or any other security breach.",
                  "You may not share your login credentials with other individuals.",
                  "You must keep your contact information, including email address, accurate and up to date.",
                ]} />
                <SubHeading>Content Conduct</SubHeading>
                <UList items={[
                  "All content you submit — including feedback, testimonies, volunteer applications, and blog posts — must be truthful, respectful, and consistent with Christian values.",
                  "You must not submit content that is defamatory, abusive, hateful, or violates the rights of any third party.",
                  "You are responsible for ensuring that any content you upload does not infringe copyright or intellectual property rights.",
                  "Content submitted through feedback or testimony forms may be moderated, archived, or published by authorised staff in accordance with the Privacy Policy.",
                ]} />

                <Separator className="my-6" />

                {/* Acceptable Use */}
                <SectionHeading id="acceptable-use">Acceptable Use Policy</SectionHeading>
                <Prose>
                  Users are prohibited from using the Platform for any purpose that is unlawful, harmful, or contrary to the mission and values of the Church. The following activities are strictly prohibited:
                </Prose>
                <UList items={[
                  "Attempting to gain unauthorized access to any part of the Platform, the backend API, or other users' accounts.",
                  "Submitting false, misleading, or fraudulent information, including fake event registrations or donation records.",
                  "Using automated tools, bots, scrapers, or scripts to extract data from the Platform without written permission.",
                  "Circumventing, disabling, or interfering with security-related features, including authentication and permission controls.",
                  "Uploading malicious software, viruses, or any code designed to harm the Platform or its users.",
                  "Using the Platform to harass, threaten, or intimidate any person, including other members or church staff.",
                  "Misrepresenting your identity, role, or affiliation with the Church.",
                  "Using the Platform to conduct unauthorized commercial activities or advertising.",
                  "Exploiting the M-Pesa payment integration to initiate fraudulent or unauthorized transactions.",
                  "Attempting to reverse-engineer, modify, or create derivative works of any Platform technology.",
                ]} />
                <Prose>
                  Violations of this policy may result in immediate suspension or termination of your account, and may be reported to the relevant authorities where applicable.
                </Prose>

                <Separator className="my-6" />

                {/* Account Security */}
                <SectionHeading id="account-security">Account Registration &amp; Security</SectionHeading>
                <Prose>
                  Account registration is powered by Supabase Authentication and supports both email/password and Google OAuth sign-in methods.
                </Prose>
                <SubHeading>Registration</SubHeading>
                <UList items={[
                  "You must provide a valid email address during registration. Email verification may be required before full account access is granted.",
                  "New accounts are automatically assigned the \"member\" role with standard permissions. Elevated roles must be granted by an administrator.",
                  "Account creation may be rate-limited to prevent spam. Repeated failed registration attempts may result in a temporary block.",
                ]} />
                <SubHeading>Authentication &amp; Sessions</SubHeading>
                <UList items={[
                  "Authentication tokens (JWTs) are stored in your browser's local storage and mirrored to a secure SameSite cookie.",
                  "Tokens are automatically refreshed to maintain active sessions. If a refresh fails, you will be logged out and prompted to sign in again.",
                  "For security, tokens are validated locally before each API request. Tokens expiring within 60 seconds are proactively refreshed.",
                ]} />
                <SubHeading>Account Suspension &amp; Bans</SubHeading>
                <UList items={[
                  "The Church reserves the right to suspend or permanently ban any account that violates these Terms.",
                  "Banned users are removed from the authentication system, and their email address is recorded to prevent re-registration.",
                  "Administrative actions, including bans, are logged in the system audit trail.",
                ]} />

                <Separator className="my-6" />

                {/* Donations */}
                <SectionHeading id="donations-payments">Donations &amp; Payments</SectionHeading>
                <Prose>
                  The Platform facilitates charitable donations to {CHURCH_NAME} through multiple payment methods. All donations are voluntary and support the ministry and operations of the Church.
                </Prose>
                <SubHeading>Payment Methods</SubHeading>
                <UList items={[
                  "M-Pesa STK Push: Initiates a payment prompt directly on your registered M-Pesa phone. You authorize the transaction by entering your M-Pesa PIN.",
                  "M-Pesa Paybill / Till: Manual payments made directly via M-Pesa using the displayed Paybill number, Till number, and account reference.",
                  "Bank Transfer: Donations can be made via direct bank deposit using the Church's official bank account details displayed on the Platform.",
                ]} />
                <SubHeading>M-Pesa Integration</SubHeading>
                <UList items={[
                  "M-Pesa payments are processed through the Safaricom Daraja API (Lipa Na M-Pesa Online / STK Push).",
                  "To prevent duplicate charges, each payment request requires a unique Idempotency Key. You should not retry a payment until you have confirmed that the initial request has failed.",
                  "M-Pesa callbacks from Safaricom are verified by the platform before any payment is recorded as successful.",
                  "The Church does not store your M-Pesa PIN. All payment authentication is handled directly by Safaricom.",
                ]} />
                <SubHeading>Donation Campaigns &amp; Pledges</SubHeading>
                <UList items={[
                  "Donation campaigns have defined start and end dates. Contributions made after a campaign end date may be recorded as general offerings.",
                  "Pledges represent a commitment to donate a specified amount. Pledge fulfillment reminders may be sent via email.",
                  "All donations are recorded and may be accessible to authorized church administrators for reporting and accountability purposes.",
                ]} />
                <SubHeading>Refund Policy</SubHeading>
                <Prose>
                  Due to the nature of charitable donations, all completed transactions are generally non-refundable. If you believe an error has occurred — such as a duplicate charge — please contact the Church at{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-red-700 underline underline-offset-2">
                    {CONTACT_EMAIL}
                  </a>{" "}
                  within 7 days of the transaction with your M-Pesa transaction code or receipt. The Church will review each case individually and in good faith.
                </Prose>

                <Separator className="my-6" />

                {/* Content Ownership */}
                <SectionHeading id="content-ownership">Content Ownership</SectionHeading>
                <SubHeading>Church-Owned Content</SubHeading>
                <Prose>
                  All sermons, blog posts, gallery images, livestream recordings, announcements, and other content created or published by the Church or its authorized staff remain the exclusive property of {CHURCH_NAME}. Such content is protected by applicable copyright and intellectual property laws.
                </Prose>
                <SubHeading>User-Submitted Content</SubHeading>
                <Prose>
                  When you submit content to the Platform — including feedback, testimonies, volunteer applications, blog posts (for authorised contributors), or profile information — you grant {CHURCH_NAME} a non-exclusive, royalty-free, worldwide license to use, display, reproduce, and distribute such content in connection with the Church's ministry activities, both online and offline.
                </Prose>
                <Prose>
                  You retain ownership of any original content you submit. However, you represent and warrant that you have the right to grant the above license and that your content does not violate any third-party rights.
                </Prose>
                <SubHeading>Testimonies</SubHeading>
                <Prose>
                  Submitted testimonies that are approved and published by authorized staff may appear publicly on the Platform. You may request removal of a published testimony by contacting the Church in writing. Removal requests will be processed within a reasonable timeframe.
                </Prose>

                <Separator className="my-6" />

                {/* Intellectual Property */}
                <SectionHeading id="intellectual-property">Intellectual Property</SectionHeading>
                <Prose>
                  The Platform, including its design, codebase, user interface, logos, and all original content, is proprietary to {CHURCH_NAME} and its developers. All rights are reserved unless explicitly stated otherwise.
                </Prose>
                <UList items={[
                  "You may not copy, reproduce, distribute, or create derivative works from any part of the Platform without prior written permission from the Church.",
                  "The Church name, logo, and associated branding may not be used in any context — online or offline — without express written authorization.",
                  "Links to the Platform's public pages are permitted for non-commercial, ministry-related purposes, provided they are not framed or presented in a misleading manner.",
                  "Third-party trademarks, including M-Pesa (Safaricom), Google (Google OAuth), YouTube, and Facebook, remain the property of their respective owners.",
                ]} />

                <Separator className="my-6" />

                {/* Privacy Reference */}
                <SectionHeading id="privacy-reference">Privacy Reference</SectionHeading>
                <Prose>
                  Your use of the Platform is also governed by our{" "}
                  <Link href="/privacy" className="text-red-700 underline underline-offset-2 font-medium">
                    Privacy Policy
                  </Link>
                  , which describes how we collect, use, store, and protect your personal data. By accepting these Terms, you also acknowledge and accept the Privacy Policy.
                </Prose>
                <Prose>
                  Key data practices include the collection of account information, usage analytics via Vercel Analytics, event registration details, donation records, and optional feedback submissions. Personal data is handled in accordance with applicable Kenyan data protection laws.
                </Prose>

                <Separator className="my-6" />

                {/* Limitation of Liability */}
                <SectionHeading id="limitation-liability">Limitation of Liability</SectionHeading>
                <Prose>
                  To the fullest extent permitted by applicable law, {CHURCH_NAME}, its leadership, staff, volunteers, and developers shall not be liable for:
                </Prose>
                <UList items={[
                  "Any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform.",
                  "Loss of data, loss of revenue, or loss of goodwill resulting from Platform downtime, errors, or security incidents.",
                  "Unauthorized access to or alteration of your account or transmissions.",
                  "Any third-party content, links, or services accessible through the Platform.",
                  "Payment failures, delays, or errors arising from M-Pesa, banking systems, or third-party payment processors.",
                  "Technical interruptions, including server outages, maintenance periods, or service updates.",
                ]} />
                <Prose>
                  The Platform is provided on an &quot;as is&quot; and &quot;as available&quot; basis without any warranties of any kind, express or implied. The Church does not warrant that the Platform will be uninterrupted, error-free, or free of viruses or other harmful components.
                </Prose>

                <Separator className="my-6" />

                {/* Termination */}
                <SectionHeading id="termination">Termination of Access</SectionHeading>
                <Prose>
                  The Church reserves the right to suspend, restrict, or permanently terminate your access to the Platform at any time, with or without notice, for any of the following reasons:
                </Prose>
                <UList items={[
                  "Violation of these Terms or the Acceptable Use Policy.",
                  "Conduct that is harmful, disruptive, or contrary to the values of the Church community.",
                  "Submission of fraudulent information or misrepresentation of identity.",
                  "Court orders, legal obligations, or requests from law enforcement authorities.",
                  "Extended inactivity, at the Church's discretion.",
                ]} />
                <Prose>
                  You may also delete your own account through the Portal profile settings. Self-deletion for email/password accounts requires re-authentication for security purposes. Upon account deletion, your personal data will be handled in accordance with our Privacy Policy and applicable data retention obligations.
                </Prose>

                <Separator className="my-6" />

                {/* Changes to Terms */}
                <SectionHeading id="changes-terms">Changes to Terms</SectionHeading>
                <Prose>
                  The Church reserves the right to modify these Terms at any time. Changes will be communicated by updating the &quot;Last Updated&quot; date at the top of this page. For significant changes, we may also provide notice through in-Platform announcements or email notification to registered members.
                </Prose>
                <Prose>
                  Your continued use of the Platform following any changes constitutes your acceptance of the revised Terms. We encourage you to review these Terms periodically to stay informed of any updates.
                </Prose>

                <Separator className="my-6" />

                {/* Governing Law */}
                <SectionHeading id="governing-law">Governing Law</SectionHeading>
                <Prose>
                  These Terms shall be governed by and construed in accordance with the laws of the Republic of Kenya, without regard to its conflict of law provisions. Any disputes arising out of or relating to these Terms or the use of the Platform shall be subject to the exclusive jurisdiction of the courts of Busia County, Kenya.
                </Prose>
                <Prose>
                  Where applicable, the Platform also complies with Kenya's Data Protection Act, 2019, and any other relevant legislation governing digital services and personal data.
                </Prose>

                <Separator className="my-6" />

                {/* Contact */}
                <SectionHeading id="contact">Contact Information</SectionHeading>
                <Prose>
                  If you have questions, concerns, or requests regarding these Terms, please contact us:
                </Prose>
                <Card className="border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 shadow-none mt-2">
                  <CardContent className="p-5 space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <p><span className="font-semibold text-neutral-800 dark:text-neutral-200">Organization:</span> {CHURCH_NAME}</p>
                    <p><span className="font-semibold text-neutral-800 dark:text-neutral-200">Location:</span> {CHURCH_LOCATION}</p>
                    <p>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">Email: </span>
                      <a href={`mailto:${CONTACT_EMAIL}`} className="text-red-700 hover:underline">{CONTACT_EMAIL}</a>
                    </p>
                    <p>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">Website: </span>
                      <a href={PLATFORM_URL} className="text-red-700 hover:underline">{PLATFORM_URL}</a>
                    </p>
                    <p>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">Privacy Policy: </span>
                      <Link href="/privacy" className="text-red-700 hover:underline">View Privacy Policy</Link>
                    </p>
                  </CardContent>
                </Card>

              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}