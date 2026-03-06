# House of Transformation Church Platform
## Unified System Documentation

**Version:** 1.0  
**Project Type:** Church Management & Engagement Platform  
**Location:** Busia County, Kenya  
**Prepared by:** System Architecture Review

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Purpose and Goals](#2-system-purpose-and-goals)
3. [Key Platform Features](#3-key-platform-features)
4. [Technology Stack](#4-technology-stack)
5. [High-Level System Architecture](#5-high-level-system-architecture)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Backend Architecture](#7-backend-architecture)
8. [Authentication Flow](#8-authentication-flow)
9. [Role-Based Permission System](#9-role-based-permission-system)
10. [Portal Architecture](#10-portal-architecture)
11. [Public Website Structure](#11-public-website-structure)
12. [Rendering Strategy](#12-rendering-strategy)
13. [Database Structure Overview](#13-database-structure-overview)
14. [API Communication](#14-api-communication)
15. [Livestream Integration](#15-livestream-integration)
16. [Event Registration System](#16-event-registration-system)
17. [Donation Campaign System](#17-donation-campaign-system)
18. [Feedback and Testimony System](#18-feedback-and-testimony-system)
19. [Volunteer Management System](#19-volunteer-management-system)
20. [Analytics and Admin Capabilities](#20-analytics-and-admin-capabilities)
21. [PWA and Service Worker](#21-pwa-and-service-worker)
22. [SEO Strategy](#22-seo-strategy)
23. [Security Considerations](#23-security-considerations)
24. [Performance Considerations](#24-performance-considerations)
25. [Scalability Considerations](#25-scalability-considerations)
26. [Deployment Overview](#26-deployment-overview)
27. [Environment Variables](#27-environment-variables)
28. [Maintenance Considerations](#28-maintenance-considerations)
29. [Future Improvement Opportunities](#29-future-improvement-opportunities)
30. [Conclusion and Project Summary](#30-conclusion-and-project-summary)

---

## 1. Project Overview

House of Transformation (H.O.T) is a full-stack church management and community engagement platform built for a church congregation in Busia County, Kenya. It serves two primary audiences through a single unified system:

- **Public visitors** — who access the church's website to discover services, watch livestreams, read sermons and blog posts, register for events, submit feedback, and make donations.
- **Authenticated members and staff** — who use a role-gated portal to manage all platform content, moderate community interaction, and administer the organization.

The platform is composed of two independently deployable applications:

| Application | Technology | Deployment |
|---|---|---|
| Frontend (public site + portal) | Next.js App Router | Netlify |
| Backend API | Node.js + Express | Render / Railway |

Both applications communicate over a REST API with a secondary real-time channel (Server-Sent Events) for announcement delivery. Authentication is delegated entirely to Supabase, with user profiles and role data stored in MongoDB Atlas.

---

## 2. System Purpose and Goals

### Primary Purpose

Provide the church with a self-managed digital infrastructure that replaces fragmented tools (separate admin panels, third-party form services, manual spreadsheets) with a single integrated platform.

### Goals

| Goal | Implementation |
|---|---|
| Public engagement | SEO-optimized public website with structured data, fast SSR pages, PWA installability |
| Member self-service | Portal with profile management, saved sermons, announcement access |
| Content management | Admin-managed blog, sermons, events, gallery, and livestreams through the same UI members use |
| Financial transparency | Donation campaigns with progress tracking, M-Pesa integration, pledge system |
| Community feedback | Five-category feedback system with anonymous submission, moderation, and response capability |
| Organizational management | Role-based access so non-admin staff can manage specific areas without full admin access |
| Mobile accessibility | Fully responsive UI, PWA installability, mobile-optimized navigation and portal |

---

## 3. Key Platform Features

### Public Website Features

| Feature | Description |
|---|---|
| Homepage | Hero, live detection section, quick info bar, featured sermon, events carousel, donation campaigns, ministry areas |
| Blog | Post listing with category filtering, likes, per-device view counting |
| Sermons | Text and media sermons, bookmarking, likes, per-device view tracking |
| Livestream | YouTube and Facebook embed with live/offline detection, Picture-in-Picture (PiP) |
| Events | Event cards, registration with seat booking, capacity tracking |
| Donations | Campaign progress, M-Pesa STK Push, Paybill/Till, bank transfer details, pledge system |
| Gallery | Photo grid with category filter and photo likes |
| Feedback | Five forms: sermon feedback, service experience, testimony, suggestion, prayer request |
| Volunteer | Ministry-specific application forms (Ushering, Worship, Technical, Children's Ministry) |
| Service Areas | Ministry directory with individual slug pages |
| Contact | Google Maps embed, contact form |
| New Here | Visitor onboarding page with plan-your-visit form |
| Testimony | Published testimony detail pages |
| User Profiles | Public member profile pages |

### Portal Features

| Feature | Access Level |
|---|---|
| Analytics Dashboard | `view:analytics` permission |
| Blog Management | `manage:blog` permission |
| Sermon Publishing | `manage:sermons` permission |
| Event Management | `manage:events` permission |
| Gallery Management | `manage:gallery` permission |
| Livestream Management | `manage:livestream` permission |
| Feedback Moderation | Granular per-category permissions |
| Volunteer Approvals | `manage:volunteers` permission |
| Announcement System | `manage:announcements` (create/edit); all users (view) |
| Notice Bar Management | `manage:announcements` permission |
| Donation Management | Granular campaign/pledge/payment permissions |
| Email Notifications | `manage:users` or admin |
| User Management | `manage:users` permission |
| Role & Permission Management | `manage:roles` permission |
| Profile Management | All authenticated users |
| Bookmarks | All authenticated users |
| Settings | `manage:settings` permission |
| Audit Logs | `view:audit_logs` permission |

---

## 4. Technology Stack

### Frontend

| Category | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.1.6 |
| UI Language | React | 18 |
| Styling | Tailwind CSS | 3.4.1 |
| Authentication Client | @supabase/supabase-js | 2.90.1 |
| HTTP Client | Axios | 1.13.2 |
| Server State | TanStack React Query | 5.90.20 |
| Rich Text Editor | TipTap | latest |
| Markdown | react-markdown + remark-gfm | - |
| Animations | Framer Motion | 12.31.1 |
| Icons | Lucide React, Iconify | - |
| Charts | Recharts | 3.7.0 |
| Image Hosting | Cloudinary SDK | - |
| Notifications | Sonner | - |
| Analytics | Vercel Analytics + Speed Insights | - |
| Deployment | Netlify + @netlify/plugin-nextjs | - |

### Backend

| Category | Technology | Version |
|---|---|---|
| Runtime | Node.js | 18.x / 20.x |
| Framework | Express | 4.22.1 |
| Database ODM | Mongoose | 7.8.8 |
| Authentication | @supabase/supabase-js | 2.93.3 |
| Image Storage | Cloudinary + multer-storage-cloudinary | 2.9.0 |
| Email | Nodemailer | 7.0.12 |
| Payments | Safaricom Daraja API (Axios) | - |
| AI (Summaries) | Anthropic Claude SDK | 0.24.3 |
| AI (Captions) | Google Generative AI | 0.24.1 |
| Rate Limiting | express-rate-limit | 7.1.5 |
| File Uploads | Multer | 1.4.5-lts |
| Validation | express-validator, validator | - |
| Sanitization | isomorphic-dompurify | - |
| Logging | morgan | 1.10.0 |
| Unique IDs | uuid | 9.0.1 |
| Transcripts | youtube-transcript-api | 3.0.6 |

### Infrastructure

| Service | Purpose |
|---|---|
| MongoDB Atlas | Primary content and user data database |
| Supabase | Authentication identity provider, idempotency key storage |
| Cloudinary | Image storage and transformation CDN |
| Netlify | Frontend hosting |
| Safaricom Daraja | M-Pesa payment gateway (Kenya) |

---

## 5. High-Level System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                             │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                   Next.js Application                        │  │
│  │                                                              │  │
│  │  ┌──────────────────────┐  ┌──────────────────────────────┐ │  │
│  │  │   Public Site        │  │   Member Portal              │ │  │
│  │  │   /(public)          │  │   /portal/*                  │ │  │
│  │  │                      │  │                              │ │  │
│  │  │  SSR pages (SEO)     │  │  CSR only, auth-gated        │ │  │
│  │  │  CSR pages (dynamic) │  │  role-filtered sidebar       │ │  │
│  │  └──────────┬───────────┘  └──────────────┬───────────────┘ │  │
│  │             │                              │                 │  │
│  │             └──────────────┬───────────────┘                 │  │
│  │                            │                                 │  │
│  │                   ┌────────▼────────┐                        │  │
│  │                   │  AuthContext    │                        │  │
│  │                   │  (Supabase JS)  │                        │  │
│  │                   └────────┬────────┘                        │  │
│  │                            │                                 │  │
│  │                   ┌────────▼────────┐                        │  │
│  │                   │  Axios (api.js) │                        │  │
│  │                   │  JWT injection  │                        │  │
│  │                   │  401 refresh   │                        │  │
│  │                   └────────┬────────┘                        │  │
│  └────────────────────────────│─────────────────────────────────┘  │
└───────────────────────────────│────────────────────────────────────┘
                                │
                    ┌───────────▼────────────┐
                    │     HTTPS REST API      │
                    │  + SSE (/stream)        │
                    └───────────┬────────────┘
                                │
┌───────────────────────────────▼────────────────────────────────────┐
│                     Node.js / Express Server                         │
│                                                                      │
│  Trust Proxy → Body Parser → CORS → Audit Middleware → Rate Limiter  │
│                         ↓                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │ Public Routes│  │ Mixed Routes │  │ Protected Routes          │   │
│  │ (no JWT)     │  │ (optionalAuth│  │ (protect + requirePerm)  │   │
│  │              │  │  protectSSE) │  │                          │   │
│  └──────┬───────┘  └──────┬───────┘  └─────────────┬────────────┘   │
│         └─────────────────┴────────────────────────┘                │
│                            │                                         │
│              Controllers → Services → Models                         │
│                            │                                         │
│              Error Handler (global, last)                            │
└────────────────────────────┬─────────────────────────────────────────┘
              ┌──────────────┼──────────────────┐
              │              │                  │
   ┌──────────▼───┐  ┌───────▼──────┐  ┌────────▼──────────┐
   │ MongoDB Atlas│  │  Supabase    │  │  Cloudinary CDN   │
   │ (content,    │  │  (auth,      │  │  (images,         │
   │  users,      │  │   idempotency│  │   gallery)        │
   │  roles,      │  │   keys)      │  │                   │
   │  audit)      │  └──────────────┘  └───────────────────┘
   └──────────────┘
              │
   ┌──────────▼────────────┐
   │  Safaricom Daraja API │
   │  (M-Pesa STK Push)    │
   └───────────────────────┘
```

---

## 6. Frontend Architecture

### Application Structure

The Next.js App Router organizes the application into two route groups:

```
src/app/
├── (public)/          ← Public website, mixed SSR/CSR
│   ├── layout.jsx     ← NoticeBar + Header + Footer + Chatbot
│   └── page.jsx       ← Homepage (SSR)
├── portal/            ← Member portal, all CSR
│   ├── layout.jsx     ← Auth check + sidebar + portal header
│   └── page.jsx       ← Dashboard
├── auth/callback/     ← Supabase OAuth callback
├── maintenance/
└── layout.jsx         ← Root: providers, fonts, metadata
```

### Context Providers

The root layout wraps the application in a layered provider tree:

```
QueryProvider (TanStack Query client)
  └── ThemeProvider (dark/light class strategy)
        └── PiPProvider (Picture-in-Picture global state)
              └── Providers (AuthProvider)
                    └── SplashScreen
                          └── ClientOnlyComponents
                                (Analytics, SW register, Chatbot — deferred)
```

### State Architecture

| Layer | Technology | Scope |
|---|---|---|
| Auth state | `AuthContext` (React Context) | Global |
| Server data | TanStack Query | Per-page cache |
| Theme | `ThemeContext` | Global, persisted to localStorage |
| PiP state | `PiPContext` | Global, persisted to IndexedDB via SW |
| Donation flow | `DonationContext` | Feature-scoped |
| Chatbot | `ChatbotContext` | Feature-scoped |
| Form state | Local `useState` | Component-level |

### Service Layer

API calls are organized in two layers:

```
components
    ↓ call
hooks / page components
    ↓ call
src/services/api/{featureService.js}   ← feature-specific API modules
    ↓ call
src/lib/api.js                         ← Axios instance (auth + interceptors)
    ↓ HTTP
Express API
```

### Path Aliases

`jsconfig.json` maps `@/*` → `./src/*`, used throughout the codebase.

### Utility Modules

| File | Purpose |
|---|---|
| `utils/deviceId.js` | Generates and persists a unique device ID in localStorage for view deduplication |
| `utils/constants.js` | Church info, service times, social links, API endpoint map, chatbot responses |
| `utils/formatters.js` | Date, currency, number formatting |
| `utils/validators.js` | Client-side validation helpers |
| `utils/donationHelpers.js` | Campaign/pledge data joining utilities |

---

## 7. Backend Architecture

### Middleware Execution Order

```
Incoming Request
  1.  app.set('trust proxy', 1)          reads real IP behind proxy
  2.  express.json()                      parses JSON body
  3.  express.urlencoded()                parses form data
  4.  cors(allowedOrigins)               enforces origin whitelist
  5.  app.use('/uploads', static)         serves local upload fallback
  6.  app.use('/api', auditMiddleware)    logs all API requests
  7.  app.use('/api/', apiLimiter)        rate limits all API routes
  8.  Route-specific auth middleware      protect / optionalAuth / protectSSE
  9.  requirePermission(...)              enforces permission strings
  10. asyncHandler                        catches async errors
  11. Controller
  12. Response
  13. 404 handler (no route matched)
  14. errorHandler (global, last)
```

### Route Groups

Routes are mounted in a deliberate order to prevent middleware conflicts:

```
/api/auth                    ← public, no auth
/api/settings/public         ← public, no maintenance check
/api/sermons                 ← public content
/api/blog                    ← public content
/api/events                  ← public content
/api/gallery                 ← public content
/api/campaigns               ← public content
/api/contributions           ← public
/api/pledges                 ← public (user pledges auth-checked internally)
/api/payments                ← public
/api/mpesa                   ← M-Pesa callback, no auth
/api/donations/analytics     ← public stats
/api/livestreams             ← public
/api/feedback                ← public (submission); auth required for admin ops
/api/volunteers              ← public submission
/api/notices                 ← public read
/api/announcements           ← mixed: /stream uses protectSSE, others use protect
/api/users                   ← protected (auth checked in controller)
/api/roles                   ← protect + manage:roles
/api/settings                ← protect + manage:settings
/api/analytics               ← protect + view:analytics
/api/audit                   ← protect + view:audit_logs
/api/transaction-audit       ← protect + view:audit_logs
/api/email-notifications     ← protect + manage:users
/api/email                   ← protect + admin
```

### Controller Pattern

All controller functions use `asyncHandler` for error propagation:

```js
exports.create = asyncHandler(async (req, res) => {
  // Mongoose operations, service calls
  res.status(201).json({ success: true, data });
});
```

### Service Layer

| Service | Responsibility |
|---|---|
| `mpesaService.js` | Safaricom Daraja OAuth + STK Push + status query |
| `mpesaVerificationService.js` | Callback validation, receipt verification, metadata extraction |
| `emailService.js` | Nodemailer singleton, SMTP config from Settings, delivery logging |
| `auditService.js` | Audit log write helpers (`logAuth`, `logError`) |
| `transcriptService.js` | YouTube transcript extraction |
| `aiSummaryFromTranscript.js` | Claude / Gemini-based sermon summarization |
| `aiCaptionsService.js` | AI-generated gallery photo captions |
| `captionWorker.js` | Background job runner for caption generation |

### CORS Configuration

| Environment | Allowed Origins |
|---|---|
| Development | `localhost:3000`, `127.0.0.1:3000`, Postman |
| Production | Frontend URL (env var), Netlify deployment, Vercel deployment URLs |

---

## 8. Authentication Flow

The platform delegates all identity verification to **Supabase**. The backend issues no JWTs of its own.

### Email / Password Flow

```
Frontend                          Supabase              Backend (MongoDB)
    │                                 │                        │
    │── signInWithPassword() ─────────▶                        │
    │◀─ session { access_token } ─────│                        │
    │                                 │                        │
    │── tokenService.setToken() ──────────────────────────────▶│ (stored)
    │                                 │                        │
    │── GET /api/auth/verify ──────────────────────────────────▶│
    │                                 │  supabase.auth.getUser()│
    │                                 │◀───────────────────────│
    │                                 │──── verified user ─────▶│
    │                                 │                         │── User.findOne(supabase_uid)
    │                                 │                         │── populate role
    │◀── { user, role, permissions } ─────────────────────────│
```

### Google OAuth Flow

```
Frontend                     Supabase (Google)          Backend
    │                              │                        │
    │── signInWithOAuth(google) ───▶                        │
    │                              │── Google OAuth ────────▶
    │                              │◀── grant ──────────────│
    │◀── redirect /auth/callback ──│                        │
    │                              │                        │
    │── POST /api/auth/oauth-sync ──────────────────────────▶│
    │                                                        │── create/update MongoDB user
    │◀── { token, user } ───────────────────────────────────│
```

### Token Lifecycle

```
Request
  → api.js request interceptor injects Authorization: Bearer <token>
  → supabaseAuth.protect() calls supabase.auth.getUser(token)
  → On success: MongoDB user + role populated → req.user
  → On 401 from API: interceptor queues in-flight requests
  → POST /api/auth/refresh attempted with stored refresh token
  → On refresh success: new token stored, queued requests retried
  → On refresh failure: all tokens cleared → redirect /login
```

### Token Storage

| Token | localStorage Key | Cookie |
|---|---|---|
| Access token | `supabase_access_token` | `auth_token` (SameSite=Lax, 7-day) |
| Refresh token | `supabase_refresh_token` | — |
| Token expiry | `supabase_token_expiry` | — |
| User role | `user_role` | cookie |

### Session Listeners

`supabase.auth.onAuthStateChange` is registered in `AuthContext` for cross-tab synchronization. `SIGNED_OUT` events clear stored tokens and redirect to login.

---

## 9. Role-Based Permission System

### Design

The permission system is a flat string-based RBAC model. Each user holds one `Role`. Each role contains an array of permission strings. The `admin` role bypasses all checks entirely.

```
User ──── role (ObjectId) ───▶ Role
                                 └── permissions: [String]
```

### Permission String Taxonomy

```
manage:{resource}              ← broad, covers all sub-operations
action:{resource}              ← specific action
action:{resource}:{subtype}    ← most granular level
```

### Full Permission Enum

**Broad Permissions**

```
manage:events        manage:sermons       manage:gallery
manage:donations     manage:users         manage:roles
manage:blog          manage:livestream    manage:feedback
manage:volunteers    manage:settings      manage:announcements
```

**Donation — Granular**

```
view:campaigns       create:campaigns     edit:campaigns
delete:campaigns     activate:campaigns   feature:campaigns
view:pledges         view:pledges:all     approve:pledges
edit:pledges         view:payments        view:payments:all
process:payments     verify:payments      view:donation:reports
```

**Feedback — Granular (per category: sermon/service/testimony/suggestion/prayer/general)**

```
read:feedback:{category}       respond:feedback:{category}
archive:feedback:{category}    publish:feedback:testimony
view:feedback:stats
```

**System**

```
view:analytics       view:audit_logs
```

### Broad Permission Expansion

When `requirePermission` middleware detects a broad permission, it expands to all related granular strings before checking. This prevents needing to assign both `manage:feedback` and every individual `read:feedback:*` string.

| Broad | Expands to |
|---|---|
| `manage:feedback` | All `read:`, `respond:`, `archive:`, `publish:feedback:testimony`, `view:feedback:stats` |
| `manage:donations` | All campaign, pledge, payment, and donation report permissions |
| `manage:announcements` | `view:`, `create:`, `edit:`, `delete:announcements` |

### Enforcement Points

| Layer | How Enforced |
|---|---|
| Backend middleware | `requirePermission(...strings)` — checks before controller runs |
| Backend controller | Secondary in-function checks (`hasManageUsersPermission(req.user)`) |
| Frontend hook | `usePermissions()` — gates UI rendering and sidebar items |
| Frontend sidebar | `getAccessibleSections()` — builds sidebar from permitted routes only |

The backend and frontend enforce permissions independently. Frontend gating is a UX concern only — the backend never trusts client permission claims.

---

## 10. Portal Architecture

### Unified Portal Principle

There are no separate admin pages. All authenticated users — members and administrators — access the same portal routes. What differs is which sidebar items appear and which actions are available, controlled by the user's role permissions.

```
/portal                 ← dashboard (visible to all)
/portal/profile         ← own profile (all users)
/portal/bookmarks       ← saved sermons (all users)
/portal/announcements   ← view (all), manage (manage:announcements)
/portal/blog            ← manage:blog
/portal/sermons         ← manage:sermons
/portal/events          ← manage:events
/portal/gallery         ← manage:gallery
/portal/livestream      ← manage:livestream
/portal/feedback        ← read:feedback:* (any category)
/portal/volunteers      ← manage:volunteers
/portal/donations       ← any donation permission
/portal/email-notifications ← manage:users
/portal/users           ← manage:users
/portal/roles           ← manage:roles
/portal/analytics       ← view:analytics
/portal/notices         ← manage:announcements
/portal/settings        ← manage:settings
/portal/audit-logs      ← view:audit_logs
```

### Portal Layout Flow

```
User navigates to /portal/*
  ↓
PortalLayoutClient (client component)
  ├── Checks AuthContext.user on mount
  ├── If not authenticated → redirect /login?redirect=/portal/[page]
  ├── Renders PortalSidebar (items from usePermissions().getAccessibleSections())
  ├── Renders PortalHeader (NotificationBell, ThemeToggle, user info)
  └── Renders page content
```

### Notification Bell (SSE)

The `NotificationBell` component in the portal header maintains a persistent SSE connection to `/api/announcements/stream?token=<jwt>`. It displays an unread count badge and increments it on `new_announcement` events without requiring page reload.

Reconnection uses exponential backoff (base 2s, max 30s, up to 5 attempts). Auth errors halt reconnection permanently. A REST fallback (`/announcements/count/unread`) fetches the initial count on mount independently of SSE state.

---

## 11. Public Website Structure

### Layout Hierarchy

```
Root Layout (providers, fonts, metadata)
  └── Public Layout (NoticeBar + Header + Footer + DeferredChatbot)
        └── Page component (SSR or CSR)
```

**NoticeBar** reads active notice content from `/api/notices`. It measures its own height via `ResizeObserver` and exposes it as `--notice-height` CSS custom property. The Header reads this variable to offset its `top` position, preventing content overlap.

### Navigation

The **Header** component renders a full desktop nav and delegates to **MobileMenu** on smaller screens. Navigation links include:

- Primary: Home, About
- Dropdown (Content): Sermons, Past Livestreams, Events, Gallery, Blogs
- Secondary: Feedback, Donations, Volunteer, Portal
- Auth: Sign In button / user avatar + logout

### Page Inventory

| Route | Rendering | Data Source |
|---|---|---|
| `/` | SSR | Featured sermon, live status |
| `/about` | CSR | Static content |
| `/blog` | SSR | All approved blogs (passed as `initialBlogs`) |
| `/blog/[id]` | SSR | Blog detail by ID |
| `/sermons` | SSR | Sermon archive |
| `/sermons/[id]` | CSR | Sermon detail |
| `/events` | SSR | Upcoming events |
| `/events/[id]` | CSR | Event detail + registration |
| `/gallery` | SSR | All photos |
| `/donate` | SSR | Active campaigns |
| `/campaigns/[id]` | CSR | Campaign detail, pledges |
| `/livestream` | CSR | Livestream sessions |
| `/feedback` | CSR | Feedback forms |
| `/volunteer` | CSR | Application forms |
| `/contact` | CSR | Map + contact form |
| `/new-here` | CSR | Visitor onboarding |
| `/service-areas/[slug]` | CSR | Ministry detail |
| `/testimony/[id]` | CSR | Published testimony |
| `/login`, `/signup` | CSR | Auth forms |

---

## 12. Rendering Strategy

### Server-Side Rendering (SSR)

Used for pages where SEO is critical and content changes frequently. Data is fetched inside Next.js Server Components at request time using server-side fetch helpers in `src/lib/`.

```
Request arrives
  → Server Component runs
  → fetch('/api/sermons') with backend URL
  → HTML rendered with data
  → Sent to client
  → Client hydrates (interactive)
```

Pages: Homepage, Blog (list + detail), Events, Gallery, Sermons, Donate

### Client-Side Rendering (CSR)

Used for authenticated/portal pages and pages with high interactivity that are less SEO-critical. Data is fetched after component mount via hooks or TanStack Query.

Pages: About, Contact, Feedback, Livestream, New Here, Volunteer, Service Areas, Testimony Detail, all Portal pages

### Incremental Static Regeneration (ISR)

The sitemap uses `next: { revalidate: 3600 }` on its internal fetch call. Blog URLs in the sitemap are regenerated every hour without a full redeploy.

### Summary Table

| Strategy | Pages | Reason |
|---|---|---|
| SSR | Homepage, Blog, Events, Gallery, Sermons, Donate | SEO + fresh data |
| CSR | About, Contact, Feedback, Volunteer, Portal/* | Interactivity over SEO |
| ISR | Sitemap | Dynamic URLs with periodic refresh |

---

## 13. Database Structure Overview

All data except authentication identities is stored in **MongoDB Atlas**. Mongoose provides ODM with schema validation, virtuals, hooks, and index management.

### Collections

| Collection | Primary Purpose | Key Fields |
|---|---|---|
| `users` | Member profiles | `supabase_uid`, `role` (ref), `isBanned`, `authProvider` |
| `roles` | Permission groups | `name`, `permissions` (enum array), `isSystemRole` |
| `blogs` | Blog posts | `title`, `content`, `author`, `likes`, `views`, `category`, `slug` |
| `sermons` | Sermon entries | `title`, `type`, `content`, `mediaUrl`, `likes`, `bookmarks`, `views` |
| `events` | Church events | `title`, `date`, `capacity`, `registrations`, `status` |
| `gallery` | Photos | `imageUrl`, `cloudinaryPublicId`, `category`, `likes` |
| `feedback` | All feedback types | `category`, `feedbackData`, `status`, `isAnonymous`, `isDeleted` |
| `volunteers` | Applications | `ministry`, `status`, `applicant`, `hours` |
| `campaigns` | Donation campaigns | `goalAmount`, `currentAmount`, `status`, `milestones` |
| `announcements` | SSE-driven notices | `priority`, `targetAudience`, `readBy`, `expiresAt` |
| `notices` | Sticky header notice | `message`, `style`, `backgroundColor`, `dismissible` |
| `settings` | Singleton config | `emailSettings`, `paymentSettings`, `maintenanceMode`, `features` |
| `bannedusers` | Ban records | `email`, `ipAddresses`, `reason`, `bannedBy` |
| `auditlogs` | Action log | `action`, `userId`, `ip`, `method`, `path`, `statusCode` |
| `transactionauditlogs` | Payment audit | Payment-specific action records |
| `emaillogs` | Email delivery records | `to`, `subject`, `status`, `sentAt` |
| `livestreams` | Stream sessions | `embedUrl`, `platform`, `status`, `metadata` |

### Key Schema Design Decisions

**User → Role relationship:** Users hold a `role` ObjectId reference. The role document is populated on every `protect` middleware call, making permissions available throughout the request lifecycle without additional queries.

**Settings singleton:** The `Settings` model uses a static `getSettings()` method that creates a default document if none exists. This means MPESA credentials, email SMTP config, and feature flags are all editable via the admin Settings portal without a deployment.

**Feedback soft-delete:** Feedback items are not hard-deleted on first removal. They are marked `isDeleted: true` and moved to a recycle bin view. Permanent deletion is a separate action. The recycle bin retains items for 30 days.

**Announcement read tracking:** The `readBy` array on each Announcement document records which users have read each item and when, enabling unread count calculation for the notification bell.

---

## 14. API Communication

### REST

All REST communication goes through the Axios instance in `src/lib/api.js`.

**Request interceptor:** Injects `Authorization: Bearer <token>` on every outgoing request.

**Response interceptor logic:**

```
Response received
  ├── 200-299: pass through
  ├── 401 (first attempt):
  │     ├── Mark request as _retry
  │     ├── Add to failedQueue
  │     ├── POST /api/auth/refresh
  │     │     ├── Success: update stored token, retry queued requests
  │     │     └── Failure: clear all tokens, redirect /login
  │     └── Return refreshed response
  ├── 401 (_retry already set): reject immediately
  ├── 503: redirect to /maintenance
  └── 429: surface rate limit error to UI (no auto-retry)
```

**Service modules** in `src/services/api/` encapsulate all endpoint calls for each feature domain. Components and hooks import from these modules rather than calling `api.get/post` directly.

### Server-Sent Events (SSE)

SSE is used for the announcement notification system only.

```
Frontend (NotificationBell)          Backend (announcementController)
        │                                        │
        │── new EventSource('/api/              │
        │     announcements/stream?token=...')   │
        │                                        │── protectSSE middleware
        │                                        │── add to connections Map
        │◀── event: connected ─────────────────│
        │◀── event: unreadCount ────────────────│
        │                                        │
        │     [Admin creates announcement]        │
        │                                        │── broadcast to all connections
        │◀── event: new_announcement ───────────│
        │── increment badge count                │
        │                                        │
        │     [Client disconnects]               │
        │                                        │── remove from connections Map
```

SSE connection headers:
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

---

## 15. Livestream Integration

The platform supports embedding active and archived livestreams from YouTube and Facebook.

### How It Works

1. Admin creates a livestream record in the portal (`/portal/livestream`) with embed URL, platform (YouTube/Facebook), title, and status.
2. When `status === 'live'`, the homepage `LiveStreamSection` component renders automatically.
3. The `/livestream` page lists all sessions, with the live one featured at the top.
4. Viewers can pop the video into **Picture-in-Picture** mode via the `PiPContext`.

### Picture-in-Picture (PiP)

PiP state persists across page navigation using a combination of:
- `PiPContext` — global React context tracking the active PiP video URL and position
- `GlobalPiP.jsx` — renders the floating PiP player outside the page component tree
- `usePersistentPiP` hook — persists PiP state to IndexedDB via the service worker on page unload
- Service worker `SAVE_PIP_STATE` message handler — saves state to IndexedDB so it survives full page reloads

### Livestream Model Fields

```
embedUrl      Platform-specific embed URL (YouTube iframe src, Facebook embed)
platform      youtube | facebook
title         Display title
description   Optional description
status        live | scheduled | archived | ended
thumbnailUrl  Preview image
startTime     Scheduled/actual start time
endTime       When the session ended
viewCount     Tracked views
```

---

## 16. Event Registration System

### Registration Flow

```
1. Visitor views event on /events/[id]
2. Clicks "Register" → registration form modal
3. Submits name, email, phone (optional), attendance time slot
4. POST /api/events/:id/register
5. Backend checks:
   ├── Event status is active
   ├── Capacity not exceeded
   └── No duplicate registration for same email
6. Registration record created
7. Confirmation displayed to user
```

### Seat Management

Each event has a `capacity` field. The backend tracks `totalRegistrations` and `memberRegistrations` vs `visitorRegistrations` separately. When capacity is reached, registration is closed. The portal event manager can view all registrants and print a formatted attendee list.

### Portal Event Management

The `/portal/events` page (requires `manage:events`) provides:

- Event creation with title, description, date, time, location, capacity, image
- Edit and delete events
- View full registrant list with name, email, registration time
- Print-ready attendee list
- Registration count vs capacity display
- Analytics view (registration trend over time)

---

## 17. Donation Campaign System

### Campaign Lifecycle

```
draft → active → completed / archived
```

Campaigns are created by admins (`manage:donations`), set to `active` when ready, and automatically or manually moved to `completed` when the goal is reached or the end date passes. A cleanup job runs to check for overdue campaigns.

### Campaign Types

```
building    mission    event    equipment    benevolence    offering
```

### Payment Methods

| Method | Implementation |
|---|---|
| M-Pesa STK Push | Safaricom Daraja API — customer receives PIN prompt on phone |
| M-Pesa Paybill | Displayed as static text (Business Number + Account Ref) |
| M-Pesa Till | Displayed as static text (Till Number) |
| Bank Transfer | Bank name, account number, branch displayed |

### M-Pesa STK Push Flow

```
1. User enters phone number and amount
2. Frontend sends Idempotency-Key (UUID) + POST /api/payments/mpesa/initiate
3. Backend loads MPESA config from Settings (consumerKey, shortcode, passkey)
4. MpesaService.initiateSTKPush(phone, amount, accountRef, desc)
   ├── Requests OAuth token from Safaricom (cached 3500s)
   ├── Generates timestamp YYYYMMDDHHmmss
   ├── Generates password: base64(shortcode + passkey + timestamp)
   └── POSTs to /mpesa/stkpush/v1/processrequest
5. Returns CheckoutRequestID
6. Backend creates pending payment record
7. User receives MPESA PIN prompt
8. User enters PIN
9. Safaricom POSTs callback to /api/mpesa/callback
10. MpesaVerificationService validates callback structure
11. Re-queries Safaricom to verify transaction independently
12. On success (ResultCode === 0): updates payment status + campaign.currentAmount
13. On failure: marks payment failed
```

### Pledge System

Users can pledge a future donation to a campaign:

- Pledge records store: user, campaign, amount, due date, status (`pending | partial | completed | cancelled`)
- Admins can record manual payments against pledges
- Users can initiate M-Pesa payments against their own pledges
- Portal shows all pledges with fulfillment status and history

### Contribution System

Standalone contributions (not tied to a campaign or pledge) are recorded separately in the `contributions` collection. These appear in the Contributions tab in the portal donations page.

### Donation Analytics

A dedicated analytics endpoint (`/api/donations/analytics`) provides dashboard data including:
- Total raised per campaign
- Pledge fulfillment rates
- Payment method breakdown
- Monthly payment trends
- Top campaigns by amount raised

---

## 18. Feedback and Testimony System

### Five Feedback Categories

| Category | Form Fields | Special Features |
|---|---|---|
| Sermon Feedback | Sermon title/date, 5-star rating, resonated section, application steps, questions, would recommend | Rating display |
| Service Experience | First-time visitor flag, per-area ratings, what went well, improvements, would return | Multi-area ratings grid |
| Testimony | Type, title, story, testimony date, willing to share in service | Publishable to public |
| Suggestion | Type, title, priority level, description, importance, benefit, willing to help | Priority badges |
| Prayer Request | Urgency level, category, request, share on prayer list, personal prayer needed, preferred contact | Urgent animation flag |

All forms support anonymous submission. Authenticated users have name and email pre-filled.

### Feedback Lifecycle

```
submitted (pending)
  → reviewed (admin marks as reviewed)
  → responded (admin sends email response)
  → archived (removed from active queue)
  → [testimony only] published (appears on public /testimony pages)
  → soft-deleted (moved to recycle bin, retained 30 days)
  → permanently deleted
```

### Permission Model for Feedback

Feedback permissions are the most granular in the system. A role can be given read access to prayer requests only, without access to testimonies or suggestions. The full permission matrix:

```
read:feedback:{category}        view feedback items in that category
respond:feedback:{category}     send email responses to that category
archive:feedback:{category}     archive items in that category
publish:feedback:testimony      publish testimonies to public pages
view:feedback:stats             view feedback analytics
manage:feedback                 all of the above (broad override)
```

### Admin Response

When an admin responds to non-anonymous feedback, the system:
1. Saves the response text to the feedback record
2. Sends an email via `emailService` to the submitter's email address
3. Updates status to `responded`
4. Reports whether the email was successfully delivered

---

## 19. Volunteer Management System

### Application Flow

```
1. Visitor views /volunteer page
2. Selects ministry team (Ushering, Worship, Technical, Children's Ministry, etc.)
3. Fills application form: name, email, phone, experience, motivation, skills, availability
4. POST /api/volunteers/apply
5. Backend checks for existing application from same email for same ministry
6. Application created with status: pending
7. Admin views in /portal/volunteers
8. Admin approves or denies
9. On approval: status → approved, volunteer gains access to ministry resources
```

### Portal Management

The `/portal/volunteers` page (requires `manage:volunteers`) provides:
- List of all applications with ministry, applicant name, status
- Approve/deny actions with optional notes
- Filter by ministry and status
- View volunteer hours (manual entry by admin)
- Volunteer statistics (total, by ministry, total hours)

### Check for Duplicate Applications

`GET /api/volunteers/check-application?email=&ministry=` allows the frontend to check before submitting, providing a better UX by warning the user if they've already applied.

---

## 20. Analytics and Admin Capabilities

### Analytics Dashboard

The `/portal/analytics` page (requires `view:analytics`) provides a tabbed dashboard with six views:

| Tab | Data Shown |
|---|---|
| Overview | Total users, sermons, donations, events; user distribution; content performance bars |
| Users | Total, active, banned, new this month; breakdown by role, gender, auth provider |
| Content | Sermon overview cards; top 10 sermons by views/likes (filterable by period); category performance table; blog stats; top events by registrations; gallery top photos |
| Engagement | Feedback stats by category and status; volunteer stats by ministry and status; livestream stats |
| Financial | Campaign totals and goal progress; pledge fulfillment rates; payment method breakdown; M-Pesa stats |
| System | Total audit actions, success rate, failed logins, banned users, recent activity log |

### Content Leaderboards

The Content tab includes interactive leaderboards for sermons. Users can toggle between "Views" and "Likes" and filter by period (All, Week, Month, Year). The backend provides pre-aggregated arrays for each combination (`topByViewsWeek`, `topByLikesMonth`, etc.).

### User Management

The `/portal/users` page (requires `manage:users`) provides:

- Paginated user list with search by name/email/username/phone
- Filter by role and active/inactive status
- Edit user profile fields
- Update user role (admin only)
- Bulk role update for multiple users
- Ban user: creates `BannedUser` record, deletes from Supabase Auth, marks MongoDB record as banned
- Delete user: hard delete from both Supabase and MongoDB
- Manual registration: admin creates a user account on behalf of someone, generates temporary password
- Send bulk notification to users by role

### Role Management

The `/portal/roles` page (requires `manage:roles`) provides:

- Create new roles with custom permission sets
- View all roles and their assigned permissions
- Delete non-system roles
- System roles (`admin`, `member`) cannot be deleted

### Settings Panel

The `/portal/settings` page (requires `manage:settings`) provides:

- M-Pesa configuration: environment (sandbox/production), consumer key/secret, shortcode, passkey, callback URL
- Email SMTP configuration: host, port, credentials, from name/email
- Maintenance mode: enable/disable, custom message, estimated duration
- Feature flags: enable/disable blog, events, sermons, gallery, donations, volunteers, testimonies, livestream
- Notification preferences: which admin notifications to trigger
- Social media link management

---

## 21. PWA and Service Worker

### PWA Manifest

```json
{
  "name": "House of Transformation Church - Busia",
  "short_name": "Busia HOT Church",
  "display": "standalone",
  "start_url": "/",
  "theme_color": "#8B1A1A",
  "background_color": "#0f172a"
}
```

**Home Screen Shortcuts:**

| Shortcut | URL |
|---|---|
| Live Stream | `/livestream` |
| Sermons | `/sermons` |
| Events | `/events` |
| Donate | `/donate` |

### Service Worker (`public/sw.js`)

**Cache Strategy:** Network-first with cache fallback for GET requests.

```
Request received by SW
  ├── Is it a GET request?
  │     ├── Yes: Try network → success: cache + return | fail: return cached
  │     └── No (POST/PUT/DELETE): Pass through to network (never cached)
  │
  ├── Is path blacklisted?
  │     ├── /_next/static/chunks/ — excluded (dynamic chunks)
  │     ├── /api/ — excluded (always fresh)
  │     └── analytics scripts — excluded
  │
  └── Otherwise: cache in versioned cache
```

**Cache versioning:** Cache name includes a `Date.now()` timestamp baked in at build time. On `activate`, old caches are purged.

**Wake Lock:** On page visibility change, if a PiP session is active, the SW re-requests `navigator.wakeLock.request('screen')` to prevent screen sleep during video playback.

**Push Notifications:** The service worker includes push notification support for PiP reminders.

### ServiceWorkerRegister Component

- Registers `/sw.js` on mount
- Polls for SW updates every 60 seconds
- On new SW detected: waits for `controllerchange` event, then calls `window.location.reload()` for a seamless update

### Splash Screen

A `SplashScreen` component renders on initial PWA load for a native app-like transition before the main content appears.

---

## 22. SEO Strategy

### Metadata System

All SSR pages export a `metadata` object:

```js
export const metadata = {
  title: 'Page Title',
  description: '...',
  keywords: '...',
  openGraph: { title, description, images, url },
  twitter: { card: 'summary_large_image', ... }
};
```

Root layout defines the title template:
```js
title: {
  template: '%s | Busia House of Transformation Church',
  default: 'House of Transformation Church | Busia, Kenya'
}
```

### JSON-LD Structured Data

The homepage injects a `Church` schema:

```json
{
  "@context": "https://schema.org",
  "@type": "Church",
  "name": "Busia House of Transformation",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Busia Town",
    "addressRegion": "Busia County",
    "addressCountry": "KE"
  },
  "openingHours": "Su 09:00-12:00",
  "telephone": "+254726793503"
}
```

The blog list page injects `CollectionPage` + `ItemList` schema for blog post discovery.

### Sitemap

`src/app/sitemap.js` generates a dynamic XML sitemap combining:
- Static pages with defined priorities (homepage: 1.0, blog: 0.9, sermons: 0.9)
- All approved blog post URLs fetched from the API (revalidated every hour)
- Fallback to static-only if API fetch fails

### Robots

Configured via root layout `metadata.robots`:
```js
robots: {
  index: true,
  follow: true,
  googleBot: {
    'max-image-preview': 'large',
    'max-snippet': -1
  }
}
```

### Image Optimization

- `next/image` with AVIF + WebP auto format selection
- Remote patterns configured for Cloudinary, YouTube thumbnails
- `Cache-Control: public, max-age=31536000, immutable` on all static assets

### Performance-Aware SEO

- Google Analytics deferred via `dynamic(() => import(...), { ssr: false })`
- DNS prefetch for GTM and Analytics domains
- Preconnect to Cloudinary
- Framework, Framer Motion, and vendor chunks split separately

---

## 23. Security Considerations

### Authentication

- All tokens verified with Supabase on every protected request — no local verification that could be bypassed
- `protect` middleware populates `role.permissions` from MongoDB on every request — client cannot inject permission claims
- Admin bypass is based on database `role.name`, not a token claim
- Refresh tokens are single-use; failure clears all credentials immediately

### Ban System

- Banned users are deleted from Supabase Auth, blocking re-login with same credentials
- `BannedUser` records store email and IP address — both checked at signup and login
- Admins cannot ban themselves or other admins
- IP tracking uses `X-Forwarded-For` correctly via `trust proxy: 1`

### Input Security

- `isomorphic-dompurify` sanitizes HTML content before storage (blog posts, sermon content)
- `express-validator` validates request bodies on auth and payment endpoints
- Mongoose schema validation provides database-level type enforcement

### Payment Security

- M-Pesa callbacks are validated for structure before any database writes
- `MpesaVerificationService` re-queries Safaricom after each callback to confirm the transaction independently — prevents spoofed callbacks
- Idempotency keys prevent double-charging on network retries
- M-Pesa credentials stored in MongoDB Settings (not hardcoded) and loaded at runtime

### File Upload Security

- Cloudinary API secret never exposed to the browser
- Gallery deletions routed through the backend API using server-side admin credentials
- File type validation on both frontend (`cloudinaryUpload.js`) and backend (Multer `fileFilter`)
- 5MB file size limit enforced at upload middleware

### Rate Limiting

| Endpoint Class | Limit |
|---|---|
| All API routes | 1000 req / 15 min |
| Login | 10 attempts / 15 min (successful attempts excluded) |
| Signup | 5 attempts / 15 min |

### CORS

Strict origin whitelist in production. Development allows localhost and Postman. `credentials: true` enables cookie transmission.

### Error Responses

Stack traces and internal error messages are suppressed in production. Only generic messages are returned for 500-level errors.

---

## 24. Performance Considerations

### Frontend

| Technique | Implementation |
|---|---|
| Code splitting | Next.js automatic + custom webpack chunk groups (framework, framer, lib-*, common) |
| Deferred loading | Analytics, service worker, chatbot loaded with `dynamic({ ssr: false })` after hydration |
| Image optimization | `next/image` with AVIF/WebP, lazy loading, `sizes` attribute |
| SSR for critical pages | Homepage, blog, events rendered server-side, eliminating client data fetches |
| TanStack Query cache | `staleTime: 30000` avoids redundant requests on tab re-focus |
| Static asset caching | `max-age=31536000, immutable` on all `/_next/static/` resources |
| Build ID versioning | `generateBuildId: () => Date.now()` prevents stale chunk loading after deploys |
| Preconnect | Cloudinary domain preconnected in root layout |

### Backend

| Technique | Implementation |
|---|---|
| Connection pooling | Mongoose pool: maxPoolSize 10, minPoolSize 5 |
| MongoDB indexes | Compound indexes on frequently queried fields (status, createdAt, role, isBanned) |
| MPESA token caching | Access token cached in-memory for 3500s |
| Email transporter caching | Nodemailer transporter cached for 5 minutes |
| asyncHandler | Prevents callback-based error patterns, enables Express error propagation |
| SSE connection map | In-memory Map for O(1) connection lookup during broadcasts |

---

## 25. Scalability Considerations

### Current Architecture Limits

| Component | Current Approach | Limit |
|---|---|---|
| SSE connections | In-memory Map on single server instance | Does not scale horizontally |
| Email transporter | Singleton with 5-min cache | Single SMTP connection pool |
| MPESA token | Cached per server instance | Duplicated across instances |
| Session state | Stateless (JWT-based) | Scales horizontally without changes |

### Horizontal Scaling Path

**SSE (Announcements):** The in-memory connection map must be replaced with a Redis pub/sub layer if multiple server instances are deployed. Each instance subscribes to a Redis channel; broadcasts publish to Redis which notifies all instances.

**MPESA token cache:** Move to Redis with a shared TTL key so all instances share one cached token.

**Database:** MongoDB Atlas supports read replicas and sharding. The current schema is suitable for shard key candidates (`userId`, `createdAt`).

**Frontend:** Next.js on Netlify scales statically at the CDN edge. SSR functions scale via Netlify's serverless function infrastructure.

### Storage Scaling

All media is stored in Cloudinary — no local storage dependencies in production. Gallery, sermon thumbnails, and user avatars all route through Cloudinary CDN, which handles scaling independently.

---

## 26. Deployment Overview

### Frontend (Netlify)

```toml
# netlify.toml
[build]
  command = "npm run build"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

`@netlify/plugin-nextjs` handles SSR function routing, ISR, and image optimization automatically.

**Cache headers (configured in next.config.js):**
- `/_next/static/*` → `Cache-Control: public, max-age=31536000, immutable`
- All other routes → `Cache-Control: public, max-age=0, must-revalidate`

**Admin rewrite:** `/admin/:path*` is proxied to a separate Vercel admin deployment:
```js
rewrites: [{ source: '/admin/:path*', destination: 'https://hotadmin.vercel.app/:path*' }]
```

### Backend (Node.js host)

```bash
npm start    # node server.js
npm run dev  # nodemon server.js
```

**Requirements:**
- `NODE_ENV=production`
- `trust proxy: 1` (already set — works on Render, Railway, Fly.io)
- M-Pesa callback URL must be a publicly reachable HTTPS endpoint

### Environment Loading

The backend loads `.env` from one level above the `server/` directory:
```js
dotenv.config({ path: path.resolve(__dirname, '../.env') });
```

### First-Time Setup Scripts

```bash
node scripts/seedRoles.js      # Creates default roles (admin, member, etc.)
node scripts/createAdmin.js    # Creates initial admin user
```

---

## 27. Environment Variables

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=https://your-api.onrender.com/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=user_avatars
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Backend (`../.env`)

```env
# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.netlify.app

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/church_db

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key     ← server-side only, never expose

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret          ← server-side only

# M-Pesa (initial fallback; override via Settings panel)
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your-passkey

# Email (initial fallback; override via Settings panel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your-app-password

# AI Services (optional)
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=AIza...
```

| Variable | Sensitivity | Notes |
|---|---|---|
| `SUPABASE_SERVICE_KEY` | Critical secret | Grants admin access to Supabase Auth — server only |
| `CLOUDINARY_API_SECRET` | Secret | Required for media deletion — server only |
| `MPESA_CONSUMER_SECRET` | Secret | Payment auth — server only |
| `SUPABASE_ANON_KEY` | Public-safe | Can be in frontend env |
| `NEXT_PUBLIC_*` | Public | Exposed to browser — no secrets |

---

## 28. Maintenance Considerations

### Scheduled Jobs

`utils/cleanupJobs.js` runs on server startup:
- Expired idempotency keys (Supabase `idempotency_keys` table, 24-hour TTL)
- Announcements past their `expiresAt` date
- Overdue campaign status checks

### Settings Without Redeployment

The `Settings` singleton in MongoDB allows updating the following at runtime without any code change or restart:
- SMTP credentials and email configuration
- M-Pesa keys, shortcode, passkey, environment (sandbox/production)
- Maintenance mode (enable/disable, custom message, allowed IPs)
- Feature flags (disable any section of the platform)
- Social media links, contact info

### Maintenance Mode

When `Settings.maintenanceMode.enabled === true`, the API returns `503` responses to all non-public endpoints. The frontend Axios interceptor detects `503` and redirects to `/maintenance`. The maintenance page displays the admin-configured message and estimated restoration time.

### Database Maintenance

- MongoDB Atlas automated backups should be configured (Atlas M10+ tier)
- Index review recommended if query times increase: primary candidates are `feedback.status`, `blog.createdAt`, `events.date`
- The `auditlogs` collection grows continuously — consider a TTL index on `createdAt` for logs older than 90 days

### Service Worker Updates

The SW auto-updates every 60 seconds in production. When a new deployment occurs:
1. New SW detected via `updatefound` event
2. `window.location.reload()` triggered after `controllerchange`
3. Users receive the update without manual intervention

### M-Pesa Callback URL

If the server URL changes, the M-Pesa callback URL must be updated in:
1. `Settings.paymentSettings.mpesa.callbackUrl` (via admin Settings panel)
2. Safaricom Daraja API developer portal (may require re-registration)

---

## 29. Future Improvement Opportunities

### Real-Time

- **Replace in-memory SSE map with Redis pub/sub** to enable horizontal scaling of the announcement system
- **WebSocket upgrade** for the announcement channel to support bi-directional communication (e.g., typing indicators in admin response)

### Payment

- **Stripe integration** — Settings model already has `paymentSettings.stripe` structure; implementation pending
- **M-Pesa C2B (Paybill direct)** — `registerC2BUrls()` method exists in `MpesaService` but is not yet wired into a route
- **Automated payment reconciliation** — periodic job to query Safaricom for pending `checkoutRequestId` records and resolve their status

### AI Features

- **Auto-captions for all uploaded gallery photos** — the `captionWorker` exists; a queue-driven approach with status tracking could be added
- **Sermon transcript search** — index YouTube transcripts in a search engine (e.g., Meilisearch, Typesense) for full-text sermon discovery
- **Automated sermon summaries published to blog** — trigger `aiSummaryFromTranscript` on new sermon creation

### Content

- **Email newsletter system** — `EmailTemplate` model and `EmailLog` are already in place; a newsletter builder with template editing would extend the existing infrastructure
- **Push notifications** — service worker already handles push events; a backend push notification service (e.g., web-push library) could send alerts for new sermons, events, and announcements
- **Multi-language support** — Next.js i18n routing with Swahili/English toggle

### Operations

- **Centralized logging** — Replace `console.log` with a structured logger (e.g., Winston, Pino) with log levels, outputting to a log aggregation service
- **Monitoring and alerting** — Add uptime monitoring, error rate alerts, and payment failure notifications
- **Automated testing** — `jest` and `supertest` are already in `devDependencies`; test coverage for auth middleware, permission expansion, and payment flow would reduce regression risk

---

## 30. Conclusion and Project Summary

### System Scale

The House of Transformation platform is a **full-stack, production-grade web application** comprising:

| Metric | Count |
|---|---|
| Frontend pages | 30+ routes |
| Backend API routes | 25+ route files, 100+ individual endpoints |
| MongoDB collections | 19 |
| Permission strings | 50+ |
| Portal management sections | 18 |
| External service integrations | 6 (Supabase, MongoDB, Cloudinary, Safaricom, Nodemailer, YouTube/Facebook) |
| AI service integrations | 2 (Anthropic, Google Gemini) |

### Engineering Complexity

The platform incorporates several non-trivial engineering decisions:

**Unified RBAC portal** — A single codebase serves both members and administrators. The same pages adapt their UI, available actions, and data visibility based on a 50+ permission string system enforced independently on both frontend and backend.

**Dual-layer auth** — Supabase handles identity; MongoDB stores profiles and roles. Every protected request makes a live Supabase token verification call and a MongoDB role population query. The system handles OAuth sync, token refresh queuing, ban enforcement, and self-deletion across both systems.

**M-Pesa payment security** — STK Push callbacks are validated structurally and re-verified with Safaricom independently. Idempotency keys prevent duplicate charges. Credentials are runtime-configurable via the admin settings panel.

**SSE announcement delivery** — Real-time notifications reach all connected portal users without polling. The connection lifecycle includes authentication, exponential-backoff reconnection, and graceful error delivery.

**PWA with persistent PiP** — Video playback persists in a floating overlay across page navigation. PiP state survives full page reloads via IndexedDB written by the service worker.

**Configurable infrastructure** — SMTP, M-Pesa credentials, feature flags, and maintenance mode are all stored in MongoDB and editable at runtime through the admin settings panel. No redeployment is required for operational configuration changes.

### Suitability Assessment

The platform is appropriately architected for a growing church community. The infrastructure handles:
- Public website traffic with SSR caching and CDN static asset delivery
- Concurrent portal users with optimistic UI updates via TanStack Query
- Real-time announcement broadcasts to all connected members
- M-Pesa payment processing with the callback infrastructure required for production payments in Kenya

The primary scaling concern — horizontal SSE connections — has a clear upgrade path to Redis pub/sub when traffic warrants it.

---

*Documentation generated from source code analysis. Reflects the implemented system as of the documented file versions.*  
*Built by [Bryant](https://x.com/rockstarbryant)*