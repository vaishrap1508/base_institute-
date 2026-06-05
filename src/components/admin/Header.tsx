'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { USER_ROLES } from '@/lib/admin/store';
import { UserRole } from '@/lib/admin/types';
import ThemeToggle from '@/components/ThemeToggle';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export default function Header({ currentRole, onRoleChange }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center justify-between px-8 shrink-0 transition-colors duration-300">
      {/* Brand space spacer */}
      <div />

      {/* Utilities & Profile */}
      <div className="flex items-center gap-6">
        
        {/* Preview/Edit Switcher (Inline Capsule) */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-0.5 rounded-full border border-slate-200 dark:border-slate-850 shadow-inner select-none">
          {/* Preview Mode (maps to editor/view role) */}
          <button
            type="button"
            onClick={() => {
              const studentRole = {
                role: 'STUDENT',
                name: 'Vaishnavi Raparthy',
                email: 'student@aptitude-ai.com',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
              };
              localStorage.setItem('aptitude_current_role', JSON.stringify(studentRole));
              const editorRole = USER_ROLES.find(r => r.role === 'editor') || USER_ROLES[1];
              onRoleChange(editorRole);
              router.push('/student/dashboard');
            }}
            className={`px-3.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              currentRole.role === 'editor' 
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/5 dark:border-white/5 font-extrabold' 
                : 'text-slate-500 hover:text-slate-855 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Preview
          </button>

          {/* Edit Mode (maps to admin/edit role) */}
          <button
            type="button"
            onClick={() => {
              const adminRole = USER_ROLES.find(r => r.role === 'admin') || USER_ROLES[0];
              onRoleChange(adminRole);
            }}
            className={`px-3.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              currentRole.role === 'admin' 
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/5 dark:border-white/5 font-extrabold' 
                : 'text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Edit
          </button>
        </div>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-850" />

        {/* Theme Toggle Button */}
        <ThemeToggle />

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-850" />

        {/* Help & Notifications */}
        <div className="flex items-center gap-4">
          <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative group">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 border border-white dark:border-slate-900" />
            <span className="absolute top-full mt-2 right-0 hidden group-hover:block bg-slate-900 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap shadow-md z-50">
              2 Notifications
            </span>
          </button>
        </div>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-850" />

        {/* Profile Avatar & Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={currentRole.avatar}
              alt={currentRole.name}
              className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-800 shadow-xs"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-black text-slate-900 dark:text-white leading-tight">{currentRole.name}</span>
            <span className="text-[9px] font-bold text-blue-600 dark:text-blue-450 uppercase tracking-widest mt-0.5 leading-none">
              {currentRole.role}
            </span>
          </div>
        </div>

      </div>
    </header>
  );
}
