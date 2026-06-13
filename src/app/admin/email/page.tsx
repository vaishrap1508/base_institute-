'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Search, 
  RefreshCw, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Database, 
  Inbox, 
  Cpu, 
  ChevronRight,
  Eye
} from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { USER_ROLES } from '@/lib/admin/store';
import { UserRole } from '@/lib/admin/types';

interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  status: 'pending' | 'sent' | 'failed';
  provider: string;
  error_message: string | null;
  attempts: number;
  last_attempt_at: string | null;
  sent_at: string | null;
  created_at: string;
}

export default function EmailManagementPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>(USER_ROLES[0]);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingQueue, setProcessingQueue] = useState(false);
  const [retryingLogId, setRetryingLogId] = useState<string | null>(null);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);

  // Sync role
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

  // Fetch logs
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`/api/admin/email/logs?${params.toString()}`);
      const data = await response.json();
      
      if (response.ok && data.logs) {
        setLogs(data.logs);
      } else {
        console.error('Failed to fetch logs:', data.error);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [statusFilter]);

  // Triggers search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  // Triggers queue process
  const handleProcessQueue = async () => {
    setProcessingQueue(true);
    try {
      const response = await fetch('/api/admin/email/process-queue', {
        method: 'POST'
      });
      const data = await response.json();
      if (response.ok) {
        alert(`Queue processed successfully! Count: ${data.processedCount || 0}`);
        fetchLogs();
      } else {
        alert(`Queue processing failed: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setProcessingQueue(false);
    }
  };

  // Triggers log retry
  const handleRetryLog = async (logId: string) => {
    setRetryingLogId(logId);
    try {
      const response = await fetch('/api/admin/email/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId })
      });
      if (response.ok) {
        fetchLogs();
      } else {
        const data = await response.json();
        alert(`Retry failed: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setRetryingLogId(null);
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('aptitude_current_role', JSON.stringify(role));
  };

  // Metrics calculations
  const totalEmails = logs.length;
  const sentCount = logs.filter(l => l.status === 'sent').length;
  const failedCount = logs.filter(l => l.status === 'failed').length;
  const pendingCount = logs.filter(l => l.status === 'pending').length;

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-[#030712] dark:text-slate-100 font-sans overflow-hidden antialiased transition-colors duration-300">
      <Sidebar activeId="email" userRole={currentRole.role} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header currentRole={currentRole} onRoleChange={handleRoleChange} />

        {currentRole.role !== 'admin' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-[#030712]">
            <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-8 flex flex-col items-center text-center gap-6 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center text-rose-500 dark:text-rose-400 shadow-inner relative">
                <Cpu className="w-7 h-7 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-600 text-[10px] font-black text-white flex items-center justify-center border-2 border-white dark:border-slate-900 shadow">!</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Clearance Protocol Violation</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Secured Sandbox v2.4</p>
              </div>
              <div className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl space-y-3.5 text-xs text-left">
                <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-2">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Clearance Status</span>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/35 text-rose-700 dark:text-rose-400 uppercase tracking-wide">DENIED</span>
                </div>
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 font-semibold">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Attempted User</span>
                    <span className="text-slate-800 dark:text-slate-100 font-bold">{currentRole.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Clearance Role</span>
                    <span className="text-slate-800 dark:text-rose-400 font-bold uppercase tracking-wider text-[11px] text-rose-600">{currentRole.role}</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Attempted Access Route</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold font-mono text-[11px]">/admin/email</span>
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
            
            {/* Title block */}
            <div className="border-b border-slate-200/60 dark:border-slate-900 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Email Registry & Queue Control</h1>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  Inspect delivery logs, audit verification tokens, configure queues, and retry failed transmissions.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={fetchLogs}
                  className="px-4 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer hover:bg-slate-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh Logs</span>
                </button>
                <button
                  onClick={handleProcessQueue}
                  disabled={processingQueue}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-blue-500/10 flex items-center gap-1.5 cursor-pointer"
                >
                  {processingQueue ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                  <span>Process Queue</span>
                </button>
              </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4.5">
                <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">Total Logs Loaded</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">{totalEmails}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">Delivered Emails</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight mt-1">{sentCount}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4.5">
                <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-5 h-5 animate-pulse" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">Failed Deliveries</span>
                  <span className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight mt-1">{failedCount}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4.5">
                <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">Pending Queue</span>
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight mt-1">{pendingCount}</span>
                </div>
              </div>
            </div>

            {/* Filter and Table Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs p-6 space-y-6">
              
              {/* Search form & filters */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search recipient / subject..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-blue-600"
                  />
                  <button type="submit" className="hidden">Submit</button>
                </form>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Status:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-600"
                  >
                    <option value="all">All Logs</option>
                    <option value="sent">Delivered</option>
                    <option value="failed">Failed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              {/* logs table list */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="text-xs font-bold text-slate-400 uppercase">Retrieving log registry...</span>
                </div>
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                  <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No logs found</p>
                    <p className="text-xs text-slate-400">There are no logs matching the current criteria.</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs font-medium">
                    <thead>
                      <tr className="border-b border-slate-200/80 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-extrabold">
                        <th className="pb-3 pl-3">Recipient</th>
                        <th className="pb-3">Subject</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-center">Attempts</th>
                        <th className="pb-3">Timestamp</th>
                        <th className="pb-3 text-right pr-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-300 font-semibold">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all duration-150">
                          <td className="py-4 pl-3 font-bold text-slate-900 dark:text-slate-100 font-mono">
                            {log.recipient}
                          </td>
                          <td className="py-4 max-w-xs truncate">
                            {log.subject}
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide border ${
                              log.status === 'sent' 
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' 
                                : log.status === 'failed'
                                ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/30'
                                : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="py-4 text-center font-mono font-bold">
                            {log.attempts}/3
                          </td>
                          <td className="py-4 text-slate-400">
                            {log.status === 'sent' 
                              ? new Date(log.sent_at || log.created_at).toLocaleString()
                              : new Date(log.last_attempt_at || log.created_at).toLocaleString()
                            }
                          </td>
                          <td className="py-4 text-right pr-3 shrink-0">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedLog(log)}
                                className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer"
                                title="Inspect Error Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {log.status === 'failed' && (
                                <button
                                  onClick={() => handleRetryLog(log.id)}
                                  disabled={retryingLogId === log.id}
                                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-98"
                                >
                                  {retryingLogId === log.id ? (
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <RefreshCw className="w-3 h-3" />
                                  )}
                                  <span>Retry</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Error Detail Inspection Modal */}
            {selectedLog && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 animate-scaleUp text-left">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>Log Details Inspection</span>
                    </h3>
                    <button 
                      onClick={() => setSelectedLog(null)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 hover:bg-slate-100 rounded cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  
                  <div className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-3 gap-y-2.5 border-b border-slate-50 dark:border-slate-950 pb-3 font-semibold">
                      <span className="text-slate-400">LOG ID:</span>
                      <span className="col-span-2 font-mono text-slate-800 dark:text-slate-200 select-all">{selectedLog.id}</span>
                      
                      <span className="text-slate-400">Recipient:</span>
                      <span className="col-span-2 text-slate-800 dark:text-slate-200">{selectedLog.recipient}</span>
                      
                      <span className="text-slate-400">Subject:</span>
                      <span className="col-span-2 text-slate-800 dark:text-slate-200">{selectedLog.subject}</span>
                      
                      <span className="text-slate-400">Status:</span>
                      <span className="col-span-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wide border ${
                          selectedLog.status === 'sent' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 border-emerald-100' 
                            : 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 border-rose-100'
                        }`}>
                          {selectedLog.status}
                        </span>
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Failure/Error Message:</span>
                      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg font-mono text-[11px] text-rose-600 dark:text-rose-400 break-words max-h-40 overflow-y-auto">
                        {selectedLog.error_message || 'None logged. Delivery reported success.'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setSelectedLog(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
}
