import './globals.css';
import { Inter } from 'next/font/google';
import Providers from '@/components/providers/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'House of Transformation Church',
  description: 'Welcome to House of Transformation Church',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}