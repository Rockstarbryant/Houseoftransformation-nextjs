'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, AlertCircle, CheckCircle, Clock, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import OpportunityCard from '@/components/volunteer/OpportunityCard';
import { useAuth } from '@/context/AuthContext';
import { volunteerService } from '@/services/api/volunteerService';
import { volunteerData } from '@/data/volunteers';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

const VolunteerPage = () => {
  const { user } = useAuth();
  const [existingApplication, setExistingApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkApplicationStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkApplicationStatus = async () => {
    try {
      setLoading(true);
      const response = await volunteerService.checkExistingApplication();
      if (response.hasApplication) {
        setExistingApplication(response.application);
      }
    } catch (error) {
      console.error('Error checking application:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBranding = (status) => {
    const config = {
      pending: { color: 'bg-slate-900', icon: <Clock size={20} />, label: 'Reviewing' },
      interviewing: { color: 'bg-blue-600', icon: <AlertCircle size={20} />, label: 'Interview' },
      approved: { color: 'bg-[#8B1A1A]', icon: <CheckCircle size={20} />, label: 'Approved' },
      rejected: { color: 'bg-slate-400', icon: <AlertCircle size={20} />, label: 'Closed' }
    };
    return config[status] || config.pending;
  };

  return (
    <div className="bg-white dark:bg-slate-400 dark:text-white transition-colors min-h-screen font-sans antialiased">
      {/* 1. MINIMALIST STRIPED HEADER */}
      <section className="pt-32 pb-20 border-b border-slate-100 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[#8B1A1A]">
                <div className="w-12 h-[2px] bg-[#8B1A1A]" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em]">The H.O.T Portal</span>
              </div>
              <h1 className="text-7xl md:text-9xl font-black text-slate-900 tracking-tighter uppercase leading-[0.8]">
                Serve <br /> The Mission.
              </h1>
            </div>
            <p className="max-w-xs text-slate-500 font-bold uppercase tracking-widest text-[11px] leading-relaxed">
              Use your God-given talents to transform lives and grow in faith. Founded on faith, hope, and love.
            </p>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC STATUS & AUTH NOTIFICATIONS (Sharp Rectangles) */}
      <section className="bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Status Panel (Visible if logged in and has app) */}
            {user && existingApplication && !loading ? (
              <div className="py-12 lg:pr-12 lg:border-r border-slate-200 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-4 text-white ${getStatusBranding(existingApplication.status).color}`}>
                    {getStatusBranding(existingApplication.status).icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Status</p>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                      {getStatusBranding(existingApplication.status).label}
                    </h2>
                  </div>
                </div>
                <p className="text-slate-600 mb-8 font-medium">Your application for {existingApplication.ministry} is currently being processed by our team.</p>
                <div className="flex gap-2">
                  <Button onClick={() => window.location.href = '/profile/' + user._id} className="rounded-none bg-slate-900 text-white px-8 py-4 font-black uppercase text-[10px] tracking-widest">
                    Track Progress
                  </Button>
                </div>
              </div>
            ) : (
              /* Auth Prompt (Visible if not logged in) */
              !user && !loading && (
                <div className="py-12 lg:pr-12 lg:border-r border-slate-200 flex flex-col justify-center">
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4 italic">Sign In to Proceed</h3>
                  <p className="text-slate-500 mb-8 max-w-sm">Create an account to track your application status and progress.</p>
                  <Button onClick={() => window.location.href = '/login'} className="rounded-none bg-[#8B1A1A] text-white px-10 py-5 font-black uppercase text-[10px] tracking-widest self-start">
                    Access Dashboard
                  </Button>
                </div>
              )
            )}

            {/* Inspirational Block */}
            <div className="py-12 lg:pl-12 flex flex-col justify-center bg-[#8B1A1A] lg:bg-transparent lg:text-slate-900 text-white p-6 lg:p-0">
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Why We Volunteer</h3>
              <p className="text-sm opacity-80 font-medium leading-relaxed max-w-md italic">
                Our Busia Main Campus serves as a beacon of hope, fostering vibrant worship and active service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OPPORTUNITIES (Industrial List Style) */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Available Roles</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-[#8B1A1A]">{volunteerData.length}</span>
              <div className="w-8 h-[1px] bg-slate-200" />
            </div>
          </div>

          <div className="divide-y divide-slate-100 border-y border-slate-100">
            {volunteerData.map((opp) => (
              <div key={opp.id} className="group py-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 transition-all hover:bg-slate-50/50">
                <div className="flex-1 space-y-2">
                   <p className="text-[10px] font-black text-[#8B1A1A] uppercase tracking-[0.3em]">{opp.category || 'General Ministry'}</p>
                   <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter group-hover:translate-x-3 transition-transform duration-500">
                     {opp.title || opp.role}
                   </h3>
                </div>
                
                <div className="lg:w-1/2 flex flex-col md:flex-row md:items-center justify-end gap-12 w-full">
                  <div className="flex gap-10">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Weekly Commitment</p>
                      <p className="text-sm font-bold text-slate-900 uppercase">{opp.timeCommitment || '2-4 Hours'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Team Size</p>
                      <p className="text-sm font-bold text-slate-900 uppercase">{opp.teamCount || '15+ Members'}</p>
                    </div>
                  </div>
                  
                  {/* Keep OpportunityCard as functional component wrapper if it contains logic, 
                      but style the trigger to match this new layout */}
                  <OpportunityCard 
                    opportunity={opp}
                    onApplicationSuccess={checkApplicationStatus}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. THE PROCESS (Sharp Grid) */}
      <section className="py-24 bg-slate-900 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-px bg-[#8B1A1A] border border-[#8B1A1A]">
            {[
              { n: '01', t: 'Apply', d: 'Submit your specific ministry interest' },
              { n: '02', t: 'Vet', d: 'Our leaders review your qualifications' },
              { n: '03', t: 'Meet', d: 'A quick connect to discuss the vision' },
              { n: '04', t: 'Join', d: 'Welcome to the team and begin serving' }
            ].map((step, i) => (
              <div key={i} className="bg-slate-900 p-12 space-y-6 group hover:bg-black transition-all">
                <span className="text-5xl font-black text-slate-800 group-hover:text-[#8B1A1A] transition-colors leading-none">{step.n}</span>
                <div>
                  <h4 className="font-black text-white uppercase tracking-widest text-xs mb-2">{step.t}</h4>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed">{step.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default VolunteerPage;