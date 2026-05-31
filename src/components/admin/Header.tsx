'use client';

import React from 'react';
import { Bell, Award, Eye, FileText } from 'lucide-react';
import { USER_ROLES, SAMPLE_QUESTIONS } from '@/lib/admin/store';
import { UserRole, Question } from '@/lib/admin/types';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export default function Header({ currentRole, onRoleChange }: HeaderProps) {

  return (
    <header className="h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center justify-between px-8 shrink-0 transition-colors duration-300">
      {/* Brand space spacer */}
      <div />

      {/* Utilities & Profile */}
      <div className="flex items-center gap-6">



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

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-850" />

        {/* Profile & Capsule Toggler Container */}
        <div className="relative flex flex-col items-end justify-center h-full">
          {/* Profile Avatar & Info */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={currentRole.avatar}
                alt={currentRole.name}
                className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-800 shadow-sm"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
            </div>
            <div className="hidden xl:flex flex-col">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">{currentRole.name}</span>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-450 uppercase tracking-wider mt-0.5 leading-none">
                {currentRole.role}
              </span>
            </div>
          </div>

          {/* VIEW / EDIT Capsule Toggle Card */}
          <div className="absolute top-11 right-0 z-50 mt-1">
            <div 
              className="rounded-full flex items-center gap-1 p-0.5 border shadow-lg select-none transition-all duration-350 bg-slate-950/90 dark:bg-slate-900/90 backdrop-blur-md border-slate-800/80 dark:border-slate-700/80"
              style={{
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)'
              }}
            >
              {/* VIEW Mode Button */}
              <button
                onClick={() => {
                  const editorRole = USER_ROLES.find(r => r.role === 'editor') || USER_ROLES[1];
                  onRoleChange(editorRole);
                }}
                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 select-none cursor-pointer ${
                  currentRole.role === 'editor' 
                    ? 'bg-white text-slate-950 shadow-sm scale-102 font-black' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                View
              </button>

              {/* EDIT Mode Button */}
              <button
                onClick={() => {
                  const adminRole = USER_ROLES.find(r => r.role === 'admin') || USER_ROLES[0];
                  onRoleChange(adminRole);
                }}
                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 select-none cursor-pointer ${
                  currentRole.role === 'admin' 
                    ? 'bg-white text-slate-950 shadow-sm scale-102 font-black' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
