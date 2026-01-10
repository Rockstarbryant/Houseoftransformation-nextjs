'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import Button from '../common/Button';

const DonationSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <Heart className="mx-auto mb-6" size={64} />
        <h2 className="text-4xl font-bold mb-6">Support Our Mission</h2>
        <p className="text-xl text-gray-200 mb-8">
          Your generous giving helps us spread God's love and support our community programs.
        </p>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <p className="text-3xl mb-2">🏛️</p>
            <p className="font-semibold">Building Fund</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <p className="text-3xl mb-2">❤️</p>
            <p className="font-semibold">Community Outreach</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <p className="text-3xl mb-2">📚</p>
            <p className="font-semibold">Ministry Programs</p>
          </div>
        </div>
        <Link href="/donate">
            <Button variant="secondary" size="lg">Give Now</Button>
        </Link>
        <p className="text-sm text-gray-300 mt-4">Secure giving via M-Pesa, Bank Transfer, or Card</p>
      </div>
    </section>
  );
};

export default DonationSection;