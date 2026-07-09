'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, Grid, HelpCircle } from 'lucide-react';
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
    <header className="h-16 border-b border-[#151c2f] bg-[#090d16] flex items-center justify-between px-8 shrink-0 transition-colors duration-300 z-20">
      
      {/* Search Input on the Left */}
      <div className="relative w-80 max-w-md hidden md:block">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search analytics, logs, or users..."
          className="w-full pl-10 pr-4 py-2 text-[12px] font-semibold bg-[#070a13] border border-[#151c2f] rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all duration-200"
        />
      </div>

      {/* Mobile spacer */}
      <div className="md:hidden" />

      {/* Utilities & Profile */}
      <div className="flex items-center gap-6">
        
        {/* Preview/Edit Switcher (Inline Capsule) */}
        <div className="flex bg-[#070a13] p-0.5 rounded-full border border-[#151c2f] shadow-inner select-none">
          {/* Preview Mode */}
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
                ? 'bg-purple-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Preview
          </button>

          {/* Edit Mode */}
          <button
            type="button"
            onClick={() => {
              const adminRole = USER_ROLES.find(r => r.role === 'admin') || USER_ROLES[0];
              onRoleChange(adminRole);
            }}
            className={`px-3.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              currentRole.role === 'admin' 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Edit
          </button>
        </div>

        <div className="h-5 w-px bg-[#151c2f]" />

        {/* Theme Toggle Button */}
        <ThemeToggle />

        <div className="h-5 w-px bg-[#151c2f]" />

        {/* Help & Notifications & Apps */}
        <div className="flex items-center gap-3.5">
          {/* Notifications Bell */}
          <button className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#151c2f] rounded-lg transition-colors relative group cursor-pointer">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 border border-[#090d16] shadow-[0_0_8px_#22d3ee]" />
            <span className="absolute top-full mt-2 right-0 hidden group-hover:block bg-[#0f1322] border border-[#151c2f] text-slate-200 text-[10px] rounded px-2.5 py-1 whitespace-nowrap shadow-xl z-50">
              2 Notifications
            </span>
          </button>


        </div>

        <div className="h-5 w-px bg-[#151c2f]" />

        {/* Profile Avatar & Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={currentRole.avatar}
              alt={currentRole.name}
              className="w-9 h-9 rounded-full object-cover border border-[#151c2f] shadow-md"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#090d16]" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-extrabold text-white leading-none">
              {currentRole.name === 'Sarah Connor' ? 'Alex Curator' : currentRole.name}
            </span>
            <span className="text-[10px] font-bold text-slate-500 tracking-wider mt-1 leading-none uppercase">
              Profile Settings
            </span>
          </div>
        </div>

      </div>
    </header>
  );
}
