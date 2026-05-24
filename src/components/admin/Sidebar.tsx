"use client";
import React from 'react';
import * as Icons from 'lucide-react';
import { SIDEBAR_ITEMS } from '@/lib/admin/store';

interface SidebarProps {
  activeId: string;
  onSelectTab?: (id: string) => void;
  userRole?: 'admin' | 'editor';
}

export default function Sidebar({ activeId, onSelectTab, userRole }: SidebarProps) {
  const visibleItems =
    userRole === 'editor'
      ? SIDEBAR_ITEMS.filter((item) => item.id === 'editor' || item.id === 'logout')
      : SIDEBAR_ITEMS;

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200/80 flex flex-col h-screen shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-200/60 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
          <Icons.Layers className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 tracking-tight text-[15px] leading-tight">
            System Admin
          </span>
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
            Institutional Access
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const IconComponent = (Icons as any)[item.icon] ?? Icons.HelpCircle;
          const isActive = item.id === activeId;

          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab?.(item.id);
                if (item.href) {
                  window.location.href = item.href;
                }
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group text-left ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <IconComponent
                  className={`w-4.5 h-4.5 transition-colors duration-150 ${
                    isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span className="tracking-tight">{item.label}</span>
              </div>
              {item.badge && !item.href && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-blue-100/80 text-blue-700'
                      : 'bg-slate-200/60 text-slate-500 group-hover:bg-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Branding */}
      <div className="p-4 border-t border-slate-200/60 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
          <Icons.ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Secured Sandbox v2.4</span>
        </div>
      </div>
    </aside>
  );
}
