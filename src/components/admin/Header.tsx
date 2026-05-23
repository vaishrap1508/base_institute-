'use client';

import React from 'react';
import { Search, Bell, HelpCircle, Shield, Award, Eye } from 'lucide-react';
import { USER_ROLES } from '@/lib/admin/store';
import { UserRole } from '@/lib/admin/types';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export default function Header({ currentRole, onRoleChange }: HeaderProps) {
  return (
    <header className="h-16 border-b border-slate-200/80 bg-white flex items-center justify-between px-8 shrink-0">
      {/* Search Input Area */}
      <div className="flex items-center gap-3 w-96 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Search resources, questions, analytics..."
          className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Utilities & Profile */}
      <div className="flex items-center gap-6">
        {/* Role Selector Trigger (Demonstrates role-based workflow) */}
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-100/80 border border-slate-200/50 rounded-lg">
          <Shield className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Role:</span>
          <select
            value={currentRole.role}
            onChange={(e) => {
              const matched = USER_ROLES.find((r) => r.role === e.target.value);
              if (matched) onRoleChange(matched);
            }}
            className="text-xs font-semibold text-slate-700 bg-transparent border-none cursor-pointer focus:outline-none pr-1"
          >
            {USER_ROLES.map((r) => (
              <option key={r.role} value={r.role}>
                {r.name} ({r.role.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Support Priority */}
        <div className="hidden md:flex items-center gap-2.5 text-right">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-800 leading-tight">Support</span>
            <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase leading-none mt-0.5">24/7 Priority</span>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200" />

        {/* Help & Notifications */}
        <div className="flex items-center gap-4">
          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors relative group">
            <HelpCircle className="w-5 h-5" />
            <span className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap">
              Help Docs
            </span>
          </button>

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
