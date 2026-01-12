"use client"
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, Calendar, Heart, MessageCircle, Edit, ArrowLeft, Share2, ShieldCheck, Fingerprint, Zap, X } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import api from '@/services/api/authService';
import VolunteerProfile from '@/components/volunteer/VolunteerProfile';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId;
  const { user: currentUser } = useAuthContext();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/users/${userId}`);
      const userData = response.data.user;
      setProfile(userData);
      setEditData({
        name: userData.name,
        bio: userData.bio || '',
        location: userData.location || '',
        phone: userData.phone || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Could not load profile. Access Denied.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setError('');
      setSuccess('');
      setIsSaving(true);
      const response = await api.put(`/users/${userId}`, editData);
      if (response.status === 200 || response.status === 201) {
        setProfile(response.data.user);
        setIsEditing(false);
        setSuccess('Identity Records Updated.');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Update Failed.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-16 h-1 bg-slate-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-red-600 animate-[loading_1.5s_infinite]" />
        </div>
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Authenticating Dossier</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="pt-24 pb-20 min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <X size={64} className="mx-auto text-red-600 mb-6" />
          <h2 className="text-4xl font-black uppercase tracking-tighter">Zero Results Found</h2>
          <Button onClick={() => router.push('/users')} className="mt-8">Return to Directory</Button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && (currentUser.id === userId || currentUser._id === userId);
  const canEdit = isOwnProfile || (currentUser && currentUser.role === 'admin');

  const getRoleStyle = (role) => {
    const styles = {
      admin: 'bg-slate-900 text-white border-slate-900',
      pastor: 'bg-red-600 text-white border-red-600',
      bishop: 'bg-blue-600 text-white border-blue-600',
      member: 'bg-white text-slate-900 border-slate-200'
    };
    return styles[role] || 'bg-slate-100 text-slate-600 border-slate-200';
  };

  return (
    <div className="pt-32 pb-40 min-h-screen bg-white font-sans">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* TOP NAVIGATION / STATUS BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <button
            onClick={() => router.push('/users')}
            className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" /> 
            Personnel Directory
          </button>

          <div className="flex items-center gap-4">
             {success && <span className="text-[10px] font-black text-green-600 uppercase tracking-widest animate-pulse">{success}</span>}
             {error && <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{error}</span>}
          </div>
        </div>

        {/* HERO SECTION: DOSSIER HEADER */}
        <div className="relative mb-24">
          <div className="absolute -top-10 -left-10 text-[12vw] font-black text-slate-50 select-none -z-10 uppercase leading-none">
            {profile.role}
          </div>

          <div className="flex flex-col md:flex-row gap-12 items-end">
            {/* LARGE AVATAR NODE */}
            <div className="relative group">
              <div className="w-48 h-48 bg-slate-900 flex items-center justify-center text-white text-7xl font-black rounded-none border-8 border-white shadow-[20px_20px_0px_rgba(0,0,0,0.05)] overflow-hidden">
                {profile.name.charAt(0).toUpperCase()}
                <div className="absolute inset-0 bg-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-red-600 p-4 text-white">
                <Fingerprint size={24} />
              </div>
            </div>

            <div className="flex-grow">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <span className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest border-2 ${getRoleStyle(profile.role)}`}>
                  {profile.role.replace('_', ' ')}
                </span>
                <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">ID: {userId.slice(-8)}</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black text-slate-900 uppercase tracking-tighter leading-[0.8] mb-6">
                {profile.name}
              </h1>

              <div className="flex gap-8 border-t border-slate-100 pt-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Impact Score</p>
                  <p className="text-3xl font-black text-slate-900">{(profile.blogsCreated || 0) + (profile.testimonyCount || 0)}</p>
                </div>
                <div className="w-[1px] bg-slate-100" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Assignments</p>
                  <p className="text-3xl font-black text-slate-900">{profile.ministries?.length || 0}</p>
                </div>
              </div>
            </div>

            {canEdit && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                  isEditing ? 'bg-red-600 text-white' : 'bg-slate-900 text-white hover:bg-red-600'
                }`}
              >
                {isEditing ? 'Abort Changes' : 'Modify Dossier'}
              </button>
            )}
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-3 gap-16">
          
          {/* LEFT COL: DATA POINTS */}
          <div className="lg:col-span-2 space-y-16">
            
            <section>
              <h3 className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-red-600 mb-10">
                <span className="w-8 h-[2px] bg-red-600" /> Executive Summary
              </h3>
              
              {isEditing ? (
                <div className="space-y-8 bg-slate-50 p-10 border-2 border-slate-100">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Legal Name</label>
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="w-full bg-white border-2 border-slate-200 p-4 font-bold outline-none focus:border-slate-900 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Deployment Hub (Location)</label>
                      <input
                        type="text"
                        value={editData.location}
                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                        className="w-full bg-white border-2 border-slate-200 p-4 font-bold outline-none focus:border-slate-900 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Personal Narrative (Bio)</label>
                    <textarea
                      value={editData.bio}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      rows="4"
                      className="w-full bg-white border-2 border-slate-200 p-4 font-bold outline-none focus:border-slate-900 transition-colors"
                    />
                  </div>
                  <button 
                    onClick={handleSaveProfile}
                    className="w-full bg-slate-900 text-white py-6 font-black uppercase tracking-[0.3em] text-xs hover:bg-red-600 transition-colors"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Synching Data...' : 'Commit Changes to Server'}
                  </button>
                </div>
              ) : (
                <div className="space-y-12">
                   <p className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                    {profile.bio || "No mission bio documented for this individual."}
                   </p>

                   <div className="grid md:grid-cols-2 gap-10 border-t border-slate-100 pt-10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 flex items-center justify-center rounded-xl text-slate-400">
                           <Mail size={18} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Digital Contact</p>
                          <p className="font-bold text-slate-900 underline">{profile.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 flex items-center justify-center rounded-xl text-slate-400">
                           <Calendar size={18} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Service Commencement</p>
                          <p className="font-bold text-slate-900">{new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                        </div>
                      </div>
                   </div>
                </div>
              )}
            </section>

            {isOwnProfile && (
              <section className="bg-slate-900 p-12 text-white overflow-hidden relative">
                <Zap size={200} className="absolute -right-20 -bottom-20 text-white/5 rotate-12" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500 mb-8 relative z-10">Personnel Development</h3>
                <div className="relative z-10">
                   <VolunteerProfile userId={userId} />
                </div>
              </section>
            )}
          </div>

          {/* RIGHT COL: SIDEBAR */}
          <div className="space-y-16">
            
            {/* MINISTRIES CARD */}
            <div className="border-t-4 border-slate-900 pt-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 mb-8 flex items-center justify-between">
                Active Mandates <ShieldCheck size={14} />
              </h3>
              <div className="space-y-3">
                {profile.ministries?.length > 0 ? (
                  profile.ministries.map((ministry, index) => (
                    <div key={index} className="flex items-center justify-between group cursor-default">
                       <span className="text-sm font-black uppercase tracking-tighter text-slate-400 group-hover:text-slate-900 transition-colors">
                        {ministry}
                       </span>
                       <div className="h-[1px] flex-grow mx-4 bg-slate-50 group-hover:bg-red-600 transition-colors" />
                       <span className="text-[10px] font-black text-slate-900">ACTV</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-xs italic uppercase tracking-widest">Pending Deployment</p>
                )}
              </div>
            </div>

            {/* QUICK ACTIONS */}
            {!isEditing && (
              <div className="space-y-4">
                <button className="w-full bg-slate-100 hover:bg-slate-900 hover:text-white p-6 flex items-center justify-between transition-all group">
                   <span className="font-black uppercase tracking-[0.2em] text-[10px]">Secure Message</span>
                   <MessageCircle size={18} className="group-hover:rotate-12 transition-transform" />
                </button>
                <button className="w-full bg-slate-100 hover:bg-slate-900 hover:text-white p-6 flex items-center justify-between transition-all group">
                   <span className="font-black uppercase tracking-[0.2em] text-[10px]">Export Dossier</span>
                   <Share2 size={18} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}