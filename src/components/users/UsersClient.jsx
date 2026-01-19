'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Calendar, Users, Loader, Shield, User } from 'lucide-react';

export const revalidate = 3600;
export default function UsersClient({ initialUsers }) {
  const [users] = useState(initialUsers);
  const [filteredUsers, setFilteredUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const roles = [
    { value: 'all', label: 'All Members' },
    { value: 'pastor', label: 'Pastors' },
    { value: 'bishop', label: 'Bishops' },
    { value: 'worship_team', label: 'Worship Team' },
    { value: 'usher', label: 'Ushers' },
    { value: 'volunteer', label: 'Volunteers' },
    { value: 'member', label: 'Members' }
  ];

  // Filter logic - 100% PRESERVED
  useEffect(() => {
    let result = users;
    if (roleFilter !== 'all') {
      result = result.filter(u => u.role === roleFilter);
    }
    if (search.trim()) {
      result = result.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.username && u.username.toLowerCase().includes(search.toLowerCase())) ||
        (u.location && u.location.toLowerCase().includes(search.toLowerCase()))
      );
    }
    setFilteredUsers(result);
  }, [search, roleFilter, users]);

  const getRoleStyle = (role) => {
    const styles = {
      admin: 'bg-slate-900 text-white',
      pastor: 'bg-[#8B1A1A] text-white',
      bishop: 'bg-[#8B1A1A] text-white',
      worship_team: 'bg-amber-500 text-black',
      usher: 'bg-emerald-600 text-white',
      volunteer: 'bg-sky-600 text-white',
      member: 'bg-slate-100 text-slate-600'
    };
    return styles[role] || 'bg-slate-100 text-slate-600';
  };

  return (
    <>
      {/* Filter Bar - 100% PRESERVED */}
      <div className="bg-white p-3 rounded-3xl shadow-xl shadow-slate-200/50 mb-12 grid md:grid-cols-4 gap-3">
        <div className="md:col-span-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#8B1A1A] transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search the community..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#8B1A1A]/20 transition-all text-sm font-bold tracking-tight"
            />
          </div>
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full px-4 py-4 bg-slate-900 text-white rounded-2xl focus:outline-none text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-800 transition-colors"
        >
          {roles.map(role => (
            <option key={role.value} value={role.value}>{role.label}</option>
          ))}
        </select>
      </div>

      {/* User Grid - 100% PRESERVED */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-slate-200">
          <Users size={64} className="mx-auto text-slate-200 mb-6" />
          <p className="text-slate-400 font-bold uppercase tracking-widest">No members match your search</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map((user) => (
            <div 
              key={user._id} 
              className="group relative bg-white rounded-[32px] p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-[#8B1A1A]/10 border border-slate-100 flex flex-col"
            >
              {/* Profile Header - 100% PRESERVED */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    <span className="text-2xl font-black text-slate-300">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div className={`absolute -bottom-2 -right-2 p-1.5 rounded-lg shadow-lg ${getRoleStyle(user.role)}`}>
                    <User size={12} />
                  </div>
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-tighter leading-tight group-hover:text-[#8B1A1A] transition-colors">
                    {user.name}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    @{user.username || user.email.split('@')[0]}
                  </p>
                </div>
              </div>

              {/* Bio / Stats - 100% PRESERVED */}
              <div className="mb-6 flex-1">
                <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-4 ${getRoleStyle(user.role)}`}>
                 {user?.role?.name || 'Member'}
                </span>
                {user.bio && (
                  <p className="text-xs leading-relaxed text-slate-500 line-clamp-2 italic">
                    "{user.bio}"
                  </p>
                )}
              </div>

              {/* Contact Info - 100% PRESERVED */}
              <div className="space-y-3 pt-6 border-t border-slate-50 mb-6">
                {user.location && (
                  <div className="flex items-center gap-3 text-slate-500">
                    <MapPin size={14} className="text-[#8B1A1A]" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">{user.location}</span>
                  </div>
                )}
                {user.phone && (
                  <div className="flex items-center gap-3 text-slate-500">
                    <Phone size={14} className="text-[#8B1A1A]" />
                    <span className="text-[10px] font-bold tracking-tight">{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-slate-400">
                  <Calendar size={14} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">
                    Member since {new Date(user.createdAt).getFullYear()}
                  </span>
                </div>
              </div>

              {/* Action - 100% PRESERVED */}
              <button
                onClick={() => window.location.href = `/profile/${user._id}`}
                className="w-full py-4 bg-slate-50 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] group-hover:bg-[#8B1A1A] group-hover:text-white transition-all duration-300"
              >
                View Full Profile
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
