'use client';

import React from 'react';

const ChatMessage = ({ message }) => {
  const isBot = message.sender === 'bot';
  
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-lg ${
          isBot
            ? 'bg-gray-200 text-gray-800'
            : 'bg-blue-600 text-white'
        }`}
      >
        {message.text}
      </div>
    </div>
  );
};

export default ChatMessage;