'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({ children }) {
  // ✅ CRITICAL FIX: Use useState to create QueryClient only once
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false, // Don't refetch on window focus
        retry: 1, // Only retry once on failure
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

/*

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
} */