"use client"

import React, { useState } from 'react';
import { Send, CheckCircle2, Heart, MessageCircle, User, Mail } from 'lucide-react';

const ContactForm = () => {
  const [status, setStatus] = useState('idle'); // idle, submitting, success

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setStatus('success');
  };

  if (status === 'success') {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-stone-100 shadow-xl">
        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Received</h3>
        <p className="text-slate-500 mb-8 max-w-xs mx-auto">
          Thank you for reaching out. A member of our team will be in touch with you shortly.
        </p>
        <button 
          onClick={() => setStatus('idle')}
          className="text-red-600 font-semibold hover:text-red-700 underline underline-offset-4"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[32px] shadow-xl shadow-slate-200/50 border border-white">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-400">Send a Message</h3>
        <p className="text-slate-500 dark:text-slate-200 mt-2">
          Have a question or need prayer? Fill out the form below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Name</label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-200" />
              <input 
                required
                type="text" 
                placeholder="Your full name"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-600 border-none rounded-xl focus:ring-2 focus:ring-red-600/20 focus:bg-white transition-all outline-none text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-200" />
              <input 
                required
                type="email" 
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-600 border-none rounded-xl focus:ring-2 focus:ring-red-600/20 focus:bg-white transition-all outline-none text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Topic</label>
          <div className="relative">
            <Heart size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-200" />
            <select className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-600 border-none rounded-xl focus:ring-2 focus:ring-red-600/20 focus:bg-white transition-all outline-none text-slate-800 appearance-none cursor-pointer">
              <option>General Inquiry</option>
              <option>Direction</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Message</label>
          <div className="relative">
            <MessageCircle size={18} className="absolute left-4 top-5 text-slate-400 dark:text-slate-200" />
            <textarea 
              required
              rows={4}
              placeholder="How can we help you today?"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-600 border-none rounded-xl focus:ring-2 focus:ring-red-600/20 focus:bg-white transition-all outline-none text-slate-800 resize-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={status === 'submitting'}
          className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-700/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
        >
          {status === 'submitting' ? (
            'Sending...'
          ) : (
            <>
              Send Message <Send size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;