import React from 'react';
import { BookOpen, Calendar, Newspaper, Image } from 'lucide-react';
import Card from '../common/Card';

const ContentManager = () => {
  const contentItems = [
    { icon: BookOpen, label: 'Edit Sermons', color: 'text-blue-900' },
    { icon: Calendar, label: 'Manage Events', color: 'text-green-600' },
    { icon: Newspaper, label: 'Blog Posts', color: 'text-purple-600' },
    { icon: Image, label: 'Photo Gallery', color: 'text-pink-600' }
  ];

  return (
    <Card>
      <h3 className="text-xl font-bold text-blue-900 mb-4">Content Management</h3>
      <div className="space-y-3">
        {contentItems.map((item, index) => (
          <button key={index} className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex items-center gap-3">
            <item.icon size={20} className={item.color} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
};

export default ContentManager;