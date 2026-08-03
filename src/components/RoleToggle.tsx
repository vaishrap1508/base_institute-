'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

interface RoleToggleProps {
  className?: string;
  onRoleChange?: (roleData: any) => void;
}

export default function RoleToggle({ className = '', onRoleChange }: RoleToggleProps) {
  const router = useRouter();
  const [role, setRole] = useState<'admin' | 'STUDENT' | 'editor'>('admin');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('aptitude_current_role');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.role) {
          setRole(parsed.role);
        }
      } catch (_) {}
    }
  }, []);

  const handleSetRole = (targetRole: 'admin' | 'STUDENT') => {
    let roleObj: any;
    if (targetRole === 'STUDENT') {
      roleObj = {
        role: 'STUDENT',
        name: 'Vaishnavi Raparthy',
        email: 'student@aptitude-ai.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      };
    } else {
      roleObj = {
        role: 'admin',
        name: 'SARAH CONNOR',
        email: 'sarah.c@aptitude-ai.com',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack'
      };
    }

    localStorage.setItem('aptitude_current_role', JSON.stringify(roleObj));
    setRole(targetRole);

    if (onRoleChange) {
      onRoleChange(roleObj);
    }

    if (targetRole === 'STUDENT') {
      router.push('/student/dashboard');
    } else {
      router.push('/admin/dashboard');
    }
  };

  if (!mounted) {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <div className="flex bg-[#070a13] dark:bg-[#070a13] p-0.5 rounded-full border border-[#151c2f] dark:border-[#151c2f] shadow-inner select-none">
          <span className="px-3.5 py-1 text-[9px] font-black uppercase tracking-wider text-slate-400">Preview</span>
          <span className="px-3.5 py-1 text-[9px] font-black uppercase tracking-wider text-slate-400">Edit</span>
        </div>
        <ThemeToggle />
      </div>
    );
  }

  const isAdmin = role === 'admin';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="flex bg-[#070a13] dark:bg-[#070a13] p-0.5 rounded-full border border-[#151c2f] dark:border-[#151c2f] shadow-inner select-none">
        {/* Preview Mode */}
        <button
          type="button"
          suppressHydrationWarning
          onClick={() => handleSetRole('STUDENT')}
          className={`px-3.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            !isAdmin
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
          onClick={() => handleSetRole('admin')}
          className={`px-3.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            isAdmin
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Edit
        </button>
      </div>

      <ThemeToggle />
    </div>
  );
}
