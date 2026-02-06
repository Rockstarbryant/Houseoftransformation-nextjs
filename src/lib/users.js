// /lib/users.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function getAllUsers() {
  try {
    const res = await fetch(`${API_URL}/users`, {
    next: { revalidate: 60 },
    headers: { 'Content-Type': 'application/json' },
  });

    if (!res.ok) throw new Error('Failed to fetch users');

    const data = await res.json();
    return data.users || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

// /lib/users.js - Add to existing file

export async function getUserById(userId) {
  try {
    const res = await fetch(`${API_URL}/users/${userId}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.user || null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}