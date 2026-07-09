'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  History, RefreshCw, Search, SlidersHorizontal, Trash2, ShieldCheck, 
  Key, Zap, Settings, Award, AlertTriangle, ShieldAlert, CheckCircle2, 
  HelpCircle, Eye, Loader2, Play, ToggleLeft, ToggleRight
} from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { USER_ROLES } from '@/lib/admin/store';
import { UserRole } from '@/lib/admin/types';

export default function DocsPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>(USER_ROLES[0]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  
  // Real-time auto polling states
  const [autoPoll, setAutoPoll] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Fetch logs from backend
  const fetchLogs = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/logs');
      const data = await res.json();
      if (data?.success && data?.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to load logs:", err);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  // Setup dynamic polling
  useEffect(() => {
    fetchLogs();
    
    let interval: NodeJS.Timeout;
    if (autoPoll) {
      interval = setInterval(() => {
        fetchLogs(true);
      }, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoPoll]);

  // Filters logic
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter;
      const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
      
      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [logs, searchQuery, categoryFilter, severityFilter]);

  // Clean local logs buffer
  const clearLogsBuffer = () => {
    setLogs([]);
    fetchLogs();
  };

  // Helper to render Category Icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'AUTHENTICATION':
        return <Key className="w-4 h-4 text-cyan-400" />;
      case 'PRACTICE':
        return <Zap className="w-4 h-4 text-amber-400 fill-current" />;
      case 'SYSTEM':
      case 'CATALOG':
        return <Settings className="w-4 h-4 text-purple-400" />;
      case 'ACHIEVEMENT':
        return <Award className="w-4 h-4 text-emerald-400" />;
      case 'MODERATION':
        return <ShieldAlert className="w-4 h-4 text-orange-400" />;
      case 'OVERRIDE':
        return <Play className="w-4 h-4 text-pink-400" />;
      default:
        return <History className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex h-screen bg-[#070a13] text-slate-100 font-sans overflow-hidden antialiased relative">
      <Sidebar activeId="documentation" userRole={currentRole.role} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header currentRole={currentRole} onRoleChange={handleRoleChange} />

        {currentRole.role !== 'admin' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#070a13]">
            <div className="w-full max-w-xl bg-[#0f1322] border border-[#151c2f] rounded-2xl shadow-xl overflow-hidden p-8 flex flex-col items-center text-center gap-6 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-455 shadow-inner relative">
                <Loader2 className="w-7 h-7 animate-spin" />
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-600 text-[10px] font-black text-white flex items-center justify-center border-2 border-[#0f1322] shadow">!</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-black text-white tracking-tight">Clearance Protocol Violation</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Secured Sandbox v2.4</p>
              </div>
              <div className="w-full bg-[#070a13] border border-[#151c2f] p-4 rounded-xl space-y-3.5 text-xs text-left">
                <div className="flex items-center justify-between border-b border-[#151c2f] pb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Clearance Status</span>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase tracking-wide">DENIED</span>
                </div>
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 font-semibold text-slate-350">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase">Attempted User</span>
                    <span className="text-white font-bold">{currentRole.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase">Clearance Role</span>
                    <span className="text-rose-400 font-bold uppercase tracking-wider text-[11px]">{currentRole.role}</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-[10px] text-slate-500 uppercase">Attempted Access Route</span>
                    <span className="text-slate-350 font-bold font-mono text-[11px]">/admin/logs</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  const admin = USER_ROLES.find(r => r.role === 'admin');
                  if (admin) handleRoleChange(admin);
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-blue-500/10 active:scale-98 transition-all cursor-pointer border-0"
              >
                Request Admin Clearance
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#070a13] custom-scrollbar">
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#151c2f] pb-5">
              <div>
                <span className="text-[10px] font-black text-purple-400 tracking-wider uppercase leading-none">
                  Telemetry logs
                </span>
                <h1 className="text-2xl font-black text-white tracking-tight uppercase font-heading mt-1">
                  Activity Audit Logs
                </h1>
                <p className="text-[11px] font-semibold text-slate-500 mt-1">
                  Live audit trail mapping authentication, practice, system configurations, and security overrides events across the platform.
                </p>
              </div>

              {/* Top controls */}
              <div className="flex items-center gap-3 select-none">
                <button
                  onClick={() => setAutoPoll(prev => !prev)}
                  className="flex items-center gap-2 px-3 py-2 bg-[#0f1322] border border-[#151c2f] hover:border-slate-800 rounded-xl text-[10px] font-bold text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                >
                  {autoPoll ? (
                    <>
                      <ToggleRight className="w-5 h-5 text-purple-400" />
                      <span>Auto-Sync Online</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-5 h-5 text-slate-600" />
                      <span>Auto-Sync Suspended</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => fetchLogs()}
                  className="p-2.5 bg-[#0f1322] border border-[#151c2f] hover:border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-purple-450' : ''}`} />
                </button>
              </div>
            </div>

            {/* Logs filtering widget */}
            <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-4.5 flex flex-col md:flex-row gap-4 items-center justify-between">
              
              <div className="relative w-full md:max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter logs by keyword or user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#070a13] border border-[#151c2f] rounded-xl pl-9.5 pr-4 py-2.5 text-xs text-white placeholder-slate-550 focus:outline-none focus:border-purple-550/50"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3.5 self-stretch md:self-auto justify-between">
                <div className="flex items-center gap-1.5 border border-[#151c2f] bg-[#070a13] rounded-xl px-3 py-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Category</span>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-transparent border-none text-slate-200 text-xs focus:outline-none cursor-pointer py-1.5 font-bold"
                  >
                    <option value="ALL">ALL CATEGORIES</option>
                    <option value="AUTHENTICATION">AUTHENTICATION</option>
                    <option value="PRACTICE">PRACTICE</option>
                    <option value="SYSTEM">SYSTEM / CATALOG</option>
                    <option value="ACHIEVEMENT">ACHIEVEMENT</option>
                    <option value="MODERATION">MODERATION</option>
                    <option value="OVERRIDE">OVERRIDE</option>
                    <option value="SECURITY">SECURITY</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 border border-[#151c2f] bg-[#070a13] rounded-xl px-3 py-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Severity</span>
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="bg-transparent border-none text-slate-200 text-xs focus:outline-none cursor-pointer py-1.5 font-bold"
                  >
                    <option value="ALL">ALL SEVERITY</option>
                    <option value="info">INFO</option>
                    <option value="success">SUCCESS</option>
                    <option value="warning">WARNING</option>
                    <option value="critical">CRITICAL</option>
                  </select>
                </div>

                <button
                  onClick={clearLogsBuffer}
                  className="px-3.5 py-2.5 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Flush buffer</span>
                </button>
              </div>

            </div>

            {/* Logs List Container */}
            <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#151c2f] bg-[#070a13]/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <History className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Chronological Operations Log</span>
                </div>
                <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">
                  Showing {filteredLogs.length} events
                </span>
              </div>

              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-7 h-7 text-purple-500 animate-spin" />
                  <span className="text-[10px] font-black text-slate-550 uppercase tracking-widest">Loading Telemetry Logs...</span>
                </div>
              ) : filteredLogs.length > 0 ? (
                <div className="divide-y divide-[#151c2f]">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-[#070a13]/40 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-9 h-9 rounded-xl bg-[#070a13] border border-[#151c2f] flex items-center justify-center shrink-0 mt-0.5">
                          {getCategoryIcon(log.category)}
                        </div>
                        
                        <div className="space-y-1 text-left">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[9px] font-black text-slate-550 tracking-wider font-mono">
                              [{log.id}]
                            </span>
                            <span className="text-xs font-bold text-white">
                              {log.title}
                            </span>
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                              log.severity === 'critical'
                                ? 'bg-rose-500/10 text-rose-455 border-rose-500/20'
                                : log.severity === 'warning'
                                  ? 'bg-amber-500/10 text-amber-450 border-amber-500/20'
                                  : log.severity === 'success'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                              {log.severity}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-350 font-medium leading-relaxed max-w-2xl">
                            {log.description}
                          </p>

                          <div className="flex items-center gap-3 text-[9px] text-slate-500 font-bold uppercase tracking-wider pt-0.5">
                            <span>User: {log.user}</span>
                            <span>·</span>
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[9.5px] font-bold text-slate-500 uppercase tracking-widest px-3 py-1.5 bg-[#070a13] border border-[#151c2f] rounded-xl self-end md:self-auto select-none">
                        {log.category}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-slate-650 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">No Telemetry Events</h4>
                    <p className="text-[9px] text-slate-600 font-semibold uppercase tracking-widest">
                      Try clearing filters or check back later.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
