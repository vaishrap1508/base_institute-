'use client';

import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Users, Mail, Lock, RefreshCw, Key, KeyRound, AlertTriangle, Plus, Cpu } from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { USER_ROLES } from '@/lib/admin/store';
import { UserRole } from '@/lib/admin/types';

export default function UsersPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>(USER_ROLES[0]);
  const [activeUsers, setActiveUsers] = useState([
    {
      name: 'Sarah Connor',
      email: 'sarah.c@aptitude-ai.com',
      role: 'admin',
      clearance: 'L3 clearance',
      status: 'Active',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Lucy',
    },
    {
      name: 'Marcus Wright',
      email: 'marcus.w@aptitude-ai.com',
      role: 'editor',
      clearance: 'L2 clearance',
      status: 'Active',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo',
    },
    {
      name: 'Kyle Reese',
      email: 'kyle.r@aptitude-ai.com',
      role: 'editor',
      clearance: 'L1 restricted',
      status: 'Suspended',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Max',
    }
  ]);

  useEffect(() => {
    const storedRole = localStorage.getItem('aptitude_current_role');
    if (storedRole) {
      try {
        const parsed = JSON.parse(storedRole);
        const matched = USER_ROLES.find(r => r.role === parsed.role);
        if (matched) setCurrentRole(matched);
      } catch (e) {
        console.warn(e);
      }
    }
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('aptitude_current_role', JSON.stringify(role));
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-[#030712] dark:text-slate-100 font-sans overflow-hidden antialiased transition-colors duration-300">
      <Sidebar activeId="users" userRole={currentRole.role} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header currentRole={currentRole} onRoleChange={handleRoleChange} />

        {currentRole.role !== 'admin' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-[#030712]">
            <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-8 flex flex-col items-center text-center gap-6 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center text-rose-500 dark:text-rose-455 shadow-inner relative">
                <Cpu className="w-7 h-7 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-600 text-[10px] font-black text-white flex items-center justify-center border-2 border-white dark:border-slate-900 shadow">!</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Clearance Protocol Violation</h2>
                <p className="text-xs text-slate-400 dark:text-slate-550 font-semibold uppercase tracking-wider">Secured Sandbox v2.4</p>
              </div>
              <div className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850 p-4 rounded-xl space-y-3.5 text-xs text-left">
                <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-2">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider">Clearance Status</span>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/35 text-rose-700 dark:text-rose-400 uppercase tracking-wide">DENIED</span>
                </div>
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 font-semibold">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 dark:text-slate-555 font-semibold uppercase">Attempted User</span>
                    <span className="text-slate-800 dark:text-slate-100 font-bold">{currentRole.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 dark:text-slate-555 font-semibold uppercase">Clearance Role</span>
                    <span className="text-slate-800 dark:text-rose-400 font-bold uppercase tracking-wider text-[11px] text-rose-600">{currentRole.role}</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-[10px] text-slate-400 dark:text-slate-555 font-semibold uppercase">Attempted Access Route</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold font-mono text-[11px]">/admin/users</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 w-full mt-2">
                <button
                  onClick={() => {
                    const admin = USER_ROLES.find(r => r.role === 'admin');
                    if (admin) handleRoleChange(admin);
                  }}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-blue-500/10 active:scale-98 transition-all cursor-pointer"
                >
                  <span>Request Admin Clearance</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-900 pb-5">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Clearance Protocols & Identities</h1>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  Assign administrative credentials, define granular clearance vectors, and monitor access sessions.
                </p>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 text-xs font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-blue-500/10 active:scale-98 cursor-pointer">
                <Plus className="w-4 h-4" />
                <span>Create Identity</span>
              </button>
            </div>

            {/* Users Table List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Identities Table Panel */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4.5 h-4.5 text-slate-500 dark:text-slate-400" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-250 tracking-tight">Active Sandbox Accounts</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-50/70 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider select-none">
                        <th className="px-6 py-4 w-52">Identity Profile</th>
                        <th className="px-6 py-4 w-44">Credentials Email</th>
                        <th className="px-6 py-4 w-32">Clearance Role</th>
                        <th className="px-6 py-4 w-32">Uptime Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 dark:divide-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                      {activeUsers.map((user) => (
                        <tr key={user.email} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-4.5 flex items-center gap-3">
                            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-800 shadow-xs" />
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 dark:text-white leading-tight">{user.name}</span>
                              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wide mt-0.5">{user.clearance}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4.5 font-mono text-slate-500 dark:text-slate-400">{user.email}</td>
                          <td className="px-6 py-4.5">
                            {user.role === 'admin' ? (
                              <span className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 text-blue-700 dark:text-blue-400 text-[9px] font-extrabold px-2 py-0.5 rounded tracking-wider uppercase">ADMIN L3</span>
                            ) : (
                              <span className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-[9px] font-extrabold px-2 py-0.5 rounded tracking-wider uppercase">EDITOR L2</span>
                            )}
                          </td>
                          <td className="px-6 py-4.5">
                            {user.status === 'Active' ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Active</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-500 dark:text-rose-450 font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                <span>Suspended</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Clearance Matrix Panel */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs p-6 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <Shield className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">Access Clearance Key</h3>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl space-y-2">
                      <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                        <span className="text-blue-600 dark:text-blue-400">ADMIN CLEARANCE</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-550">FULL ACCESS</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        Admin tokens carry full clearance to read/write questions, publish database entries, reset latency profiles, check schema rules, and review raw JSON exports.
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl space-y-2">
                      <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                        <span className="text-slate-700 dark:text-slate-300">EDITOR CLEARANCE</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-550">LIMITED ACCESS</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        Editor tokens grant isolated clearance to access the Dynamic Content Studio to compose mathematical items and validate options. Restricted from global directory search and setup panels.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <KeyRound className="w-5 h-5 text-amber-500 shrink-0" />
                  <div className="flex flex-col text-[11px] text-slate-400 dark:text-slate-550 leading-relaxed">
                    <span className="font-bold text-slate-600 dark:text-slate-350">Clearance Cryptography Enabled</span>
                    <span>Tokens automatically roll every 24 hours.</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
