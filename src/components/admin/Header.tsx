'use client';

import React from 'react';
import { UserRole } from '@/lib/admin/types';
import ThemeToggle from '@/components/ThemeToggle';
import RoleToggle from '@/components/RoleToggle';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export default function Header({ currentRole, onRoleChange }: HeaderProps) {
  return (
    <header className="h-16 border-b border-[#151c2f] bg-[#090d16] flex items-center justify-end px-8 shrink-0 transition-colors duration-300 z-30 relative">
      {/* Utilities: ONLY the Preview / Edit Toggle Button & Theme Toggle */}
      <div className="flex items-center gap-4">
        <RoleToggle onRoleChange={onRoleChange} />
        <ThemeToggle />
      </div>
    </header>
  );
}
