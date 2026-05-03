'use server';

import { cookies } from 'next/headers';

export async function setAuthCookie(token: string, role: 'user' | 'admin') {
  const cookieStore = await cookies();
  const cookieName = role === 'admin' ? 'admin_token' : 'user_token';
  
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    secure: false, // Set to false for development (http)
    sameSite: 'none', // Required for cross-origin requests
    path: '/',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  });
}

export async function clearAuthCookie(role: 'user' | 'admin' | 'all') {
  const cookieStore = await cookies();
  if (role === 'all' || role === 'user') {
    cookieStore.delete('user_token');
  }
  if (role === 'all' || role === 'admin') {
    cookieStore.delete('admin_token');
  }
}
