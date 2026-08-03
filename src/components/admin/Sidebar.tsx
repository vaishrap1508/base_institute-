"use client";
import React from 'react';
import * as Icons from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SidebarProps {
  activeId: string;
  onSelectTab?: (id: string) => void;
  userRole?: 'admin' | 'editor';
}

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  href?: string;
  badge?: string;
}

export default function Sidebar({ activeId, onSelectTab, userRole }: SidebarProps) {
  const supabase = createClient();

  const allItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutGrid', href: '/admin/dashboard' },
    { id: 'users', label: 'Users', icon: 'Users', href: '/admin/users' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3', href: '/admin/analytics' },
    { id: 'editor', label: 'Content', icon: 'FileText', href: '/admin/editor' },
    { id: 'directory', label: 'Reports', icon: 'ClipboardList', href: '/admin/directory' },
    { id: 'settings', label: 'Settings', icon: 'Settings', href: '/admin/settings' },
    { id: 'badges', label: 'Admin Tools', icon: 'Wrench', href: '/admin/badges' },
    { id: 'system-health', label: 'System Health', icon: 'Activity', href: '/admin/system-health' },
  ];

  const bottomItems: SidebarItem[] = [
    { id: 'docs', label: 'Support', icon: 'HelpCircle', href: '/admin/docs' },
    { id: 'logout', label: 'Logout', icon: 'LogOut', href: '/' }
  ];

  // For 'editor' role, only show Content and Logout
  const visibleTopItems = userRole === 'editor' 
    ? allItems.filter(item => item.id === 'editor')
    : allItems;

  const router = useRouter();

  const handleItemClick = async (item: SidebarItem) => {
    onSelectTab?.(item.id);
    if (item.id === 'logout') {
      await supabase.auth.signOut();
      localStorage.removeItem('aptitude_current_role');
      
      // Clear mock session cookies
      document.cookie = 'aptitude_mock_auth=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax';
      document.cookie = 'aptitude_onboarding_completed=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax';
      
      window.location.href = '/';
      return;
    }
    if (item.href) {
      router.push(item.href);
    }
  };

  const renderNavButton = (item: SidebarItem) => {
    const IconComponent = (Icons as any)[item.icon] ?? Icons.HelpCircle;
    const isActive = item.id === activeId;

    return (
      <button suppressHydrationWarning
        key={item.id}
        onClick={() => handleItemClick(item)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13px] font-semibold transition-all duration-200 group text-left relative overflow-hidden select-none cursor-pointer ${
          isActive
            ? 'bg-slate-100 dark:bg-[#151c2f] text-slate-900 dark:text-white shadow-md shadow-purple-500/5 border border-purple-500/20'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-100 hover:bg-slate-800/40 border border-transparent'
        }`}
      >
        <span className="flex items-center gap-3.5">
          <IconComponent
            className={`w-4.5 h-4.5 transition-colors duration-200 ${
              isActive ? 'text-purple-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:text-slate-200'
            }`}
          />
          <span className="tracking-wide">{item.label}</span>
        </span>
        
        {isActive && (
          <span className="w-1.5 h-6 bg-gradient-to-b from-purple-500 to-indigo-600 rounded-full shadow-[0_0_8px_#8b5cf6] absolute right-0" />
        )}

        {item.badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="w-64 bg-white dark:bg-[#090d16] border-r border-slate-200 dark:border-[#151c2f] flex flex-col h-screen shrink-0 transition-colors duration-300 z-30">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-200 dark:border-[#151c2f] flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-slate-900 dark:text-white shadow-lg shadow-indigo-500/20">
          <Icons.Layers className="w-5.5 h-5.5" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-slate-900 dark:text-white tracking-wider text-[16px] leading-tight uppercase font-heading">
            BASE INSTITUTE
          </span>
          <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mt-0.5">
            System Controller
          </span>
        </div>
      </div>

      {/* Top Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        {visibleTopItems.map((item) => renderNavButton(item))}
      </nav>

      {/* Bottom Navigation Links */}
      <div className="px-4 py-4 border-t border-slate-200 dark:border-[#151c2f] space-y-1.5 bg-slate-50 dark:bg-[#070a10]">
        {bottomItems.map((item) => renderNavButton(item))}
      </div>
    </aside>
  );
}
