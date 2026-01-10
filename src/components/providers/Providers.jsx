'use client';

import { AuthProvider } from '@/context/AuthContext';
import { ChatbotProvider } from '@/context/ChatbotContext';
import { DonationProvider } from '@/context/DonationContext';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <ChatbotProvider>
        <DonationProvider>
          {children}
        </DonationProvider>
      </ChatbotProvider>
    </AuthProvider>
  );
}