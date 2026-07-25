"use client";

import React, { createContext, useContext } from 'react';

type RoleType = {
  role: 'admin' | 'editor' | 'student';
  name: string;
  email: string;
  avatar: string;
};

interface AdminContextType {
  currentRole: RoleType;
  handleRoleChange: (role: RoleType) => void;
}

export const AdminContext = createContext<AdminContextType | null>(null);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminContext Provider');
  }
  return context;
};
