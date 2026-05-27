'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Award, Compass, Users, CheckCircle2, ChevronRight, Activity, Percent, ArrowUpRight, Cpu } from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { USER_ROLES } from '@/lib/admin/store';
import { UserRole } from '@/lib/admin/types';

export default function AnalyticsPage() {
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

  const domainMetrics = [
    { name: 'Quantitative Aptitude', code: 'QUANT', completion: '92.4%', accuracy: '78.5%', color: 'from-blue-500 to-indigo-500', barColor: 'bg-blue-600' },
    { name: 'Logical Reasoning', code: 'LOGICAL', completion: '84.8%', accuracy: '68.2%', color: 'from-purple-500 to-pink-500', barColor: 'bg-purple-600' },
    { name: 'Verbal Ability', code: 'VERBAL', completion: '97.2%', accuracy: '84.1%', color: 'from-emerald-500 to-teal-500', barColor: 'bg-emerald-600' }
  ];

  const companyStats = [
    { company: 'Google', attempts: '42,019', accuracy: 58 },
    { company: 'Amazon', attempts: '89,421', accuracy: 64 },
    { company: 'TCS', attempts: '142,398', accuracy: 82 },
    { company: 'Infosys', attempts: '110,502', accuracy: 79 }
  ];

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden antialiased">
      <Sidebar activeId="analytics" userRole={currentRole.role} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header currentRole={currentRole} onRoleChange={handleRoleChange} />

        {currentRole.role !== 'admin' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50">
            <div className="w-full max-w-xl bg-white border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden p-8 flex flex-col items-center text-center gap-6 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-inner relative">
                <Cpu className="w-7 h-7 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-600 text-[10px] font-black text-white flex items-center justify-center border-2 border-white shadow">!</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-black text-slate-800 tracking-tight">Clearance Protocol Violation</h2>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Secured Sandbox v2.4</p>
              </div>
              <div className="w-full bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-3.5 text-xs text-left">
                <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clearance Status</span>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-rose-50 text-rose-700 uppercase tracking-wide">DENIED</span>
                </div>
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 font-semibold">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Attempted User</span>
                    <span className="text-slate-800 font-bold">{currentRole.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Clearance Role</span>
                    <span className="text-slate-800 font-bold uppercase tracking-wider text-[11px] text-rose-600">{currentRole.role}</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Attempted Access Route</span>
                    <span className="text-slate-800 font-bold font-mono text-[11px]">/admin/analytics</span>
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
            <div className="border-b border-slate-200/60 pb-5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Performance Analytics Console</h1>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                Deep-dive diagnostic matrices covering student accuracy distributions, domain completions, and placement ratios.
              </p>
            </div>

            {/* Premium Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Domain Performance breakdown */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2">
                      <Compass className="w-5 h-5 text-blue-600" />
                      <h3 className="text-sm font-bold text-slate-800 tracking-tight">Taxonomy Diagnostics</h3>
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded bg-blue-50 text-blue-700 uppercase tracking-wider">COHORT B</span>
                  </div>

                  <div className="space-y-4">
                    {domainMetrics.map((domain) => (
                      <div key={domain.code} className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-3.5 hover:shadow-xs transition-shadow duration-150">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black text-white px-2 py-0.5 rounded bg-gradient-to-r ${domain.color} tracking-wider`}>
                              {domain.code}
                            </span>
                            <span className="text-xs font-bold text-slate-800">{domain.name}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">COMPLETED</span>
                              <span>{domain.completion}</span>
                            </div>
                            <div className="h-6 w-px bg-slate-200" />
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ACCURACY</span>
                              <span className="text-blue-600">{domain.accuracy}</span>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full ${domain.barColor} rounded-full`} style={{ width: domain.accuracy }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Company tags accuracy distribution */}
              <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs p-6 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                    <Award className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-sm font-bold text-slate-800 tracking-tight">Placement Target Metrics</h3>
                  </div>

                  <div className="space-y-4">
                    {companyStats.map((item) => (
                      <div key={item.company} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span>{item.company} Mock Sets</span>
                          </div>
                          <span className="text-slate-500 font-medium">{item.attempts} attempts</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-150 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${item.accuracy}%` }} />
                          </div>
                          <span className="text-[10px] font-black text-indigo-600 w-8 text-right">{item.accuracy}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-start gap-2.5 mt-4">
                  <TrendingUp className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-indigo-900 leading-normal font-semibold">
                    Average student placement accuracy increased by 4.2% since adding dynamic LaTeX previews in Sandbox v2.4.
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
