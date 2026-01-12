'use client';

import { AuthProvider } from '@/context/AuthContext';
import { ChatbotProvider } from '@/context/ChatbotContext';
import { DonationProvider } from '@/context/DonationContext';
import Header from '@/components/layout/Header';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <Header />
      <ChatbotProvider>
        <DonationProvider>
          {children}
        </DonationProvider>
      </ChatbotProvider>
    </AuthProvider>
  );
}