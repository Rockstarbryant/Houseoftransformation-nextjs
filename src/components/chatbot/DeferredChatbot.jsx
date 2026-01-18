'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Chatbot = dynamic(() => import('./Chatbot'), { ssr: false });

export default function DeferredChatbot() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Load chatbot after 2 seconds (page is interactive)
    const timer = setTimeout(() => {
      setIsClient(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isClient) return null;

  return <Chatbot />;
}