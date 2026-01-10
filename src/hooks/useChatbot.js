'use client';

import { useState } from 'react';
import { chatbotService } from '@/services/chatbotService';

export const useChatbot = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! How can I help you today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = (text) => {
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setIsTyping(true);

    setTimeout(() => {
      const response = chatbotService.getResponse(text);
      setMessages(prev => [...prev, { sender: 'bot', text: response }]);
      setIsTyping(false);
    }, 1000);
  };

  return { messages, sendMessage, isTyping };
};