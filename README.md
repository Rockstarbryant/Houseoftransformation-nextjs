# House of Transformation Church — Frontend

A full-featured church management and engagement web platform built with **Next.js App Router**. Serves both public visitors and authenticated church members through a unified portal system with role-based access control.

**Live URL:** `https://houseoftransformation-nextjs.vercel.app`

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Key Features](#2-key-features)
3. [Tech Stack](#3-tech-stack)
4. [Architecture Overview](#4-architecture-overview)
5. [Rendering Strategy](#5-rendering-strategy)
6. [Project Folder Structure](#6-project-folder-structure)
7. [Public Pages](#7-public-pages)
8. [Portal System](#8-portal-system)
9. [Authentication Flow](#9-authentication-flow)
10. [Role & Permission System](#10-role--permission-system)
11. [API Communication](#11-api-communication)
12. [PWA Support](#12-pwa-support)
13. [SEO Strategy](#13-seo-strategy)
14. [Environment Variables](#14-environment-variables)
15. [Installation Guide](#15-installation-guide)
16. [Running the Development Server](#16-running-the-development-server)
17. [Production Build](#17-production-build)
18. [Deployment Notes](#18-deployment-notes)
19. [Security Considerations](#19-security-considerations)
20. [Contributing Guide](#20-contributing-guide)
21. [License](#21-license)

---

## 1. Project Overview

House of Transformation (H.O.T) is a church based in Busia County, Kenya. This repository is the **Next.js frontend** that powers the church's public website and member portal.

The platform is architected around a **unified portal** — there are no separate admin-only pages. Members and administrators use the same interface; access to features and UI elements is gated entirely by a role-based permission system backed by the REST API.

Key design decisions:

- Server components fetch data at request time for SEO-critical pages (homepage, blog, events, sermons, gallery, donate).
- All portal pages are client-side rendered, communicating with a Node.js/Express backend via REST.
- Announcements use Server-Sent Events (SSE) for real-time delivery.
- A Progressive Web App (PWA) layer provides installability and offline shell support.
- Authentication is handled by Supabase (Email/Password + Google OAuth), with JWTs forwarded to the backend for all protected API calls.

---

## 2. Key Features

**Public Website**

- Homepage with hero, livestream detection, quick info bar, sermons, events carousel, donation campaigns, and service areas sections
- Blog system with per-device view counting, likes, and category filtering
- Sermon archive with text and media cards, likes, bookmarks, and per-device view tracking
- YouTube and Facebook livestream integration with live/offline detection and Picture-in-Picture (PiP) support
- Event registration system with seat reservation (name, email, attendance time)
- Donation campaigns with MPESA STK push, Paybill/Till copy, and bank details
- Church gallery with category filtering and photo likes
- Volunteer applications across multiple ministry departments
- Five-form feedback system: sermon, service, testimony, suggestion, prayer request — all supporting anonymous submission
- "New Here" onboarding page with service times and plan-your-visit form
- Service areas / ministries directory with individual slug pages
- Contact page with embedded Google Maps and contact form
- Sticky notice bar driven by admin content, with marquee or static display modes
- Integrated AI chatbot for visitor assistance

**Member Portal**

- Analytics dashboard: users, content performance, engagement, financial, system audit
- Blog management: create, edit, delete posts with rich text (TipTap editor)
- Event management: create/edit/delete events, view and print registered attendees
- Sermon publishing with YouTube/Facebook embed or text content
- Livestream management: add streams, set metadata, archive, end live
- Gallery management: upload and delete photos (Cloudinary)
- Feedback moderation: view, respond, archive, publish testimony, soft-delete with recycle bin
- Volunteer application review: approve or deny per ministry
- Email notifications: send targeted emails by role or to all members
- Role and permission management: create roles, assign granular permissions
- User management: edit, add, delete, or ban members
- Announcement system with real-time SSE delivery to connected clients
- Website notice bar management (sticky header notices)
- Bookmarks: personal saved sermons
- Profile management with Cloudinary avatar upload and account deletion
- Donation management: campaigns, pledges, MPESA payments, manual payment recording, analytics

---

## 3. Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | JavaScript (JSX) |
| Styling | Tailwind CSS v3 |
| Authentication | Supabase (`@supabase/supabase-js`) |
| HTTP Client | Axios |
| Server State | TanStack Query (React Query) v5 |
| Rich Text Editor | TipTap |
| Markdown Editor | SimpleMDE / react-simplemde-editor |
| Markdown Rendering | react-markdown + remark-gfm |
| Animations | Framer Motion |
| Icons | Lucide React, Heroicons, Iconify |
| Charts | Recharts |
| Image Hosting | Cloudinary |
| Notifications | Sonner |
| Token Storage | localStorage + cookies (custom tokenService) |
| File Export | file-saver, jszip |
| Analytics | Vercel Analytics + Speed Insights |
| Deployment | Netlify (via `@netlify/plugin-nextjs`) |
| Linting | ESLint (Next.js config) |
| CSS Processing | PostCSS |

---

## 4. Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  Next.js Frontend                │
│                                                  │
│  ┌─────────────┐        ┌──────────────────────┐ │
│  │  Public     │        │  Portal (/portal)    │ │
│  │  /(public)  │        │  CSR — auth-gated    │ │
│  │  SSR + CSR  │        │  role-based UI       │ │
│  └──────┬──────┘        └──────────┬───────────┘ │
│         │                          │             │
│         └──────────┬───────────────┘             │
│                    │                             │
│            ┌───────▼────────┐                    │
│            │  AuthContext   │                    │
│            │  (Supabase +   │                    │
│            │   Backend JWT) │                    │
│            └───────┬────────┘                    │
│                    │                             │
│            ┌───────▼────────┐                    │
│            │  Axios (api.js)│                    │
│            │  JWT interceptor│                   │
│            │  auto-refresh  │                    │
│            └───────┬────────┘                    │
└────────────────────│────────────────────────────┘
                     │  REST (JSON) / SSE
        ┌────────────▼──────────────┐
        │  Node.js / Express API    │
        │  (separate backend repo)  │
        └────────────┬──────────────┘
                     │
        ┌────────────▼──────────────┐
        │  MongoDB Atlas            │
        │  (content, users, roles)  │
        └───────────────────────────┘
                     │
        ┌────────────▼──────────────┐
        │  Supabase                 │
        │  (auth identity store)    │
        └───────────────────────────┘
```

**Context Providers (root layout)**

- `QueryProvider` — TanStack Query client
- `ThemeProvider` — dark/light mode via `class` strategy
- `PiPProvider` — persistent Picture-in-Picture state across routes
- `Providers` — wraps `AuthProvider`
- `SplashScreen` — PWA splash on app load
- `ClientOnlyComponents` — deferred client-only items (Google Analytics, service worker registration, update notification)

**Request flow for authenticated calls:**

1. `api.js` (Axios instance) attaches `Authorization: Bearer <token>` on every request via request interceptor.
2. On `401`, the interceptor attempts a single token refresh via `/auth/refresh`.
3. In-flight requests are queued during the refresh. On failure, all tokens are cleared and the user is redirected to `/login`.
4. On `503`, the user is redirected to `/maintenance`.

---

## 5. Rendering Strategy

### Server-Side Rendered (SSR)

These pages fetch data on every request from the backend API and return fully rendered HTML. This ensures fresh content and full SEO indexability.

| Route | Page |
|---|---|
| `/` | Homepage |
| `/blog` | Blog list |
| `/blog/[id]` | Blog detail |
| `/events` | Events list |
| `/gallery` | Gallery |
| `/sermons` | Sermons archive |
| `/donate` | Donate page |

The sitemap (`/sitemap.js`) also runs server-side and fetches dynamic blog URLs at build/revalidation time with a 1-hour revalidation window.

### Client-Side Rendered (CSR)

These pages render entirely in the browser. Data is fetched after mount via hooks or TanStack Query. Used for pages that are either less SEO-critical or require heavy user interaction.

| Route | Page |
|---|---|
| `/about` | About page |
| `/campaigns/[id]` | Campaign detail |
| `/contact` | Contact + map |
| `/feedback` | Feedback forms |
| `/livestream` | Livestream page |
| `/new-here` | New visitor onboarding |
| `/service-areas`, `/service-areas/[slug]` | Ministries |
| `/testimony/[id]` | Testimony detail |
| `/volunteer` | Volunteer applications |
| `/portal/*` | All portal pages |

### Incremental Static Regeneration (ISR)

The sitemap uses `next: { revalidate: 3600 }` on its internal fetch, regenerating the blog URL list every hour without a full redeploy.

---

## 6. Project Folder Structure

```
house-of-transformation-nextjs/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   └── llms.txt               # LLM crawl hints
├── src/
│   ├── app/
│   │   ├── layout.jsx         # Root layout — providers, metadata, fonts
│   │   ├── loading.jsx        # Global loading UI
│   │   ├── sitemap.js         # Dynamic XML sitemap
│   │   ├── (public)/          # Public route group
│   │   │   ├── layout.jsx     # Public layout: NoticeBar, Header, Footer, Chatbot
│   │   │   ├── page.jsx       # Homepage (SSR)
│   │   │   ├── blog/
│   │   │   ├── events/
│   │   │   ├── sermons/
│   │   │   ├── gallery/
│   │   │   ├── donate/
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   ├── feedback/
│   │   │   ├── livestream/
│   │   │   ├── new-here/
│   │   │   ├── service-areas/
│   │   │   ├── volunteer/
│   │   │   ├── campaigns/[id]/
│   │   │   ├── testimony/[id]/
│   │   │   ├── profile/[userId]/
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/[token]/
│   │   │   └── verify-email/[token]/
│   │   ├── portal/            # Member/admin portal (all CSR)
│   │   │   ├── layout.jsx
│   │   │   ├── page.jsx       # Portal dashboard
│   │   │   ├── analytics/
│   │   │   ├── announcements/
│   │   │   ├── blog/
│   │   │   ├── bookmarks/
│   │   │   ├── donations/
│   │   │   ├── email-notifications/
│   │   │   ├── events/
│   │   │   ├── feedback/
│   │   │   ├── gallery/
│   │   │   ├── livestream/
│   │   │   ├── notices/
│   │   │   ├── profile/
│   │   │   ├── roles/
│   │   │   ├── sermons/
│   │   │   ├── settings/
│   │   │   ├── users/
│   │   │   └── volunteers/
│   │   ├── auth/callback/     # Supabase OAuth callback handler
│   │   └── maintenance/       # Maintenance mode page
│   ├── components/
│   │   ├── layout/            # Header, Footer, NoticeBar, MobileMenu, PortalSidebar
│   │   ├── common/            # Button, Card, Modal, Loader, Toast, ProtectedRoute
│   │   ├── auth/              # LoginForm, SignupForm, AuthModal, etc.
│   │   ├── portal/            # PortalDashboardClient, BookmarksClient
│   │   ├── blog/              # BlogCard, BlogList, BlogPageClient, CreateBlogForm
│   │   ├── sermons/           # SermonCard, SermonList, SermonsClient
│   │   ├── events/            # EventCard, EventCarousel, EventsClient
│   │   ├── gallery/           # GalleryClient, GalleryGrid, PhotoModal
│   │   ├── donations/         # MpesaModal, PledgeForm, DonationSection, analytics
│   │   ├── feedback/          # All feedback forms, TestimonyForm
│   │   ├── livestream/        # LivestreamClient
│   │   ├── home/              # HeroSection, QuickInfoBar, LiveStreamSection
│   │   ├── chatbot/           # Chatbot, DeferredChatbot, ChatMessage
│   │   ├── providers/         # QueryProvider, Providers
│   │   ├── GlobalPiP.jsx      # Global Picture-in-Picture overlay
│   │   ├── NotificationBell.jsx # SSE-powered real-time bell
│   │   ├── ServiceWorkerRegister.jsx
│   │   └── ClientOnlyComponents.jsx
│   ├── context/
│   │   ├── AuthContext.jsx    # Auth state, login, logout, permission helpers
│   │   ├── ThemeContext.jsx   # Dark/light mode
│   │   ├── PiPContext.jsx     # Picture-in-Picture global state
│   │   ├── DonationContext.jsx
│   │   └── ChatbotContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── usePermissions.js  # All feature permission checks
│   │   ├── useFetch.js
│   │   ├── useLivestream.js
│   │   ├── usePersistentPiP.js
│   │   ├── useAnalytics.js
│   │   ├── useAudit.js
│   │   └── useLocalStorage.js
│   ├── lib/
│   │   ├── api.js             # Axios instance with JWT + refresh interceptors
│   │   ├── supabaseClient.js  # Supabase browser client
│   │   ├── tokenService.js    # JWT storage (localStorage + cookie)
│   │   ├── cloudinaryUpload.js
│   │   ├── blog.js            # Server-side blog fetch helpers
│   │   ├── sermons.js         # Server-side sermon fetch helpers
│   │   └── events.js / gallery.js / etc.
│   ├── services/api/          # Feature-specific API service modules
│   │   ├── authService.js
│   │   ├── blogService.js
│   │   ├── eventService.js
│   │   ├── feedbackService.js
│   │   ├── donationService.js
│   │   ├── analyticsService.js
│   │   ├── roleService.js
│   │   ├── userService.js
│   │   └── ...
│   └── utils/
│       ├── constants.js       # Church info, service times, API endpoint map, roles
│       ├── deviceId.js        # Persistent device ID for view tracking
│       ├── formatters.js
│       ├── helpers.js
│       ├── validators.js
│       └── donationHelpers.js
├── next.config.js
├── tailwind.config.js
├── netlify.toml
└── package.json
```

---

## 7. Public Pages

### Homepage (`/`) — SSR

Server component. Fetches featured/pinned sermon at request time. Sections rendered in order:

- `HeroSection` — hero with "New Here" CTA
- `LiveStreamSection` — visible only when a livestream is active
- `QuickInfoBar` — service times, links to contact, donate, service areas
- `AboutSection` (preview) — church identity card
- Featured Sermon — pinned or most recent sermon card
- `EventCarousel` — upcoming 5 events, swipeable
- `DonationSection` — featured campaigns + tithe/offering payment details
- Service Areas — first 3 ministry cards

Includes JSON-LD `Church` schema script and full OpenGraph metadata.

### Blog (`/blog`, `/blog/[id]`) — SSR

`/blog` fetches all approved blogs server-side and passes them as `initialBlogs` to `BlogPageClient` for client-side filtering. Blog detail pages count views per unique device ID via `deviceId.js` and support a like system.

### Events (`/events`) — SSR

Fetches upcoming events server-side. Registration (name, email, attendance time) handled client-side.

### Gallery (`/gallery`) — SSR

Fetches photos server-side. Client-side filtering by category and photo like interactions.

### Sermons (`/sermons`) — SSR

Fetches sermon archive server-side. Sermon cards support likes, bookmarks, and per-device view counting. Cards render as either text or media type based on `detectSermonType()`.

### Donate (`/donate`) — SSR

Fetches active donation campaigns server-side. Displays tithe/offering payment details (MPESA Paybill, Till, bank) and campaign cards linking to `/campaigns/[id]`.

### About (`/about`) — CSR

Renders mission, vision, history, leadership, core beliefs, and FAQ accordion. No API calls.

### Contact (`/contact`) — CSR

Google Maps embed using church coordinates from `constants.js`. Contact form submitted via REST.

### Feedback (`/feedback`) — CSR

Five tab-based forms: Sermon Feedback, Service Experience, Testimony, Suggestion, Prayer Request. All support anonymous submission. When authenticated, name and email are pre-filled automatically.

### Livestream (`/livestream`) — CSR

Displays YouTube and Facebook embedded streams. Detects live vs. archived. Supports PiP via `PiPContext`.

### New Here (`/new-here`) — CSR

Onboarding page: what to expect, service times, plan-your-visit form.

### Volunteer (`/volunteer`) — CSR

Ministry-specific application forms (Ushering, Worship, Technical, Children's Ministry). Each form captures name, email, experience, motivation, and relevant skills.

### Service Areas (`/service-areas`, `/service-areas/[slug]`) — CSR

Directory of ministries. Slug pages use static data from `src/data/serviceAreas.js`.

### Campaigns (`/campaigns/[id]`) — CSR

Full campaign detail: title, description, goal progress bar, MPESA STK push integration, manual payment details, and pledge link.

### Testimony (`/testimony/[id]`) — CSR

Individual published testimony detail page.

---

## 8. Portal System

The portal is accessed at `/portal` and requires authentication. All pages are **Client-Side Rendered**.

### Architecture

There are **no separate admin-only pages**. Members and admins use identical routes. The sidebar items rendered by `usePermissions().getAccessibleSections()` reflect only what the current user's role permits. All mutation actions are also validated on the backend.

The portal layout (`PortalLayoutClient.jsx`) handles:

- Auth check on mount — redirects to `/login?redirect=/portal` if unauthenticated
- Toggleable sidebar with overlay (works on both mobile and desktop)
- Persistent portal header with notification bell and sidebar toggle

### Portal Pages

| Route | Access | Description |
|---|---|---|
| `/portal` | All authenticated users | Dashboard overview |
| `/portal/profile` | All authenticated users | Profile details, avatar upload, account deletion |
| `/portal/bookmarks` | All authenticated users | Saved sermons and liked content |
| `/portal/announcements` | All users (view) / `manage:announcements` (create/edit/delete) | Announcement list and management |
| `/portal/notices` | `manage:announcements` | Website sticky notice bar management |
| `/portal/blog` | `manage:blog` | Blog post creation, editing, deletion |
| `/portal/sermons` | `manage:sermons` | Sermon publishing and management |
| `/portal/events` | `manage:events` | Event creation, editing, registered attendee view/print |
| `/portal/gallery` | `manage:gallery` | Photo upload and deletion via Cloudinary |
| `/portal/livestream` | `manage:livestream` | Add/edit/archive/delete livestream entries |
| `/portal/feedback` | Feedback read permissions | View, respond, archive, publish testimony, soft-delete |
| `/portal/volunteers` | `manage:volunteers` | Approve or deny volunteer applications |
| `/portal/donations` | Donation-related permissions | Campaigns, pledges, payments, analytics |
| `/portal/email-notifications` | `manage:users` or admin | Send emails by role or broadcast |
| `/portal/users` | `manage:users` | View, edit, add, delete, ban members |
| `/portal/roles` | `manage:roles` | Create roles, assign granular permissions |
| `/portal/analytics` | `view:analytics` | Full analytics dashboard (6 views) |
| `/portal/settings` | `manage:settings` | MPESA config, maintenance mode toggle |

### Portal Sidebar Navigation

`usePermissions().getAccessibleSections()` returns a filtered array of sidebar items based on the current user's permission set. Profile and Bookmarks are always included. All other items are conditionally included based on specific permission strings.

---

## 9. Authentication Flow

Authentication uses **Supabase** as the identity provider, with JWTs forwarded to a custom Node.js backend for session management and user data sync.

### Email / Password Login

```
User submits credentials
  → POST /auth/login (backend)
  → Backend validates, returns { token, refreshToken, user }
  → tokenService.setToken() — stores JWT in localStorage + cookie
  → tokenService.setRefreshToken() — stores refresh token in localStorage
  → AuthContext.setUser() — user state updated
  → Redirect to /portal or previous page
```

### Google OAuth (Supabase)

```
User clicks "Continue with Google"
  → supabase.auth.signInWithOAuth({ provider: 'google', redirectTo: '/auth/callback' })
  → Supabase handles OAuth flow
  → /auth/callback page receives session
  → POST /auth/oauth-sync (backend) — syncs Supabase UID with MongoDB user record
  → Token stored, user state set
```

### Token Refresh

The Axios interceptor in `api.js` handles `401` responses:

1. Marks original request as `_retry`
2. Queues in-flight requests in `failedQueue`
3. POSTs `refreshToken` to `/auth/refresh`
4. On success: updates stored token, processes queued requests
5. On failure: clears all tokens, redirects to `/login`

### Token Validation

`AuthContext` validates tokens locally (JWT decode + expiry check) before making any API call on app init. Tokens expiring within 60 seconds are treated as expired and a refresh is attempted.

### Token Storage

`tokenService.js` manages:

- `supabase_access_token` — localStorage + `auth_token` cookie (7-day expiry)
- `supabase_refresh_token` — localStorage only
- `supabase_token_expiry` — decoded from JWT payload
- `user_role` — localStorage + cookie for fast reads

### Session Listeners

`supabase.auth.onAuthStateChange` is registered in `AuthContext` to handle OAuth `SIGNED_IN` and `SIGNED_OUT` events for cross-tab consistency.

---

## 10. Role & Permission System

### Model

Every user has one `role`. Each role contains an array of **permission strings**. The `admin` role bypasses all permission checks — it is treated as a superuser.

Permission strings follow a `action:resource` or `action:resource:subtype` pattern:

```
manage:events
manage:sermons
manage:blog
manage:gallery
manage:livestream
manage:feedback
manage:volunteers
manage:users
manage:roles
manage:settings
manage:announcements
manage:donations
view:analytics
view:audit_logs
read:feedback:sermon
respond:feedback:sermon
publish:feedback:testimony
archive:feedback:suggestion
view:pledges
approve:pledges
create:campaigns
verify:payments
...
```

### Implementation

**`AuthContext`** exposes low-level helpers:

```js
hasPermission(permission)       // checks single permission string
hasAnyPermission(permissions)   // OR check across multiple
hasAllPermissions(permissions)  // AND check across multiple
isAdmin()                       // role.name === 'admin'
```

**`usePermissions` hook** wraps these into named, feature-specific functions used across portal components:

```js
const { canManageEvents, canManageFeedback, canViewAnalytics } = usePermissions();
```

**Portal sidebar** is built dynamically by `getAccessibleSections()`, which returns only the routes the current user's role permits.

**UI gating example (feedback page):**

```js
const canReadCategory = (category) => {
  const perms = user.role.permissions;
  return perms.includes('manage:feedback') || perms.includes(`read:feedback:${category}`);
};
```

The backend independently validates all write operations — the frontend permission layer is a UX concern only.

---

## 11. API Communication

### REST API

Base URL is set via `NEXT_PUBLIC_API_URL`. All requests go through the Axios instance in `src/lib/api.js`.

Feature-specific service modules in `src/services/api/` encapsulate endpoint logic:

```
analyticsService.js    /analytics/*
authService.js         /auth/*
blogService.js         /blog/*
donationService.js     /donations/*, /campaigns/*, /pledges/*
eventService.js        /events/*
feedbackService.js     /feedback/*
galleryService.js      /gallery/*
livestreamService.js   /livestream/*
noticeService.js       /notices/*
roleService.js         /roles/*
sermonService.js       /sermons/*
userService.js         /users/*
volunteerService.js    /volunteers/*
emailNotificationService.js
auditService.js
settingsService.js
```

API endpoints are also documented as constants in `src/utils/constants.js` under `API_ENDPOINTS`.

### Server-Sent Events (SSE) — Announcements

The `NotificationBell` component opens an `EventSource` connection to `/announcements/stream?token=<jwt>`.

SSE event types handled:

| Event type | Action |
|---|---|
| `connected` | Mark bell as connected |
| `unreadCount` | Set initial unread badge count |
| `new_announcement` | Increment badge, fire browser notification if permitted |
| `announcement_deleted` / `announcement_updated` | Re-fetch count via REST fallback |

Reconnection uses exponential backoff up to 5 attempts (max 30s delay). Auth errors stop reconnection entirely to prevent token-expired hammering. A REST fallback (`/announcements/count/unread`) runs on mount regardless of SSE state.

### TanStack Query

Portal pages that require frequent data refreshes (donations, analytics) use TanStack Query for:

- Stale-while-revalidate caching (`staleTime: 30000`)
- `queryClient.invalidateQueries()` after mutations
- Parallel fetches with `Promise.all` in analytics

---

## 12. PWA Support

The app is PWA-enabled with the following configuration:

**`public/manifest.json`**

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

Includes 4 home screen shortcuts: Live Stream, Sermons, Events, Donate.

**`public/sw.js`** — Custom service worker:

- Cache strategy: **Network-first, cache fallback** for GET requests
- Auto-versioned cache name using `Date.now()` on each build
- Caches: `/`, `/manifest.json`, `/icon.jpg`
- Never caches: `/_next/static/chunks/`, API routes, analytics scripts, POST/PUT/DELETE requests
- Old caches purged on `activate`
- Handles `SKIP_WAITING` message for immediate activation
- Persists PiP state to IndexedDB across service worker lifetime
- Push notification support for PiP reminders

**`ServiceWorkerRegister.jsx`** — Client-only component that:

- Registers `/sw.js`
- Polls for updates every 60 seconds
- Triggers `window.location.reload()` when a new worker takes control
- Reacquires Wake Lock on page visibility change if PiP is active

**`SplashScreen`** — Shown on initial PWA load for a smooth native-app-like experience.

---

## 13. SEO Strategy

### Metadata

All SSR pages export a `metadata` object with `title`, `description`, `keywords`, `openGraph`, and `twitter` fields. The root layout defines a title template:

```js
title: {
  template: '%s | Busia House of Transformation Church',
  default: 'House of Transformation Church | Busia, Kenya'
}
```

### Structured Data (JSON-LD)

The homepage injects a `Church` schema via Next.js `<Script>` with `strategy="beforeInteractive"`:

```json
{
  "@type": "Church",
  "name": "Busia House of Transformation",
  "address": { ... },
  "openingHours": "Sun 09:00-12:00"
}
```

The blog list page injects a `CollectionPage` + `ItemList` schema server-side.

### Sitemap

`src/app/sitemap.js` generates a dynamic XML sitemap combining:

- Static pages with defined `changeFrequency` and `priority` values
- All approved blog post URLs fetched from the API (1-hour revalidation)

Fallback to static-only URLs if the API fetch fails.

### Robots

Configured via `metadata.robots` in root layout:

```js
robots: {
  index: true,
  follow: true,
  googleBot: { 'max-image-preview': 'large', 'max-snippet': -1 }
}
```

### Image Optimization

- `next/image` with AVIF and WebP format support
- Remote patterns configured for Cloudinary, YouTube thumbnails, Twitter
- Immutable cache headers on `/_next/static/` and image assets

### Performance

- Google Analytics deferred via `ClientOnlyComponents` with `ssr: false` — never blocks first paint
- `dns-prefetch` for Google Tag Manager and Analytics
- `preconnect` to Cloudinary
- Framework, Framer Motion, and vendor chunks split separately in webpack config

---

## 14. Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Cloudinary (client-side uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=user_avatars

# Google Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

> All variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Do not put secrets in these variables.

---

## 15. Installation Guide

**Prerequisites**

- Node.js >= 18
- npm >= 9
- A running instance of the H.O.T backend API
- A Supabase project with Email/Password and Google OAuth enabled
- A Cloudinary account with an unsigned upload preset configured

**Steps**

```bash
# 1. Clone the repository
git clone https://github.com/your-org/house-of-transformation-nextjs.git
cd house-of-transformation-nextjs

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your values

# 4. Verify path aliases resolve
# jsconfig.json maps @/* → ./src/*
# No additional setup needed
```

---

## 16. Running the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

**Notes:**

- The dev server uses Turbopack (`turbopack: { root: process.cwd() }` in `next.config.js`).
- The service worker does not activate in development by default. Test PWA features using `npm run build && npm start`.
- Ensure the backend API is running and `NEXT_PUBLIC_API_URL` points to it.

---

## 17. Production Build

```bash
# Build
npm run build

# Start production server
npm start
```

The build uses a timestamp-based `generateBuildId` to prevent chunk caching conflicts across deployments:

```js
generateBuildId: async () => `build-${Date.now()}`
```

Webpack is configured to split chunks into: `framework` (React core), `framer` (Framer Motion), `lib-*` (per vendor package), and `common` (shared across 2+ chunks).

---

## 18. Deployment Notes

### Netlify (Primary)

The `netlify.toml` configures the build:

```toml
[build]
  command = "npm run build"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

`@netlify/plugin-nextjs` handles SSR function routing, ISR, and image optimization on Netlify's infrastructure automatically.

### Vercel (Alternative)

The codebase is compatible with Vercel with zero configuration. Set environment variables in the Vercel dashboard.

### Cache Headers

Configured in `next.config.js`:

- Static assets and `/_next/static/`: `Cache-Control: public, max-age=31536000, immutable`
- All other routes: `Cache-Control: public, max-age=0, must-revalidate`

### Admin Rewrite

`/admin/:path*` is rewritten to `https://hotadmin.vercel.app/:path*` for legacy or separate admin tooling:

```js
rewrites: async () => ({
  beforeFiles: [{ source: '/admin/:path*', destination: 'https://hotadmin.vercel.app/:path*' }]
})
```

---

## 19. Security Considerations

**Authentication**

- JWTs are stored in `localStorage` and mirrored to `SameSite=Lax` cookies. The cookie supports middleware-level auth checks without exposing the token to JavaScript on the server.
- Token expiry is decoded locally before any API call to avoid unnecessary network round-trips.
- Refresh tokens are single-use. Failed refreshes clear all stored credentials immediately.

**Input Handling**

- HTML rendered from user-generated content (blog posts, sermon content) should be passed through `DOMPurify` before render. The `dompurify` package is included as a dependency.
- All form inputs should be validated client-side (`src/utils/validators.js`) and are independently validated by the backend.

**Permissions**

- Frontend permission checks (`usePermissions`) are a UX layer only and must never be the sole access control mechanism.
- All state-changing API endpoints enforce permission checks server-side.
- Admin bypass of permissions is enforced on the backend by role name, not frontend flag.

**Content Security**

- Cloudinary image deletions are routed through the backend API (admin credentials never exposed to the browser).
- SVG images are allowed via `dangerouslyAllowSVG: true` in Next.js config with a restrictive `contentSecurityPolicy` sandbox applied.

**Service Worker**

- The service worker never caches non-GET requests, preventing accidental caching of POST/mutation payloads.
- Analytics scripts (`gtag`, `analytics`) are explicitly excluded from the cache.

**Rate Limiting**

- The API interceptor detects `429` responses and surfaces them to the UI without retrying automatically.
- Login and signup endpoints are rate-limited on the backend; the frontend displays appropriate error messages.

---

## 20. Contributing Guide

### Branch Strategy

```
main          — production-ready code
develop       — integration branch
feature/*     — individual features
fix/*         — bug fixes
```

### Workflow

```bash
# Create a feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# Make changes, then commit
git add .
git commit -m "feat: describe your change clearly"

# Push and open a PR to develop
git push origin feature/your-feature-name
```

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:     new feature
fix:      bug fix
refactor: code change without feature/fix
style:    formatting, no logic change
docs:     documentation only
chore:    build, deps, tooling
```

### Code Standards

- Use named exports for components and hooks.
- Keep page-level files thin — delegate logic to components and hooks.
- API calls belong in `src/services/api/` service modules, not inline in components.
- Use `usePermissions()` for all portal feature gating; do not inline `user.role.permissions.includes()` in components.
- Do not commit `.env.local` or any file containing secrets.

### Pull Request Requirements

- PRs must target `develop`, not `main`.
- Describe what was changed and why.
- Test both authenticated and unauthenticated states if the change affects auth-gated UI.
- Run `npm run lint` and resolve all errors before opening a PR.

---

## 21. License

This project is private and proprietary. All rights reserved.

**House of Transformation Ministries, Busia County, Kenya.**

Unauthorized copying, distribution, or modification of this codebase, in whole or in part, is prohibited without explicit written permission from the project owner.

---

*Built by [Bryant](https://x.com/rockstarbryant)*