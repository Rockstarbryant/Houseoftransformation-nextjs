import './globals.css';
import { Inter } from 'next/font/google';
import Providers from '@/components/providers/Providers';
import { ThemeProvider } from '@/context/ThemeContext';
import FloatingThemeToggle from '@/components/common/FloatingThemeToggle';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import { PiPProvider } from '@/context/PiPContext';
import GlobalPiP from '@/components/GlobalPiP';
import QueryProvider from '@/components/providers/QueryProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  // This is the default title if a page doesn't have one
  title: {
    template: '%s | House of Transformation Church',
    default: 'House of Transformation Church | Busia, Kenya', 
  },
  description: 'Transforming lives through the anointed gospel of Jesus Christ. Join our community in Busia for worship, spiritual growth, and fellowship.',
  keywords: 'church in Busia, worship in Busia, HOT church Kenya, spiritual growth, Christian community Busia, M-Pesa church offerings',
  
  // PWA and Web App settings
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HOT Church',
  },
  
  // SEO Bots instructions
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
        <meta name="theme-color" content="#dc2626" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <QueryProvider>
          <ThemeProvider>
            <PiPProvider>
              <Providers>
                {children}
              </Providers>
              <GlobalPiP />
              <FloatingThemeToggle />
              <ServiceWorkerRegister />
            </PiPProvider>
          </ThemeProvider>
        </QueryProvider>
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