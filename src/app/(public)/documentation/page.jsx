export const metadata = {
  title: 'Platform Documentation',
  description: 'Technical documentation describing the architecture, features, and capabilities of the House of Transformation Church platform.',
  keywords: 'church platform, documentation, technical architecture, Next.js, MongoDB, API documentation',
  openGraph: {
    title: 'Platform Documentation | House of Transformation Church',
    description: 'Complete technical documentation for our church engagement platform.',
    type: 'website',
  },
};

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-[#8B1A1A] to-slate-900 text-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl font-black uppercase tracking-tight mb-4">
            Platform Documentation
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl">
            Complete technical reference for the House of Transformation Church management and engagement platform.
          </p>
          <div className="mt-6 flex gap-4 text-sm">
            <span className="px-4 py-2 bg-white/10 rounded-lg border border-white/20">
              Version 1.0
            </span>
            <span className="px-4 py-2 bg-white/10 rounded-lg border border-white/20">
              Busia County, Kenya
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Table of Contents - Sticky Sidebar */}
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-24 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">
                Table of Contents
              </h2>
              <nav className="space-y-1">
                {[
                  { id: 'overview', title: 'Project Overview' },
                  { id: 'purpose', title: 'Purpose & Goals' },
                  { id: 'features', title: 'Platform Features' },
                  { id: 'tech-stack', title: 'Technology Stack' },
                  { id: 'architecture', title: 'System Architecture' },
                  { id: 'frontend', title: 'Frontend Architecture' },
                  { id: 'backend', title: 'Backend Architecture' },
                  { id: 'authentication', title: 'Authentication' },
                  { id: 'permissions', title: 'Permission System' },
                  { id: 'portal', title: 'Portal Architecture' },
                  { id: 'public-site', title: 'Public Website' },
                  { id: 'database', title: 'Database Structure' },
                  { id: 'api', title: 'API Communication' },
                  { id: 'livestream', title: 'Livestream Integration' },
                  { id: 'events', title: 'Event Registration' },
                  { id: 'donations', title: 'Donation System' },
                  { id: 'feedback', title: 'Feedback System' },
                  { id: 'volunteers', title: 'Volunteer Management' },
                  { id: 'analytics', title: 'Analytics & Admin' },
                  { id: 'pwa', title: 'PWA & Service Worker' },
                  { id: 'seo', title: 'SEO Strategy' },
                  { id: 'security', title: 'Security' },
                  { id: 'performance', title: 'Performance' },
                  { id: 'scalability', title: 'Scalability' },
                  { id: 'deployment', title: 'Deployment' },
                  { id: 'environment', title: 'Environment Variables' },
                  { id: 'maintenance', title: 'Maintenance' },
                  { id: 'future', title: 'Future Improvements' },
                ].map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-sm text-slate-600 dark:text-slate-400 hover:text-[#8B1A1A] dark:hover:text-[#8B1A1A] transition-colors py-1.5 hover:translate-x-1 duration-200"
                  >
                    {item.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Documentation Content */}
          <main className="lg:col-span-9 space-y-16">
            
            {/* Project Overview */}
            <Section id="overview" title="Project Overview">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                House of Transformation (H.O.T) is a full-stack church management and community engagement platform built for a church congregation in Busia County, Kenya. It serves two primary audiences through a single unified system:
              </p>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300 ml-6">
                <li className="flex gap-3">
                  <span className="text-[#8B1A1A] mt-1">•</span>
                  <span><strong>Public visitors</strong> — who access the church's website to discover services, watch livestreams, read sermons and blog posts, register for events, submit feedback, and make donations.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#8B1A1A] mt-1">•</span>
                  <span><strong>Authenticated members and staff</strong> — who use a role-gated portal to manage all platform content, moderate community interaction, and administer the organization.</span>
                </li>
              </ul>
              
              <div className="mt-8 overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 font-black text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">Application</th>
                      <th className="text-left py-3 px-4 font-black text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">Technology</th>
                      <th className="text-left py-3 px-4 font-black text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">Deployment</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-slate-700 dark:text-slate-300">
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-3 px-4">Frontend (public site + portal)</td>
                      <td className="py-3 px-4">Next.js App Router</td>
                      <td className="py-3 px-4">Netlify</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-3 px-4">Backend API</td>
                      <td className="py-3 px-4">Node.js + Express</td>
                      <td className="py-3 px-4">Render / Railway</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            {/* Purpose and Goals */}
            <Section id="purpose" title="System Purpose and Goals">
              <div className="bg-gradient-to-r from-[#8B1A1A]/5 to-slate-100 dark:from-[#8B1A1A]/10 dark:to-slate-900 rounded-xl p-8 border border-[#8B1A1A]/20">
                <h3 className="text-lg font-black uppercase tracking-tight mb-4 text-slate-900 dark:text-white">
                  Primary Purpose
                </h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Provide the church with a self-managed digital infrastructure that replaces fragmented tools (separate admin panels, third-party form services, manual spreadsheets) with a single integrated platform.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Public Engagement', desc: 'SEO-optimized public website with structured data, fast SSR pages, PWA installability' },
                  { title: 'Member Self-Service', desc: 'Portal with profile management, saved sermons, announcement access' },
                  { title: 'Content Management', desc: 'Admin-managed blog, sermons, events, gallery, and livestreams' },
                  { title: 'Financial Transparency', desc: 'Donation campaigns with progress tracking, M-Pesa integration, pledge system' },
                  { title: 'Community Feedback', desc: 'Five-category feedback system with anonymous submission and moderation' },
                  { title: 'Mobile Accessibility', desc: 'Fully responsive UI, PWA installability, mobile-optimized portal' },
                ].map((goal, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                    <h4 className="font-black text-sm uppercase tracking-wide text-[#8B1A1A] mb-2">{goal.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{goal.desc}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Key Platform Features */}
            <Section id="features" title="Key Platform Features">
              <div className="space-y-8">
                <FeatureCategory 
                  title="Public Website Features"
                  features={[
                    { name: 'Homepage', desc: 'Hero, live detection, quick info, featured sermon, events carousel, campaigns' },
                    { name: 'Blog', desc: 'Post listing with category filtering, likes, per-device view counting' },
                    { name: 'Sermons', desc: 'Text and media sermons, bookmarking, likes, view tracking' },
                    { name: 'Livestream', desc: 'YouTube/Facebook embed with live detection, Picture-in-Picture (PiP)' },
                    { name: 'Events', desc: 'Event cards, registration with seat booking, capacity tracking' },
                    { name: 'Donations', desc: 'Campaign progress, M-Pesa STK Push, bank transfer, pledge system' },
                    { name: 'Gallery', desc: 'Photo grid with category filter and photo likes' },
                    { name: 'Feedback', desc: 'Five forms: sermon, service, testimony, suggestion, prayer request' },
                    { name: 'Volunteer', desc: 'Ministry-specific application forms' },
                  ]}
                />
                
                <FeatureCategory 
                  title="Portal Features (Role-Based Access)"
                  features={[
                    { name: 'Analytics Dashboard', desc: 'Comprehensive platform statistics and insights' },
                    { name: 'Content Management', desc: 'Blog, sermons, events, gallery, livestream publishing' },
                    { name: 'Feedback Moderation', desc: 'Granular per-category permissions and response capability' },
                    { name: 'Volunteer Approvals', desc: 'Application review and approval workflow' },
                    { name: 'Announcement System', desc: 'Real-time SSE-based notifications to all members' },
                    { name: 'Donation Management', desc: 'Campaign, pledge, and payment tracking' },
                    { name: 'User Management', desc: 'Member profiles, role assignment, ban system' },
                    { name: 'Role & Permission Management', desc: 'Custom role creation with granular permissions' },
                    { name: 'Settings Panel', desc: 'Runtime-configurable SMTP, M-Pesa, feature flags' },
                    { name: 'Audit Logs', desc: 'Complete action tracking and security monitoring' },
                  ]}
                />
              </div>
            </Section>

            {/* Technology Stack */}
            <Section id="tech-stack" title="Technology Stack">
              <TechStack 
                category="Frontend"
                items={[
                  { tech: 'Next.js (App Router)', version: '16.1.6' },
                  { tech: 'React', version: '18' },
                  { tech: 'Tailwind CSS', version: '3.4.1' },
                  { tech: '@supabase/supabase-js', version: '2.90.1' },
                  { tech: 'Axios', version: '1.13.2' },
                  { tech: 'TanStack React Query', version: '5.90.20' },
                  { tech: 'TipTap (Rich Text Editor)', version: 'latest' },
                  { tech: 'Framer Motion', version: '12.31.1' },
                  { tech: 'Recharts', version: '3.7.0' },
                  { tech: 'Lucide React (Icons)', version: '-' },
                ]}
              />
              
              <TechStack 
                category="Backend"
                items={[
                  { tech: 'Node.js', version: '18.x / 20.x' },
                  { tech: 'Express', version: '4.22.1' },
                  { tech: 'Mongoose (MongoDB ODM)', version: '7.8.8' },
                  { tech: '@supabase/supabase-js', version: '2.93.3' },
                  { tech: 'Cloudinary + multer-storage', version: '2.9.0' },
                  { tech: 'Nodemailer', version: '7.0.12' },
                  { tech: 'Safaricom Daraja API (M-Pesa)', version: '-' },
                  { tech: 'Anthropic Claude SDK', version: '0.24.3' },
                  { tech: 'Google Generative AI', version: '0.24.1' },
                  { tech: 'express-rate-limit', version: '7.1.5' },
                ]}
              />
              
              <TechStack 
                category="Infrastructure"
                items={[
                  { tech: 'MongoDB Atlas', version: 'Primary database' },
                  { tech: 'Supabase', version: 'Authentication provider' },
                  { tech: 'Cloudinary', version: 'Image CDN' },
                  { tech: 'Netlify', version: 'Frontend hosting' },
                  { tech: 'Safaricom Daraja', version: 'M-Pesa payments (Kenya)' },
                ]}
              />
            </Section>

            {/* System Architecture */}
            <Section id="architecture" title="High-Level System Architecture">
              <div className="bg-slate-900 text-slate-100 rounded-xl p-8 overflow-x-auto">
                <pre className="text-xs font-mono leading-relaxed">
{`┌──────────────────────────────────────────────────────────────────┐
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
│  │                   │  401 refresh    │                        │  │
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
│  Trust Proxy → Body Parser → CORS → Audit Middleware → Rate Limiter │
│                         ↓                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Public Routes│  │ Mixed Routes │  │ Protected Routes         │  │
│  │ (no JWT)     │  │ (optionalAuth│  │ (protect + requirePerm)  │  │
│  │              │  │  protectSSE) │  │                          │  │
│  └──────┬───────┘  └──────┬───────┘  └─────────────┬────────────┘  │
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
   └───────────────────────┘`}
                </pre>
              </div>
            </Section>

            {/* Frontend Architecture */}
            <Section id="frontend" title="Frontend Architecture">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                The Next.js App Router organizes the application into two route groups serving distinct audiences while sharing common infrastructure:
              </p>
              
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 mb-8">
                <h4 className="font-black text-sm uppercase tracking-wide text-[#8B1A1A] mb-4">Application Structure</h4>
                <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed overflow-x-auto">
{`src/app/
├── (public)/          ← Public website, mixed SSR/CSR
│   ├── layout.jsx     ← NoticeBar + Header + Footer + Chatbot
│   └── page.jsx       ← Homepage (SSR)
├── portal/            ← Member portal, all CSR
│   ├── layout.jsx     ← Auth check + sidebar + portal header
│   └── page.jsx       ← Dashboard
├── auth/callback/     ← Supabase OAuth callback
├── maintenance/
└── layout.jsx         ← Root: providers, fonts, metadata`}
                </pre>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                  <h4 className="font-black text-sm uppercase tracking-wide mb-3 text-slate-900 dark:text-white">Context Providers</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">The root layout wraps the application in a layered provider tree:</p>
                  <div className="text-xs font-mono text-slate-700 dark:text-slate-300 space-y-1">
                    <div>QueryProvider (TanStack Query client)</div>
                    <div className="ml-4">└── ThemeProvider (dark/light class strategy)</div>
                    <div className="ml-8">└── PiPProvider (Picture-in-Picture global state)</div>
                    <div className="ml-12">└── Providers (AuthProvider)</div>
                    <div className="ml-16">└── SplashScreen</div>
                    <div className="ml-20">└── ClientOnlyComponents</div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                  <h4 className="font-black text-sm uppercase tracking-wide mb-3 text-slate-900 dark:text-white">State Architecture</h4>
                  <div className="space-y-2">
                    {[
                      { layer: 'Auth state', tech: 'AuthContext (React Context)', scope: 'Global' },
                      { layer: 'Server data', tech: 'TanStack Query', scope: 'Per-page cache' },
                      { layer: 'Theme', tech: 'ThemeContext', scope: 'Global, persisted to localStorage' },
                      { layer: 'PiP state', tech: 'PiPContext', scope: 'Global, persisted to IndexedDB via SW' },
                      { layer: 'Donation flow', tech: 'DonationContext', scope: 'Feature-scoped' },
                      { layer: 'Chatbot', tech: 'ChatbotContext', scope: 'Feature-scoped' },
                      { layer: 'Form state', tech: 'Local useState', scope: 'Component-level' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-4 text-sm">
                        <span className="font-bold text-[#8B1A1A] min-w-[120px]">{item.layer}:</span>
                        <span className="text-slate-700 dark:text-slate-300">{item.tech}</span>
                        <span className="text-slate-500 text-xs ml-auto">{item.scope}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            {/* Backend Architecture */}
            <Section id="backend" title="Backend Architecture">
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-8 mb-8">
                <h4 className="font-black text-sm uppercase tracking-wide mb-4">Middleware Execution Order</h4>
                <ol className="space-y-2 text-sm">
                  {[
                    'app.set(\'trust proxy\', 1) - reads real IP behind proxy',
                    'express.json() - parses JSON body',
                    'express.urlencoded() - parses form data',
                    'cors(allowedOrigins) - enforces origin whitelist',
                    'app.use(\'/uploads\', static) - serves local upload fallback',
                    'app.use(\'/api\', auditMiddleware) - logs all API requests',
                    'app.use(\'/api/\', apiLimiter) - rate limits all API routes',
                    'Route-specific auth middleware - protect / optionalAuth / protectSSE',
                    'requirePermission(...) - enforces permission strings',
                    'asyncHandler - catches async errors',
                    'Controller',
                    'Response',
                    '404 handler (no route matched)',
                    'errorHandler (global, last)',
                  ].map((step, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="text-[#8B1A1A] font-bold min-w-[24px]">{idx + 1}.</span>
                      <span className="text-slate-300">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="space-y-4">
                <h4 className="font-black text-sm uppercase tracking-wide text-slate-900 dark:text-white">Service Layer</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { service: 'mpesaService.js', desc: 'Safaricom Daraja OAuth + STK Push + status query' },
                    { service: 'mpesaVerificationService.js', desc: 'Callback validation, receipt verification' },
                    { service: 'emailService.js', desc: 'Nodemailer singleton, SMTP config from Settings' },
                    { service: 'auditService.js', desc: 'Audit log write helpers (logAuth, logError)' },
                    { service: 'transcriptService.js', desc: 'YouTube transcript extraction' },
                    { service: 'aiSummaryFromTranscript.js', desc: 'Claude/Gemini sermon summarization' },
                    { service: 'aiCaptionsService.js', desc: 'AI-generated gallery photo captions' },
                    { service: 'captionWorker.js', desc: 'Background job runner for caption generation' },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                      <h5 className="font-bold text-sm text-[#8B1A1A] mb-1">{item.service}</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            {/* Authentication Flow */}
            <Section id="authentication" title="Authentication Flow">
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg p-6 mb-8">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  The platform delegates all identity verification to <strong>Supabase</strong>. The backend issues no JWTs of its own.
                </p>
              </div>

              <div className="bg-slate-900 text-slate-100 rounded-xl p-8 overflow-x-auto mb-8">
                <h4 className="font-black text-sm uppercase tracking-wide mb-4">Email / Password Flow</h4>
                <pre className="text-xs font-mono leading-relaxed">
{`Frontend                          Supabase              Backend (MongoDB)
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
    │                                 │                         │── User.findOne()
    │                                 │                         │── populate role
    │◀── { user, role, permissions } ─────────────────────────│`}
                </pre>
              </div>

              <div className="space-y-4">
                <h4 className="font-black text-sm uppercase tracking-wide text-slate-900 dark:text-white">Token Lifecycle</h4>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex gap-3">
                    <span className="text-[#8B1A1A]">→</span>
                    <span>Request interceptor injects <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-xs">Authorization: Bearer &lt;token&gt;</code></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#8B1A1A]">→</span>
                    <span><code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-xs">supabaseAuth.protect()</code> validates token with Supabase</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#8B1A1A]">→</span>
                    <span>On 401: refresh token flow triggered, in-flight requests queued and retried</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#8B1A1A]">→</span>
                    <span>On refresh failure: all tokens cleared, redirect to login</span>
                  </li>
                </ul>
              </div>
            </Section>

            {/* Permission System */}
            <Section id="permissions" title="Role-Based Permission System">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                The permission system is a flat string-based RBAC model. Each user holds one Role. Each role contains an array of permission strings. The <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-sm">admin</code> role bypasses all checks entirely.
              </p>

              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 mb-8">
                <h4 className="font-black text-sm uppercase tracking-wide text-[#8B1A1A] mb-4">Permission String Taxonomy</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-4">
                    <code className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded text-xs font-mono min-w-[200px]">manage:{'{resource}'}</code>
                    <span className="text-slate-600 dark:text-slate-400">Broad, covers all sub-operations</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <code className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded text-xs font-mono min-w-[200px]">action:{'{resource}'}</code>
                    <span className="text-slate-600 dark:text-slate-400">Specific action</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <code className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded text-xs font-mono min-w-[200px]">action:{'{resource}'}:{'{subtype}'}</code>
                    <span className="text-slate-600 dark:text-slate-400">Most granular level</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                  <h4 className="font-black text-xs uppercase tracking-wide mb-4 text-slate-600 dark:text-slate-400">Broad Permissions</h4>
                  <div className="space-y-1 text-xs font-mono text-slate-700 dark:text-slate-300">
                    {['manage:events', 'manage:sermons', 'manage:gallery', 'manage:donations', 'manage:users', 'manage:roles', 'manage:blog', 'manage:livestream', 'manage:feedback', 'manage:volunteers', 'manage:settings', 'manage:announcements'].map((perm, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-[#8B1A1A]">•</span>
                        <code>{perm}</code>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                  <h4 className="font-black text-xs uppercase tracking-wide mb-4 text-slate-600 dark:text-slate-400">Granular Examples (Donations)</h4>
                  <div className="space-y-1 text-xs font-mono text-slate-700 dark:text-slate-300">
                    {['view:campaigns', 'create:campaigns', 'edit:campaigns', 'delete:campaigns', 'activate:campaigns', 'feature:campaigns', 'view:pledges', 'approve:pledges', 'view:payments', 'process:payments', 'verify:payments'].map((perm, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-[#8B1A1A]">•</span>
                        <code>{perm}</code>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-r-lg p-6">
                <h4 className="font-black text-sm uppercase tracking-wide mb-2 text-yellow-900 dark:text-yellow-200">Broad Permission Expansion</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  When <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">requirePermission</code> middleware detects a broad permission like <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">manage:feedback</code>, it automatically expands to all related granular strings. This prevents needing to assign both the broad permission and every individual sub-permission.
                </p>
              </div>
            </Section>

            {/* Portal Architecture */}
            <Section id="portal" title="Portal Architecture">
              <div className="bg-gradient-to-r from-[#8B1A1A]/10 to-slate-100 dark:from-[#8B1A1A]/20 dark:to-slate-900 rounded-xl p-8 border border-[#8B1A1A]/20 mb-8">
                <h4 className="font-black text-lg uppercase tracking-tight mb-4 text-slate-900 dark:text-white">
                  Unified Portal Principle
                </h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  There are <strong>no separate admin pages</strong>. All authenticated users — members and administrators — access the same portal routes. What differs is which sidebar items appear and which actions are available, controlled by the user's role permissions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {[
                  { route: '/portal', access: 'All users', desc: 'Dashboard overview' },
                  { route: '/portal/profile', access: 'All users', desc: 'Own profile management' },
                  { route: '/portal/bookmarks', access: 'All users', desc: 'Saved sermons' },
                  { route: '/portal/announcements', access: 'All view, manage:announcements edit', desc: 'Announcements' },
                  { route: '/portal/blog', access: 'manage:blog', desc: 'Blog management' },
                  { route: '/portal/sermons', access: 'manage:sermons', desc: 'Sermon publishing' },
                  { route: '/portal/events', access: 'manage:events', desc: 'Event management' },
                  { route: '/portal/gallery', access: 'manage:gallery', desc: 'Gallery management' },
                  { route: '/portal/livestream', access: 'manage:livestream', desc: 'Livestream control' },
                  { route: '/portal/feedback', access: 'read:feedback:*', desc: 'Feedback moderation' },
                  { route: '/portal/volunteers', access: 'manage:volunteers', desc: 'Volunteer approvals' },
                  { route: '/portal/donations', access: 'Any donation perm', desc: 'Financial management' },
                  { route: '/portal/users', access: 'manage:users', desc: 'User management' },
                  { route: '/portal/roles', access: 'manage:roles', desc: 'Role configuration' },
                  { route: '/portal/analytics', access: 'view:analytics', desc: 'Platform analytics' },
                  { route: '/portal/settings', access: 'manage:settings', desc: 'System configuration' },
                  { route: '/portal/audit-logs', access: 'view:audit_logs', desc: 'Audit trail' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800 hover:border-[#8B1A1A] transition-colors">
                    <code className="text-xs font-mono text-[#8B1A1A] block mb-2">{item.route}</code>
                    <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">{item.desc}</p>
                    <p className="text-xs text-slate-500">{item.access}</p>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h4 className="font-black text-sm uppercase tracking-wide mb-3 text-slate-900 dark:text-white">Notification Bell (SSE)</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                  The NotificationBell component in the portal header maintains a persistent SSE connection to <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-xs">/api/announcements/stream?token=&lt;jwt&gt;</code>. It displays an unread count badge and increments it on <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-xs">new_announcement</code> events without requiring page reload.
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Reconnection uses exponential backoff (base 2s, max 30s, up to 5 attempts). Auth errors halt reconnection permanently. A REST fallback fetches the initial count on mount independently of SSE state.
                </p>
              </div>
            </Section>

            {/* Public Website Structure */}
            <Section id="public-site" title="Public Website Structure">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 font-black text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">Route</th>
                      <th className="text-left py-3 px-4 font-black text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">Rendering</th>
                      <th className="text-left py-3 px-4 font-black text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">Data Source</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700 dark:text-slate-300">
                    {[
                      { route: '/', rendering: 'SSR', data: 'Featured sermon, live status' },
                      { route: '/about', rendering: 'CSR', data: 'Static content' },
                      { route: '/blog', rendering: 'SSR', data: 'All approved blogs' },
                      { route: '/blog/[id]', rendering: 'SSR', data: 'Blog detail by ID' },
                      { route: '/sermons', rendering: 'SSR', data: 'Sermon archive' },
                      { route: '/sermons/[id]', rendering: 'CSR', data: 'Sermon detail' },
                      { route: '/events', rendering: 'SSR', data: 'Upcoming events' },
                      { route: '/events/[id]', rendering: 'CSR', data: 'Event detail + registration' },
                      { route: '/gallery', rendering: 'SSR', data: 'All photos' },
                      { route: '/donate', rendering: 'SSR', data: 'Active campaigns' },
                      { route: '/campaigns/[id]', rendering: 'CSR', data: 'Campaign detail, pledges' },
                      { route: '/livestream', rendering: 'CSR', data: 'Livestream sessions' },
                      { route: '/feedback', rendering: 'CSR', data: 'Feedback forms' },
                      { route: '/volunteer', rendering: 'CSR', data: 'Application forms' },
                      { route: '/contact', rendering: 'CSR', data: 'Map + contact form' },
                    ].map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <td className="py-3 px-4 font-mono text-xs">{item.route}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${item.rendering === 'SSR' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                            {item.rendering}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs">{item.data}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* Database Structure */}
            <Section id="database" title="Database Structure Overview">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-8">
                All data except authentication identities is stored in <strong>MongoDB Atlas</strong>. Mongoose provides ODM with schema validation, virtuals, hooks, and index management.
              </p>

              <div className="space-y-4">
                {[
                  { collection: 'users', purpose: 'Member profiles', fields: 'supabase_uid, role (ref), isBanned, authProvider' },
                  { collection: 'roles', purpose: 'Permission groups', fields: 'name, permissions (enum array), isSystemRole' },
                  { collection: 'blogs', purpose: 'Blog posts', fields: 'title, content, author, likes, views, category, slug' },
                  { collection: 'sermons', purpose: 'Sermon entries', fields: 'title, type, content, mediaUrl, likes, bookmarks, views' },
                  { collection: 'events', purpose: 'Church events', fields: 'title, date, capacity, registrations, status' },
                  { collection: 'gallery', purpose: 'Photos', fields: 'imageUrl, cloudinaryPublicId, category, likes' },
                  { collection: 'feedback', purpose: 'All feedback types', fields: 'category, feedbackData, status, isAnonymous, isDeleted' },
                  { collection: 'volunteers', purpose: 'Applications', fields: 'ministry, status, applicant, hours' },
                  { collection: 'campaigns', purpose: 'Donation campaigns', fields: 'goalAmount, currentAmount, status, milestones' },
                  { collection: 'announcements', purpose: 'SSE-driven notices', fields: 'priority, targetAudience, readBy, expiresAt' },
                  { collection: 'notices', purpose: 'Sticky header notice', fields: 'message, style, backgroundColor, dismissible' },
                  { collection: 'settings', purpose: 'Singleton config', fields: 'emailSettings, paymentSettings, maintenanceMode, features' },
                  { collection: 'bannedusers', purpose: 'Ban records', fields: 'email, ipAddresses, reason, bannedBy' },
                  { collection: 'auditlogs', purpose: 'Action log', fields: 'action, userId, ip, method, path, statusCode' },
                  { collection: 'livestreams', purpose: 'Stream sessions', fields: 'embedUrl, platform, status, metadata' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-start justify-between mb-3">
                      <code className="text-sm font-mono font-bold text-[#8B1A1A]">{item.collection}</code>
                      <span className="text-xs text-slate-500 uppercase tracking-wide">{item.purpose}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">{item.fields}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* API Communication */}
            <Section id="api" title="API Communication">
              <div className="space-y-8">
                <div>
                  <h4 className="font-black text-sm uppercase tracking-wide mb-4 text-slate-900 dark:text-white">REST</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                    All REST communication goes through the Axios instance in <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-sm">src/lib/api.js</code>.
                  </p>
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                    <h5 className="font-bold text-sm mb-3 text-slate-900 dark:text-white">Request interceptor:</h5>
                    <p className="text-sm text-slate-700 dark:text-slate-300">Injects <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-xs">Authorization: Bearer &lt;token&gt;</code> on every outgoing request.</p>
                    
                    <h5 className="font-bold text-sm mt-6 mb-3 text-slate-900 dark:text-white">Response interceptor logic:</h5>
                    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <li className="flex gap-3">
                        <span className="text-[#8B1A1A]">•</span>
                        <span>200-299: pass through</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[#8B1A1A]">•</span>
                        <span>401 (first attempt): Mark as _retry, queue request, attempt token refresh</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[#8B1A1A]">•</span>
                        <span>401 (_retry set): reject immediately</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[#8B1A1A]">•</span>
                        <span>503: redirect to /maintenance</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[#8B1A1A]">•</span>
                        <span>429: surface rate limit error (no auto-retry)</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-black text-sm uppercase tracking-wide mb-4 text-slate-900 dark:text-white">Server-Sent Events (SSE)</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                    SSE is used for the announcement notification system only.
                  </p>
                  <div className="bg-slate-900 text-slate-100 rounded-xl p-6 overflow-x-auto">
                    <pre className="text-xs font-mono leading-relaxed">
{`Frontend (NotificationBell)          Backend (announcementController)
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
        │                                        │── remove from connections Map`}
                    </pre>
                  </div>
                </div>
              </div>
            </Section>

            {/* Livestream Integration */}
            <Section id="livestream" title="Livestream Integration">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                The platform supports embedding active and archived livestreams from YouTube and Facebook.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-black text-sm uppercase tracking-wide text-[#8B1A1A] mb-4">How It Works</h4>
                  <ol className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <li className="flex gap-3">
                      <span className="font-bold min-w-[20px]">1.</span>
                      <span>Admin creates livestream record in portal with embed URL, platform, and status</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold min-w-[20px]">2.</span>
                      <span>When status === 'live', homepage LiveStreamSection renders automatically</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold min-w-[20px]">3.</span>
                      <span>/livestream page lists all sessions with live one featured at top</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold min-w-[20px]">4.</span>
                      <span>Viewers can pop video into Picture-in-Picture mode via PiPContext</span>
                    </li>
                  </ol>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-black text-sm uppercase tracking-wide text-[#8B1A1A] mb-4">Picture-in-Picture (PiP)</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                    PiP state persists across page navigation using:
                  </p>
                  <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <li className="flex gap-3">
                      <span className="text-[#8B1A1A]">•</span>
                      <span><strong>PiPContext</strong> — global React context tracking active video</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#8B1A1A]">•</span>
                      <span><strong>GlobalPiP.jsx</strong> — floating player outside page tree</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#8B1A1A]">•</span>
                      <span><strong>usePersistentPiP</strong> — persists to IndexedDB via SW</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#8B1A1A]">•</span>
                      <span><strong>Service worker</strong> — saves state, survives full reloads</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Section>

            {/* Event Registration System */}
            <Section id="events" title="Event Registration System">
              <div className="bg-slate-900 text-slate-100 rounded-xl p-8 mb-8 overflow-x-auto">
                <h4 className="font-black text-sm uppercase tracking-wide mb-4">Registration Flow</h4>
                <pre className="text-xs font-mono leading-relaxed">
{`1. Visitor views event on /events/[id]
2. Clicks "Register" → registration form modal
3. Submits name, email, phone (optional), attendance time slot
4. POST /api/events/:id/register
5. Backend checks:
   ├── Event status is active
   ├── Capacity not exceeded
   └── No duplicate registration for same email
6. Registration record created
7. Confirmation displayed to user`}
                </pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                  <h4 className="font-black text-sm uppercase tracking-wide mb-3 text-slate-900 dark:text-white">Seat Management</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Each event has a <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-xs">capacity</code> field. Backend tracks <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-xs">totalRegistrations</code>, <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-xs">memberRegistrations</code>, and <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-xs">visitorRegistrations</code> separately. When capacity is reached, registration closes.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                  <h4 className="font-black text-sm uppercase tracking-wide mb-3 text-slate-900 dark:text-white">Portal Event Management</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                    The <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-xs">/portal/events</code> page provides:
                  </p>
                  <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                    <li>• Event CRUD operations</li>
                    <li>• Full registrant list with details</li>
                    <li>• Print-ready attendee list</li>
                    <li>• Registration analytics</li>
                  </ul>
                </div>
              </div>
            </Section>

            {/* Donation Campaign System */}
            <Section id="donations" title="Donation Campaign System">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                  <h4 className="font-black text-sm uppercase tracking-wide text-green-700 dark:text-green-400 mb-3">Campaign Lifecycle</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-3 py-1 bg-white dark:bg-slate-900 rounded-full text-xs font-bold">draft</span>
                    <span className="text-slate-400">→</span>
                    <span className="px-3 py-1 bg-white dark:bg-slate-900 rounded-full text-xs font-bold">active</span>
                    <span className="text-slate-400">→</span>
                    <span className="px-3 py-1 bg-white dark:bg-slate-900 rounded-full text-xs font-bold">completed</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-black text-sm uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3">Campaign Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {['building', 'mission', 'event', 'equipment', 'benevolence', 'offering'].map((type) => (
                      <span key={type} className="px-3 py-1 bg-white dark:bg-slate-900 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300">{type}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                  <h4 className="font-black text-sm uppercase tracking-wide text-purple-700 dark:text-purple-400 mb-3">Payment Methods</h4>
                  <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    <li>• M-Pesa STK Push</li>
                    <li>• M-Pesa Paybill</li>
                    <li>• M-Pesa Till</li>
                    <li>• Bank Transfer</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800">
                <h4 className="font-black text-sm uppercase tracking-wide text-[#8B1A1A] mb-6">M-Pesa STK Push Flow</h4>
                <ol className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                  {[
                    'User enters phone number and amount',
                    'Frontend sends Idempotency-Key (UUID) + POST /api/payments/mpesa/initiate',
                    'Backend loads M-Pesa config from Settings (consumerKey, shortcode, passkey)',
                    'MpesaService.initiateSTKPush() requests OAuth token, generates timestamp and password',
                    'Returns CheckoutRequestID, creates pending payment record',
                    'User receives M-Pesa PIN prompt on phone',
                    'User enters PIN',
                    'Safaricom POSTs callback to /api/mpesa/callback',
                    'MpesaVerificationService validates callback structure',
                    'Re-queries Safaricom to verify transaction independently',
                    'On success (ResultCode === 0): updates payment status + campaign.currentAmount',
                    'On failure: marks payment failed',
                  ].map((step, idx) => (
                    <li key={idx} className="flex gap-4">
                      <span className="font-bold text-[#8B1A1A] min-w-[24px]">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </Section>

            {/* Feedback and Testimony System */}
            <Section id="feedback" title="Feedback and Testimony System">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {[
                  { category: 'Sermon Feedback', fields: 'Sermon title/date, 5-star rating, resonated section, application steps', features: 'Rating display' },
                  { category: 'Service Experience', fields: 'First-time visitor flag, per-area ratings, improvements', features: 'Multi-area ratings grid' },
                  { category: 'Testimony', fields: 'Type, title, story, testimony date, willing to share', features: 'Publishable to public' },
                  { category: 'Suggestion', fields: 'Type, title, priority, description, benefit', features: 'Priority badges' },
                  { category: 'Prayer Request', fields: 'Urgency, category, request, share on prayer list', features: 'Urgent animation flag' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800 hover:border-[#8B1A1A] transition-colors">
                    <h4 className="font-black text-sm uppercase tracking-wide text-[#8B1A1A] mb-3">{item.category}</h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mb-3">{item.fields}</p>
                    <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-600 dark:text-slate-400">
                      {item.features}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700 mb-8">
                <h4 className="font-black text-sm uppercase tracking-wide mb-4 text-slate-900 dark:text-white">Feedback Lifecycle</h4>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {['submitted (pending)', 'reviewed', 'responded', 'archived', '[testimony] published', 'soft-deleted', 'permanently deleted'].map((status, idx, arr) => (
                    <React.Fragment key={idx}>
                      <span className="px-4 py-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-xs">
                        {status}
                      </span>
                      {idx < arr.length - 1 && <span className="text-slate-400">→</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg p-6">
                <h4 className="font-black text-sm uppercase tracking-wide mb-2 text-blue-900 dark:text-blue-200">Admin Response</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  When an admin responds to non-anonymous feedback, the system saves the response text, sends an email via emailService to the submitter, updates status to 'responded', and reports email delivery success.
                </p>
              </div>
            </Section>

            {/* Volunteer Management System */}
            <Section id="volunteers" title="Volunteer Management System">
              <div className="bg-slate-900 text-slate-100 rounded-xl p-8 mb-8 overflow-x-auto">
                <h4 className="font-black text-sm uppercase tracking-wide mb-4">Application Flow</h4>
                <pre className="text-xs font-mono leading-relaxed">
{`1. Visitor views /volunteer page
2. Selects ministry team (Ushering, Worship, Technical, Children's Ministry, etc.)
3. Fills application form: name, email, phone, experience, motivation, skills
4. POST /api/volunteers/apply
5. Backend checks for existing application from same email for same ministry
6. Application created with status: pending
7. Admin views in /portal/volunteers
8. Admin approves or denies with optional notes
9. On approval: status → approved, volunteer gains access to resources`}
                </pre>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                <h4 className="font-black text-sm uppercase tracking-wide text-[#8B1A1A] mb-4">Portal Management Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <li className="flex gap-3">
                      <span className="text-[#8B1A1A]">•</span>
                      <span>List all applications with ministry, applicant, status</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#8B1A1A]">•</span>
                      <span>Approve/deny actions with optional notes</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#8B1A1A]">•</span>
                      <span>Filter by ministry and status</span>
                    </li>
                  </ul>
                  <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <li className="flex gap-3">
                      <span className="text-[#8B1A1A]">•</span>
                      <span>View volunteer hours (manual entry by admin)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#8B1A1A]">•</span>
                      <span>Volunteer statistics dashboard</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#8B1A1A]">•</span>
                      <span>Export volunteer lists</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Section>

            {/* Analytics and Admin Capabilities */}
            <Section id="analytics" title="Analytics and Admin Capabilities">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-8">
                The <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-sm">/portal/analytics</code> page (requires <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-sm">view:analytics</code>) provides a tabbed dashboard with six comprehensive views.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { tab: 'Overview', data: 'Total users, sermons, donations, events; user distribution; content performance' },
                  { tab: 'Users', data: 'Total, active, banned, new; breakdown by role, gender, auth provider' },
                  { tab: 'Content', data: 'Sermon leaderboards by views/likes; top events; gallery top photos; blog stats' },
                  { tab: 'Engagement', data: 'Feedback stats by category; volunteer stats; livestream analytics' },
                  { tab: 'Financial', data: 'Campaign progress; pledge fulfillment; payment method breakdown; M-Pesa stats' },
                  { tab: 'System', data: 'Audit actions, success rate, failed logins, banned users, recent activity' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                    <h4 className="font-black text-sm uppercase tracking-wide text-[#8B1A1A] mb-3">{item.tab}</h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300">{item.data}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* PWA and Service Worker */}
            <Section id="pwa" title="PWA and Service Worker">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-black text-sm uppercase tracking-wide text-[#8B1A1A] mb-4">PWA Manifest</h4>
                  <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span className="font-bold">Name:</span>
                      <span className="text-slate-600 dark:text-slate-400">House of Transformation Church</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">Short Name:</span>
                      <span className="text-slate-600 dark:text-slate-400">Busia HOT Church</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">Display:</span>
                      <span className="text-slate-600 dark:text-slate-400">standalone</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">Theme Color:</span>
                      <span className="text-slate-600 dark:text-slate-400">#8B1A1A</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-black text-sm uppercase tracking-wide text-[#8B1A1A] mb-4">Home Screen Shortcuts</h4>
                  <div className="space-y-2">
                    {[
                      { name: 'Live Stream', url: '/livestream' },
                      { name: 'Sermons', url: '/sermons' },
                      { name: 'Events', url: '/events' },
                      { name: 'Donate', url: '/donate' },
                    ].map((shortcut, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm">
                        <span className="w-2 h-2 bg-[#8B1A1A] rounded-full"></span>
                        <span className="font-bold text-slate-900 dark:text-white">{shortcut.name}</span>
                        <code className="ml-auto text-xs text-slate-500">{shortcut.url}</code>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h4 className="font-black text-sm uppercase tracking-wide mb-4 text-slate-900 dark:text-white">Service Worker Features</h4>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex gap-3">
                    <span className="text-[#8B1A1A]">•</span>
                    <span><strong>Cache Strategy:</strong> Network-first with cache fallback for GET requests</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#8B1A1A]">•</span>
                    <span><strong>Cache Versioning:</strong> Date.now() timestamp, old caches purged on activate</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#8B1A1A]">•</span>
                    <span><strong>Wake Lock:</strong> Prevents screen sleep during PiP video playback</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#8B1A1A]">•</span>
                    <span><strong>Push Notifications:</strong> Push notification support for PiP reminders</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#8B1A1A]">•</span>
                    <span><strong>Auto-Update:</strong> Polls for SW updates every 60s, seamless reload on new version</span>
                  </li>
                </ul>
              </div>
            </Section>

            {/* SEO Strategy */}
            <Section id="seo" title="SEO Strategy">
              <div className="space-y-8">
                <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-black text-sm uppercase tracking-wide text-[#8B1A1A] mb-4">Metadata System</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                    All SSR pages export a metadata object with title, description, keywords, Open Graph, and Twitter Card data.
                  </p>
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <code className="text-xs font-mono text-slate-700 dark:text-slate-300">
                      title: '%s | Busia House of Transformation Church'
                    </code>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-black text-sm uppercase tracking-wide text-[#8B1A1A] mb-4">JSON-LD Structured Data</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                    The homepage injects Church schema with address, opening hours, and telephone.
                  </p>
                  <div className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-xs font-mono">
{`{
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
}`}
                    </pre>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-black text-sm uppercase tracking-wide text-[#8B1A1A] mb-4">Dynamic Sitemap</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-xs">src/app/sitemap.js</code> generates XML sitemap combining static pages and all approved blog URLs. Blog URLs are revalidated every hour using ISR (<code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-xs">revalidate: 3600</code>).
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-black text-sm uppercase tracking-wide text-[#8B1A1A] mb-4">Image Optimization</h4>
                  <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <li className="flex gap-3">
                      <span className="text-[#8B1A1A]">•</span>
                      <span><code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-xs">next/image</code> with AVIF + WebP auto format selection</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#8B1A1A]">•</span>
                      <span>Remote patterns configured for Cloudinary, YouTube thumbnails</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#8B1A1A]">•</span>
                      <span><code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-xs">Cache-Control: public, max-age=31536000, immutable</code> on static assets</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Section>

            {/* Security Considerations */}
            <Section id="security" title="Security Considerations">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    title: 'Authentication',
                    points: [
                      'All tokens verified with Supabase on every request',
                      'Role permissions populated from MongoDB, never client-injected',
                      'Admin bypass based on database role.name, not token claim',
                      'Refresh tokens are single-use; failure clears all credentials',
                    ]
                  },
                  {
                    title: 'Ban System',
                    points: [
                      'Banned users deleted from Supabase Auth',
                      'BannedUser records store email and IP address',
                      'Both checked at signup and login',
                      'Admins cannot ban themselves or other admins',
                    ]
                  },
                  {
                    title: 'Input Security',
                    points: [
                      'isomorphic-dompurify sanitizes HTML before storage',
                      'express-validator validates auth and payment endpoints',
                      'Mongoose schema validation provides database-level enforcement',
                    ]
                  },
                  {
                    title: 'Payment Security',
                    points: [
                      'M-Pesa callbacks validated for structure',
                      'Re-queries Safaricom after callback for independent verification',
                      'Idempotency keys prevent double-charging',
                      'Credentials runtime-configurable via Settings',
                    ]
                  },
                  {
                    title: 'File Upload Security',
                    points: [
                      'Cloudinary API secret never exposed to browser',
                      'Gallery deletions routed through backend with server credentials',
                      'File type validation on both frontend and backend',
                      '5MB file size limit enforced',
                    ]
                  },
                  {
                    title: 'Rate Limiting',
                    points: [
                      'All API routes: 1000 req / 15 min',
                      'Login: 10 attempts / 15 min',
                      'Signup: 5 attempts / 15 min',
                      'CORS strict origin whitelist in production',
                    ]
                  },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                    <h4 className="font-black text-sm uppercase tracking-wide text-[#8B1A1A] mb-4">{item.title}</h4>
                    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      {item.points.map((point, pidx) => (
                        <li key={pidx} className="flex gap-3">
                          <span className="text-[#8B1A1A] mt-0.5">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Section>

            {/* Performance Considerations */}
            <Section id="performance" title="Performance Considerations">
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-black text-sm uppercase tracking-wide text-[#8B1A1A] mb-4">Frontend Optimizations</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { tech: 'Code Splitting', desc: 'Automatic Next.js + custom webpack chunk groups' },
                      { tech: 'Deferred Loading', desc: 'Analytics, SW, chatbot loaded post-hydration' },
                      { tech: 'Image Optimization', desc: 'next/image with AVIF/WebP, lazy loading' },
                      { tech: 'SSR Critical Pages', desc: 'Homepage, blog, events rendered server-side' },
                      { tech: 'TanStack Query Cache', desc: 'staleTime: 30000 avoids redundant requests' },
                      { tech: 'Static Asset Caching', desc: 'max-age=31536000, immutable on /_next/static/' },
                      { tech: 'Build ID Versioning', desc: 'Date.now() prevents stale chunk loading' },
                      { tech: 'Preconnect', desc: 'Cloudinary domain preconnected in root layout' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-3">
                        <span className="text-[#8B1A1A] mt-0.5">•</span>
                        <div>
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{item.tech}:</span>
                          <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">{item.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-black text-sm uppercase tracking-wide text-[#8B1A1A] mb-4">Backend Optimizations</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { tech: 'Connection Pooling', desc: 'Mongoose pool: maxPoolSize 10, minPoolSize 5' },
                      { tech: 'MongoDB Indexes', desc: 'Compound indexes on frequently queried fields' },
                      { tech: 'M-Pesa Token Caching', desc: 'Access token cached in-memory for 3500s' },
                      { tech: 'Email Transporter Cache', desc: 'Nodemailer transporter cached for 5 minutes' },
                      { tech: 'asyncHandler', desc: 'Prevents callback-based error patterns' },
                      { tech: 'SSE Connection Map', desc: 'In-memory Map for O(1) connection lookup' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-3">
                        <span className="text-[#8B1A1A] mt-0.5">•</span>
                        <div>
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{item.tech}:</span>
                          <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">{item.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            {/* Scalability Considerations */}
            <Section id="scalability" title="Scalability Considerations">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-r-lg p-6 mb-8">
                <h4 className="font-black text-sm uppercase tracking-wide mb-3 text-yellow-900 dark:text-yellow-200">Current Architecture Limits</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  The in-memory SSE connection map does not scale horizontally. Multiple server instances require migration to Redis pub/sub for announcement broadcasts.
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-black text-sm uppercase tracking-wide text-[#8B1A1A] mb-4">Horizontal Scaling Path</h4>
                  <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                    <li className="flex gap-3">
                      <span className="text-[#8B1A1A] font-bold min-w-[100px]">SSE:</span>
                      <span>Replace in-memory map with Redis pub/sub. Each instance subscribes to Redis channel.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#8B1A1A] font-bold min-w-[100px]">M-Pesa Token:</span>
                      <span>Move to Redis with shared TTL key so all instances share one cached token.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#8B1A1A] font-bold min-w-[100px]">Database:</span>
                      <span>MongoDB Atlas supports read replicas and sharding. Current schema suitable for shard keys.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#8B1A1A] font-bold min-w-[100px]">Frontend:</span>
                      <span>Next.js on Netlify scales statically at CDN edge. SSR functions scale via serverless.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-black text-sm uppercase tracking-wide text-[#8B1A1A] mb-4">Storage Scaling</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    All media is stored in Cloudinary — no local storage dependencies in production. Gallery, sermon thumbnails, and user avatars all route through Cloudinary CDN, which handles scaling independently.
                  </p>
                </div>
              </div>
            </Section>

            {/* Deployment */}
            <Section id="deployment" title="Deployment Overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-black text-sm uppercase tracking-wide text-[#8B1A1A] mb-4">Frontend (Netlify)</h4>
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700 mb-4">
                    <pre className="text-xs font-mono text-slate-700 dark:text-slate-300">
{`# netlify.toml
[build]
  command = "npm run build"

[[plugins]]
  package = "@netlify/plugin-nextjs"`}
                    </pre>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    @netlify/plugin-nextjs handles SSR function routing, ISR, and image optimization automatically.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-black text-sm uppercase tracking-wide text-[#8B1A1A] mb-4">Backend (Node.js Host)</h4>
                  <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                      <code className="font-mono text-xs">npm start → node server.js</code>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                      <code className="font-mono text-xs">npm run dev → nodemon server.js</code>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Requirements: NODE_ENV=production, trust proxy: 1, M-Pesa callback must be publicly reachable HTTPS endpoint
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h4 className="font-black text-sm uppercase tracking-wide mb-4 text-slate-900 dark:text-white">First-Time Setup Scripts</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-4">
                    <code className="bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded text-xs font-mono">node scripts/seedRoles.js</code>
                    <span className="text-slate-600 dark:text-slate-400">Creates default roles (admin, member, etc.)</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <code className="bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded text-xs font-mono">node scripts/createAdmin.js</code>
                    <span className="text-slate-600 dark:text-slate-400">Creates initial admin user</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* Environment Variables */}
            <Section id="environment" title="Environment Variables">
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-black text-sm uppercase tracking-wide text-[#8B1A1A] mb-4">Frontend (.env.local)</h4>
                  <div className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-xs font-mono">
{`NEXT_PUBLIC_API_URL=https://your-api.onrender.com/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=user_avatars
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX`}
                    </pre>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-black text-sm uppercase tracking-wide text-[#8B1A1A] mb-4">Backend (../.env)</h4>
                  <div className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-xs font-mono leading-relaxed">
{`# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.netlify.app

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/church_db

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key     # server-side only

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret          # server-side only

# M-Pesa (fallback; override via Settings panel)
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your-passkey

# Email (fallback; override via Settings panel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your-app-password`}
                    </pre>
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-lg p-6">
                  <h4 className="font-black text-sm uppercase tracking-wide mb-3 text-red-900 dark:text-red-200">Security Notice</h4>
                  <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <li className="flex gap-3">
                      <span className="text-red-500">⚠️</span>
                      <span><code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-xs">SUPABASE_SERVICE_KEY</code> — Critical secret, grants admin access to Supabase Auth — server only</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-red-500">⚠️</span>
                      <span><code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-xs">CLOUDINARY_API_SECRET</code> — Required for media deletion — server only</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-red-500">⚠️</span>
                      <span><code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-xs">MPESA_CONSUMER_SECRET</code> — Payment auth — server only</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Section>

            {/* Maintenance Considerations */}
            <Section id="maintenance" title="Maintenance Considerations">
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-black text-sm uppercase tracking-wide text-[#8B1A1A] mb-4">Scheduled Jobs</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                    <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-xs">utils/cleanupJobs.js</code> runs on server startup:
                  </p>
                  <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <li className="flex gap-3">
                      <span className="text-[#8B1A1A]">•</span>
                      <span>Expired idempotency keys (Supabase table, 24-hour TTL)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#8B1A1A]">•</span>
                      <span>Announcements past their expiresAt date</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#8B1A1A]">•</span>
                      <span>Overdue campaign status checks</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-black text-sm uppercase tracking-wide text-[#8B1A1A] mb-4">Settings Without Redeployment</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                    The Settings singleton in MongoDB allows updating at runtime without code changes:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'SMTP credentials and email configuration',
                      'M-Pesa keys, shortcode, passkey, environment',
                      'Maintenance mode with custom message',
                      'Feature flags (disable any section)',
                      'Social media links',
                      'Contact information',
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                        <span className="w-2 h-2 bg-[#8B1A1A] rounded-full"></span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg p-6">
                  <h4 className="font-black text-sm uppercase tracking-wide mb-3 text-blue-900 dark:text-blue-200">Service Worker Updates</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    The SW auto-updates every 60 seconds in production. When a new deployment occurs, the new SW is detected via <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-xs">updatefound</code> event, and <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-xs">window.location.reload()</code> is triggered after <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-xs">controllerchange</code>. Users receive updates without manual intervention.
                  </p>
                </div>
              </div>
            </Section>

            {/* Future Improvements */}
            <Section id="future" title="Future Improvement Opportunities">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    category: 'Real-Time',
                    improvements: [
                      'Replace in-memory SSE map with Redis pub/sub for horizontal scaling',
                      'WebSocket upgrade for bi-directional communication',
                    ]
                  },
                  {
                    category: 'Payment',
                    improvements: [
                      'Stripe integration (Settings model ready)',
                      'M-Pesa C2B (Paybill direct) implementation',
                      'Automated payment reconciliation job',
                    ]
                  },
                  {
                    category: 'AI Features',
                    improvements: [
                      'Auto-captions for all gallery photos with queue',
                      'Sermon transcript search with full-text engine',
                      'Automated sermon summaries published to blog',
                    ]
                  },
                  {
                    category: 'Content',
                    improvements: [
                      'Email newsletter system with template builder',
                      'Push notifications for sermons, events, announcements',
                      'Multi-language support (Swahili/English)',
                    ]
                  },
                  {
                    category: 'Operations',
                    improvements: [
                      'Centralized logging with structured logger',
                      'Monitoring and alerting for uptime and errors',
                      'Automated testing coverage for auth and payments',
                    ]
                  },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800 hover:border-[#8B1A1A] transition-colors">
                    <h4 className="font-black text-sm uppercase tracking-wide text-[#8B1A1A] mb-4">{item.category}</h4>
                    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      {item.improvements.map((improvement, iidx) => (
                        <li key={iidx} className="flex gap-3">
                          <span className="text-[#8B1A1A] mt-0.5">•</span>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Section>

            {/* Final Summary */}
            <div className="bg-gradient-to-br from-slate-900 via-[#8B1A1A] to-slate-900 text-white rounded-xl p-12 text-center">
              <h2 className="text-3xl font-black uppercase tracking-tight mb-4">
                Production-Grade Platform
              </h2>
              <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-8">
                A comprehensive full-stack church management and engagement platform with 30+ routes, 100+ API endpoints, 19 MongoDB collections, 50+ permission strings, and 6 external service integrations.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                {[
                  { label: 'Frontend Pages', value: '30+' },
                  { label: 'API Endpoints', value: '100+' },
                  { label: 'Database Collections', value: '19' },
                  { label: 'Permission Strings', value: '50+' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                    <div className="text-4xl font-black text-white mb-2">{stat.value}</div>
                    <div className="text-xs uppercase tracking-widest text-slate-300">{stat.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-white/20">
                <p className="text-sm text-slate-400">
                  Built by <a href="https://x.com/rockstarbryant" className="text-[#8B1A1A] hover:text-white underline transition-colors">Bryant</a>
                </p>
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}

// Reusable Section Component
function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
          {title}
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-slate-300 to-transparent dark:from-slate-700"></div>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </section>
  );
}

// Feature Category Component
function FeatureCategory({ title, features }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
      <h3 className="text-sm font-black uppercase tracking-widest text-[#8B1A1A] mb-6">{title}</h3>
      <div className="space-y-4">
        {features.map((feature, idx) => (
          <div key={idx} className="flex gap-4 items-start">
            <span className="text-[#8B1A1A] mt-1">→</span>
            <div className="flex-1">
              <span className="font-bold text-sm text-slate-900 dark:text-white">{feature.name}:</span>
              <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">{feature.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Tech Stack Component
function TechStack({ category, items }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 mb-6">
      <h3 className="text-sm font-black uppercase tracking-widest text-[#8B1A1A] mb-4">{category}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center py-2 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <span className="text-sm font-medium text-slate-900 dark:text-white">{item.tech}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{item.version}</span>
          </div>
        ))}
      </div>
    </div>
  );
}