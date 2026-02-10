'use client';

import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import ChatMessage from './ChatMessage';
import QuickActions from './QuickActions';
import { useChatbot } from '@/hooks/useChatbot';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, sendMessage, isTyping } = useChatbot();
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open church assistant chatbot"
        className="fixed bottom-4 right-4 sm:right-6 bg-blue-900 text-white p-4 rounded-full shadow-2xl hover:bg-blue-800 transition-all z-40 animate-bounce"
      >
        <MessageCircle size={28} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 max-w-md bg-white rounded-2xl shadow-2xl z-40 overflow-hidden">
    <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MessageCircle size={24} />
          <span className="font-bold">Church Assistant</span>
        </div>
        <button 
          onClick={() => setIsOpen(false)} 
          aria-label="Close chatbot"
          className="hover:bg-white/20 p-1 rounded"
        >
          <X size={20} />
        </button>
      </div>

      <div className="h-80 sm:h-96 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} message={msg} />
        ))}
        {isTyping && <ChatMessage message={{ sender: 'bot', text: 'Typing...' }} />}
      </div>

      <div className="p-3 sm:p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your question..."
            aria-label="Type message to church assistant"
            className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900"
          />
          <button 
            onClick={handleSend} 
            aria-label="Send message"
            className="bg-blue-900 text-white p-2 rounded-lg hover:bg-blue-800 flex-shrink-0"
          >
            <Send size={20} />
          </button>
        </div>
        <QuickActions onSelect={sendMessage} />
      </div>
    </div>
  );
};

export default Chatbot;