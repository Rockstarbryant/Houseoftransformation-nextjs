//"use client";

import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldCheck, ChevronRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | House of Transformation Church",
  description:
    "Understand how House of Transformation Church collects, uses, and protects your personal data across our digital platform, member portal, and payment services.",
  keywords: ["privacy policy", "House of Transformation", "data protection", "Kenya", "church platform"],
  openGraph: {
    title: "Privacy Policy | House of Transformation Church",
    description: "Privacy policy for the HOT Church digital platform.",
    url: "https://houseoftransformation-nextjs.vercel.app/privacy",
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
  { id: "information-we-collect", label: "Information We Collect" },
  { id: "personal-information", label: "Personal Information" },
  { id: "usage-data", label: "Usage Data" },
  { id: "cookies-tracking", label: "Cookies & Tracking" },
  { id: "device-information", label: "Device Information" },
  { id: "how-we-use", label: "How We Use Information" },
  { id: "analytics", label: "Analytics" },
  { id: "security", label: "Security of Data" },
  { id: "data-retention", label: "Data Retention" },
  { id: "user-rights", label: "User Rights" },
  { id: "third-party", label: "Third-Party Services" },
  { id: "childrens-privacy", label: "Children's Privacy" },
  { id: "updates", label: "Updates to Policy" },
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
        <li
          key={i}
          className="flex items-start gap-2 text-[15px] leading-7 text-neutral-600 dark:text-neutral-400"
        >
          <ChevronRight className="w-3.5 h-3.5 mt-1.5 shrink-0 text-red-700" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function InfoCard({ title, items }) {
  return (
    <Card className="border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 shadow-none mb-4">
      <CardContent className="p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">{title}</p>
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-[14px] leading-6 text-neutral-600 dark:text-neutral-400"
            >
              <ChevronRight className="w-3 h-3 mt-1.5 shrink-0 text-red-700" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Hero */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-red-700" />
            </div>
            <Badge variant="outline" className="text-xs text-neutral-500 border-neutral-300">
              Legal Document
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            Last updated:{" "}
            <span className="font-medium text-neutral-700 dark:text-neutral-300">{LAST_UPDATED}</span>
            &nbsp;&middot;&nbsp; Effective:{" "}
            <span className="font-medium text-neutral-700 dark:text-neutral-300">{EFFECTIVE_DATE}</span>
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
                  {CHURCH_NAME} (&quot;the Church&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), based in {CHURCH_LOCATION}, is committed to protecting your privacy and safeguarding the personal data you entrust to us when you use our digital platform at{" "}
                  <a href={PLATFORM_URL} className="text-red-700 underline underline-offset-2">
                    {PLATFORM_URL}
                  </a>
                  .
                </Prose>
                <Prose>
                  This Privacy Policy explains what information we collect, how we use it, with whom we share it, and the rights you have with respect to your personal data. This policy applies to all services offered through the Platform, including the public website, member portal, event registration, donations, feedback submissions, and livestream features.
                </Prose>
                <Prose>
                  By using the Platform, you consent to the collection and use of information as described in this policy. If you do not agree with this policy, please discontinue use of the Platform.
                </Prose>

                <Separator className="my-6" />

                {/* Information We Collect */}
                <SectionHeading id="information-we-collect">Information We Collect</SectionHeading>
                <Prose>
                  We collect information from multiple sources when you interact with the Platform. The types of information we collect include:
                </Prose>
                <InfoCard
                  title="Data Categories"
                  items={[
                    "Account registration data (name, email address, phone number)",
                    "Authentication credentials managed by Supabase",
                    "Profile information (bio, location, gender, ministries, avatar)",
                    "Event registration records (name, email, attendance time, seat reservation)",
                    "Donation and payment transaction records",
                    "Feedback and testimony submissions (optionally anonymous)",
                    "Volunteer application data (ministry preferences, experience, skills)",
                    "Blog posts and content created by authorized contributors",
                    "Sermon bookmarks and content engagement data (likes, views)",
                    "Communications sent through the contact form or prayer request feature",
                    "Technical and usage data collected automatically",
                  ]}
                />

                <Separator className="my-6" />

                {/* Personal Information */}
                <SectionHeading id="personal-information">Personal Information</SectionHeading>
                <Prose>
                  Personal information is data that identifies you or can reasonably be used to identify you. We collect the following categories of personal information:
                </Prose>
                <SubHeading>Account &amp; Identity Data</SubHeading>
                <UList items={[
                  "Full name and display username (auto-generated from email if not provided).",
                  "Email address — used as your primary account identifier.",
                  "Phone number — optionally provided for M-Pesa payment association.",
                  "Profile photo (avatar), uploaded to Cloudinary image hosting.",
                  "Gender, location, bio, and ministry affiliations — all optional profile fields.",
                  "Authentication provider type (email/password or Google OAuth).",
                  "Assigned role and permission level within the Church platform.",
                ]} />
                <SubHeading>Event &amp; Registration Data</SubHeading>
                <UList items={[
                  "Name and email address submitted during event seat registration.",
                  "Selected attendance time and any special registration notes.",
                  "Registration timestamps and seat reference codes.",
                ]} />
                <SubHeading>Donation &amp; Payment Data</SubHeading>
                <UList items={[
                  "M-Pesa phone number and transaction reference numbers (received from Safaricom callbacks).",
                  "Donation amounts, campaign association, and payment method.",
                  "Pledge commitments, fulfillment status, and reminder preferences.",
                  "Manual payment records entered by authorized Church administrators.",
                ]} />
                <SubHeading>Feedback &amp; Communication Data</SubHeading>
                <UList items={[
                  "Sermon feedback, service experience ratings, and suggestions.",
                  "Testimony content submitted for possible publication.",
                  "Prayer requests (handled with strict confidentiality).",
                  "Contact form messages, including name, email, and message content.",
                  "Volunteer application details including motivation and experience.",
                ]} />

                <Separator className="my-6" />

                {/* Usage Data */}
                <SectionHeading id="usage-data">Usage Data</SectionHeading>
                <Prose>
                  We automatically collect certain information about how you interact with the Platform. This data helps us understand how the Platform is being used and how we can improve your experience.
                </Prose>
                <UList items={[
                  "Pages visited, time spent on pages, and navigation flow through the Platform.",
                  "Sermon and blog post views, tracked per unique device to prevent duplicate view counts.",
                  "Content interactions including likes (sermons, blog posts, gallery photos) and bookmarks.",
                  "Search queries and filter selections made on the blog, sermons, or gallery pages.",
                  "Event registration and donation activity timestamps.",
                  "Member portal actions including content creation, editing, and deletion events.",
                  "Real-time announcement interaction data, including read/unread status.",
                  "Feedback submission timestamps and form category selections.",
                ]} />

                <Separator className="my-6" />

                {/* Cookies and Tracking */}
                <SectionHeading id="cookies-tracking">Cookies &amp; Tracking</SectionHeading>
                <Prose>
                  The Platform uses cookies and similar tracking technologies to maintain your session, remember your preferences, and analyze site usage.
                </Prose>
                <SubHeading>Types of Cookies Used</SubHeading>
                <UList items={[
                  "Authentication cookies: Store your session token (JWT) in a SameSite=Lax cookie for secure, cross-tab session management.",
                  "Role cookies: A lightweight cookie stores your assigned role name for fast permission checks without requiring an API call.",
                  "Device ID: A persistent, randomly generated device identifier is stored in localStorage to enable per-device view tracking on sermons, blogs, and gallery photos without requiring login.",
                  "Service Worker cache: The Progressive Web App (PWA) layer uses browser caching and IndexedDB for offline shell support and Picture-in-Picture state persistence.",
                  "Analytics cookies: Vercel Analytics and optionally Google Analytics may set tracking cookies to measure traffic and performance metrics.",
                ]} />
                <Prose>
                  You can control cookie settings through your browser preferences. Disabling cookies may affect certain Platform features, including session persistence and content personalization.
                </Prose>

                <Separator className="my-6" />

                {/* Device Information */}
                <SectionHeading id="device-information">Device Information</SectionHeading>
                <Prose>
                  When you access the Platform, we automatically collect technical information about the device and browser you use:
                </Prose>
                <UList items={[
                  "IP address (obtained via X-Forwarded-For headers or direct connection).",
                  "Browser type, version, and user agent string.",
                  "Operating system and device type.",
                  "Screen resolution and viewport dimensions.",
                  "Referring URL and entry page.",
                  "Time zone and approximate geographic location (derived from IP address).",
                  "Service worker registration status for PWA features.",
                ]} />
                <Prose>
                  Device information is used primarily for security monitoring (audit logging), spam prevention, and improving Platform performance across different devices.
                </Prose>

                <Separator className="my-6" />

                {/* How We Use Information */}
                <SectionHeading id="how-we-use">How We Use Information</SectionHeading>
                <Prose>
                  We use the information we collect for the following purposes:
                </Prose>
                <SubHeading>Platform Operations</SubHeading>
                <UList items={[
                  "Creating and managing your member account and portal access.",
                  "Processing event registrations and managing seat availability.",
                  "Facilitating donation transactions and generating payment records.",
                  "Delivering real-time announcements through Server-Sent Events (SSE) to connected portal users.",
                  "Enabling content features such as sermon bookmarks, likes, and view counts.",
                  "Operating the AI-powered chatbot for visitor assistance.",
                ]} />
                <SubHeading>Communication</SubHeading>
                <UList items={[
                  "Sending transactional emails such as welcome messages, password resets, and email verifications.",
                  "Delivering targeted or broadcast email notifications from Church administrators to members by role.",
                  "Sending pledge fulfillment reminders.",
                  "Responding to feedback, contact form submissions, and prayer requests.",
                  "Notifying administrators of new donations, volunteer applications, or new member registrations (configurable).",
                ]} />
                <SubHeading>Content Moderation &amp; Administration</SubHeading>
                <UList items={[
                  "Moderating submitted feedback, testimonies, and user-generated content.",
                  "Managing volunteer application reviews and approvals.",
                  "Maintaining a full audit trail of Platform actions for security and accountability.",
                  "Enforcing bans and access restrictions on accounts that violate Terms.",
                ]} />
                <SubHeading>Improvement &amp; Analytics</SubHeading>
                <UList items={[
                  "Analyzing content engagement to identify the most impactful sermons, events, and campaigns.",
                  "Monitoring Platform performance and identifying technical issues.",
                  "Understanding member growth, retention, and activity patterns.",
                  "Improving the design, features, and functionality of the Platform over time.",
                ]} />

                <Separator className="my-6" />

                {/* Analytics */}
                <SectionHeading id="analytics">Analytics</SectionHeading>
                <Prose>
                  The Platform uses multiple analytics systems to understand usage patterns and measure ministry impact:
                </Prose>
                <SubHeading>Vercel Analytics &amp; Speed Insights</SubHeading>
                <Prose>
                  The Platform uses Vercel Analytics and Vercel Speed Insights to collect aggregate, anonymized data about page visits, load times, and Core Web Vitals. This data does not include personally identifiable information and is used solely to monitor and improve Platform performance.
                </Prose>
                <SubHeading>Google Analytics (Optional)</SubHeading>
                <Prose>
                  Where configured, Google Analytics (via Google Tag Manager) may collect anonymized usage data including pages visited, session duration, traffic sources, and device categories. Google Analytics is loaded as a deferred, non-blocking script to prevent impact on initial page performance. The Google Analytics Measurement ID is configurable in the Platform settings.
                </Prose>
                <SubHeading>Internal Analytics Dashboard</SubHeading>
                <Prose>
                  Authorized administrators and members with the <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono">view:analytics</code> permission have access to an internal analytics dashboard that displays:
                </Prose>
                <UList items={[
                  "User growth metrics: total members, new registrations, active users by role.",
                  "Content performance: sermon and blog views, likes, bookmark rates.",
                  "Event analytics: registrations per event, attendance trends.",
                  "Donation analytics: campaign progress, payment method breakdown, M-Pesa transaction volumes.",
                  "Engagement metrics: feedback submission rates, volunteer application volumes, announcement read rates.",
                  "System audit logs: API activity, authentication events, and administrative actions.",
                ]} />
                <Prose>
                  All internal analytics data is stored on the Church's own infrastructure (MongoDB Atlas) and is not shared with third parties.
                </Prose>

                <Separator className="my-6" />

                {/* Security */}
                <SectionHeading id="security">Security of Data</SectionHeading>
                <Prose>
                  We implement a range of technical and organisational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
                </Prose>
                <SubHeading>Authentication Security</SubHeading>
                <UList items={[
                  "All authentication is managed by Supabase, which verifies every JWT on each protected API request — there is no local bypass.",
                  "Tokens are stored in localStorage and mirrored to SameSite=Lax cookies, limiting cross-site request exposure.",
                  "Refresh tokens are single-use. Failed refresh attempts immediately clear all stored credentials.",
                  "Login and signup endpoints are rate-limited to prevent brute-force attacks.",
                ]} />
                <SubHeading>Data Transmission</SubHeading>
                <UList items={[
                  "All data transmitted between your browser and the Platform uses HTTPS encryption.",
                  "M-Pesa callbacks are received over HTTPS from Safaricom's verified servers.",
                  "API endpoints enforce CORS restrictions, permitting only whitelisted origins.",
                ]} />
                <SubHeading>Input Validation &amp; Sanitization</SubHeading>
                <UList items={[
                  "User-submitted HTML content (blog posts, sermon content) is sanitized using DOMPurify before storage to prevent XSS attacks.",
                  "Form inputs are validated both client-side and independently server-side using express-validator.",
                  "All state-changing API operations enforce server-side permission checks regardless of frontend gating.",
                ]} />
                <SubHeading>Infrastructure</SubHeading>
                <UList items={[
                  "Database: MongoDB Atlas with encryption at rest and network access restrictions.",
                  "Image storage: Cloudinary — image deletion requires server-side admin credentials, never exposed to the browser.",
                  "M-Pesa credentials and SMTP passwords are stored encrypted in MongoDB and loaded at runtime.",
                  "Server-side secrets (Supabase Service Key, Cloudinary API Secret) are never exposed to the browser.",
                ]} />
                <Prose>
                  Despite our best efforts, no method of data transmission or storage is 100% secure. We encourage you to use a strong, unique password and to log out of the Platform when using shared devices.
                </Prose>

                <Separator className="my-6" />

                {/* Data Retention */}
                <SectionHeading id="data-retention">Data Retention</SectionHeading>
                <Prose>
                  We retain your personal data for as long as necessary to fulfil the purposes described in this Privacy Policy, or as required by applicable law.
                </Prose>
                <UList items={[
                  "Account data is retained for the duration of your membership. Upon account deletion, your profile data is removed from both our database (MongoDB) and the authentication provider (Supabase).",
                  "Donation records and financial transaction data may be retained for a minimum of 7 years in compliance with Kenyan financial record-keeping requirements.",
                  "Event registration records are retained for the duration of the event plus a reasonable administrative period thereafter.",
                  "Feedback submissions, excluding published testimonies, are retained according to the moderation lifecycle (active, archived, or soft-deleted with a recycle bin period).",
                  "Published testimonies remain on the Platform until removal is requested or the Church decides to archive them.",
                  "Audit logs and system activity records are retained for security and accountability purposes for a minimum of 12 months.",
                  "Email delivery logs are retained for tracking and dispute resolution purposes.",
                  "M-Pesa idempotency keys expire after 24 hours and are automatically deleted by scheduled cleanup jobs.",
                  "Expired announcements are automatically removed by scheduled jobs.",
                ]} />

                <Separator className="my-6" />

                {/* User Rights */}
                <SectionHeading id="user-rights">User Rights</SectionHeading>
                <Prose>
                  In accordance with Kenya's Data Protection Act, 2019 and generally accepted privacy principles, you have the following rights with respect to your personal data:
                </Prose>
                <UList items={[
                  "Right of Access: You may request a copy of the personal data we hold about you.",
                  "Right to Rectification: You may update or correct inaccurate personal data through your Portal profile settings, or by contacting us.",
                  "Right to Erasure: You may request deletion of your personal data. You can initiate self-deletion from the Portal profile settings page. Some data may be retained as required by law or for legitimate Church administrative purposes.",
                  "Right to Data Portability: You may request your personal data in a structured, commonly used format.",
                  "Right to Restriction: You may request that we limit how we process your data in certain circumstances.",
                  "Right to Object: You may object to certain processing activities, including receiving broadcast email communications (unsubscribe links are provided in all marketing emails).",
                  "Right to Withdraw Consent: Where processing is based on consent (e.g., optional analytics), you may withdraw consent at any time without affecting the lawfulness of prior processing.",
                ]} />
                <Prose>
                  To exercise any of these rights, please contact us at{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-red-700 underline underline-offset-2">
                    {CONTACT_EMAIL}
                  </a>
                  . We will respond to all legitimate requests within 30 days.
                </Prose>

                <Separator className="my-6" />

                {/* Third Party Services */}
                <SectionHeading id="third-party">Third-Party Services</SectionHeading>
                <Prose>
                  The Platform integrates with the following third-party services. Each service operates under its own privacy policy and terms of service:
                </Prose>
                <InfoCard
                  title="Third-Party Integrations"
                  items={[
                    "Supabase (supabase.com) — Authentication provider. Stores user identity, email credentials, and OAuth tokens. Subject to Supabase Privacy Policy.",
                    "Safaricom M-Pesa / Daraja API — Processes mobile money payments. Your phone number and transaction data are shared with Safaricom for payment processing. Subject to Safaricom Terms.",
                    "Cloudinary (cloudinary.com) — Image hosting for profile avatars and church gallery photos. Subject to Cloudinary Privacy Policy.",
                    "Vercel (vercel.com) — Platform hosting and analytics. Vercel may collect anonymized performance metrics. Subject to Vercel Privacy Policy.",
                    "Google Analytics (optional) — Usage analytics. Subject to Google Privacy Policy. Data is anonymized and aggregated.",
                    "YouTube / Google — Embedded sermon and livestream videos. YouTube may set cookies if you interact with embedded players. Subject to Google Privacy Policy.",
                    "Facebook / Meta — Embedded livestream integration. Meta may set cookies when you view embedded Facebook Live content. Subject to Meta Privacy Policy.",
                    "MongoDB Atlas (mongodb.com) — Cloud database provider. Stores all Platform data with encryption at rest. Subject to MongoDB Privacy Policy.",
                  ]}
                />
                <Prose>
                  We do not sell your personal information to third parties. We only share data with the above services to the extent necessary to operate the Platform and deliver services to you.
                </Prose>

                <Separator className="my-6" />

                {/* Children's Privacy */}
                <SectionHeading id="childrens-privacy">Children&apos;s Privacy</SectionHeading>
                <Prose>
                  The Platform is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13 without verifiable parental consent.
                </Prose>
                <Prose>
                  Certain features of the Platform — such as event registration and feedback forms — may be used by minors under the supervision of a parent or guardian. In such cases, the parent or guardian is responsible for ensuring appropriate use of the Platform on behalf of the minor.
                </Prose>
                <Prose>
                  If we become aware that we have inadvertently collected personal data from a child under 13 without appropriate consent, we will take immediate steps to delete that information. If you believe we may have collected data from a child under 13, please contact us at{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-red-700 underline underline-offset-2">
                    {CONTACT_EMAIL}
                  </a>
                  .
                </Prose>

                <Separator className="my-6" />

                {/* Updates */}
                <SectionHeading id="updates">Updates to Policy</SectionHeading>
                <Prose>
                  We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or for other operational reasons. Updates will be published on this page with a revised &quot;Last Updated&quot; date.
                </Prose>
                <Prose>
                  For significant changes that materially affect how we process your personal data, we will provide prominent notice through an in-Platform announcement or by sending a notification to your registered email address prior to the changes taking effect.
                </Prose>
                <Prose>
                  Your continued use of the Platform following any update to this Privacy Policy constitutes your acceptance of the revised terms. We encourage you to review this page periodically.
                </Prose>

                <Separator className="my-6" />

                {/* Contact */}
                <SectionHeading id="contact">Contact Information</SectionHeading>
                <Prose>
                  If you have questions about this Privacy Policy, wish to exercise your data rights, or have concerns about how we handle your personal information, please contact our designated data contact:
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
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">Terms &amp; Conditions: </span>
                      <Link href="/terms" className="text-red-700 hover:underline">View Terms &amp; Conditions</Link>
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