"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import { usePathname } from 'next/navigation';
import { AdminContext } from './AdminContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [currentRole, setCurrentRole] = useState<{ role: 'admin' | 'editor' | 'student'; name: string; email: string; avatar: string }>({
    role: 'admin',
    name: 'SARAH CONNOR',
    email: 'sarah.c@aptitude-ai.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack'
  });

  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const storedRole = localStorage.getItem('aptitude_current_role');
    if (storedRole) {
      try {
        setCurrentRole(JSON.parse(storedRole));
      } catch (e) { localStorage.removeItem('aptitude_current_role'); }
    }
  }, []);

  const handleRoleChange = (roleData: any) => {
    setCurrentRole(roleData);
    localStorage.setItem('aptitude_current_role', JSON.stringify(roleData));
  };

  // Determine activeId from pathname
  // e.g. /admin/dashboard -> 'dashboard', /admin/users -> 'users'
  const activeId = pathname?.split('/')[2] || 'dashboard';

  if (!mounted) {
    return <div className="min-h-screen bg-slate-50 dark:bg-[#070a13]" />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#070a13] text-slate-900 dark:text-slate-100 font-sans overflow-hidden antialiased transition-colors duration-300">
      <Sidebar activeId={activeId} userRole={currentRole.role as 'admin' | 'editor'} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <AdminContext.Provider value={{ currentRole, handleRoleChange }}>
          {children}
        </AdminContext.Provider>
      </div>
    </div>
  );
}
