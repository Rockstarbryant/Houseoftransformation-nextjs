import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/context/ThemeContext';
import { PiPProvider } from '@/context/PiPContext';
import QueryProvider from '@/components/providers/QueryProvider';
import GoogleAnalytics from '@/components/common/GoogleAnalytics';
import Providers from '@/components/providers/Providers';
import SplashScreen from '@/components/common/SplashScreen';
import ClientOnlyComponents from '@/components/ClientOnlyComponents';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter'
});

export const metadata = {
  metadataBase: new URL("https://houseoftransformation-nextjs.vercel.app"),
  title: {
    template: '%s | Busia House of Transformation Church',
    default: 'House of Transformation Church | Busia, Kenya', 
  },
  description: 'Transforming lives through the anointed gospel of Jesus Christ. Join our community in Busia for worship, spiritual growth, and fellowship.',
  keywords: 'church in Busia, worship in Busia, HOT church Kenya, spiritual growth, Christian community Busia, M-Pesa church offerings',
  applicationName: "Busia House of Transformation",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Busia HOT Church',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#8B1A1A'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ⚡ NO PRELOAD - Let Next.js Image handle priority */}
        
        {/* ⚡ CRITICAL: Preconnect to external domains */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="HOT Church" />
      </head>
      <body className={inter.className}>
        {/* ⚡ Google Analytics - deferred loading */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        
        <QueryProvider>
          <ThemeProvider>
            <PiPProvider>
              <Providers>
                {/* ✅ SPLASH SCREEN - Helps PWA UX after updates */}
                <SplashScreen />
                
                {children}
              </Providers>
              
              {/* ✅ Client-only components moved to separate client component */}
              <ClientOnlyComponents />
            </PiPProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}