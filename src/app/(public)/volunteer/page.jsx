'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, AlertCircle, CheckCircle, Clock, ArrowRight, ShieldCheck, Zap, Heart, Users, Calendar } from 'lucide-react';
import OpportunityCard from '@/components/volunteer/OpportunityCard';
import { useAuth } from '@/context/AuthContext';
import { volunteerService } from '@/services/api/volunteerService';
import { volunteerData } from '@/data/volunteers';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Link from 'next/link';

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
      pending: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock size={20} />, label: 'Under Review' },
      interviewing: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <AlertCircle size={20} />, label: 'Interview' },
      approved: { color: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle size={20} />, label: 'Approved' },
      rejected: { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: <AlertCircle size={20} />, label: 'Closed' }
    };
    return config[status] || config.pending;
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-24 font-sans antialiased transition-colors">
      
      {/* 1. HERO SECTION */}
      <div className="relative bg-stone-900 h-[450px] md:h-[500px] w-full overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
            <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-blue-600 blur-[100px]" />
            <div className="absolute bottom-[10%] left-[10%] w-[300px] h-[300px] rounded-full bg-purple-600 blur-[80px]" />
        </div>
        
        <div className="absolute inset-0 bg-stone-900" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center pb-20 pt-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 backdrop-blur-sm border border-white/20 text-xs font-semibold mb-6">
               <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/> Volunteer Portal
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              Serve the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Mission</span>.
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed">
              Use your God-given talents to transform lives. Join a team, find your community, and make a difference today.
            </p>
          </div>
        </div>
      </div>

      {/* 2. DASHBOARD & STATUS CARD (Floating Overlap) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 md:-mt-32 relative z-10 mb-16">
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            
            {/* Left: Introduction Card */}
            <div className="lg:col-span-2 bg-stone-50 dark:bg-stone-950 rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                        <Heart size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Why We Serve</h2>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-6">
                    Our Busia Main Campus serves as a beacon of hope, fostering vibrant worship and active service. 
                    Volunteering isn't just about what you do—it's about who you become in the process.
                </p>
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium">
                        <Users size={16} className="text-blue-500"/> Vibrant Community
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium">
                        <Zap size={16} className="text-amber-500"/> Impactful Service
                    </div>
                </div>
            </div>

            {/* Right: Status/Auth Card */}
            <div className="lg:col-span-1">
                {user && existingApplication && !loading ? (
                    // LOGGED IN & APPLIED
                    <div className="bg-stone-50 dark:bg-stone-950 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-gray-100 dark:border-slate-800 h-full flex flex-col">
                        <div className="mb-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Application Status</p>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{existingApplication.ministry}</h3>
                        </div>
                        
                        <div className={`flex items-center gap-3 p-4 rounded-xl border mb-6 ${getStatusBranding(existingApplication.status).color}`}>
                            {getStatusBranding(existingApplication.status).icon}
                            <span className="font-bold">{getStatusBranding(existingApplication.status).label}</span>
                        </div>

                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 flex-grow">
                            Your application is currently being processed by our leadership team.
                        </p>

                        <Button onClick={() => window.location.href = '/profile/' + user._id} className="w-full justify-center bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold transition-all">
                            Track Progress
                        </Button>
                    </div>
                ) : !user && !loading ? (
                    // NOT LOGGED IN
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 md:p-8 shadow-xl text-white h-full flex flex-col justify-center relative overflow-hidden">
                        {/* Decor */}
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                        
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-3">Join the Family</h3>
                            <p className="text-blue-100 mb-8 text-sm leading-relaxed">
                                Create an account to start your journey, apply for teams, and track your progress.
                            </p>
                            <Link href="/login" className="block w-full text-center bg-white text-blue-700 hover:bg-blue-50 py-3 rounded-xl font-bold transition-colors shadow-sm">
                                Sign In / Register
                            </Link>
                        </div>
                    </div>
                ) : (
                    // LOADING STATE or NO APP
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-slate-800 h-full flex flex-col justify-center items-center text-center">
                         <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-blue-500 animate-spin mb-4"/>
                         <p className="text-slate-500 text-sm">Loading status...</p>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* 3. THE PROCESS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">How it Works</h2>
            <div className="hidden md:block h-px flex-1 bg-gray-200 dark:bg-slate-800 ml-8" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: '01', t: 'Apply', d: 'Submit your specific ministry interest.', icon: UserPlus },
              { n: '02', t: 'Vet', d: 'Leaders review your qualifications.', icon: ShieldCheck },
              { n: '03', t: 'Meet', d: 'A quick connect to discuss vision.', icon: Users },
              { n: '04', t: 'Join', d: 'Welcome to the team & start serving!', icon: CheckCircle }
            ].map((step, i) => (
              <div key={i} className="group relative bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="absolute top-6 right-6 text-slate-100 dark:text-slate-800 text-6xl font-black -z-10 group-hover:text-blue-50 dark:group-hover:text-blue-900/20 transition-colors">
                    {step.n}
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <step.icon size={24} />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{step.t}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.d}</p>
              </div>
            ))}
        </div>
      </section>

      {/* 4. OPPORTUNITIES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Available Roles</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Find the perfect place to serve.</p>
            </div>
            <span className="hidden sm:inline-flex px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-sm font-semibold">
                {volunteerData.length} Openings
            </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {volunteerData.map((opp) => (
              <div key={opp.id} className="group bg-stone-250 dark:bg-stone-950 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
                {/* Card Header */}
                <div className="p-6 pb-4">
                   <div className="flex justify-between items-start mb-4">
                        <span className="inline-block px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {opp.category || 'General'}
                        </span>
                        {/* Optional Icon based on role could go here */}
                   </div>
                   
                   <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                     {opp.title || opp.role}
                   </h3>
                </div>

                {/* Stats Row */}
                <div className="px-6 py-3 border-y border-gray-50 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/20 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-slate-400" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{opp.timeCommitment || 'Flexible'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users size={16} className="text-slate-400" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{opp.teamCount || 'Team'}</span>
                    </div>
                </div>
                
                {/* Footer / Action */}
                <div className="p-6 mt-auto">
                    {/* Logic Wrapper: We keep the functional component here. 
                        We wrap it in a div to control its width/style if necessary, 
                        though OpportunityCard likely renders its own button.
                    */}
                    <OpportunityCard 
                        opportunity={opp}
                        onApplicationSuccess={checkApplicationStatus}
                    />
                </div>
              </div>
            ))}
        </div>
      </section>

    </div>
  );
};

export default VolunteerPage;