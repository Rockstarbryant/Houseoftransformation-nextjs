"use client"

import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import Card from '../common/Card';
import { CHURCH_INFO } from '@/utils/constants';

const MapSection = () => {
  return (
    <div>
      <Card className="mb-6">
        <h3 className="text-2xl font-bold text-blue-900 mb-6">Get In Touch</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <MapPin className="text-blue-900 mt-1" size={24} />
            <div>
              <p className="font-semibold text-gray-900">Address</p>
              <p className="text-gray-600">{CHURCH_INFO.address}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Phone className="text-blue-900 mt-1" size={24} />
            <div>
              <p className="font-semibold text-gray-900">Phone</p>
              <p className="text-gray-600">{CHURCH_INFO.phone}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Mail className="text-blue-900 mt-1" size={24} />
            <div>
              <p className="font-semibold text-gray-900">Email</p>
              <p className="text-gray-600">{CHURCH_INFO.email}</p>
            </div>
          </div>
        </div>
      </Card>
      
      <div className="bg-white rounded-xl overflow-hidden shadow-lg h-[500px]">
        <iframe
          src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127636.05878906237!2d${CHURCH_INFO.coordinates.lng}!3d${CHURCH_INFO.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sBusia%2C%20Kenya!5e0!3m2!1sen!2sus!4v1234567890`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          title="Church Location"
        />
      </div>
    </div>
  );
};

export default MapSection;