'use client';

import { useState, useEffect } from 'react';
import { chatbotService } from '@/services/chatbotService';
import { usePathname } from 'next/navigation';

export const useChatbot = () => {
  const pathname = usePathname();
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Initialize with context-aware greeting
  useEffect(() => {
    let greeting = 'Hello! 👋 Welcome to House of Transformation. How can I help you today?';
    
    // Provide context-based greetings
    if (pathname === '/about') {
      greeting = 'Hi! I see you\'re learning about our church. Would you like to know about our mission, vision, or leadership?';
    } else if (pathname === '/volunteer') {
      greeting = 'Great to see you interested in volunteering! Ask me about serving opportunities or how to get started.';
    } else if (pathname === '/contact') {
      greeting = 'Looking to get in touch? I can help with our contact details, location, or how to reach specific departments!';
    } else if (pathname === '/portal') {
      greeting = 'Need help with the portal? I can assist with login issues or direct you to the right resources.';
    } else if (pathname?.includes('/content')) {
      greeting = 'Exploring our content? Ask me about sermons, ministries, resources, or any specific programs!';
    }

    setMessages([{ sender: 'bot', text: greeting }]);
  }, [pathname]);

  const sendMessage = (text) => {
    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setIsTyping(true);

    setTimeout(() => {
      let response = chatbotService.getResponse(text);
      
      // Add contextual suggestions based on current page
      const lowerMsg = text.toLowerCase();
      if (pathname === '/') {
        if (lowerMsg.match(/more|tell me more|what else/)) {
          response += "\n\nYou're on our home page! You can explore different sections using the menu: About, Content, Volunteer, Portal, Contact, or Feedback.";
        }
      }

      setMessages(prev => [...prev, { sender: 'bot', text: response }]);
      setIsTyping(false);
    }, 800);
  };

  return { messages, sendMessage, isTyping };
};