"use client"

import React from 'react';
import ContactForm from '@/components/contact/ContactForm';
import MapSection from '@/components/contact/MapSection';

const ContactPage = () => {
  return (
    <div className="pt-20 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-blue-900 mb-4">Visit Us</h1>
          <p className="text-xl text-gray-600">We'd love to see you this Sunday</p>
        </div>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <ContactForm />
          </div>
          <MapSection />
        </div>
      </div>
    </div>
  );
};

export default ContactPage;