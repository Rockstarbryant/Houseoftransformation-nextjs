import { useState, useCallback } from 'react';
import { chatbotService } from '../services/chatbotService';

export const useChatbot = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! How can I help you today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(async (text) => {
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setIsTyping(true);

    try {
      const response = await chatbotService.getResponse(text);
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'bot', text: response }]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      setIsTyping(false);
    }
  }, []);

  return { messages, sendMessage, isTyping };
};