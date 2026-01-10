'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Calendar, Users, Loader } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import api from '@/services/api/authService';
import Card from '@/components/common/Card';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

export default function UsersPortalPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const roles = [
    { value: 'all', label: 'All Members' },
    { value: 'pastor', label: 'Pastors' },
    { value: 'bishop', label: 'Bishops' },
    { value: 'worship_team', label: 'Worship Team' },
    { value: 'usher', label: 'Ushers' },
    { value: 'volunteer', label: 'Volunteers' },
    { value: 'member', label: 'Members' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/users');
      setUsers(response.data.users || []);
      setFilteredUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load members. Please try again.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

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

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      pastor: 'bg-red-100 text-red-800',
      bishop: 'bg-blue-100 text-blue-800',
      worship_team: 'bg-yellow-100 text-yellow-800',
      usher: 'bg-green-100 text-green-800',
      volunteer: 'bg-indigo-100 text-indigo-800',
      member: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleIcon = (role) => {
    if (role === 'pastor' || role === 'bishop') return '👨‍⛪';
    if (role === 'worship_team') return '🎵';
    if (role === 'usher') return '🤝';
    if (role === 'volunteer') return '❤️';
    return '👤';
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-blue-900 mb-3">Church Members Portal</h1>
          <p className="text-lg text-gray-600">Connect with {users.length} members in our community</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2">
            <Input
              name="search"
              placeholder="Search by name, email, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-900 focus:outline-none font-medium"
          >
            {roles.map(role => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-700 font-medium">
            {filteredUsers.length} member{filteredUsers.length !== 1 ? 's' : ''} found
          </p>
          <div className="flex gap-2">
            <Users size={20} className="text-blue-900" />
            <span className="text-blue-900 font-bold">{users.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader size={40} className="animate-spin text-blue-900" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg">No members found</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredUsers.map((user) => (
              <Card key={user._id} hover className="flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-14 h-14 bg-blue-900 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {getRoleIcon(user.role)} {user.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-blue-900">{user.name}</h3>
                        <p className="text-xs text-gray-500">@{user.username || user.email.split('@')[0]}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                    {user.role.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {user.bio && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {user.bio}
                  </p>
                )}

                <div className="space-y-2 mb-4 text-sm">
                  {user.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={16} className="text-blue-900 flex-shrink-0" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={16} className="text-blue-900 flex-shrink-0" />
                      <a href={`tel:${user.phone}`} className="hover:text-blue-900 transition">
                        {user.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} className="text-blue-900 flex-shrink-0" />
                    <span className="text-xs">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {(user.blogsCreated || user.testimonyCount) && (
                  <div className="flex gap-4 mb-4 py-3 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-900">{user.blogsCreated || 0}</p>
                      <p className="text-xs text-gray-500">Posts</p>
                    </div>
                    <div className="text-center border-l border-r border-gray-200 flex-1">
                      <p className="text-lg font-bold text-blue-900">{user.testimonyCount || 0}</p>
                      <p className="text-xs text-gray-500">Stories</p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => window.location.href = `/profile/${user._id}`}
                  variant="outline"
                  fullWidth
                  className="mt-auto"
                >
                  View Profile
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}