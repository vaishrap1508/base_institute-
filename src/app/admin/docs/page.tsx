'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, FileCode, CheckCircle2, ChevronRight, Play, Copy, ArrowUpRight, Cpu } from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { USER_ROLES } from '@/lib/admin/store';
import { UserRole } from '@/lib/admin/types';

export default function DocsPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>(USER_ROLES[0]);

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

  const apis = [
    { method: 'GET', path: '/v2/questions', desc: 'Queries the master directory database. Supports parameters like status, domain, and difficulty.', auth: 'Bearer key' },
    { method: 'POST', path: '/v2/questions', desc: 'Compiles and uploads a new question into the content registry. Requires Zod-valid schema payload.', auth: 'Bearer key' },
    { method: 'GET', path: '/v2/taxonomy', desc: 'Retrieves the complete nested hierarchy tree containing domains, sub-topics, and concepts.', auth: 'None' }
  ];

  const sampleJson = `{
  "id": "Q-8029-X",
  "domainId": "quant",
  "subTopicId": "arithmetic",
  "conceptId": "percentages",
  "difficulty": "EASY",
  "questionStem": "A merchant sells an item at a profit...",
  "options": [
    { "id": "A", "text": "$50", "isCorrect": true }
  ],
  "status": "Published"
}`;

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800 dark:bg-[#030712] dark:text-slate-100 font-sans overflow-hidden antialiased transition-colors duration-300">
      <Sidebar activeId="documentation" userRole={currentRole.role} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header currentRole={currentRole} onRoleChange={handleRoleChange} />

        {currentRole.role !== 'admin' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
            <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-8 flex flex-col items-center text-center gap-6 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center text-rose-500 shadow-inner relative">
                <Cpu className="w-7 h-7 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-600 text-[10px] font-black text-white flex items-center justify-center border-2 border-white shadow">!</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Clearance Protocol Violation</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Secured Sandbox v2.4</p>
              </div>
              <div className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850 p-4 rounded-xl space-y-3.5 text-xs text-left">
                <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-855 pb-2">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Clearance Status</span>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-455 uppercase tracking-wide">DENIED</span>
                </div>
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 font-semibold">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 dark:text-slate-550 font-semibold uppercase">Attempted User</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{currentRole.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 dark:text-slate-550 font-semibold uppercase">Clearance Role</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold uppercase tracking-wider text-[11px] text-rose-600 dark:text-rose-450">{currentRole.role}</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-[10px] text-slate-400 dark:text-slate-555 font-semibold uppercase">Attempted Access Route</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold font-mono text-[11px]">/admin/documentation</span>
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
            <div className="border-b border-slate-200/60 dark:border-slate-800 pb-5">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Aptitude API Specifications</h1>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                Granular endpoint parameters, request validators, and response formats for external systems integration.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Endpoint Table */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-950/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4.5 h-4.5 text-slate-500 dark:text-slate-400" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight">Endpoint Registry v2</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider select-none">
                        <th className="px-6 py-4 w-44">Method / Endpoint</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4 w-32">Clearance Required</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 dark:divide-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                      {apis.map((api) => (
                        <tr key={`${api.method}-${api.path}`} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/40 transition-colors">
                          <td className="px-6 py-4.5">
                            <div className="flex items-center gap-2">
                              {api.method === 'GET' ? (
                                <span className="bg-emerald-50 border border-emerald-100 text-emerald-705 dark:bg-emerald-950/30 dark:border-emerald-900/30 dark:text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded">GET</span>
                              ) : (
                                <span className="bg-blue-50 border border-blue-100 text-blue-705 dark:bg-blue-950/30 dark:border-blue-900/30 dark:text-blue-400 text-[10px] font-extrabold px-2 py-0.5 rounded">POST</span>
                              )}
                              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[11px]">{api.path}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4.5 text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{api.desc}</td>
                          <td className="px-6 py-4.5 font-semibold text-slate-400 dark:text-slate-500">{api.auth}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* JSON Response Panel */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4.5 h-4.5 text-blue-600 dark:text-blue-450" />
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">Structured Item Schema</h3>
                    </div>
                  </div>

                  {/* Dark Mode Fenced Code Box */}
                  <div className="bg-slate-900 dark:bg-black/45 rounded-xl p-4 font-mono text-[10px] leading-relaxed text-indigo-200 dark:text-indigo-300 overflow-x-auto shadow-inner relative group">
                    <pre>{sampleJson}</pre>
                    <button className="absolute top-2 right-2 p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-550">
                  <Play className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Interactive API sandbox is fully mock operational.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
