'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

export default function QueryProvider({ children }) {
  const [queryClient] = useState(() => {
    console.log('🔵 [QueryProvider] Creating new QueryClient instance');
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30000, // 30 seconds
          refetchOnWindowFocus: true,
          retry: 1,
        },
      },
    });
  });

  useEffect(() => {
    console.log('✅ [QueryProvider] QueryClientProvider mounted and ready');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}