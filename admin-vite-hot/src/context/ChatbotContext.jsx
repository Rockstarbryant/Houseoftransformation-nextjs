import React, { createContext, useContext, useState } from 'react';

const ChatbotContext = createContext(null);

export const ChatbotProvider = ({ children }) => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const openChatbot = () => setIsChatbotOpen(true);
  const closeChatbot = () => setIsChatbotOpen(false);
  const toggleChatbot = () => setIsChatbotOpen(prev => !prev);

  return (
    <ChatbotContext.Provider value={{ isChatbotOpen, openChatbot, closeChatbot, toggleChatbot }}>
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbotContext = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbotContext must be used within ChatbotProvider');
  }
  return context;
};