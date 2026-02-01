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
  title: 'House of Transformation Church',
  description: 'Welcome to House of Transformation Church - A place of worship, community, and spiritual growth.',
  keywords: 'church, worship, community, spiritual growth, sermons, events',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HOT Church',
  },
  formatDetection: {
    telephone: false,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
  },
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%23dc2626" width="192" height="192"/><text x="50%" y="50%" font-size="80" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">HOT</text></svg>',
        type: 'image/svg+xml',
        sizes: '192x192',
      },
    ],
    apple: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180"><rect fill="%23dc2626" width="180" height="180" rx="40"/><text x="90" y="90" font-size="70" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">HOT</text></svg>',
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