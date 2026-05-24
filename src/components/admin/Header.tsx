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
    <header className="h-16 border-b border-slate-200/80 bg-white flex items-center justify-between px-8 shrink-0">
      {/* Brand space spacer */}
      <div />

      {/* Utilities & Profile */}
      <div className="flex items-center gap-6">



        {/* Help & Notifications */}
        <div className="flex items-center gap-4">
          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors relative group">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 border border-white" />
            <span className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap">
              2 Notifications
            </span>
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200" />

        {/* Profile Avatar & Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={currentRole.avatar}
              alt={currentRole.name}
              className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <div className="hidden xl:flex flex-col">
            <span className="text-xs font-semibold text-slate-800 leading-tight">{currentRole.name}</span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-0.5 leading-none">
              {currentRole.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
