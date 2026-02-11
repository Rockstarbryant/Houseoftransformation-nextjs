import './globals.css';
import { Inter } from 'next/font/google';
import Providers from '@/components/providers/Providers';
import { ThemeProvider } from '@/context/ThemeContext';
import FloatingThemeToggle from '@/components/common/FloatingThemeToggle';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import { PiPProvider } from '@/context/PiPContext';
import GlobalPiP from '@/components/GlobalPiP';
import QueryProvider from '@/components/providers/QueryProvider';
import GoogleAnalytics from '@/components/common/GoogleAnalytics';
import UpdateNotification from '@/components/common/UpdateNotification';
import SplashScreen from '@/components/common/SplashScreen';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    template: '%s | House of Transformation Church',
    default: 'House of Transformation Church | Busia, Kenya', 
  },
  description: 'Transforming lives through the anointed gospel of Jesus Christ. Join our community in Busia for worship, spiritual growth, and fellowship.',
  keywords: 'church in Busia, worship in Busia, HOT church Kenya, spiritual growth, Christian community Busia, M-Pesa church offerings',
  
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HOT Church',
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

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="HOT Church" />
        <meta name="theme-color" content="#8B1A1A" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        
        <QueryProvider>
          <ThemeProvider>
            <PiPProvider>
              <Providers>
                {/* Splash Screen - Client Component (no hydration errors) */}
                <SplashScreen />
                
                {children}
              </Providers>
              <GlobalPiP />
              <FloatingThemeToggle />
              <ServiceWorkerRegister />
              <UpdateNotification />
            </PiPProvider>
          </ThemeProvider>
        </QueryProvider>

        {/* Vercel Analytics */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover'
};