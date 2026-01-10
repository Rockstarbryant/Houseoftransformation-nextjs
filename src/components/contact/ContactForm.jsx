"use client"

import React, { useState } from 'react';
import { Mail, User, MessageSquare } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card.jsx';

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      alert('Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
      setSubmitting(false);
    }, 1000);
  };

  return (
    <Card>
      <h3 className="text-2xl font-bold text-blue-900 mb-4">Send Us a Message</h3>
      <div className="space-y-4">
        <Input name="name" placeholder="Your Name" icon={User} value={formData.name} onChange={handleChange} required />
        <Input name="email" type="email" placeholder="Your Email" icon={Mail} value={formData.email} onChange={handleChange} required />
        <div>
          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            rows="4"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900"
          />
        </div>
        <Button type="submit" variant="primary" fullWidth onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Sending...' : 'Send Message'}
        </Button>
      </div>
    </Card>
  );
};

export default ContactForm;