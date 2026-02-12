'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FaqAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {items.map((item, index) => (
        <div 
          key={index} 
          className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900"
        >
          <button
            onClick={() => toggle(index)}
            className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none focus:bg-slate-50 dark:focus:bg-slate-800 transition-colors"
            aria-expanded={openIndex === index}
          >
            <span className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
              {item.question}
            </span>
            {openIndex === index ? (
              <ChevronUp className="w-5 h-5 text-red-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>
          
          <div 
            className={`
              overflow-hidden transition-all duration-300 ease-in-out
              ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
            `}
          >
            <div className="px-6 pb-6 text-slate-600 dark:text-slate-400 leading-relaxed">
              {item.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}