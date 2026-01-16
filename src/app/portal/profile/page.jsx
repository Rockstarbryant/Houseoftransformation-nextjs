'use client';

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Mail, Phone, MapPin, User, Shield, Calendar } from 'lucide-react';
import Button from '@/components/common/Button';

/**
 * Portal - User Profile Page
 * Display and edit user profile information
 * Everyone has access to their own profile
 */
export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implement profile update API call
    console.log('Update profile:', formData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          My Profile
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          View and manage your profile information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Avatar & Basic Info */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
            {/* Avatar */}
            <div className="text-center">
              <div className="w-24 h-24 bg-[#8B1A1A] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl font-black text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {user?.name}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {user?.email}
              </p>
            </div>

            {/* Role Badge */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={16} className="text-[#8B1A1A]" />
                <span className="text-xs font-bold text-[#8B1A1A] uppercase tracking-wider">
                  Role
                </span>
              </div>
              <p className="text-lg font-black text-slate-900 dark:text-white capitalize">
                {user?.role?.name || 'Member'}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                {user?.role?.description || 'Default member access'}
              </p>
            </div>

            {/* Member Since */}
            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} className="text-slate-600 dark:text-slate-400" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Member Since
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {user?.createdAt 
                  ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'Recently'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Right: Detailed Information */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Profile Information
              </h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-sm font-bold text-[#8B1A1A] hover:text-red-700 transition-colors"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none transition"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Email cannot be changed
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none transition"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, Country"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none transition"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none transition resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-[#8B1A1A] text-white font-bold rounded-lg hover:bg-red-900 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Display Mode */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User size={16} className="text-slate-500" />
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Name
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {user?.name || 'N/A'}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Mail size={16} className="text-slate-500" />
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Email
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white break-all">
                    {user?.email || 'N/A'}
                  </p>
                </div>

                {user?.phone && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Phone size={16} className="text-slate-500" />
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Phone
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {user.phone}
                    </p>
                  </div>
                )}

                {user?.location && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={16} className="text-slate-500" />
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Location
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {user.location}
                    </p>
                  </div>
                )}

                {user?.bio && (
                  <div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                      Bio
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {user.bio}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}