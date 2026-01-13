'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, Calendar, Heart, MessageCircle, Edit, ArrowLeft, Share2 } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import api from '@/services/api/authService';
import VolunteerProfile from '@/components/volunteer/VolunteerProfile';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

export default function ProfileClient({ profile: initialProfile, userId }) {
  const router = useRouter();
  const { user: currentUser } = useAuthContext();
  
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: initialProfile.name,
    bio: initialProfile.bio || '',
    location: initialProfile.location || '',
    phone: initialProfile.phone || ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // --- ALL LOGIC 100% PRESERVED ---
  const handleSaveProfile = async () => {
    try {
      setError('');
      setSuccess('');
      setIsSaving(true);

      const response = await api.put(`/users/${userId}`, editData);
      
      if (response.status === 200 || response.status === 201) {
        setProfile(response.data.user);
        setIsEditing(false);
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      
      if (error.response?.status === 403) {
        setError('You can only edit your own profile');
      } else if (error.response?.status === 401) {
        setError('Your session has expired. Please login again.');
      } else {
        setError(error.response?.data?.message || 'Error updating profile');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const isOwnProfile = currentUser && (currentUser.id === userId || currentUser._id === userId);
  const canEdit = isOwnProfile || (currentUser && currentUser.role === 'admin');

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800 border-purple-300',
      pastor: 'bg-red-100 text-red-800 border-red-300',
      bishop: 'bg-blue-100 text-blue-800 border-blue-300',
      usher: 'bg-green-100 text-green-800 border-green-300',
      worship_team: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      volunteer: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      member: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[profile.role] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button - 100% PRESERVED */}
        <button
          onClick={() => router.push('/users')}
          className="flex items-center gap-2 text-blue-900 hover:text-blue-700 font-semibold mb-6"
        >
          <ArrowLeft size={20} /> Back to Members
        </button>

        {/* Success Message - 100% PRESERVED */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-800 rounded flex items-center gap-3">
            <Heart size={20} />
            {success}
          </div>
        )}

        {/* Error Message - 100% PRESERVED */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded flex items-center gap-3">
            <Heart size={20} />
            {error}
          </div>
        )}

        {/* Not Logged In Warning - 100% PRESERVED */}
        {!currentUser && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 rounded flex items-center gap-3">
            <Heart size={20} />
            You must be logged in to edit your profile
          </div>
        )}

        {/* Profile Header Card - 100% PRESERVED */}
        <Card className="mb-8">
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-lg">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Info */}
            <div className="flex-grow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-blue-900 mb-2">{profile.name}</h1>
                  <p className="text-gray-600 text-lg">@{profile.username || profile.email.split('@')[0]}</p>
                </div>
                {canEdit && (
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant={isEditing ? 'danger' : 'primary'}
                    className="mt-4 md:mt-0"
                    disabled={isSaving}
                  >
                    <Edit size={16} /> {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                )}
              </div>

              {/* Role Badge */}
              <div className="mb-6">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold border-2 ${getRoleColor(profile.role)}`}>
                  {profile.role.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-900">{profile.blogsCreated || 0}</p>
                  <p className="text-gray-600 text-sm">Posts</p>
                </div>
                <div className="text-center border-l border-r border-gray-300">
                  <p className="text-2xl font-bold text-blue-900">{profile.testimonyCount || 0}</p>
                  <p className="text-gray-600 text-sm">Testimonies</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-900">{profile.ministries?.length || 0}</p>
                  <p className="text-gray-600 text-sm">Ministries</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - 100% PRESERVED */}
          {!isEditing && (
            <div className="flex gap-3">
              <Button variant="primary" fullWidth className="flex items-center justify-center gap-2">
                <MessageCircle size={18} /> Send Message
              </Button>
              <Button variant="outline" fullWidth className="flex items-center justify-center gap-2">
                <Share2 size={18} /> Share Profile
              </Button>
            </div>
          )}
        </Card>

        {/* About Section - 100% PRESERVED */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">About</h2>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-900 focus:outline-none"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-900 focus:outline-none"
                  placeholder="Tell us about yourself..."
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={editData.location}
                  onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-900 focus:outline-none"
                  placeholder="City, Country"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-900 focus:outline-none"
                  placeholder="+254..."
                  disabled={isSaving}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleSaveProfile} 
                  variant="primary" 
                  fullWidth
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {profile.bio ? (
                <p className="text-gray-700 leading-relaxed text-lg">{profile.bio}</p>
              ) : (
                <p className="text-gray-500 italic">No bio added yet</p>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <Mail className="text-blue-900 flex-shrink-0 mt-1" size={22} />
                  <div>
                    <p className="text-gray-600 text-sm">Email</p>
                    <a href={`mailto:${profile.email}`} className="text-blue-900 font-semibold hover:underline">
                      {profile.email}
                    </a>
                  </div>
                </div>

                {profile.phone && (
                  <div className="flex items-start gap-4">
                    <Phone className="text-blue-900 flex-shrink-0 mt-1" size={22} />
                    <div>
                      <p className="text-gray-600 text-sm">Phone</p>
                      <a href={`tel:${profile.phone}`} className="text-blue-900 font-semibold hover:underline">
                        {profile.phone}
                      </a>
                    </div>
                  </div>
                )}

                {profile.location && (
                  <div className="flex items-start gap-4">
                    <MapPin className="text-blue-900 flex-shrink-0 mt-1" size={22} />
                    <div>
                      <p className="text-gray-600 text-sm">Location</p>
                      <p className="text-blue-900 font-semibold">{profile.location}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <Calendar className="text-blue-900 flex-shrink-0 mt-1" size={22} />
                  <div>
                    <p className="text-gray-600 text-sm">Member Since</p>
                    <p className="text-blue-900 font-semibold">
                      {new Date(profile.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Volunteer Applications Section - 100% PRESERVED */}
        {isOwnProfile && (
          <VolunteerProfile userId={userId} />
        )}

        {/* Ministries Section - 100% PRESERVED */}
        {(profile.ministries?.length > 0 || isEditing) && (
          <Card className="mt-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">Ministry Involvement</h2>
            <div className="flex flex-wrap gap-3">
              {profile.ministries?.length > 0 ? (
                profile.ministries.map((ministry, index) => (
                  <span key={index} className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-5 py-2 rounded-full font-semibold shadow">
                    {ministry}
                  </span>
                ))
              ) : (
                <p className="text-gray-600 italic">Not involved in any ministries yet</p>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
