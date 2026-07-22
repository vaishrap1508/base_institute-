'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, Search, Grid, HelpCircle, Check, Shield, 
  LayoutGrid, Users, BarChart3, FileText, ClipboardList, 
  Settings, Wrench, Activity, ExternalLink, X, Zap 
} from 'lucide-react';
import { USER_ROLES } from '@/lib/admin/store';
import { UserRole } from '@/lib/admin/types';
import ThemeToggle from '@/components/ThemeToggle';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export default function Header({ currentRole, onRoleChange }: HeaderProps) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showGridMenu, setShowGridMenu] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Student Registrations',
      desc: '12 new students signed up for Campus Placement practice sets.',
      time: '10m ago',
      unread: true,
      type: 'users'
    },
    {
      id: 2,
      title: 'Question Attempt Spike',
      desc: '240 attempts registered in Quantitative Aptitude - Percentages module.',
      time: '45m ago',
      unread: true,
      type: 'activity'
    },
    {
      id: 3,
      title: 'System Health Optimal',
      desc: 'All core platform services operating at < 20ms API latency.',
      time: '2h ago',
      unread: false,
      type: 'system'
    }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const quickLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutGrid, color: 'text-purple-400' },
    { name: 'Users', href: '/admin/users', icon: Users, color: 'text-cyan-400' },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, color: 'text-indigo-400' },
    { name: 'Content Editor', href: '/admin/editor', icon: FileText, color: 'text-emerald-400' },
    { name: 'Reports', href: '/admin/directory', icon: ClipboardList, color: 'text-amber-400' },
    { name: 'Admin Tools', href: '/admin/badges', icon: Wrench, color: 'text-pink-400' },
    { name: 'Settings', href: '/admin/settings', icon: Settings, color: 'text-slate-300' },
    { name: 'System Health', href: '/admin/system-health', icon: Activity, color: 'text-rose-400' },
    { name: 'Student Portal', href: '/student/dashboard', icon: ExternalLink, color: 'text-blue-400' },
  ];

  return (
    <header className="h-16 border-b border-[#151c2f] bg-[#090d16] flex items-center justify-between px-8 shrink-0 transition-colors duration-300 z-30 relative">
      
      {/* Search Input on the Left */}
      <div className="relative w-80 max-w-md hidden md:block">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          suppressHydrationWarning
          type="text"
          placeholder="Search questions, analytics, or users..."
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
            suppressHydrationWarning
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
            suppressHydrationWarning
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
        <div className="flex items-center gap-2 relative">
          
          {/* Notifications Bell */}
          <div className="relative">
            <button 
              suppressHydrationWarning
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowGridMenu(false);
              }}
              className={`p-2 rounded-xl transition-all relative cursor-pointer ${
                showNotifications ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-[#151c2f]'
              }`}
              title="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 border border-[#090d16] shadow-[0_0_8px_#22d3ee]" />
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute top-full mt-3 right-0 w-80 bg-[#0f1322] border border-[#151c2f] rounded-2xl shadow-2xl overflow-hidden z-50 animate-scaleUp">
                <div className="p-4 border-b border-[#151c2f] flex justify-between items-center bg-[#070a13]/60">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-black text-white uppercase tracking-wider font-heading">
                      Notifications
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
                      className="text-[9px] font-extrabold text-purple-400 hover:text-purple-300 uppercase tracking-wider cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-[#151c2f] max-h-80 overflow-y-auto custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div key={n.id} className={`p-3.5 hover:bg-[#151c2f]/40 transition-colors text-left flex gap-3 items-start ${n.unread ? 'bg-purple-950/10' : ''}`}>
                        <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex justify-between items-baseline">
                            <h4 className="text-xs font-bold text-white leading-snug">{n.title}</h4>
                            <span className="text-[9px] text-slate-500 font-semibold">{n.time}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-semibold leading-normal">{n.desc}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-500 font-semibold">No notifications</div>
                  )}
                </div>

                <div className="p-2.5 border-t border-[#151c2f] bg-[#070a13]/40 text-center">
                  <button 
                    onClick={() => setShowNotifications(false)} 
                    className="text-[10px] font-black text-slate-400 hover:text-slate-200 uppercase tracking-widest cursor-pointer"
                  >
                    Close Panel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Grid / App Launcher Button */}
          <div className="relative">
            <button 
              suppressHydrationWarning
              onClick={() => {
                setShowGridMenu(!showGridMenu);
                setShowNotifications(false);
              }}
              className={`p-2 rounded-xl transition-all relative cursor-pointer ${
                showGridMenu ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-[#151c2f]'
              }`}
              title="Quick App Launcher"
            >
              <Grid className="w-4.5 h-4.5" />
            </button>

            {/* Grid App Launcher Popover */}
            {showGridMenu && (
              <div className="absolute top-full mt-3 right-0 w-80 bg-[#0f1322] border border-[#151c2f] rounded-2xl shadow-2xl overflow-hidden z-50 animate-scaleUp p-4">
                <div className="flex items-center justify-between border-b border-[#151c2f] pb-3 mb-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-heading">
                    Platform Navigation Launcher
                  </span>
                  <button onClick={() => setShowGridMenu(false)} className="text-slate-500 hover:text-slate-300">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {quickLinks.map(link => {
                    const IconComp = link.icon;
                    return (
                      <button
                        key={link.name}
                        onClick={() => {
                          setShowGridMenu(false);
                          router.push(link.href);
                        }}
                        className="flex flex-col items-center justify-center p-3 bg-[#070a13] border border-[#151c2f] hover:border-purple-500/40 rounded-xl transition-all group cursor-pointer"
                      >
                        <IconComp className={`w-5 h-5 ${link.color} group-hover:scale-110 transition-transform`} />
                        <span className="text-[9.5px] font-extrabold text-slate-300 group-hover:text-white mt-2 text-center leading-tight">
                          {link.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

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
