'use client';

import { useEffect } from 'react';

export default function AdminPage() {
  useEffect(() => {
    // Check if user is already logged in as admin
    const token = localStorage.getItem('admin_token');
    const user = localStorage.getItem('admin_user');
    
    if (token && user) {
      const userData = JSON.parse(user);
      if (userData.role === 'ADMIN') {
        window.location.href = '/admin/dashboard';
        return;
      }
    }
    
    // Redirect to admin login
    window.location.href = '/admin/login';
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
    </div>
  );
}
