import './globals.css';
import { Inter } from 'next/font/google';
import Providers from '@/components/providers/Providers';
import { ThemeProvider } from '@/context/ThemeContext';
import FloatingThemeToggle from '@/components/common/FloatingThemeToggle';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'House of Transformation Church',
  description: 'Welcome to House of Transformation Church - A place of worship, community, and spiritual growth.',
  keywords: 'church, worship, community, spiritual growth, sermons, events',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <Providers>{children}</Providers>
          <FloatingThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}