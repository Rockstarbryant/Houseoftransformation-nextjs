'use client';

import { AuthProvider } from '@/context/AuthContext';
import { ChatbotProvider } from '@/context/ChatbotContext';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <ChatbotProvider>
        {children}
      </ChatbotProvider>
    </AuthProvider>
  );
}